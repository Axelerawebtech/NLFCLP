import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  AppBar,
  Toolbar,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaUserMd,
  FaUser,
  FaLink,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaChartBar
} from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [caregivers, setCaregivers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/manage-users');
      const data = await response.json();

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
    if (!selectedCaregiver || !selectedPatient) {
      setAlert({ show: true, message: 'Please select both caregiver and patient', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/admin/manage-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId: selectedCaregiver,
          patientId: selectedPatient
        })
      });

      const data = await response.json();

      if (data.success) {
        setAlert({ show: true, message: 'Assignment successful!', type: 'success' });
        setAssignDialogOpen(false);
        setSelectedCaregiver('');
        setSelectedPatient('');
        fetchUsers(); // Refresh data
      } else {
        setAlert({ show: true, message: data.message, type: 'error' });
      }
    } catch (error) {
      setAlert({ show: true, message: 'Assignment failed', type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.push('/admin/login');
  };

  const unassignedCaregivers = caregivers.filter(c => !c.isAssigned);
  const unassignedPatients = patients.filter(p => !p.isAssigned);

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
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard - Cancer Care Support
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 2 }}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </IconButton>
          <Button
            color="inherit"
            startIcon={<FaSignOutAlt />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Alert */}
        {alert.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert
              severity={alert.type}
              sx={{ mb: 3 }}
              onClose={() => setAlert({ ...alert, show: false })}
            >
              {alert.message}
            </Alert>
          </motion.div>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                height: 120
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <FaUserMd style={{ fontSize: '2rem', marginBottom: '8px' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalCaregivers || 0}
                  </Typography>
                  <Typography variant="body2">Total Caregivers</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card sx={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                color: 'white',
                height: 120
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <FaUser style={{ fontSize: '2rem', marginBottom: '8px' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalPatients || 0}
                  </Typography>
                  <Typography variant="body2">Total Patients</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                height: 120
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <FaLink style={{ fontSize: '2rem', marginBottom: '8px' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.assignedCaregivers || 0}
                  </Typography>
                  <Typography variant="body2">Active Assignments</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                height: 120
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <FaChartBar style={{ fontSize: '2rem', marginBottom: '8px' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {((stats.assignedPatients / stats.totalPatients) * 100 || 0).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2">Assignment Rate</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Action Button */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<FaLink />}
              onClick={() => setAssignDialogOpen(true)}
              disabled={unassignedCaregivers.length === 0 || unassignedPatients.length === 0}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1d4ed8, #5b21b6)',
                }
              }}
            >
              Assign Caregiver to Patient
            </Button>
          </motion.div>
        </Box>

        {/* Tables */}
        <Grid container spacing={4}>
          {/* Caregivers Table */}
          <Grid item xs={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <FaUserMd style={{ marginRight: '8px' }} />
                    Caregivers
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Experience</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {caregivers.map((caregiver) => (
                          <TableRow key={caregiver._id}>
                            <TableCell>
                              <Box>
                                <Typography variant="body1" fontWeight={500}>
                                  {caregiver.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ID: {caregiver.caregiverId}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{caregiver.experience}</TableCell>
                            <TableCell>
                              <Chip
                                label={caregiver.isAssigned ? 'Assigned' : 'Available'}
                                color={caregiver.isAssigned ? 'success' : 'warning'}
                                size="small"
                              />
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

          {/* Patients Table */}
          <Grid item xs={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <FaUser style={{ marginRight: '8px' }} />
                    Patients
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Cancer Type</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {patients.map((patient) => (
                          <TableRow key={patient._id}>
                            <TableCell>
                              <Box>
                                <Typography variant="body1" fontWeight={500}>
                                  {patient.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ID: {patient.patientId}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{patient.cancerType}</TableCell>
                            <TableCell>
                              <Chip
                                label={patient.isAssigned ? 'Assigned' : 'Waiting'}
                                color={patient.isAssigned ? 'success' : 'error'}
                                size="small"
                              />
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
                    {caregiver.name} - {caregiver.experience} ({caregiver.specialization})
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
                    {patient.name} - {patient.cancerType} ({patient.stage})
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
    </Box>
  );
}
