import { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';

export default function SequentialContentPlayer({
  videoUrl,
  audioUrl,
  videoTitle,
  audioTitle,
  day,
  caregiverId,
  onComplete,
  onProgressUpdate
}) {
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('video'); // 'video', 'audio', 'completed'

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`day_${day}_progress_${caregiverId}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setVideoCompleted(progress.videoCompleted || false);
      setAudioCompleted(progress.audioCompleted || false);
      
      if (progress.videoCompleted && progress.audioCompleted) {
        setCurrentStage('completed');
        setOverallProgress(100);
      } else if (progress.videoCompleted) {
        setCurrentStage('audio');
        setOverallProgress(50);
      } else {
        setCurrentStage('video');
        setOverallProgress(0);
      }
    }
  }, [day, caregiverId]);

  // Save progress to localStorage and call onProgressUpdate
  const saveProgress = (videoComplete, audioComplete) => {
    const progress = {
      videoCompleted: videoComplete,
      audioCompleted: audioComplete,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(`day_${day}_progress_${caregiverId}`, JSON.stringify(progress));
    
    // Calculate overall progress
    let overallPercentage = 0;
    if (videoComplete && audioComplete) {
      overallPercentage = 100;
      setCurrentStage('completed');
    } else if (videoComplete) {
      overallPercentage = 50;
      setCurrentStage('audio');
    } else {
      overallPercentage = 0;
      setCurrentStage('video');
    }
    
    setOverallProgress(overallPercentage);
    
    if (onProgressUpdate) {
      onProgressUpdate({
        day,
        videoCompleted: videoComplete,
        audioCompleted: audioComplete,
        overallProgress: overallPercentage,
        isComplete: videoComplete && audioComplete
      });
    }
    
    // Call onComplete when both video and audio are done
    if (videoComplete && audioComplete && onComplete) {
      onComplete();
    }
  };

  const handleVideoComplete = () => {
    setVideoCompleted(true);
    saveProgress(true, audioCompleted);
  };

  const handleAudioComplete = () => {
    setAudioCompleted(true);
    saveProgress(videoCompleted, true);
  };

  const getProgressSteps = () => {
    const steps = [];
    
    if (videoUrl) {
      steps.push({
        name: 'Video Content',
        completed: videoCompleted,
        active: currentStage === 'video'
      });
    }
    
    if (audioUrl) {
      steps.push({
        name: 'Audio Content',
        completed: audioCompleted,
        active: currentStage === 'audio'
      });
    }
    
    return steps;
  };

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    progressHeader: {
      marginBottom: '24px'
    },
    progressTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
    },
    progressBar: {
      backgroundColor: '#f3f4f6',
      borderRadius: '999px',
      height: '8px',
      marginBottom: '16px'
    },
    progressFill: {
      backgroundColor: '#10b981',
      height: '100%',
      borderRadius: '999px',
      transition: 'width 0.5s ease',
      width: `${overallProgress}%`
    },
    progressText: {
      fontSize: '14px',
      color: '#6b7280',
      textAlign: 'center'
    },
    stepIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px'
    },
    step: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '999px',
      fontSize: '14px',
      fontWeight: '500'
    },
    stepActive: {
      backgroundColor: '#dbeafe',
      color: '#1d4ed8',
      border: '2px solid #3b82f6'
    },
    stepCompleted: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '2px solid #10b981'
    },
    stepInactive: {
      backgroundColor: '#f9fafb',
      color: '#6b7280',
      border: '2px solid #e5e7eb'
    },
    contentSection: {
      marginBottom: '24px'
    },
    contentTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '12px'
    },
    contentMessage: {
      backgroundColor: '#fef3c7',
      border: '1px solid #fde68a',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '14px',
      color: '#92400e',
      textAlign: 'center'
    },
    completionMessage: {
      backgroundColor: '#d1fae5',
      border: '1px solid #a7f3d0',
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center'
    },
    completionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#065f46',
      marginBottom: '8px'
    },
    completionText: {
      fontSize: '14px',
      color: '#047857'
    }
  };

  const progressSteps = getProgressSteps();

  return (
    <div style={styles.container}>
      {/* Progress Header */}
      <div style={styles.progressHeader}>
        <h3 style={styles.progressTitle}>Day {day} Content Progress</h3>
        <div style={styles.progressBar}>
          <div style={styles.progressFill}></div>
        </div>
        <div style={styles.progressText}>
          {overallProgress}% Complete
        </div>
      </div>

      {/* Step Indicator */}
      <div style={styles.stepIndicator}>
        {progressSteps.map((step, index) => (
          <div
            key={index}
            style={{
              ...styles.step,
              ...(step.completed ? styles.stepCompleted :
                  step.active ? styles.stepActive : styles.stepInactive)
            }}
          >
            <span>
              {step.completed ? '✅' : step.active ? '▶️' : '⏸️'}
            </span>
            {step.name}
          </div>
        ))}
      </div>

      {/* Video Content */}
      {videoUrl && currentStage === 'video' && (
        <div style={styles.contentSection}>
          <h4 style={styles.contentTitle}>Step 1: Watch Video Content</h4>
          <VideoPlayer
            src={videoUrl}
            title={videoTitle}
            onComplete={handleVideoComplete}
            autoPlay={true}
          />
        </div>
      )}

      {/* Audio Content - Only shows after video is completed */}
      {audioUrl && currentStage === 'audio' && videoCompleted && (
        <div style={styles.contentSection}>
          <h4 style={styles.contentTitle}>Step 2: Listen to Audio Content</h4>
          <AudioPlayer
            src={audioUrl}
            title={audioTitle}
            onComplete={handleAudioComplete}
            autoPlay={true}
          />
        </div>
      )}

      {/* Audio waiting message */}
      {audioUrl && currentStage === 'video' && (
        <div style={styles.contentSection}>
          <h4 style={styles.contentTitle}>Step 2: Audio Content</h4>
          <div style={styles.contentMessage}>
            Complete the video above to unlock audio content
          </div>
        </div>
      )}

      {/* Completion Message */}
      {currentStage === 'completed' && (
        <div style={styles.completionMessage}>
          <h4 style={styles.completionTitle}>🎉 Day {day} Complete!</h4>
          <p style={styles.completionText}>
            You have successfully completed all content for Day {day}. 
            You can now proceed to the next day when it becomes available.
          </p>
        </div>
      )}

      {/* No content message */}
      {!videoUrl && !audioUrl && (
        <div style={styles.contentMessage}>
          No content available for Day {day} yet. Please check back later.
        </div>
      )}
    </div>
  );
}