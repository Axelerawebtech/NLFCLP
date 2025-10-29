import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';

/**
 * API: /api/caregiver/burden-content
 * 
 * GET - Retrieve burden-specific content for caregiver
 * 
 * Purpose: Deliver personalized content based on assessment results
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { caregiverId, day, contentType, language = 'english' } = req.query;

    if (!caregiverId) {
      return res.status(400).json({ error: 'Caregiver ID is required' });
    }

    // Get caregiver's program data to determine burden level
    const caregiverProgram = await CaregiverProgram.findOne({ caregiverId });
    
    if (!caregiverProgram) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    // Determine burden level from Zarit assessment
    let burdenLevel = 'mild'; // default
    const zaritAssessment = caregiverProgram.oneTimeAssessments.find(a => a.type === 'zarit_burden');
    
    if (zaritAssessment && zaritAssessment.scoreLevel) {
      // Map scoreLevel to burdenLevel
      switch (zaritAssessment.scoreLevel) {
        case 'low':
          burdenLevel = 'mild';
          break;
        case 'moderate':
          burdenLevel = 'moderate';
          break;
        case 'high':
          burdenLevel = 'severe';
          break;
        default:
          burdenLevel = 'mild';
      }
    } else if (caregiverProgram.burdenLevel) {
      // Fallback to legacy burdenLevel
      burdenLevel = caregiverProgram.burdenLevel;
    }

    // Get global configuration
    const config = await ProgramConfig.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    if (!config) {
      return res.status(404).json({ error: 'Program configuration not found' });
    }

    let contentResponse = {
      burdenLevel,
      day: parseInt(day) || 0,
      contentType: contentType || 'all',
      language
    };

    if (contentType) {
      // Get specific content type
      const content = getBurdenSpecificContent(config, burdenLevel, contentType, language);
      contentResponse.content = content;
    } else {
      // Get all content for the burden level
      contentResponse.content = {
        motivation: getBurdenSpecificContent(config, burdenLevel, 'motivation', language),
        healthcareTips: getBurdenSpecificContent(config, burdenLevel, 'healthcareTips', language),
        reminders: getBurdenSpecificContent(config, burdenLevel, 'reminders', language),
        dailyTasks: getBurdenSpecificDailyTasks(config, burdenLevel),
        quickAssessments: getQuickAssessmentQuestions(config, language),
        flow: getBurdenSpecificFlow(burdenLevel)
      };
    }

    // Add flow-specific instructions
    contentResponse.flowInstructions = generateFlowInstructions(burdenLevel, language);
    
    res.status(200).json({
      success: true,
      ...contentResponse
    });

  } catch (error) {
    console.error('Error fetching burden-specific content:', error);
    res.status(500).json({ 
      error: 'Failed to fetch content',
      details: error.message 
    });
  }
}

function getBurdenSpecificContent(config, burdenLevel, contentType, language) {
  if (!config.contentManagement || !config.contentManagement[contentType]) {
    return '';
  }

  const burdenContent = config.contentManagement[contentType][burdenLevel];
  return burdenContent?.[language] || '';
}

function getBurdenSpecificDailyTasks(config, burdenLevel) {
  if (!config.contentManagement || !config.contentManagement.dailyTaskTemplates) {
    return [];
  }

  return config.contentManagement.dailyTaskTemplates[burdenLevel] || [];
}

function getQuickAssessmentQuestions(config, language) {
  if (!config.contentManagement || !config.contentManagement.quickAssessmentQuestions) {
    return [];
  }

  return config.contentManagement.quickAssessmentQuestions
    .filter(q => q.enabled)
    .map(q => ({
      id: q.id,
      questionText: q.questionText[language] || q.questionText.english,
      type: 'yes_no'
    }));
}

function getBurdenSpecificFlow(burdenLevel) {
  const flows = {
    mild: {
      type: 'motivation_and_assessment',
      description: 'Focus on motivation and simple daily check-ins',
      components: ['motivational_message', 'daily_quick_assessment', 'reminder'],
      frequency: 'daily',
      supportLevel: 'minimal'
    },
    moderate: {
      type: 'problem_solving',
      description: 'Interactive problem-solving approach with guided reflection',
      components: ['video', 'problem_solving_popup', 'weekly_check_in'],
      frequency: 'every_3_days',
      supportLevel: 'moderate'
    },
    severe: {
      type: 'intensive_support',
      description: 'Comprehensive support with reflection and monitoring',
      components: ['video', 'reflection_box', 'daily_monitoring', 'admin_notification'],
      frequency: 'daily',
      supportLevel: 'high',
      adminNotification: true
    }
  };

  return flows[burdenLevel] || flows.mild;
}

function generateFlowInstructions(burdenLevel, language) {
  const instructions = {
    mild: {
      english: {
        title: "Your care matters — a small break keeps you stronger.",
        dailyTasks: [
          "Take one 2-minute break today",
          "Practice deep breathing",
          "Check in with yourself"
        ],
        reminder: "Take 2 minutes for yourself today — relax and breathe.",
        assessmentQuestions: [
          "Did you take one 2-minute break today?",
          "Did you practice deep breathing today?"
        ]
      },
      kannada: {
        title: "ನಿಮ್ಮ ಆರೈಕೆ ಮುಖ್ಯ - ಸಣ್ಣ ವಿರಾಮವು ನಿಮ್ಮನ್ನು ಬಲಗೊಳಿಸುತ್ತದೆ.",
        dailyTasks: [
          "ಇಂದು ಒಂದು 2-ನಿಮಿಷದ ವಿರಾಮವನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ",
          "ಆಳವಾದ ಉಸಿರಾಟವನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ",
          "ನಿಮ್ಮ ಬಗ್ಗೆ ಪರಿಶೀಲಿಸಿ"
        ]
      },
      hindi: {
        title: "आपकी देखभाल महत्वपूर्ण है — छोटा ब्रेक आपको मजबूत रखता है।",
        dailyTasks: [
          "आज 2 मिनट का ब्रेक लें",
          "गहरी सांस लेने का अभ्यास करें",
          "अपने बारे में जांच करें"
        ]
      }
    },
    moderate: {
      english: {
        title: "Problem-solving approach",
        interactivePrompt: "Now try it! Write your biggest problem and one solution below.",
        weeklyCheck: "Have you practiced your problem-solving step this week?",
        supportMessage: "You're doing great! Small steps make a big difference."
      }
    },
    severe: {
      english: {
        title: "Comprehensive support and reflection",
        reflectionPrompts: [
          "What problem feels hardest right now?",
          "What solution will you try?"
        ],
        dailyMonitoring: [
          "Did you practice your problem-solving step today?",
          "Did you take one 2-minute break today?"
        ],
        adminAlert: "Trigger admin notification if 'No' responses for 3 consecutive days"
      }
    }
  };

  return instructions[burdenLevel]?.[language] || instructions[burdenLevel]?.english || {};
}