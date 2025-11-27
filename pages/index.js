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
import Image from 'next/image';

export default function Home() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage } = useLanguage();
  const [showQR, setShowQR] = useState(false);
  const router = useRouter();

  const qrValue = `${typeof window !== 'undefined' ? window.location.origin : ''}/onboarding`;

  const t = (key) => getTranslation(currentLanguage, key);

  // Helper for card styles
  const cardStyle = {
    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 1)' : 'rgba(255, 255, 255, 1)',
      boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)'
    }
  };

  const textColor = isDarkMode ? '#f1f5f9' : '#1e40af';

  const features = [
    {
      icon: <FaUserMd style={{ fontSize: '3rem', color: isDarkMode ? '#60a5fa' : '#2563eb' }} />,
      title: t('expertCaregivers') || 'Expert Caregivers',
      description: t('expertCaregiversDesc') || 'Connect with trained caregivers who provide emotional support and guidance'
    },
    {
      icon: <FaHeart style={{ fontSize: '3rem', color: isDarkMode ? '#f87171' : '#ef4444' }} />,
      title: t('sevenDayProgram') || '7-Day Program',
      description: t('sevenDayProgramDesc') || 'Comprehensive stress management and emotional support program'
    },
    {
      icon: <FaUsers style={{ fontSize: '3rem', color: isDarkMode ? '#34d399' : '#10b981' }} />,
      title: t('patientSupport') || 'Patient Support',
      description: t('patientSupportDesc') || 'Personalized care and progress tracking for better outcomes'
    }
  ];

  return (
    <Box 
      component="main"
      sx={{
        minHeight: '100vh',
        background: isDarkMode
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #efef46ff 0%, #ffcc02ff 100%)',
        position: 'relative',
        transition: 'background 0.3s ease'
      }}>
      {/* Corner Logos */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <Image
          src="/images/logo-1-nlfcp.png"
          alt="Logo 1"
          width={120}
          height={100}
          style={{
            borderRadius: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        />
      </Box>
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <Image
          src="/images/logo-2-nlfcp.png"
          alt="Logo 2"
          width={200}
          height={100}
          style={{
            borderRadius: 0,
           
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        />
      </Box>

      {/* Header with Controls */}
      <Box sx={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        transition: 'background-color 0.3s ease'
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
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.2)',
              },
              transition: 'all 0.3s ease'
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
                color: isDarkMode ? '#f1f5f9' : 'white',
                mb: 3,
                fontWeight: 800,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                transition: 'color 0.3s ease'
              }}
            >
              {t('mainTitle') || 'Cancer Care Support- Nurse-Led Family Caregiver Program (NLFCP)'}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: isDarkMode ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                mb: 4,
                fontWeight: 300,
                maxWidth: 600,
                mx: 'auto',
                transition: 'color 0.3s ease'
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
                    backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    backdropFilter: 'blur(10px)',
                    border: isDarkMode ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {showQR ? t('hideQRCode') : t('showQRCode')}
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
                    borderColor: isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: isDarkMode ? '#60a5fa' : 'white',
                      backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    },
                    mr: 2,
                    transition: 'all 0.3s ease'
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
                    backgroundColor: isDarkMode ? '#60a5fa' : 'white',
                    color: isDarkMode ? '#0f172a' : '#764ba2',
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: isDarkMode ? '#3b82f6' : 'rgba(255, 255, 255, 0.9)',
                    },
                    transition: 'all 0.3s ease'
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
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                <Typography variant="h5" sx={{ mb: 3, color: isDarkMode ? '#f1f5f9' : '#1e293b', transition: 'color 0.3s ease' }}>
                  {t('scanToGetStarted')}
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
                  {t('scanQRCode')}
                </Typography>
              </Card>
            </Box>
          </motion.div>
        )}

        {/* Feature Tags - Top Row */}
        <Grid container spacing={2} sx={{ mb: 0, px: 2 }}>
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
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',

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
                  color: isDarkMode ? '#60a5fa' : '#3b82f6',
                  fontSize: '1.3rem',
                  transition: 'all 0.3s ease'
                }}>
                  🧠
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isDarkMode ? '#60a5fa' : '#1e40af', transition: 'color 0.3s ease' }}>
                  {t('assessment')}
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
                ...cardStyle,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                borderRadius: '12px',
                cursor: 'pointer',
                  transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',

                },
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f0fdf4',
                  color: isDarkMode ? '#f87171' : '#ef4444',
                  fontSize: '1.3rem',
                  transition: 'all 0.3s ease'
                }}>
                  🎥
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isDarkMode ? '#60a5fa' : '#1e40af', transition: 'color 0.3s ease'}}>
                  {t('learningModules')}
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
                
                borderRadius: '12px',
                cursor: 'pointer',
                  transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',

                },
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
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
                  {t('nurseChat')}
                </Typography>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* BG image between Learning Modules and Progress cards */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, width: '100%' }}>
          <Box sx={{ width: { xs: '90%', sm: 400, md: 500 }, maxWidth: '100%' }}>
            <Image
              src="/images/bg.png"
              alt="Background"
              width={500}
              height={100}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 16,
                objectFit: 'cover',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              }}
              priority
            />
          </Box>
        </Box>

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
                
                borderRadius: '12px',
               cursor: 'pointer',
                  transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',

                },
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
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
                  {t('reminders')}
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
                
                borderRadius: '12px',
               cursor: 'pointer',
                  transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',

                },
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
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
                  {t('progress')}
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
                  border:1,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',

                },
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
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
                  {t('teleManas')}
                </Typography>
                <Typography variant="caption" sx={{ ml: 'auto', color: '#b1b3b6ff' }}>
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
                  backgroundColor: '#f46f0aff',
                  color: 'white',
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#eddc9fff',
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
