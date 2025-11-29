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
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Paper,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';

const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'radio', label: 'Single Choice' },
  { value: 'checkbox', label: 'Multiple Choice' },
  { value: 'select', label: 'Dropdown' },
  { value: 'scale', label: 'Scale (1-10)' },
];

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'kn', label: 'Kannada' }
];

const getLanguageLabel = (code) => SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.label || 'English';

export default function ConfigurePatientQuestionnaire() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const activeLanguageLabel = getLanguageLabel(activeLanguage);
  
  // Form state
  const [questionnaire, setQuestionnaire] = useState({
    title: '',
    description: '',
    questions: []
  });

  const [existingQuestionnaire, setExistingQuestionnaire] = useState(null);

  useEffect(() => {
    fetchExistingQuestionnaire();
  }, []);

  const fetchExistingQuestionnaire = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/questionnaire/config');
      const data = await response.json();
      
      if (data.success && data.data) {
        setExistingQuestionnaire(data.data);
        setQuestionnaire({
          title: data.data.title,
          description: data.data.description || '',
          questions: (data.data.questions || []).map((question) => ({
            ...question,
            translations: question.translations || {},
            optionTranslations: question.optionTranslations || {}
          }))
        });
      }
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      showAlert('Failed to load existing questionnaire', 'error');
    }
    setLoading(false);
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  const addQuestion = () => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: [...prev.questions, {
        questionText: '',
        translations: {},
        optionTranslations: {},
        type: 'text',
        options: [],
        required: true
      }]
    }));
  };

  const getQuestionTextForLanguage = (question) => {
    if (activeLanguage === 'en') {
      return question.questionText || '';
    }
    return (question.translations && question.translations[activeLanguage]) || '';
  };

  const getOptionsForLanguage = (question) => {
    if (activeLanguage === 'en') {
      return question.options || [];
    }
    return (question.optionTranslations && question.optionTranslations[activeLanguage]) || [];
  };

  const updateQuestion = (index, field, value) => {
    if (field === 'questionText') {
      setQuestionnaire(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => {
          if (i !== index) return q;
          const translations = { ...(q.translations || {}) };
          translations[activeLanguage] = value;
          const updated = { ...q, translations };
          if (activeLanguage === 'en') {
            updated.questionText = value;
          }
          return updated;
        })
      }));
      return;
    }

    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuestion = (index) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const addOption = (questionIndex) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== questionIndex) return q;
        if (activeLanguage === 'en') {
          return { ...q, options: [...(q.options || []), ''] };
        }
        const optionTranslations = { ...(q.optionTranslations || {}) };
        const currentOptions = optionTranslations[activeLanguage] || [];
        optionTranslations[activeLanguage] = [...currentOptions, ''];
        return { ...q, optionTranslations };
      })
    }));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== questionIndex) return q;
        if (activeLanguage === 'en') {
          return {
            ...q,
            options: (q.options || []).map((opt, j) => j === optionIndex ? value : opt)
          };
        }
        const optionTranslations = { ...(q.optionTranslations || {}) };
        const currentOptions = optionTranslations[activeLanguage] || [];
        optionTranslations[activeLanguage] = currentOptions.map((opt, j) => j === optionIndex ? value : opt);
        return {
          ...q,
          optionTranslations
        };
      })
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== questionIndex) return q;
        if (activeLanguage === 'en') {
          return {
            ...q,
            options: (q.options || []).filter((_, j) => j !== optionIndex)
          };
        }
        const optionTranslations = { ...(q.optionTranslations || {}) };
        const currentOptions = optionTranslations[activeLanguage] || [];
        optionTranslations[activeLanguage] = currentOptions.filter((_, j) => j !== optionIndex);
        return {
          ...q,
          optionTranslations
        };
      })
    }));
  };

  const handleSave = async () => {
    if (!questionnaire.title.trim()) {
      showAlert('Please enter a questionnaire title', 'error');
      return;
    }

    if (questionnaire.questions.length === 0) {
      showAlert('Please add at least one question', 'error');
      return;
    }

    // Validate questions
    for (let i = 0; i < questionnaire.questions.length; i++) {
      const question = questionnaire.questions[i];
      const currentText = activeLanguage === 'en'
        ? (question.questionText || '')
        : ((question.translations && question.translations[activeLanguage]) || '');
      if (!currentText.trim()) {
        showAlert(`Question ${i + 1} text is required for ${SUPPORTED_LANGUAGES.find(l => l.code === activeLanguage)?.label || 'selected language'}`, 'error');
        return;
      }
      
      const optionList = getOptionsForLanguage(question);

      if (['radio', 'checkbox', 'select'].includes(question.type) && optionList.length === 0) {
        showAlert(`Question ${i + 1} needs at least one option for ${SUPPORTED_LANGUAGES.find(l => l.code === activeLanguage)?.label || 'selected language'}`, 'error');
        return;
      }
    }

    setSaving(true);
    try {
      let adminId = null;
      try {
        const storedAdminData = localStorage.getItem('adminData');
        if (storedAdminData) {
          const parsed = JSON.parse(storedAdminData);
          adminId = parsed?.id || parsed?._id || parsed?.adminId || null;
        }
      } catch (parseError) {
        console.warn('Failed to parse adminData from localStorage:', parseError);
      }

      if (!adminId && !existingQuestionnaire) {
        showAlert('Unable to find admin session. Please log in again.', 'error');
        setSaving(false);
        return;
      }

      const sanitizedQuestions = questionnaire.questions.map((question, index) => {
        const translations = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
          const value = lang.code === 'en'
            ? question.questionText
            : question.translations?.[lang.code];
          if (value && value.trim() !== '') {
            acc[lang.code] = value.trim();
          }
          return acc;
        }, {});

        const optionTranslations = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
          const values = lang.code === 'en'
            ? question.options
            : question.optionTranslations?.[lang.code];
          if (Array.isArray(values) && values.length > 0) {
            const cleaned = values.map(opt => (opt || '').trim()).filter(Boolean);
            if (cleaned.length > 0) {
              acc[lang.code] = cleaned;
            }
          }
          return acc;
        }, {});

        return {
          _id: question._id,
          questionText: translations.en || '',
          translations,
          optionTranslations,
          type: question.type,
          options: optionTranslations.en || [],
          required: question.required !== false,
          order: index,
        };
      });
      
      const url = existingQuestionnaire 
        ? '/api/admin/questionnaire/config'
        : '/api/admin/questionnaire/config';
      
      const method = existingQuestionnaire ? 'PUT' : 'POST';
      
      const payload = existingQuestionnaire 
        ? { ...questionnaire, questionnaireId: existingQuestionnaire._id, questions: sanitizedQuestions }
        : { ...questionnaire, adminId, questions: sanitizedQuestions };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert(data.message, 'success');
        await fetchExistingQuestionnaire();
      } else {
        showAlert(data.message || 'Failed to save questionnaire', 'error');
      }
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      showAlert('Failed to save questionnaire', 'error');
    }
    setSaving(false);
  };

  const renderQuestionPreview = (question, index) => {
    const previewQuestionText = getQuestionTextForLanguage(question) || 'No text for selected language';
    const previewOptions = getOptionsForLanguage(question);

    return (
      <Paper key={index} sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {index + 1}. {previewQuestionText}
          {question.required && <Chip label="Required" size="small" color="primary" sx={{ ml: 1 }} />}
        </Typography>
        
        {question.type === 'text' && (
          <TextField fullWidth variant="outlined" placeholder="Short text answer..." disabled />
        )}
        
        {question.type === 'textarea' && (
          <TextField fullWidth multiline rows={3} variant="outlined" placeholder="Long text answer..." disabled />
        )}
        
        {question.type === 'radio' && (
          <Box>
            {previewOptions.length > 0 ? previewOptions.map((option, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <input type="radio" disabled style={{ marginRight: 8 }} />
                <Typography>{option}</Typography>
              </Box>
            )) : (
              <Typography color="text.secondary">No options for {activeLanguageLabel}.</Typography>
            )}
          </Box>
        )}
        
        {question.type === 'checkbox' && (
          <Box>
            {previewOptions.length > 0 ? previewOptions.map((option, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <input type="checkbox" disabled style={{ marginRight: 8 }} />
                <Typography>{option}</Typography>
              </Box>
            )) : (
              <Typography color="text.secondary">No options for {activeLanguageLabel}.</Typography>
            )}
          </Box>
        )}
        
        {question.type === 'select' && (
          <Select fullWidth disabled value="">
            <MenuItem value="">Select an option...</MenuItem>
            {previewOptions.map((option, i) => (
              <MenuItem key={i} value={option}>{option}</MenuItem>
            ))}
          </Select>
        )}
        
        {question.type === 'scale' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">1</Typography>
            <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <Button key={num} variant="outlined" size="small" disabled>
                  {num}
                </Button>
              ))}
            </Box>
            <Typography variant="body2">10</Typography>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => router.push('/admin/dashboard')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Configure Patient Questionnaire
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {SUPPORTED_LANGUAGES.map(lang => (
          <Button
            key={lang.code}
            variant={activeLanguage === lang.code ? 'contained' : 'outlined'}
            onClick={() => setActiveLanguage(lang.code)}
          >
            {lang.label}
          </Button>
        ))}
      </Box>

      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={4}>
          {/* Configuration Panel */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Questionnaire Details
                </Typography>
                
                {/* Basic Info */}
                <TextField
                  fullWidth
                  label="Questionnaire Title"
                  value={questionnaire.title}
                  onChange={(e) => setQuestionnaire(prev => ({ ...prev, title: e.target.value }))}
                  sx={{ mb: 3 }}
                />
                
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  multiline
                  rows={2}
                  value={questionnaire.description}
                  onChange={(e) => setQuestionnaire(prev => ({ ...prev, description: e.target.value }))}
                  sx={{ mb: 4 }}
                />

                {/* Questions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Questions</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addQuestion}
                  >
                    Add Question
                  </Button>
                </Box>

                {questionnaire.questions.map((question, index) => {
                  const optionsForLanguage = getOptionsForLanguage(question);
                  const questionTextValue = getQuestionTextForLanguage(question);

                  return (
                    <Paper key={index} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Question {index + 1}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => removeQuestion(index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>

                      <TextField
                        fullWidth
                        label={`Question Text (${activeLanguageLabel})`}
                        value={questionTextValue}
                        onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                        sx={{ mb: 2 }}
                      />

                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <FormLabel>Question Type</FormLabel>
                        <Select
                          value={question.type}
                          onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                        >
                          {QUESTION_TYPES.map(type => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Options for radio, checkbox, select */}
                      {['radio', 'checkbox', 'select'].includes(question.type) && (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle2">Options ({activeLanguageLabel})</Typography>
                            <Button
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => addOption(index)}
                            >
                              Add Option
                            </Button>
                          </Box>
                          
                          {optionsForLanguage.map((option, optIndex) => (
                            <Box key={optIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder={`Option ${optIndex + 1} (${activeLanguageLabel})`}
                                value={option}
                                onChange={(e) => updateOption(index, optIndex, e.target.value)}
                              />
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeOption(index, optIndex)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}

                          {optionsForLanguage.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                              No options defined for {activeLanguageLabel}. Use "Add Option" to create one.
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Paper>
                  );
                })}

                {questionnaire.questions.length === 0 && (
                  <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography>No questions added yet. Click "Add Question" to get started.</Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Actions Panel */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Actions
                </Typography>
                
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ mb: 2 }}
                >
                  {saving ? 'Saving...' : existingQuestionnaire ? 'Update Questionnaire' : 'Create Questionnaire'}
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={() => setPreviewOpen(true)}
                  disabled={questionnaire.questions.length === 0}
                >
                  Preview
                </Button>

                {existingQuestionnaire && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Current Status
                    </Typography>
                    <Chip
                      label={existingQuestionnaire.isActive ? 'Active' : 'Inactive'}
                      color={existingQuestionnaire.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Created: {new Date(existingQuestionnaire.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updated: {new Date(existingQuestionnaire.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Questionnaire Preview ({activeLanguageLabel})</DialogTitle>
        <DialogContent>
          <Typography variant="h5" sx={{ mb: 1 }}>{questionnaire.title}</Typography>
          {questionnaire.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {questionnaire.description}
            </Typography>
          )}
          
          {questionnaire.questions.map((question, index) => 
            renderQuestionPreview(question, index)
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}