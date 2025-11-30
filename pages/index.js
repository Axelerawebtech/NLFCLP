import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
  IconButton,
  Stack,
  Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaQrcode,
  FaSun,
  FaMoon,
  FaShieldAlt,
  FaChartLine,
  FaVideo,
  FaPhoneAlt
} from 'react-icons/fa';
import QRCode from 'react-qr-code';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import LanguageSelector from '../components/LanguageSelector';
import { useRouter } from 'next/router';
import Image from 'next/image';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const fadeSlide = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage } = useLanguage();
  const [showQR, setShowQR] = useState(false);
  const router = useRouter();

  const qrValue = `${typeof window !== 'undefined' ? window.location.origin : ''}/onboarding`;

  const t = (key) => getTranslation(currentLanguage, key);

  const teleManasNumber = '18008914416';
  const teleManasHref = `tel:${teleManasNumber}`;

  const impactStats = [
    { label: t('caregiversHelped') || 'Caregivers Supported', value: '2,100+', trend: '+32%' },
    { label: t('dailyAssessments') || 'Daily Assessments', value: '18k', trend: '+18%' },
    { label: t('videoSessions') || 'Video Guidance Minutes', value: '45k', trend: '+24%' }
  ];

  const journeySteps = [
    { title: t('stepOneTitle') || 'Enroll & personalize', copy: t('stepOneCopy') || 'Answer focused questions so we can tailor the program to your needs.' },
    { title: t('stepTwoTitle') || 'Daily learning modules', copy: t('stepTwoCopy') || 'Digestible guidance, coping strategies, and reminders—all in one place.' },
    { title: t('stepThreeTitle') || 'Track & celebrate progress', copy: t('stepThreeCopy') || 'Follow caregiver wellbeing improvements and stay connected with clinical experts.' }
  ];

  const journeyCardBackgrounds = isDarkMode
    ? ['linear-gradient(135deg, #0f172a, #1e293b)', 'linear-gradient(135deg, #111827, #1f2937)', 'linear-gradient(135deg, #0b1120, #1e1b4b)']
    : ['linear-gradient(135deg, #fff7e0, #ffd89c)', 'linear-gradient(135deg, #ecfeff, #c6f6ff)', 'linear-gradient(135deg, #ede9fe, #c7d2fe)'];

  const supportPillars = [
    {
      icon: <FaShieldAlt size={20} />,
      label: t('secureCare') || 'Secure by design',
      helper: 'Enterprise-grade encryption & compliance',
      onClick: () => router.push('/login')
    },
    {
      icon: <FaChartLine size={20} />,
      label: t('insightfulMetrics') || 'Insightful dashboards',
      helper: 'Real-time caregiver progress tracking',
      onClick: () => router.push('/login')
    },
    {
      icon: <FaVideo size={20} />,
      label: t('guidedVideos') || 'Guided video library',
      helper: 'Daily bite-sized expert coaching',
      onClick: () => router.push('/login')
    },
    {
      icon: <FaPhoneAlt size={20} />,
      label: 'Tele MANAS helpline',
      helper: `Tap to call ${teleManasNumber}`,
      href: teleManasHref
    }
  ];

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        background: isDarkMode
          ? 'radial-gradient(circle at top, #1e293b 0%, #0f172a 60%, #0b1120 100%)'
          : 'radial-gradient(circle at top, #fff7d1 0%, #ffe076 45%, #ffc83a 100%)',
        transition: 'background 0.4s ease',
        position: 'relative'
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, opacity: isDarkMode ? 0.15 : 0.25, pointerEvents: 'none' }}>
        <Image src={isDarkMode ? '/images/texture-dark.png' : '/images/texture-light.png'} alt="Background texture" fill style={{ objectFit: 'cover' }} />
      </Box>

      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Container
          maxWidth="lg"
          sx={{
            py: 2,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ flexWrap: 'wrap', flexGrow: 1, minWidth: 0 }}
          >
            <Box sx={{ position: 'relative', width: { xs: 60, sm: 70 }, height: { xs: 45, sm: 55 } }}>
              <Image src="/images/logo-1-nlfcp.png" alt="NLFCP" fill sizes="70px" style={{ objectFit: 'contain' }} />
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)', display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ position: 'relative', width: { xs: 110, sm: 140 }, height: { xs: 45, sm: 55 } }}>
              <Image src="/images/logo-2-nlfcp.png" alt="Partner" fill sizes="140px" style={{ objectFit: 'contain' }} />
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
            <LanguageSelector />
            <IconButton
              onClick={toggleTheme}
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.25)',
                color: isDarkMode ? '#f8fafc' : '#1f2937',
                backgroundColor: isDarkMode ? 'rgba(148,163,184,0.18)' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-1px)', borderColor: 'rgba(255,255,255,0.5)' }
              }}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </IconButton>
          </Stack>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 5,
          pt: { xs: 5, md: 8 },
          pb: { xs: 2.5, md: 4 }
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <MotionBox initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Typography variant="body2" sx={{ textTransform: 'uppercase', letterSpacing: 6, color: isDarkMode ? '#94a3b8' : '#6b4b00', mb: 2 }}>
                {t('heroEyebrow') || 'nurse-led family caregiver program'}
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '3.8rem' }, fontWeight: 800, lineHeight: 1.1, color: isDarkMode ? '#f8fafc' : '#1f2937', mb: 3 }}>
                {t('heroTitle') || 'Care that keeps caregivers resilient'}
              </Typography>
              <Typography variant="h6" sx={{ color: isDarkMode ? 'rgba(241,245,249,0.82)' : 'rgba(30,41,59,0.78)', mb: 4, maxWidth: 640 }}>
                {t('heroCopy') || 'Guided onboarding, daily assessments, rich video coaching, and emotional support channels built specifically for family caregivers navigating cancer journeys.'}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/login')}
                    sx={{
                      px: 4,
                      py: 1.8,
                      background: isDarkMode ? 'linear-gradient(120deg, #60a5fa, #9333ea)' : 'linear-gradient(120deg, #d97706, #f97316)',
                      boxShadow: '0 20px 30px rgba(0,0,0,0.15)',
                      fontSize: '1.05rem',
                      fontWeight: 600
                    }}
                  >
                    {t('ctaPrimary') || 'Enter caregiver/ Patient portal'}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => window.open('/admin/login', '_blank')}
                    sx={{
                      px: 4,
                      py: 1.8,
                      borderColor: isDarkMode ? 'rgba(148,163,184,0.5)' : 'rgba(30,41,59,0.4)',
                      color: isDarkMode ? '#e2e8f0' : '#1f2937',
                      fontSize: '1.05rem',
                      fontWeight: 600
                    }}
                  >
                    {t('ctaSecondary') || 'Admin command center'}
                  </Button>
                </motion.div>
              </Stack>

              <Grid container spacing={2}>
                {impactStats.map((stat, index) => (
                  <Grid key={stat.label} item xs={12} sm={4}>
                    <MotionCard
                      variants={fadeSlide}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.15 * index }}
                      sx={{
                        p: 3,
                        backgroundColor: isDarkMode ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.85)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(18px)'
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700, color: isDarkMode ? '#f8fafc' : '#1f2937' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#cbd5f5' : '#475569', mb: 1 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: isDarkMode ? '#34d399' : '#15803d', fontWeight: 600 }}>
                        {stat.trend}
                      </Typography>
                    </MotionCard>
                  </Grid>
                ))}
              </Grid>
            </MotionBox>
          </Grid>

          <Grid item xs={12} md={5}>
            <MotionCard
              variants={fadeSlide}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.7, delay: 0.2 }}
              sx={{
                p: 4,
                borderRadius: 4,
                background: isDarkMode ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(148,163,184,0.2)',
                boxShadow: '0 30px 60px rgba(15,23,42,0.25)'
              }}
            >
              <Stack spacing={3}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {t('snapshotTitle') || 'Caregiver snapshot'}
                </Typography>
                <Stack spacing={2}>
                  {supportPillars.map((pillar) => {
                    const buttonProps = pillar.href
                      ? { component: 'a', href: pillar.href }
                      : { onClick: pillar.onClick };

                    return (
                      <Button
                        key={pillar.label}
                        variant="outlined"
                        {...buttonProps}
                        fullWidth
                        sx={{
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          borderColor: 'transparent',
                          color: isDarkMode ? '#e2e8f0' : '#1f2937',
                          backgroundColor: isDarkMode ? 'rgba(96,165,250,0.08)' : 'rgba(15,23,42,0.04)',
                          borderRadius: 2,
                          py: 1.5,
                          '&:hover': {
                            borderColor: isDarkMode ? 'rgba(96,165,250,0.4)' : 'rgba(15,23,42,0.2)',
                            backgroundColor: isDarkMode ? 'rgba(96,165,250,0.18)' : 'rgba(15,23,42,0.08)'
                          }
                        }}
                      >
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isDarkMode ? 'rgba(96,165,250,0.15)' : 'rgba(15,23,42,0.08)',
                          mr: 2
                        }}>
                          {pillar.icon}
                        </Box>
                        <Box textAlign="left">
                          <Typography fontWeight={700}>{pillar.label}</Typography>
                          {pillar.helper && (
                            <Typography variant="caption" sx={{ color: isDarkMode ? '#cbd5f5' : '#475569' }}>
                              {pillar.helper}
                            </Typography>
                          )}
                        </Box>
                      </Button>
                    );
                  })}
                </Stack>

                <Divider sx={{ borderColor: 'rgba(148,163,184,0.3)' }} />

                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    onClick={() => setShowQR(true)}
                    startIcon={<FaQrcode />}
                    sx={{
                      py: 1.5,
                      backgroundColor: isDarkMode ? 'rgba(96,165,250,0.18)' : 'rgba(15,23,42,0.08)',
                      borderRadius: 2,
                      color: isDarkMode ? '#e2e8f0' : '#1f2937'
                    }}
                  >
                    {t('getOnboardLink') || 'Get onboarding link'}
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => router.push('/onboarding')}
                    variant="contained"
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    {t('startNow') || 'Start now'}
                  </Button>
                </Stack>

                <AnimatePresence>
                  {showQR && (
                    <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} style={{ display: 'flex', justifyContent: 'center' }}>
                      <Box sx={{ p: 2, borderRadius: 3, backgroundColor: isDarkMode ? '#0b1120' : '#fff', border: '1px solid rgba(148,163,184,0.4)' }}>
                        <QRCode value={qrValue} size={200} />
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Stack>
            </MotionCard>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: { xs: 8, md: 12 } }}>
          {journeySteps.map((step, idx) => (
            <Grid key={step.title} item xs={12} md={4}>
              <MotionCard
                variants={fadeSlide}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: idx * 0.1 }}
                sx={{
                  p: 3,
                  minHeight: 220,
                  borderRadius: 3,
                  background: journeyCardBackgrounds[idx],
                  border: '1px solid rgba(148,163,184,0.2)'
                }}
              >
                <Typography variant="overline" sx={{ letterSpacing: 3 }}>{`0${idx + 1}`}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {step.title}
                </Typography>
                <Typography variant="body1" sx={{ color: isDarkMode ? '#cbd5f5' : '#475569' }}>
                  {step.copy}
                </Typography>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        <MotionCard
          variants={fadeSlide}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{
            mt: { xs: 3, md: 4 },
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            textAlign: 'center',
            background: isDarkMode ? 'linear-gradient(130deg, rgba(14,116,144,0.9), rgba(15,23,42,0.95))' : 'linear-gradient(130deg, rgba(245,158,11,0.9), rgba(251,191,36,0.95))'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 2 }}>
            {t('ctaBannerTitle') || 'Give caregivers the clarity they deserve.'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 640, mx: 'auto', mb: 4 }}>
            {t('ctaBannerCopy') || 'This platform orchestrates structured onboarding, multilingual education, and expert phone support so every family feels guided.'}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button size="large" variant="contained" color="secondary" onClick={() => router.push('/onboarding')} sx={{ px: 5 }}>
              {t('ctaBannerPrimary') || 'Launch onboarding'}
            </Button>
            <Button size="large" variant="outlined" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} sx={{ px: 5, color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>
              {t('ctaBannerSecondary') || 'Explore modules'}
            </Button>
          </Stack>
        </MotionCard>
      </Container>
    </Box>
  );
}
