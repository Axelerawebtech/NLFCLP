import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Day1BurdenAssessment({ 
  caregiverId, 
  onComplete,
  onScoreCalculated,
  isUnlocked = false 
}) {
  const { currentLanguage, translations } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [burdenLevel, setBurdenLevel] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Zarit Burden Interview Questions (simplified 12-item version)
  const questions = [
    {
      id: 'q1',
      text: {
        english: 'Do you feel that your patient asks for more help than they need?',
        kannada: 'ನಿಮ್ಮ ರೋಗಿಯು ಅಗತ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಸಹಾಯವನ್ನು ಕೇಳುತ್ತಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आपको लगता है कि आपका मरीज़ ज़रूरत से ज़्यादा मदद माँगता है?'
      }
    },
    {
      id: 'q2',
      text: {
        english: 'Do you feel that because of the time you spend with your patient, you don\'t have enough time for yourself?',
        kannada: 'ನಿಮ್ಮ ರೋಗಿಯೊಂದಿಗೆ ನೀವು ಕಳೆಯುವ ಸಮಯದಿಂದಾಗಿ, ನಿಮಗಾಗಿ ಸಾಕಷ್ಟು ಸಮಯವಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आपको लगता है कि अपने मरीज़ के साथ समय बिताने के कारण आपके पास अपने लिए पर्याप्त समय नहीं है?'
      }
    },
    {
      id: 'q3',
      text: {
        english: 'Do you feel stressed between caring for your patient and trying to meet other responsibilities?',
        kannada: 'ನಿಮ್ಮ ರೋಗಿಯನ್ನು ನೋಡಿಕೊಳ್ಳುವುದು ಮತ್ತು ಇತರ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಪೂರೈಸಲು ಪ್ರಯತ್ನಿಸುವುದರ ನಡುವೆ ನೀವು ಒತ್ತಡವನ್ನು ಅನುಭವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आप अपने मरीज़ की देखभाल करने और अन्य जिम्मेदारियों को पूरा करने के बीच तनाव महसूस करते हैं?'
      }
    },
    {
      id: 'q4',
      text: {
        english: 'Do you feel embarrassed over your patient\'s behavior?',
        kannada: 'ನಿಮ್ಮ ರೋಗಿಯ ವರ್ತನೆಯಿಂದ ನೀವು ಮುಜುಗರ ಅನುಭವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आप अपने मरीज़ के व्यवहार से शर्मिंदा महसूस करते हैं?'
      }
    },
    {
      id: 'q5',
      text: {
        english: 'Do you feel angry when you are around your patient?',
        kannada: 'ನಿಮ್ಮ ರೋಗಿಯ ಸುತ್ತಲೂ ಇರುವಾಗ ನೀವು ಕೋಪವನ್ನು ಅನುಭವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आप अपने मरीज़ के आसपास होने पर गुस्सा महसूस करते हैं?'
      }
    },
    {
      id: 'q6',
      text: {
        english: 'Do you feel that your patient currently affects your relationships with other family members or friends negatively?',
        kannada: 'ನಿಮ್ಮ ರೋಗಿಯು ಪ್ರಸ್ತುತ ಇತರ ಕುಟುಂಬ ಸದಸ್ಯರು ಅಥವಾ ಸ್ನೇಹಿತರೊಂದಿಗಿನ ನಿಮ್ಮ ಸಂಬಂಧಗಳನ್ನು ನಕಾರಾತ್ಮಕವಾಗಿ ಪ್ರಭಾವಿಸುತ್ತಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आपको लगता है कि आपका मरीज़ वर्तमान में अन्य परिवारिक सदस्यों या दोस्तों के साथ आपके रिश्तों को नकारात्मक रूप से प्रभावित करता है?'
      }
    },
    {
      id: 'q7',
      text: {
        english: 'Are you afraid of what the future holds for your patient?',
        kannada: 'ನಿಮ್ಮ ರೋಗಿಯ ಭವಿಷ್ಯದಲ್ಲಿ ಏನಾಗಬಹುದು ಎಂಬ ಬಗ್ಗೆ ನೀವು ಭಯಪಡುತ್ತೀರಾ?',
        hindi: 'क्या आप इस बात से डरते हैं कि आपके मरीज़ के लिए भविष्य में क्या होगा?'
      }
    },
    {
      id: 'q8',
      text: {
        english: 'Do you feel your patient is dependent on you?',
        kannada: 'ನಿಮ್ಮ ರೋಗಿಯು ನಿಮ್ಮ ಮೇಲೆ ಅವಲಂಬಿತರಾಗಿದ್ದಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आपको लगता है कि आपका मरीज़ आप पर निर्भर है?'
      }
    },
    {
      id: 'q9',
      text: {
        english: 'Do you feel strained when you are around your patient?',
        kannada: 'ನಿಮ್ಮ ರೋಗಿಯ ಸುತ್ತಲೂ ಇರುವಾಗ ನೀವು ಒತ್ತಡದಲ್ಲಿದ್ದೀರಿ ಎಂದು ಭಾವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आप अपने मरीज़ के आसपास होने पर तनावग्रस्त महसूस करते हैं?'
      }
    },
    {
      id: 'q10',
      text: {
        english: 'Do you feel your health has suffered because of your involvement with your patient?',
        kannada: 'ನಿಮ್ಮ ರೋಗಿಯೊಂದಿಗಿನ ನಿಮ್ಮ ಭಾಗವಹಿಸುವಿಕೆಯಿಂದಾಗಿ ನಿಮ್ಮ ಆರೋಗ್ಯವು ಹಾನಿಗೊಳಗಾಗಿದೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आपको लगता है कि आपके मरीज़ के साथ आपकी भागीदारी के कारण आपका स्वास्थ्य खराब हुआ है?'
      }
    },
    {
      id: 'q11',
      text: {
        english: 'Do you feel that you don\'t have as much privacy as you would like because of your patient?',
        kannada: 'ನಿಮ್ಮ ರೋಗಿಯಿಂದಾಗಿ ನಿಮಗೆ ಬೇಕಾದಷ್ಟು ಗೌಪ್ಯತೆ ಇಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आपको लगता है कि आपके मरीज़ के कारण आपके पास उतनी निजता नहीं है जितनी आप चाहते हैं?'
      }
    },
    {
      id: 'q12',
      text: {
        english: 'Do you feel that your social life has suffered because you are caring for your patient?',
        kannada: 'ನಿಮ್ಮ ರೋಗಿಯನ್ನು ನೋಡಿಕೊಳ್ಳುತ್ತಿರುವುದರಿಂದ ನಿಮ್ಮ ಸಾಮಾಜಿಕ ಜೀವನವು ಹಾನಿಗೊಳಗಾಗಿದೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आपको लगता है कि आपके मरीज़ की देखभाल के कारण आपका सामाजिक जीवन प्रभावित हुआ है?'
      }
    }
  ];

  const responseOptions = [
    { value: 0, label: { 
      english: 'Never', 
      kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', 
      hindi: 'कभी नहीं' 
    }},
    { value: 1, label: { 
      english: 'Rarely', 
      kannada: 'ಅಪರೂಪಕ್ಕೆ', 
      hindi: 'शायद ही कभी' 
    }},
    { value: 2, label: { 
      english: 'Sometimes', 
      kannada: 'ಕೆಲವೊಮ್ಮೆ', 
      hindi: 'कभी कभी' 
    }},
    { value: 3, label: { 
      english: 'Quite Frequently', 
      kannada: 'ಆಗಾಗ್ಗೆ', 
      hindi: 'अक्सर' 
    }},
    { value: 4, label: { 
      english: 'Nearly Always', 
      kannada: 'ಯಾವಾಗಲೂ', 
      hindi: 'लगभग हमेशा' 
    }}
  ];

  const getLocalizedText = (textObj) => {
    if (!textObj) return '';
    return textObj[currentLanguage] || textObj.english || '';
  };

  const calculateBurdenLevel = (score) => {
    if (score <= 20) return 'none';      // No burden
    if (score <= 30) return 'mild';      // Mild burden
    if (score <= 40) return 'moderate';  // Moderate burden
    return 'severe';                     // Severe burden (>40)
  };

  const getBurdenDescription = (level) => {
    const descriptions = {
      none: {
        english: 'No to mild burden',
        kannada: 'ಯಾವುದೇ ಅಥವಾ ಕಡಿಮೆ ಭಾರ',
        hindi: 'कोई या हल्का बोझ'
      },
      mild: {
        english: 'Mild to moderate burden',
        kannada: 'ಕಡಿಮೆ ನಿಂದ ಮಧ್ಯಮ ಭಾರ',
        hindi: 'हल्का से मध्यम बोझ'
      },
      moderate: {
        english: 'Moderate to severe burden',
        kannada: 'ಮಧ್ಯಮ ನಿಂದ ತೀವ್ರ ಭಾರ',
        hindi: 'मध्यम से गंभीर बोझ'
      },
      severe: {
        english: 'Severe burden',
        kannada: 'ತೀವ್ರ ಭಾರ',
        hindi: 'गंभीर बोझ'
      }
    };
    return getLocalizedText(descriptions[level]);
  };

  const handleAnswerSelect = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeAssessment = () => {
    const score = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const level = calculateBurdenLevel(score);
    
    setTotalScore(score);
    setBurdenLevel(level);
    setAssessmentComplete(true);
    setShowResults(true);

    // Save to localStorage
    const assessmentData = {
      caregiverId,
      answers,
      totalScore: score,
      burdenLevel: level,
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`burden_assessment_${caregiverId}`, JSON.stringify(assessmentData));

    if (onScoreCalculated) {
      onScoreCalculated(score, level);
    }

    if (onComplete) {
      onComplete(assessmentData);
    }
  };

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      maxWidth: '600px',
      margin: '0 auto'
    },
    lockedMessage: {
      backgroundColor: '#fef3c7',
      border: '1px solid #fde68a',
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px',
      textAlign: 'center'
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: '24px'
    },
    progressBar: {
      backgroundColor: '#f3f4f6',
      borderRadius: '999px',
      height: '8px',
      marginBottom: '24px'
    },
    progressFill: {
      backgroundColor: '#3b82f6',
      height: '100%',
      borderRadius: '999px',
      transition: 'width 0.3s ease',
      width: `${((currentQuestion + 1) / questions.length) * 100}%`
    },
    questionCard: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '24px'
    },
    questionNumber: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#6b7280',
      marginBottom: '8px'
    },
    questionText: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#1f2937',
      lineHeight: 1.6
    },
    optionsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '24px'
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '2px solid',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    optionSelected: {
      backgroundColor: '#dbeafe',
      borderColor: '#3b82f6',
      color: '#1d4ed8'
    },
    optionUnselected: {
      backgroundColor: 'white',
      borderColor: '#e5e7eb',
      color: '#374151'
    },
    navigation: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    navButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    prevButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    nextButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    resultsCard: {
      textAlign: 'center'
    },
    scoreDisplay: {
      fontSize: '48px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '8px'
    },
    burdenLevel: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '16px'
    },
    resultDescription: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '24px',
      lineHeight: 1.6
    }
  };

  if (!isUnlocked) {
    return (
      <div style={styles.container}>
        <div style={styles.lockedMessage}>
          <h3>🔒 Burden Assessment Locked</h3>
          <p>Complete Day 0 content first to unlock the burden assessment.</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const selectedAnswer = answers[currentQ.id];

  if (showResults) {
    return (
      <div style={styles.container}>
        <div style={styles.resultsCard}>
          <h2 style={styles.title}>Assessment Complete</h2>
          <div style={styles.scoreDisplay}>{totalScore}/48</div>
          <div style={styles.burdenLevel}>
            {getBurdenDescription(burdenLevel)}
          </div>
          <p style={styles.resultDescription}>
            Based on your responses, your caregiving burden level has been assessed. 
            The program will now provide content tailored to your specific needs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Caregiver Burden Assessment</h2>
      <p style={styles.subtitle}>
        Question {currentQuestion + 1} of {questions.length}
      </p>
      
      <div style={styles.progressBar}>
        <div style={styles.progressFill}></div>
      </div>

      <div style={styles.questionCard}>
        <div style={styles.questionNumber}>
          Question {currentQuestion + 1}
        </div>
        <div style={styles.questionText}>
          {getLocalizedText(currentQ.text)}
        </div>
      </div>

      <div style={styles.optionsContainer}>
        {responseOptions.map((option) => (
          <div
            key={option.value}
            style={{
              ...styles.option,
              ...(selectedAnswer === option.value ? styles.optionSelected : styles.optionUnselected)
            }}
            onClick={() => handleAnswerSelect(currentQ.id, option.value)}
          >
            <input
              type="radio"
              checked={selectedAnswer === option.value}
              onChange={() => {}}
              style={{ marginRight: '12px' }}
            />
            {getLocalizedText(option.label)}
          </div>
        ))}
      </div>

      <div style={styles.navigation}>
        <button
          style={{ ...styles.navButton, ...styles.prevButton }}
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        <button
          style={{ ...styles.navButton, ...styles.nextButton }}
          onClick={handleNext}
          disabled={selectedAnswer === undefined}
        >
          {currentQuestion === questions.length - 1 ? 'Complete Assessment' : 'Next'}
        </button>
      </div>
    </div>
  );
}