import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Alert,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

const ConsentForm = ({ userType, onAccept, formData }) => {
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  
  // Audio consent states
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showAudioError, setShowAudioError] = useState(false);
  const [consentMethod, setConsentMethod] = useState('text'); // 'text' or 'audio'
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef(null);
  
  const { currentLanguage } = useLanguage();
  const router = useRouter();

  // Debug logging
  console.log('ConsentForm render - currentLanguage:', currentLanguage);
  console.log('ConsentForm - consentFormTitle:', getTranslation(currentLanguage, 'consentFormTitle'));
  console.log('ConsentForm - studyTitle:', getTranslation(currentLanguage, 'studyTitle'));

  // Determine if audio consent is needed
  const needsAudioConsent = currentLanguage === 'hi' || currentLanguage === 'kn';
  
  // Get audio file path
  const getAudioPath = () => {
    if (currentLanguage === 'hi') return '/audio/consent-hindi.mp3';
    if (currentLanguage === 'kn') return '/audio/consent-kannada.mp3';
    return null;
  };

  // Force re-render when language changes
  useEffect(() => {
    setRenderKey(prev => prev + 1);
    // Reset audio states when language changes
    setAccepted(false);
    setAudioCompleted(false);
    setAudioProgress(0);
    setIsAudioPlaying(false);
    setShowAudioError(false);
    setConsentMethod('text'); // Reset to text method
    setAudioLoaded(false);
    
    // Pause any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentLanguage]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !needsAudioConsent || consentMethod !== 'audio') return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        setAudioProgress(progress);
      }
    };

    const handleEnded = () => {
      setIsAudioPlaying(false);
      setAudioCompleted(true);
      setAudioProgress(100);
    };

    const handlePause = () => {
      setIsAudioPlaying(false);
    };

    const handlePlay = () => {
      setIsAudioPlaying(true);
    };

    const handleLoadedMetadata = () => {
      // Audio is ready to play
      console.log('Audio loaded, duration:', audio.duration);
      setAudioLoaded(true);
    };

    const handleCanPlay = () => {
      // Audio can start playing
      setAudioLoaded(true);
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      setIsAudioPlaying(false);
      setAudioLoaded(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentLanguage, consentMethod, needsAudioConsent]);

  // Audio control functions
  const toggleAudioPlayback = async () => {
    const audio = audioRef.current;
    if (!audio) {
      console.error('Audio element not found');
      return;
    }

    console.log('Toggle audio playback - current state:', isAudioPlaying);

    try {
      if (isAudioPlaying) {
        console.log('Pausing audio...');
        audio.pause();
      } else {
        console.log('Playing audio...');
        // Reset audio if it has ended
        if (audio.ended) {
          audio.currentTime = 0;
          setAudioProgress(0);
          setAudioCompleted(false);
        }
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
      setIsAudioPlaying(false);
      
      // Try to handle autoplay policy issues
      if (error.name === 'NotAllowedError') {
        alert('Please click the play button to start audio. Browser requires user interaction to play audio.');
      }
    }
  };

  // Reset audio states when switching consent methods
  useEffect(() => {
    if (consentMethod === 'text') {
      // Pause and reset audio when switching to text
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setIsAudioPlaying(false);
      setAudioProgress(0);
      setAudioCompleted(false);
      setShowAudioError(false);
      setAudioLoaded(false);
    }
  }, [consentMethod]);

  // Debug logging
  console.log('ConsentForm render - currentLanguage:', currentLanguage);
  console.log('ConsentForm - consentFormTitle:', getTranslation(currentLanguage, 'consentFormTitle'));
  console.log('ConsentForm - studyTitle:', getTranslation(currentLanguage, 'studyTitle'));

  const handleConsent = () => {
    if (accepted) {
      // For audio consent method, check if audio has been completed
      if (consentMethod === 'audio' && needsAudioConsent && !audioCompleted) {
        setShowAudioError(true);
        return;
      }
      onAccept(); // Let the parent component handle the next step
    }
  };

  const handleDecline = () => {
    setDeclined(true);
  };

  if (declined) {
    return (
      <motion.div
        key={`consent-declined-${currentLanguage}`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card sx={{ maxWidth: 600, mx: 'auto', p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            {getTranslation(currentLanguage, 'thankYouResponse')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            {getTranslation(currentLanguage, 'takeYourTime')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/')}
          >
            {getTranslation(currentLanguage, 'returnToHome')}
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={`consent-form-${currentLanguage}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
        {/* Debug Info */}
        {/* <Box sx={{ mb: 2, p: 2, backgroundColor: '#f0f0f0', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Debug: Language = {currentLanguage} | Title = "{getTranslation(currentLanguage, 'consentFormTitle')}"
          </Typography>
        </Box> */}
        
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'consentFormTitle')}
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', whiteSpace: 'pre-line' }}>
          {getTranslation(currentLanguage, 'studyTitle')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {currentLanguage === 'hi' ? 'मुख्य शोधकर्ता:' : currentLanguage === 'kn' ? 'ಮುಖ್ಯ ತನಿಖಾಧಿಕಾರಿ:' : 'Principal Investigator:'}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
          {getTranslation(currentLanguage, 'principalInvestigator')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'purposeOfStudy')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {getTranslation(currentLanguage, 'studyPurposeContent')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'studyProcedures')}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'procedure1')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'procedure2')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'procedure3')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'procedure4')}
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'duration')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {getTranslation(currentLanguage, 'studyDurationContent')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'voluntaryParticipation')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {getTranslation(currentLanguage, 'voluntaryParticipationContent')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'risksAndDiscomforts')}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'risk1')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'risk2')}
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'benefits')}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'benefit1')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'benefit2')}
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'confidentiality')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {getTranslation(currentLanguage, 'confidentialityContent')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'compensation')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {getTranslation(currentLanguage, 'compensationContent')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'contactInformation')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
          {getTranslation(currentLanguage, 'contactText')}
        </Typography>

        {/* Consent Method Selection - Only for Hindi and Kannada */}
        {needsAudioConsent && (
          <Box sx={{ mb: 4 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.1rem' }}>
                {getTranslation(currentLanguage, 'chooseConsentMethod')}
              </FormLabel>
              <RadioGroup
                value={consentMethod}
                onChange={(e) => {
                  setConsentMethod(e.target.value);
                  setAccepted(false); // Reset acceptance when method changes
                  setShowAudioError(false);
                  // Pause audio if switching away from audio method
                  if (e.target.value !== 'audio' && audioRef.current) {
                    audioRef.current.pause();
                    setIsAudioPlaying(false);
                  }
                }}
                sx={{ gap: 1 }}
              >
                <FormControlLabel 
                  value="text" 
                  control={<Radio />} 
                  label={getTranslation(currentLanguage, 'textConsentOption')}
                />
                <FormControlLabel 
                  value="audio" 
                  control={<Radio />} 
                  label={getTranslation(currentLanguage, 'audioConsentOption')}
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {/* Text Consent Section */}
        {(!needsAudioConsent || consentMethod === 'text') && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
              {getTranslation(currentLanguage, 'consentDeclaration')}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line', p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
              {getTranslation(currentLanguage, 'consentText')}
            </Typography>
          </Box>
        )}

        {/* Audio Consent Section - Only shown when audio method is selected */}
        {needsAudioConsent && consentMethod === 'audio' && (
          <Box sx={{ mb: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <FaVolumeUp style={{ marginRight: '8px' }} />
              {getTranslation(currentLanguage, 'audioConsentTitle')}
            </Typography>
            
            {/* Audio Player */}
            <Box sx={{ mb: 2 }}>
              <audio
                ref={audioRef}
                src={getAudioPath()}
                preload="auto"
                style={{ display: 'none' }}
                onLoadedMetadata={() => setAudioLoaded(true)}
                onCanPlay={() => setAudioLoaded(true)}
                onError={(e) => {
                  console.error('Audio loading error:', e);
                  setAudioLoaded(false);
                }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <IconButton
                  onClick={toggleAudioPlayback}
                  color="primary"
                  size="large"
                  disabled={false}
                  sx={{ 
                    bgcolor: audioLoaded ? 'primary.main' : 'grey.400', 
                    color: 'white',
                    '&:hover': { bgcolor: audioLoaded ? 'primary.dark' : 'grey.500' },
                    '&:disabled': { bgcolor: 'grey.400', color: 'white' },
                    cursor: audioLoaded ? 'pointer' : 'not-allowed'
                  }}
                >
                  {isAudioPlaying ? <FaPause /> : <FaPlay />}
                </IconButton>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {audioLoaded 
                      ? (isAudioPlaying 
                          ? getTranslation(currentLanguage, 'pauseAudioConsent')
                          : getTranslation(currentLanguage, 'playAudioConsent'))
                      : 'Loading audio...'
                    }
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    {audioCompleted 
                      ? getTranslation(currentLanguage, 'audioConsentCompleted')
                      : `${Math.round(audioProgress || 0)}% ${getTranslation(currentLanguage, 'complete')}`
                    }
                  </Typography>
                </Box>
              </Box>
              
              {/* Progress Bar */}
              <Box sx={{ width: '100%', mb: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={audioProgress || 0} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: audioCompleted ? 'success.main' : 'primary.main'
                    }
                  }}
                />
              </Box>
              
              {/* Audio Status */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {audioCompleted ? '✅ ' : '🎵 '}
                  {audioCompleted 
                    ? getTranslation(currentLanguage, 'audioConsentCompleted')
                    : isAudioPlaying 
                      ? 'Playing...' 
                      : audioProgress > 0 
                        ? 'Paused' 
                        : 'Ready to play'
                  }
                </Typography>
                
                <Typography variant="caption" color="text.secondary">
                  {Math.round(audioProgress || 0)}%
                </Typography>
              </Box>
            </Box>

            {/* Audio Validation Error */}
            {showAudioError && (
              <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setShowAudioError(false)}>
                {getTranslation(currentLanguage, 'audioConsentNotCompleted')}
              </Alert>
            )}
          </Box>
        )}

        {/* Consent Checkbox */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                disabled={needsAudioConsent && consentMethod === 'audio' && !audioCompleted}
              />
            }
            label={
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {needsAudioConsent && consentMethod === 'audio'
                  ? getTranslation(currentLanguage, 'audioConsentLabel')
                  : getTranslation(currentLanguage, 'agreeToParticipate')
                }
              </Typography>
            }
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleDecline}
          >
            {getTranslation(currentLanguage, 'decline')}
          </Button>
          <Button
            variant="contained"
            disabled={!accepted}
            onClick={handleConsent}
          >
            {getTranslation(currentLanguage, 'acceptAndContinue')}
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

export default ConsentForm;
