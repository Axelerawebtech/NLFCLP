import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FaQrcode,
  FaHeart,
  FaUserMd,
  FaUsers,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import QRCode from 'react-qr-code';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import LanguageSelector from '../components/LanguageSelector';
import { useRouter } from 'next/router';

export default function Home() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage } = useLanguage();
  const [showQR, setShowQR] = useState(false);
  const router = useRouter();

  const qrValue = `${typeof window !== 'undefined' ? window.location.origin : ''}/onboarding`;

  const t = (key) => getTranslation(currentLanguage, key);

  const features = [
    {
      icon: <FaUserMd style={{ fontSize: '3rem', color: '#2563eb' }} />,
      title: t('expertCaregivers') || 'Expert Caregivers',
      description: t('expertCaregiversDesc') || 'Connect with trained caregivers who provide emotional support and guidance'
    },
    {
      icon: <FaHeart style={{ fontSize: '3rem', color: '#ef4444' }} />,
      title: t('sevenDayProgram') || '7-Day Program',
      description: t('sevenDayProgramDesc') || 'Comprehensive stress management and emotional support program'
    },
    {
      icon: <FaUsers style={{ fontSize: '3rem', color: '#10b981' }} />,
      title: t('patientSupport') || 'Patient Support',
      description: t('patientSupportDesc') || 'Personalized care and progress tracking for better outcomes'
    }
  ];

  return (
    <Box 
      component="main"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #cabe38ff 0%, #9a9e53ff 100%)',
        position: 'relative'
      }}>
      {/* Header with Controls */}
      <Box sx={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}>
        <Box sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center'
        }}>
          <LanguageSelector />
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </IconButton>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 8, pb: 4 }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography
              variant="h1"
              sx={{
                color: 'white',
                mb: 3,
                fontWeight: 800,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {t('mainTitle') || 'Cancer Care Support- Nurse-Led Family Caregiver Program (NLFCP)'}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 4,
                fontWeight: 300,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              {t('mainSubtitle') || 'Connecting patients with caregivers for emotional support and stress management'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<FaQrcode />}
                  onClick={() => setShowQR(!showQR)}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  {showQR ? 'Hide QR Code' : 'Show QR Code'}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => window.open('/admin/login', '_blank')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    mr: 2
                  }}
                >
                  {t('adminLogin') || 'Admin Login'}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{
                    backgroundColor: 'white',
                    color: '#764ba2',
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                >
                  {t('userLogin') || 'User Login'}
                </Button>
              </motion.div>
            </Box>
          </Box>
        </motion.div>

        {/* QR Code Section */}
        {showQR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box textAlign="center" sx={{ mb: 8 }}>
              <Card sx={{
                maxWidth: 400,
                mx: 'auto',
                p: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}>
                <Typography variant="h5" sx={{ mb: 3, color: '#1e293b' }}>
                  Scan to Get Started
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 3,
                  p: 2,
                  backgroundColor: 'white',
                  borderRadius: 2
                }}>
                  <QRCode value={qrValue} size={200} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Scan this QR code to begin your onboarding journey
                </Typography>
              </Card>
            </Box>
          </motion.div>
        )}

        {/* Feature Tags - Top Row */}
        <Grid container spacing={2} sx={{ mb: 4, px: 2 }}>
          <Grid item xs={6} md={4}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f0f9ff',
                  color: '#3b82f6',
                  fontSize: '1.3rem'
                }}>
                  🧠
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e40af' }}>
                  Assessment
                </Typography>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={6} md={4}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fef2f2',
                  color: '#ef4444',
                  fontSize: '1.3rem'
                }}>
                  🎥
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e40af' }}>
                  Learning Modules
                </Typography>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={6} md={4}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f0fdf4',
                  color: '#22c55e',
                  fontSize: '1.3rem'
                }}>
                  💬
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e40af' }}>
                  Nurse Chat
                </Typography>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Feature Tags - Bottom Row */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={4}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fff7ed',
                  color: '#f97316',
                  fontSize: '1.3rem'
                }}>
                  📅
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e40af' }}>
                  Reminders
                </Typography>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={6} md={4}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#faf5ff',
                  color: '#a855f7',
                  fontSize: '1.3rem'
                }}>
                  📈
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e40af' }}>
                  Progress
                </Typography>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={6} md={4}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Box
                component="a"
                href="tel:18008914416"
                onClick={(e) => {
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(
                    typeof navigator !== 'undefined' ? navigator.userAgent : ''
                  );
                  
                  if (isMobile) {
                    // Let the native mobile handling work directly
                    // The href="tel:" will work automatically
                    return true;
                  } else {
                    // Desktop handling
                    e.preventDefault();
                    const phoneNumber = '1800-89-14416';
                    alert(`Please dial: ${phoneNumber}`);
                  }
                }}
                sx={{
                  display: 'block',
                  textDecoration: 'none',
                  WebkitTapHighlightColor: 'rgba(0,0,0,0)', // Remove tap highlight on mobile
                  '&:active': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)' // Subtle feedback on tap
                  }
                }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    textTransform: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#1e40af',
                    p: 2, // Increased padding for better touch target
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderRadius: '12px',
                    boxShadow: 'none',
                    minHeight: '56px', // Ensure good touch target size
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    '&:active': {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      transform: 'scale(0.98)',
                    },
                    '@media (max-width: 600px)': {
                      p: 2.5, // Even more padding on mobile
                    },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  }
                }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  fontSize: '1.3rem'
                }}>
                  🔗
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  TELE-MANAS
                </Typography>
                <Typography variant="caption" sx={{ ml: 'auto', color: '#4b5563' }}>
                  1800-89-14416
                </Typography>
              </Button>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Box textAlign="center">
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                mb: 2,
                fontWeight: 600
              }}
            >
              {getTranslation(currentLanguage, 'readyToBegin')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 4,
                maxWidth: 500,
                mx: 'auto'
              }}
            >
              {getTranslation(currentLanguage, 'joinCommunity')}
            </Typography>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/onboarding')}
                sx={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#dc2626',
                  }
                }}
              >
                {getTranslation(currentLanguage, 'startOnboarding')}
              </Button>
            </motion.div>
          </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>
    );
}
