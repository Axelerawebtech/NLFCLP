import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * InlineBurdenAssessment Component
 * 
 * Purpose: Embedded burden assessment for Day 1 (shown inline in dashboard)
 * - Loads questions dynamically from admin configuration
 * - Multi-language support (English, Kannada, Hindi)
 * - Customizable scores per option
 * - Determines burden level based on configured score ranges
 * - Submits to API and triggers parent refresh to show video
 */

export default function InlineBurdenAssessment({ caregiverId, existingAnswers, existingScore, existingLevel, onComplete }) {
  const { currentLanguage } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(existingAnswers || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(existingAnswers ? true : false);
  const [questions, setQuestions] = useState([]);
  const [scoreRanges, setScoreRanges] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get language key (en -> english, kn -> kannada, hi -> hindi)
  const getLanguageKey = () => {
    const map = { en: 'english', kn: 'kannada', hi: 'hindi' };
    return map[currentLanguage] || 'english';
  };

  // Load questions from API
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only handle keyboard events if we're not showing results
      if (showResults) return;
      
      if (event.key === 'Enter') {
        event.preventDefault();
        
        const hasAnswer = answers[currentQuestion] !== null && answers[currentQuestion] !== undefined;
        const allAnswered = answers.every(a => a !== null && a !== undefined);
        
        if (currentQuestion < questions.length - 1 && hasAnswer) {
          // Go to next question if current question is answered
          handleNext();
        } else if (currentQuestion === questions.length - 1 && allAnswered && !isSubmitting) {
          // Submit if on last question and all questions answered
          handleSubmit();
        }
      }
      
      // Arrow key navigation
      if (event.key === 'ArrowLeft' && currentQuestion > 0) {
        event.preventDefault();
        handlePrevious();
      }
      
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const hasAnswer = answers[currentQuestion] !== null && answers[currentQuestion] !== undefined;
        if (currentQuestion < questions.length - 1 && hasAnswer) {
          handleNext();
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentQuestion, answers, questions.length, showResults, isSubmitting]);

  const fetchQuestions = async () => {
    try {
      // Add cache-busting timestamp to prevent 304 responses
      const cacheBuster = `?_t=${Date.now()}`;
      const response = await fetch(`/api/admin/burden-assessment/config${cacheBuster}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const data = await response.json();
      
      console.log('🔍 DEBUG: API Response:', {
        success: data.success,
        questionsCount: data.config?.questions?.length,
        firstQuestion: data.config?.questions?.[0],
        firstQuestionOptions: data.config?.questions?.[0]?.options,
        scoreRanges: data.config?.scoreRanges
      });
      
      if (data.success && data.config.questions) {
        // Validate that we have a complete question set
        if (data.config.questions.length < 22) {
          console.warn(`⚠️ Warning: Only ${data.config.questions.length} questions loaded, expected 22`);
          setError(`Incomplete assessment configuration (${data.config.questions.length}/22 questions). Please contact support.`);
          return;
        }
        
        // Debug each question's options
        data.config.questions.forEach((q, idx) => {
          console.log(`🔍 Question ${idx + 1}:`, {
            questionText: q.questionText,
            optionsCount: q.options?.length,
            options: q.options
          });
        });
        
        setQuestions(data.config.questions);
        setScoreRanges(data.config.scoreRanges);
        
        console.log('📋 Loaded burden assessment config for inline:', {
          questionsCount: data.config.questions.length,
          scoreRanges: data.config.scoreRanges,
          autoInitialized: data.message ? true : false,
          firstQuestionStructure: data.config.questions[0],
          firstQuestionText: data.config.questions[0]?.questionText?.english
        });
        
        // Initialize answers array if needed
        if (!existingAnswers) {
          setAnswers(Array(data.config.questions.length).fill(null));
        }
      } else {
        console.error('❌ Failed to load assessment questions:', data);
        setError('Failed to load assessment questions. Please refresh the page and try again.');
      }
    } catch (err) {
      console.error('❌ Error loading questions:', err);
      setError('Network error loading assessment questions. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    // Store the score of the selected option
    const selectedOption = questions[currentQuestion].options[optionIndex];
    newAnswers[currentQuestion] = selectedOption.score;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Calculate burden level based on admin-defined score ranges
  const calculateBurdenLevel = (totalScore) => {
    if (!scoreRanges) {
      // Fallback calculation with correct score ranges
      if (totalScore <= 40) return 'mild';
      if (totalScore <= 60) return 'moderate';
      return 'severe';
    }

    // Use admin-defined score ranges
    for (const [rangeName, range] of Object.entries(scoreRanges)) {
      if (totalScore >= range.min && totalScore <= range.max) {
        return range.burdenLevel || 'mild';
      }
    }
    
    // Default fallback
    return 'moderate';
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Calculate total score
      const totalScore = answers.reduce((sum, score) => sum + score, 0);
      
      // Determine burden level using admin-defined score ranges
      const burdenLevel = calculateBurdenLevel(totalScore);

      console.log('📊 Submitting inline burden test:', { 
        totalScore, 
        burdenLevel,
        questionsAnswered: answers.filter(a => a !== null).length,
        totalQuestions: questions.length
      });

      // Create detailed answer breakdown
      const answerDetails = answers.map((score, index) => {
        const question = questions[index];
        console.log(`Creating answerDetail for Q${index + 1}:`, {
          hasQuestion: !!question,
          questionKeys: question ? Object.keys(question) : 'none',
          questionText: question?.questionText,
          optionsCount: question?.options?.length
        });
        
        return {
          questionIndex: index + 1,
          questionId: question?.id || index + 1,
          selectedScore: score,
          question: question
        };
      });

      // Submit to API
      const response = await fetch('/api/caregiver/submit-burden-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          answers: answers.reduce((acc, score, index) => {
            acc[`question${index + 1}`] = score;
            return acc;
          }, {}), // Convert to object format for compatibility
          answerDetails,
          totalScore,
          burdenLevel,
          maxPossibleScore: questions.length * 4, // Assuming max score per question is 4
          questionsCompleted: questions.length
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Burden test submitted successfully');
        // Show results instead of immediately completing
        setShowResults(true);
        // Trigger parent refresh to check for video
        if (onComplete) {
          onComplete();
        }
      } else {
        setError(data.error || data.message || 'Failed to submit assessment');
      }
    } catch (err) {
      console.error('Assessment submission error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#6b7280' }}>Loading assessment questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#fee2e2', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>⚠️</span>
          <h4 style={{ margin: 0, color: '#991b1b', fontSize: '16px' }}>Assessment Configuration Issue</h4>
        </div>
        <p style={{ margin: '0 0 12px 0', color: '#991b1b', fontSize: '14px' }}>
          {error || 'No assessment questions configured. The system requires 22 questions for the Zarit Burden Interview.'}
        </p>
        <p style={{ margin: 0, color: '#7f1d1d', fontSize: '13px' }}>
          <strong>Solution:</strong> Please refresh the page. If the problem persists, contact the administrator.
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setError('');
            fetchQuestions();
          }}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          🔄 Retry Loading Questions
        </button>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionData = questions[currentQuestion];
  const currentQuestionText = currentQuestionData?.questionText?.[getLanguageKey()];
  const hasAnswer = answers[currentQuestion] !== null && answers[currentQuestion] !== undefined;
  const allAnswered = answers.every(a => a !== null && a !== undefined);

  // Debug current question data
  console.log('🔍 RENDER DEBUG:', {
    currentQuestion,
    questionsLength: questions.length,
    currentQuestionData,
    currentQuestionText,
    hasOptions: !!currentQuestionData?.options,
    optionsLength: currentQuestionData?.options?.length,
    languageKey: getLanguageKey(),
    currentLanguage
  });

  // If showing results (test already completed)
  if (showResults) {
    const totalScore = existingScore || answers.reduce((sum, score) => sum + score, 0);
    const burdenLevel = existingLevel || calculateBurdenLevel(totalScore);
    
    const levelColors = {
      mild: { bg: '#dcfce7', border: '#86efac', text: '#166534' },
      moderate: { bg: '#fef3c7', border: '#fde68a', text: '#92400e' },
      severe: { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' }
    };
    
    const colors = levelColors[burdenLevel];

    // Calculate max possible score
    const maxScore = questions.reduce((sum, q) => {
      const maxOptionScore = Math.max(...q.options.map(opt => opt.score));
      return sum + maxOptionScore;
    }, 0);
    
    return (
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          📋 Burden Assessment
        </h4>
        
        <div style={{ 
          padding: '24px', 
          backgroundColor: colors.bg,
          border: `2px solid ${colors.border}`,
          borderRadius: '12px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '18px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>
              ✅ Assessment Completed
            </p>
            <p style={{ fontSize: '16px', color: colors.text, margin: 0 }}>
              Your burden level: <strong style={{ textTransform: 'capitalize', fontSize: '20px' }}>{burdenLevel}</strong>
            </p>
          </div>

          {/* Show answers in collapsed view */}
          <details style={{ marginTop: '16px' }}>
            <summary style={{ 
              cursor: 'pointer', 
              fontSize: '14px', 
              color: colors.text, 
              fontWeight: '600',
              padding: '8px',
              backgroundColor: 'rgba(255,255,255,0.5)',
              borderRadius: '6px'
            }}>
              View Your Answers
            </summary>
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
              {questions.map((question, idx) => {
                const answerScore = answers[idx];
                const selectedOption = question.options.find(opt => opt.score === answerScore);
                
                return (
                  <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: idx < questions.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none' }}>
                    <p style={{ fontSize: '13px', color: '#374151', fontWeight: '600', margin: '0 0 4px 0' }}>
                      Q{idx + 1}: {question.questionText[getLanguageKey()]}
                    </p>
                    <p style={{ fontSize: '14px', color: '#111827', fontWeight: '500', margin: 0 }}>
                      → {selectedOption?.optionText[getLanguageKey()]}
                    </p>
                  </div>
                );
              })}
            </div>
          </details>

          <p style={{ fontSize: '13px', color: colors.text, marginTop: '16px', textAlign: 'center', fontStyle: 'italic' }}>
            Your personalized video will appear below once the administrator uploads it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
        📋 Burden Assessment
      </h4>
      
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#ffffff', 
        border: '2px solid #e5e7eb',
        borderRadius: '12px'
      }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span style={{ fontSize: '14px', color: '#2563eb', fontWeight: '600' }}>
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${progress}%`, 
              height: '100%', 
              backgroundColor: '#2563eb',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Question */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ 
            fontSize: '16px', 
            color: '#111827', 
            fontWeight: '500',
            lineHeight: '1.6',
            margin: 0
          }}>
            {currentQuestionText}
          </p>
        </div>

        {/* Answer Options */}
        <div style={{ marginBottom: '24px' }}>
          {currentQuestionData?.options && currentQuestionData.options.length > 0 ? (
            currentQuestionData.options.map((option, optIndex) => {
              const isSelected = answers[currentQuestion] === option.score;
              
              console.log(`🔍 Option ${optIndex}:`, {
                option,
                optionText: option.optionText,
                languageKey: getLanguageKey(),
                localizedText: option.optionText?.[getLanguageKey()],
                score: option.score,
                isSelected
              });
              
              return (
                <label
                  key={optIndex}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    backgroundColor: isSelected ? '#dbeafe' : '#f9fafb',
                    border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '15px',
                    color: '#374151',
                    fontWeight: isSelected ? '600' : '400'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={optIndex}
                    checked={isSelected}
                    onChange={() => handleAnswer(optIndex)}
                    style={{ marginRight: '12px', cursor: 'pointer' }}
                  />
                  {option.optionText?.[getLanguageKey()] || option.optionText?.english || `Option ${optIndex + 1}`}
                  {/* <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                    ({option.score} pts)
                  </span> */}
                </label>
              );
            })
          ) : (
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#fee2e2', 
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#991b1b'
            }}>
              <p style={{ margin: 0, fontWeight: '600' }}>⚠️ No answer options available</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                Debug info: {JSON.stringify({
                  hasCurrentQuestion: !!currentQuestionData,
                  hasOptions: !!currentQuestionData?.options,
                  optionsLength: currentQuestionData?.options?.length,
                  optionsData: currentQuestionData?.options
                })}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#fee2e2', 
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#991b1b' }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: currentQuestion === 0 ? '#e5e7eb' : '#f3f4f6',
              color: currentQuestion === 0 ? '#9ca3af' : '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              flex: '0 0 auto'
            }}
          >
            ← Previous
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!hasAnswer}
              style={{
                padding: '12px 24px',
                backgroundColor: hasAnswer ? '#2563eb' : '#e5e7eb',
                color: hasAnswer ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: hasAnswer ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                flex: '1'
              }}
              onMouseOver={(e) => {
                if (hasAnswer) e.target.style.backgroundColor = '#1d4ed8';
              }}
              onMouseOut={(e) => {
                if (hasAnswer) e.target.style.backgroundColor = '#2563eb';
              }}
            >
              Next Question →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              style={{
                padding: '12px 24px',
                backgroundColor: allAnswered && !isSubmitting ? '#16a34a' : '#e5e7eb',
                color: allAnswered && !isSubmitting ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: allAnswered && !isSubmitting ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                flex: '1'
              }}
              onMouseOver={(e) => {
                if (allAnswered && !isSubmitting) e.target.style.backgroundColor = '#15803d';
              }}
              onMouseOut={(e) => {
                if (allAnswered && !isSubmitting) e.target.style.backgroundColor = '#16a34a';
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assessment ✓'}
            </button>
          )}
        </div>

        {/* Helper Text */}
        <div style={{ marginTop: '12px' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', margin: 0 }}>
            {!allAnswered 
              ? 'Please answer all questions to submit'
              : 'All questions answered! Click Submit to see your personalized video.'}
          </p>
          <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '4px', margin: '4px 0 0 0' }}>
            💡 <strong>Tip:</strong> Press <kbd style={{ 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #d1d5db', 
              borderRadius: '3px', 
              padding: '1px 4px', 
              fontSize: '10px',
              fontFamily: 'monospace'
            }}>Enter</kbd> to go to next question • Use <kbd style={{ 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #d1d5db', 
              borderRadius: '3px', 
              padding: '1px 4px', 
              fontSize: '10px',
              fontFamily: 'monospace'
            }}>←</kbd> <kbd style={{ 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #d1d5db', 
              borderRadius: '3px', 
              padding: '1px 4px', 
              fontSize: '10px',
              fontFamily: 'monospace'
            }}>→</kbd> arrow keys to navigate
          </p>
        </div>
      </div>
    </div>
  );
}
