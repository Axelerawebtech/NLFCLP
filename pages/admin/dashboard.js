import { useState, useEffect } from 'react';
import {
  AppBar,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FaBell,
  FaChartBar,
  FaDownload,
  FaLink,
  FaMoon,
  FaSignOutAlt,
  FaSun,
  FaTrash,
  FaUnlink,
  FaUser,
  FaUserMd
} from 'react-icons/fa';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const theme = useTheme();
  const [caregivers, setCaregivers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null, type: null });
  const [unassignDialog, setUnassignDialog] = useState({ open: false, caregiver: null, patient: null });
  const [manualUnassignDialogOpen, setManualUnassignDialogOpen] = useState(false);
  const [manualSelectedCaregiver, setManualSelectedCaregiver] = useState('');
  const [manualSelectedPatient, setManualSelectedPatient] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [supportNotifications, setSupportNotifications] = useState({ totalPending: 0, caregivers: [] });
  const [showNotifications, setShowNotifications] = useState(false);
  const [supportReport, setSupportReport] = useState(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const router = useRouter();

  const surfaceColor = (lightColor, darkColor) => (theme.palette.mode === 'dark' ? darkColor : lightColor);
  const tileSurface = surfaceColor('#ffffff', '#0b1120');
  const tileBorder = surfaceColor('rgba(15,23,42,0.08)', 'rgba(148,163,184,0.2)');
  const tileShadow = theme.palette.mode === 'dark'
    ? '0 22px 50px rgba(0,0,0,0.45)'
    : '0 18px 35px rgba(15,23,42,0.08)';

  const formatPercentage = (numerator, denominator) => {
    if (!denominator || Number.isNaN(denominator) || denominator === 0) return '0';
    const percentage = (numerator / denominator) * 100;
    if (!Number.isFinite(percentage)) return '0';
    return Math.max(0, Math.min(100, percentage)).toFixed(0);
  };

  const fetchSupportRequests = async () => {
    try {
      const response = await fetch('/api/admin/pending-support-requests');
      if (response.ok) {
        const data = await response.json();
        setSupportNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching support requests:', error);
    }
  };

  const fetchSupportReport = async () => {
    try {
      const response = await fetch('/api/admin/support-request-report?weeks=4');
      if (response.ok) {
        const data = await response.json();
        setSupportReport(data);
      }
    } catch (error) {
      console.error('Error fetching support report:', error);
    }
  };

  const metricCards = [
    {
      label: 'Total Caregivers',
      value: stats.totalCaregivers || 0,
      icon: FaUserMd,
      background: surfaceColor('#f4f6ff', '#131a33'),
      border: surfaceColor('rgba(99,102,241,0.25)', 'rgba(99,102,241,0.35)')
    },
    {
      label: 'Total Patients',
      value: stats.totalPatients || 0,
      icon: FaUser,
      background: surfaceColor('#fff5f5', '#2d1720'),
      border: surfaceColor('rgba(248,113,113,0.25)', 'rgba(248,113,113,0.35)')
    },
    {
      label: 'Assigned Caregivers',
      value: stats.assignedCaregivers || 0,
      icon: FaLink,
      background: surfaceColor('#ecfdf5', '#082c24'),
      border: surfaceColor('rgba(16,185,129,0.25)', 'rgba(45,212,191,0.35)')
    },
    {
      label: 'Assignment Rate',
      value: `${formatPercentage(stats.assignedPatients, stats.totalPatients)}%`,
      icon: FaChartBar,
      background: surfaceColor('#fff7ed', '#2b1707'),
      border: surfaceColor('rgba(251,146,60,0.25)', 'rgba(251,146,60,0.35)')
    }
  ];

  const primaryActions = [
    {
      label: 'Configure 7-Day Program',
      emoji: '🎯',
      route: '/admin/program-config',
      background: surfaceColor('#fff4e6', '#2d1b0c')
    },
    {
      label: 'Configure Patient Questionnaire',
      emoji: '📋',
      route: '/admin/configure-patient-questionnaire',
      background: surfaceColor('#f3edff', '#1f1231')
    },
    {
      label: 'Patient Profiles',
      emoji: '👥',
      route: '/admin/patient-profiles',
      background: surfaceColor('#ecfdf5', '#0a2a1f')
    },
    {
      label: 'View Feedback Responses',
      emoji: '💬',
      route: '/admin/feedback',
      background: surfaceColor('#fef3c7', '#2a1f0a')
    }
  ];

  const exportActions = [
    { label: 'Export All Users', type: 'all', color: '#2563eb' },
    { label: 'Export Caregivers', type: 'caregivers', color: '#7c3aed' },
    { label: 'Export Patients', type: 'patients', color: '#059669' }
  ];

  const tableCardSx = {
    backdropFilter: 'blur(14px)',
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 60px rgba(0,0,0,0.45)'
      : '0 20px 50px rgba(15,23,42,0.08)'
  };

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      
      if (!adminToken || !adminData) {
        console.log('No admin credentials found, redirecting to login...');
        router.push('/admin/login');
        return;
      }
      
      // Verify token hasn't expired (basic check)
      try {
        const tokenPayload = JSON.parse(atob(adminToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenPayload.exp && tokenPayload.exp < currentTime) {
          console.log('Admin token expired, redirecting to login...');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          router.push('/admin/login');
          return;
        }
        
        setIsAuthenticated(true);
        setAuthLoading(false);
        // Only fetch users after authentication is confirmed
        fetchUsers();
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        router.push('/admin/login');
        return;
      }
    };

    checkAuth();
  }, [router]);

  // Fetch support requests on mount and set up polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchSupportRequests();
      fetchSupportReport();
      
      // Poll every 30 seconds for new support requests
      const interval = setInterval(fetchSupportRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Old useEffect that called fetchUsers - now integrated into auth check

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from admin API...');
      const response = await fetch('/api/admin/manage-users');
      const data = await response.json();
      
      console.log('Admin dashboard received data:', data);
      console.log('Number of caregivers:', data.caregivers?.length || 0);
      console.log('Number of patients:', data.patients?.length || 0);

      if (data.success) {
        setCaregivers(data.caregivers);
        setPatients(data.patients);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async () => {
    console.log('=== ASSIGNMENT DEBUG ===');
    console.log('Selected Caregiver:', selectedCaregiver);
    console.log('Selected Patient:', selectedPatient);
    console.log('Available Caregivers:', unassignedCaregivers.length);
    console.log('Available Patients:', unassignedPatients.length);
    
    if (!selectedCaregiver || !selectedPatient) {
      console.log('Validation failed: Missing selection');
      setAlert({ show: true, message: 'Please select both caregiver and patient', type: 'error' });
      return;
    }

    try {
      console.log('Sending assignment request...');
      const requestBody = {
        caregiverId: selectedCaregiver,
        patientId: selectedPatient
      };
      console.log('Request body:', requestBody);
      
      const response = await fetch('/api/admin/manage-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        console.log('Assignment successful!');
        setAlert({ show: true, message: 'Assignment successful!', type: 'success' });
        setAssignDialogOpen(false);
        setSelectedCaregiver('');
        setSelectedPatient('');
        fetchUsers(); // Refresh data
      } else {
        console.log('Assignment failed:', data.message);
        setAlert({ show: true, message: data.message || 'Assignment failed', type: 'error' });
      }
    } catch (error) {
      console.error('Assignment error:', error);
      setAlert({ show: true, message: 'Network error: ' + error.message, type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.push('/admin/login');
  };

  const handleExport = async (type) => {
    try {
      const response = await fetch(`/api/admin/export-csv?type=${type}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setAlert({ show: true, message: `${type} data exported successfully!`, type: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      setAlert({ show: true, message: 'Export failed', type: 'error' });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.user || !deleteDialog.type) return;

    try {
      const response = await fetch('/api/admin/manage-users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: deleteDialog.type === 'caregiver' ? deleteDialog.user.caregiverId : deleteDialog.user.patientId,
          userType: deleteDialog.type
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({ 
          show: true, 
          message: `${deleteDialog.type} "${deleteDialog.user.name}" deleted successfully`, 
          type: 'success' 
        });
        setDeleteDialog({ open: false, user: null, type: null });
        fetchUsers(); // Refresh data
      } else {
        setAlert({ show: true, message: data.message || 'Delete failed', type: 'error' });
      }
    } catch (error) {
      setAlert({ show: true, message: 'Network error: ' + error.message, type: 'error' });
    }
  };

  const handleUnassign = async () => {
    if (!unassignDialog.caregiver && !unassignDialog.patient) return;

    try {
      const response = await fetch('/api/admin/manage-users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId: unassignDialog.caregiver?.caregiverId,
          patientId: unassignDialog.patient?.patientId
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({ show: true, message: 'Caregiver successfully unassigned from patient', type: 'success' });
        setUnassignDialog({ open: false, caregiver: null, patient: null });
        fetchUsers();
      } else {
        setAlert({ show: true, message: data.message || 'Failed to unassign caregiver and patient', type: 'error' });
      }
    } catch (error) {
      setAlert({ show: true, message: 'Network error: ' + error.message, type: 'error' });
    }
  };

  const closeUnassignDialog = () => setUnassignDialog({ open: false, caregiver: null, patient: null });

  const closeManualUnassignDialog = () => {
    setManualUnassignDialogOpen(false);
    setManualSelectedCaregiver('');
    setManualSelectedPatient('');
  };

  const handleManualUnassign = () => {
    const caregiver = caregivers.find((c) => c.caregiverId === manualSelectedCaregiver);
    const patient = patients.find((p) => p.patientId === manualSelectedPatient);

    if (!caregiver || !patient) {
      setAlert({ show: true, message: 'Select both caregiver and patient to unassign', type: 'error' });
      return;
    }

    closeManualUnassignDialog();
    setUnassignDialog({ open: true, caregiver, patient });
  };

  const openDeleteDialog = (user, type) => {
    setDeleteDialog({ open: true, user, type });
  };

  const unassignedCaregivers = caregivers.filter(c => !c.isAssigned);
  const unassignedPatients = patients.filter(p => !p.isAssigned);
  const assignedCaregivers = caregivers.filter(c => c.isAssigned);
  const assignedPatients = patients.filter(p => p.isAssigned);
  const canAssign = unassignedCaregivers.length > 0 && unassignedPatients.length > 0;

  useEffect(() => {
    if (!manualSelectedCaregiver) {
      setManualSelectedPatient('');
      return;
    }

    const caregiver = caregivers.find((c) => c.caregiverId === manualSelectedCaregiver);
    if (!caregiver) {
      setManualSelectedPatient('');
      return;
    }

    const resolvedPatient = caregiver.assignedPatient
      || patients.find((patient) => {
        if (patient.patientId === caregiver.assignedPatientId) return true;
        const assignedCaregiver = patient.assignedCaregiver;
        return assignedCaregiver?.caregiverId === caregiver.caregiverId
          || patient.assignedCaregiverId === caregiver.caregiverId;
      });

    setManualSelectedPatient(resolvedPatient?.patientId || '');
  }, [manualSelectedCaregiver, caregivers, patients]);

  if (authLoading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>🔐 Verifying Admin Access...</Typography>
          <Typography variant="body2" color="text.secondary">Please wait while we authenticate your session</Typography>
        </div>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <Typography variant="h4">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: surfaceColor('#f6f7fb', '#020617')
      }}
    >

      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(16px)',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(2,6,23,0.85)' : 'rgba(255,255,255,0.85)',
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`
        }}
      >
        <Toolbar sx={{ py: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Admin Command Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor program health, consent, and caregiver engagement in one glance
            </Typography>
          </Box>
          <IconButton
            color="inherit"
            onClick={(e) => setShowNotifications(e.currentTarget)}
            sx={{
              mr: 2,
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.08)'}`
            }}
          >
            <Badge 
              badgeContent={supportNotifications.totalPending} 
              color="error"
              max={99}
            >
              <FaBell />
            </Badge>
          </IconButton>
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              mr: 2,
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.08)'}`
            }}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </IconButton>
          <Button
            variant="contained"
            startIcon={<FaSignOutAlt />}
            onClick={handleLogout}
            sx={{
              borderRadius: 999,
              textTransform: 'none'
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Support Request Notifications Menu */}
      <Menu
        anchorEl={showNotifications}
        open={Boolean(showNotifications)}
        onClose={() => setShowNotifications(false)}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 350,
            maxWidth: 500,
            maxHeight: 500,
            backgroundColor: tileSurface,
            border: `1px solid ${tileBorder}`,
            boxShadow: tileShadow
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${tileBorder}` }}>
          <Typography variant="h6" fontWeight={600}>
            Support Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {supportNotifications.totalPending} pending request{supportNotifications.totalPending !== 1 ? 's' : ''}
          </Typography>
        </Box>
        
        {supportNotifications.caregivers.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No pending support requests
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {supportNotifications.caregivers.map((caregiver, index) => (
              <ListItem
                key={caregiver.caregiverId}
                button
                onClick={() => {
                  router.push(`/admin/caregiver-profile?id=${caregiver.caregiverId}`);
                  setShowNotifications(false);
                }}
                sx={{
                  borderBottom: index < supportNotifications.caregivers.length - 1 ? `1px solid ${tileBorder}` : 'none',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {caregiver.caregiverName}
                      </Typography>
                      <Chip
                        label={`${caregiver.requests.length} request${caregiver.requests.length > 1 ? 's' : ''}`}
                        size="small"
                        color="warning"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {caregiver.caregiverCode}
                      </Typography>
                      {caregiver.requests.map((req, idx) => (
                        <Box key={req.id} sx={{ mt: 0.5 }}>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {req.type === 'admin-call' ? '📞' : '🩺'}
                            {' '}
                            {req.type === 'admin-call' ? 'Admin Call' : 'Nurse PI'}
                            {' • '}
                            {new Date(req.requestedAt).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                          {req.message && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                display: 'block',
                                mt: 0.25,
                                fontStyle: 'italic',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              "{req.message}"
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        
        {supportNotifications.caregivers.length > 0 && (
          <Box sx={{ p: 2, borderTop: `1px solid ${tileBorder}`, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Click on a caregiver to view their profile
            </Typography>
          </Box>
        )}
      </Menu>

      <Container maxWidth="xl" sx={{ py: 5, position: 'relative', zIndex: 1 }}>
        {alert.show && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <Alert
              severity={alert.type}
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 20px 45px rgba(0,0,0,0.35)'
                  : '0 15px 30px rgba(15,23,42,0.15)'
              }}
              onClose={() => setAlert({ ...alert, show: false })}
            >
              {alert.message}
            </Alert>
          </motion.div>
        )}

        <Box
          sx={{
            mb: 3,
            mx: 'auto',
            maxWidth: 1040,
            p: { xs: 1.5, md: 2 },
            borderRadius: 3,
            backgroundColor: tileSurface,
            border: `1px solid ${tileBorder}`,
            boxShadow: tileShadow
          }}
        >
          <Grid container spacing={2}>
            {metricCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={card.label}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card
                    sx={{
                      backgroundColor: card.background,
                      color: theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a',
                      borderRadius: 2.5,
                      overflow: 'hidden',
                      minHeight: 120,
                      border: card.border ? `1px solid ${card.border}` : `1px solid ${tileBorder}`,
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 14px 28px rgba(0,0,0,0.32)'
                        : '0 12px 22px rgba(15,23,42,0.12)'
                    }}
                  >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ letterSpacing: 1.2, textTransform: 'uppercase' }}>
                          {card.label}
                        </Typography>
                        <Icon size={24} color={theme.palette.mode === 'dark' ? 'rgba(248,250,252,0.85)' : 'rgba(15,23,42,0.65)'} />
                      </Box>
                      <Typography variant="h5" fontWeight={700}>
                        {card.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.75 }}>
                        {card.label === 'Assignment Rate' ? 'Caregivers assigned to patients' : 'Current count'}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
            })}
          </Grid>
        </Box>

        {/* Support Request Weekly Report */}
        {supportReport && (
          <Box
            sx={{
              mb: 3,
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              backgroundColor: tileSurface,
              border: `1px solid ${tileBorder}`,
              boxShadow: tileShadow
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📊 Support Request Report
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {supportReport.period} - Caregiver help-seeking activity
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowReportDialog(true)}
                sx={{ textTransform: 'none' }}
              >
                View Details
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  p: 2, 
                  backgroundColor: surfaceColor('#fef3c7', '#2d2410'),
                  border: `1px solid ${surfaceColor('#fcd34d', '#92400e')}`
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Total Requests
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                    {supportReport.summary.totalRequests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    From {supportReport.summary.uniqueCaregiversSought} caregiver{supportReport.summary.uniqueCaregiversSought !== 1 ? 's' : ''}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  p: 2, 
                  backgroundColor: surfaceColor('#dbeafe', '#1e293b'),
                  border: `1px solid ${surfaceColor('#60a5fa', '#3b82f6')}`
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    📞 Admin Calls
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                    {supportReport.summary.totalAdminCalls}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {supportReport.summary.totalRequests > 0 
                      ? Math.round((supportReport.summary.totalAdminCalls / supportReport.summary.totalRequests) * 100)
                      : 0}% of total
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  p: 2, 
                  backgroundColor: surfaceColor('#fce7f3', '#2d1b2a'),
                  border: `1px solid ${surfaceColor('#f472b6', '#ec4899')}`
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    🩺 Nurse PI Contacts
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                    {supportReport.summary.totalNursePICalls}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {supportReport.summary.totalRequests > 0 
                      ? Math.round((supportReport.summary.totalNursePICalls / supportReport.summary.totalRequests) * 100)
                      : 0}% of total
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  p: 2, 
                  backgroundColor: surfaceColor('#d1fae5', '#1b2d26'),
                  border: `1px solid ${surfaceColor('#34d399', '#10b981')}`
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Resolution Rate
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                    {supportReport.summary.totalRequests > 0 
                      ? Math.round((supportReport.summary.totalResolved / supportReport.summary.totalRequests) * 100)
                      : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {supportReport.summary.totalResolved} resolved, {supportReport.summary.totalPending} pending
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Weekly Breakdown */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Weekly Breakdown
              </Typography>
              <Grid container spacing={1.5}>
                {supportReport.weeklyData.map((week, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card sx={{ 
                      p: 1.5, 
                      backgroundColor: surfaceColor('#f9fafb', '#151921'),
                      border: `1px solid ${tileBorder}`,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 4px 12px rgba(59,130,246,0.2)'
                          : '0 4px 12px rgba(59,130,246,0.15)'
                      }
                    }}>
                      <Typography variant="caption" fontWeight={600} color="primary">
                        Week {week.weekNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {week.weekLabel}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {week.totalRequests} requests
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {week.uniqueCaregiversCount} CG{week.uniqueCaregiversCount !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip 
                          label={`📞 ${week.adminCallRequests}`} 
                          size="small" 
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                        <Chip 
                          label={`🩺 ${week.nursePIRequests}`} 
                          size="small" 
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}

        <Box
          sx={{
            mb: 3,
            p: { xs: 1.5, md: 2 },
            borderRadius: 3,
            backgroundColor: tileSurface,
            border: `1px solid ${tileBorder}`,
            boxShadow: tileShadow
          }}
        >
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5}>
            <Grid container spacing={1.5} flex={1}>
              {primaryActions.map((action) => (
                <Grid item xs={12} md={4} key={action.label}>
                  <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <Button
                      fullWidth
                      size="medium"
                      onClick={() => router.push(action.route)}
                      sx={{
                        backgroundColor: action.background,
                        color: theme.palette.mode === 'dark' ? '#fdfdfd' : '#0f172a',
                        minHeight: 58,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        justifyContent: 'flex-start',
                        px: 2.25,
                        border: `1px solid ${tileBorder}`,
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 12px 26px rgba(0,0,0,0.32)'
                          : '0 12px 22px rgba(15,23,42,0.12)',
                        '&:hover': {
                          backgroundColor: action.background,
                          opacity: 0.96
                        }
                      }}
                    >
                      <span style={{ fontSize: '1.15rem', marginRight: '0.6rem' }}>{action.emoji}</span>
                      {action.label}
                    </Button>
                  </motion.div>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: { xs: 2, md: 2.5 },
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 2,
                    backgroundColor: surfaceColor('#eef2ff', '#0f172a'),
                    border: `1px solid ${tileBorder}`
                  }}
                >
                  <Stack spacing={1.5}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="medium"
                      startIcon={<FaLink />}
                      onClick={() => setAssignDialogOpen(true)}
                      sx={{
                        borderRadius: 3,
                        py: 1.75,
                        fontSize: '0.95rem',
                        backgroundColor: surfaceColor('#e0e7ff', '#1a1b4b'),
                        color: theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a',
                        '&:hover': {
                          backgroundColor: surfaceColor('#c7d2fe', '#272063')
                        }
                      }}
                    >
                      Assign Caregiver to Patient
                    </Button>
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      {canAssign
                        ? 'Pairings ensure day modules, assessments, and follow-ups stay personalized.'
                        : 'No available caregivers or patients to pair right now. Complete registrations to unlock new assignments.'}
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="medium"
                      startIcon={<FaUnlink />}
                      onClick={() => setManualUnassignDialogOpen(true)}
                      disabled={assignedCaregivers.length === 0 || assignedPatients.length === 0}
                      sx={{ borderRadius: 3, py: 1.5, fontSize: '0.9rem' }}
                    >
                      Unassign Caregiver & Patient
                    </Button>
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            <Card
              sx={{
                flexBasis: { xs: '100%', lg: '32%' },
                borderRadius: 2.5,
                p: 2,
                backgroundColor: tileSurface,
                border: `1px solid ${tileBorder}`,
                boxShadow: tileShadow
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, letterSpacing: 1.1 }}>
                EXPORT SNAPSHOTS
              </Typography>
              <Stack spacing={1.2}>
                {exportActions.map((action) => (
                  <motion.div whileHover={{ x: 4 }} key={action.label}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<FaDownload />}
                      onClick={() => handleExport(action.type)}
                      sx={{
                        borderRadius: 999,
                        borderColor: action.color,
                        color: action.color,
                        textTransform: 'none',
                        justifyContent: 'space-between',
                        px: 2.4,
                        '&:hover': {
                          borderColor: action.color,
                          backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(15,23,42,0.6)'
                            : 'rgba(37, 99, 235, 0.08)'
                        }
                      }}
                    >
                      {action.label}
                      <Typography component="span" variant="caption" sx={{ opacity: 0.65 }}>
                        CSV
                      </Typography>
                    </Button>
                  </motion.div>
                ))}
              </Stack>
            </Card>
          </Stack>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={6}>
            <motion.div initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card sx={{ borderRadius: 3, p: 2, backgroundColor: tileSurface, ...tableCardSx }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" fontWeight={600}>
                      Caregivers
                    </Typography>
                    <Chip label={`${caregivers.length} total`} size="small" color="primary" />
                  </Box>
                  <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' }, mb: 2 }}>
                    {caregivers.map((caregiver) => (
                      <Box
                        key={`${caregiver._id}-mobile`}
                        sx={{
                          borderRadius: 2,
                          border: `1px solid ${tileBorder}`,
                          p: 2,
                          backgroundColor: surfaceColor('#fdfdfd', '#0b152d')
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          {caregiver.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {caregiver.caregiverId}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Relationship: {caregiver.relationshipToPatient || '—'}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={caregiver.consentAccepted ? 'Consented' : 'Pending'}
                            color={caregiver.consentAccepted ? 'success' : 'warning'}
                            size="small"
                          />
                          <Chip
                            label={caregiver.isAssigned ? 'Assigned' : 'Available'}
                            color={caregiver.isAssigned ? 'success' : 'info'}
                            size="small"
                          />
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ mt: 1.2, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => router.push(`/admin/caregiver-profile?id=${caregiver._id}`)}
                            sx={{ minWidth: 0, px: 1.25, py: 0.5, fontSize: '0.75rem' }}
                          >
                            View
                          </Button>
                          <IconButton color="error" size="small" onClick={() => openDeleteDialog(caregiver, 'caregiver')}>
                            <FaTrash />
                          </IconButton>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                  <TableContainer
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      maxHeight: 460,
                      overflowX: 'auto',
                      borderRadius: 2,
                      border: `1px solid ${tileBorder}`,
                      '&::-webkit-scrollbar': { height: 6 },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(100,116,139,0.4)',
                        borderRadius: 999
                      }
                    }}
                  >
                    <Table
                      size="small"
                      stickyHeader
                      aria-label="caregivers table"
                      sx={{ minWidth: 560 }}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Relationship</TableCell>
                          <TableCell>Consent</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {caregivers.map((caregiver) => (
                          <TableRow key={caregiver._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                            <TableCell>
                              <Typography variant="body1" fontWeight={600}>
                                {caregiver.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {caregiver.caregiverId}
                              </Typography>
                            </TableCell>
                            <TableCell>{caregiver.relationshipToPatient || '—'}</TableCell>
                            <TableCell>
                              <Chip
                                label={caregiver.consentAccepted ? 'Consented' : 'Pending'}
                                color={caregiver.consentAccepted ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={caregiver.isAssigned ? 'Assigned' : 'Available'}
                                color={caregiver.isAssigned ? 'success' : 'info'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="flex-end"
                                sx={{ flexWrap: 'wrap' }}
                              >
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  onClick={() => router.push(`/admin/caregiver-profile?id=${caregiver._id}`)}
                                  sx={{ minWidth: 0, px: 1.25, py: 0.5, fontSize: '0.75rem' }}
                                >
                                  View
                                </Button>
                                <IconButton color="error" size="small" onClick={() => openDeleteDialog(caregiver, 'caregiver')}>
                                  <FaTrash />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} lg={6}>
            <motion.div initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <Card sx={{ borderRadius: 3, p: 2, backgroundColor: tileSurface, ...tableCardSx }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" fontWeight={600}>
                      Patients
                    </Typography>
                    <Chip label={`${patients.length} total`} size="small" color="secondary" />
                  </Box>
                  <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' }, mb: 2 }}>
                    {patients.map((patient) => (
                      <Box
                        key={`${patient._id}-mobile`}
                        sx={{
                          borderRadius: 2,
                          border: `1px solid ${tileBorder}`,
                          p: 2,
                          backgroundColor: surfaceColor('#fdfdfd', '#0b152d')
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          {patient.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {patient.patientId}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Cancer Type: {patient.cancerType || '—'}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={patient.consentAccepted ? 'Consented' : 'Pending'}
                            color={patient.consentAccepted ? 'success' : 'warning'}
                            size="small"
                          />
                          <Chip
                            label={patient.isAssigned ? 'Assigned' : 'Waiting'}
                            color={patient.isAssigned ? 'success' : 'default'}
                            size="small"
                          />
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ mt: 1.2, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            onClick={() => router.push(`/admin/patient-profile?id=${patient._id}`)}
                            sx={{ minWidth: 0, px: 1.25, py: 0.5, fontSize: '0.75rem' }}
                          >
                            View
                          </Button>
                          <IconButton color="error" size="small" onClick={() => openDeleteDialog(patient, 'patient')}>
                            <FaTrash />
                          </IconButton>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                  <TableContainer
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      maxHeight: 460,
                      overflowX: 'auto',
                      borderRadius: 2,
                      border: `1px solid ${tileBorder}`,
                      '&::-webkit-scrollbar': { height: 6 },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(100,116,139,0.4)',
                        borderRadius: 999
                      }
                    }}
                  >
                    <Table
                      size="small"
                      stickyHeader
                      aria-label="patients table"
                      sx={{ minWidth: 560 }}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Cancer Type</TableCell>
                          <TableCell>Consent</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {patients.map((patient) => (
                          <TableRow key={patient._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                            <TableCell>
                              <Typography variant="body1" fontWeight={600}>
                                {patient.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {patient.patientId}
                              </Typography>
                            </TableCell>
                            <TableCell>{patient.cancerType || '—'}</TableCell>
                            <TableCell>
                              <Chip
                                label={patient.consentAccepted ? 'Consented' : 'Pending'}
                                color={patient.consentAccepted ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={patient.isAssigned ? 'Assigned' : 'Waiting'}
                                color={patient.isAssigned ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="flex-end"
                                sx={{ flexWrap: 'wrap' }}
                              >
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="secondary"
                                  onClick={() => router.push(`/admin/patient-profile?id=${patient._id}`)}
                                  sx={{ minWidth: 0, px: 1.25, py: 0.5, fontSize: '0.75rem' }}
                                >
                                  View
                                </Button>
                                <IconButton color="error" size="small" onClick={() => openDeleteDialog(patient, 'patient')}>
                                  <FaTrash />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Caregiver to Patient</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Caregiver</InputLabel>
              <Select
                value={selectedCaregiver}
                onChange={(e) => setSelectedCaregiver(e.target.value)}
                label="Select Caregiver"
              >
                {unassignedCaregivers.map((caregiver) => (
                  <MenuItem key={caregiver.caregiverId} value={caregiver.caregiverId}>
                    {caregiver.name} - {caregiver.relationshipToPatient || 'N/A'} (ID: {caregiver.caregiverId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Select Patient</InputLabel>
              <Select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                label="Select Patient"
              >
                {unassignedPatients.map((patient) => (
                  <MenuItem key={patient.patientId} value={patient.patientId}>
                    {patient.name} - {patient.cancerType} ({patient.cancerStage})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignment}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Unassign Dialog */}
      <Dialog open={manualUnassignDialogOpen} onClose={closeManualUnassignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Unassign Caregiver & Patient</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Caregiver</InputLabel>
              <Select
                value={manualSelectedCaregiver}
                onChange={(e) => setManualSelectedCaregiver(e.target.value)}
                label="Caregiver"
                disabled={assignedCaregivers.length === 0}
              >
                {assignedCaregivers.map((caregiver) => (
                  <MenuItem key={caregiver.caregiverId} value={caregiver.caregiverId}>
                    {caregiver.name} (ID: {caregiver.caregiverId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled sx={{ opacity: manualSelectedCaregiver ? 1 : 0.6 }}>
              <InputLabel>Patient</InputLabel>
              <Select
                value={manualSelectedPatient}
                label="Patient"
                disabled
                renderValue={(value) => {
                  if (!value) {
                    return manualSelectedCaregiver ? 'No linked patient' : 'Select a caregiver';
                  }
                  const patient = patients.find((p) => p.patientId === value);
                  return patient ? `${patient.name} (ID: ${patient.patientId})` : value;
                }}
              >
                {assignedPatients.map((patient) => (
                  <MenuItem key={patient.patientId} value={patient.patientId}>
                    {patient.name} (ID: {patient.patientId})
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {manualSelectedCaregiver
                  ? manualSelectedPatient
                    ? 'Linked patient auto-selected.'
                    : 'This caregiver is not currently linked to a patient.'
                  : 'Select a caregiver to view their linked patient.'}
              </FormHelperText>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeManualUnassignDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleManualUnassign}
            disabled={!manualSelectedCaregiver || !manualSelectedPatient}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null, type: null })}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
            color: theme.palette.text.primary
          }
        }}
      >
        <DialogTitle>
          Delete {deleteDialog.type?.charAt(0).toUpperCase() + deleteDialog.type?.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog.user?.name}</strong>?
            {deleteDialog.user?.isAssigned && (
              <><br/><br/>
              <Typography color="warning.main" component="span">
                ⚠️ This {deleteDialog.type} is currently assigned. Deleting will automatically unassign them.
              </Typography></>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, user: null, type: null })}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unassign Confirmation Dialog */}
      <Dialog
        open={unassignDialog.open}
        onClose={closeUnassignDialog}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
            color: theme.palette.text.primary
          }
        }}
      >
        <DialogTitle>Unassign Caregiver</DialogTitle>
        <DialogContent>
          <Typography>
            This action will unlink
            {unassignDialog.caregiver ? ` caregiver "${unassignDialog.caregiver.name}"` : ' the selected caregiver'}
            {unassignDialog.patient ? ` and patient "${unassignDialog.patient.name}"` : ''}.
            <br /><br />
            They will return to the available pool and any in-progress program will be paused.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUnassignDialog}>Cancel</Button>
          <Button onClick={handleUnassign} color="warning" variant="contained">
            Confirm Unassign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Support Request Report Details Dialog */}
      <Dialog
        open={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: tileSurface,
            border: `1px solid ${tileBorder}`,
            boxShadow: tileShadow
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                📊 Support Request Report
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {supportReport?.period}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const csvData = supportReport?.weeklyData.map(week => ({
                  Week: week.weekNumber,
                  Period: week.weekLabel,
                  'Total Requests': week.totalRequests,
                  'Admin Calls': week.adminCallRequests,
                  'Nurse PI': week.nursePIRequests,
                  'Caregivers': week.uniqueCaregiversCount,
                  'Resolved': week.resolvedRequests,
                  'Pending': week.pendingRequests
                }));
                
                const csvContent = [
                  Object.keys(csvData[0]).join(','),
                  ...csvData.map(row => Object.values(row).join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `support_request_report_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              }}
              startIcon={<FaDownload />}
              sx={{ textTransform: 'none' }}
            >
              Export CSV
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {supportReport && (
            <Box>
              {/* Summary Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: surfaceColor('#fef3c7', '#2d2410') }}>
                    <Typography variant="h4" fontWeight={700}>
                      {supportReport.summary.totalRequests}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Requests
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: surfaceColor('#dbeafe', '#1e293b') }}>
                    <Typography variant="h4" fontWeight={700}>
                      {supportReport.summary.uniqueCaregiversSought}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Caregivers
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: surfaceColor('#d1fae5', '#1b2d26') }}>
                    <Typography variant="h4" fontWeight={700}>
                      {supportReport.summary.totalResolved}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Resolved
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: surfaceColor('#fee2e2', '#2d1a1a') }}>
                    <Typography variant="h4" fontWeight={700}>
                      {supportReport.summary.totalPending}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pending
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Weekly Details Table */}
              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Week</TableCell>
                      <TableCell>Period</TableCell>
                      <TableCell align="center">Total</TableCell>
                      <TableCell align="center">📞 Admin</TableCell>
                      <TableCell align="center">🩺 Nurse</TableCell>
                      <TableCell align="center">Caregivers</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supportReport.weeklyData.map((week) => (
                      <TableRow key={week.weekNumber} hover>
                        <TableCell>Week {week.weekNumber}</TableCell>
                        <TableCell>{week.weekLabel}</TableCell>
                        <TableCell align="center">
                          <Chip label={week.totalRequests} size="small" color="primary" />
                        </TableCell>
                        <TableCell align="center">{week.adminCallRequests}</TableCell>
                        <TableCell align="center">{week.nursePIRequests}</TableCell>
                        <TableCell align="center">{week.uniqueCaregiversCount}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Chip 
                              label={`✓ ${week.resolvedRequests}`} 
                              size="small" 
                              color="success"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                            {week.pendingRequests > 0 && (
                              <Chip 
                                label={`⏳ ${week.pendingRequests}`} 
                                size="small" 
                                color="warning"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
