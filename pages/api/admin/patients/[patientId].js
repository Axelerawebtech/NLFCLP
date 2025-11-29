import dbConnect from '../../../../lib/mongodb';
import Patient from '../../../../models/Patient';
import Questionnaire from '../../../../models/Questionnaire';
import mongoose from 'mongoose';
import { ensureAttemptHistory } from '../../../../lib/questionnaireAttempts';

const toKey = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && typeof value.toString === 'function') {
    return value.toString();
  }
  return String(value);
};

const buildTranslationMap = (question) => {
  if (!question) return new Map();
  const options = question.options || [];
  const map = new Map();
  options.forEach(optionText => {
    if (typeof optionText === 'string' && optionText.length > 0) {
      map.set(optionText, optionText);
    }
  });
  Object.values(question.optionTranslations || {}).forEach(optionList => {
    if (!Array.isArray(optionList)) return;
    optionList.forEach((label, idx) => {
      const canonical = options[idx];
      if (label && canonical) {
        map.set(label, canonical);
      }
    });
  });
  return map;
};

const normalizeAnswerValue = (value, question) => {
  if (!question) return value;
  const translationMap = buildTranslationMap(question);
  if (translationMap.size === 0) return value;

  const convert = (input) => translationMap.get(input) || input;

  if (Array.isArray(value)) {
    let changed = false;
    const mapped = value.map(item => {
      const converted = convert(item);
      if (converted !== item) changed = true;
      return converted;
    });
    return changed ? mapped : value;
  }

  return convert(value);
};

const canonicalizeAnswers = (answers, questionLookup) => {
  if (!Array.isArray(answers) || !questionLookup) return answers;
  return answers.map(answer => {
    const key = toKey(answer.questionId);
    const questionMeta = key ? questionLookup[key] : null;
    if (!questionMeta) {
      return answer;
    }
    const normalizedAnswer = normalizeAnswerValue(answer.answer, questionMeta);
    const englishQuestionText = questionMeta.questionText || answer.questionText;
    return {
      ...answer,
      answer: normalizedAnswer,
      questionText: englishQuestionText,
    };
  });
};

const createQuestionLookup = (questionnaire) => {
  if (!questionnaire || !Array.isArray(questionnaire.questions)) return {};
  return questionnaire.questions.reduce((acc, questionDoc) => {
    const qObj = typeof questionDoc.toObject === 'function' ? questionDoc.toObject() : questionDoc;
    const key = toKey(qObj?._id);
    if (key) {
      acc[key] = {
        questionText: qObj.questionText,
        options: qObj.options || [],
        optionTranslations: qObj.optionTranslations || {}
      };
    }
    return acc;
  }, {});
};

export default async function handler(req, res) {
  await dbConnect();
  
  const { patientId } = req.query;

  if (req.method === 'GET') {
    try {
      // Try to find patient by MongoDB _id first, then by custom patientId
      let patient = null;
      
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        patient = await Patient.findById(patientId)
          .populate('assignedCaregiver', 'name email');
      }
      
      if (!patient) {
        patient = await Patient.findOne({ patientId })
          .populate('assignedCaregiver', 'name email');
      }
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      await ensureAttemptHistory(patient);

      // Get current active questionnaire
      const questionnaireDoc = await Questionnaire.findOne({ isActive: true });
      const questionnaireObject = questionnaireDoc ? questionnaireDoc.toObject() : null;
      const questionLookup = createQuestionLookup(questionnaireObject);

      const patientObj = patient.toObject();
      patientObj.questionnaireAnswers = canonicalizeAnswers(patientObj.questionnaireAnswers, questionLookup);
      patientObj.questionnaireAttempts = Array.isArray(patientObj.questionnaireAttempts)
        ? patientObj.questionnaireAttempts.map(attempt => ({
            ...attempt,
            answers: canonicalizeAnswers(attempt.answers, questionLookup)
          }))
        : patientObj.questionnaireAttempts;
      
      res.status(200).json({ 
        success: true, 
        data: {
          patient: patientObj,
          questionnaire: questionnaireObject
        }
      });
    } catch (error) {
      console.error('Error fetching patient:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch patient' 
      });
    }
  }

  else if (req.method === 'PUT') {
    try {
      const { questionnaireEnabled, action, scheduleAt } = req.body;

      let patient = null;
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        patient = await Patient.findById(patientId);
      }
      if (!patient) {
        patient = await Patient.findOne({ patientId });
      }

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      if (action === 'scheduleRetake') {
        await ensureAttemptHistory(patient);

        if (!Array.isArray(patient.questionnaireAttempts) || patient.questionnaireAttempts.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Patient must complete the questionnaire once before scheduling a retake'
          });
        }

        if (patient.questionnaireAttempts.length >= 2) {
          return res.status(400).json({
            success: false,
            message: 'Patient already completed the second assessment'
          });
        }

        if (!scheduleAt) {
          return res.status(400).json({
            success: false,
            message: 'Schedule date/time is required'
          });
        }

        const scheduledDate = new Date(scheduleAt);
        if (Number.isNaN(scheduledDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid schedule date'
          });
        }

        if (scheduledDate <= new Date()) {
          return res.status(400).json({
            success: false,
            message: 'Schedule date must be in the future'
          });
        }

        patient.questionnaireRetakeStatus = 'scheduled';
        patient.questionnaireRetakeScheduledFor = scheduledDate;
        patient.questionnaireEnabled = false;

        await patient.save();

        return res.status(200).json({
          success: true,
          message: 'Second assessment scheduled successfully',
          data: patient
        });
      }

      if (action === 'cancelRetake') {
        patient.questionnaireRetakeStatus = 'none';
        patient.questionnaireRetakeScheduledFor = null;
        patient.questionnaireEnabled = false;
        await patient.save();

        return res.status(200).json({
          success: true,
          message: 'Scheduled retake has been cancelled',
          data: patient
        });
      }

      if (typeof questionnaireEnabled === 'boolean') {
        patient.questionnaireEnabled = questionnaireEnabled;

        if (!questionnaireEnabled && patient.questionnaireRetakeStatus === 'open') {
          patient.questionnaireRetakeStatus = 'scheduled';
        }

        await patient.save();

        return res.status(200).json({
          success: true,
          message: `Questionnaire ${questionnaireEnabled ? 'enabled' : 'disabled'} for patient`,
          data: patient
        });
      }

      return res.status(400).json({
        success: false,
        message: 'No valid updates provided'
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update patient'
      });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}