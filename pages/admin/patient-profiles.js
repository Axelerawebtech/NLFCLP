import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Paper,
  Grid,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';

export default function PatientProfiles() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [questionnaire, setQuestionnaire] = useState(null);

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
    }
    setLoading(false);
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const response = await fetch(`/api/admin/patients/${patientId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedPatient(data.data.patient);
        setQuestionnaire(data.data.questionnaire);
        setDetailsOpen(true);
      } else {
        showAlert('Failed to fetch patient details', 'error');
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      showAlert('Failed to fetch patient details', 'error');
    }
  };

  const toggleQuestionnaire = async (patientId, currentStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionnaireEnabled: !currentStatus
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the patient in the list
        setPatients(prevPatients =>
          prevPatients.map(patient =>
            patient._id === patientId
              ? { ...patient, questionnaireEnabled: !currentStatus }
              : patient
          )
        );
        
        // Update selected patient if it's the same one
        if (selectedPatient && selectedPatient._id === patientId) {
          setSelectedPatient(prev => ({
            ...prev,
            questionnaireEnabled: !currentStatus
          }));
        }
        
        showAlert(data.message, 'success');
      } else {
        showAlert(data.message || 'Failed to update questionnaire status', 'error');
      }
    } catch (error) {
      console.error('Error toggling questionnaire:', error);
      showAlert('Failed to update questionnaire status', 'error');
    }
    setUpdating(false);
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  const formatAnswer = (answer) => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return String(answer);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => router.push('/admin/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Patient Profiles
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => router.push('/admin/configure-patient-questionnaire')}
          startIcon={<AssignmentIcon />}
        >
          Configure Questionnaire
        </Button>
      </Box>

      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      {/* Patients Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
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
                    <TableRow key={patient._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{patient.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {patient.patientId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {patient.age} years, {patient.gender}
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
                          <Chip
                            label={patient.assignedCaregiver.name}
                            size="small"
                            color="success"
                          />
                        ) : (
                          <Chip label="Unassigned" size="small" color="default" />
                        )}
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={patient.questionnaireEnabled || false}
                              onChange={() => toggleQuestionnaire(patient._id, patient.questionnaireEnabled)}
                              disabled={updating}
                              color="primary"
                            />
                          }
                          label={patient.questionnaireEnabled ? 'Enabled' : 'Disabled'}
                        />
                      </TableCell>
                      <TableCell>
                        {patient.lastQuestionnaireSubmission ? (
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(patient.lastQuestionnaireSubmission)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Never
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => fetchPatientDetails(patient._id)}
                            startIcon={<VisibilityIcon />}
                            sx={{ textTransform: 'none' }}
                          >
                            View Profile
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {patients.length === 0 && !loading && (
            <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              <PersonIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6">No patients found</Typography>
              <Typography>Patients will appear here once they register in the system.</Typography>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedPatient && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {selectedPatient.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Patient ID: {selectedPatient.patientId}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={selectedPatient.questionnaireEnabled ? 'Questionnaire Enabled' : 'Questionnaire Disabled'}
                  color={selectedPatient.questionnaireEnabled ? 'success' : 'default'}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Patient Information */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon />
                      Patient Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Patient ID" 
                          secondary={selectedPatient.patientId}
                          primaryTypographyProps={{ sx: { fontWeight: 600, color: 'primary.main' } }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Name" secondary={selectedPatient.name} primaryTypographyProps={{ sx: { fontWeight: 600 } }} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Phone" secondary={selectedPatient.phone} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Age" secondary={`${selectedPatient.age} years`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Gender" secondary={selectedPatient.gender} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Marital Status" secondary={selectedPatient.maritalStatus} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Education" secondary={selectedPatient.educationLevel} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Employment" secondary={selectedPatient.employmentStatus} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Location" secondary={selectedPatient.residentialArea} />
                      </ListItem>
                    </List>
                  </Box>
                </Grid>

                {/* Medical Information */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentIcon />
                      Medical Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Cancer Type" 
                          secondary={selectedPatient.cancerType}
                          primaryTypographyProps={{ sx: { fontWeight: 600 } }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Cancer Stage" secondary={selectedPatient.cancerStage} />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Treatment Modality" 
                          secondary={Array.isArray(selectedPatient.treatmentModality) 
                            ? selectedPatient.treatmentModality.join(', ')
                            : selectedPatient.treatmentModality
                          } 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Illness Duration" secondary={selectedPatient.illnessDuration} />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Comorbidities" 
                          secondary={Array.isArray(selectedPatient.comorbidities)
                            ? selectedPatient.comorbidities.join(', ')
                            : selectedPatient.comorbidities
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Health Insurance" secondary={selectedPatient.healthInsurance} />
                      </ListItem>
                    </List>
                  </Box>
                </Grid>

                {/* Questionnaire Answers */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Questionnaire Responses
                      </Typography>
                      {selectedPatient.lastQuestionnaireSubmission && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Last submitted: {formatDate(selectedPatient.lastQuestionnaireSubmission)}
                        </Typography>
                      )}
                    </Box>
                    {selectedPatient.questionnaireAnswers && selectedPatient.questionnaireAnswers.length > 0 && (
                      <Chip
                        label={`${selectedPatient.questionnaireAnswers.length} Responses`}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  {selectedPatient.questionnaireAnswers && selectedPatient.questionnaireAnswers.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead sx={{ bgcolor: 'primary.light' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Question</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Answer</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedPatient.questionnaireAnswers.map((answer, index) => (
                            <TableRow key={answer._id || index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {answer.questionText}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={formatAnswer(answer.answer)}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(answer.submittedAt)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography color="text.secondary">
                        No questionnaire responses yet.
                        {!selectedPatient.questionnaireEnabled && ' Enable the questionnaire for this patient to start collecting responses.'}
                      </Typography>
                    </Paper>
                  )}
                </Grid>

                {/* Current Questionnaire Info */}
                {questionnaire && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>Current Active Questionnaire</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {questionnaire.title}
                      </Typography>
                      {questionnaire.description && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {questionnaire.description}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {questionnaire.questions.length} questions • Created {formatDate(questionnaire.createdAt)}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => toggleQuestionnaire(selectedPatient._id, selectedPatient.questionnaireEnabled)}
                disabled={updating}
                startIcon={selectedPatient.questionnaireEnabled ? <ToggleOffIcon /> : <ToggleOnIcon />}
              >
                {selectedPatient.questionnaireEnabled ? 'Disable' : 'Enable'} Questionnaire
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}