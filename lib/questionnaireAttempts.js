export function hasValidAnswers(answers = []) {
  return Array.isArray(answers) && answers.length > 0 && answers.every((answer) => (
    answer &&
    (answer.questionId || answer.questionText) &&
    Object.prototype.hasOwnProperty.call(answer, 'answer')
  ));
}

export async function ensureAttemptHistory(patient) {
  if (!patient) return patient;

  const hasAttempts = Array.isArray(patient.questionnaireAttempts) && patient.questionnaireAttempts.length > 0;
  const hasAnswers = hasValidAnswers(patient.questionnaireAnswers);

  if (!hasAttempts && hasAnswers) {
    patient.questionnaireAttempts = [{
      attemptNumber: 1,
      submittedAt: patient.lastQuestionnaireSubmission || patient.updatedAt || new Date(),
      answers: patient.questionnaireAnswers,
    }];
    await patient.save();
  }

  return patient;
}

export function appendAttempt(patient, answers, submittedAt = new Date()) {
  if (!patient) return 0;

  if (!Array.isArray(patient.questionnaireAttempts)) {
    patient.questionnaireAttempts = [];
  }

  const attemptNumber = patient.questionnaireAttempts.length + 1;
  patient.questionnaireAttempts.push({
    attemptNumber,
    submittedAt,
    answers,
  });

  return attemptNumber;
}
