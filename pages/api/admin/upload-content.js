import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import os from 'os';
import path from 'path';
import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFilePath;
  
  try {
    await dbConnect();

    // Configure formidable to use Windows-compatible temp directory
    const tempDir = os.tmpdir();
    console.log('🗂️ Using temp directory:', tempDir);

    const form = formidable({
      uploadDir: tempDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB limit for audio
      filename: (name, ext, part) => {
        const uniqueName = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);
        return `${uniqueName}${ext}`;
      }
    });

    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const language = Array.isArray(fields.language) ? fields.language[0] : fields.language;
    const contentType = Array.isArray(fields.contentType) ? fields.contentType[0] : fields.contentType;
    const day = Array.isArray(fields.day) ? fields.day[0] : fields.day;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!language || !contentType || day === undefined) {
      return res.status(400).json({ error: 'Missing required fields: language, contentType, or day' });
    }

    tempFilePath = file.filepath;
    console.log('📁 Temp file path:', tempFilePath);

    // Determine resource type and folder based on content type
    let resourceType = 'auto';
    let folder = 'caregiver-program-content';
    
    if (contentType === 'audioContent') {
      resourceType = 'video'; // Cloudinary treats audio as video resource type
      folder = 'caregiver-program-audio';
    }

    // Get file size for logging
    const stats = fs.statSync(tempFilePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`📁 File size: ${fileSizeInMB.toFixed(2)} MB`);

    // Upload to Cloudinary
    const uploadOptions = {
      resource_type: resourceType,
      folder: folder,
      public_id: `${Date.now()}_${day}_${language}_${contentType}`,
      timeout: 120000, // 2 minutes timeout for audio files
    };

    console.log('📤 Starting upload to Cloudinary...');
    console.log('🔧 Upload options:', JSON.stringify(uploadOptions, null, 2));

    const uploadResult = await cloudinary.uploader.upload(tempFilePath, uploadOptions);

    console.log('✅ Content uploaded successfully');
    console.log('📊 Upload result:', JSON.stringify(uploadResult, null, 2));

    // Validate the upload result
    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error('Upload completed but no secure URL returned from Cloudinary');
    }

    // Update ProgramConfig with the new content URL
    try {
      await dbConnect();
      
      // Find or create the global config
      let config = await ProgramConfig.findOne({ 
        configType: 'global', 
        caregiverId: null 
      });

      if (!config) {
        // Create new config if none exists
        config = new ProgramConfig({
          configType: 'global',
          caregiverId: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Initialize contentManagement if needed
      if (!config.contentManagement) {
        config.contentManagement = {};
      }

      // For audioContent (Map type), handle it properly
      if (contentType === 'audioContent') {
        if (!config.contentManagement.audioContent) {
          config.contentManagement.audioContent = new Map();
        }
        
        // Set the day map if it doesn't exist
        if (!config.contentManagement.audioContent.get(day)) {
          config.contentManagement.audioContent.set(day, {
            english: '',
            kannada: '',
            hindi: ''
          });
        }
        
        // Update the specific language
        const dayContent = config.contentManagement.audioContent.get(day) || {};
        dayContent[language] = uploadResult.secure_url;
        config.contentManagement.audioContent.set(day, dayContent);
        
        console.log(`✅ Audio content saved to Map for Day ${day}, ${language}`);
      } else {
        // For other content types, use the existing dot notation approach
        const updatePath = `contentManagement.${contentType}.${day}.${language}`;
        config.set(updatePath, uploadResult.secure_url);
        console.log(`✅ Content saved using dot notation for Day ${day}, ${language}, ${contentType}`);
      }

      config.updatedAt = new Date();
      await config.save();
      
      console.log(`✅ Content URL saved to database for Day ${day}, ${language}, ${contentType}`);

    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Still return success since upload worked, but log the DB error
    }

    // Return the content URL and metadata
    res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id || '',
      format: uploadResult.format || '',
      duration: uploadResult.duration || 0,
      bytes: uploadResult.bytes || 0,
      resourceType: uploadResult.resource_type || 'auto',
      message: `${contentType} uploaded successfully for Day ${day} in ${language}`
    });

  } catch (uploadError) {
    console.error('Content upload error:', uploadError);
    res.status(500).json({ 
      error: 'Failed to upload content to Cloudinary', 
      details: uploadError.message || 'Upload timeout or connection error'
    });
  } finally {
    // Clean up the temporary file
    if (tempFilePath) {
      setTimeout(() => {
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log('🗑️ Temporary file cleaned up');
          }
        } catch (unlinkError) {
          console.error('Failed to delete temp file:', unlinkError);
        }
      }, 1000); // 1 second delay
    }
  }
}