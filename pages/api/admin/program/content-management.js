import dbConnect from '../../../../lib/mongodb';
import ProgramConfig from '../../../../models/ProgramConfig';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    if (req.method === 'POST') {
      // Handle saving/updating content
      const { day, contentType, language, url } = req.body;

      if (!day || !contentType || !language || !url) {
        return res.status(400).json({ 
          error: 'Missing required fields: day, contentType, language, url' 
        });
      }

      console.log(`💾 Saving content: Day ${day}, Type: ${contentType}, Language: ${language}`);

      // Find or create the global program configuration
      let config = await ProgramConfig.findOne({ 
        configType: 'global', 
        caregiverId: null 
      });

      if (!config) {
        config = new ProgramConfig({
          configType: 'global',
          caregiverId: null
        });
      }

      // Initialize content structure if needed
      if (!config.contentManagement) {
        config.contentManagement = {};
      }

      if (!config.contentManagement[contentType]) {
        config.contentManagement[contentType] = {};
      }

      if (!config.contentManagement[contentType][day]) {
        config.contentManagement[contentType][day] = {};
      }

      // Save the content URL
      config.contentManagement[contentType][day][language] = url;
      config.updatedAt = new Date();

      await config.save();
      console.log(`✅ Content saved successfully for Day ${day}, ${language}, ${contentType}`);

      return res.status(200).json({
        success: true,
        message: `Content saved successfully for Day ${day}`,
        data: {
          day: parseInt(day),
          contentType,
          language,
          url
        }
      });
    }

    // Handle GET requests (existing functionality)
    const { day, contentType } = req.query;

    if (!day || !contentType) {
      return res.status(400).json({ error: 'Day and contentType parameters are required' });
    }

    console.log(`🔍 Loading content for Day ${day}, Type: ${contentType}`);

    // Find the global program configuration
    const config = await ProgramConfig.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    if (!config) {
      console.log('❌ No program configuration found');
      return res.status(404).json({ 
        error: 'Program configuration not found',
        content: null 
      });
    }

    // Extract the specific content for the requested day and type
    let content = null;
    
    if (config.contentManagement && 
        config.contentManagement[contentType] && 
        config.contentManagement[contentType][day]) {
      
      content = config.contentManagement[contentType][day];
      console.log(`✅ Content found for Day ${day}, Type: ${contentType}`);
    } else {
      console.log(`⚠️ No content found for Day ${day}, Type: ${contentType}`);
      // Return empty content structure for different languages
      content = {
        english: '',
        kannada: '',
        hindi: ''
      };
    }

    return res.status(200).json({
      success: true,
      content,
      metadata: {
        day: parseInt(day),
        contentType,
        hasContent: !!content && Object.values(content).some(url => !!url)
      }
    });

  } catch (error) {
    console.error('❌ Error loading content:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}