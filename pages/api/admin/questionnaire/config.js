import dbConnect from '../../../../lib/mongodb';
import Questionnaire from '../../../../models/Questionnaire';
import Admin from '../../../../models/Admin';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const questionnaire = await Questionnaire.findOne({ isActive: true })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
      
      res.status(200).json({ 
        success: true, 
        data: questionnaire 
      });
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch questionnaire' 
      });
    }
  }

  else if (req.method === 'POST') {
    try {
      const { title, description, questions, adminId } = req.body;

      // Validate admin exists
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Deactivate existing questionnaires
      await Questionnaire.updateMany({}, { isActive: false });

      // Create new questionnaire
      const questionnaire = new Questionnaire({
        title,
        description,
        questions: questions.map((q, index) => ({
          ...q,
          order: index
        })),
        isActive: true,
        createdBy: adminId
      });

      await questionnaire.save();

      res.status(201).json({
        success: true,
        message: 'Questionnaire created successfully',
        data: questionnaire
      });
    } catch (error) {
      console.error('Error creating questionnaire:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create questionnaire'
      });
    }
  }

  else if (req.method === 'PUT') {
    try {
      const { questionnaireId, title, description, questions } = req.body;

      const questionnaire = await Questionnaire.findById(questionnaireId);
      if (!questionnaire) {
        return res.status(404).json({
          success: false,
          message: 'Questionnaire not found'
        });
      }

      questionnaire.title = title;
      questionnaire.description = description;
      questionnaire.questions = questions.map((q, index) => ({
        ...q,
        order: index
      }));

      await questionnaire.save();

      res.status(200).json({
        success: true,
        message: 'Questionnaire updated successfully',
        data: questionnaire
      });
    } catch (error) {
      console.error('Error updating questionnaire:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update questionnaire'
      });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}