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
      title: t('tenDayProgram') || '10-Day Program',
      description: t('tenDayProgramDesc') || 'Comprehensive stress management and emotional support program'
    },
    {
      icon: <FaUsers style={{ fontSize: '3rem', color: '#10b981' }} />,
      title: t('patientSupport') || 'Patient Support',
      description: t('patientSupportDesc') || 'Personalized care and progress tracking for better outcomes'
    }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      {/* Header */}
      <Box sx={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1000,
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

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <Card sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  }
                }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ mb: 2, color: '#1e293b' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
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
      </Container>
    </Box>
  );
}
