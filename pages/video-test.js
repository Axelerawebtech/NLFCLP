import { useState } from 'react';
import { Box, Typography, Button, Alert, Card, CardContent } from '@mui/material';

export default function VideoTest() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const cloudinaryUrl = 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760169021/CORE_MODULE-KANNADA_xudpwg.mp4';

  const testVideo = () => {
    setLoading(true);
    setError(null);
    
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    
    video.onloadstart = () => console.log('Video loading started');
    video.onloadedmetadata = () => {
      console.log('Video metadata loaded');
      console.log('Duration:', video.duration);
      console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
      setLoading(false);
    };
    video.onerror = (e) => {
      console.error('Video error:', e);
      setError('Failed to load video: ' + e.message);
      setLoading(false);
    };
    
    video.src = cloudinaryUrl;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Video Test Page - Day 0 Core Module
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Video URL:
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all', color: 'primary.main' }}>
            {cloudinaryUrl}
          </Typography>
        </CardContent>
      </Card>

      <Button 
        variant="contained" 
        onClick={testVideo} 
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? 'Testing...' : 'Test Video Loading'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Video Player Test:
          </Typography>
          
          {/* Test 1: Direct HTML5 Video */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Test 1: HTML5 Video Player
            </Typography>
            <video
              width="100%"
              height="300"
              controls
              preload="metadata"
              crossOrigin="anonymous"
              onError={(e) => console.error('HTML5 Video Error:', e)}
              onLoadedMetadata={() => console.log('HTML5 Video loaded successfully')}
            >
              <source src={cloudinaryUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>

          {/* Test 2: Cloudinary Video Player Widget */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Test 2: Alternative URL Format
            </Typography>
            <video
              width="100%"
              height="300"
              controls
              preload="metadata"
              onError={(e) => console.error('Alternative Video Error:', e)}
              onLoadedMetadata={() => console.log('Alternative Video loaded successfully')}
            >
              <source src="https://res.cloudinary.com/dp2mpayng/video/upload/f_auto,q_auto/v1760169021/CORE_MODULE-KANNADA_xudpwg.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>

          {/* Test 3: Iframe Embed */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Test 3: Try accessing video directly
            </Typography>
            <Button 
              variant="outlined" 
              href={cloudinaryUrl} 
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Video in New Tab
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Troubleshooting Steps:</strong>
          <br />
          1. Check browser console for any error messages
          <br />
          2. Try opening the video URL directly in a new tab
          <br />
          3. Verify the video file exists in your Cloudinary account
          <br />
          4. Check Cloudinary delivery settings
        </Typography>
      </Alert>
    </Box>
  );
}