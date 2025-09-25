import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaUserMd,
  FaSun,
  FaMoon,
  FaSignInAlt
} from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'next/router';

export default function UserLogin() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [credentials, setCredentials] = useState({ userId: '', userType: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const router = useRouter();

  // Handle URL parameters for auto-filling form
  useEffect(() => {
    if (router.isReady) {
      const { userId, userType, auto } = router.query;
      
      if (userId && userType && auto === 'true') {
        setCredentials({ userId, userType });
        setIsAutoFilled(true);
      }
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userData', JSON.stringify(data.user));

        // Redirect based on user type
        if (data.user.userType === 'caregiver') {
          router.push('/caregiver/dashboard');
        } else {
          router.push('/patient/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Theme Toggle */}
      <Box sx={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1000
      }}>
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

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card sx={{
            p: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}>
            <CardContent>
              <Box textAlign="center" sx={{ mb: 4 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <FaSignInAlt style={{
                    fontSize: '4rem',
                    color: '#2563eb',
                    marginBottom: '1rem'
                  }} />
                </motion.div>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  User Login
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Access your cancer care dashboard
                </Typography>
              </Box>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                </motion.div>
              )}

              {isAutoFilled && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Welcome! Your registration was successful. Your login details have been pre-filled.
                  </Alert>
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>I am a</InputLabel>
                    <Select
                      value={credentials.userType}
                      onChange={(e) => setCredentials({ ...credentials, userType: e.target.value })}
                      label="I am a"
                      required
                      sx={isAutoFilled ? {
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(37, 99, 235, 0.05)',
                          '& fieldset': {
                            borderColor: '#2563eb',
                          }
                        }
                      } : {}}
                    >
                      <MenuItem value="caregiver">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FaUserMd style={{ marginRight: '8px' }} />
                          Caregiver
                        </Box>
                      </MenuItem>
                      <MenuItem value="patient">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FaUser style={{ marginRight: '8px' }} />
                          Patient
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    label="Your ID"
                    variant="outlined"
                    value={credentials.userId}
                    onChange={(e) => setCredentials({ ...credentials, userId: e.target.value })}
                    placeholder="Enter your unique ID (e.g., CG123... or PT456...)"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: isAutoFilled ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                        '& fieldset': {
                          borderColor: isAutoFilled ? '#2563eb' : 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#2563eb',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2563eb',
                        },
                      },
                    }}
                  />
                </Box>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1d4ed8, #5b21b6)',
                      },
                      '&:disabled': {
                        background: '#ccc',
                      }
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </motion.div>
              </form>

              <Box textAlign="center" sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Don't have an ID? Start your onboarding journey
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/onboarding')}
                  sx={{
                    borderColor: '#2563eb',
                    color: '#2563eb',
                    '&:hover': {
                      borderColor: '#1d4ed8',
                      backgroundColor: 'rgba(37, 99, 235, 0.04)',
                    }
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
