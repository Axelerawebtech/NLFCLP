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

    let videoContent = null;

    if (dayNum === 0) {
      // Day 0: Core module - same for all caregivers
      if (config.day0IntroVideo) {
        console.log('📹 Day 0 video URLs available:', Object.keys(config.day0IntroVideo.videoUrl || {}));
        console.log(`🎯 Fetching Day 0 video for language: ${dbLanguage}`);
        console.log(`📺 Video URL: ${config.day0IntroVideo.videoUrl?.[dbLanguage]?.substring(0, 80)}...`);
        
        videoContent = {
          day: 0,
          title: config.day0IntroVideo.title?.[dbLanguage] || config.day0IntroVideo.title?.english || 'Welcome Video',
          videoUrl: config.day0IntroVideo.videoUrl?.[dbLanguage] || config.day0IntroVideo.videoUrl?.english || '',
          description: config.day0IntroVideo.description?.[dbLanguage] || config.day0IntroVideo.description?.english || '',
          type: 'core-module'
        };
      }
    } else if (dayNum === 1) {
      // Day 1: Post-burden assessment videos
      if (!burdenLevel) {
        return res.status(400).json({ error: 'Burden level required for Day 1' });
      }

      if (config.day1?.videos?.[burdenLevel]) {
        const day1Video = config.day1.videos[burdenLevel];
        videoContent = {
          day: 1,
          title: day1Video.videoTitle?.[dbLanguage] || day1Video.videoTitle?.english || 'Day 1 Video',
          videoUrl: day1Video.videoUrl?.[dbLanguage] || day1Video.videoUrl?.english || '',
          description: day1Video.description?.[dbLanguage] || day1Video.description?.english || '',
          type: 'burden-specific',
          burdenLevel
        };
      }
    } else {
      // Days 2-7: Dynamic content based on burden level
      if (!burdenLevel) {
        return res.status(400).json({ error: 'Burden level required for Days 2-7' });
      }

      if (config.contentRules?.[burdenLevel]?.days) {
        const dayContent = config.contentRules[burdenLevel].days.get(dayNum.toString());
        if (dayContent) {
          videoContent = {
            day: dayNum,
            title: dayContent.videoTitle?.[dbLanguage] || dayContent.videoTitle?.english || `Day ${dayNum} Video`,
            videoUrl: dayContent.videoUrl?.[dbLanguage] || dayContent.videoUrl?.english || '',
            description: dayContent.content?.[dbLanguage] || dayContent.content?.english || '',
            tasks: dayContent.tasks || [],
            type: 'burden-specific',
            burdenLevel
          };
        }
      }
    }

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
