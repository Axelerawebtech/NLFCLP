import { useState, useEffect } from 'react';

export default function BurdenSpecificFlow({ caregiverId, burdenLevel, day, language = 'english' }) {
  const [flowContent, setFlowContent] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFlowContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caregiverId, burdenLevel, day, language]);

  const loadFlowContent = async () => {
    try {
      const response = await fetch(`/api/caregiver/burden-content?caregiverId=${caregiverId}&day=${day}&language=${language}`);
      const data = await response.json();
      
      if (data.success) {
        setFlowContent(data);
      }
    } catch (error) {
      console.error('Error loading flow content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const submitResponses = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/caregiver/burden-flow-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          day,
          burdenLevel,
          responses,
          flowType: flowContent?.content?.flow?.type,
          submittedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('✅ Responses submitted successfully!');
        setResponses({});
      } else {
        throw new Error('Failed to submit responses');
      }
    } catch (error) {
      console.error('Error submitting responses:', error);
      alert('❌ Failed to submit responses');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading personalized content...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>Preparing content based on your assessment results</div>
      </div>
    );
  }

  if (!flowContent) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        No content available for your current settings.
      </div>
    );
  }

  const { content, flowInstructions } = flowContent;

  // Render based on burden level
  switch (burdenLevel) {
    case 'mild':
      return <MildBurdenFlow 
        content={content} 
        instructions={flowInstructions}
        responses={responses}
        onResponseChange={handleResponseChange}
        onSubmit={submitResponses}
        submitting={submitting}
      />;
    case 'moderate':
      return <ModerateBurdenFlow 
        content={content} 
        instructions={flowInstructions}
        responses={responses}
        onResponseChange={handleResponseChange}
        onSubmit={submitResponses}
        submitting={submitting}
      />;
    case 'severe':
      return <SevereBurdenFlow 
        content={content} 
        instructions={flowInstructions}
        responses={responses}
        onResponseChange={handleResponseChange}
        onSubmit={submitResponses}
        submitting={submitting}
      />;
    default:
      return <MildBurdenFlow 
        content={content} 
        instructions={flowInstructions}
        responses={responses}
        onResponseChange={handleResponseChange}
        onSubmit={submitResponses}
        submitting={submitting}
      />;
  }
}

function MildBurdenFlow({ content, instructions, responses, onResponseChange, onSubmit, submitting }) {
  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Motivational Message */}
      <div style={{
        backgroundColor: '#f0f9ff',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '2px solid #0ea5e9'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: '18px' }}>
          💪 {instructions.title || 'Your care matters — a small break keeps you stronger.'}
        </h3>
        {content.motivation && (
          <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
            {content.motivation}
          </p>
        )}
      </div>

      {/* Daily Tasks */}
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>📋 Today&apos;s Self-Care Tasks</h4>
        {instructions.dailyTasks?.map((task, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            padding: '8px',
            backgroundColor: '#ffffff',
            borderRadius: '8px'
          }}>
            <input
              type="checkbox"
              id={`task-${index}`}
              style={{ marginRight: '12px' }}
              onChange={(e) => onResponseChange(`task-${index}`, e.target.checked)}
            />
            <label htmlFor={`task-${index}`} style={{ fontSize: '14px', cursor: 'pointer' }}>
              {task}
            </label>
          </div>
        ))}
      </div>

      {/* Quick Assessment */}
      <div style={{
        backgroundColor: '#fef3c7',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#92400e' }}>❓ Quick Daily Check-in</h4>
        {content.quickAssessments?.map((question, index) => (
          <div key={question.id} style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>
              {question.questionText}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={question.id}
                  value="yes"
                  style={{ marginRight: '6px' }}
                  onChange={(e) => onResponseChange(question.id, e.target.value)}
                />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={question.id}
                  value="no"
                  style={{ marginRight: '6px' }}
                  onChange={(e) => onResponseChange(question.id, e.target.value)}
                />
                No
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Reminder */}
      <div style={{
        backgroundColor: '#ecfdf5',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '20px', marginBottom: '8px' }}>🕊️</div>
        <p style={{ margin: 0, fontSize: '14px', color: '#065f46', fontStyle: 'italic' }}>
          {instructions.reminder || content.reminders || 'Take 2 minutes for yourself today — relax and breathe.'}
        </p>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={submitting}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: submitting ? '#9ca3af' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: submitting ? 'not-allowed' : 'pointer'
        }}
      >
        {submitting ? 'Submitting...' : 'Complete Daily Check-in'}
      </button>
    </div>
  );
}

function ModerateBurdenFlow({ content, instructions, responses, onResponseChange, onSubmit, submitting }) {
  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Video Section */}
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#334155' }}>🎥 Problem-Solving Video</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
          Watch this 5-minute video to learn effective problem-solving techniques for caregiving challenges.
        </p>
        {/* Video player would go here */}
        <div style={{
          backgroundColor: '#e2e8f0',
          height: '200px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b'
        }}>
          📹 Video Player Component
        </div>
      </div>

      {/* Interactive Problem-Solving Popup */}
      <div style={{
        backgroundColor: '#fef3c7',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '2px solid #f59e0b'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#92400e' }}>
          💡 {instructions.interactivePrompt || 'Now try it! Write your biggest problem and one solution below.'}
        </h4>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Problem: What challenge are you facing?
          </label>
          <textarea
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              resize: 'vertical',
              minHeight: '80px',
              fontSize: '14px'
            }}
            placeholder="I cannot cook daily for my patient..."
            onChange={(e) => onResponseChange('problem', e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Solution: What will you try?
          </label>
          <textarea
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              resize: 'vertical',
              minHeight: '80px',
              fontSize: '14px'
            }}
            placeholder="Cook once for two meals..."
            onChange={(e) => onResponseChange('solution', e.target.value)}
          />
        </div>
      </div>

      {/* Weekly Check-in */}
      <div style={{
        backgroundColor: '#f0f9ff',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#0369a1' }}>📅 Weekly Reflection</h4>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            {instructions.weeklyCheck || 'Have you practiced your problem-solving step this week?'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="weekly-check"
                value="yes"
                style={{ marginRight: '6px' }}
                onChange={(e) => onResponseChange('weekly-check', e.target.value)}
              />
              Yes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="weekly-check"
                value="no"
                style={{ marginRight: '6px' }}
                onChange={(e) => onResponseChange('weekly-check', e.target.value)}
              />
              No
            </label>
          </div>
        </div>
        
        <div>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Did it help?</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="helpful"
                value="yes"
                style={{ marginRight: '6px' }}
                onChange={(e) => onResponseChange('helpful', e.target.value)}
              />
              Yes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="helpful"
                value="no"
                style={{ marginRight: '6px' }}
                onChange={(e) => onResponseChange('helpful', e.target.value)}
              />
              No
            </label>
          </div>
        </div>
      </div>

      {/* Encouragement Message */}
      <div style={{
        backgroundColor: '#ecfdf5',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '20px', marginBottom: '8px' }}>💡</div>
        <p style={{ margin: 0, fontSize: '14px', color: '#065f46', fontWeight: '500' }}>
          {instructions.supportMessage || "You're doing great! Small steps make a big difference."}
        </p>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={submitting}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: submitting ? '#9ca3af' : '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: submitting ? 'not-allowed' : 'pointer'
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Problem-Solving Activity'}
      </button>
    </div>
  );
}

function SevereBurdenFlow({ content, instructions, responses, onResponseChange, onSubmit, submitting }) {
  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Video Section */}
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#334155' }}>🎥 Comprehensive Support Video</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
          This video provides comprehensive strategies for managing severe caregiving burden.
        </p>
        {/* Video player would go here */}
        <div style={{
          backgroundColor: '#e2e8f0',
          height: '200px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b'
        }}>
          📹 Video Player Component
        </div>
      </div>

      {/* Reflection Box */}
      <div style={{
        backgroundColor: '#fef2f2',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '2px solid #ef4444'
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>🤔 Deep Reflection</h4>
        
        {instructions.reflectionPrompts?.map((prompt, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              {prompt}
            </label>
            <textarea
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                resize: 'vertical',
                minHeight: '80px',
                fontSize: '14px'
              }}
              placeholder="Share your thoughts..."
              onChange={(e) => onResponseChange(`reflection-${index}`, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Daily Monitoring */}
      <div style={{
        backgroundColor: '#fffbeb',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#92400e' }}>📊 Daily Monitoring</h4>
        {instructions.dailyMonitoring?.map((question, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>
              {question}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`monitoring-${index}`}
                  value="yes"
                  style={{ marginRight: '6px' }}
                  onChange={(e) => onResponseChange(`monitoring-${index}`, e.target.value)}
                />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`monitoring-${index}`}
                  value="no"
                  style={{ marginRight: '6px' }}
                  onChange={(e) => onResponseChange(`monitoring-${index}`, e.target.value)}
                />
                No
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Support Alert Info */}
      <div style={{
        backgroundColor: '#f0f9ff',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #0ea5e9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '20px', marginRight: '8px' }}>🚨</span>
          <h5 style={{ margin: 0, color: '#0369a1' }}>Support System Active</h5>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#0369a1' }}>
          {instructions.adminAlert || 'Our support team will be notified if you need additional help (3 consecutive "No" responses triggers outreach).'}
        </p>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={submitting}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: submitting ? '#9ca3af' : '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: submitting ? 'not-allowed' : 'pointer'
        }}
      >
        {submitting ? 'Submitting...' : 'Complete Comprehensive Check-in'}
      </button>
    </div>
  );
}