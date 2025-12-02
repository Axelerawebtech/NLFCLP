import crypto from 'crypto';

/**
 * API: /api/admin/get-cloudinary-signature
 * Method: POST
 * 
 * Purpose: Generate upload signature for direct Cloudinary uploads
 * This bypasses Vercel's 4.5MB serverless function limit
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timestamp, folder } = req.body;

    if (!timestamp) {
      return res.status(400).json({ error: 'Timestamp is required' });
    }

    const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!cloudinarySecret || !cloudinaryApiKey || !cloudinaryCloudName) {
      return res.status(500).json({ error: 'Cloudinary credentials not configured' });
    }

    // Create signature for upload
    // Only include parameters that will be sent to Cloudinary
    const folderPath = folder || 'caregiver-program-videos';
    const paramsToSign = {
      folder: folderPath,
      timestamp: timestamp
    };

    // Sort params alphabetically and create string to sign
    const sortedParams = Object.keys(paramsToSign)
      .sort()
      .map(key => `${key}=${paramsToSign[key]}`)
      .join('&');

    // Generate signature: params_string + api_secret
    const stringToSign = sortedParams + cloudinarySecret;
    const signature = crypto
      .createHash('sha1')
      .update(stringToSign)
      .digest('hex');

    res.status(200).json({
      success: true,
      signature,
      timestamp,
      apiKey: cloudinaryApiKey,
      cloudName: cloudinaryCloudName,
      folder: folderPath
    });

  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    res.status(500).json({ 
      error: 'Failed to generate signature',
      details: error.message 
    });
  }
}
