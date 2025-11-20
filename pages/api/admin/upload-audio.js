import { IncomingForm } from 'formidable';
import cloudinary from 'cloudinary';
import fs from 'fs';
import os from 'os';

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
    responseLimit: false,
    externalResolver: true
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFilePath = null;

  try {
    const tempDir = os.tmpdir();
    console.log('🗂️ Using temp directory:', tempDir);

    // Parse the multipart form data
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB max for audio
      uploadDir: tempDir,
      multiples: false
    });

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

    const audioFile = files.audio;
    const language = fields.language && fields.language[0] ? fields.language[0] : 'english';

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const filePath = Array.isArray(audioFile) ? audioFile[0].filepath : audioFile.filepath;
    const fileName = Array.isArray(audioFile) ? audioFile[0].originalFilename : audioFile.originalFilename;
    tempFilePath = filePath;

    console.log('🔊 Uploading audio to Cloudinary:', fileName);
    console.log('📁 Temp file path:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ 
        error: 'Uploaded file not found', 
        details: `File not found at: ${filePath}` 
      });
    }

    // Check file size
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`📁 File size: ${fileSizeInMB.toFixed(2)} MB`);

    if (fileSizeInMB > 100) {
      return res.status(400).json({ 
        error: 'File too large', 
        details: 'Maximum file size is 100MB' 
      });
    }

    try {
      // Upload to Cloudinary
      const uploadOptions = {
        resource_type: 'video', // Cloudinary uses 'video' for audio files
        folder: 'caregiver-program-audio',
        public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
        timeout: 120000, // 2 minutes timeout
      };

      console.log('📤 Starting upload to Cloudinary...');
      
      const uploadResult = await cloudinary.v2.uploader.upload(filePath, uploadOptions);

      console.log('✅ Audio uploaded successfully');

      // Validate the upload result
      if (!uploadResult || !uploadResult.secure_url) {
        console.error('❌ Invalid upload result:', uploadResult);
        throw new Error('Upload completed but no secure URL returned from Cloudinary');
      }

      // Return the audio URL and metadata
      res.status(200).json({
        success: true,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id || '',
        format: uploadResult.format || '',
        duration: uploadResult.duration || 0,
        message: 'Audio uploaded successfully'
      });

    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      console.error('❌ Upload error details:', uploadError.message);
      
      res.status(500).json({ 
        error: 'Failed to upload audio to Cloudinary', 
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
      }, 1000);
    }
  }
}
