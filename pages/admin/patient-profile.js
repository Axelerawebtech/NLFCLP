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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Compare as CompareIcon,
  EventBusy as EventBusyIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon
} from '@mui/icons-material';

export default function PatientProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();

  const [patient, setPatient] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [updating, setUpdating] = useState(false);
  const [retakeSchedule, setRetakeSchedule] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  const surfaceColor = (light, dark) => (theme.palette.mode === 'dark' ? dark : light);
  const cardBorder = surfaceColor('rgba(15,23,42,0.08)', 'rgba(148,163,184,0.25)');
  const cardShadow = theme.palette.mode === 'dark'
    ? '0 24px 45px rgba(0,0,0,0.4)'
    : '0 18px 35px rgba(15,23,42,0.12)';
  const heroGradient = surfaceColor(
    'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 45%, #ffffff 100%)',
    'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0a0f24 100%)'
  );
  const cardBaseStyles = {
    borderRadius: 3,
    border: `1px solid ${cardBorder}`,
    boxShadow: cardShadow,
    backgroundColor: surfaceColor('#ffffff', '#0b1120')
  };

  useEffect(() => {
    if (!id) return;
    fetchPatientDetails(id);
  }, [id]);

  useEffect(() => {
    if (patient?.questionnaireRetakeScheduledFor) {
      setRetakeSchedule(formatDateTimeInput(patient.questionnaireRetakeScheduledFor));
    } else {
      setRetakeSchedule('');
    }
  }, [patient]);

  const fetchPatientDetails = async (patientId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/patients/${patientId}`);
      const data = await response.json();

      if (data.success) {
        setPatient(data.data.patient);
        setQuestionnaire(data.data.questionnaire || null);
      } else {
        showAlert('Failed to fetch patient details', 'error');
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      showAlert('Failed to fetch patient details', 'error');
    } finally {
      setLoading(false);
    }
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
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString();
  };

  const formatDateTimeInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const toggleQuestionnaire = async () => {
    if (!patient) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/patients/${patient._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionnaireEnabled: !patient.questionnaireEnabled })
      });
      const data = await response.json();

      if (data.success) {
        setPatient((prev) => ({
          ...prev,
          questionnaireEnabled: !prev.questionnaireEnabled
        }));
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

  const handleScheduleRetake = async () => {
    if (!patient) return;
    if (!retakeSchedule) {
      showAlert('Please select a date and time for the second assessment.', 'error');
      return;
    }

    const scheduleDate = new Date(retakeSchedule);
    if (Number.isNaN(scheduleDate.getTime())) {
      showAlert('Invalid schedule date', 'error');
      return;
    }

    setScheduling(true);
    try {
      const response = await fetch(`/api/admin/patients/${patient._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scheduleRetake',
          scheduleAt: scheduleDate.toISOString()
        })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        showAlert(data.message || 'Second assessment scheduled successfully', 'success');
        fetchPatientDetails(patient._id);
      } else {
        showAlert(data.message || 'Failed to schedule retake', 'error');
      }
    } catch (error) {
      console.error('Error scheduling retake:', error);
      showAlert('Failed to schedule retake', 'error');
    } finally {
      setScheduling(false);
    }
  };

  const handleCancelRetake = async () => {
    if (!patient) return;
    setScheduling(true);
    try {
      const response = await fetch(`/api/admin/patients/${patient._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancelRetake' })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        showAlert(data.message || 'Scheduled retake cancelled', 'success');
        fetchPatientDetails(patient._id);
      } else {
        showAlert(data.message || 'Failed to cancel retake', 'error');
      }
    } catch (error) {
      console.error('Error cancelling retake:', error);
      showAlert('Failed to cancel retake', 'error');
    } finally {
      setScheduling(false);
    }
  };

  function getComparisonRows(currentPatient) {
    if (!currentPatient?.questionnaireAttempts || currentPatient.questionnaireAttempts.length < 2) {
      return [];
    }

    const firstAttempt = currentPatient.questionnaireAttempts.find((attempt) => attempt.attemptNumber === 1);
    const secondAttempt = currentPatient.questionnaireAttempts.find((attempt) => attempt.attemptNumber === 2);

    if (!firstAttempt || !secondAttempt) return [];

    const rowsMap = new Map();

    (firstAttempt.answers || []).forEach((answer, index) => {
      const key = (answer.questionId && answer.questionId.toString()) || `${answer.questionText}-${index}-a1`;
      if (!rowsMap.has(key)) {
        rowsMap.set(key, {
          question: answer.questionText,
          first: '-',
          second: '-'
        });
      }
      rowsMap.get(key).first = formatAnswer(answer.answer);
    });

    (secondAttempt.answers || []).forEach((answer, index) => {
      const key = (answer.questionId && answer.questionId.toString()) || `${answer.questionText}-${index}-a2`;
      if (!rowsMap.has(key)) {
        rowsMap.set(key, {
          question: answer.questionText,
          first: '-',
          second: '-'
        });
      }
      rowsMap.get(key).second = formatAnswer(answer.answer);
    });

    return Array.from(rowsMap.values()).sort((a, b) => a.question.localeCompare(b.question));
  }

  const comparisonRows = patient ? getComparisonRows(patient) : [];
  const retakeStatusValue = patient?.questionnaireRetakeStatus || 'none';
  const retakeStatusMeta = {
    none: { label: 'Not scheduled', color: 'default' },
    scheduled: { label: 'Scheduled', color: 'warning' },
    open: { label: 'Open', color: 'info' },
    completed: { label: 'Completed', color: 'success' }
  }[retakeStatusValue] || { label: 'Not scheduled', color: 'default' };
  const attemptCount = patient?.questionnaireAttempts?.length || 0;
  const maxAttempts = 2;
  const canScheduleRetake = attemptCount >= 1 && attemptCount < maxAttempts;
  const quickStats = patient ? [
    {
      label: 'Assignment',
      value: patient.assignedCaregiver ? 'Paired caregiver' : 'Awaiting match',
      color: patient.assignedCaregiver ? 'success' : 'warning'
    },
    {
      label: 'Last Submission',
      value: patient.lastQuestionnaireSubmission ? formatDate(patient.lastQuestionnaireSubmission) : 'No submissions',
      color: patient.lastQuestionnaireSubmission ? 'info' : 'default'
    },
    {
      label: 'Questionnaire',
      value: patient.questionnaireEnabled ? 'Live access' : 'Disabled',
      color: patient.questionnaireEnabled ? 'success' : 'default'
    },
    {
      label: '2nd Assessment',
      value: retakeStatusMeta.label,
      color: retakeStatusMeta.color
    }
  ] : [];
  const medicalInfoRows = patient ? [
    { label: 'Cancer Type', value: patient.cancerType },
    { label: 'Cancer Stage', value: patient.cancerStage },
    {
      label: 'Treatment Modality',
      value: Array.isArray(patient.treatmentModality)
        ? patient.treatmentModality.join(', ')
        : patient.treatmentModality
    },
    { label: 'Illness Duration', value: patient.illnessDuration },
    {
      label: 'Comorbidities',
      value: Array.isArray(patient.comorbidities) ? patient.comorbidities.join(', ') : patient.comorbidities
    },
    { label: 'Health Insurance', value: patient.healthInsurance }
  ] : [];
  const contactInfoRows = patient ? [
    { label: 'Phone', value: patient.phone },
    { label: 'Location', value: patient.residentialArea },
    { label: 'Marital Status', value: patient.maritalStatus },
    { label: 'Education', value: patient.educationLevel },
    { label: 'Employment', value: patient.employmentStatus }
  ] : [];
  const caregiverInfo = patient?.assignedCaregiver
    ? [
        { label: 'Name', value: patient.assignedCaregiver.name },
        { label: 'Caregiver ID', value: patient.assignedCaregiver.caregiverId || 'N/A' },
        { label: 'Relationship', value: patient.assignedCaregiver.relationship || '—' }
      ]
    : null;
  const CompactInfoSection = ({ title, rows }) => (
    <Box sx={{ py: 1 }}>
      <Typography
        variant="h6"
        sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          borderRadius: 2,
          border: `1px solid ${cardBorder}`,
          backgroundColor: surfaceColor('#ffffff', '#020617'),
          px: 2,
          py: 1.5
        }}
      >
        {rows.map((row) => (
          <Box
            key={row.label}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              gap: 0.5,
              py: 0.75,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-of-type': {
                borderBottom: 'none',
                pb: 0
              }
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {row.label}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              {row.value || '—'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderQuestionnaireResponses = () => {
    if (!patient?.questionnaireAnswers || patient.questionnaireAnswers.length === 0) {
      return (
        <Card sx={{ ...cardBaseStyles, p: { xs: 2.5, md: 3 } }}>
          <Box sx={{ textAlign: 'center' }}>
            <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">
              No questionnaire responses yet.
              {!patient?.questionnaireEnabled && ' Enable the questionnaire for this patient to start collecting responses.'}
            </Typography>
          </Box>
        </Card>
      );
    }

    return (
      <Card sx={{ ...cardBaseStyles }}>
        <TableContainer sx={{ maxHeight: 420 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Question</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Answer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patient.questionnaireAnswers.map((answer, index) => (
                <TableRow key={answer._id || index} hover>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {answer.questionText}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 160 }}>
                    <Chip
                      label={formatAnswer(answer.answer)}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 160 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(answer.submittedAt)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Card sx={{ ...cardBaseStyles, p: { xs: 3, md: 4 }, textAlign: 'center' }}>
          <Typography>Loading patient profile...</Typography>
        </Card>
      );
    }

    if (!patient) {
      return (
        <Card sx={{ ...cardBaseStyles, p: { xs: 3, md: 4 }, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Patient not found</Typography>
          <Typography color="text.secondary">Ensure the link is correct or return to the patients list.</Typography>
        </Card>
      );
    }

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                ...cardBaseStyles,
                height: '100%',
                background: heroGradient,
                color: surfaceColor('#0f172a', '#f8fafc'),
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: { xs: 2.75, md: 3.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: surfaceColor('#312e81', '#f8fafc'), color: surfaceColor('#f8fafc', '#0f172a'), width: 72, height: 72 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>{patient.name}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Patient ID: {patient.patientId}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>{patient.age} years • {patient.gender}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {quickStats.map((stat) => (
                    <Chip
                      key={stat.label}
                      label={`${stat.label}: ${stat.value}`}
                      color={stat.color}
                      variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 600
                      }}
                    />
                  ))}
                </Box>
                <Button
                  variant="contained"
                  sx={{ mt: 3, borderRadius: 999, px: 3 }}
                  onClick={toggleQuestionnaire}
                  disabled={updating}
                  startIcon={patient.questionnaireEnabled ? <ToggleOffIcon /> : <ToggleOnIcon />}
                  color={patient.questionnaireEnabled ? 'secondary' : 'primary'}
                >
                  {patient.questionnaireEnabled ? 'Disable Questionnaire' : 'Enable Questionnaire'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <CompactInfoSection
              title={(
                <>
                  <AssignmentIcon fontSize="small" />
                  Medical Summary
                </>
              )}
              rows={medicalInfoRows}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CompactInfoSection title="Contact & Background" rows={contactInfoRows} />
          </Grid>
          <Grid item xs={12} md={6}>
            {caregiverInfo ? (
              <CompactInfoSection title="Assigned Caregiver" rows={caregiverInfo} />
            ) : (
              <Box sx={{ py: 1 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Assigned Caregiver</Typography>
                <Box
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${cardBorder}`,
                    backgroundColor: surfaceColor('#ffffff', '#020617'),
                    px: 2,
                    py: 1.5
                  }}
                >
                  <Typography color="text.secondary">No caregiver assigned.</Typography>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Questionnaire Responses</Typography>
            {patient.lastQuestionnaireSubmission && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Last submitted: {formatDate(patient.lastQuestionnaireSubmission)}
              </Typography>
            )}
          </Box>
          {patient.questionnaireAnswers && patient.questionnaireAnswers.length > 0 && (
            <Chip
              label={`${patient.questionnaireAnswers.length} Responses`}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {renderQuestionnaireResponses()}

        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>Second Assessment Scheduler</Typography>
        <Card sx={{ ...cardBaseStyles, p: { xs: 2.5, md: 3 }, mb: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Chip label={`Status: ${retakeStatusMeta.label}`} color={retakeStatusMeta.color} />
            <Chip label={`Attempts: ${attemptCount}/${maxAttempts}`} color={attemptCount >= 2 ? 'success' : 'default'} />
          </Box>

          {patient.questionnaireRetakeScheduledFor && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              Scheduled for: {formatDate(patient.questionnaireRetakeScheduledFor)}
            </Typography>
          )}
          {patient.questionnaireRetakeCompletedAt && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              Second assessment completed: {formatDate(patient.questionnaireRetakeCompletedAt)}
            </Typography>
          )}

          {canScheduleRetake ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Schedule when this patient should retake the questionnaire. They will regain access automatically at that time.
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Select date and time"
                    type="datetime-local"
                    value={retakeSchedule}
                    onChange={(e) => setRetakeSchedule(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    variant="contained"
                    startIcon={<ScheduleIcon />}
                    onClick={handleScheduleRetake}
                    disabled={scheduling || !retakeSchedule}
                  >
                    Schedule Second Assessment
                  </Button>
                </Grid>
              </Grid>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {attemptCount === 0
                ? 'The patient must complete the first assessment before scheduling a retake.'
                : 'Two assessments already recorded for this patient.'}
            </Typography>
          )}

          {patient.questionnaireRetakeStatus === 'scheduled' && (
            <Button
              variant="outlined"
              color="warning"
              onClick={handleCancelRetake}
              startIcon={<EventBusyIcon />}
              disabled={scheduling}
              sx={{ mt: 2 }}
            >
              Cancel Scheduled Retake
            </Button>
          )}

          {patient.questionnaireAttempts && patient.questionnaireAttempts.length >= 2 && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CompareIcon />}
              onClick={() => setCompareDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Compare First vs Second Attempt
            </Button>
          )}
        </Card>

        {questionnaire && (
          <Card sx={{ ...cardBaseStyles, p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Current Active Questionnaire</Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {questionnaire.title}
            </Typography>
            {questionnaire.description && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {questionnaire.description}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              {questionnaire.questions?.length || 0} questions • Created {formatDate(questionnaire.createdAt)}
            </Typography>
          </Card>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: surfaceColor('#f6f7fb', '#020617'),
        py: { xs: 3, md: 5 }
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 4
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Patient Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive view of questionnaire health, assignments, and assessments.
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin/patient-profiles')}
            variant="contained"
            color="secondary"
            sx={{ borderRadius: 999, px: 3 }}
          >
            Back to Patients
          </Button>
        </Box>

        {alert.show && (
          <Alert severity={alert.type} sx={{ mb: 3 }}>
            {alert.message}
          </Alert>
        )}

        {renderContent()}

        <Dialog
          open={compareDialogOpen}
          onClose={() => setCompareDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Compare Questionnaire Attempts</DialogTitle>
          <DialogContent dividers>
            {comparisonRows.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Attempt 1</TableCell>
                    <TableCell>Attempt 2</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparisonRows.map((row, index) => (
                    <TableRow key={`${row.question}-${index}`}>
                      <TableCell>{row.question}</TableCell>
                      <TableCell>{row.first}</TableCell>
                      <TableCell>{row.second}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary">Need at least two attempts to compare.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompareDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
