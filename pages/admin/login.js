import { useState, useEffect } from 'react';
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
  const [showPasswordManager, setShowPasswordManager] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const router = useRouter();

  const passwordGuidelines = [
    'Use at least 8 characters.',
    'Include at least one letter (A-Z or a-z).',
    'Include at least one number (0-9).',
    'Include at least one symbol such as ! @ # $ %.'
  ];

  useEffect(() => {
    if (showPasswordManager && !passwordForm.username && credentials.username) {
      setPasswordForm(prev => ({ ...prev, username: credentials.username }));
    }
  }, [showPasswordManager, credentials.username, passwordForm.username]);

  const validateNewPassword = (value = '') => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Za-z]/.test(value)) {
      return 'Password must include at least one letter (A-Z or a-z).';
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must include at least one number (0-9).';
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value)) {
      return 'Password must include at least one valid symbol (e.g. ! @ # $ %).';
    }
    return '';
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (field === 'newPassword') {
      setPasswordValidationMessage(validateNewPassword(value));
    }
    if (passwordStatus.type) {
      setPasswordStatus({ type: '', message: '' });
    }
  };

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

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', message: '' });

    const policyError = validateNewPassword(passwordForm.newPassword);
    if (policyError) {
      setPasswordStatus({ type: 'error', message: policyError });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    if (!passwordForm.username || !passwordForm.currentPassword) {
      setPasswordStatus({ type: 'error', message: 'Username and current password are required.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch('/api/auth/admin-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: passwordForm.username,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordStatus({ type: 'success', message: data.message || 'Password updated successfully.' });
        setCredentials(prev => ({ ...prev, username: passwordForm.username, password: '' }));
        setPasswordForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        setPasswordValidationMessage('');
      } else {
        setPasswordStatus({ type: 'error', message: data.message || 'Unable to update password.' });
      }
    } catch (err) {
      setPasswordStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setPasswordLoading(false);
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

              <Box textAlign="center" sx={{ mt: 3 }}>
                <Button
                  variant="text"
                  onClick={() => setShowPasswordManager(prev => !prev)}
                  sx={{ fontWeight: 600 }}
                >
                  {showPasswordManager ? 'Hide password tools' : 'Need to change your password?'}
                </Button>
              </Box>

              {showPasswordManager && (
                <Card sx={{ mt: 3, backgroundColor: 'rgba(37, 99, 235, 0.04)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Update Admin Password</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Your password must meet all of the following requirements:
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                      {passwordGuidelines.map(item => (
                        <Typography key={item} component="li" variant="body2">
                          {item}
                        </Typography>
                      ))}
                    </Box>

                    {passwordStatus.message && (
                      <Alert severity={passwordStatus.type === 'success' ? 'success' : 'error'} sx={{ mb: 2 }}>
                        {passwordStatus.message}
                      </Alert>
                    )}

                    <form onSubmit={handlePasswordUpdate}>
                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          label="Username"
                          variant="outlined"
                          value={passwordForm.username}
                          onChange={(e) => handlePasswordFieldChange('username', e.target.value)}
                          required
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          label="Current Password"
                          type="password"
                          variant="outlined"
                          value={passwordForm.currentPassword}
                          onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
                          required
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          label="New Password"
                          type="password"
                          variant="outlined"
                          value={passwordForm.newPassword}
                          onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                          required
                          helperText={passwordForm.newPassword ? passwordValidationMessage || 'Looks good!' : 'Enter a password that meets the listed requirements.'}
                          error={Boolean(passwordForm.newPassword && passwordValidationMessage)}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <TextField
                          fullWidth
                          label="Confirm New Password"
                          type="password"
                          variant="outlined"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                          required
                        />
                      </Box>

                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        fullWidth
                        disabled={passwordLoading}
                        sx={{ fontWeight: 600 }}
                      >
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
