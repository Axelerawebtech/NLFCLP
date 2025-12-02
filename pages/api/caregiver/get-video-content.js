import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { day, language, burdenLevel } = req.query;

    console.log('🎥 Video content request:', { day, language, burdenLevel });

    if (day === undefined || !language) {
      return res.status(400).json({ error: 'Day and language parameters are required' });
    }

    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 0 || dayNum > 7) {
      return res.status(400).json({ error: 'Day must be between 0 and 7' });
    }

    // Map frontend language codes to database language keys
    const languageMap = {
      'en': 'english',
      'kn': 'kannada', 
      'hi': 'hindi',
      'english': 'english',
      'kannada': 'kannada',
      'hindi': 'hindi'
    };

    const dbLanguage = languageMap[language] || 'english';

    console.log('🌐 Language mapping:', { 
      receivedLanguage: language, 
      mappedDbLanguage: dbLanguage 
    });

    // Find the global program configuration
    const config = await ProgramConfig.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    if (!config) {
      console.log('❌ No program configuration found');
      return res.status(404).json({ error: 'Program configuration not found' });
    }

    // Legacy video content system removed
    // All video content now managed through dynamicDayStructures
    // Use /api/caregiver/dynamic-day-content endpoint instead
    
    console.log('❌ This endpoint is deprecated');
    return res.status(410).json({ 
      error: 'Endpoint deprecated', 
      message: 'This endpoint has been deprecated. Please use /api/caregiver/dynamic-day-content to fetch day content including videos.',
      recommendedEndpoint: '/api/caregiver/dynamic-day-content',
      parameters: {
        caregiverId: 'required',
        day: dayNum,
        language: dbLanguage
      }
    });

    if (!videoContent) {
      console.log(`❌ No video content found for Day ${dayNum}, Language: ${dbLanguage}, Burden: ${burdenLevel}`);
      return res.status(404).json({ 
        error: 'Video content not found',
        day: dayNum,
        language: dbLanguage,
        burdenLevel 
      });
    }

    // Add audio content if available
    let audioContent = null;
    if (config.contentManagement && config.contentManagement.audioContent) {
      const audioContentMap = config.contentManagement.audioContent;
      
      // Handle Mongoose Map properly - try both string and numeric keys
      const dayContent = audioContentMap.get ? 
        (audioContentMap.get(dayNum.toString()) || audioContentMap.get(dayNum)) :
        (audioContentMap[dayNum.toString()] || audioContentMap[dayNum]);
      
      if (dayContent) {
        const audioUrl = dayContent[dbLanguage];
        if (audioUrl) {
          audioContent = {
            audioUrl,
            title: `Day ${dayNum} Audio Content`,
            description: `Audio content for Day ${dayNum} in ${dbLanguage}`
          };
          console.log(`🎵 Audio content found for Day ${dayNum}, Language: ${dbLanguage}`);
        }
      }
    }

    // Merge audio content into video content response
    if (audioContent) {
      videoContent.audioUrl = audioContent.audioUrl;
      videoContent.audioTitle = audioContent.title;
    }

    // Log successful fetch
    if (videoContent.videoUrl) {
      console.log(`✅ Video content found for Day ${dayNum}, Language: ${dbLanguage}, Burden: ${burdenLevel || 'N/A'}`);
      console.log(`📹 Video URL: ${videoContent.videoUrl.substring(0, 50)}...`);
    } else {
      console.log(`⚠️ Video content found but no URL for Day ${dayNum}, Language: ${dbLanguage}, Burden: ${burdenLevel || 'N/A'}`);
    }

    if (audioContent) {
      console.log(`🎵 Audio URL: ${audioContent.audioUrl.substring(0, 50)}...`);
    }

    return res.status(200).json({
      success: true,
      videoContent,
      metadata: {
        day: dayNum,
        language: dbLanguage,
        burdenLevel: burdenLevel || null,
        hasVideo: !!videoContent.videoUrl,
        hasAudio: !!videoContent.audioUrl
      }
    });

  } catch (error) {
    console.error('❌ Error fetching video content:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
