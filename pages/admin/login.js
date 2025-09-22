import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FaUserShield,
  FaSun,
  FaMoon,
  FaLock,
  FaUser
} from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        router.push('/admin/dashboard');
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
                  <FaUserShield style={{
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
                  Admin Portal
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Cancer Care Support System
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

              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <FaUser style={{ marginRight: '8px', color: '#666' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
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

                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <FaLock style={{ marginRight: '8px', color: '#666' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
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
                <Typography variant="body2" color="text.secondary">
                  Secure admin access to manage users and assignments
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
