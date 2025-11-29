import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

export default function PatientProfiles() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/patients');
      const data = await response.json();

      if (data.success) {
        setPatients(data.data);
      } else {
        showAlert('Failed to fetch patients', 'error');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      showAlert('Failed to fetch patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionnaire = async (patientId, currentStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionnaireEnabled: !currentStatus })
      });
      const data = await response.json();

      if (data.success) {
        setPatients((prev) =>
          prev.map((patient) =>
            patient._id === patientId
              ? { ...patient, questionnaireEnabled: !currentStatus }
              : patient
          )
        );
        showAlert(data.message || 'Questionnaire status updated', 'success');
      } else {
        showAlert(data.message || 'Failed to update questionnaire status', 'error');
      }
    } catch (error) {
      console.error('Error toggling questionnaire:', error);
      showAlert('Failed to update questionnaire status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
  };

  const formatDate = (value) => {
    if (!value) return 'Never';
    return new Date(value).toLocaleString();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.push('/admin/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Patient Profiles
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<AssignmentIcon />}
          onClick={() => router.push('/admin/configure-patient-questionnaire')}
        >
          Configure Questionnaire
        </Button>
      </Box>

      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            All Patients ({patients.length})
          </Typography>

          {loading ? (
            <Typography>Loading patients...</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient Info</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Cancer Details</TableCell>
                    <TableCell>Assigned Caregiver</TableCell>
                    <TableCell>Questionnaire Status</TableCell>
                    <TableCell>Last Submission</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {patient.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {patient.patientId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {patient.age} years • {patient.gender}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{patient.phone}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {patient.residentialArea}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{patient.cancerType}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Stage: {patient.cancerStage}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {patient.assignedCaregiver ? (
                          <Chip label={patient.assignedCaregiver.name} size="small" color="success" />
                        ) : (
                          <Chip label="Unassigned" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={Boolean(patient.questionnaireEnabled)}
                              onChange={() => toggleQuestionnaire(patient._id, patient.questionnaireEnabled)}
                              disabled={updating}
                            />
                          }
                          label={patient.questionnaireEnabled ? 'Enabled' : 'Disabled'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(patient.lastQuestionnaireSubmission)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          sx={{ textTransform: 'none' }}
                          onClick={() => router.push(`/admin/patient-profile?id=${patient._id}`)}
                        >
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && patients.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary', mt: 3 }}>
              <PersonIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                No patients found
              </Typography>
              <Typography variant="body2">Patients will appear here once they register.</Typography>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}