const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://axelerawebtech_db_user:M7EOU2FK8vqO7vs3@cluster0.e6faone.mongodb.net/cancercare?retryWrites=true&w=majority&appName=Cluster0';

// Complete 22 Zarit Burden Interview Questions
const complete22Questions = [
  {
    id: 1,
    questionText: {
      english: 'Do you feel that your relative asks for more help than he/she needs?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯು ಅವರಿಗೆ ಬೇಕಾದ ಸಹಾಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಸಹಾಯವನ್ನು ಕೇಳುತ್ತಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार को आवश्यकता से अधिक मदद मांगते हैं?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 2,
    questionText: {
      english: 'Do you feel that because of the time you spend with your relative that you don\'t have enough time for yourself?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯೊಂದಿಗೆ ಕಳೆಯುವ ಸಮಯದಿಂದಾಗಿ ನಿಮಗಾಗಿ ಸಾಕಷ್ಟು ಸಮಯ ಇಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि अपने रिश्तेदार के साथ समय बिताने के कारण आपके पास अपने लिए पर्याप्त समय नहीं है?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 3,
    questionText: {
      english: 'Do you feel stressed between caring for your relative and trying to meet other responsibilities for your family or work?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯನ್ನು ನೋಡಿಕೊಳ್ಳುವುದು ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬ ಅಥವಾ ಕೆಲಸದ ಇತರ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಪೂರೈಸಲು ಪ್ರಯತ್ನಿಸುವ ನಡುವೆ ನೀವು ಒತ್ತಡವನ್ನು ಅನುಭವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आप अपने रिश्तेदार की देखभाल करने और अपने परिवार या काम के लिए अन्य जिम्मेदारियों को पूरा करने के बीच तनाव महसूस करते हैं?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 4,
    questionText: {
      english: 'Do you feel embarrassed over your relative\'s behavior?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ವರ್ತನೆಯಿಂದ ನೀವು ಮುಜುಗರ ಅನುಭವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आप अपने रिश्तेदार के व्यवहार से शर्मिंदा महसूस करते हैं?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 5,
    questionText: {
      english: 'Do you feel angry when you are around your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಸುತ್ತಲೂ ಇರುವಾಗ ನೀವು ಕೋಪವನ್ನು ಅನುಭವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आप अपने रिश्तेदार के आसपास रहते समय गुस्सा महसूस करते हैं?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 6,
    questionText: {
      english: 'Do you feel that your relative currently affects your relationship with your family members or friends in a negative way?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯು ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಕುಟುಂಬದ ಸದಸ್ಯರು ಅಥವಾ ಸ್ನೇಹಿತರೊಂದಿಗಿನ ನಿಮ್ಮ ಸಂಬಂಧವನ್ನು ನಕಾರಾತ್ಮಕ ರೀತಿಯಲ್ಲಿ ಪ್ರಭಾವಿಸುತ್ತಿದ್ದಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार वर्तमान में आपके परिवारजनों या दोस्तों के साथ आपके रिश्ते को नकारात्मक तरीके से प्रभावित कर रहे हैं?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 7,
    questionText: {
      english: 'Are you afraid of what the future holds for your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಭವಿಷ್ಯವು ಏನಾಗುತ್ತದೆ ಎಂಬ ಭಯ ನಿಮಗಿದೆಯೇ?',
      hindi: 'क्या आप इस बात से डरते हैं कि भविष्य में आपके रिश्तेदार का क्या होगा?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 8,
    questionText: {
      english: 'Do you feel your relative is dependent on you?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯು ನಿಮ್ಮ ಮೇಲೆ ಅವಲಂಬಿತರಾಗಿದ್ದಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार आप पर निर्भर हैं?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 9,
    questionText: {
      english: 'Do you feel strained when you are around your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಸುತ್ತಲೂ ಇರುವಾಗ ನೀವು ಒತ್ತಡವನ್ನು ಅನುಭವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आप अपने रिश्तेदार के आसपास रहते समय तनाव महसूस करते हैं?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 10,
    questionText: {
      english: 'Do you feel your health has suffered because of your involvement with your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯೊಂದಿಗಿನ ನಿಮ್ಮ ಒಳಗೊಳ್ಳುವಿಕೆಯಿಂದಾಗಿ ನಿಮ್ಮ ಆರೋಗ್ಯವು ಹಾನಿಗೊಳಗಾಗಿದೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार के साथ जुड़ाव के कारण आपके स्वास्थ्य को नुकसान हुआ है?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 11,
    questionText: {
      english: 'Do you feel that you don\'t have as much privacy as you would like because of your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯಿಂದಾಗಿ ನೀವು ಬಯಸಿದಷ್ಟು ಗೌಪ್ಯತೆ ನಿಮಗೆ ಇಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार के कारण आपको उतनी निजता नहीं मिलती जितनी आप चाहते हैं?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 12,
    questionText: {
      english: 'Do you feel that your social life has suffered because you are caring for your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯನ್ನು ನೋಡಿಕೊಳ್ಳುತ್ತಿರುವುದರಿಂದ ನಿಮ್ಮ ಸಾಮಾಜಿಕ ಜೀವನವು ಹಾನಿಗೊಳಗಾಗಿದೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार की देखभाल के कारण आपके सामाजिक जीवन को नुकसान हुआ है?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 13,
    questionText: {
      english: 'Do you feel uncomfortable about having friends over because of your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯಿಂದಾಗಿ ಸ್ನೇಹಿತರನ್ನು ಮನೆಗೆ ಕರೆದುಕೊಂಡು ಬರುವುದರಲ್ಲಿ ನೀವು ಅಸಹಜತೆ ಅನುಭವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आप अपने रिश्तेदार के कारण दोस्तों को घर बुलाने में असहज महसूस करते हैं?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशا' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 14,
    questionText: {
      english: 'Do you feel that your relative seems to expect you to take care of them as if you were the only one they could depend on?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯು ನೀವು ಮಾತ್ರ ಅವರು ಅವಲಂಬಿಸಬಹುದಾದ ವ್ಯಕ್ತಿಯಂತೆ ನೀವು ಅವರನ್ನು ನೋಡಿಕೊಳ್ಳಬೇಕೆಂದು ಅಪೇಕ್ಷಿಸುತ್ತಿದ್ದಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार आपसे उम्मीद करते हैं कि आप उनकी देखभाल करें जैसे कि आप ही एकमात्र व्यक्ति हों जिस पर वे निर्भर हो सकते हैं?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 15,
    questionText: {
      english: 'Do you feel that you don\'t have enough money to care for your relative in addition to the rest of your expenses?',
      kannada: 'ನಿಮ್ಮ ಉಳಿದ ಖರ್ಚುಗಳ ಜೊತೆಗೆ ನಿಮ್ಮ ಸಂಬಂಧಿಯನ್ನು ನೋಡಿಕೊಳ್ಳಲು ನಿಮ್ಮ ಬಳಿ ಸಾಕಷ್ಟು ಹಣವಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके बाकी खर्चों के अलावा अपने रिश्तेदार की देखभाल के लिए आपके पास पर्याप्त पैसा नहीं है?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 16,
    questionText: {
      english: 'Do you feel that you will be unable to take care of your relative much longer?',
      kannada: 'ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಯನ್ನು ಇನ್ನು ಹೆಚ್ಚು ಕಾಲ ನೋಡಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗುವುದಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आप अपने रिश्तेदार की देखभाल बहुत लंबे समय तक नहीं कर पाएंगे?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 17,
    questionText: {
      english: 'Do you feel you have lost control of your life since your relative\'s illness?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಅನಾರೋಗ್ಯದ ನಂತರ ನೀವು ನಿಮ್ಮ ಜೀವನದ ನಿಯಂತ್ರಣವನ್ನು ಕಳೆದುಕೊಂಡಿದ್ದೀರಿ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार की बीमारी के बाद से आपने अपने जीवन पर नियंत्रण खो दिया है?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 18,
    questionText: {
      english: 'Do you wish you could leave the care of your relative to someone else?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಆರೈಕೆಯನ್ನು ಬೇರೆಯವರಿಗೆ ಬಿಟ್ಟುಬಿಡಬಹುದೆಂದು ನೀವು ಬಯಸುತ್ತೀರಾ?',
      hindi: 'क्या आप चाहते हैं कि आप अपने रिश्तेदार की देखभाल किसी और को सौंप सकें?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 19,
    questionText: {
      english: 'Do you feel uncertain about what to do about your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಬಗ್ಗೆ ಏನು ಮಾಡಬೇಕೆಂದು ನಿಮಗೆ ಅನಿಶ್ಚಿತತೆ ಇದೆಯೇ?',
      hindi: 'क्या आप अपने रिश्तेदार के बारे में क्या करना है इसको लेकर अनिश्चित महसूस करते हैं?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 20,
    questionText: {
      english: 'Do you feel you should be doing more for your relative?',
      kannada: 'ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಗಾಗಿ ಹೆಚ್ಚಿನದನ್ನು ಮಾಡಬೇಕು ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपको अपने रिश्तेदार के लिए और भी कुछ करना चाहिए?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 21,
    questionText: {
      english: 'Do you feel you could do a better job in caring for your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯನ್ನು ನೋಡಿಕೊಳ್ಳುವಲ್ಲಿ ನೀವು ಉತ್ತಮ ಕೆಲಸ ಮಾಡಬಹುದು ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आप अपने रिश्तेदार की देखभाल में बेहतर काम कर सकते हैं?'
    },
    options: [
      { optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' }, score: 0 },
      { optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' }, score: 1 },
      { optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' }, score: 2 },
      { optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' }, score: 3 },
      { optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' }, score: 4 }
    ],
    enabled: true
  },
  {
    id: 22,
    questionText: {
      english: 'Overall, how burdened do you feel in caring for your relative?',
      kannada: 'ಒಟ್ಟಾರೆ, ನಿಮ್ಮ ಸಂಬಂಧಿಯನ್ನು ನೋಡಿಕೊಳ್ಳುವಲ್ಲಿ ನೀವು ಎಷ್ಟು ಹೊರೆ ಅನುಭವಿಸುತ್ತೀರಿ?',
      hindi: 'कुल मिलाकर, अपने रिश्तेदार की देखभाल करने में आप कितना बोझ महसूस करते हैं?'
    },
    options: [
      { optionText: { english: 'Not at all', kannada: 'ಇಲ್ಲವೇ ಇಲ್ಲ', hindi: 'बिल्कुल नहीं' }, score: 0 },
      { optionText: { english: 'A little', kannada: 'ಸ್ವಲ್ಪ', hindi: 'थोड़ा सा' }, score: 1 },
      { optionText: { english: 'Moderately', kannada: 'ಮಧ್ಯಮವಾಗಿ', hindi: 'मध्यम रूप से' }, score: 2 },
      { optionText: { english: 'Quite a bit', kannada: 'ಸಾಕಷ್ಟು', hindi: 'काफी कुछ' }, score: 3 },
      { optionText: { english: 'Extremely', kannada: 'ಅತ್ಯಂತ', hindi: 'अत्यधिक' }, score: 4 }
    ],
    enabled: true
  }
];

// Score ranges for burden levels
const scoreRanges = {
  littleOrNoBurden: {
    min: 0,
    max: 20,
    label: {
      english: 'Little or no burden',
      kannada: 'ಕಡಿಮೆ ಅಥವಾ ಯಾವುದೇ ಹೊರೆ ಇಲ್ಲ',
      hindi: 'कम या कोई बोझ नहीं'
    },
    burdenLevel: 'mild'
  },
  mildToModerate: {
    min: 21,
    max: 40,
    label: {
      english: 'Mild to moderate burden',
      kannada: 'ಸೌಮ್ಯದಿಂದ ಮಧ್ಯಮ ಹೊರೆ',
      hindi: 'हल्के से मध्यम बोझ'
    },
    burdenLevel: 'mild'
  },
  moderateToSevere: {
    min: 41,
    max: 60,
    label: {
      english: 'Moderate to severe burden',
      kannada: 'ಮಧ್ಯಮದಿಂದ ತೀವ್ರ ಹೊರೆ',
      hindi: 'मध्यम से गंभीर बोझ'
    },
    burdenLevel: 'moderate'
  },
  severe: {
    min: 61,
    max: 88,
    label: {
      english: 'Severe burden',
      kannada: 'ತೀವ್ರ ಹೊರೆ',
      hindi: 'गंभीर बोझ'
    },
    burdenLevel: 'severe'
  }
};

async function initializeZaritQuestions() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('cancercare');
    const collection = db.collection('programconfigs');
    
    console.log('📋 Initializing 22 Zarit Burden Interview questions...');
    
    // Find or create global config
    let config = await collection.findOne({ configType: 'global' });
    
    if (!config) {
      config = {
        configType: 'global',
        day1: {}
      };
    }
    
    if (!config.day1) {
      config.day1 = {};
    }
    
    // Set the 22 questions and score ranges
    config.day1.burdenTestQuestions = complete22Questions;
    config.day1.scoreRanges = scoreRanges;
    
    // Update or insert the configuration
    const result = await collection.replaceOne(
      { configType: 'global' },
      config,
      { upsert: true }
    );
    
    console.log('✅ Successfully initialized 22 Zarit questions!');
    console.log(`📊 Questions: ${complete22Questions.length}`);
    console.log(`📊 Score ranges: ${Object.keys(scoreRanges).length}`);
    console.log(`🆔 Document ID: ${result.upsertedId || 'existing document updated'}`);
    
    // Verify the data
    const verify = await collection.findOne({ configType: 'global' });
    console.log(`🔍 Verification: Found ${verify.day1.burdenTestQuestions.length} questions in database`);
    
  } catch (error) {
    console.error('❌ Error initializing Zarit questions:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the initialization
initializeZaritQuestions();