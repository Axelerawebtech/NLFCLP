import { IncomingForm } from 'formidable';
import cloudinary from 'cloudinary';
import fs from 'fs';
import os from 'os';
import path from 'path';
import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000 // 2 minutes timeout
});

// Disable body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false, // Allow large responses
    externalResolver: true // Important for formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFilePath = null;

  try {
    await dbConnect(); // Connect to database
    
    // Get the system temporary directory (works on Windows, Mac, Linux)
    const tempDir = os.tmpdir();
    console.log('🗂️ Using temp directory:', tempDir);

    // Test Cloudinary connection first
    console.log('🔗 Testing Cloudinary connection...');
    console.log('📋 Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
    });

    // Parse the multipart form data
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 500 * 1024 * 1024, // 500MB max
      uploadDir: tempDir, // Use system temp directory
      multiples: false
    });

    // Set up promises to handle the async form parsing
    const parseForm = () => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err);
          } else {
            resolve({ fields, files });
          }
        });
      });
    };

    const { fields, files } = await parseForm();

    // Extract form data
    const videoFile = files.video;
    let day = fields.day && fields.day[0] ? parseInt(fields.day[0]) : null;
    const burdenLevel = fields.burdenLevel && fields.burdenLevel[0] ? fields.burdenLevel[0] : null;
    const language = fields.language && fields.language[0] ? fields.language[0] : 'english';
    const videoTitle = fields.videoTitle && fields.videoTitle[0] ? fields.videoTitle[0] : '';
    const description = fields.description && fields.description[0] ? fields.description[0] : '';
    
    // Fallback: detect Day 0 from filename if day is not provided
    const fileName = Array.isArray(videoFile) ? videoFile[0].originalFilename : videoFile.originalFilename;
    if (day === null && fileName && /core.*module|day.*0/i.test(fileName)) {
      console.log('🔍 Detected Day 0 from filename:', fileName);
      day = 0;
    }

    if (!videoFile) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const filePath = Array.isArray(videoFile) ? videoFile[0].filepath : videoFile.filepath;
    tempFilePath = filePath; // Store for cleanup

    console.log('📹 Uploading video to Cloudinary:', fileName);
    console.log('📁 Temp file path:', filePath);
    console.log('📋 Upload metadata:', { day, burdenLevel, language, videoTitle });
    console.log('🔍 Day value check:', { day, type: typeof day, isNull: day === null, isZero: day === 0 });

    // Check if file exists before proceeding
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ 
        error: 'Uploaded file not found', 
        details: `File not found at: ${filePath}` 
      });
    }

    // Check file size before upload
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`📁 File size: ${fileSizeInMB.toFixed(2)} MB`);

    if (fileSizeInMB > 500) {
      return res.status(400).json({ 
        error: 'File too large', 
        details: 'Maximum file size is 500MB' 
      });
    }

    try {
      // Upload to Cloudinary
      let uploadOptions = {
        resource_type: 'video',
        folder: 'caregiver-program-videos',
        public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
        timeout: 180000, // 3 minutes timeout for large files
        eager: [
          { format: 'mp4', transformation: [{ quality: 'auto:good' }] }
        ],
        eager_async: false, // Make it synchronous for immediate thumbnail
      };

      console.log('📤 Starting upload to Cloudinary...');
      console.log('🔧 Upload options:', JSON.stringify(uploadOptions, null, 2));
      
      let uploadResult;
      
      // Use chunked upload for files larger than 100MB (Cloudinary's standard upload limit)
      if (fileSizeInMB > 100) {
        console.log('📤 Using chunked upload for large file (>100MB)...');
        
        // For chunked uploads, we need to handle it as a callback-based function
        uploadResult = await new Promise((resolve, reject) => {
          cloudinary.v2.uploader.upload_large(filePath, {
            ...uploadOptions,
            chunk_size: 6000000, // 6MB chunks
          }, (error, result) => {
            if (error) {
              console.error('❌ Chunked upload error:', error);
              reject(error);
            } else {
              console.log('✅ Chunked upload completed successfully');
              resolve(result);
            }
          });
        });
      } else {
        console.log('📤 Using standard upload for smaller file...');
        uploadResult = await cloudinary.v2.uploader.upload(filePath, uploadOptions);
      }

      console.log('✅ Video uploaded successfully');
      console.log('📊 Upload result:', JSON.stringify(uploadResult, null, 2));

      // Validate the upload result
      if (!uploadResult || !uploadResult.secure_url) {
        console.error('❌ Invalid upload result:', uploadResult);
        throw new Error('Upload completed but no secure URL returned from Cloudinary');
      }

      // Auto-save to unified dynamicDayStructures system
      let autoSaved = false;
      let autoSaveError = null;
      
      if (day !== null && day >= 0 && day <= 7) {
        try {
          console.log('🔧 Auto-saving to dynamicDayStructures system...');
          console.log('📊 Params:', { day, language, burdenLevel, videoTitle });
          
          // Find or create global config
          let config = await ProgramConfig.findOne({ 
            configType: 'global', 
            caregiverId: null 
          });

          if (!config) {
            config = new ProgramConfig({
              configType: 'global',
              caregiverId: null,
              isActive: true,
              dynamicDayStructures: [],
              dynamicDayTranslations: []
            });
          }

          // Initialize structures if needed
          if (!config.dynamicDayStructures) {
            config.dynamicDayStructures = [];
          }
          if (!config.dynamicDayTranslations) {
            config.dynamicDayTranslations = [];
          }

          // Find or create day structure
          let dayStructure = config.dynamicDayStructures.find(d => d.dayNumber === day);
          if (!dayStructure) {
            dayStructure = {
              dayNumber: day,
              enabled: true,
              hasTest: day === 1, // Day 1 has burden test
              contentByLevel: []
            };
            config.dynamicDayStructures.push(dayStructure);
          }

          // Determine level key
          let levelKey = 'default';
          if (day === 0) {
            levelKey = 'default';
          } else if (day === 1 && burdenLevel) {
            levelKey = burdenLevel; // mild, moderate, severe
          } else if (day >= 2 && burdenLevel) {
            levelKey = burdenLevel;
          }

          // Find or create level
          let levelContent = dayStructure.contentByLevel.find(l => l.levelKey === levelKey);
          if (!levelContent) {
            levelContent = {
              levelKey: levelKey,
              levelLabel: levelKey === 'default' ? 'Core Module' : 
                         levelKey.charAt(0).toUpperCase() + levelKey.slice(1) + ' Level',
              tasks: []
            };
            dayStructure.contentByLevel.push(levelContent);
          }

          // Find or create video task
          let videoTask = levelContent.tasks.find(t => t.taskType === 'video' && t.taskOrder === 1);
          if (!videoTask) {
            videoTask = {
              taskId: `task_day${day}_${levelKey}_intro_video`,
              taskType: 'video',
              taskOrder: 1,
              enabled: true,
              title: '', // Will be in translations
              description: '',
              content: {}
            };
            levelContent.tasks.push(videoTask);
          }

          // Update video URL in content
          if (!videoTask.content) {
            videoTask.content = {};
          }
          videoTask.content.videoUrl = uploadResult.secure_url;

          // Update translation
          let translation = config.dynamicDayTranslations.find(
            t => t.dayNumber === day && t.language === language
          );
          if (!translation) {
            translation = {
              dayNumber: day,
              language: language,
              dayName: `Day ${day}`,
              levelContent: []
            };
            config.dynamicDayTranslations.push(translation);
          }

          // Find or create level in translation
          let translationLevel = translation.levelContent.find(l => l.levelKey === levelKey);
          if (!translationLevel) {
            translationLevel = {
              levelKey: levelKey,
              levelLabel: levelKey === 'default' ? 'Core Module' : 
                         levelKey.charAt(0).toUpperCase() + levelKey.slice(1) + ' Level',
              tasks: []
            };
            translation.levelContent.push(translationLevel);
          }

          // Find or create task translation
          let taskTranslation = translationLevel.tasks.find(t => t.taskId === videoTask.taskId);
          if (!taskTranslation) {
            taskTranslation = {
              taskId: videoTask.taskId,
              title: videoTitle || `Day ${day} Video`,
              description: description || ''
            };
            translationLevel.tasks.push(taskTranslation);
          } else {
            // Update existing translation
            if (videoTitle) taskTranslation.title = videoTitle;
            if (description) taskTranslation.description = description;
          }

          // Mark as modified and save
          config.markModified('dynamicDayStructures');
          config.markModified('dynamicDayTranslations');
          config.updatedAt = new Date();
          
          await config.save();
          autoSaved = true;

          console.log(`✅ Video auto-saved to dynamicDayStructures for Day ${day}, Level: ${levelKey}, Language: ${language}`);

        } catch (dbError) {
          console.error('❌ Auto-save error:', dbError);
          autoSaveError = dbError.message;
          // Don't fail the upload - video is still in Cloudinary
        }
      }

      // Return the video URL and metadata
      res.status(200).json({
        success: true,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id || '',
        format: uploadResult.format || '',
        duration: uploadResult.duration || 0,
        width: uploadResult.width || 0,
        height: uploadResult.height || 0,
        playbackUrl: uploadResult.playback_url || uploadResult.secure_url,
        message: autoSaved 
          ? `Video uploaded and saved to Day ${day} (${language}) successfully!`
          : 'Video uploaded to Cloudinary. Auto-save skipped or failed.',
        autoSaved,
        autoSaveError: autoSaveError || undefined,
        savedTo: autoSaved ? {
          day,
          level: day === 0 ? 'default' : (burdenLevel || 'default'),
          language
        } : undefined
      });

    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      console.error('❌ Upload error details:', uploadError.message);
      console.error('🔍 Error stack:', uploadError.stack);
      
      res.status(500).json({ 
        error: 'Failed to upload video to Cloudinary', 
        details: uploadError.message || 'Upload timeout or connection error'
      });
    }

  } catch (error) {
    console.error('Upload handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  } finally {
    // Clean up the temporary file after a delay to ensure Cloudinary has finished reading it
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
