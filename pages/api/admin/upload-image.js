import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  console.log('📸 Image upload request received');
  console.log('🔧 Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
  });

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('❌ Form parse error:', err);
        return res.status(500).json({ success: false, error: 'Failed to parse form data', details: err.message });
      }

      console.log('📋 Files received:', Object.keys(files));
      
      // Handle both formidable v2 and v3 API
      let file = files.file;
      if (Array.isArray(file)) {
        file = file[0];
      }

      if (!file) {
        console.error('❌ No file in request');
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const filePath = file.filepath || file.path;
      console.log('📁 File path:', filePath);
      console.log('📊 File details:', {
        originalFilename: file.originalFilename || file.name,
        mimetype: file.mimetype || file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });

      try {
        console.log('📤 Uploading to Cloudinary...');
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
          resource_type: 'image',
          folder: 'caregiver-program/images',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' }
          ]
        });

        console.log('✅ Image uploaded successfully:', result.secure_url);

        res.status(200).json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id
        });
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError);
        console.error('❌ Error message:', uploadError.message);
        console.error('❌ Error details:', uploadError.error || uploadError);
        
        res.status(500).json({
          success: false,
          error: 'Failed to upload image to Cloudinary',
          details: uploadError.message || 'Upload error'
        });
      }
    });
  } catch (error) {
    console.error('❌ Upload handler error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
