import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import InlineBurdenAssessment from './InlineBurdenAssessment';
import DailyAssessment from './DailyAssessment';
import NotificationManager from './NotificationManager';
import ReminderDisplayCard from './ReminderDisplayCard';

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
            {getTaskIcon(task.taskType)} {task.title}
          </h5>
          {task.description && (
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{task.description}</p>
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
                  onComplete={() => fetchProgramStatus()}
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
                </div>
              )}
            </div>
          </div>
        );

      case 'reflection-prompt':
        const [sliderValue, setSliderValue] = useState(50);
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
                onComplete={() => fetchProgramStatus()}
              />
            )}
          </div>
        );

      case 'interactive-field':
        return (
          <div key={task.taskId || index} style={taskStyle}>
            {taskHeader}
            {/* Two textareas side by side */}
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
          </div>
        );

      case 'task-checklist':
        return (
          <div key={task.taskId || index} style={taskStyle}>
            {taskHeader}
            {task.content?.checklistItems && task.content.checklistItems.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                {task.content.checklistItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontSize: '14px', color: '#374151' }}>{item.itemText}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'activity-selector':
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
              {task.content?.activities && task.content.activities.length > 0 && (
                <div style={{
                  marginTop: '24px',
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

              {(!task.content?.activities || task.content.activities.length === 0) && (
                <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#9ca3af', fontStyle: 'italic' }}>
                  No activities available
                </p>
              )}
            </div>
          </div>
        );

      case 'feeling-check':
        const [selectedFeeling, setSelectedFeeling] = useState(null);
        const feelings = [
          { emoji: '😊', label: 'Great', color: '#10b981' },
          { emoji: '🙂', label: 'Good', color: '#3b82f6' },
          { emoji: '😐', label: 'Okay', color: '#f59e0b' },
          { emoji: '😔', label: 'Not Good', color: '#ef4444' }
        ];
        
        return (
          <div key={task.taskId || index} style={{...taskStyle, backgroundColor: '#fef2f2', borderColor: '#fca5a5', borderWidth: '2px'}}>
            {taskHeader}
            {task.content?.feelingQuestion && (
              <div style={{ marginTop: '14px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', lineHeight: '1.6', color: '#7f1d1d' }}>
                  {task.content.feelingQuestion}
                </p>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {feelings.map((feeling, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFeeling(idx)}
                      style={{
                        fontSize: '48px',
                        padding: '16px',
                        border: selectedFeeling === idx ? `3px solid ${feeling.color}` : '2px solid #e5e7eb',
                        borderRadius: '16px',
                        backgroundColor: selectedFeeling === idx ? '#fffbeb' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        transform: selectedFeeling === idx ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: selectedFeeling === idx ? `0 4px 12px ${feeling.color}40` : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        minWidth: '100px'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedFeeling !== idx) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.borderColor = feeling.color;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedFeeling !== idx) {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }
                      }}
                    >
                      <span>{feeling.emoji}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
                        {feeling.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                      alert('Please answer all questions before submitting');
                      return;
                    }

                    try {
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
                        alert('✅ Quick assessment saved');
                        // Refresh program data
                        await fetchProgramStatus();
                      } else {
                        console.error('Failed to save quick assessment', data);
                        alert('Failed to save quick assessment');
                      }
                    } catch (err) {
                      console.error('Error submitting quick assessment', err);
                      alert('Error submitting quick assessment');
                    } finally {
                      setSubmittingQuick(prev => ({ ...prev, [task.taskId]: false }));
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
    }
  };

  const fetchProgramStatus = async () => {
    try {
      const response = await fetch(`/api/caregiver/check-program-status?caregiverId=${caregiverId}&_t=${Date.now()}`);
      const data = await response.json();
      
      if (data.success) {
        // Enhanced program data with dynamic content
        const enhancedData = { ...data.data };
        
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
                language: langKey
              });
              
              console.log(`🎯 Fetching dynamic content for Day ${dayModule.day} (${langKey})`);
              const contentResponse = await fetch(`/api/caregiver/dynamic-day-content?${queryParams}`);
              
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
                
                const mergedModule = {
                  ...baseModule,
                  dayName: contentData.dayName || `Day ${dayModule.day}`,
                  hasTest: contentData.hasTest || false,
                  tasks: contentData.tasks || [],
                  totalTasks: contentData.totalTasks || 0,
                  levelLabel: contentData.levelLabel || '',
                  // Preserve burden assessment data from original day module
                  burdenTestCompleted: baseModule.burdenTestCompleted || false,
                  burdenLevel: baseModule.burdenLevel || contentData.burdenLevel || enhancedData.burdenLevel,
                  burdenScore: baseModule.burdenScore,
                  // Add test if available
                  test: contentData.test || null
                };
                
                console.log(`✅ Day ${dayModule.day} merged module:`, mergedModule);
                
                return mergedModule;
              } else {
                console.warn(`⚠️ Day ${dayModule.day} content not found`);
                const baseModule = dayModule.toObject ? dayModule.toObject() : dayModule;
                
                return {
                  ...baseModule,
                  tasks: [],
                  totalTasks: 0,
                  // Preserve burden assessment data even when no content
                  burdenTestCompleted: baseModule.burdenTestCompleted || false,
                  burdenLevel: baseModule.burdenLevel || enhancedData.burdenLevel,
                  burdenScore: baseModule.burdenScore
                };
              }
            } catch (contentError) {
              console.error(`❌ Error fetching content for Day ${dayModule.day}:`, contentError);
              const baseModule = dayModule.toObject ? dayModule.toObject() : dayModule;
              
              return {
                ...baseModule,
                tasks: [],
                totalTasks: 0,
                // Preserve burden assessment data even on error
                burdenTestCompleted: baseModule.burdenTestCompleted || false,
                burdenLevel: baseModule.burdenLevel || enhancedData.burdenLevel,
                burdenScore: baseModule.burdenScore
              };
            }
          });
          
          const enhancedDayModules = await Promise.all(contentPromises);
          enhancedData.dayModules = enhancedDayModules;
          
          // Debug burden data mapping
          console.log('🔍 Enhanced data burden info:', {
            overallBurdenLevel: enhancedData.burdenLevel,
            burdenTestCompleted: enhancedData.burdenTestCompleted,
            day1Module: enhancedDayModules.find(m => m.day === 1)
          });
        }
        
        setProgramData(enhancedData);
        
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
            
            // Delay the program status fetch slightly to ensure showAssessment state is set first
            setTimeout(() => {
              console.log('📡 Fetching program status after assessment state set');
              fetchProgramStatus();
            }, 100);
          } else {
            console.log('❌ Day 0 assessment already completed, not showing');
            // Still fetch program status for other days
            fetchProgramStatus();
          }
        } else {
          // For other days, fetch immediately
          fetchProgramStatus();
        }
      } else {
        console.error('Failed to update video progress:', response.status);
      }
    } catch (err) {
      console.error('Failed to update video progress:', err);
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

  const handleTestSubmit = async () => {
    try {
      setSubmittingTest(true);
      
      // Get current day data
      const selectedDayData = programData.days[selectedDay];
      if (!selectedDayData?.test) {
        alert('Test configuration not found');
        return;
      }
      
      const test = selectedDayData.test;
      const questions = test.questions || [];
      
      // Validate all questions are answered
      if (Object.keys(testAnswers).length !== questions.length) {
        alert('Please answer all questions before submitting');
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
      
      alert(`Assessment complete! Your burden level: ${burdenLevel.charAt(0).toUpperCase() + burdenLevel.slice(1)}`);
      
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setSubmittingTest(false);
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
    
    if (diff <= 0) return 'Available now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  };

  const getBurdenLevelInfo = (level) => {
    switch (level?.toLowerCase()) {
      case 'mild':
        return { 
          backgroundColor: '#dcfce7', 
          color: '#166534', 
          borderColor: '#86efac', 
          text: 'Mild Burden',
          emoji: '😊'
        };
      case 'moderate':
        return { 
          backgroundColor: '#fef3c7', 
          color: '#92400e', 
          borderColor: '#fde68a', 
          text: 'Moderate Burden',
          emoji: '😐'
        };
      case 'severe':
        return { 
          backgroundColor: '#fee2e2', 
          color: '#991b1b', 
          borderColor: '#fecaca', 
          text: 'Severe Burden',
          emoji: '😟'
        };
      default:
        return { 
          backgroundColor: '#f3f4f6', 
          color: '#1f2937', 
          borderColor: '#d1d5db', 
          text: 'Not Assessed',
          emoji: '❓'
        };
    }
  };

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

  const selectedDayData = programData.dayModules?.find(m => m.day === selectedDay);
  const burdenInfo = getBurdenLevelInfo(programData.burdenLevel);

  return (
    <div style={styles.container}>
      {/* Notification Manager for Reminders */}
      <NotificationManager caregiverId={caregiverId} day={selectedDay} />

      {/* Progress Overview */}
      <div style={styles.headerCard}>
        <div style={styles.headerFlex}>
          <div>
            <h2 style={styles.title}>7-Day Caregiver Support Program</h2>
            <p style={styles.subtitle}>Your journey to better caregiving</p>
          </div>
          <div style={styles.progressBox}>
            <p style={styles.progressText}>{Math.round(programData.overallProgress || 0)}%</p>
            <p style={styles.progressLabel}>Complete</p>
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
              Your Burden Assessment Result:
            </p>
            <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
              {burdenInfo.text}
            </p>
            <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8, margin: 0 }}>
              Your program content has been personalized based on this assessment
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
          const timeRemaining = getTimeRemaining(dayModule.scheduledUnlockAt);
          
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
                  Day {dayModule.day}
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
                {getLocalizedText(dayModule.videoTitle, 'Module Content')}
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
                  Day {selectedDay}: {getLocalizedText(selectedDayData.videoTitle, 'Program Content')}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  {selectedDayData.progressPercentage === 100 
                    ? '✅ Completed' 
                    : `${selectedDayData.progressPercentage || 0}% Complete`}
                </p>
              </div>
              
              {selectedDayData.completedAt && (
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  Completed: {new Date(selectedDayData.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          
          <div style={styles.contentBody}>
            {/* Day 1 Special Handling: Burden Test → Video → Tasks */}
            {selectedDay === 1 && (
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
                    <h4 style={styles.sectionTitle}>📝 Daily Tasks</h4>
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
                      🎉 Day 1 Complete!
                    </p>
                    <p style={{ margin: '8px 0 0 0', color: '#166534', fontSize: '14px' }}>
                      Great job! Day 2 will unlock in 24 hours.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Other Days: Normal Video → Tasks Flow (including Day 0 with dynamic content) */}
            {selectedDay !== 1 && (
              <>
                {/* Dynamic Test (if available and not completed) */}
                {selectedDayData.test && !selectedDayData.testCompleted && (
                  <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '12px', border: '2px solid #fbbf24' }}>
                    <h4 style={{ ...styles.sectionTitle, color: '#92400e' }}>
                      📊 {selectedDayData.test.testName || 'Assessment'}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#78350f', marginBottom: '16px' }}>
                      Please complete this assessment to personalize your content.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {selectedDayData.test.questions?.map((question, qIdx) => (
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
                                  cursor: 'pointer', 
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
                                    setTestAnswers(prev => ({
                                      ...prev,
                                      [qIdx]: parseInt(e.target.value)
                                    }));
                                  }}
                                  style={{ width: '18px', height: '18px' }}
                                />
                                <span style={{ fontSize: '14px', color: '#374151' }}>{option.optionText}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleTestSubmit}
                      disabled={submittingTest || Object.keys(testAnswers).length !== selectedDayData.test.questions?.length}
                      style={{
                        marginTop: '20px',
                        padding: '12px 24px',
                        backgroundColor: submittingTest || Object.keys(testAnswers).length !== selectedDayData.test.questions?.length ? '#d1d5db' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: submittingTest || Object.keys(testAnswers).length !== selectedDayData.test.questions?.length ? 'not-allowed' : 'pointer',
                        width: '100%',
                        opacity: submittingTest || Object.keys(testAnswers).length !== selectedDayData.test.questions?.length ? 0.6 : 1
                      }}
                    >
                      {submittingTest ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                    
                    {Object.keys(testAnswers).length < selectedDayData.test.questions?.length && (
                      <p style={{ fontSize: '13px', color: '#92400e', marginTop: '8px', textAlign: 'center' }}>
                        Please answer all questions ({Object.keys(testAnswers).length}/{selectedDayData.test.questions?.length} completed)
                      </p>
                    )}
                  </div>
                )}

                {/* Dynamic Tasks */}
                {selectedDayData.tasks && selectedDayData.tasks.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={styles.sectionTitle}>📝 Day {selectedDay} Content</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {selectedDayData.tasks.filter(task => task.taskType !== 'reminder').map((task, idx) => (
                        <div key={task.taskId} style={{
                          padding: (task.taskType === 'video' || task.taskType === 'calming-video') ? '28px' : '20px',
                          backgroundColor: 'white',
                          border: '2px solid #e5e7eb',
                          borderRadius: '16px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}>
                          {/* Task Header */}
                          <div style={{ marginBottom: (task.taskType === 'video' || task.taskType === 'calming-video') ? '16px' : '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <span style={{ fontSize: (task.taskType === 'video' || task.taskType === 'calming-video') ? '32px' : '20px' }}>
                                {getTaskIcon(task.taskType)}
                              </span>
                              <h3 style={{ 
                                margin: 0, 
                                fontSize: (task.taskType === 'video' || task.taskType === 'calming-video') ? '24px' : '18px',
                                fontWeight: (task.taskType === 'video' || task.taskType === 'calming-video') ? '700' : '600',
                                color: '#111827',
                                lineHeight: '1.2'
                              }}>
                                {task.title}
                              </h3>
                            </div>
                            {task.description && (
                              <p style={{ 
                                margin: (task.taskType === 'video' || task.taskType === 'calming-video') ? '12px 0 0 44px' : '4px 0 0 32px',
                                fontSize: (task.taskType === 'video' || task.taskType === 'calming-video') ? '16px' : '14px',
                                color: '#6b7280',
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

                          {task.taskType === 'task-checklist' && task.content.checklistItems && task.content.checklistItems.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              {task.content.checklistItems.map((item, itemIdx) => (
                                <label key={itemIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', cursor: 'pointer' }}>
                                  <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                                  <span style={{ fontSize: '14px' }}>{item.itemText}</span>
                                </label>
                              ))}
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
                                      alert('Please answer all questions before submitting');
                                      return;
                                    }

                                    try {
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
                                        alert('✅ Quick assessment saved');
                                        await fetchProgramStatus();
                                      } else {
                                        console.error('Failed to save quick assessment', data);
                                        alert('Failed to save quick assessment');
                                      }
                                    } catch (err) {
                                      console.error('Error submitting quick assessment', err);
                                      alert('Error submitting quick assessment');
                                    } finally {
                                      setSubmittingQuick(prev => ({ ...prev, [task.taskId]: false }));
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
                        🎉 Mark Day 0 as Complete & Start Day 1
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
                        ✅ Day 0 completed on {new Date(selectedDayData.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Tasks Section - Only unlocked after video is watched */}
            <div>
              <h4 style={styles.sectionTitle}>📝 Daily Tasks</h4>
              
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
                    🔒 Tasks Locked
                  </p>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Complete watching the video above to unlock daily tasks.
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
                              ✅ Completed {new Date(task.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px' }}>
                      <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>
                        Complete the tasks for this day to unlock the next module.
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
                      Mark Tasks as Complete
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
          💡 Program Information
        </h4>
        <ul style={{ fontSize: '14px', color: '#78350f', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
          <li>Complete each day's video and tasks to progress</li>
          <li>New days unlock automatically after the wait period</li>
          <li>Day 1 includes a burden assessment that personalizes your content</li>
          <li>Contact support if you need assistance: <strong>Tele-MANAS (14416)</strong></li>
        </ul>
      </div>
    </div>
  );
}
