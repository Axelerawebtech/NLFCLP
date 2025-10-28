import connectDB from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';

export default async function handler(req, res) {
  try {
    await connectDB();

    const { method } = req;

    switch (method) {
      case 'GET':
        try {
          // Get global program config (configType: 'global', caregiverId: null)
          const config = await ProgramConfig.findOne({ 
            configType: 'global', 
            caregiverId: null 
          });
          
          if (!config) {
            return res.status(404).json({ error: 'Global program config not found' });
          }

          // Return quick assessment questions or empty array if not set
          const questions = config.contentManagement?.quickAssessmentQuestions || [];
          
          res.status(200).json({ 
            success: true, 
            questions: questions
          });
        } catch (error) {
          console.error('Error fetching quick assessment questions:', error);
          res.status(500).json({ error: 'Failed to fetch quick assessment questions' });
        }
        break;

      case 'POST':
        try {
          const { questions } = req.body;

          if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ error: 'Questions array is required' });
          }

          // Validate each question structure
          for (const question of questions) {
            if (!question.id || !question.questionText) {
              return res.status(400).json({ error: 'Each question must have id and questionText' });
            }
            
            if (!question.questionText.english || !question.questionText.kannada || !question.questionText.hindi) {
              return res.status(400).json({ error: 'Each question must have text in all languages (english, kannada, hindi)' });
            }
          }

          // Find existing global config or create new one
          let config = await ProgramConfig.findOne({ 
            configType: 'global', 
            caregiverId: null 
          });
          
          if (!config) {
            // Create new global config if it doesn't exist
            config = new ProgramConfig({
              configType: 'global',
              caregiverId: null,
              contentManagement: {
                quickAssessmentQuestions: questions
              }
            });
          } else {
            // Ensure contentManagement exists
            if (!config.contentManagement) {
              config.contentManagement = {};
            }
            
            // Update existing config
            config.contentManagement.quickAssessmentQuestions = questions;
          }

          await config.save();

          res.status(200).json({ 
            success: true, 
            message: 'Quick assessment questions saved successfully',
            questions: config.contentManagement.quickAssessmentQuestions
          });
        } catch (error) {
          console.error('Error saving quick assessment questions:', error);
          res.status(500).json({ error: 'Failed to save quick assessment questions' });
        }
        break;

      case 'DELETE':
        try {
          const { questionId } = req.body;

          if (!questionId) {
            return res.status(400).json({ error: 'Question ID is required' });
          }

          const config = await ProgramConfig.findOne({ 
            configType: 'global', 
            caregiverId: null 
          });
          
          if (!config || !config.contentManagement?.quickAssessmentQuestions) {
            return res.status(404).json({ error: 'Quick assessment questions not found' });
          }

          // Remove question from array
          config.contentManagement.quickAssessmentQuestions = 
            config.contentManagement.quickAssessmentQuestions.filter(q => q.id !== questionId);

          await config.save();

          res.status(200).json({ 
            success: true, 
            message: 'Question deleted successfully',
            questions: config.contentManagement.quickAssessmentQuestions
          });
        } catch (error) {
          console.error('Error deleting quick assessment question:', error);
          res.status(500).json({ error: 'Failed to delete question' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}