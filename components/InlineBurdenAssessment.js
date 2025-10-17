import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * InlineBurdenAssessment Component
 * 
 * Purpose: Embedded burden assessment for Day 1 (shown inline in dashboard)
 * - 7 MCQ questions with 5-point scale (0-4)
 * - Total score 0-28 points
 * - Determines burden level: mild (0-10), moderate (11-20), severe (21-28)
 * - Submits to API and triggers parent refresh to show video
 */

export default function InlineBurdenAssessment({ caregiverId, existingAnswers, existingScore, existingLevel, onComplete }) {
  const { currentLanguage } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(existingAnswers || Array(7).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(existingAnswers ? true : false);

  // Get language key (en -> english, kn -> kannada, hi -> hindi)
  const getLanguageKey = () => {
    const map = { en: 'english', kn: 'kannada', hi: 'hindi' };
    return map[currentLanguage] || 'english';
  };

  // 7 Zarit Burden Interview Questions
  const questions = [
    {
      english: "Do you feel that your relative asks for more help than he/she needs?",
      kannada: "ನಿಮ್ಮ ಸಂಬಂಧಿತರು ಅಗತ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಸಹಾಯವನ್ನು ಕೇಳುತ್ತಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?",
      hindi: "क्या आपको लगता है कि आपका रिश्तेदार जितनी जरूरत है उससे ज्यादा मदद मांगता है?"
    },
    {
      english: "Do you feel that because of the time you spend with your relative you don't have enough time for yourself?",
      kannada: "ನಿಮ್ಮ ಸಂಬಂಧಿತರೊಂದಿಗೆ ನೀವು ಕಳೆಯುವ ಸಮಯದಿಂದಾಗಿ ನಿಮಗಾಗಿ ಸಾಕಷ್ಟು ಸಮಯವಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?",
      hindi: "क्या आपको लगता है कि अपने रिश्तेदार के साथ समय बिताने के कारण आपके पास अपने लिए पर्याप्त समय नहीं है?"
    },
    {
      english: "Do you feel stressed between caring for your relative and trying to meet other responsibilities (work/family)?",
      kannada: "ನಿಮ್ಮ ಸಂಬಂಧಿತರ ಆರೈಕೆ ಮತ್ತು ಇತರ ಜವಾಬ್ದಾರಿಗಳನ್ನು (ಕೆಲಸ/ಕುಟುಂಬ) ಪೂರೈಸಲು ಪ್ರಯತ್ನಿಸುವ ನಡುವೆ ನೀವು ಒತ್ತಡವನ್ನು ಅನುಭವಿಸುತ್ತೀರಾ?",
      hindi: "क्या आप अपने रिश्तेदार की देखभाल करने और अन्य जिम्मेदारियों (काम/परिवार) को पूरा करने के बीच तनाव महसूस करते हैं?"
    },
    {
      english: "Do you feel embarrassed over your relative's behavior?",
      kannada: "ನಿಮ್ಮ ಸಂಬಂಧಿತರ ನಡವಳಿಕೆಯಿಂದ ನೀವು ಮುಜುಗರ ಅನುಭವಿಸುತ್ತೀರಾ?",
      hindi: "क्या आप अपने रिश्तेदार के व्यवहार से शर्मिंदा महसूस करते हैं?"
    },
    {
      english: "Do you feel angry when you are around your relative?",
      kannada: "ನಿಮ್ಮ ಸಂಬಂಧಿತರ ಸುತ್ತಲೂ ಇರುವಾಗ ನಿಮಗೆ ಕೋಪ ಬರುತ್ತದೆಯೇ?",
      hindi: "क्या आप अपने रिश्तेदार के आसपास होने पर गुस्सा महसूस करते हैं?"
    },
    {
      english: "Do you feel that your social life has suffered because you are caring for your relative?",
      kannada: "ನಿಮ್ಮ ಸಂಬಂಧಿತರನ್ನು ನೋಡಿಕೊಳ್ಳುತ್ತಿರುವುದರಿಂದ ನಿಮ್ಮ ಸಾಮಾಜಿಕ ಜೀವನ ಹಾನಿಗೊಳಗಾಗಿದೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?",
      hindi: "क्या आपको लगता है कि आपके रिश्तेदार की देखभाल करने के कारण आपका सामाजिक जीवन प्रभावित हुआ है?"
    },
    {
      english: "Overall, how burdened do you feel in caring for your relative?",
      kannada: "ಒಟ್ಟಾರೆಯಾಗಿ, ನಿಮ್ಮ ಸಂಬಂಧಿತರನ್ನು ನೋಡಿಕೊಳ್ಳುವಲ್ಲಿ ನೀವು ಎಷ್ಟು ಹೊರೆಯನ್ನು ಅನುಭವಿಸುತ್ತೀರಿ?",
      hindi: "कुल मिलाकर, आप अपने रिश्तेदार की देखभाल में कितना बोझ महसूस करते हैं?"
    }
  ];

  // Answer options (0-4 scale)
  const options = [
    {
      value: 0,
      english: "Never",
      kannada: "ಎಂದಿಗೂ ಇಲ್ಲ",
      hindi: "कभी नहीं"
    },
    {
      value: 1,
      english: "Rarely",
      kannada: "ಅಪರೂಪವಾಗಿ",
      hindi: "शायद ही कभी"
    },
    {
      value: 2,
      english: "Sometimes",
      kannada: "ಕೆಲವೊಮ್ಮೆ",
      hindi: "कभी कभी"
    },
    {
      value: 3,
      english: "Quite Frequently",
      kannada: "ಆಗಾಗ್ಗೆ",
      hindi: "काफी बार"
    },
    {
      value: 4,
      english: "Nearly Always",
      kannada: "ಯಾವಾಗಲೂ",
      hindi: "लगभग हमेशा"
    }
  ];

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Calculate total score
      const totalScore = answers.reduce((sum, score) => sum + score, 0);
      
      // Determine burden level
      let burdenLevel;
      if (totalScore <= 10) {
        burdenLevel = 'mild';
      } else if (totalScore <= 20) {
        burdenLevel = 'moderate';
      } else {
        burdenLevel = 'severe';
      }

      console.log('Submitting inline burden test:', { totalScore, burdenLevel });

      // Submit to API
      const response = await fetch('/api/caregiver/submit-burden-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          answers,
          totalScore,
          burdenLevel
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

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionText = questions[currentQuestion][getLanguageKey()];
  const hasAnswer = answers[currentQuestion] !== null;
  const allAnswered = answers.every(a => a !== null);

  // If showing results (test already completed)
  if (showResults) {
    const totalScore = existingScore || answers.reduce((sum, score) => sum + score, 0);
    const burdenLevel = existingLevel || (totalScore <= 10 ? 'mild' : totalScore <= 20 ? 'moderate' : 'severe');
    
    const levelColors = {
      mild: { bg: '#dcfce7', border: '#86efac', text: '#166534' },
      moderate: { bg: '#fef3c7', border: '#fde68a', text: '#92400e' },
      severe: { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' }
    };
    
    const colors = levelColors[burdenLevel];
    
    return (
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          📋 Zarit Burden Assessment
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
            <p style={{ fontSize: '14px', color: colors.text, margin: '8px 0 0 0' }}>
              Score: {totalScore} / 28 points
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
              {questions.map((question, idx) => (
                <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: idx < questions.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none' }}>
                  <p style={{ fontSize: '13px', color: '#374151', fontWeight: '600', margin: '0 0 4px 0' }}>
                    Q{idx + 1}: {question[getLanguageKey()]}
                  </p>
                  <p style={{ fontSize: '14px', color: '#111827', fontWeight: '500', margin: 0 }}>
                    → {options[answers[idx]]?.[getLanguageKey()]} ({answers[idx]} points)
                  </p>
                </div>
              ))}
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
        📋 Zarit Burden Assessment
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
          {options.map((option) => (
            <label
              key={option.value}
              style={{
                display: 'block',
                padding: '12px 16px',
                marginBottom: '8px',
                backgroundColor: answers[currentQuestion] === option.value ? '#dbeafe' : '#f9fafb',
                border: `2px solid ${answers[currentQuestion] === option.value ? '#2563eb' : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '15px',
                color: '#374151',
                fontWeight: answers[currentQuestion] === option.value ? '600' : '400'
              }}
              onMouseOver={(e) => {
                if (answers[currentQuestion] !== option.value) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseOut={(e) => {
                if (answers[currentQuestion] !== option.value) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
            >
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={option.value}
                checked={answers[currentQuestion] === option.value}
                onChange={() => handleAnswer(option.value)}
                style={{ marginRight: '12px', cursor: 'pointer' }}
              />
              {option[getLanguageKey()]}
            </label>
          ))}
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
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px', textAlign: 'center' }}>
          {!allAnswered 
            ? 'Please answer all questions to submit'
            : 'All questions answered! Click Submit to see your personalized video.'}
        </p>
      </div>
    </div>
  );
}
