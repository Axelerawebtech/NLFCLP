// Video Configuration - URLs for all video content with multi-language support
// This allows easy management of video URLs without rebuilding the app

export const videoConfig = {
  // Day 0 - Core Introduction Module
  0: {
    title: {
      en: 'Core Module - Introduction to Caregiving',
      hi: 'मुख्य मॉड्यूल - देखभाल का परिचय',
      kn: 'ಮುಖ್ಯ ಮಾಡ್ಯೂಲ್ - ಆರೈಕೆಯ ಪರಿಚಯ'
    },
    description: {
      en: 'Welcome to the comprehensive caregiver support program. Learn the fundamentals of effective caregiving.',
      hi: 'व्यापक देखभालकर्ता सहायता कार्यक्रम में आपका स्वागत है। प्रभावी देखभाल की मूल बातें सीखें।',
      kn: 'ಸಮಗ್ರ ಆರೈಕೆದಾರ ಬೆಂಬಲ ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಸ್ವಾಗತ. ಪರಿಣಾಮಕಾರಿ ಆರೈಕೆಯ ಮೂಲಭೂತ ಅಂಶಗಳನ್ನು ಕಲಿಯಿರಿ.'
    },
    videos: {
      en: {
        videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760168930/COREMODULE-ENGLISH_1_kt3vqw.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/CORE_MODULE-ENGLISH.jpg',
        provider: 'cloudinary'
      },
      hi: {
        videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169018/COREMODULE-HINDI_wcjmlm.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/CORE_MODULE-HINDI.jpg',
        provider: 'cloudinary'
      },
      kn: {
        videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/CORE_MODULE-KANNADA_xudpwg.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/CORE_MODULE-KANNADA_xudpwg.jpg',
        provider: 'cloudinary'
      }
    },
    duration: '03:36'
  },

  // Day 1 - Zarit Burden Assessment Based Content
  1: {
    low: {
      title: {
        en: 'Day 1 - Understanding Your Role (Basic Level)',
        hi: 'दिन 1 - अपनी भूमिका को समझना (बुनियादी स्तर)',
        kn: 'ದಿನ 1 - ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು (ಮೂಲಭೂತ ಹಂತ)'
      },
      description: {
        en: 'Basic caregiving concepts for low burden situations. Learn fundamental skills and stress management.',
        hi: 'कम बोझ की स्थितियों के लिए बुनियादी देखभाल अवधारणाएं। मौलिक कौशल और तनाव प्रबंधन सीखें।',
        kn: 'ಕಡಿಮೆ ಹೊರೆಯ ಸನ್ನಿವೇಶಗಳಿಗೆ ಮೂಲಭೂತ ಆರೈಕೆ ಪರಿಕಲ್ಪನೆಗಳು. ಮೂಲಭೂತ ಕೌಶಲ್ಯಗಳು ಮತ್ತು ಒತ್ತಡ ನಿರ್ವಹಣೆಯನ್ನು ಕಲಿಯಿರಿ.'
      },
      videos: {
        en: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760168930/COREMODULE-ENGLISH_1_kt3vqw.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY1-LOW-EN.jpg',
          provider: 'external'
        },
        hi: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169018/DAY1-LOW-HINDI_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY1-LOW-HI.jpg',
          provider: 'cloudinary'
        },
        kn: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY1-LOW-KANNADA_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY1-LOW-KN.jpg',
          provider: 'cloudinary'
        }
      },
      duration: '8:45'
    },
    moderate: {
      title: {
        en: 'Day 1 - Managing Challenges (Intermediate Level)',
        hi: 'दिन 1 - चुनौतियों का प्रबंधन (मध्यम स्तर)',
        kn: 'ದಿನ 1 - ಸವಾಲುಗಳನ್ನು ನಿರ್ವಹಿಸುವುದು (ಮಧ್ಯಮ ಹಂತ)'
      },
      description: {
        en: 'Strategies for moderate caregiving challenges. Advanced techniques for complex situations.',
        hi: 'मध्यम देखभाल चुनौतियों के लिए रणनीतियां। जटिल स्थितियों के लिए उन्नत तकनीकें।',
        kn: 'ಮಧ್ಯಮ ಆರೈಕೆ ಸವಾಲುಗಳಿಗೆ ತಂತ್ರಗಳು. ಸಂಕೀರ್ಣ ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಸುಧಾರಿತ ತಂತ್ರಗಳು.'
      },
      videos: {
        en: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169018/COREMODULE-HINDI_wcjmlm.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY1-MODERATE-EN.jpg',
          provider: 'external'
        },
        hi: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169018/DAY1-MODERATE-HINDI_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY1-MODERATE-HI.jpg',
          provider: 'cloudinary'
        },
        kn: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY1-MODERATE-KANNADA_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY1-MODERATE-KN.jpg',
          provider: 'cloudinary'
        }
      },
      duration: '10:15'
    },
    high: {
      title: {
        en: 'Day 1 - Intensive Support (Advanced Level)',
        hi: 'दिन 1 - गहन समर्थन (उन्नत स्तर)',
        kn: 'ದಿನ 1 - ಇಂಟೆನ್ಸಿವ್ ಬೆಂಬಲ (ಸುಧಾರಿತ ಹಂತ)'
      },
      description: {
        en: 'Comprehensive support for high-burden caregiving. Expert-level strategies and resources.',
        hi: 'उच्च-बोझ देखभाल के लिए व्यापक समर्थन। विशेषज्ञ-स्तरीय रणनीतियां और संसाधन।',
        kn: 'ಹೆಚ್ಚಿನ ಹೊರೆಯ ಆರೈಕೆಗಾಗಿ ಸಮಗ್ರ ಬೆಂಬಲ. ತಜ್ಞ-ಮಟ್ಟದ ತಂತ್ರಗಳು ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳು.'
      },
      videos: {
        en: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/CORE_MODULE-KANNADA_xudpwg.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY1-HIGH-EN.jpg',
          provider: 'cloudinary'
        },
        hi: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169018/DAY1-HIGH-HINDI_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY1-HIGH-HI.jpg',
          provider: 'cloudinary'
        },
        kn: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY1-HIGH-KANNADA_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY1-HIGH-KN.jpg',
          provider: 'cloudinary'
        }
      },
      duration: '12:00'
    }
  },

  // Day 2 - Stress Management
  2: {
    low: {
      title: {
        en: 'Day 2 - Basic Stress Management',
        hi: 'दिन 2 - बुनियादी तनाव प्रबंधन',
        kn: 'ದಿನ 2 - ಮೂಲಭೂತ ಒತ್ತಡ ನಿರ್ವಹಣೆ'
      },
      description: {
        en: 'Simple stress management techniques for everyday caregiving situations.',
        hi: 'रोजमर्रा की देखभाल स्थितियों के लिए सरल तनाव प्रबंधन तकनीकें।',
        kn: 'ದೈನಂದಿನ ಆರೈಕೆ ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಸರಳ ಒತ್ತಡ ನಿರ್ವಹಣಾ ತಂತ್ರಗಳು.'
      },
      videos: {
        en: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760168930/DAY2-LOW-ENGLISH_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-LOW-EN.jpg',
          provider: 'cloudinary'
        },
        hi: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169018/DAY2-LOW-HINDI_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-LOW-HI.jpg',
          provider: 'cloudinary'
        },
        kn: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-LOW-KANNADA_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-LOW-KN.jpg',
          provider: 'cloudinary'
        }
      },
      duration: '7:30'
    },
    moderate: {
      title: {
        en: 'Day 2 - Intermediate Stress Management',
        hi: 'दिन 2 - मध्यम तनाव प्रबंधन',
        kn: 'ದಿನ 2 - ಮಧ್ಯಮ ಒತ್ತಡ ನಿರ್ವಹಣೆ'
      },
      description: {
        en: 'Effective stress management strategies for challenging caregiving situations.',
        hi: 'चुनौतीपूर्ण देखभाल स्थितियों के लिए प्रभावी तनाव प्रबंधन रणनीतियां।',
        kn: 'ಸವಾಲಿನ ಆರೈಕೆ ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಪರಿಣಾಮಕಾರಿ ಒತ್ತಡ ನಿರ್ವಹಣಾ ತಂತ್ರಗಳು.'
      },
      videos: {
        en: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169018/DAY2-MODERATE-ENGLISH_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-MODERATE-EN.jpg',
          provider: 'cloudinary'
        },
        hi: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169018/DAY2-MODERATE-HINDI_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-MODERATE-HI.jpg',
          provider: 'cloudinary'
        },
        kn: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-MODERATE-KANNADA_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-MODERATE-KN.jpg',
          provider: 'cloudinary'
        }
      },
      duration: '9:45'
    },
    high: {
      title: {
        en: 'Day 2 - Advanced Stress Management',
        hi: 'दिन 2 - उन्नत तनाव प्रबंधन',
        kn: 'ದಿನ 2 - ಸುಧಾರಿತ ಒತ್ತಡ ನಿರ್ವಹಣೆ'
      },
      description: {
        en: 'Comprehensive stress management for high-stress caregiving environments.',
        hi: 'उच्च तनाव देखभाल वातावरण के लिए व्यापक तनाव प्रबंधन।',
        kn: 'ಹೆಚ್ಚಿನ ಒತ್ತಡದ ಆರೈಕೆ ಪರಿಸರಗಳಿಗೆ ಸಮಗ್ರ ಒತ್ತಡ ನಿರ್ವಹಣೆ.'
      },
      videos: {
        en: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-HIGH-ENGLISH_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-HIGH-EN.jpg',
          provider: 'cloudinary'
        },
        hi: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-HIGH-HINDI_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-HIGH-HI.jpg',
          provider: 'cloudinary'
        },
        kn: {
          videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-HIGH-KANNADA_sample.mp4',
          thumbnailUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/DAY2-HIGH-KN.jpg',
          provider: 'cloudinary'
        }
      },
      duration: '11:20'
    }
  },

  // Day 3 - Coping Strategies
  3: {
    low: {
      title: 'Day 3 - Basic Coping Strategies',
      description: 'Fundamental coping techniques for daily caregiving challenges.',
      videoUrl: 'https://player.vimeo.com/video/example-day3-low',
      thumbnailUrl: 'https://via.placeholder.com/800x450/28a745/ffffff?text=Day+3+Coping+Basic',
      duration: '8:15',
      provider: 'vimeo'
    },
    moderate: {
      title: 'Day 3 - Developing Resilience',
      description: 'Building resilience and adaptive coping strategies for moderate challenges.',
      videoUrl: 'https://player.vimeo.com/video/example-day3-moderate',
      thumbnailUrl: 'https://via.placeholder.com/800x450/ffc107/ffffff?text=Day+3+Resilience',
      duration: '10:00',
      provider: 'vimeo'
    },
    high: {
      title: 'Day 3 - Advanced Coping Mechanisms',
      description: 'Expert-level coping strategies for complex caregiving situations.',
      videoUrl: 'https://player.vimeo.com/video/example-day3-high',
      thumbnailUrl: 'https://via.placeholder.com/800x450/dc3545/ffffff?text=Day+3+Advanced+Coping',
      duration: '12:30',
      provider: 'vimeo'
    }
  },

  // Day 4 - Self-Care Assessment
  4: {
    low: {
      title: 'Day 4 - Basic Self-Care',
      description: 'Essential self-care practices for sustainable caregiving.',
      videoUrl: 'https://player.vimeo.com/video/example-day4-low',
      thumbnailUrl: 'https://via.placeholder.com/800x450/28a745/ffffff?text=Day+4+Self+Care+Basic',
      duration: '7:45',
      provider: 'vimeo'
    },
    moderate: {
      title: 'Day 4 - Balanced Self-Care',
      description: 'Maintaining personal wellness while providing comprehensive care.',
      videoUrl: 'https://player.vimeo.com/video/example-day4-moderate',
      thumbnailUrl: 'https://via.placeholder.com/800x450/ffc107/ffffff?text=Day+4+Balanced+Care',
      duration: '9:30',
      provider: 'vimeo'
    },
    high: {
      title: 'Day 4 - Intensive Self-Care',
      description: 'Advanced self-care strategies for high-stress caregiving roles.',
      videoUrl: 'https://player.vimeo.com/video/example-day4-high',
      thumbnailUrl: 'https://via.placeholder.com/800x450/dc3545/ffffff?text=Day+4+Intensive+Care',
      duration: '11:00',
      provider: 'vimeo'
    }
  },

  // Day 5 - Social Support Network
  5: {
    low: {
      title: 'Day 5 - Building Support Networks',
      description: 'Creating and maintaining supportive relationships in caregiving.',
      videoUrl: 'https://player.vimeo.com/video/example-day5-low',
      thumbnailUrl: 'https://via.placeholder.com/800x450/28a745/ffffff?text=Day+5+Support+Basic',
      duration: '8:00',
      provider: 'vimeo'
    },
    moderate: {
      title: 'Day 5 - Strengthening Support Systems',
      description: 'Enhancing existing support networks and finding new resources.',
      videoUrl: 'https://player.vimeo.com/video/example-day5-moderate',
      thumbnailUrl: 'https://via.placeholder.com/800x450/ffc107/ffffff?text=Day+5+Support+Enhanced',
      duration: '10:30',
      provider: 'vimeo'
    },
    high: {
      title: 'Day 5 - Comprehensive Support Management',
      description: 'Managing complex support networks for intensive caregiving situations.',
      videoUrl: 'https://player.vimeo.com/video/example-day5-high',
      thumbnailUrl: 'https://via.placeholder.com/800x450/dc3545/ffffff?text=Day+5+Support+Advanced',
      duration: '12:15',
      provider: 'vimeo'
    }
  },

  // Day 6 - Emotional Wellbeing
  6: {
    low: {
      title: 'Day 6 - Emotional Health Basics',
      description: 'Fundamental emotional wellness practices for caregivers.',
      videoUrl: 'https://player.vimeo.com/video/example-day6-low',
      thumbnailUrl: 'https://via.placeholder.com/800x450/28a745/ffffff?text=Day+6+Emotional+Basic',
      duration: '8:30',
      provider: 'vimeo'
    },
    moderate: {
      title: 'Day 6 - Emotional Resilience',
      description: 'Building emotional strength and managing caregiver burnout.',
      videoUrl: 'https://player.vimeo.com/video/example-day6-moderate',
      thumbnailUrl: 'https://via.placeholder.com/800x450/ffc107/ffffff?text=Day+6+Emotional+Resilience',
      duration: '10:45',
      provider: 'vimeo'
    },
    high: {
      title: 'Day 6 - Advanced Emotional Support',
      description: 'Expert emotional management techniques for complex caregiving roles.',
      videoUrl: 'https://player.vimeo.com/video/example-day6-high',
      thumbnailUrl: 'https://via.placeholder.com/800x450/dc3545/ffffff?text=Day+6+Emotional+Advanced',
      duration: '13:00',
      provider: 'vimeo'
    }
  },

  // Day 7 - Program Evaluation
  7: {
    low: {
      title: 'Day 7 - Program Reflection',
      description: 'Reflecting on your caregiving journey and planning future growth.',
      videoUrl: 'https://player.vimeo.com/video/example-day7-low',
      thumbnailUrl: 'https://via.placeholder.com/800x450/28a745/ffffff?text=Day+7+Reflection',
      duration: '9:00',
      provider: 'vimeo'
    },
    moderate: {
      title: 'Day 7 - Comprehensive Evaluation',
      description: 'Evaluating progress and creating sustainable caregiving practices.',
      videoUrl: 'https://player.vimeo.com/video/example-day7-moderate',
      thumbnailUrl: 'https://via.placeholder.com/800x450/ffc107/ffffff?text=Day+7+Evaluation',
      duration: '11:30',
      provider: 'vimeo'
    },
    high: {
      title: 'Day 7 - Advanced Program Integration',
      description: 'Integrating advanced techniques into long-term caregiving strategies.',
      videoUrl: 'https://player.vimeo.com/video/example-day7-high',
      thumbnailUrl: 'https://via.placeholder.com/800x450/dc3545/ffffff?text=Day+7+Integration',
      duration: '14:00',
      provider: 'vimeo'
    }
  }
};

// Video Provider Configurations
export const videoProviderConfig = {
  vimeo: {
    embedUrl: (videoId) => `https://player.vimeo.com/video/${videoId}`,
    embedParams: '?autoplay=0&title=0&byline=0&portrait=0&responsive=1'
  },
  youtube: {
    embedUrl: (videoId) => `https://www.youtube.com/embed/${videoId}`,
    embedParams: '?autoplay=0&rel=0&modestbranding=1&controls=1'
  },
  custom: {
    // For custom video hosting solutions
    embedUrl: (videoUrl) => videoUrl,
    embedParams: ''
  }
};

// Helper function to get complete video URL with parameters
export const getVideoEmbedUrl = (videoUrl, provider = 'vimeo') => {
  if (!videoUrl) return null;
  
  if (provider === 'custom') {
    return videoUrl;
  }
  
  // Extract video ID from URL for standardized providers
  const providerConfig = videoProviderConfig[provider];
  if (!providerConfig) return videoUrl;
  
  // For now, return the URL as-is (can be enhanced to extract IDs)
  return videoUrl + providerConfig.embedParams;
};

// Fallback configuration for missing videos
export const fallbackVideoConfig = {
  title: {
    en: 'Content Coming Soon',
    hi: 'सामग्री जल्द आ रही है',
    kn: 'ವಿಷಯ ಶೀಘ್ರದಲ್ಲೇ ಬರುತ್ತಿದೆ'
  },
  description: {
    en: 'This video content will be available soon. Please check back later.',
    hi: 'यह वीडियो सामग्री जल्द ही उपलब्ध होगी। कृपया बाद में वापस देखें।',
    kn: 'ಈ ವೀಡಿಯೊ ವಿಷಯ ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯವಾಗುತ್ತದೆ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ.'
  },
  videos: {
    en: {
      videoUrl: null,
      thumbnailUrl: 'https://via.placeholder.com/800x450/6c757d/ffffff?text=Content+Coming+Soon+EN',
      provider: 'placeholder'
    },
    hi: {
      videoUrl: null,
      thumbnailUrl: 'https://via.placeholder.com/800x450/6c757d/ffffff?text=Content+Coming+Soon+HI',
      provider: 'placeholder'
    },
    kn: {
      videoUrl: null,
      thumbnailUrl: 'https://via.placeholder.com/800x450/6c757d/ffffff?text=Content+Coming+Soon+KN',
      provider: 'placeholder'
    }
  },
  duration: '0:00'
};

// Helper function to get language-specific video content
// Helper function to map Zarit burden levels to video config levels
const mapBurdenLevel = (burdenLevel) => {
  const mapping = {
    'mild': 'low',
    'mild-moderate': 'moderate', 
    'moderate-severe': 'moderate',
    'severe': 'high'
  };
  return mapping[burdenLevel] || 'moderate';
};

export const getVideoContent = (day, level = null, language = 'en') => {
  try {
    console.log(`🎬 Getting video content for day ${day}, level ${level}, language ${language}`);
    let videoData = videoConfig[day];
    
    if (!videoData) {
      console.log(`❌ No video data found for day ${day}`);
      return getLocalizedContent(fallbackVideoConfig, language);
    }
    
    // For day modules with levels (Days 1-7)
    if (level) {
      // Map the burden level to video config structure
      const mappedLevel = mapBurdenLevel(level);
      console.log(`Mapping burden level '${level}' to video level '${mappedLevel}' for day ${day}`);
      
      if (videoData[mappedLevel]) {
        videoData = videoData[mappedLevel];
        console.log(`✅ Found video data for ${mappedLevel} level:`, videoData);
      } else {
        console.warn(`❌ Video level '${mappedLevel}' not found for day ${day}, available levels:`, Object.keys(videoData));
      }
    }
    
    const result = getLocalizedContent(videoData, language);
    console.log(`🎯 Final video content result:`, result);
    return result;
  } catch (error) {
    console.error('Error getting video content:', error);
    return getLocalizedContent(fallbackVideoConfig, language);
  }
};

// Helper function to get localized content
export const getLocalizedContent = (videoData, language = 'en') => {
  const safeLanguage = ['en', 'hi', 'kn'].includes(language) ? language : 'en';
  console.log(`🌐 getLocalizedContent - Input language: ${language}, Safe language: ${safeLanguage}`);
  console.log(`📊 VideoData structure:`, videoData);
  
  const result = {
    title: typeof videoData.title === 'object' ? videoData.title[safeLanguage] || videoData.title.en : videoData.title,
    description: typeof videoData.description === 'object' ? videoData.description[safeLanguage] || videoData.description.en : videoData.description,
    videoUrl: videoData.videos?.[safeLanguage]?.videoUrl || videoData.videoUrl || null,
    thumbnailUrl: videoData.videos?.[safeLanguage]?.thumbnailUrl || videoData.thumbnailUrl || null,
    provider: videoData.videos?.[safeLanguage]?.provider || videoData.provider || 'placeholder',
    duration: videoData.duration || '0:00'
  }
  
  console.log(`🎯 Localized content result:`, result);
  return result;
};

// Helper function to get all supported languages for a video
export const getSupportedLanguages = (day, level = null) => {
  try {
    let videoData = videoConfig[day];
    
    if (!videoData) return [];
    
    if (level && videoData[level]) {
      videoData = videoData[level];
    }
    
    if (videoData.videos && typeof videoData.videos === 'object') {
      return Object.keys(videoData.videos).filter(lang => 
        videoData.videos[lang]?.videoUrl && 
        ['en', 'hi', 'kn'].includes(lang)
      );
    }
    
    return [];
  } catch (error) {
    console.error('Error getting supported languages:', error);
    return [];
  }
};