// Video Content Management Utility
// Use this to easily update video URLs without editing the main config

export const updateVideoUrl = (day, level, newUrl) => {
  console.log(`Updating video URL for Day ${day} ${level ? level + ' level' : ''}: ${newUrl}`);
  // This would typically update the database or configuration file
  // For now, it helps track what needs to be updated
};

export const validateVideoConfig = (config) => {
  const errors = [];
  
  // Check Day 0 (no levels)
  if (!config[0] || !config[0].videoUrl) {
    errors.push('Day 0 video URL is missing');
  }
  
  // Check Days 1-7 (with levels)
  for (let day = 1; day <= 7; day++) {
    if (!config[day]) {
      errors.push(`Day ${day} configuration is missing`);
      continue;
    }
    
    ['low', 'moderate', 'high'].forEach(level => {
      if (!config[day][level] || !config[day][level].videoUrl) {
        errors.push(`Day ${day} ${level} level video URL is missing`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    totalVideos: errors.length === 0 ? 22 : 22 - errors.length,
    missingVideos: errors.length
  };
};

export const generateVideoList = () => {
  const videos = [];
  
  // Day 0
  videos.push({
    id: 'day-0',
    title: 'Core Module - Introduction',
    day: 0,
    level: null,
    placeholder: 'https://player.vimeo.com/video/REPLACE_WITH_ACTUAL_ID'
  });
  
  // Days 1-7
  for (let day = 1; day <= 7; day++) {
    ['low', 'moderate', 'high'].forEach(level => {
      videos.push({
        id: `day-${day}-${level}`,
        title: `Day ${day} - ${level.charAt(0).toUpperCase() + level.slice(1)} Level`,
        day,
        level,
        placeholder: 'https://player.vimeo.com/video/REPLACE_WITH_ACTUAL_ID'
      });
    });
  }
  
  return videos;
};

// Helper to generate a CSV for video tracking
export const generateVideoCSV = () => {
  const videos = generateVideoList();
  const csvHeader = 'Day,Level,Title,Status,Video URL,Notes\n';
  const csvRows = videos.map(video => 
    `${video.day},${video.level || 'N/A'},"${video.title}",Pending,"${video.placeholder}",Upload needed`
  ).join('\n');
  
  return csvHeader + csvRows;
};

// Usage example:
console.log('Video Management Utilities Loaded');
console.log('Total videos needed:', 22);
console.log('Use generateVideoCSV() to create a tracking spreadsheet');
console.log('Use validateVideoConfig(videoConfig) to check completion status');