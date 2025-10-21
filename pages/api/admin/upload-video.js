import { IncomingForm } from 'formidable';
import cloudinary from 'cloudinary';
import fs from 'fs';
import os from 'os';
import path from 'path';

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

    const videoFile = files.video;
    if (!videoFile) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const filePath = Array.isArray(videoFile) ? videoFile[0].filepath : videoFile.filepath;
    const fileName = Array.isArray(videoFile) ? videoFile[0].originalFilename : videoFile.originalFilename;
    tempFilePath = filePath; // Store for cleanup

    console.log('📹 Uploading video to Cloudinary:', fileName);
    console.log('📁 Temp file path:', filePath);

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
        thumbnailUrl: uploadResult.secure_url ? uploadResult.secure_url.replace(/\.(mp4|mov|avi|mkv)$/i, '.jpg') : '',
        message: 'Video uploaded successfully'
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
