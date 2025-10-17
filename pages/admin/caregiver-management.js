import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import { FaUser, FaEye, FaUnlock, FaLock, FaChartLine } from 'react-icons/fa';

export default function AdminCaregiverManagement() {
  const [caregivers, setCaregivers] = useState([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    try {
      const response = await fetch('/api/admin/caregivers-overview');
      const data = await response.json();

      if (response.ok) {
        setCaregivers(data.caregivers);
      } else {
        setError(data.error || 'Failed to load caregivers');
      }
    } catch (error) {
      console.error('Fetch caregivers error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (caregiverId, day, currentPermission) => {
    try {
      const response = await fetch('/api/admin/toggle-day-permission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId,
          day,
          permission: !currentPermission
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setCaregivers(prev => prev.map(caregiver => {
          if (caregiver._id === caregiverId) {
            const updatedProgram = { ...caregiver.program };
            const dayModule = updatedProgram.dayModules.find(module => module.day === day);
            if (dayModule) {
              dayModule.adminPermissionGranted = !currentPermission;
            }
            return { ...caregiver, program: updatedProgram };
          }
          return caregiver;
        }));

        if (selectedCaregiver && selectedCaregiver._id === caregiverId) {
          const updatedCaregiver = { ...selectedCaregiver };
          const dayModule = updatedCaregiver.program.dayModules.find(module => module.day === day);
          if (dayModule) {
            dayModule.adminPermissionGranted = !currentPermission;
          }
          setSelectedCaregiver(updatedCaregiver);
        }
      } else {
        setError(data.error || 'Failed to update permission');
      }
    } catch (error) {
      console.error('Permission toggle error:', error);
      setError('Network error. Please try again.');
    }
  };

  const openCaregiverDetails = (caregiver) => {
    setSelectedCaregiver(caregiver);
    setDetailsDialog(true);
  };

  const getBurdenLevelColor = (level) => {
    switch (level) {
      case 'mild': return 'success';
      case 'moderate': return 'warning';
      case 'severe': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Typography>Loading caregivers...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Caregiver Program Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Caregiver</TableCell>
              <TableCell>Burden Level</TableCell>
              <TableCell>Current Day</TableCell>
              <TableCell>Overall Progress</TableCell>
              <TableCell>Zarit Score</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {caregivers.map((caregiver) => (
              <TableRow key={caregiver._id}>
                <TableCell>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {caregiver.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {caregiver.caregiverId}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {caregiver.program?.burdenLevel ? (
                    <Chip 
                      label={caregiver.program.burdenLevel.toUpperCase()}
                      color={getBurdenLevelColor(caregiver.program.burdenLevel)}
                      size="small"
                    />
                  ) : (
                    <Chip label="Not Assessed" color="default" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    Day {caregiver.program?.currentDay || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={caregiver.program?.overallProgress || 0}
                      sx={{ width: 100, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2">
                      {Math.round(caregiver.program?.overallProgress || 0)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {caregiver.program?.zaritBurdenAssessment?.totalScore || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FaEye />}
                    onClick={() => openCaregiverDetails(caregiver)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Caregiver Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FaUser />
            {selectedCaregiver?.name} - Program Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCaregiver && (
            <Box>
              {/* Caregiver Info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Caregiver ID</Typography>
                  <Typography variant="body1">{selectedCaregiver.caregiverId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedCaregiver.phone}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedCaregiver.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Last Active</Typography>
                  <Typography variant="body1">
                    {selectedCaregiver.program?.lastActiveAt 
                      ? new Date(selectedCaregiver.program.lastActiveAt).toLocaleDateString()
                      : 'Never'
                    }
                  </Typography>
                </Grid>
              </Grid>

              {/* Zarit Assessment Results */}
              {selectedCaregiver.program?.zaritBurdenAssessment && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Zarit Burden Assessment</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Total Score</Typography>
                      <Typography variant="h6">
                        {selectedCaregiver.program.zaritBurdenAssessment.totalScore}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Burden Level</Typography>
                      <Chip 
                        label={selectedCaregiver.program.zaritBurdenAssessment.burdenLevel.toUpperCase()}
                        color={getBurdenLevelColor(selectedCaregiver.program.zaritBurdenAssessment.burdenLevel)}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Assessment Date</Typography>
                      <Typography variant="body2">
                        {new Date(selectedCaregiver.program.zaritBurdenAssessment.completedAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Day Modules Management */}
              <Typography variant="h6" sx={{ mb: 2 }}>Day Module Permissions</Typography>
              <Grid container spacing={2}>
                {selectedCaregiver.program?.dayModules?.map((dayModule) => (
                  <Grid item xs={12} sm={6} md={4} key={dayModule.day}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        bgcolor: dayModule.progressPercentage === 100 ? 'success.light' : 'background.paper'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" fontWeight="bold">
                          Day {dayModule.day}
                        </Typography>
                        {dayModule.progressPercentage === 100 && <FaChartLine color="green" />}
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={dayModule.progressPercentage}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {dayModule.progressPercentage}% Complete
                        </Typography>
                      </Box>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={dayModule.adminPermissionGranted}
                            onChange={() => handlePermissionToggle(
                              selectedCaregiver._id, 
                              dayModule.day, 
                              dayModule.adminPermissionGranted
                            )}
                            disabled={dayModule.day === 0} // Day 0 always unlocked
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {dayModule.adminPermissionGranted ? <FaUnlock /> : <FaLock />}
                            {dayModule.adminPermissionGranted ? 'Unlocked' : 'Locked'}
                          </Box>
                        }
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Recent Activity */}
              {selectedCaregiver.program?.dailyTasks?.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
                  {selectedCaregiver.program.dailyTasks
                    .slice(-3)
                    .reverse()
                    .map((task, index) => (
                      <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2">
                          Day {task.day} - {new Date(task.completedAt).toLocaleDateString()}
                        </Typography>
                        {task.task1 !== null && (
                          <Typography variant="caption" color="text.secondary">
                            Break taken: {task.task1 ? 'Yes' : 'No'}
                          </Typography>
                        )}
                      </Box>
                    ))
                  }
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}