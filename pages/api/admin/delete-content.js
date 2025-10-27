import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { day, language, contentType, contentUrl } = req.body;

    console.log('🗑️ Delete content request:', { day, language, contentType, contentUrl: contentUrl?.substring(0, 50) + '...' });

    if (day === undefined || !language || !contentType) {
      return res.status(400).json({ error: 'Day, language, and contentType are required' });
    }

    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 0 || dayNum > 7) {
      return res.status(400).json({ error: 'Day must be between 0 and 7' });
    }

    // Find the global program configuration
    let config = await ProgramConfig.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    if (!config) {
      return res.status(404).json({ error: 'Program configuration not found' });
    }

    let contentDeleted = false;
    let cloudinaryPublicId = null;

    // Extract Cloudinary public ID from URL if provided
    if (contentUrl) {
      try {
        const urlParts = contentUrl.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const fileName = fileWithExt.split('.')[0];
        
        // Determine the folder based on content type
        let folder = 'caregiver-program-content';
        if (contentType === 'audioContent') {
          folder = 'caregiver-program-audio';
        }
        
        cloudinaryPublicId = `${folder}/${fileName}`;
        console.log('🔍 Extracted Cloudinary public ID:', cloudinaryPublicId);
      } catch (error) {
        console.log('Could not extract public ID from URL:', error.message);
      }
    }

    // Check if the content exists and delete from database
    // Handle both string and number keys for day
    const dayKey = dayNum.toString(); // Convert to string for consistency
    
    console.log(`🔍 Looking for content at: contentManagement.${contentType}.${dayKey}.${language}`);
    
    if (contentType === 'audioContent') {
      // Handle audioContent as Map type
      if (config.contentManagement && 
          config.contentManagement.audioContent && 
          config.contentManagement.audioContent instanceof Map &&
          config.contentManagement.audioContent.has(dayKey)) {
          
        const dayContent = config.contentManagement.audioContent.get(dayKey);
        if (dayContent && dayContent[language]) {
          // Clear the content URL from the Map
          dayContent[language] = '';
          config.contentManagement.audioContent.set(dayKey, dayContent);
          contentDeleted = true;
          console.log(`📊 Audio content cleared from Map for Day ${dayNum}, ${language}`);
        }
      } else {
        console.log(`❌ Audio content Map not found or no content for Day ${dayKey}`);
      }
    } else {
      // Handle other content types as regular objects
      if (config.contentManagement && 
          config.contentManagement[contentType] && 
          config.contentManagement[contentType][dayKey] && 
          config.contentManagement[contentType][dayKey][language]) {
          
        // Clear the content URL from database
        config.contentManagement[contentType][dayKey][language] = '';
        contentDeleted = true;
        
        console.log(`📊 Content cleared from database for Day ${dayNum}, ${language}, ${contentType}`);
      } else {
        console.log(`❌ Content not found at: contentManagement.${contentType}.${dayKey}.${language}`);
        console.log(`📊 Available structure:`, JSON.stringify({
          contentType: Object.keys(config.contentManagement || {}),
          dayKeys: config.contentManagement?.[contentType] ? Object.keys(config.contentManagement[contentType]) : [],
          languageKeys: config.contentManagement?.[contentType]?.[dayKey] ? Object.keys(config.contentManagement[contentType][dayKey]) : []
        }, null, 2));
      }
    }

    if (!contentDeleted) {
      return res.status(404).json({ error: 'Content not found for deletion' });
    }

    // Delete from Cloudinary if public ID is available
    let cloudinaryDeleted = false;
    if (cloudinaryPublicId) {
      try {
        console.log('🗑️ Deleting from Cloudinary:', cloudinaryPublicId);
        
        // Determine resource type for deletion
        let resourceType = 'auto';
        if (contentType === 'audioContent') {
          resourceType = 'video'; // Cloudinary treats audio as video resource type
        }
        
        const result = await cloudinary.uploader.destroy(cloudinaryPublicId, {
          resource_type: resourceType
        });
        
        console.log('✅ Cloudinary deletion result:', result);
        cloudinaryDeleted = result.result === 'ok';
      } catch (cloudinaryError) {
        console.error('⚠️ Failed to delete from Cloudinary:', cloudinaryError.message);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Save the updated configuration
    config.updatedAt = new Date();
    await config.save();

    console.log(`✅ Content deleted successfully for Day ${dayNum}, Language: ${language}, Type: ${contentType}`);

    return res.status(200).json({
      success: true,
      message: `${contentType} deleted successfully`,
      deletedFrom: {
        day: dayNum,
        language,
        contentType,
        cloudinaryDeleted,
        cloudinaryPublicId
      }
    });

  } catch (error) {
    console.error('❌ Error deleting content:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}