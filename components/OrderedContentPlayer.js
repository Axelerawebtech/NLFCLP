import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';

export default function OrderedContentPlayer({ caregiverId, day, burdenLevel }) {
  const { currentLanguage } = useLanguage();
  const [orderedContent, setOrderedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  // Map language codes
  const getLanguageKey = () => {
    const map = { en: 'english', kn: 'kannada', hi: 'hindi' };
    return map[currentLanguage] || 'english';
  };

  useEffect(() => {
    if (caregiverId && day !== undefined) {
      fetchOrderedContent();
    }
  }, [caregiverId, day, burdenLevel, currentLanguage]);

  const fetchOrderedContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        caregiverId,
        day: day.toString(),
        language: getLanguageKey()
      });

      const response = await fetch(`/api/caregiver/ordered-content?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrderedContent(data.data || []);
        setCurrentContentIndex(data.currentContentIndex || 0);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load content');
      }
    } catch (err) {
      console.error('Error fetching ordered content:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleContentComplete = async (contentId, completionData = {}) => {
    try {
      const response = await fetch('/api/caregiver/ordered-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          day,
          contentId,
          action: 'complete',
          completionData
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Content completed: ${contentId}`);
        
        // Refresh content to get updated unlock status
        await fetchOrderedContent();
        
        // Show success message for content completion
        const content = orderedContent.find(c => c._id === contentId);
        if (content) {
          console.log(`🎉 Completed: ${content.title}`);
        }
      } else {
        console.error('Failed to mark content as completed');
      }
    } catch (err) {
      console.error('Error completing content:', err);
    }
  };

  const handleContentProgress = async (contentId, progress, progressData = {}) => {
    try {
      const response = await fetch('/api/caregiver/ordered-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          day,
          contentId,
          action: 'progress',
          progress,
          completionData: progressData
        })
      });

      if (response.ok) {
        // Optionally refresh content if progress triggers completion
        if (progress >= 100) {
          await fetchOrderedContent();
        }
      }
    } catch (err) {
      console.error('Error updating content progress:', err);
    }
  };

  const renderContent = (content, index) => {
    const isUnlocked = content.completion?.isUnlocked || false;
    const isCompleted = content.completion?.isCompleted || false;
    const progress = content.completion?.progress || 0;

    // Base content container styles
    const containerStyle = {
      marginBottom: '24px',
      padding: '20px',
      borderRadius: '12px',
      border: '2px solid',
      borderColor: isUnlocked ? (isCompleted ? '#16a34a' : '#2563eb') : '#d1d5db',
      backgroundColor: isUnlocked ? (isCompleted ? '#f0fdf4' : '#ffffff') : '#f9fafb',
      opacity: isUnlocked ? 1 : 0.6,
      transition: 'all 0.3s ease'
    };

    const headerStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '1px solid #e5e7eb'
    };

    const titleStyle = {
      fontSize: '18px',
      fontWeight: '600',
      color: isCompleted ? '#16a34a' : '#1f2937',
      margin: 0
    };

    const statusStyle = {
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '6px',
      fontWeight: '500',
      backgroundColor: isCompleted ? '#dcfce7' : isUnlocked ? '#dbeafe' : '#f3f4f6',
      color: isCompleted ? '#16a34a' : isUnlocked ? '#2563eb' : '#6b7280'
    };

    return (
      <div key={content._id} style={containerStyle}>
        {/* Content Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: isCompleted ? '#16a34a' : isUnlocked ? '#2563eb' : '#9ca3af',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {content.orderNumber}
            </span>
            <h3 style={titleStyle}>{content.title}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={statusStyle}>
              {isCompleted ? '✅ Completed' : isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}
            </span>
            <span style={{
              fontSize: '11px',
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {content.contentType.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content Description */}
        {content.description && (
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '16px',
            lineHeight: '1.5'
          }}>
            {content.description}
          </p>
        )}

        {/* Progress Bar */}
        {isUnlocked && progress > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Progress</span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>{progress}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#e5e7eb',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: isCompleted ? '#16a34a' : '#2563eb',
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}

        {/* Locked Content Message */}
        {!isUnlocked && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#92400e', fontWeight: '500' }}>
              🔒 Complete the previous content to unlock this item
            </p>
            {index > 0 && (
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#92400e' }}>
                Waiting for: <strong>{orderedContent[index - 1]?.title}</strong>
              </p>
            )}
          </div>
        )}

        {/* Unlocked Content */}
        {isUnlocked && (
          <div>
            {/* Video Content */}
            {content.contentType === 'video' && content.videoUrl && (
              <VideoPlayer
                videoUrl={content.videoUrl}
                videoTitle={content.title}
                initialProgress={progress}
                isCompleted={isCompleted}
                caregiverId={caregiverId}
                day={day}
                onProgressUpdate={(progressPercent) => {
                  handleContentProgress(content._id, progressPercent, {
                    videoProgress: progressPercent
                  });
                }}
                onComplete={() => {
                  handleContentComplete(content._id, {
                    contentType: 'video',
                    completionTime: new Date().toISOString()
                  });
                }}
              />
            )}

            {/* Audio Content */}
            {content.contentType === 'audio' && content.audioUrl && (
              <AudioPlayer
                audioUrl={content.audioUrl}
                audioTitle={content.title}
                isVideoCompleted={true}
                caregiverId={caregiverId}
                day={day}
                onComplete={() => {
                  handleContentComplete(content._id, {
                    contentType: 'audio',
                    completionTime: new Date().toISOString()
                  });
                }}
              />
            )}

            {/* Text Content */}
            {content.contentType === 'text' && content.textContent && (
              <div>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '16px'
                }}>
                  <div 
                    style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }}
                    dangerouslySetInnerHTML={{ __html: content.textContent.replace(/\n/g, '<br>') }}
                  />
                </div>
                {!isCompleted && (
                  <button
                    onClick={() => handleContentComplete(content._id, {
                      contentType: 'text',
                      completionTime: new Date().toISOString()
                    })}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Mark as Read
                  </button>
                )}
              </div>
            )}

            {/* Quiz/Assessment Content */}
            {(content.contentType === 'quiz' || content.contentType === 'assessment') && content.questions && (
              <div>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #0ea5e9',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#0369a1' }}>
                    {content.contentType === 'quiz' ? '📝 Quiz' : '📋 Assessment'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
                    Answer all questions to complete this section
                  </p>
                </div>
                {/* Quiz component would go here */}
                <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                  Quiz functionality coming soon...
                </p>
              </div>
            )}

            {/* Task Content */}
            {content.contentType === 'task' && content.tasks && (
              <div>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #16a34a',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#166534' }}>📋 Tasks to Complete</h4>
                  {content.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                      <span style={{ fontSize: '14px', color: '#166534' }}>
                        {task.taskDescription}
                      </span>
                    </div>
                  ))}
                </div>
                {!isCompleted && (
                  <button
                    onClick={() => handleContentComplete(content._id, {
                      contentType: 'task',
                      completionTime: new Date().toISOString()
                    })}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Mark Tasks Complete
                  </button>
                )}
              </div>
            )}

            {/* Completion Message */}
            {isCompleted && (
              <div style={{
                padding: '12px',
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: '6px',
                textAlign: 'center',
                marginTop: '16px'
              }}>
                <span style={{ fontSize: '14px', color: '#166534', fontWeight: '500' }}>
                  ✅ Completed on {new Date(content.completion.completedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f4f6',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#6b7280', margin: 0 }}>Loading content...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#dc2626', margin: 0 }}>❌ {error}</p>
      </div>
    );
  }

  if (orderedContent.length === 0) {
    return (
      <div style={{
        padding: '40px 20px',
        backgroundColor: '#f9fafb',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
          📭 No content available for Day {day}
        </p>
        <p style={{ color: '#9ca3af', margin: '8px 0 0 0', fontSize: '14px' }}>
          Content will appear here once admin uploads it
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '16px' }}>
          📚 Day {day} Learning Path
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
          Complete content in order to unlock the next item. {orderedContent.filter(c => c.completion?.isCompleted).length} of {orderedContent.length} completed.
        </p>
      </div>

      {orderedContent.map((content, index) => renderContent(content, index))}
    </div>
  );
}