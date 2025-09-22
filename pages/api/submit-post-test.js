import dbConnect from '../../lib/mongodb';
import Patient from '../../models/Patient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { patientId, score, answers, completedAt } = req.body;

    if (!patientId || score === undefined) {
      return res.status(400).json({ message: 'Patient ID and score are required' });
    }

    // Update patient with test results
    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.postTestCompleted = true;
    patient.postTestScore = score;
    patient.postTestDate = new Date(completedAt);

    // Store detailed answers for analysis
    patient.postTestAnswers = answers;

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Post-test results submitted successfully',
      score,
      evaluation: getScoreEvaluation(score)
    });

  } catch (error) {
    console.error('Submit post-test error:', error);
    res.status(500).json({
      message: 'Failed to submit test results',
      error: error.message
    });
  }
}

function getScoreEvaluation(score) {
  if (score >= 80) {
    return {
      level: 'Excellent',
      message: 'Outstanding knowledge transfer from caregiver to patient',
      caregiverFeedback: 'Excellent job! Your teaching methods were highly effective.'
    };
  } else if (score >= 60) {
    return {
      level: 'Good',
      message: 'Good understanding with room for improvement',
      caregiverFeedback: 'Good work! Consider reviewing key concepts for better outcomes.'
    };
  } else {
    return {
      level: 'Needs Improvement',
      message: 'Additional learning sessions recommended',
      caregiverFeedback: 'More practice needed. Focus on core emotional support concepts.'
    };
  }
}
