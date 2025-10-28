import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { day, language = 'english' } = req.query;

  if (!day) {
    return res.status(400).json({ error: 'Day parameter is required' });
  }

  try {
    await dbConnect();

    // Fetch the program configuration
    const config = await ProgramConfig.findOne({});

    if (!config || !config.contentManagement) {
      // Return fallback data instead of error
      const fallbackAssessment = {
        day: parseInt(day),
        type: 'quick_assessment',
        title: `Day ${day} - Quick Assessment`,
        description: 'Please answer these questions to help us personalize your content.',
        questions: [
          {
            id: 'fallback_1',
            text: 'How are you feeling today?',
            type: 'yesno',
            options: [
              { value: 1, label: 'Good' },
              { value: 0, label: 'Not so good' }
            ]
          },
          {
            id: 'fallback_2',
            text: 'Do you feel prepared for today\'s caregiving tasks?',
            type: 'yesno',
            options: [
              { value: 1, label: 'Yes' },
              { value: 0, label: 'No' }
            ]
          }
        ],
        maxScore: 2
      };
      
      return res.status(200).json({
        success: true,
        assessment: fallbackAssessment,
        totalQuestions: 2,
        source: 'fallback'
      });
    }

    // Get quick assessment questions
    const questions = config.contentManagement.quickAssessmentQuestions || [];

    // Filter questions by day if needed, or return all for now
    const dayQuestions = questions.filter(q => {
      return !q.day || q.day === parseInt(day);
    });

    // If no questions found, provide default questions for testing
    const questionsToUse = dayQuestions.length > 0 ? dayQuestions : [
      {
        id: 'default_1',
        question: 'How are you feeling today?',
        type: 'yesno'
      },
      {
        id: 'default_2', 
        question: 'Do you feel prepared for caregiving tasks?',
        type: 'yesno'
      }
    ];
    
    // Format questions for the caregiver dashboard
    const formattedQuestions = questionsToUse.map((q, index) => {
      
      // Handle multi-language text
      let questionText = '';
      if (q.questionText) {
        if (typeof q.questionText === 'object') {
          questionText = q.questionText[language] || q.questionText['english'] || q.questionText[Object.keys(q.questionText)[0]];
        } else {
          questionText = q.questionText;
        }
      } else if (q.question) {
        if (typeof q.question === 'object') {
          questionText = q.question[language] || q.question['english'] || q.question[Object.keys(q.question)[0]];
        } else {
          questionText = q.question;
        }
      } else if (q.text) {
        if (typeof q.text === 'object') {
          questionText = q.text[language] || q.text['english'] || q.text[Object.keys(q.text)[0]];
        } else {
          questionText = q.text;
        }
      } else {
        questionText = 'Sample question text';
      }
      
      return {
        id: q.id || `q_${index}`,
        text: questionText,
        type: q.type || 'yesno',
        options: q.type === 'scale' ? q.options : [
          { value: 1, label: 'Yes' },
          { value: 0, label: 'No' }
        ]
      };
    });
    
    // Return assessment configuration  
    const assessmentConfig = {
      day: parseInt(day),
      type: 'quick_assessment',
      title: `Day ${day} - Quick Assessment`,
      description: 'Please answer these questions to help us personalize your content.',
      questions: formattedQuestions,
      maxScore: formattedQuestions.length
    };
    
    res.status(200).json({
      success: true,
      assessment: assessmentConfig,
      totalQuestions: formattedQuestions.length
    });

  } catch (error) {
    
    // Return fallback data instead of error
    const fallbackAssessment = {
      day: parseInt(day),
      type: 'quick_assessment',
      title: `Day ${day} - Quick Assessment`,
      description: 'Please answer these questions to help us personalize your content.',
      questions: [
        {
          id: 'error_fallback_1',
          text: 'How are you feeling today?',
          type: 'yesno',
          options: [
            { value: 1, label: 'Good' },
            { value: 0, label: 'Not so good' }
          ]
        },
        {
          id: 'error_fallback_2',
          text: 'Do you feel prepared for today\'s caregiving tasks?',
          type: 'yesno',
          options: [
            { value: 1, label: 'Yes' },
            { value: 0, label: 'No' }
          ]
        }
      ],
      maxScore: 2
    };
    
    res.status(200).json({ 
      success: true,
      assessment: fallbackAssessment,
      totalQuestions: 2,
      source: 'error_fallback',
      originalError: error.message
    });
  }
}