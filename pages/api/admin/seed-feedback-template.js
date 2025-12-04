import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';

/**
 * API: /api/admin/seed-feedback-template
 * Method: POST
 * 
 * Purpose: Seed default feedback form template based on pilot study requirements
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const programConfig = await ProgramConfig.findOne();
    if (!programConfig) {
      return res.status(404).json({ error: 'Program configuration not found' });
    }

    // Default feedback form template based on pilot-study-feedback.txt
    const defaultFeedbackTemplate = {
      templateName: 'Pilot Study Feedback Form',
      feedbackFields: [
        // 1. Ease of Use
        {
          label: 'The app was easy to use',
          fieldType: 'rating',
          options: ['Very Easy', 'Easy', 'Neutral', 'Difficult', 'Very Difficult'],
          category: 'Ease of Use'
        },
        {
          label: 'I could understand how to navigate',
          fieldType: 'yes-no',
          options: ['Yes', 'Somewhat', 'No'],
          category: 'Ease of Use'
        },
        // 2. Learning Modules
        {
          label: 'Content was easy to understand',
          fieldType: 'yes-no',
          options: ['Yes', 'Somewhat', 'No'],
          category: 'Learning Modules'
        },
        {
          label: 'The modules were useful',
          fieldType: 'yes-no',
          options: ['Yes', 'Somewhat', 'No'],
          category: 'Learning Modules'
        },
        // 3. Assessments
        {
          label: 'Questions were clear',
          fieldType: 'yes-no',
          options: ['Yes', 'Somewhat', 'No'],
          category: 'Assessments'
        },
        {
          label: 'Completing assessment was easy',
          fieldType: 'yes-no',
          options: ['Yes', 'Somewhat', 'No'],
          category: 'Assessments'
        },
        // 4. Reminders / Progress
        {
          label: 'Reminder feature was helpful',
          fieldType: 'yes-no',
          options: ['Yes', 'Somewhat', 'No'],
          category: 'Reminders / Progress'
        },
        {
          label: 'I liked seeing my progress',
          fieldType: 'yes-no',
          options: ['Yes', 'Somewhat', 'No'],
          category: 'Reminders / Progress'
        },
        // 5. Overall Comfort
        {
          label: 'I felt comfortable using the app',
          fieldType: 'yes-no',
          options: ['Yes', 'Somewhat', 'No'],
          category: 'Overall Comfort'
        },
        {
          label: 'I would like to use this app in future',
          fieldType: 'yes-no',
          options: ['Yes', 'Maybe', 'No'],
          category: 'Overall Comfort'
        },
        // 6. Suggestions / Problems
        {
          label: 'What did you like?',
          fieldType: 'textarea',
          options: [],
          category: 'Suggestions / Problems'
        },
        {
          label: 'What was difficult or confusing?',
          fieldType: 'textarea',
          options: [],
          category: 'Suggestions / Problems'
        },
        {
          label: 'What improvements do you suggest?',
          fieldType: 'textarea',
          options: [],
          category: 'Suggestions / Problems'
        }
      ]
    };

    // Store in programConfig
    programConfig.feedbackFormTemplate = defaultFeedbackTemplate;
    await programConfig.save();

    return res.status(200).json({
      success: true,
      message: 'Feedback template seeded successfully',
      template: defaultFeedbackTemplate
    });

  } catch (error) {
    console.error('Error seeding feedback template:', error);
    return res.status(500).json({ 
      error: 'Failed to seed feedback template',
      details: error.message 
    });
  }
}
