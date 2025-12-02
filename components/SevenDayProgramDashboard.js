import { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import InlineBurdenAssessment from './InlineBurdenAssessment';
import DailyAssessment from './DailyAssessment';
import NotificationManager from './NotificationManager';
import ReminderDisplayCard from './ReminderDisplayCard';
import { getTaskDefaultTitle } from '../utils/taskMetadata';

const parseScoreValue = (entry) => {
  if (entry === null || entry === undefined) return undefined;
  if (typeof entry === 'number' && !Number.isNaN(entry)) return entry;
  if (typeof entry === 'string') {
    const trimmed = entry.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  if (typeof entry === 'object') {
    const scoreKeys = ['score', 'selectedScore', 'optionScore', 'value', 'answer'];
    for (const key of scoreKeys) {
      if (entry[key] !== undefined) {
        const nested = parseScoreValue(entry[key]);
        if (nested !== undefined) {
          return nested;
        }
      }
    }
  }
  return undefined;
};

const normalizeStoredAnswerArray = (raw) => {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw)
      .sort((a, b) => {
        const getIndex = (key) => {
          const match = String(key).match(/(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        };
        return getIndex(a[0]) - getIndex(b[0]);
      })
      .map(([, value]) => value);
  }
  return [];
};

const deriveAnswerMapFromResult = (result) => {
  if (!result) return {};
  const rawAnswers = normalizeStoredAnswerArray(result.answers || result.raw?.answers || null);
  const fallbackFromDetails = Array.isArray(result.answerDetails)
    ? result.answerDetails.map(detail => detail?.selectedScore ?? detail?.optionScore ?? detail?.score ?? detail?.option?.score ?? detail?.value)
    : [];
  const source = rawAnswers.length > 0 ? rawAnswers : fallbackFromDetails;
  const mapped = {};
  source.forEach((entry, idx) => {
    const value = parseScoreValue(entry);
    if (typeof value === 'number' && !Number.isNaN(value)) {
      mapped[idx] = value;
    }
  });
  return mapped;
};

// Reflection Prompt Slider Component
function ReflectionPromptSlider({ question }) {
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <div style={{ marginTop: '16px' }}>
      <p style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', lineHeight: '1.6', color: '#78350f' }}>
        {question}
      </p>
      
      <div style={{ padding: '20px', backgroundColor: '#fffbeb', borderRadius: '12px', border: '2px solid #fde68a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', fontWeight: '600' }}>
          <span style={{ color: '#dc2626' }}>😔 Not Well / Very Stressed</span>
          <span style={{ color: '#16a34a' }}>😊 Very Well / Not Stressed</span>
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={(e) => setSliderValue(e.target.value)}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: `linear-gradient(to right, #dc2626 0%, #fbbf24 50%, #16a34a 100%)`,
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
        />
        
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '8px 20px', 
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '2px solid #fbbf24',
            fontSize: '18px',
            fontWeight: '700',
            color: '#92400e'
          }}>
            {sliderValue}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SevenDayProgramDashboard({ caregiverId }) {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0); // Default to Day 0 for new caregivers
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [testAnswers, setTestAnswers] = useState({}); // Store test answers { questionIndex: score }
  const [submittingTest, setSubmittingTest] = useState(false);
  const [quickResponses, setQuickResponses] = useState({}); // { taskId: { qIdx: responseValue } }
  const [submittingQuick, setSubmittingQuick] = useState({});
  const [showTestReview, setShowTestReview] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [inlineToast, setInlineToast] = useState(null);
  const submissionCounterRef = useRef(0);
  const inlineToastTimeoutRef = useRef(null);
  
  // Task-specific state for different task types (using taskId as key)
  const [interactiveFieldState, setInteractiveFieldState] = useState({}); // { taskId: { problemText, solutionText } }
  const [selectedActivities, setSelectedActivities] = useState({}); // { taskId: activityIndex }
  const [selectedFeelings, setSelectedFeelings] = useState({}); // { taskId: feelingIndex }
  const [sliderValues, setSliderValues] = useState({}); // { taskId: sliderValue }

  // Map language codes: en -> english, kn -> kannada, hi -> hindi
  const getLanguageKey = () => {
    const map = { en: 'english', kn: 'kannada', hi: 'hindi' };
    return map[currentLanguage] || 'english';
  };

  // Helper to safely extract text from multi-language fields
  const getLocalizedText = (field, defaultText = '') => {
    if (!field) return defaultText;
    
    // If field is already a string, return it
    if (typeof field === 'string') return field;
    
    // If field is an object with language keys, extract the current language
    if (typeof field === 'object') {
      const langKey = getLanguageKey();
      return field[langKey] || field.english || field.kannada || field.hindi || defaultText;
    }
    
    return defaultText;
  };

  // Helper to get task icon
  const getTaskIcon = (taskType) => {
    const icons = {
      'video': '🎥',
      'motivation-message': '💪',
      'quick-assessment': '📊',
      'reminder': '⏰',
      'interactive-field': '✍️',
      'greeting-message': '👋',
      'activity-selector': '🎯',
      'calming-video': '🧘',
      'reflection-prompt': '💭',
      'feeling-check': '😊',
      'audio-message': '🔊',
      'healthcare-tip': '🏥',
      'task-checklist': '✅'
    };
    return icons[taskType] || '📄';
  };

  const normalizeTaskForDisplay = (task) => {
    if (!task || typeof task !== 'object') return task;
    const trimmedTitle = typeof task.title === 'string' ? task.title.trim() : '';
    const trimmedDescription = typeof task.description === 'string' ? task.description.trim() : '';
    return {
      ...task,
      title: trimmedTitle || getTaskDefaultTitle(task.taskType),
      description: trimmedDescription
    };
  };

  const taskSubmissionMessages = {
    'quick-assessment': 'Hang tight! We’re preparing your next coaching tip…',
    'interactive-field': 'Reflecting and tailoring your guidance…',
    'activity-selector': 'Saving your choice and loading new ideas…',
    'task-checklist': 'Marking progress and unlocking what’s next…',
    'feeling-check': 'Capturing how you feel to personalize the next step…',
    'motivation-message': 'Recording your acknowledgement…',
    'greeting-message': 'Warming up the next task for you…',
    'reflection-prompt': 'Saving your reflection and loading the next prompt…'
  };

  const getTaskSubmissionMessage = (taskType) => {
    if (!taskType) return 'Saving your task progress…';
    return taskSubmissionMessages[taskType] || 'Saving your task progress…';
  };

  const showSubmissionToast = (payload = {}) => {
    submissionCounterRef.current += 1;
    setActiveSubmission({
      icon: '✨',
      hint: 'We’re preparing your next task…',
      ...payload
    });
  };

  const hideSubmissionToast = () => {
    submissionCounterRef.current = Math.max(submissionCounterRef.current - 1, 0);
    if (submissionCounterRef.current === 0) {
      setActiveSubmission(null);
    }
  };

  const showInlineToast = ({
    icon = 'ℹ️',
    title = 'Heads up',
    message = '',
    tone = 'info',
    duration = 4200,
    actionLabel,
    onAction
  } = {}) => {
    if (!message) return;
    if (inlineToastTimeoutRef.current) {
      clearTimeout(inlineToastTimeoutRef.current);
    }
    setInlineToast({ icon, title, message, tone, actionLabel, onAction });
    inlineToastTimeoutRef.current = setTimeout(() => {
      setInlineToast(null);
      inlineToastTimeoutRef.current = null;
    }, duration);
  };

  const hideInlineToast = () => {
    if (inlineToastTimeoutRef.current) {
      clearTimeout(inlineToastTimeoutRef.current);
      inlineToastTimeoutRef.current = null;
    }
    setInlineToast(null);
  };

  const showValidationPrompt = (message, overrides = {}) => {
    showInlineToast({
      icon: '✋',
      title: 'Let’s finish this step',
      message,
      tone: 'warning',
      ...overrides
    });
  };

  const showSuccessToast = (message, overrides = {}) => {
    showInlineToast({
      icon: '✅',
      title: 'All set!',
      message,
      tone: 'success',
      ...overrides
    });
  };

  const showErrorToast = (message, overrides = {}) => {
    showInlineToast({
      icon: '⚠️',
      title: 'Something needs attention',
      message,
      tone: 'error',
      ...overrides
    });
  };

  const getToastToneStyles = (tone = 'info') => {
    const toneMap = {
      success: {
        borderColor: '#34d399',
        backgroundColor: '#ecfdf5',
        titleColor: '#065f46',
        textColor: '#064e3b'
      },
      warning: {
        borderColor: '#fbbf24',
        backgroundColor: '#fffbeb',
        titleColor: '#92400e',
        textColor: '#78350f'
      },
      error: {
        borderColor: '#f87171',
        backgroundColor: '#fef2f2',
        titleColor: '#b91c1c',
        textColor: '#7f1d1d'
      },
      info: {
        borderColor: '#93c5fd',
        backgroundColor: '#eff6ff',
        titleColor: '#1d4ed8',
        textColor: '#1e3a8a'
      }
    };
    return toneMap[tone] || toneMap.info;
  };

  // Render dynamic task based on type
  const renderDynamicTask = (task, index) => {
    const taskStyle = {
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      border: '2px solid #e5e7eb',
      marginBottom: '16px'
    };

    const taskHeader = (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div>
          <h5 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
            {getTaskIcon(task.taskType)} {getLocalizedText(task.title)}
          </h5>
          {task.description && (
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{getLocalizedText(task.description)}</p>
          )}
        </div>
      </div>
    );

    switch (task.taskType) {
      case 'video':
      case 'calming-video':
        return (
          <div key={task.taskId || index} style={{
            padding: '28px',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '2px solid #e5e7eb',
            marginBottom: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            {/* Title */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '32px' }}>{getTaskIcon(task.taskType)}</span>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827', lineHeight: '1.2' }}>
                  {task.title}
                </h3>
              </div>
              
              {/* Description */}
              {task.description && (
                <p style={{ 
                  margin: '12px 0 0 44px', 
                  fontSize: '16px', 
                  color: '#6b7280', 
                  lineHeight: '1.6',
                  paddingRight: '20px'
                }}>
                  {task.description}
                </p>
              )}
            </div>

            {/* Video Player */}
            {task.content?.videoUrl && (
              <div style={{ 
                marginTop: '20px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <VideoPlayer
                  videoUrl={task.content.videoUrl}
                  videoTitle={task.title}
                  caregiverId={caregiverId}
                  day={selectedDay}
                  onComplete={() => {
                    handleTaskResponse(task.taskId, task.taskType, {
                      responseText: 'Video watched',
                      videoUrl: task.content.videoUrl,
                      completed: true,
                      submissionMessage: 'Marking your video as complete and loading the next activity…'
                    });
                  }}
                />
              </div>
            )}
          </div>
        );

      case 'motivation-message':
      case 'greeting-message':
      case 'healthcare-tip':
        return (
          <div key={task.taskId || index} style={{
            padding: '32px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '3px solid #fbbf24',
            marginBottom: '24px',
            boxShadow: '0 10px 25px -5px rgba(251, 191, 36, 0.3), 0 8px 10px -6px rgba(251, 191, 36, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative hearts pattern background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.08,
              pointerEvents: 'none',
              background: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Title with icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '36px' }}>{getTaskIcon(task.taskType)}</span>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#92400e',
                  lineHeight: '1.2',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {task.title}
                </h3>
              </div>

              {/* Description */}
              {task.description && (
                <p style={{ 
                  margin: '0 0 20px 48px',
                  fontSize: '16px',
                  color: '#78350f',
                  lineHeight: '1.5',
                  fontStyle: 'italic',
                  opacity: 0.9
                }}>
                  {task.description}
                </p>
              )}

              {/* Message Content with decorative styling */}
              {task.content?.textContent && (
                <div style={{
                  marginTop: '24px',
                  padding: '28px',
                  backgroundColor: '#fffbeb',
                  borderRadius: '12px',
                  border: '2px solid #fde68a',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                  <p style={{ 
                    margin: 0,
                    fontSize: '20px',
                    lineHeight: '1.8',
                    color: '#78350f',
                    textAlign: 'center',
                    fontWeight: '500',
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    letterSpacing: '0.3px'
                  }}>
                    {task.content.textContent}
                  </p>

                  {/* Decorative hearts */}
                  <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    fontSize: '20px',
                    opacity: 0.6
                  }}>
                    💛 ✨ 💛
                  </div>

                  {/* Continue Button */}
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleTaskResponse(task.taskId, task.taskType, {
                        responseText: 'Message acknowledged',
                        completed: true,
                        submissionMessage: 'Saving your acknowledgement…'
                      })}
                      style={{
                        padding: '14px 32px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                      }}
                    >
                      {t('continue')} ➜
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'reflection-prompt':
        const sliderValue = sliderValues[task.taskId] !== undefined ? sliderValues[task.taskId] : 50;
        return (
          <div key={task.taskId || index} style={{
            padding: '32px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '3px solid #fbbf24',
            marginBottom: '24px',
            boxShadow: '0 10px 25px -5px rgba(251, 191, 36, 0.3), 0 8px 10px -6px rgba(251, 191, 36, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative pattern background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.08,
              pointerEvents: 'none',
              background: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Title with icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '36px' }}>💭</span>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#78350f',
                  lineHeight: '1.2'
                }}>
                  {task.title}
                </h3>
              </div>

              {/* Description */}
              {task.description && (
                <p style={{ 
                  margin: '0 0 20px 48px',
                  fontSize: '16px',
                  color: '#92400e',
                  lineHeight: '1.6',
                  fontStyle: 'italic'
                }}>
                  {task.description}
                </p>
              )}

              {/* Reflection Question and Slider */}
              {task.content?.reflectionQuestion && (
                <div style={{
                  marginTop: '24px',
                  padding: '28px',
                  backgroundColor: '#fffbeb',
                  borderRadius: '12px',
                  border: '2px solid #fde68a',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                  <p style={{ 
                    margin: '0 0 24px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    lineHeight: '1.6',
                    color: '#78350f',
                    textAlign: 'center'
                  }}>
                    {task.content.reflectionQuestion}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', fontWeight: '600' }}>
                    <span style={{ color: '#dc2626' }}>😔 {task.content?.sliderLeftLabel || 'Not Well / Very Stressed'}</span>
                    <span style={{ color: '#16a34a' }}>😊 {task.content?.sliderRightLabel || 'Very Well / Not Stressed'}</span>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={(e) => setSliderValues(prev => ({ ...prev, [task.taskId]: e.target.value }))}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: `linear-gradient(to right, #dc2626 0%, #fbbf24 50%, #16a34a 100%)`,
                      outline: 'none',
                      cursor: 'pointer',
                      WebkitAppearance: 'none',
                      appearance: 'none'
                    }}
                  />
                  
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '8px 20px', 
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '2px solid #fbbf24',
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#92400e'
                    }}>
                      {sliderValue}%
                    </div>
                  </div>

                  {/* Decorative hearts */}
                  <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    fontSize: '20px',
                    opacity: 0.6
                  }}>
                    💛 ✨ 💛
                  </div>

                  {/* Submit Button */}
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleTaskResponse(task.taskId, 'reflection-prompt', {
                        responseText: `${sliderValue}% - ${task.content.reflectionQuestion}`,
                        sliderValue: sliderValue,
                        completed: true,
                        submissionMessage: 'Saving your reflection…'
                      })}
                      style={{
                        padding: '14px 32px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                      }}
                    >
                      Submit Response ➜
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'audio-message':
        return (
          <div key={task.taskId || index} style={taskStyle}>
            {taskHeader}
            {task.content?.audioUrl && (
              <AudioPlayer
                audioUrl={task.content.audioUrl}
                audioTitle={task.title}
                caregiverId={caregiverId}
                day={selectedDay}
                onComplete={() => {
                  handleTaskResponse(task.taskId, task.taskType, {
                    responseText: 'Audio listened',
                    audioUrl: task.content.audioUrl,
                    completed: true,
                    submissionMessage: 'Saving your listening progress…'
                  });
                }}
              />
            )}
          </div>
        );

      case 'interactive-field': {
        const fieldType = task.content?.fieldType || 'text';
        const fieldState = interactiveFieldState[task.taskId] || {};
        const updateFieldState = (updates) => {
          setInteractiveFieldState(prev => ({
            ...prev,
            [task.taskId]: { ...prev[task.taskId], ...updates }
          }));
        };

        const problemLabel = task.content?.problemLabel || 'Problem';
        const solutionLabel = task.content?.solutionLabel || 'Solution';
        const singlePlaceholder = task.content?.placeholder || 'Type your response here';

        const moods = [
          { key: 'calm', label: 'Calm', emoji: '😌', color: '#22c55e' },
          { key: 'stressed', label: 'Stressed', emoji: '😣', color: '#f97316' },
          { key: 'overwhelmed', label: 'Overwhelmed', emoji: '😫', color: '#ef4444' },
          { key: 'grateful', label: 'Grateful', emoji: '😊', color: '#3b82f6' }
        ];

        const handleInteractiveSubmit = () => {
          if (fieldType === 'textarea') {
            const problemText = (fieldState.problemText || '').trim();
            const solutionText = (fieldState.solutionText || '').trim();
            if (!problemText || !solutionText) {
              showValidationPrompt('Please fill in both sections before submitting.');
              return;
            }
            handleTaskResponse(task.taskId, 'interactive-field', {
              responseText: `${problemLabel}: ${problemText} | ${solutionLabel}: ${solutionText}`,
              problem: problemText,
              solution: solutionText,
              fieldType,
              completed: true,
              submissionMessage: 'Saving your reflection…'
            });
            return;
          }

          if (fieldType === 'rating') {
            if (!fieldState.rating) {
              showValidationPrompt('Select a rating before submitting.');
              return;
            }
            handleTaskResponse(task.taskId, 'interactive-field', {
              responseText: `Rating: ${fieldState.rating}/5`,
              rating: fieldState.rating,
              fieldType,
              completed: true,
              submissionMessage: 'Recording your rating…'
            });
            return;
          }

          if (fieldType === 'mood-selector') {
            if (!fieldState.mood) {
              showValidationPrompt('Pick a mood to continue.');
              return;
            }
            const selectedMood = moods.find(m => m.key === fieldState.mood);
            handleTaskResponse(task.taskId, 'interactive-field', {
              responseText: `Mood: ${selectedMood?.label || fieldState.mood}`,
              mood: selectedMood?.label || fieldState.mood,
              fieldType,
              completed: true,
              submissionMessage: 'Recording how you feel…'
            });
            return;
          }

          const textValue = (fieldState.value || '').trim();
          if (!textValue) {
            showValidationPrompt('Please enter your response before submitting.');
            return;
          }
          handleTaskResponse(task.taskId, 'interactive-field', {
            responseText: textValue,
            value: textValue,
            fieldType,
            completed: true,
            submissionMessage: 'Saving your response…'
          });
        };

        return (
          <div key={task.taskId || index} style={taskStyle}>
            {taskHeader}

            {/* Text input */}
            {fieldType === 'text' && (
              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  {task.description || 'Your Response'}
                </label>
                <input
                  type="text"
                  value={fieldState.value || ''}
                  onChange={(e) => updateFieldState({ value: e.target.value })}
                  placeholder={singlePlaceholder}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}

            {/* Dual textarea layout */}
            {fieldType === 'textarea' && (
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{problemLabel}</label>
                  <textarea
                    value={fieldState.problemText || ''}
                    onChange={(e) => updateFieldState({ problemText: e.target.value })}
                    placeholder={task.content?.placeholder || 'Describe the challenge'}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '150px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{solutionLabel}</label>
                  <textarea
                    value={fieldState.solutionText || ''}
                    onChange={(e) => updateFieldState({ solutionText: e.target.value })}
                    placeholder="Share how you might respond"
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '150px'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Rating scale */}
            {fieldType === 'rating' && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '12px', fontWeight: 600 }}>
                  {task.description || 'How would you rate yourself right now?'}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      onClick={() => updateFieldState({ rating: score })}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        border: fieldState.rating === score ? '3px solid #f59e0b' : '2px solid #fde68a',
                        backgroundColor: fieldState.rating === score ? '#fef3c7' : 'white',
                        fontSize: '18px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mood selector */}
            {fieldType === 'mood-selector' && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '12px', fontWeight: 600 }}>
                  {task.description || 'Select the mood that best matches you now:'}
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {moods.map((mood) => (
                    <button
                      key={mood.key}
                      onClick={() => updateFieldState({ mood: mood.key })}
                      style={{
                        flex: '1 0 120px',
                        minWidth: '120px',
                        padding: '16px',
                        borderRadius: '12px',
                        border: fieldState.mood === mood.key ? `3px solid ${mood.color}` : '2px solid #e5e7eb',
                        backgroundColor: fieldState.mood === mood.key ? `${mood.color}15` : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '600',
                        color: mood.color,
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '28px' }}>{mood.emoji}</span>
                      <span style={{ fontSize: '14px' }}>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button
                onClick={handleInteractiveSubmit}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Submit Response ➜
              </button>
            </div>
          </div>
        );
      }

      case 'task-checklist':
        return (
          <div key={task.taskId || index} style={{
            padding: '32px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '3px solid #fbbf24',
            marginBottom: '24px',
            boxShadow: '0 10px 25px -5px rgba(251, 191, 36, 0.3), 0 8px 10px -6px rgba(251, 191, 36, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative pattern background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.08,
              pointerEvents: 'none',
              background: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Title with icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '36px' }}>✅</span>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#78350f',
                  lineHeight: '1.2'
                }}>
                  {task.title}
                </h3>
              </div>

              {/* Description */}
              {task.description && (
                <p style={{ 
                  margin: '0 0 24px 48px',
                  fontSize: '16px',
                  fontStyle: 'italic',
                  color: '#92400e',
                  lineHeight: '1.6'
                }}>
                  {task.description}
                </p>
              )}

              {/* Question and Yes/No buttons */}
              <div style={{
                marginTop: '20px',
                padding: '28px',
                backgroundColor: '#fffbeb',
                borderRadius: '12px',
                border: '2px solid #fde68a',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                {task.content?.checklistQuestion ? (
                  <>
                    <p style={{ 
                      margin: '0 0 24px 0',
                      fontSize: '20px',
                      fontWeight: '600',
                      lineHeight: '1.6',
                      color: '#78350f',
                      textAlign: 'center',
                      fontFamily: 'Georgia, "Times New Roman", serif'
                    }}>
                      {task.content.checklistQuestion}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                      {['Yes', 'No'].map((answer, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTaskResponse(task.taskId, 'task-checklist', {
                          question: task.content.checklistQuestion,
                          answer: answer
                        })}
                        style={{
                          fontSize: '18px',
                          padding: '16px 48px',
                          border: '3px solid #fde68a',
                          borderRadius: '12px',
                          backgroundColor: '#fffbeb',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          fontWeight: '600',
                          color: answer === 'Yes' ? '#10b981' : '#ef4444',
                          minWidth: '160px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.borderColor = answer === 'Yes' ? '#10b981' : '#ef4444';
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.borderColor = '#fde68a';
                          e.currentTarget.style.backgroundColor = '#fffbeb';
                        }}
                      >
                          {answer === 'Yes' ? '✅ ' : '❌ '}{answer}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p style={{ 
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '500',
                    lineHeight: '1.6',
                    color: '#92400e',
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}>
                    No question added yet. Please add a question in the admin dashboard.
                  </p>
                )}

                {/* Decorative hearts */}
                <div style={{
                  marginTop: '24px',
                  textAlign: 'center',
                  fontSize: '20px',
                  opacity: 0.6
                }}>
                  💛 ✨ 💛
                </div>
              </div>
            </div>
          </div>
        );

      case 'activity-selector':
        const activities = Array.isArray(task.content?.activities) ? task.content.activities : [];
        const selectedActivity = selectedActivities[task.taskId];
        const hasSelectedActivity = Number.isInteger(selectedActivity);

        const handleActivitySubmit = () => {
          if (!hasSelectedActivity) {
            showValidationPrompt('Choose an activity before submitting.');
            return;
          }

          if (activities.length === 0) {
            showErrorToast('No activities are available to choose from yet.');
            return;
          }

          const activity = activities[selectedActivity];
          if (!activity) {
            showValidationPrompt('Choose an activity before submitting.');
            return;
          }

          handleTaskResponse(task.taskId, 'activity-selector', {
            responseText: activity.activityName || `Activity ${selectedActivity + 1}`,
            selectedActivity: activity.activityName,
            activityDescription: activity.activityDescription,
            completed: true,
            submissionMessage: 'Saving your choice…'
          });
        };

        return (
          <div key={task.taskId || index} style={{
            padding: '32px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '3px solid #fbbf24',
            marginBottom: '24px',
            boxShadow: '0 10px 25px -5px rgba(251, 191, 36, 0.3), 0 8px 10px -6px rgba(251, 191, 36, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative pattern background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.08,
              pointerEvents: 'none',
              background: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Title with icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '36px' }}>🎯</span>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#78350f',
                  lineHeight: '1.2'
                }}>
                  {task.title}
                </h3>
              </div>

              {/* Description */}
              {task.description && (
                <p style={{ 
                  margin: '0 0 20px 48px',
                  fontSize: '16px',
                  color: '#92400e',
                  lineHeight: '1.6',
                  fontStyle: 'italic'
                }}>
                  {task.description}
                </p>
              )}

              {/* Activities Content */}
              {activities.length > 0 && (
                <div style={{
                  marginTop: '24px',
                  padding: '24px',
                  backgroundColor: '#fffbeb',
                  borderRadius: '12px',
                  border: '2px solid #fde68a',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {activities.map((activity, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedActivities(prev => ({ ...prev, [task.taskId]: idx }))}
                        style={{ 
                          padding: '16px', 
                          backgroundColor: selectedActivity === idx ? '#fef3c7' : 'white', 
                          border: selectedActivity === idx ? '2px solid #fbbf24' : '2px solid #fde68a',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedActivity !== idx) {
                            e.currentTarget.style.borderColor = '#fbbf24';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedActivity !== idx) {
                            e.currentTarget.style.borderColor = '#fde68a';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            backgroundColor: selectedActivity === idx ? '#fbbf24' : '#fef3c7', 
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0
                          }}>
                            {selectedActivity === idx ? '✓' : '✨'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#78350f' }}>
                              {activity.activityName || `Activity ${idx + 1}`}
                            </h4>
                            {activity.activityDescription && (
                              <p style={{ margin: 0, fontSize: '14px', color: '#92400e', lineHeight: '1.5' }}>
                                {activity.activityDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <button
                      onClick={handleActivitySubmit}
                      style={{
                        padding: '14px 32px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                      }}
                    >
                      {hasSelectedActivity ? "I've Chosen This Activity ➜" : 'Please select an activity first'}
                    </button>
                  </div>

                  {/* Decorative hearts */}
                  <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    fontSize: '20px',
                    opacity: 0.6
                  }}>
                    💛 ✨ 💛
                  </div>
                </div>
              )}

              {activities.length === 0 && (
                <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#9ca3af', fontStyle: 'italic' }}>
                  No activities available
                </p>
              )}
            </div>
          </div>
        );

      case 'feeling-check':
        const selectedFeeling = selectedFeelings[task.taskId];
        const hasSelectedFeeling = Number.isInteger(selectedFeeling);
        const feelings = [
          { emoji: '😊', label: 'Happy', color: '#10b981' },
          { emoji: '😐', label: 'Neutral', color: '#f59e0b' },
          { emoji: '😟', label: 'Sad', color: '#ef4444' }
        ];

        const handleFeelingSubmit = () => {
          if (!hasSelectedFeeling) {
            showValidationPrompt('Please choose how you feel before submitting.');
            return;
          }

          const feeling = feelings[selectedFeeling];
          if (!feeling) {
            showValidationPrompt('Please choose how you feel before submitting.');
            return;
          }

          handleTaskResponse(task.taskId, 'feeling-check', {
            responseText: feeling.label,
            feeling: feeling.label,
            completed: true,
            submissionMessage: 'Recording how you feel…'
          });
        };
        
        return (
          <div key={task.taskId || index} style={{
            padding: '32px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '3px solid #fbbf24',
            marginBottom: '24px',
            boxShadow: '0 10px 25px -5px rgba(251, 191, 36, 0.3), 0 8px 10px -6px rgba(251, 191, 36, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative pattern background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.08,
              pointerEvents: 'none',
              background: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Title with icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '36px' }}>💗</span>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#78350f',
                  lineHeight: '1.2'
                }}>
                  {task.title}
                </h3>
              </div>

              {/* Description */}
              {task.description && (
                <p style={{ 
                  margin: '0 0 20px 48px',
                  fontSize: '16px',
                  color: '#92400e',
                  lineHeight: '1.6',
                  fontStyle: 'italic'
                }}>
                  {task.description}
                </p>
              )}

              {/* Feeling Question and Emojis */}
              {task.content?.feelingQuestion && (
                <div style={{
                  marginTop: '24px',
                  padding: '28px',
                  backgroundColor: '#fffbeb',
                  borderRadius: '12px',
                  border: '2px solid #fde68a',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                  <p style={{ 
                    margin: '0 0 24px 0',
                    fontSize: '20px',
                    fontWeight: '600',
                    lineHeight: '1.6',
                    color: '#78350f',
                    textAlign: 'center',
                    fontFamily: 'Georgia, "Times New Roman", serif'
                  }}>
                    {task.content.feelingQuestion}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {feelings.map((feeling, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedFeelings(prev => ({ ...prev, [task.taskId]: idx }))}
                        style={{
                          fontSize: '64px',
                          padding: '24px',
                          border: selectedFeeling === idx ? `4px solid ${feeling.color}` : '3px solid #fde68a',
                          borderRadius: '20px',
                          backgroundColor: selectedFeeling === idx ? 'white' : '#fffbeb',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          transform: selectedFeeling === idx ? 'scale(1.15)' : 'scale(1)',
                          boxShadow: selectedFeeling === idx ? `0 8px 24px ${feeling.color}60` : '0 2px 8px rgba(0,0,0,0.1)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '12px',
                          minWidth: '140px'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedFeeling !== idx) {
                            e.currentTarget.style.transform = 'scale(1.08)';
                            e.currentTarget.style.borderColor = feeling.color;
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedFeeling !== idx) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderColor = '#fde68a';
                            e.currentTarget.style.backgroundColor = '#fffbeb';
                          }
                        }}
                      >
                        <span>{feeling.emoji}</span>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: feeling.color }}>
                          {feeling.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Decorative hearts */}
                  <div style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    fontSize: '20px',
                    opacity: 0.6
                  }}>
                    💛 ✨ 💛
                  </div>

                  {/* Submit Button */}
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <button
                      onClick={handleFeelingSubmit}
                      style={{
                        padding: '14px 32px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                      }}
                    >
                      {hasSelectedFeeling ? 'Submit Feeling ➜' : 'Select a feeling to continue'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'quick-assessment':
        return (
          <div key={task.taskId || index} style={taskStyle}>
            {taskHeader}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              {(task.content?.questions || []).map((q, qi) => {
                const current = (quickResponses[task.taskId] && quickResponses[task.taskId][qi]) ?? null;
                return (
                  <div key={qi} style={{ padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <p style={{ margin: 0, fontWeight: '600', marginBottom: '8px' }}>{qi + 1}. {q.questionText}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {q.questionType === 'yes-no' && (
                        ['Yes', 'No'].map((label, li) => (
                          <button
                            key={li}
                            onClick={() => setQuickResponses(prev => ({
                              ...prev,
                              [task.taskId]: { ...prev[task.taskId], [qi]: li === 0 ? 1 : 0 }
                            }))}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: current !== null && ((current === 1 && label === 'Yes') || (current === 0 && label === 'No')) ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                              background: current !== null && ((current === 1 && label === 'Yes') || (current === 0 && label === 'No')) ? '#fff7ed' : 'white',
                              cursor: 'pointer'
                            }}
                          >{label}</button>
                        ))
                      )}

                      {q.questionType === 'multiple-choice' && (q.options || []).map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => setQuickResponses(prev => ({
                            ...prev,
                            [task.taskId]: { ...prev[task.taskId], [qi]: opt.optionText }
                          }))}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: (quickResponses[task.taskId] && quickResponses[task.taskId][qi]) === opt.optionText ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                            background: (quickResponses[task.taskId] && quickResponses[task.taskId][qi]) === opt.optionText ? '#fff7ed' : 'white',
                            cursor: 'pointer'
                          }}
                        >{opt.optionText}</button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={async () => {
                    // Submit quick assessment for this task
                    const responsesObj = {};
                    const questionTexts = {};
                    (task.content?.questions || []).forEach((q, qi) => {
                      const resp = quickResponses[task.taskId] && quickResponses[task.taskId][qi];
                      responsesObj[String(qi)] = resp;
                      questionTexts[String(qi)] = q.questionText;
                    });

                    // Validation
                    const unanswered = Object.entries(responsesObj).filter(([k, v]) => v === null || v === undefined);
                    if (unanswered.length > 0) {
                      showValidationPrompt('Please answer all questions before submitting.');
                      return;
                    }

                    const submissionTitle = 'Submitting your quick check-in';
                    const submissionMessage = 'Syncing your responses and preparing the next task…';

                    try {
                      showSubmissionToast({
                        type: 'task',
                        title: submissionTitle,
                        message: submissionMessage,
                        hint: 'We’ll surface the next activity as soon as it loads.',
                        icon: '📝'
                      });
                      setSubmittingQuick(prev => ({ ...prev, [task.taskId]: true }));
                      
                      // Save to daily-assessment API for record keeping
                      await fetch('/api/caregiver/daily-assessment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          caregiverId,
                          day: selectedDay,
                          assessmentType: 'quick_assessment',
                          responses: responsesObj,
                          language: getLanguageKey(),
                          questionTexts
                        })
                      });

                      // Also mark task as complete via handleTaskResponse for progress tracking
                      await handleTaskResponse(task.taskId, 'quick-assessment', {
                        responseText: 'Quick assessment completed',
                        responses: responsesObj,
                        questionTexts: questionTexts,
                        totalQuestions: Object.keys(responsesObj).length,
                        completed: true,
                        submissionMessage,
                        suppressSubmissionToast: true
                      });

                      showSuccessToast('Quick assessment saved!');
                    } catch (err) {
                      console.error('Error submitting quick assessment', err);
                      showErrorToast('Error submitting quick assessment. Please try again.');
                    } finally {
                      setSubmittingQuick(prev => ({ ...prev, [task.taskId]: false }));
                      hideSubmissionToast();
                    }
                  }}
                  style={{ padding: '10px 18px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  {submittingQuick[task.taskId] ? 'Submitting...' : 'Submit Answers'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'reminder':
        // Reminders don't show as task cards on caregiver dashboard
        // They only appear as popup notifications via NotificationManager
        return null;

      default:
        return (
          <div key={task.taskId || index} style={taskStyle}>
            {taskHeader}
            <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              Task type: {task.taskType}
            </p>
          </div>
        );
    }
  };

  // Hover states
  const [hoveredDay, setHoveredDay] = useState(null);
  const [countdownLookup, setCountdownLookup] = useState({});
  const [videoButtonHovered, setVideoButtonHovered] = useState(false);
  const [tasksButtonHovered, setTasksButtonHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (caregiverId) {
      fetchProgramStatus();
      const interval = setInterval(fetchProgramStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [caregiverId]);

  // Re-fetch when language changes to get updated content
  useEffect(() => {
    if (caregiverId && currentLanguage) {
      fetchProgramStatus();
    }
  }, [currentLanguage]);

  useEffect(() => {
    setShowTestReview(false);
    setTestAnswers({});
  }, [selectedDay]);

  useEffect(() => {
    if (!programData) return;
    const activeModule = programData.dayModules?.find(m => m.day === selectedDay);
    if (!activeModule?.testCompleted) return;

    const hydrated = deriveAnswerMapFromResult(activeModule.dynamicTestResult || activeModule.dynamicTest || null);
    if (Object.keys(hydrated).length > 0 && Object.keys(testAnswers).length === 0) {
      setTestAnswers(hydrated);
    }
  }, [programData, selectedDay, testAnswers]);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '0'
    },
    headerCard: {
      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      padding: '24px',
      color: 'white'
    },
    headerFlex: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: '16px'
    },
    title: {
      fontSize: isMobile ? '22px' : '28px',
      fontWeight: '700',
      margin: 0,
      marginBottom: '8px'
    },
    subtitle: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: '14px',
      margin: 0
    },
    progressBox: {
      textAlign: isMobile ? 'left' : 'right'
    },
    progressText: {
      fontSize: '36px',
      fontWeight: '700',
      margin: 0
    },
    progressLabel: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.9)',
      margin: 0
    },
    progressBar: {
      marginTop: '16px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '999px',
      height: '12px',
      overflow: 'hidden'
    },
    progressFill: {
      backgroundColor: 'white',
      height: '100%',
      borderRadius: '999px',
      transition: 'width 0.5s ease'
    },
    burdenCard: {
      border: '2px solid',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    dayGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
      gap: isMobile ? '12px' : '16px'
    },
    dayButton: {
      position: 'relative',
      padding: '16px',
      borderRadius: '12px',
      border: '2px solid',
      transition: 'all 0.3s',
      textAlign: 'left',
      cursor: 'pointer',
      backgroundColor: 'white',
      display: 'block',
      width: '100%'
    },
    contentCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    contentHeader: {
      borderBottom: '1px solid #e5e7eb',
      padding: '24px'
    },
    contentBody: {
      padding: '24px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '12px',
      marginTop: 0
    },
    button: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '12px'
    },
    infoBox: {
      backgroundColor: '#fef3c7',
      border: '1px solid #fde68a',
      borderRadius: '12px',
      padding: '16px'
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      textAlign: 'center'
    },
    spinner: {
      border: '3px solid #f3f4f6',
      borderTop: '3px solid #2563eb',
      borderRadius: '50%',
      width: '48px',
      height: '48px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto'
    },
    errorBox: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      color: '#dc2626'
    },
    submissionOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(2, 6, 23, 0.65)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '24px'
    },
    submissionCard: {
      position: 'relative',
      background: 'linear-gradient(135deg, rgba(37,99,235,0.95), rgba(99,102,241,0.95))',
      color: 'white',
      borderRadius: '24px',
      padding: '40px 32px',
      width: '100%',
      maxWidth: '420px',
      textAlign: 'center',
      boxShadow: '0 30px 80px rgba(15,23,42,0.55)',
      overflow: 'hidden'
    },
    submissionGlow: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at top, rgba(255,255,255,0.25), transparent 55%)',
      pointerEvents: 'none'
    },
    submissionIcon: {
      fontSize: '32px',
      marginBottom: '12px'
    },
    submissionSpinner: {
      width: '70px',
      height: '70px',
      margin: '0 auto 20px auto',
      borderRadius: '50%',
      border: '5px solid rgba(255,255,255,0.25)',
      borderTopColor: '#facc15',
      animation: 'submissionSpin 0.9s linear infinite'
    },
    submissionTitle: {
      fontSize: '20px',
      fontWeight: 700,
      margin: '0 0 8px 0'
    },
    submissionMessage: {
      fontSize: '15px',
      color: 'rgba(255,255,255,0.95)',
      margin: 0,
      lineHeight: 1.6
    },
    submissionHint: {
      fontSize: '13px',
      color: 'rgba(255,255,255,0.75)',
      marginTop: '16px'
    },
    inlineToastWrapper: {
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '420px',
      zIndex: 2600,
      pointerEvents: 'none'
    },
    inlineToastCard: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '16px 20px',
      borderRadius: '16px',
      borderWidth: '2px',
      borderStyle: 'solid',
      boxShadow: '0 20px 45px rgba(15,23,42,0.25)',
      pointerEvents: 'auto'
    },
    inlineToastIcon: {
      fontSize: '20px',
      lineHeight: 1
    },
    inlineToastBody: {
      flex: 1
    },
    inlineToastTitle: {
      margin: '0 0 4px 0',
      fontSize: '15px',
      fontWeight: 700
    },
    inlineToastMessage: {
      margin: 0,
      fontSize: '13px',
      lineHeight: 1.4
    },
    inlineToastAction: {
      marginTop: '8px',
      padding: '6px 12px',
      borderRadius: '999px',
      border: 'none',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer'
    },
    inlineToastClose: {
      border: 'none',
      background: 'transparent',
      fontSize: '18px',
      cursor: 'pointer',
      lineHeight: 1,
      color: '#0f172a',
      padding: 0,
      marginLeft: '4px'
    }
  };

  const fetchProgramStatus = async () => {
    try {
      const response = await fetch(`/api/caregiver/check-program-status?caregiverId=${caregiverId}&_t=${Date.now()}`);
      const data = await response.json();
      
      if (data.success) {
        // Enhanced program data with dynamic content
        const enhancedData = { ...data.data };
        const countdownMap = {};
        if (data.data.waitTimes?.countdowns) {
          data.data.waitTimes.countdowns.forEach(entry => {
            countdownMap[entry.day] = entry;
          });
        }
        setCountdownLookup(countdownMap);
        
        // Fetch dynamic day content for each available day
        if (enhancedData.dayModules && enhancedData.dayModules.length > 0) {
          const contentPromises = enhancedData.dayModules.map(async (dayModule) => {
            try {
              // Get language key for API
              const langKey = getLanguageKey();
              
              // Fetch dynamic day content using NEW API
              const queryParams = new URLSearchParams({
                caregiverId: caregiverId,
                day: dayModule.day.toString(),
                language: langKey,
                _t: Date.now() // Cache buster to ensure fresh data
              });
              
              console.log(`🎯 Fetching dynamic content for Day ${dayModule.day} (${langKey})`);
              const contentResponse = await fetch(`/api/caregiver/dynamic-day-content?${queryParams}`, {
                cache: 'no-store' // Disable caching
              });
              
              if (contentResponse.ok) {
                const contentData = await contentResponse.json();
                
                console.log(`✅ Day ${dayModule.day} dynamic content:`, contentData);
                // Helpful debug: log tasks and their questions to browser console
                if (Array.isArray(contentData.tasks)) {
                  contentData.tasks.forEach((t, ti) => {
                    console.log(`  - task[${ti}]:`, { taskId: t.taskId, taskType: t.taskType, title: t.title, questions: t.content?.questions });
                  });
                }
                
                // Merge dynamic content into day module
                const baseModule = dayModule.toObject ? dayModule.toObject() : dayModule;
                
                console.log(`🔍 Day ${dayModule.day} - Database data BEFORE merge:`, {
                  progressPercentage: baseModule.progressPercentage,
                  taskResponsesCount: baseModule.taskResponses?.length || 0,
                  uniqueTaskIds: [...new Set((baseModule.taskResponses || []).map(r => r.taskId))],
                  tasksCount: baseModule.tasks?.length || 0
                });
                
                // Calculate ACTUAL progress based on task responses vs content tasks
                const visibleTasks = (contentData.tasks || []).filter(
                  t => t.taskType !== 'reminder' && t.taskType !== 'dynamic-test'
                );
                const contentTasks = visibleTasks.map(normalizeTaskForDisplay);
                const uniqueCompletedTaskIds = new Set((baseModule.taskResponses || []).map(r => r.taskId));
                const dayHasDynamicTest = Boolean(contentData.hasTest);
                const dynamicTestCompleted = Boolean(baseModule.dynamicTestCompleted || baseModule.dynamicTest?.completedAt);
                const totalTasks = contentTasks.length + (dayHasDynamicTest ? 1 : 0);
                const completedTasksCount = uniqueCompletedTaskIds.size + (dayHasDynamicTest && dynamicTestCompleted ? 1 : 0);
                const calculatedProgress = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : baseModule.progressPercentage || 0;
                
                console.log(`📊 Day ${dayModule.day} - Calculated progress:`, {
                  completedTasks: completedTasksCount,
                  totalTasks,
                  calculatedProgress
                });
                
                const mergedModule = {
                  ...baseModule,
                  dayName: contentData.dayName || `Day ${dayModule.day}`,
                  hasTest: dayHasDynamicTest,
                  tasks: contentTasks,
                  totalTasks,
                  levelLabel: contentData.levelLabel || '',
                  // USE CALCULATED PROGRESS instead of database value
                  progressPercentage: calculatedProgress,
                  taskResponses: baseModule.taskResponses || [],
                  tasksCompleted: calculatedProgress === 100,
                  completedTasks: completedTasksCount,
                  videoCompleted: baseModule.videoCompleted || false,
                  videoProgress: baseModule.videoProgress || 0,
                  videoWatched: baseModule.videoWatched || false,
                  audioCompleted: baseModule.audioCompleted || false,
                  completedAt: calculatedProgress === 100 ? (baseModule.completedAt || new Date()) : baseModule.completedAt,
                  // Preserve burden assessment data from original day module
                  burdenTestCompleted: baseModule.burdenTestCompleted || false,
                  burdenLevel: baseModule.burdenLevel || contentData.burdenLevel || enhancedData.burdenLevel,
                  burdenScore: baseModule.burdenScore,
                  testCompleted: Boolean(baseModule.dynamicTestCompleted || baseModule.dynamicTest?.completedAt),
                  dynamicTestResult: baseModule.dynamicTest || null,
                  // Add test if available
                  test: contentData.test || null
                };
                
                console.log(`✅ Day ${dayModule.day} merged module - Progress: ${mergedModule.progressPercentage}%, Tasks: ${mergedModule.taskResponses?.length || 0}/${mergedModule.totalTasks}`);
                
                return mergedModule;
              } else {
                console.warn(`⚠️ Day ${dayModule.day} content not found`);
                const baseModule = dayModule.toObject ? dayModule.toObject() : dayModule;
                const fallbackHasTest = Boolean(baseModule.dynamicTest || baseModule.dynamicTestCompleted);
                const fallbackCompletedTaskIds = new Set((baseModule.taskResponses || []).map(r => r.taskId));
                const sanitizedTasks = Array.isArray(baseModule.tasks)
                  ? baseModule.tasks
                      .filter(task => task.taskType !== 'reminder' && task.taskType !== 'dynamic-test')
                      .map(normalizeTaskForDisplay)
                  : [];
                const fallbackTaskCount = sanitizedTasks.length;
                const fallbackTotalTasks = fallbackTaskCount + (fallbackHasTest ? 1 : 0);
                const fallbackCompletedCount = fallbackCompletedTaskIds.size + (fallbackHasTest && Boolean(baseModule.dynamicTestCompleted || baseModule.dynamicTest?.completedAt) ? 1 : 0);

                return {
                  ...baseModule,
                  tasks: sanitizedTasks,
                  totalTasks: fallbackTotalTasks,
                  hasTest: fallbackHasTest,
                  // Preserve ALL progress data even when no content
                  progressPercentage: baseModule.progressPercentage || 0,
                  taskResponses: baseModule.taskResponses || [],
                  tasksCompleted: fallbackTotalTasks > 0 ? (fallbackCompletedCount >= fallbackTotalTasks) : baseModule.tasksCompleted || false,
                  completedTasks: fallbackCompletedCount,
                  videoCompleted: baseModule.videoCompleted || false,
                  videoProgress: baseModule.videoProgress || 0,
                  completedAt: baseModule.completedAt,
                  // Preserve burden assessment data even when no content
                  burdenTestCompleted: baseModule.burdenTestCompleted || false,
                  burdenLevel: baseModule.burdenLevel || enhancedData.burdenLevel,
                  burdenScore: baseModule.burdenScore,
                  testCompleted: Boolean(baseModule.dynamicTestCompleted || baseModule.dynamicTest?.completedAt),
                  dynamicTestResult: baseModule.dynamicTest || null,
                  test: null
                };
              }
            } catch (contentError) {
              console.error(`❌ Error fetching content for Day ${dayModule.day}:`, contentError);
              const baseModule = dayModule.toObject ? dayModule.toObject() : dayModule;
              const fallbackHasTest = Boolean(baseModule.dynamicTest || baseModule.dynamicTestCompleted);
              const fallbackCompletedTaskIds = new Set((baseModule.taskResponses || []).map(r => r.taskId));
              const sanitizedTasks = Array.isArray(baseModule.tasks)
                ? baseModule.tasks
                    .filter(task => task.taskType !== 'reminder' && task.taskType !== 'dynamic-test')
                    .map(normalizeTaskForDisplay)
                : [];
              const fallbackTaskCount = sanitizedTasks.length;
              const fallbackTotalTasks = fallbackTaskCount + (fallbackHasTest ? 1 : 0);
              const fallbackCompletedCount = fallbackCompletedTaskIds.size + (fallbackHasTest && Boolean(baseModule.dynamicTestCompleted || baseModule.dynamicTest?.completedAt) ? 1 : 0);
              
              return {
                ...baseModule,
                tasks: sanitizedTasks,
                totalTasks: fallbackTotalTasks,
                hasTest: fallbackHasTest,
                // Preserve ALL progress data even on error
                progressPercentage: baseModule.progressPercentage || 0,
                taskResponses: baseModule.taskResponses || [],
                tasksCompleted: fallbackTotalTasks > 0 ? (fallbackCompletedCount >= fallbackTotalTasks) : baseModule.tasksCompleted || false,
                completedTasks: fallbackCompletedCount,
                videoCompleted: baseModule.videoCompleted || false,
                videoProgress: baseModule.videoProgress || 0,
                completedAt: baseModule.completedAt,
                // Preserve burden assessment data even on error
                burdenTestCompleted: baseModule.burdenTestCompleted || false,
                burdenLevel: baseModule.burdenLevel || enhancedData.burdenLevel,
                burdenScore: baseModule.burdenScore,
                testCompleted: Boolean(baseModule.dynamicTestCompleted || baseModule.dynamicTest?.completedAt),
                dynamicTestResult: baseModule.dynamicTest || null,
                test: null
              };
            }
          });
          
          const enhancedDayModules = await Promise.all(contentPromises);
          enhancedData.dayModules = enhancedDayModules;
          
          // Recalculate overall progress client-side using merged data (8 total days: 0-7)
          const TOTAL_DAYS = 8;
          const totalProgress = enhancedDayModules.reduce((sum, module) => sum + (module.progressPercentage || 0), 0);
          enhancedData.overallProgress = Math.round(totalProgress / TOTAL_DAYS);
          
          // Debug burden data mapping
          console.log('🔍 Enhanced data burden info:', {
            overallBurdenLevel: enhancedData.burdenLevel,
            burdenTestCompleted: enhancedData.burdenTestCompleted,
            day1Module: enhancedDayModules.find(m => m.day === 1)
          });
        }
        
        setProgramData(enhancedData);
        
        console.log('🎯 FINAL programData after setState:', {
          overallProgress: enhancedData.overallProgress,
          dayModulesCount: enhancedData.dayModules?.length || 0,
          day0Progress: enhancedData.dayModules?.find(m => m.day === 0)?.progressPercentage,
          day0TaskResponses: enhancedData.dayModules?.find(m => m.day === 0)?.taskResponses?.length || 0
        });
        
        // Auto-select day logic - prioritize Day 0 for new users
        if (!selectedDay || selectedDay === 0) {
          // If Day 0 exists and is not completed, select it
          const day0Module = enhancedData.dayModules?.find(m => m.day === 0);
          if (day0Module && !day0Module.completedAt) {
            setSelectedDay(0);
          } else if (enhancedData.currentDay !== undefined && !showAssessment) {
            // Otherwise, use the current day
            setSelectedDay(enhancedData.currentDay);
          }
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch program status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (day, isUnlocked) => {
    if (isUnlocked) {
      setSelectedDay(day);
      
      // Check if Day 0 should show assessment (video completed but assessment not done)
      if (day === 0 && programData) {
        const dayData = programData.dayModules?.find(d => d.day === day);
        console.log('🔍 Day click - Day 0 assessment check:', {
          day,
          dayData: dayData ? 'found' : 'not found',
          videoCompleted: dayData?.videoCompleted,
          dailyAssessment: dayData?.dailyAssessment,
          shouldShowAssessment: dayData && dayData.videoCompleted && !dayData.dailyAssessment
        });
        
        if (dayData && dayData.videoCompleted && !dayData.dailyAssessment) {
          console.log('✅ Day click - Setting showAssessment to true for Day 0');
          setShowAssessment(true);
        } else {
          console.log('❌ Day click - Not showing assessment for Day 0');
          setShowAssessment(false);
        }
      } else {
        // Reset assessment state for other days
        setShowAssessment(false);
      }
    }
  };

  const handleVideoComplete = async (day) => {
    showSubmissionToast({
      type: 'video',
      title: 'Marking video as complete',
      message: 'Updating your progress and loading your next activity…',
      icon: '🎬',
      hint: 'Please keep this tab open while we fetch your new tasks.'
    });

    try {
      const response = await fetch('/api/caregiver/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          day,
          videoCompleted: true,
          videoProgress: 100
        })
      });
      
      if (response.ok) {
        console.log(`🎥 Video completed for Day ${day}`);
        
        // Show quick assessment for Day 0 after video completion (if not already completed)
        if (day === 0) {
          const dayData = programData?.dayModules?.find(d => d.day === day);
          console.log('🔍 Day 0 video complete - Assessment check:', {
            dayData: dayData ? 'found' : 'not found',
            dailyAssessment: dayData?.dailyAssessment,
            hasAssessment: !!dayData?.dailyAssessment,
            willShowAssessment: !dayData?.dailyAssessment
          });
          
          if (!dayData?.dailyAssessment) {
            console.log('✅ Setting showAssessment to true for Day 0');
            setShowAssessment(true);
            
            // Ensure state updates flush before refreshing data
            await new Promise((resolve) => setTimeout(resolve, 150));
            console.log('📡 Fetching program status after assessment state set');
            await fetchProgramStatus();
          } else {
            console.log('❌ Day 0 assessment already completed, not showing');
            await fetchProgramStatus();
          }
        } else {
          // For other days, fetch immediately
          await fetchProgramStatus();
        }
      } else {
        console.error('Failed to update video progress:', response.status);
      }
    } catch (err) {
      console.error('Failed to update video progress:', err);
    } finally {
      hideSubmissionToast();
    }
  };

  const handleTasksComplete = async (day) => {
    try {
      const response = await fetch('/api/caregiver/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          day,
          tasksCompleted: true,
          taskResponses: []
        })
      });
      
      if (response.ok) {
        fetchProgramStatus();
      }
    } catch (err) {
      console.error('Failed to update task progress:', err);
    }
  };

  const handleAssessmentComplete = (assessmentData) => {
    setShowAssessment(false);
    fetchProgramStatus(); // Refresh the program status
  };

  const handleTaskResponse = async (taskId, taskType, responseData) => {
    const {
      suppressSubmissionToast,
      submissionMessage,
      ...taskResponseData
    } = responseData || {};

    const shouldShowToast = suppressSubmissionToast !== true;

    if (shouldShowToast) {
      showSubmissionToast({
        type: 'task',
        title: 'Saving your response',
        message: submissionMessage || getTaskSubmissionMessage(taskType),
        hint: 'We’ll reveal your next step as soon as it’s ready.',
        icon: '🌀'
      });
    }

    try {
      console.log(`🚀 Calling update-progress API for Day ${selectedDay}, Task: ${taskType} (${taskId})`);
      
      const payload = {
        caregiverId,
        day: selectedDay,
        taskResponse: {
          taskId,
          taskType,
          ...taskResponseData,
          completedAt: new Date().toISOString()
        }
      };
      
      console.log(`📤 Payload:`, JSON.stringify(payload, null, 2));
      
      const response = await fetch('/api/caregiver/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log(`📥 Response status:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${taskType} response saved. Server returned:`, data);
        await fetchProgramStatus(); // Refresh to show updated responses
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to save task response:', response.status, errorData);
      }
    } catch (err) {
      console.error('❌ Failed to save task response:', err);
    } finally {
      if (shouldShowToast) {
        hideSubmissionToast();
      }
    }
  };

  const handleTestSubmit = async () => {
    try {
      setSubmittingTest(true);
      
      // Get current day data
      const selectedDayData = programData.dayModules?.find(m => m.day === selectedDay);
      if (!selectedDayData?.test) {
        showErrorToast('Test configuration not found.');
        return;
      }

      const wasRetake = Boolean(selectedDayData?.testCompleted);
      
      const test = selectedDayData.test;
      const questions = test.questions || [];
      
      // Validate all questions are answered
      if (Object.keys(testAnswers).length !== questions.length) {
        showValidationPrompt('Please answer all questions before submitting.');
        setSubmittingTest(false);
        return;
      }
      
      // Calculate total score
      let totalScore = 0;
      questions.forEach((question, qIdx) => {
        const selectedScore = testAnswers[qIdx];
        if (selectedScore !== undefined) {
          totalScore += parseInt(selectedScore);
        }
      });
      
      // Determine burden level based on score ranges
      let burdenLevel = 'mild'; // default
      if (test.scoreRanges && test.scoreRanges.length > 0) {
        for (const range of test.scoreRanges) {
          if (totalScore >= range.minScore && totalScore <= range.maxScore) {
            burdenLevel = range.levelKey;
            break;
          }
        }
      }
      
      // Show submission overlay for test submit
      showSubmissionToast({
        type: 'test',
        title: wasRetake ? 'Updating your assessment' : 'Submitting your assessment',
        message: 'Personalizing today’s plan and loading your next tasks…',
        hint: 'Hang tight while we refresh today’s personalized content.',
        icon: '🧠'
      });

      // Submit test results to API
      const response = await fetch('/api/caregiver/submit-dynamic-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          day: selectedDay,
          language: getLanguageKey(),
          testName: test.testName,
          answers: Object.values(testAnswers),
          totalScore,
          burdenLevel
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit test');
      }
      
      const result = await response.json();
      console.log('Test submitted successfully:', result);
      
      // Clear test answers
      setTestAnswers({});
      
      // Refresh program status to get updated content
      await fetchProgramStatus();
      setShowTestReview(false);
      
      const friendlyLevel = burdenLevel.charAt(0).toUpperCase() + burdenLevel.slice(1);
      showSuccessToast(`${wasRetake ? 'Assessment updated' : 'Assessment complete'}! Your burden level: ${friendlyLevel}`);
      
    } catch (error) {
      console.error('Error submitting test:', error);
      showErrorToast('Failed to submit test. Please try again.');
    } finally {
      setSubmittingTest(false);
      hideSubmissionToast();
    }
  };

  const handleDayComplete = async (day) => {
    try {
      const response = await fetch('/api/caregiver/complete-day-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          day
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`Day ${day} marked as complete:`, result);
        
        // If Day 0 is completed, automatically move to Day 1
        if (day === 0) {
          setSelectedDay(1);
        }
        
        // Refresh the program status to get updated data
        fetchProgramStatus();
      } else {
        console.error('Failed to mark day as complete');
      }
    } catch (err) {
      console.error('Error completing day:', err);
    }
  };

  const getTimeRemaining = (scheduledUnlockAt) => {
    if (!scheduledUnlockAt) return null;
    
    const now = new Date();
    const unlock = new Date(scheduledUnlockAt);
    const diff = unlock - now;
    
    if (diff <= 0) return t('availableNow');
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const key = days > 1 ? 'daysRemaining' : 'dayRemaining';
      return t(key).replace('{count}', days);
    }
    
    return `${hours}h ${minutes}m ${t('remaining')}`;
  };

  const formatCountdownMeta = (meta) => {
    if (!meta) return null;
    if (meta.minutesRemaining <= 0) return t('availableNow');
    if (meta.hoursRemaining >= 24) {
      const days = Math.ceil(meta.hoursRemaining / 24);
      const key = days > 1 ? 'daysRemaining' : 'dayRemaining';
      return t(key).replace('{count}', days);
    }
    const hours = Math.floor(meta.minutesRemaining / 60);
    const minutes = meta.minutesRemaining % 60;
    return `${hours}h ${minutes}m ${t('remaining')}`;
  };

  const getBurdenLevelInfo = (level) => {
    switch (level?.toLowerCase()) {
      case 'mild':
        return { 
          backgroundColor: '#dcfce7', 
          color: '#166534', 
          borderColor: '#86efac', 
          text: t('mildBurden'),
          emoji: '😊'
        };
      case 'moderate':
        return { 
          backgroundColor: '#fef3c7', 
          color: '#92400e', 
          borderColor: '#fde68a', 
          text: t('moderateBurden'),
          emoji: '😐'
        };
      case 'severe':
        return { 
          backgroundColor: '#fee2e2', 
          color: '#991b1b', 
          borderColor: '#fecaca', 
          text: t('severeBurden'),
          emoji: '😟'
        };
      default:
        return { 
          backgroundColor: '#f3f4f6', 
          color: '#1f2937', 
          borderColor: '#d1d5db', 
          text: t('notAssessed'),
          emoji: '❓'
        };
    }
  };

  const selectedDayData = programData?.dayModules?.find(m => m.day === selectedDay) || null;
  const hasDynamicDayContent = Boolean(
    (selectedDayData?.tasks && selectedDayData.tasks.length > 0) ||
    selectedDayData?.test
  );
  const shouldUseLegacyBurdenFlow = selectedDay === 1 && !hasDynamicDayContent;
  const isDynamicTestPending = !shouldUseLegacyBurdenFlow && Boolean(selectedDayData?.test && !selectedDayData?.testCompleted);
  const burdenInfo = getBurdenLevelInfo(programData?.burdenLevel);
  const selectedDayTestResult = selectedDayData?.dynamicTestResult || null;
  const storedTestAnswerMap = useMemo(() => deriveAnswerMapFromResult(selectedDayTestResult), [selectedDayTestResult]);
  const testCompletedAt = selectedDayTestResult?.completedAt ? new Date(selectedDayTestResult.completedAt) : null;
  const inlineToastTone = inlineToast ? getToastToneStyles(inlineToast.tone) : null;
  const shouldShowDynamicTest = Boolean(selectedDayData?.test && (!selectedDayData.testCompleted || showTestReview));
  const isReviewOnlyMode = Boolean(selectedDayData?.testCompleted && showTestReview);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div>
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading your program...</p>
        </div>
      </div>
    );
  }

  if (error || !programData) {
    return (
      <div style={styles.errorBox}>
        <p style={{ margin: 0 }}>{error || 'Program data not available'}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Notification Manager for Reminders */}
      <NotificationManager caregiverId={caregiverId} day={selectedDay} />

      {/* Submission overlay (shown when any task/test submission is in progress) */}
      {activeSubmission && (
        <div 
          style={styles.submissionOverlay}
          role="alertdialog"
          aria-live="assertive"
          aria-busy="true"
          aria-modal="true"
        >
          <div style={styles.submissionCard}>
            <div style={styles.submissionGlow}></div>
            <style>{`@keyframes submissionSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <div style={styles.submissionIcon}>{activeSubmission.icon || '✨'}</div>
            <div style={styles.submissionSpinner} />
            <h3 style={styles.submissionTitle}>{activeSubmission.title || 'Hang tight…'}</h3>
            <p style={styles.submissionMessage}>{activeSubmission.message || 'Preparing your next task…'}</p>
            <p style={styles.submissionHint}>{activeSubmission.hint || 'This usually takes just a moment.'}</p>
          </div>
        </div>
      )}

      {inlineToast && inlineToastTone && (
        <div style={styles.inlineToastWrapper} role="status" aria-live="polite">
          <div
            style={{
              ...styles.inlineToastCard,
              borderColor: inlineToastTone.borderColor,
              backgroundColor: inlineToastTone.backgroundColor,
              color: inlineToastTone.textColor
            }}
          >
            <div style={styles.inlineToastIcon}>{inlineToast.icon || 'ℹ️'}</div>
            <div style={styles.inlineToastBody}>
              <p style={{ ...styles.inlineToastTitle, color: inlineToastTone.titleColor }}>
                {inlineToast.title || 'Heads up'}
              </p>
              <p style={{ ...styles.inlineToastMessage, color: inlineToastTone.textColor }}>
                {inlineToast.message}
              </p>
              {inlineToast.actionLabel && (
                <button
                  style={{
                    ...styles.inlineToastAction,
                    backgroundColor: inlineToastTone.borderColor,
                    color: inlineToastTone.titleColor
                  }}
                  onClick={() => {
                    inlineToast.onAction?.();
                    hideInlineToast();
                  }}
                >
                  {inlineToast.actionLabel}
                </button>
              )}
            </div>
            <button
              style={{ ...styles.inlineToastClose, color: inlineToastTone.titleColor }}
              onClick={hideInlineToast}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div style={styles.headerCard}>
        <div style={styles.headerFlex}>
          <div>
            <h2 style={styles.title}>{t('sevenDayCaregiverSupportProgram')}</h2>
            <p style={styles.subtitle}>{t('yourJourneyToBetterCaregiving')}</p>
          </div>
          <div style={styles.progressBox}>
            <p style={styles.progressText}>{Math.round(programData.overallProgress || 0)}%</p>
            <p style={styles.progressLabel}>{t('complete')}</p>
          </div>
        </div>
        
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${programData.overallProgress || 0}%`
            }}
          ></div>
        </div>
      </div>

      {/* Burden Level Badge */}
      {programData.burdenTestCompleted && (
        <div style={{
          ...styles.burdenCard,
          backgroundColor: burdenInfo.backgroundColor,
          color: burdenInfo.color,
          borderColor: burdenInfo.borderColor
        }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, marginBottom: '4px' }}>
              {t('yourBurdenAssessmentResult')}
            </p>
            <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
              {burdenInfo.text}
            </p>
            <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8, margin: 0 }}>
              {t('programPersonalized')}
            </p>
          </div>
          <div style={{ fontSize: '32px' }}>{burdenInfo.emoji}</div>
        </div>
      )}

      {/* Reminder Display Card - Hidden (reminders show as popups only) */}
      {/* <ReminderDisplayCard caregiverId={caregiverId} day={selectedDay} language="english" /> */}

      {/* Progressive Content Info */}
      {programData.burdenTestCompleted && (
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>📚</span>
          <p style={{ fontSize: '14px', margin: 0, color: '#0c4a6e' }}>
            <strong>Progressive Learning:</strong> Days unlock one at a time as you complete each module. 
            Complete today's content to access tomorrow's materials.
          </p>
        </div>
      )}

      {/* Day Grid */}
      <div style={styles.dayGrid}>
        {programData.dayModules
          ?.sort((a, b) => a.day - b.day)  // Sort by day number to ensure proper order
          ?.map((dayModule) => {
          const isUnlocked = dayModule.adminPermissionGranted;
          const isCompleted = dayModule.progressPercentage === 100;
          const isCurrent = dayModule.day === programData.currentDay;
          const isSelected = dayModule.day === selectedDay;
          const countdownMeta = countdownLookup?.[dayModule.day] || null;
          const timeRemaining = countdownMeta
            ? formatCountdownMeta(countdownMeta)
            : getTimeRemaining(dayModule.scheduledUnlockAt);
          
          return (
            <button
              key={dayModule.day}
              onClick={() => handleDayClick(dayModule.day, isUnlocked)}
              disabled={!isUnlocked}
              style={{
                ...styles.dayButton,
                borderColor: isSelected ? '#2563eb' : '#e5e7eb',
                boxShadow: isSelected ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                opacity: isUnlocked ? 1 : 0.5,
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                backgroundColor: isCompleted ? '#dcfce7' : 'white',
                ...(hoveredDay === dayModule.day && isUnlocked ? {
                  borderColor: '#60a5fa',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                } : {})
              }}
              onMouseEnter={() => setHoveredDay(dayModule.day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Day Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                  {t('day')} {dayModule.day}
                </span>
                <span style={{ fontSize: '20px' }}>
                  {isCompleted ? '✅' : !isUnlocked ? '🔒' : isCurrent ? '▶️' : '📝'}
                </span>
              </div>
              
              {/* Progress Bar */}
              {isUnlocked && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      flex: 1, 
                      backgroundColor: '#e5e7eb', 
                      borderRadius: '999px', 
                      height: '6px',
                      overflow: 'hidden'
                    }}>
                      <div 
                        style={{
                          height: '100%',
                          backgroundColor: isCompleted ? '#16a34a' : '#2563eb',
                          borderRadius: '999px',
                          width: `${dayModule.progressPercentage || 0}%`,
                          transition: 'width 0.3s'
                        }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280' }}>
                      {dayModule.progressPercentage || 0}%
                    </span>
                  </div>
                </div>
              )}
              
              {/* Title */}
              <p style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {getLocalizedText(dayModule.videoTitle, t('moduleContent'))}
              </p>
              
              {/* Time Remaining */}
              {!isUnlocked && timeRemaining && (
                <p style={{ 
                  fontSize: '11px', 
                  color: '#ea580c', 
                  marginTop: '8px', 
                  fontWeight: '500',
                  margin: '8px 0 0 0'
                }}>
                  ⏳ {timeRemaining}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Content */}
      {selectedDayData && selectedDayData.adminPermissionGranted && (
        <div style={styles.contentCard}>
          <div style={styles.contentHeader}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '700', color: '#111827', margin: 0, marginBottom: '4px' }}>
                  {t('day')} {selectedDay}: {getLocalizedText(selectedDayData.videoTitle, t('programContent'))}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  {selectedDayData.progressPercentage === 100 
                    ? `✅ ${t('completed')}` 
                    : `${selectedDayData.progressPercentage || 0}% ${t('complete')}`}
                </p>
              </div>
              
              {selectedDayData.completedAt && (
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {t('completed')}: {new Date(selectedDayData.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          
          <div style={styles.contentBody}>
            {/* Legacy Day 1 Burden Assessment Flow */}
            {shouldUseLegacyBurdenFlow && (
              <>
                {/* Phase 1: Burden Test - INLINE (always show if test completed but no video available) */}
                {(!selectedDayData.videoCompleted && (!getLocalizedText(selectedDayData.videoUrl) || !(selectedDayData.burdenTestCompleted || programData.burdenTestCompleted))) && (
                  <InlineBurdenAssessment 
                    caregiverId={caregiverId}
                    existingAnswers={(() => {
                      // Get existing answers - handle both old and new format
                      if (!selectedDayData.burdenTestCompleted) return null;
                      
                      const assessment = programData?.zaritBurdenAssessment;
                      if (!assessment) return null;
                      
                      // New format: answers array
                      if (assessment.answers && Array.isArray(assessment.answers)) {
                        return assessment.answers;
                      }
                      
                      // Old format: question1-7 properties
                      const answers = [];
                      for (let i = 1; i <= 7; i++) {
                        const questionKey = `question${i}`;
                        if (assessment[questionKey] !== undefined) {
                          answers.push(assessment[questionKey]);
                        }
                      }
                      
                      return answers.length === 7 ? answers : null;
                    })()}
                    existingScore={selectedDayData.burdenScore}
                    existingLevel={selectedDayData.burdenLevel}
                    onComplete={() => fetchProgramStatus()} // Refresh to show video
                  />
                )}

                {/* Phase 2: Video (if test completed and video available but not watched) */}
                {(() => {
                  // Check burden test completion from multiple sources
                  const burdenTestCompleted = selectedDayData.burdenTestCompleted || programData.burdenTestCompleted;
                  const videoCompleted = selectedDayData.videoCompleted;
                  const videoUrl = getLocalizedText(selectedDayData.videoUrl);
                  const burdenLevel = selectedDayData.burdenLevel || programData.burdenLevel;
                  
                  console.log('🔍 Day 1 Video Display Check:', {
                    burdenTestCompleted,
                    videoCompleted,
                    videoUrl: videoUrl || 'NO VIDEO URL',
                    videoUrlObject: selectedDayData.videoUrl,
                    burdenLevel,
                    programDataBurdenLevel: programData.burdenLevel,
                    selectedDayBurdenLevel: selectedDayData.burdenLevel,
                    shouldShowVideo: burdenTestCompleted && !videoCompleted && videoUrl
                  });
                  
                  return burdenTestCompleted && !videoCompleted && videoUrl;
                })() && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#dcfce7',
                      border: '2px solid #86efac',
                      borderRadius: '12px',
                      marginBottom: '16px'
                    }}>
                      <p style={{ margin: 0, color: '#166534', fontWeight: '600', fontSize: '15px' }}>
                        ✅ Assessment Complete! Your burden level: <strong style={{ textTransform: 'capitalize' }}>{selectedDayData.burdenLevel || programData.burdenLevel || 'Moderate'}</strong>
                      </p>
                      <p style={{ margin: '4px 0 0 0', color: '#166534', fontSize: '14px' }}>
                        Watch the video below designed specifically for your situation.
                      </p>
                    </div>
                    
                    <h4 style={styles.sectionTitle}>📹 Personalized Video for You</h4>
                    
                    <VideoPlayer
                      videoUrl={getLocalizedText(selectedDayData.videoUrl)}
                      videoTitle={getLocalizedText(selectedDayData.videoTitle)}
                      initialProgress={selectedDayData.videoProgress || 0}
                      isCompleted={selectedDayData.videoCompleted || false}
                      caregiverId={caregiverId}
                      day={selectedDay}
                      onProgressUpdate={async (progressPercent) => {
                        try {
                          await fetch('/api/caregiver/update-progress', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              caregiverId,
                              day: selectedDay,
                              videoProgress: progressPercent
                            })
                          });
                        } catch (err) {
                          console.error('Failed to update video progress:', err);
                        }
                      }}
                      onComplete={async () => {
                        await handleVideoComplete(selectedDay);
                      }}
                    />

                    {/* Audio Content (if available) */}
                    {getLocalizedText(selectedDayData.audioUrl) && (
                      <div>
                        <AudioPlayer
                        audioUrl={getLocalizedText(selectedDayData.audioUrl)}
                        audioTitle={getLocalizedText(selectedDayData.audioTitle) || `Day ${selectedDay} Audio Content`}
                        isVideoCompleted={selectedDayData.videoCompleted || false}
                        caregiverId={caregiverId}
                        day={selectedDay}
                        onComplete={async () => {
                          // Refresh program data to get updated progress
                          fetchProgramStatus();
                        }}
                        style={{ marginTop: '16px' }}
                      />
                      </div>
                    )}
                  </div>
                )}

                {/* Phase 3: Tasks (if video watched and tasks exist) */}
                {(selectedDayData.burdenTestCompleted || programData.burdenTestCompleted) && selectedDayData.videoCompleted && selectedDayData.taskResponses && selectedDayData.taskResponses.length > 0 && (
                  <div>
                    <h4 style={styles.sectionTitle}>📝 {t('dailyTasks')}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedDayData.taskResponses.map((task, idx) => (
                        <div key={idx} style={{
                          padding: '12px 16px',
                          backgroundColor: task.completed ? '#f0fdf4' : '#fff',
                          border: `2px solid ${task.completed ? '#86efac' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleTaskToggle(selectedDay, idx)}
                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                          />
                          <span style={{ flex: 1, color: task.completed ? '#166534' : '#374151' }}>
                            {getLocalizedText(task.taskDescription) || task.taskDescription}
                          </span>
                          {task.completed && <span>✅</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Day 1 Complete Message (if test done, video watched, and no tasks OR tasks completed) */}
                {(selectedDayData.burdenTestCompleted || programData.burdenTestCompleted) && selectedDayData.videoCompleted && 
                 (!selectedDayData.taskResponses || selectedDayData.taskResponses.length === 0 || 
                  selectedDayData.taskResponses.every(t => t.completed)) && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#dcfce7',
                    border: '2px solid #86efac',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginTop: '24px'
                  }}>
                    <p style={{ margin: 0, color: '#166534', fontWeight: '600', fontSize: '18px' }}>
                      🎉 {t('day')} 1 {t('complete')}!
                    </p>
                    <p style={{ margin: '8px 0 0 0', color: '#166534', fontSize: '14px' }}>
                      {t('greatJob')} {t('dayWillUnlockIn').replace('{day}', 2).replace('{hours}', 24)}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Dynamic Content Flow (Tests + Tasks) */}
            {!shouldUseLegacyBurdenFlow && (
              <>
                {/* Dynamic Test Summary */}
                {selectedDayData.testCompleted && (
                  <div style={{
                    marginBottom: '24px',
                    padding: '20px',
                    backgroundColor: '#ecfccb',
                    borderRadius: '12px',
                    border: '2px solid #bef264'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      justifyContent: 'space-between',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      gap: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600, color: '#3f6212' }}>
                          {t('assessmentComplete')}
                        </p>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1a2e05' }}>
                          Thanks for completing the assessment
                        </h4>
                        {testCompletedAt && (
                          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#3f6212' }}>
                            {t('finishedOn')} {testCompletedAt.toLocaleString()}
                          </p>
                        )}
                        <p style={{ margin: 0, fontSize: '13px', color: '#3f6212' }}>
                          Today's tasks are unlocked and ready. Work through them one at a time below.
                        </p>
                      </div>
                      <div style={{ minWidth: isMobile ? '100%' : '240px' }}>
                        <button
                          onClick={() => {
                            if (!showTestReview && Object.keys(storedTestAnswerMap).length > 0) {
                              setTestAnswers(storedTestAnswerMap);
                            }
                            setShowTestReview(prev => !prev);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: '#84cc16',
                            color: '#1a2e05',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(132, 204, 22, 0.35)'
                          }}
                        >
                          {showTestReview ? 'Hide assessment' : 'Review answers'}
                        </button>
                        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#4d7c0f' }}>
                          You can revisit your submitted responses anytime for reference.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Test (active or review) */}
                {shouldShowDynamicTest && (
                  <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '12px', border: '2px solid #fbbf24' }}>
                    <h4 style={{ ...styles.sectionTitle, color: '#92400e' }}>
                      📊 {selectedDayData.test?.testName || 'Assessment'}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#78350f', marginBottom: '16px' }}>
                      {selectedDayData.testCompleted
                        ? (isReviewOnlyMode
                          ? 'Review your submitted answers below. Editing is disabled to preserve your completed assessment.'
                          : 'Update your answers if anything has changed. Saving will instantly refresh today’s tasks.')
                        : 'Please complete this assessment to personalize your content.'}
                    </p>
                    {isReviewOnlyMode && Object.keys(storedTestAnswerMap).length === 0 && (
                      <p style={{ fontSize: '13px', color: '#b45309', marginBottom: '16px' }}>
                        We could not find saved answers for this assessment. If this looks incorrect, please contact support.
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {selectedDayData.test?.questions?.map((question, qIdx) => (
                        <div key={qIdx} style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                          <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                            {qIdx + 1}. {question.questionText}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {question.options?.map((option, oIdx) => (
                              <label 
                                key={oIdx} 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '10px', 
                                  cursor: isReviewOnlyMode ? 'default' : 'pointer', 
                                  padding: '10px', 
                                  backgroundColor: testAnswers[qIdx] === option.score ? '#fef08a' : '#fefce8', 
                                  borderRadius: '6px', 
                                  border: testAnswers[qIdx] === option.score ? '2px solid #f59e0b' : '1px solid #fde047',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <input 
                                  type="radio" 
                                  name={`question_${qIdx}`}
                                  value={option.score}
                                  checked={testAnswers[qIdx] === option.score}
                                  onChange={(e) => {
                                    if (isReviewOnlyMode) return;
                                    setTestAnswers(prev => ({
                                      ...prev,
                                      [qIdx]: parseInt(e.target.value)
                                    }));
                                  }}
                                  disabled={isReviewOnlyMode}
                                  style={{ width: '18px', height: '18px' }}
                                />
                                <span style={{ fontSize: '14px', color: '#374151' }}>{option.optionText}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {!isReviewOnlyMode && (
                      <>
                        <button
                          onClick={handleTestSubmit}
                          disabled={
                            submittingTest ||
                            Object.keys(testAnswers).length !== (selectedDayData.test?.questions?.length || 0)
                          }
                          style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            backgroundColor: submittingTest || Object.keys(testAnswers).length !== (selectedDayData.test?.questions?.length || 0) ? '#d1d5db' : '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: submittingTest || Object.keys(testAnswers).length !== (selectedDayData.test?.questions?.length || 0) ? 'not-allowed' : 'pointer',
                            width: '100%',
                            opacity: submittingTest || Object.keys(testAnswers).length !== (selectedDayData.test?.questions?.length || 0) ? 0.6 : 1
                          }}
                        >
                          {submittingTest
                            ? (selectedDayData.testCompleted ? 'Saving...' : 'Submitting...')
                            : (selectedDayData.testCompleted ? 'Save Updated Answers' : 'Submit Assessment')}
                        </button>
                        {Object.keys(testAnswers).length < (selectedDayData.test?.questions?.length || 0) && (
                          <p style={{ fontSize: '13px', color: '#92400e', marginTop: '8px', textAlign: 'center' }}>
                            Please answer all questions ({Object.keys(testAnswers).length}/{selectedDayData.test?.questions?.length || 0} completed)
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Dynamic Tasks: Locked until assessment is finished when a test is configured */}
                {isDynamicTestPending && selectedDayData.hasTest && (
                  <div style={{
                    marginBottom: '24px',
                    padding: '20px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '12px',
                    border: '2px dashed #f59e0b',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#92400e' }}>
                      Please complete the assessment above to unlock your personalized tasks.
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#b45309' }}>
                      Your answers determine the right difficulty level for today.
                    </p>
                  </div>
                )}

                {/* Dynamic Tasks: Show completed tasks, then ONE active task at a time */}
                {selectedDayData.tasks && selectedDayData.tasks.length > 0 && !isDynamicTestPending && (() => {
                  const allTasks = selectedDayData.tasks.filter(
                    t => t.taskType !== 'reminder' && t.taskType !== 'dynamic-test'
                  );
                  const taskResponses = selectedDayData.taskResponses || [];
                  const completedTaskIds = taskResponses.map(r => r.taskId);
                  const completedCount = completedTaskIds.length;
                  const totalCount = allTasks.length;
                  const nextTask = allTasks.find(t => !completedTaskIds.includes(t.taskId));

                  return (
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h4 style={styles.sectionTitle}>📝 {t('dayTasks').replace('{day}', selectedDay)}</h4>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb' }}>
                          {completedCount} / {totalCount} {t('completed').toLowerCase()}
                        </div>
                      </div>

                      {/* Completed tasks */}
                      {taskResponses.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                          <h5 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#10b981' }}>✅ {t('completed')}</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {taskResponses.map((resp, rIdx) => {
                              const task = allTasks.find(t => t.taskId === resp.taskId) || {};
                              return (
                                <div key={rIdx} style={{ padding: '14px', backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '20px' }}>{getTaskIcon(task.taskType)}</span>
                                    <div style={{ flex: 1 }}>
                                      <strong style={{ fontSize: '15px', color: '#166534' }}>{getLocalizedText(task.title) || resp.taskId}</strong>
                                      {resp.responseText && <div style={{ marginTop: '4px', fontSize: '13px', color: '#166534' }}>{resp.responseText}</div>}
                                      {resp.selectedItems && Array.isArray(resp.selectedItems) && resp.selectedItems.length > 0 && (
                                        <div style={{ marginTop: '4px', fontSize: '13px', color: '#166534' }}>{resp.selectedItems.join(', ')}</div>
                                      )}
                                    </div>
                                    <span style={{ fontSize: '18px' }}>✔️</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Next active task (ONE at a time) */}
                      {nextTask ? (
                        <div>
                          <h5 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#2563eb' }}>👉 {t('currentTask')}</h5>
                          {renderDynamicTask(nextTask, 0)}
                        </div>
                      ) : (
                        <div style={{ padding: '20px', backgroundColor: '#dcfce7', border: '2px solid #86efac', borderRadius: '12px', textAlign: 'center' }}>
                          <p style={{ margin: 0, color: '#166534', fontWeight: '600', fontSize: '16px' }}>🎉 {t('allTasksCompleted').replace('{day}', selectedDay)}</p>
                          <p style={{ margin: '8px 0 0 0', color: '#166534', fontSize: '14px' }}>{t('greatJob')} {t('nextDayWillUnlock')}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Hidden: Old all-tasks rendering (kept for reference) */}
                {false && selectedDayData.tasks && selectedDayData.tasks.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={styles.sectionTitle}>📝 Day {selectedDay} Content</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {selectedDayData.tasks.filter(task => task.taskType !== 'reminder').map((task, idx) => (
                        <div key={task.taskId} style={{
                          padding: task.taskType === 'task-checklist' ? '32px' : ((task.taskType === 'video' || task.taskType === 'calming-video') ? '28px' : '20px'),
                          backgroundColor: 'white',
                          border: task.taskType === 'task-checklist' ? '3px solid #fbbf24' : '2px solid #e5e7eb',
                          borderRadius: '16px',
                          boxShadow: task.taskType === 'task-checklist' 
                            ? '0 10px 25px -5px rgba(251, 191, 36, 0.3), 0 8px 10px -6px rgba(251, 191, 36, 0.2)' 
                            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          position: task.taskType === 'task-checklist' ? 'relative' : 'static',
                          overflow: task.taskType === 'task-checklist' ? 'hidden' : 'visible'
                        }}>
                          {/* Decorative pattern background for task-checklist */}
                          {task.taskType === 'task-checklist' && (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              opacity: 0.08,
                              pointerEvents: 'none',
                              background: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`,
                              backgroundSize: '40px 40px'
                            }} />
                          )}

                          {/* Task Header */}
                          <div style={{ 
                            marginBottom: (task.taskType === 'video' || task.taskType === 'calming-video') ? '16px' : '12px',
                            position: task.taskType === 'task-checklist' ? 'relative' : 'static',
                            zIndex: task.taskType === 'task-checklist' ? 1 : 'auto'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <span style={{ fontSize: task.taskType === 'task-checklist' ? '36px' : ((task.taskType === 'video' || task.taskType === 'calming-video') ? '32px' : '20px') }}>
                                {getTaskIcon(task.taskType)}
                              </span>
                              <h3 style={{ 
                                margin: 0, 
                                fontSize: task.taskType === 'task-checklist' ? '28px' : ((task.taskType === 'video' || task.taskType === 'calming-video') ? '24px' : '18px'),
                                fontWeight: task.taskType === 'task-checklist' ? '700' : ((task.taskType === 'video' || task.taskType === 'calming-video') ? '700' : '600'),
                                color: task.taskType === 'task-checklist' ? '#78350f' : '#111827',
                                lineHeight: '1.2'
                              }}>
                                {task.title}
                              </h3>
                            </div>
                            {task.description && (
                              <p style={{ 
                                margin: task.taskType === 'task-checklist' ? '0 0 24px 48px' : ((task.taskType === 'video' || task.taskType === 'calming-video') ? '12px 0 0 44px' : '4px 0 0 32px'),
                                fontSize: task.taskType === 'task-checklist' ? '16px' : ((task.taskType === 'video' || task.taskType === 'calming-video') ? '16px' : '14px'),
                                fontStyle: task.taskType === 'task-checklist' ? 'italic' : 'normal',
                                color: task.taskType === 'task-checklist' ? '#92400e' : '#6b7280',
                                lineHeight: '1.6',
                                paddingRight: '20px'
                              }}>
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Task Content Based on Type */}
                          {(task.taskType === 'video' || task.taskType === 'calming-video') && task.content.videoUrl && (
                            <div style={{ 
                              marginTop: '20px',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                              <VideoPlayer
                                videoUrl={task.content.videoUrl}
                                videoTitle={task.title}
                                caregiverId={caregiverId}
                                day={selectedDay}
                                onComplete={() => fetchProgramStatus()}
                              />
                            </div>
                          )}

                          {(task.taskType === 'motivation-message' || task.taskType === 'greeting-message' || task.taskType === 'healthcare-tip') && task.content.textContent && (
                            <div style={{
                              marginTop: '20px',
                              padding: '28px',
                              backgroundColor: '#fffbeb',
                              borderRadius: '12px',
                              border: '2px solid #fde68a',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                              position: 'relative'
                            }}>
                              {/* Subtle decorative pattern */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                opacity: 0.05,
                                pointerEvents: 'none',
                                background: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`,
                                backgroundSize: '30px 30px'
                              }} />

                              <p style={{ 
                                margin: 0,
                                fontSize: '20px',
                                lineHeight: '1.8',
                                color: '#78350f',
                                textAlign: 'center',
                                fontWeight: '500',
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                letterSpacing: '0.3px',
                                whiteSpace: 'pre-wrap',
                                position: 'relative',
                                zIndex: 1
                              }}>
                                {task.content.textContent}
                              </p>

                              {/* Decorative hearts */}
                              <div style={{
                                marginTop: '20px',
                                textAlign: 'center',
                                fontSize: '20px',
                                opacity: 0.6,
                                position: 'relative',
                                zIndex: 1
                              }}>
                                💛 ✨ 💛
                              </div>
                            </div>
                          )}

                          {task.taskType === 'reflection-prompt' && task.content.reflectionQuestion && (
                            <div style={{
                              marginTop: '20px',
                              padding: '28px',
                              backgroundColor: '#fffbeb',
                              borderRadius: '12px',
                              border: '2px solid #fde68a',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                              position: 'relative'
                            }}>
                              {/* Subtle decorative pattern */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                opacity: 0.05,
                                pointerEvents: 'none',
                                background: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`,
                                backgroundSize: '30px 30px'
                              }} />

                              <p style={{ 
                                margin: '0 0 24px 0',
                                fontSize: '18px',
                                fontWeight: '600',
                                lineHeight: '1.6',
                                color: '#78350f',
                                textAlign: 'center',
                                position: 'relative',
                                zIndex: 1
                              }}>
                                {task.content.reflectionQuestion}
                              </p>
                              
                              <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', fontWeight: '600' }}>
                                  <span style={{ color: '#dc2626' }}>😔 {task.content?.sliderLeftLabel || 'Not Well / Very Stressed'}</span>
                                  <span style={{ color: '#16a34a' }}>😊 {task.content?.sliderRightLabel || 'Very Well / Not Stressed'}</span>
                                </div>
                                
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  defaultValue="50"
                                  style={{
                                    width: '100%',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: `linear-gradient(to right, #dc2626 0%, #fbbf24 50%, #16a34a 100%)`,
                                    outline: 'none',
                                    cursor: 'pointer',
                                    WebkitAppearance: 'none',
                                    appearance: 'none'
                                  }}
                                />
                              </div>

                              {/* Decorative hearts */}
                              <div style={{
                                marginTop: '20px',
                                textAlign: 'center',
                                fontSize: '20px',
                                opacity: 0.6,
                                position: 'relative',
                                zIndex: 1
                              }}>
                                💛 ✨ 💛
                              </div>
                            </div>
                          )}

                          {task.taskType === 'audio-message' && task.content.audioUrl && (
                            <div style={{ marginTop: '12px' }}>
                              <audio controls style={{ width: '100%' }}>
                                <source src={task.content.audioUrl} />
                              </audio>
                            </div>
                          )}

                          {task.taskType === 'feeling-check' && task.content?.feelingQuestion && (
                            <div style={{
                              marginTop: '20px',
                              padding: '28px',
                              backgroundColor: '#fffbeb',
                              borderRadius: '12px',
                              border: '2px solid #fde68a',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                              position: 'relative'
                            }}>
                              {/* Subtle decorative pattern */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                opacity: 0.05,
                                pointerEvents: 'none',
                                background: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`,
                                backgroundSize: '30px 30px'
                              }} />

                              <p style={{ 
                                margin: '0 0 24px 0',
                                fontSize: '20px',
                                fontWeight: '600',
                                lineHeight: '1.6',
                                color: '#78350f',
                                textAlign: 'center',
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                position: 'relative',
                                zIndex: 1
                              }}>
                                {task.content.feelingQuestion}
                              </p>
                              
                              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                                {[
                                  { emoji: '😊', label: 'Happy', color: '#10b981' },
                                  { emoji: '😐', label: 'Neutral', color: '#f59e0b' },
                                  { emoji: '😟', label: 'Sad', color: '#ef4444' }
                                ].map((feeling, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleTaskResponse(task.taskId, 'feeling-check', {
                                      question: task.content.feelingQuestion,
                                      response: feeling.label,
                                      emoji: feeling.emoji
                                    })}
                                    style={{
                                      fontSize: '64px',
                                      padding: '24px',
                                      border: '3px solid #fde68a',
                                      borderRadius: '20px',
                                      backgroundColor: '#fffbeb',
                                      cursor: 'pointer',
                                      transition: 'all 0.3s',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      gap: '12px',
                                      minWidth: '140px'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.08)';
                                      e.currentTarget.style.borderColor = feeling.color;
                                      e.currentTarget.style.backgroundColor = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                      e.currentTarget.style.borderColor = '#fde68a';
                                      e.currentTarget.style.backgroundColor = '#fffbeb';
                                    }}
                                  >
                                    <span>{feeling.emoji}</span>
                                    <span style={{ fontSize: '16px', fontWeight: '600', color: feeling.color }}>
                                      {feeling.label}
                                    </span>
                                  </button>
                                ))}
                              </div>

                              {/* Decorative hearts */}
                              <div style={{
                                marginTop: '24px',
                                textAlign: 'center',
                                fontSize: '20px',
                                opacity: 0.6,
                                position: 'relative',
                                zIndex: 1
                              }}>
                                💛 ✨ 💛
                              </div>
                            </div>
                          )}

                          {task.taskType === 'task-checklist' && (
                            <div style={{
                              marginTop: '20px',
                              padding: '28px',
                              backgroundColor: '#fffbeb',
                              borderRadius: '12px',
                              border: '2px solid #fde68a',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                              position: 'relative'
                            }}>
                              {/* Subtle decorative pattern */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                opacity: 0.05,
                                pointerEvents: 'none',
                                background: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`,
                                backgroundSize: '30px 30px'
                              }} />

                              {task.content?.checklistQuestion ? (
                                <>
                                  <p style={{ 
                                    margin: '0 0 24px 0',
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    lineHeight: '1.6',
                                    color: '#78350f',
                                    textAlign: 'center',
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    position: 'relative',
                                    zIndex: 1
                                  }}>
                                    {task.content.checklistQuestion}
                                  </p>
                                </>
                              ) : (
                                <p style={{ 
                                  margin: '0 0 24px 0',
                                  fontSize: '18px',
                                  fontWeight: '500',
                                  lineHeight: '1.6',
                                  color: '#92400e',
                                  textAlign: 'center',
                                  fontStyle: 'italic',
                                  position: 'relative',
                                  zIndex: 1
                                }}>
                                  No question added yet. Please add a question in the admin dashboard.
                                </p>
                              )}
                              
                              {task.content?.checklistQuestion && (
                                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                                  {['Yes', 'No'].map((answer, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleTaskResponse(task.taskId, 'task-checklist', {
                                        question: task.content.checklistQuestion,
                                        answer: answer
                                      })}
                                    style={{
                                      fontSize: '18px',
                                      padding: '16px 48px',
                                      border: '3px solid #fde68a',
                                      borderRadius: '12px',
                                      backgroundColor: '#fffbeb',
                                      cursor: 'pointer',
                                      transition: 'all 0.3s',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                      fontWeight: '600',
                                      color: answer === 'Yes' ? '#10b981' : '#ef4444',
                                      minWidth: '160px'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                      e.currentTarget.style.borderColor = answer === 'Yes' ? '#10b981' : '#ef4444';
                                      e.currentTarget.style.backgroundColor = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                      e.currentTarget.style.borderColor = '#fde68a';
                                      e.currentTarget.style.backgroundColor = '#fffbeb';
                                    }}
                                  >
                                      {answer === 'Yes' ? '✅ ' : '❌ '}{answer}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Decorative hearts */}
                              <div style={{
                                marginTop: '24px',
                                textAlign: 'center',
                                fontSize: '20px',
                                opacity: 0.6,
                                position: 'relative',
                                zIndex: 1
                              }}>
                                💛 ✨ 💛
                              </div>
                            </div>
                          )}

                          {task.taskType === 'interactive-field' && (
                            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                              {/* Problem Field */}
                              <div style={{ flex: 1 }}>
                                <textarea
                                  placeholder="Write your problem here"
                                  rows={6}
                                  style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '14px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    minHeight: '150px'
                                  }}
                                />
                              </div>

                              {/* Solution Field */}
                              <div style={{ flex: 1 }}>
                                <textarea
                                  placeholder="Write your solution here"
                                  rows={6}
                                  style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '14px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    minHeight: '150px'
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {task.taskType === 'activity-selector' && task.content?.activities && task.content.activities.length > 0 && (
                            <div style={{
                              marginTop: '20px',
                              padding: '24px',
                              backgroundColor: '#fffbeb',
                              borderRadius: '12px',
                              border: '2px solid #fde68a',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}>
                              <div style={{ display: 'grid', gap: '12px' }}>
                                {task.content.activities.map((activity, idx) => (
                                  <div 
                                    key={idx} 
                                    style={{ 
                                      padding: '16px', 
                                      backgroundColor: 'white', 
                                      border: '2px solid #fde68a',
                                      borderRadius: '10px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = '#fbbf24';
                                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = '#fde68a';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                      <div style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        backgroundColor: '#fef3c7', 
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        flexShrink: 0
                                      }}>
                                        ✨
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#78350f' }}>
                                          {activity.activityName || `Activity ${idx + 1}`}
                                        </h4>
                                        {activity.activityDescription && (
                                          <p style={{ margin: 0, fontSize: '14px', color: '#92400e', lineHeight: '1.5' }}>
                                            {activity.activityDescription}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Decorative hearts */}
                              <div style={{
                                marginTop: '20px',
                                textAlign: 'center',
                                fontSize: '20px',
                                opacity: 0.6
                              }}>
                                💛 ✨ 💛
                              </div>
                            </div>
                          )}

                          {task.taskType === 'quick-assessment' && (task.content?.questions || []).length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              {(task.content.questions || []).map((q, qi) => {
                                const current = (quickResponses[task.taskId] && quickResponses[task.taskId][qi]) ?? null;
                                return (
                                  <div key={qi} style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '10px' }}>
                                    <p style={{ margin: 0, fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                                      {qi + 1}. {q.questionText}
                                    </p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                      {q.questionType === 'yes-no' && (
                                        ['Yes', 'No'].map((label, li) => (
                                          <button
                                            key={li}
                                            onClick={() => setQuickResponses(prev => ({
                                              ...prev,
                                              [task.taskId]: { ...prev[task.taskId], [qi]: li === 0 ? 1 : 0 }
                                            }))}
                                            style={{
                                              padding: '10px 20px',
                                              borderRadius: '8px',
                                              border: current !== null && ((current === 1 && label === 'Yes') || (current === 0 && label === 'No')) ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                                              background: current !== null && ((current === 1 && label === 'Yes') || (current === 0 && label === 'No')) ? '#dbeafe' : 'white',
                                              cursor: 'pointer',
                                              fontSize: '14px',
                                              fontWeight: '500',
                                              color: current !== null && ((current === 1 && label === 'Yes') || (current === 0 && label === 'No')) ? '#1e40af' : '#374151',
                                              transition: 'all 0.2s'
                                            }}
                                          >{label}</button>
                                        ))
                                      )}

                                      {q.questionType === 'multiple-choice' && (q.options || []).map((opt, oi) => (
                                        <button
                                          key={oi}
                                          onClick={() => setQuickResponses(prev => ({
                                            ...prev,
                                            [task.taskId]: { ...prev[task.taskId], [qi]: opt.optionText }
                                          }))}
                                          style={{
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            border: (quickResponses[task.taskId] && quickResponses[task.taskId][qi]) === opt.optionText ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                                            background: (quickResponses[task.taskId] && quickResponses[task.taskId][qi]) === opt.optionText ? '#dbeafe' : 'white',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: (quickResponses[task.taskId] && quickResponses[task.taskId][qi]) === opt.optionText ? '#1e40af' : '#374151',
                                            transition: 'all 0.2s'
                                          }}
                                        >{opt.optionText}</button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}

                              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                                <button
                                  onClick={async () => {
                                    const responsesObj = {};
                                    const questionTexts = {};
                                    (task.content?.questions || []).forEach((q, qi) => {
                                      const resp = quickResponses[task.taskId] && quickResponses[task.taskId][qi];
                                      responsesObj[String(qi)] = resp;
                                      questionTexts[String(qi)] = q.questionText;
                                    });

                                    const unanswered = Object.entries(responsesObj).filter(([k, v]) => v === null || v === undefined);
                                    if (unanswered.length > 0) {
                                      showValidationPrompt('Please answer all questions before submitting.');
                                      return;
                                    }

                                    const submissionTitle = 'Submitting your quick check-in';
                                    const submissionMessage = 'Syncing your responses and preparing the next task…';

                                    try {
                                      showSubmissionToast({
                                        type: 'task',
                                        title: submissionTitle,
                                        message: submissionMessage,
                                        hint: 'We’ll surface the next activity as soon as it loads.',
                                        icon: '📝'
                                      });
                                      setSubmittingQuick(prev => ({ ...prev, [task.taskId]: true }));
                                      const res = await fetch('/api/caregiver/daily-assessment', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          caregiverId,
                                          day: selectedDay,
                                          assessmentType: 'quick_assessment',
                                          responses: responsesObj,
                                          language: getLanguageKey(),
                                          questionTexts
                                        })
                                      });

                                      const data = await res.json();
                                      if (res.ok && data.success) {
                                        showSuccessToast('Quick assessment saved!');
                                        await fetchProgramStatus();
                                      } else {
                                        console.error('Failed to save quick assessment', data);
                                        showErrorToast('Failed to save quick assessment. Please try again.');
                                      }
                                    } catch (err) {
                                      console.error('Error submitting quick assessment', err);
                                      showErrorToast('Error submitting quick assessment. Please try again.');
                                    } finally {
                                      setSubmittingQuick(prev => ({ ...prev, [task.taskId]: false }));
                                      hideSubmissionToast();
                                    }
                                  }}
                                  disabled={submittingQuick[task.taskId]}
                                  style={{
                                    padding: '12px 24px',
                                    backgroundColor: submittingQuick[task.taskId] ? '#9ca3af' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: submittingQuick[task.taskId] ? 'not-allowed' : 'pointer',
                                    opacity: submittingQuick[task.taskId] ? 0.6 : 1
                                  }}
                                >
                                  {submittingQuick[task.taskId] ? '⏳ Submitting...' : '✅ Submit Answers'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Old Video Section (backward compatibility) */}
                {getLocalizedText(selectedDayData.videoUrl) && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={styles.sectionTitle}>📹 Video Lesson</h4>
                    
                    <VideoPlayer
                  videoUrl={getLocalizedText(selectedDayData.videoUrl)}
                  videoTitle={getLocalizedText(selectedDayData.videoTitle)}
                  initialProgress={selectedDayData.videoProgress || 0}
                  isCompleted={selectedDayData.videoCompleted || false}
                  caregiverId={caregiverId}
                  day={selectedDay}
                  onProgressUpdate={async (progressPercent) => {
                    try {
                      await fetch('/api/caregiver/update-progress', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          caregiverId,
                          day: selectedDay,
                          videoProgress: progressPercent
                        })
                      });
                    } catch (err) {
                      console.error('Failed to update video progress:', err);
                    }
                  }}
                  onComplete={async () => {
                    await handleVideoComplete(selectedDay);
                  }}
                />

                {/* Audio Content (if available) */}
                {getLocalizedText(selectedDayData.audioUrl) && (
                  <div>
                    <AudioPlayer
                      audioUrl={getLocalizedText(selectedDayData.audioUrl)}
                      audioTitle={getLocalizedText(selectedDayData.audioTitle) || `Day ${selectedDay} Audio Content`}
                      isVideoCompleted={selectedDayData.videoCompleted || false}
                      caregiverId={caregiverId}
                      day={selectedDay}
                      onComplete={() => {
                        console.log(`Audio completed for Day ${selectedDay}`);
                        fetchProgramStatus();
                      }}
                      style={{ marginTop: '16px' }}
                    />
                  </div>
                )}

                {/* Day 0 Quick Assessment - Show after video completion */}
                {(() => {
                  const shouldShow = selectedDay === 0 && showAssessment;
                  console.log('🔍 Day 0 Assessment Display Check:', {
                    selectedDay,
                    showAssessment,
                    shouldShow,
                    selectedDayData: selectedDayData ? 'found' : 'not found',
                    videoCompleted: selectedDayData?.videoCompleted,
                    dailyAssessment: selectedDayData?.dailyAssessment
                  });
                  return shouldShow;
                })() && (
                  <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                    <DailyAssessment
                      day={selectedDay}
                      caregiverId={caregiverId}
                      onComplete={handleAssessmentComplete}
                      onBack={() => setShowAssessment(false)}
                    />
                  </div>
                )}

                {/* Day 0 Assessment Completed Message */}
                {selectedDay === 0 && selectedDayData.videoCompleted && selectedDayData.dailyAssessment && (
                  <div style={{
                    marginTop: '24px',
                    marginBottom: '24px',
                    padding: '20px',
                    backgroundColor: '#dcfce7',
                    border: '2px solid #86efac',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: 0, color: '#166534', fontWeight: '600', fontSize: '18px' }}>
                      ✅ Quick Assessment Complete!
                    </p>
                    <p style={{ margin: '8px 0 16px 0', color: '#166534', fontSize: '14px' }}>
                      Thank you for completing the Day 0 assessment. Your responses will help personalize your content.
                    </p>
                    
                    {/* Mark Day 0 as Complete Button */}
                    {!selectedDayData.completedAt && (
                      <button
                        onClick={() => handleDayComplete(selectedDay)}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                      >
                        🎉 {t('markDay0Complete')}
                      </button>
                    )}
                    
                    {/* Day 0 Already Completed Message */}
                    {selectedDayData.completedAt && (
                      <div style={{
                        padding: '12px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        color: '#374151'
                      }}>
                        ✅ {t('dayCompletedOn').replace('{day}', 0).replace('{date}', new Date(selectedDayData.completedAt).toLocaleDateString())}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Tasks Section - Only unlocked after video is watched */}
            <div>
              <h4 style={styles.sectionTitle}>📝 {t('dailyTasks')}</h4>
              
              {/* Show lock message if video not watched */}
              {!selectedDayData.videoCompleted && getLocalizedText(selectedDayData.videoUrl) && (
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#fef3c7', 
                  border: '2px solid #fde68a',
                  borderRadius: '8px',
                  color: '#92400e',
                  marginBottom: '16px'
                }}>
                  <p style={{ margin: 0, fontWeight: '600', marginBottom: '4px' }}>
                    🔒 {t('tasksLocked')}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    {t('completeWatchingVideo')}
                  </p>
                </div>
              )}
              
              {/* Tasks content - only shown if video is watched OR no video exists */}
              {(selectedDayData.videoCompleted || !getLocalizedText(selectedDayData.videoUrl)) && (
                <>
                  {selectedDayData.taskResponses && selectedDayData.taskResponses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedDayData.taskResponses.map((task, index) => (
                        <div key={index} style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                            {task.taskDescription?.[getLanguageKey()] || task.taskDescription}
                          </p>
                          {task.completedAt && (
                            <p style={{ fontSize: '12px', color: '#16a34a', margin: '4px 0 0 0' }}>
                              ✅ {t('completedOn').replace('{date}', new Date(task.completedAt).toLocaleDateString())}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px' }}>
                      <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>
                        {t('completeTasksToUnlock')}
                      </p>
                    </div>
                  )}
                  
                  {!selectedDayData.tasksCompleted && (
                    <button
                      onClick={() => handleTasksComplete(selectedDay)}
                      style={{
                        ...styles.button,
                        backgroundColor: tasksButtonHovered ? '#1d4ed8' : '#2563eb',
                        color: 'white'
                      }}
                      onMouseEnter={() => setTasksButtonHovered(true)}
                      onMouseLeave={() => setTasksButtonHovered(false)}
                    >
                      {t('markTasksAsComplete')}
                    </button>
                  )}
                </>
              )}
            </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div style={styles.infoBox}>
        <h4 style={{ fontWeight: '600', color: '#78350f', marginTop: 0, marginBottom: '8px' }}>
          💡 {t('programInformation')}
        </h4>
        <ul style={{ fontSize: '14px', color: '#78350f', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
          <li>{t('completeEachDayVideo')}</li>
          <li>{t('newDaysUnlock')}</li>
          <li>{t('day1IncludesAssessment')}</li>
          <li>{t('contactSupport')}: <strong>{t('teleManas')} (14416)</strong></li>
        </ul>
      </div>
    </div>
  );
}
