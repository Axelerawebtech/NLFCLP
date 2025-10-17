import { useState, useEffect } from 'react';

export default function BurdenAssessmentConfig() {
  const [questions, setQuestions] = useState([]);
  const [scoreRanges, setScoreRanges] = useState(null);
  const [activeTab, setActiveTab] = useState('questions');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const languages = [
    { code: 'english', label: 'English', flag: '🇬🇧' },
    { code: 'kannada', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'hindi', label: 'हिंदी', flag: '🇮🇳' }
  ];

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/burden-assessment/config');
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.config.questions || []);
        setScoreRanges(data.config.scoreRanges || getDefaultScoreRanges());
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      showMessage('error', 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
      questionText: {
        english: '',
        kannada: '',
        hindi: ''
      },
      options: [
        { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
        { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
        { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
        { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
        { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
      ],
      enabled: true
    };
    setQuestions([...questions, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const updateQuestionText = (questionId, language, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, questionText: { ...q.questionText, [language]: value } }
        : q
    ));
  };

  const updateOption = (questionId, optionIndex, field, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        if (field === 'score') {
          // Update score
          newOptions[optionIndex] = {
            ...newOptions[optionIndex],
            score: parseInt(value) || 0
          };
        } else {
          // Update option text (field is the language)
          newOptions[optionIndex] = {
            ...newOptions[optionIndex],
            optionText: {
              ...newOptions[optionIndex].optionText,
              [field]: value
            }
          };
        }
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const deleteQuestion = async (questionId) => {
    if (!confirm('⚠️ WARNING: Deleting this question will remove it in ALL languages (English, Hindi, Kannada) and will be saved immediately. Are you sure?')) {
      return;
    }

    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);

    // Auto-save after deletion
    setSaving(true);
    try {
      const response = await fetch('/api/admin/burden-assessment/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: updatedQuestions, scoreRanges })
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'Question deleted successfully!');
        fetchConfig();
      } else {
        showMessage('error', data.error || 'Failed to delete question');
        // Restore the question if save failed
        setQuestions(questions);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      showMessage('error', 'Failed to delete question');
      // Restore the question if save failed
      setQuestions(questions);
    } finally {
      setSaving(false);
    }
  };

  const updateScoreRange = (rangeName, field, value) => {
    setScoreRanges({
      ...scoreRanges,
      [rangeName]: {
        ...scoreRanges[rangeName],
        [field]: value
      }
    });
  };

  const saveConfig = async () => {
    // Validation
    if (questions.length === 0) {
      showMessage('error', 'Please add at least one question');
      return;
    }

    for (const question of questions) {
      if (!question.questionText.english.trim()) {
        showMessage('error', `Question ${question.id} must have English text`);
        return;
      }
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/burden-assessment/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, scoreRanges })
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'Configuration saved successfully!');
        fetchConfig();
      } else {
        showMessage('error', data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      showMessage('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const getDefaultScoreRanges = () => ({
    littleOrNoBurden: { min: 0, max: 20, burdenLevel: 'mild' },
    mildToModerate: { min: 21, max: 40, burdenLevel: 'mild' },
    moderateToSevere: { min: 41, max: 60, burdenLevel: 'moderate' },
    severe: { min: 61, max: 88, burdenLevel: 'severe' }
  });

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '24px'
    },
    cardHeader: {
      padding: '20px 24px',
      borderBottom: '1px solid #e5e7eb'
    },
    cardBody: {
      padding: '24px'
    },
    tabs: {
      display: 'flex',
      borderBottom: '2px solid #e5e7eb',
      marginBottom: '24px'
    },
    tab: (active) => ({
      padding: '12px 24px',
      cursor: 'pointer',
      borderBottom: active ? '3px solid #2563eb' : 'none',
      color: active ? '#2563eb' : '#6b7280',
      fontWeight: active ? '600' : '400',
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '15px',
      transition: 'all 0.2s'
    }),
    languageTabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    },
    languageTab: (active) => ({
      padding: '8px 16px',
      cursor: 'pointer',
      borderRadius: '8px',
      backgroundColor: active ? '#2563eb' : '#f3f4f6',
      color: active ? 'white' : '#374151',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    }),
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    buttonPrimary: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    buttonSuccess: {
      backgroundColor: '#16a34a',
      color: 'white'
    },
    buttonDanger: {
      backgroundColor: '#dc2626',
      color: 'white'
    },
    questionCard: {
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      transition: 'all 0.2s'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      minHeight: '80px',
      boxSizing: 'border-box',
      resize: 'vertical'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px'
    },
    message: (type) => ({
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      backgroundColor: type === 'success' ? '#d1fae5' : '#fee2e2',
      color: type === 'success' ? '#065f46' : '#991b1b',
      border: `1px solid ${type === 'success' ? '#6ee7b7' : '#fecaca'}`
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginTop: '16px'
    },
    scoreInput: {
      width: '80px',
      padding: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      textAlign: 'center'
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading configuration...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Message Banner */}
      {message.text && (
        <div style={styles.message(message.type)}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={styles.tab(activeTab === 'questions')}
          onClick={() => setActiveTab('questions')}
        >
          📝 Questions ({questions.length})
        </button>
        <button
          style={styles.tab(activeTab === 'scoring')}
          onClick={() => setActiveTab('scoring')}
        >
          🎯 Score Ranges
        </button>
      </div>

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  Burden Assessment Questions
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                  Add and configure multi-language questions with 4 options each
                </p>
              </div>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={addQuestion}
              >
                ➕ Add Question
              </button>
            </div>
          </div>

          <div style={styles.cardBody}>
            {/* Language Selector */}
            <div style={styles.languageTabs}>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  style={styles.languageTab(selectedLanguage === lang.code)}
                  onClick={() => setSelectedLanguage(lang.code)}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <p>No questions added yet. Click "Add Question" to get started.</p>
              </div>
            ) : (
              questions.map((question, qIndex) => (
                <div key={question.id} style={styles.questionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                      Question {qIndex + 1}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{ ...styles.button, padding: '6px 12px', fontSize: '12px', backgroundColor: '#f3f4f6', color: '#374151' }}
                        onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                      >
                        {expandedQuestion === question.id ? '▲ Collapse' : '▼ Expand'}
                      </button>
                      <button
                        style={{ ...styles.button, ...styles.buttonDanger, padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => deleteQuestion(question.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {expandedQuestion === question.id && (
                    <>
                      {/* Question Text */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={styles.label}>
                          Question Text ({selectedLanguage})
                        </label>
                        <textarea
                          style={styles.textarea}
                          value={question.questionText[selectedLanguage] || ''}
                          onChange={(e) => updateQuestionText(question.id, selectedLanguage, e.target.value)}
                          placeholder={`Enter question in ${selectedLanguage}`}
                        />
                      </div>

                      {/* Options */}
                      <label style={styles.label}>Options (5 required with customizable scores)</label>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', minWidth: '45px' }}>
                              Score:
                            </span>
                            <input
                              type="number"
                              value={option.score}
                              onChange={(e) => updateOption(question.id, optIndex, 'score', e.target.value)}
                              style={{
                                width: '70px',
                                padding: '8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                textAlign: 'center',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: '#3b82f6'
                              }}
                            />
                          </div>
                          <input
                            style={{ ...styles.input, flex: 1 }}
                            value={option.optionText[selectedLanguage] || ''}
                            onChange={(e) => updateOption(question.id, optIndex, selectedLanguage, e.target.value)}
                            placeholder={`Option ${optIndex + 1} (${selectedLanguage})`}
                          />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Scoring Tab */}
      {activeTab === 'scoring' && scoreRanges && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              Burden Level Score Ranges
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              Configure score ranges to determine burden levels
            </p>
          </div>

          <div style={styles.cardBody}>
            <div style={styles.grid}>
              {Object.entries(scoreRanges).map(([key, range]) => (
                <div key={key} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={styles.label}>Min Score</label>
                    <input
                      type="number"
                      style={styles.scoreInput}
                      value={range.min}
                      onChange={(e) => updateScoreRange(key, 'min', parseInt(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={styles.label}>Max Score</label>
                    <input
                      type="number"
                      style={styles.scoreInput}
                      value={range.max}
                      onChange={(e) => updateScoreRange(key, 'max', parseInt(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Video Category</label>
                    <select
                      style={styles.input}
                      value={range.burdenLevel}
                      onChange={(e) => updateScoreRange(key, 'burdenLevel', e.target.value)}
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
                <strong>Note:</strong> Each score range maps to a video category. When a caregiver completes the assessment, their total score will determine which video they see.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          style={{ ...styles.button, ...styles.buttonSuccess, fontSize: '16px', padding: '12px 32px' }}
          onClick={saveConfig}
          disabled={saving}
        >
          {saving ? '💾 Saving...' : '💾 Save Configuration'}
        </button>
      </div>
    </div>
  );
}
