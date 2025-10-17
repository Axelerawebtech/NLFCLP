import { IncomingForm } from 'formidable';
import cloudinary from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Disable body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 500 * 1024 * 1024, // 500MB max
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(400).json({ error: 'Failed to parse upload', details: err.message });
      }

      const videoFile = files.video;
      if (!videoFile) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      const filePath = Array.isArray(videoFile) ? videoFile[0].filepath : videoFile.filepath;
      const fileName = Array.isArray(videoFile) ? videoFile[0].originalFilename : videoFile.originalFilename;

      console.log('📹 Uploading video to Cloudinary:', fileName);

      try {
        // Upload to Cloudinary
        const uploadResult = await cloudinary.v2.uploader.upload(filePath, {
          resource_type: 'video',
          folder: 'caregiver-program-videos',
          public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
          eager: [
            { streaming_profile: 'hd', format: 'm3u8' },
            { format: 'mp4', transformation: [{ quality: 'auto' }] }
          ],
          eager_async: true,
        });

        // Clean up the temporary file
        fs.unlinkSync(filePath);

        console.log('✅ Video uploaded successfully:', uploadResult.secure_url);

        // Return the video URL and metadata
        return res.status(200).json({
          success: true,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          duration: uploadResult.duration,
          width: uploadResult.width,
          height: uploadResult.height,
          playbackUrl: uploadResult.playback_url || uploadResult.secure_url,
          thumbnailUrl: uploadResult.secure_url.replace(/\.[^/.]+$/, '.jpg'),
          message: 'Video uploaded successfully'
        });

      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        
        // Clean up the temporary file even if upload fails
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error('Failed to delete temp file:', unlinkError);
        }

        return res.status(500).json({ 
          error: 'Failed to upload video to Cloudinary', 
          details: uploadError.message 
        });
      }
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
