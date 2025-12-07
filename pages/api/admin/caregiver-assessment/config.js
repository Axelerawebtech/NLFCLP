import dbConnect from '../../../../lib/mongodb';
import mongoose from 'mongoose';

// Define the Caregiver Assessment Schema with three sections
const CaregiverAssessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Caregiver Comprehensive Assessment'
  },
  description: {
    type: String,
    default: 'Complete all three sections: Burden Assessment, Stress Assessment, and Quality of Life Assessment'
  },
  sections: [{
    sectionId: String,
    sectionTitle: {
      english: String,
      hindi: String,
      kannada: String
    },
    sectionDescription: {
      english: String,
      hindi: String,
      kannada: String
    },
    questions: [{
      questionText: {
        english: String,
        hindi: String,
        kannada: String
      },
      type: {
        type: String,
        enum: ['radio', 'text', 'textarea', 'checkbox'],
        default: 'radio'
      },
      options: [{
        value: Number,
        label: {
          english: String,
          hindi: String,
          kannada: String
        }
      }],
      required: {
        type: Boolean,
        default: true
      }
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const CaregiverAssessment = mongoose.models.CaregiverAssessment || 
  mongoose.model('CaregiverAssessment', CaregiverAssessmentSchema);

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      let assessment = await CaregiverAssessment.findOne({ isActive: true }).lean();
      
      // If no assessment exists, create default with all three sections
      if (!assessment) {
        assessment = await CaregiverAssessment.create({
          title: 'Caregiver Comprehensive Assessment',
          description: 'Complete all three sections in order',
          sections: [
            {
              sectionId: 'zarit-burden',
              sectionTitle: {
                english: '1. Zarit Burden Assessment',
                hindi: '1. ज़रिट बोझ मूल्यांकन',
                kannada: '1. ಝರಿಟ್ ಹೊರೆ ಮೌಲ್ಯಮಾಪನ'
              },
              sectionDescription: {
                english: 'Please answer the following questions about your caregiving experience',
                hindi: 'कृपया अपने देखभाल अनुभव के बारे में निम्नलिखित प्रश्नों के उत्तर दें',
                kannada: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆರೈಕೆ ಅನುಭವದ ಬಗ್ಗೆ ಈ ಕೆಳಗಿನ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ'
              },
              questions: getZaritQuestions()
            },
            {
              sectionId: 'dass-7-stress',
              sectionTitle: {
                english: '2. Stress Assessment (DASS-7)',
                hindi: '2. तनाव मूल्यांकन (DASS-7)',
                kannada: '2. ಒತ್ತಡ ಮೌಲ್ಯಮಾಪನ (DASS-7)'
              },
              sectionDescription: {
                english: 'Please read each statement and indicate how much it applied to you over the past week',
                hindi: 'कृपया प्रत्येक कथन को पढ़ें और बताएं कि पिछले सप्ताह यह आप पर कितना लागू हुआ',
                kannada: 'ದಯವಿಟ್ಟು ಪ್ರತಿಯೊಂದು ಹೇಳಿಕೆಯನ್ನು ಓದಿ ಮತ್ತು ಕಳೆದ ವಾರದಲ್ಲಿ ಅದು ನಿಮಗೆ ಎಷ್ಟು ಅನ್ವಯಿಸಿತು ಎಂಬುದನ್ನು ಸೂಚಿಸಿ'
              },
              questions: getDASS7Questions()
            },
            {
              sectionId: 'whoqol',
              sectionTitle: {
                english: '3. WHO Quality of Life Assessment',
                hindi: '3. WHO जीवन की गुणवत्ता मूल्यांकन',
                kannada: '3. WHO ಜೀವನದ ಗುಣಮಟ್ಟ ಮೌಲ್ಯಮಾಪನ'
              },
              sectionDescription: {
                english: 'Please answer questions about your quality of life, health, and well-being',
                hindi: 'कृपया अपने जीवन की गुणवत्ता, स्वास्थ्य और कल्याण के बारे में प्रश्नों के उत्तर दें',
                kannada: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಜೀವನದ ಗುಣಮಟ್ಟ, ಆರೋಗ್ಯ ಮತ್ತು ಯೋಗಕ್ಷೇಮದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ'
              },
              questions: getWHOQOLQuestions()
            }
          ],
          isActive: true
        });
      }

      return res.status(200).json({
        success: true,
        data: assessment
      });
    } catch (error) {
      console.error('[Caregiver Assessment Config GET] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch caregiver assessment configuration',
        error: error.message
      });
    }
  }

  else if (req.method === 'PUT') {
    try {
      const { sections } = req.body;

      let assessment = await CaregiverAssessment.findOne({ isActive: true });
      
      if (assessment) {
        assessment.sections = sections;
        assessment.updatedAt = new Date();
        await assessment.save();
      } else {
        assessment = await CaregiverAssessment.create({
          sections,
          isActive: true
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Caregiver assessment configuration updated successfully',
        data: assessment
      });
    } catch (error) {
      console.error('[Caregiver Assessment Config PUT] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update caregiver assessment configuration',
        error: error.message
      });
    }
  }

  else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}

// Helper functions to generate default questions
function getZaritQuestions() {
  const options = [
    { value: 0, label: { english: 'NEVER', hindi: 'कभी नहीं', kannada: 'ಎಂದಿಗೂ ಅಲ್ಲ' }},
    { value: 1, label: { english: 'RARELY', hindi: 'कभी-कभार', kannada: 'ಅಪರೂಪವಾಗಿ' }},
    { value: 2, label: { english: 'SOMETIMES', hindi: 'कभी-कभी', kannada: 'ಕೆಲವೊಮ್ಮೆ' }},
    { value: 3, label: { english: 'QUITE FREQUENTLY', hindi: 'काफी बार', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ' }},
    { value: 4, label: { english: 'NEARLY ALWAYS', hindi: 'लगभग हमेशा', kannada: 'ಯಾವಾಗಲೂ ಹೆಚ್ಚು' }}
  ];

  const questions = [
    { english: 'Do you feel that your relative asks for more help than he or she needs?', hindi: 'क्या आपको लगता है कि आपका रिश्तेदार जरूरत से ज्यादा मदद मांगता है?', kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರು ಅಗತ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಸಹಾಯ ಕೇಳುತ್ತಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel that, because of the time you spend with your relative, you don\'t have enough time for yourself?', hindi: 'क्या आपको लगता है कि अपने रिश्तेदार के साथ समय बिताने के कारण आपके पास अपने लिए पर्याप्त समय नहीं है?', kannada: 'ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಕರೊಂದಿಗೆ ಕಳೆಯುವ ಸಮಯದಿಂದಾಗಿ, ನಿಮಗಾಗಿ ಸಾಕಷ್ಟು ಸಮಯವಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel stressed between caring for your relative and trying to meet other responsibilities for your family or work?', hindi: 'क्या आप अपने रिश्तेदार की देखभाल करने और अपने परिवार या काम के लिए अन्य जिम्मेदारियों को पूरा करने के बीच तनाव महसूस करते हैं?', kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರನ್ನು ನೋಡಿಕೊಳ್ಳುವುದು ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬ ಅಥವಾ ಕೆಲಸಕ್ಕೆ ಇತರ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಪೂರೈಸಲು ಪ್ರಯತ್ನಿಸುವ ನಡುವೆ ನೀವು ಒತ್ತಡವನ್ನು ಅನುಭವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel embarrassed about your relative\'s behavior?', hindi: 'क्या आप अपने रिश्तेदार के व्यवहार से शर्मिंदा महसूस करते हैं?', kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ನಡವಳಿಕೆಯ ಬಗ್ಗೆ ನೀವು ಮುಜುಗರ ಅನುಭವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel angry when you are around your relative?', hindi: 'क्या आप अपने रिश्तेदार के आसपास रहते हुए गुस्सा महसूस करते हैं?', kannada: 'ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಸುತ್ತ ಇರುವಾಗ ಕೋಪಗೊಳ್ಳುತ್ತೀರಾ?' },
    { english: 'Do you feel that your relative currently affects your relationship with other family members?', hindi: 'क्या आपको लगता है कि आपका रिश्तेदार वर्तमान में अन्य परिवार के सदस्यों के साथ आपके संबंध को प्रभावित करता है?', kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರು ಪ್ರಸ್ತುತ ಇತರ ಕುಟುಂಬ ಸದಸ್ಯರೊಂದಿಗೆ ನಿಮ್ಮ ಸಂಬಂಧವನ್ನು ಪರಿಣಾಮ ಬೀರುತ್ತಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Are you afraid about what the future holds for your relative?', hindi: 'क्या आप अपने रिश्तेदार के भविष्य को लेकर डरे हुए हैं?', kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರಿಗೆ ಭವಿಷ್ಯದಲ್ಲಿ ಏನಾಗುತ್ತದೆ ಎಂದು ನೀವು ಭಯಪಡುತ್ತೀರಾ?' },
    { english: 'Do you feel that your relative is dependent upon you?', hindi: 'क्या आपको लगता है कि आपका रिश्तेदार आप पर निर्भर है?', kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರು ನಿಮ್ಮ ಮೇಲೆ ಅವಲಂಬಿತರಾಗಿದ್ದಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel strained when you are around your relative?', hindi: 'क्या आप अपने रिश्तेदार के आसपास रहते हुए तनाव महसूस करते हैं?', kannada: 'ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಸುತ್ತ ಇರುವಾಗ ಒತ್ತಡವನ್ನು ಅನುಭವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel that your health has suffered because of your involvement with your relative?', hindi: 'क्या आपको लगता है कि आपके रिश्तेदार के साथ जुड़ाव के कारण आपके स्वास्थ्य को नुकसान हुआ है?', kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರೊಂದಿಗಿನ ತೊಡಗಿಸಿಕೊಳ್ಳುವಿಕೆಯಿಂದಾಗಿ ನಿಮ್ಮ ಆರೋಗ್ಯವು ಹಾನಿಗೊಳಗಾಗಿದೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel that you don\'t have as much privacy as you would like, because of your relative?', hindi: 'क्या आपको लगता है कि आपके रिश्तेदार के कारण आपके पास उतनी गोपनीयता नहीं है जितनी आप चाहते हैं?', kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಕಾರಣದಿಂದಾಗಿ ನೀವು ಬಯಸಿದಷ್ಟು ಗೌಪ್ಯತೆಯನ್ನು ಹೊಂದಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel that your social life has suffered because you are caring for your relative?', hindi: 'क्या आपको लगता है कि आपके रिश्तेदार की देखभाल करने के कारण आपके सामाजिक जीवन को नुकसान हुआ है?', kannada: 'ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಕರನ್ನು ನೋಡಿಕೊಳ್ಳುತ್ತಿರುವುದರಿಂದ ನಿಮ್ಮ ಸಾಮಾಜಿಕ ಜೀವನವು ಹಾನಿಗೊಳಗಾಗಿದೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel uncomfortable having your friends over because of your relative?', hindi: 'क्या आप अपने रिश्तेदार के कारण अपने दोस्तों को बुलाने में असहज महसूस करते हैं?', kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಕಾರಣದಿಂದಾಗಿ ನಿಮ್ಮ ಸ್ನೇಹಿತರನ್ನು ಮನೆಗೆ ಕರೆತರಲು ನಿಮಗೆ ಅಸಹನೆ ಅನಿಸುತ್ತದೆಯೇ?' },
    { english: 'Do you feel that your relative seems to expect you to take care of him or her, as if you were the only one he or she could depend on?', hindi: 'क्या आपको लगता है कि आपका रिश्तेदार आशा करता है कि आप उसकी देखभाल करें, जैसे कि आप ही एकमात्र व्यक्ति हैं जिस पर वह निर्भर कर सकता है?', kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರು ನೀವು ಅವರನ್ನು ನೋಡಿಕೊಳ್ಳಬೇಕೆಂದು ನಿರೀಕ್ಷಿಸುತ್ತಾರೆ, ನೀವು ಮಾತ್ರ ಅವರು ಅವಲಂಬಿಸಬಹುದಾದ ಏಕೈಕ ವ್ಯಕ್ತಿಯಾಗಿರುವಂತೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel that you don\'t have enough money to care for your relative, in addition to the rest of your expenses?', hindi: 'क्या आपको लगता है कि आपके बाकी खर्चों के अलावा अपने रिश्तेदार की देखभाल के लिए आपके पास पर्याप्त पैसा नहीं है?', kannada: 'ನಿಮ್ಮ ಉಳಿದ ಖರ್ಚುಗಳ ಜೊತೆಗೆ ನಿಮ್ಮ ಸಂಬಂಧಿಕರನ್ನು ನೋಡಿಕೊಳ್ಳಲು ನಿಮ್ಮ ಬಳಿ ಸಾಕಷ್ಟು ಹಣವಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel that you will be unable to take care of your relative much longer?', hindi: 'क्या आपको लगता है कि आप अपने रिश्तेदार की अधिक समय तक देखभाल नहीं कर पाएंगे?', kannada: 'ನೀವು ಇನ್ನು ಮುಂದೆ ನಿಮ್ಮ ಸಂಬಂಧಿಕರನ್ನು ನೋಡಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗುವುದಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel that you have lost control of your life since your relative\'s illness?', hindi: 'क्या आपको लगता है कि आपके रिश्तेदार की बीमारी के बाद से आपने अपने जीवन पर नियंत्रण खो दिया है?', kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಅನಾರೋಗ್ಯದ ನಂತರ ನೀವು ನಿಮ್ಮ ಜೀವನದ ಮೇಲಿನ ನಿಯಂತ್ರಣವನ್ನು ಕಳೆದುಕೊಂಡಿದ್ದೀರಿ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you wish that you could just leave the care of your relative to someone else?', hindi: 'क्या आप चाहते हैं कि आप अपने रिश्तेदार की देखभाल किसी और को सौंप दें?', kannada: 'ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಆರೈಕೆಯನ್ನು ಬೇರೊಬ್ಬರಿಗೆ ಬಿಡಬಹುದೆಂದು ನೀವು ಬಯಸುತ್ತೀರಾ?' },
    { english: 'Do you feel uncertain about what to do about your relative?', hindi: 'क्या आप अपने रिश्तेदार के बारे में क्या करें इसे लेकर अनिश्चित महसूस करते हैं?', kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಬಗ್ಗೆ ಏನು ಮಾಡಬೇಕೆಂದು ನಿಮಗೆ ಅನಿಶ್ಚಿತತೆ ಅನಿಸುತ್ತದೆಯೇ?' },
    { english: 'Do you feel that you should be doing more for your relative?', hindi: 'क्या आपको लगता है कि आपको अपने रिश्तेदार के लिए और अधिक करना चाहिए?', kannada: 'ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಕರಿಗೆ ಹೆಚ್ಚು ಮಾಡಬೇಕು ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Do you feel that you could do a better job in caring for your relative?', hindi: 'क्या आपको लगता है कि आप अपने रिश्तेदार की देखभाल में बेहतर काम कर सकते हैं?', kannada: 'ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಕರನ್ನು ನೋಡಿಕೊಳ್ಳುವಲ್ಲಿ ಉತ್ತಮ ಕೆಲಸ ಮಾಡಬಹುದು ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?' },
    { english: 'Overall, how burdened do you feel in caring for your relative?', hindi: 'कुल मिलाकर, अपने रिश्तेदार की देखभाल में आप कितना बोझ महसूस करते हैं?', kannada: 'ಒಟ್ಟಾರೆಯಾಗಿ, ನಿಮ್ಮ ಸಂಬಂಧಿಕರನ್ನು ನೋಡಿಕೊಳ್ಳುವಲ್ಲಿ ನೀವು ಎಷ್ಟು ಹೊರೆ ಅನುಭವಿಸುತ್ತೀರಿ?' }
  ];

  const lastQuestionOptions = [
    { value: 0, label: { english: 'NOT AT ALL', hindi: 'बिल्कुल नहीं', kannada: 'ಇಲ್ಲವೇ ಇಲ್ಲ' }},
    { value: 1, label: { english: 'A LITTLE', hindi: 'थोड़ा', kannada: 'ಸ್ವಲ್ಪ' }},
    { value: 2, label: { english: 'MODERATELY', hindi: 'मध्यम', kannada: 'ಮಧ್ಯಮ' }},
    { value: 3, label: { english: 'QUITE A BIT', hindi: 'काफी हद तक', kannada: 'ಸಾಕಷ್ಟು' }},
    { value: 4, label: { english: 'EXTREMELY', hindi: 'अत्यधिक', kannada: 'ಅತ್ಯಂತ' }}
  ];

  return questions.map((q, idx) => ({
    questionText: q,
    type: 'radio',
    options: idx === questions.length - 1 ? lastQuestionOptions : options,
    required: true
  }));
}

function getDASS7Questions() {
  const options = [
    { value: 0, label: { english: 'Did not apply to me at all', hindi: 'मुझ पर बिल्कुल लागू नहीं हुआ', kannada: 'ನನಗೆ ಇದು ಇಲ್ಲವೇ ಅನ್ವಯಿಸಲಿಲ್ಲ' }},
    { value: 1, label: { english: 'Applied to me to some degree, or some of the time', hindi: 'कुछ हद तक या कुछ समय के लिए मुझ पर लागू हुआ', kannada: 'ನನಗೆ ಸ್ವಲ್ಪ ಮಟ್ಟಿಗೆ ಅಥವಾ ಕೆಲವು ಸಮಯ ಅನ್ವಯಿಸಿತು' }},
    { value: 2, label: { english: 'Applied to me to a considerable degree or a good part of time', hindi: 'काफी हद तक या अच्छे समय के लिए मुझ पर लागू हुआ', kannada: 'ನನಗೆ ಗಣನೀಯ ಮಟ್ಟಿಗೆ ಅಥವಾ ಹೆಚ್ಚು ಸಮಯ ಅನ್ವಯಿಸಿತು' }},
    { value: 3, label: { english: 'Applied to me very much or most of the time', hindi: 'बहुत अधिक या अधिकांश समय मुझ पर लागू हुआ', kannada: 'ನನಗೆ ಬಹಳಷ್ಟು ಅಥವಾ ಹೆಚ್ಚಿನ ಸಮಯ ಅನ್ವಯಿಸಿತು' }}
  ];

  const questions = [
    { english: 'I found it hard to wind down', hindi: 'मुझे आराम करने में मुश्किल हो रही थी', kannada: 'ನನಗೆ ನನ್ನನ್ನು ಶಾಂತಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ' },
    { english: 'I tended to over-react to situations', hindi: 'मैं परिस्थितियों पर अति प्रतिक्रिया करने के लिए प्रवृत्त हुआ', kannada: 'ನಾನು ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಅತಿಯಾಗಿ ಪ್ರತಿಕ್ರಿಯಿಸುವ ಪ್ರವೃತ್ತಿಯನ್ನು ಹೊಂದಿದ್ದೆ' },
    { english: 'I felt that I was using a lot of nervous energy', hindi: 'मुझे लगा कि मैं बहुत अधिक नर्वस एनर्जी (तंत्रिका ऊर्जा) का उपयोग कर रहा था', kannada: 'ನಾನು ಹೆಚ್ಚು ನರಗಳ ಶಕ್ತಿಯನ್ನು ಬಳಸುತ್ತಿದ್ದೇನೆ ಎಂದು ನನಗೆ ಅನಿಸಿತು' },
    { english: 'I found myself getting agitated', hindi: 'मैंने अपने आप को व्यथित पाया', kannada: 'ನಾನು ಉದ್ವಿಗ್ನನಾಗುತ್ತಿದ್ದೆ' },
    { english: 'I found it difficult to relax', hindi: 'मुझे आराम करना मुश्किल लगा', kannada: 'ನನಗೆ ವಿಶ್ರಾಂತಿ ಪಡೆಯುವುದು ಕಷ್ಟವಾಯಿತು' },
    { english: 'I was intolerant of anything that kept me from getting on with what I was doing', hindi: 'मैं जो कुछ कर रहा था उसमें बाधा रूप कोई भी चीज़ के प्रति मैं असहिष्णु था', kannada: 'ನಾನು ಏನು ಮಾಡುತ್ತಿದ್ದೆನೋ ಅದರಿಂದ ನನ್ನನ್ನು ತಡೆಯುವ ಯಾವುದಕ್ಕೂ ನಾನು ಸಹನೆ ಇರಲಿಲ್ಲ' },
    { english: 'I felt that I was rather touchy', hindi: 'मुझे लगा कि मैं यूँही अतिभावुक था', kannada: 'ನಾನು ಹೆಚ್ಚು ಸೂಕ್ಷ್ಮ ಮನಸ್ಸಿನವನು ಎನಿಸುತ್ತಿತ್ತು' }
  ];

  return questions.map(q => ({
    questionText: q,
    type: 'radio',
    options,
    required: true
  }));
}

function getWHOQOLQuestions() {
  // Placeholder - add actual WHOQOL questions if available
  const options = [
    { value: 1, label: { english: 'Very Poor', hindi: 'बहुत खराब', kannada: 'ಬಹಳ ಕೆಟ್ಟದು' }},
    { value: 2, label: { english: 'Poor', hindi: 'खराब', kannada: 'ಕೆಟ್ಟದು' }},
    { value: 3, label: { english: 'Neither Poor nor Good', hindi: 'न खराब न अच्छा', kannada: 'ಕೆಟ್ಟದು ಅಥವಾ ಒಳ್ಳೆಯದು ಅಲ್ಲ' }},
    { value: 4, label: { english: 'Good', hindi: 'अच्छा', kannada: 'ಒಳ್ಳೆಯದು' }},
    { value: 5, label: { english: 'Very Good', hindi: 'बहुत अच्छा', kannada: 'ಬಹಳ ಒಳ್ಳೆಯದು' }}
  ];

  const questions = [
    { english: 'How would you rate your quality of life?', hindi: 'आप अपने जीवन की गुणवत्ता को कैसे दर्जा देंगे?', kannada: 'ನಿಮ್ಮ ಜೀವನದ ಗುಣಮಟ್ಟವನ್ನು ನೀವು ಹೇಗೆ ರೇಟ್ ಮಾಡುತ್ತೀರಿ?' },
    { english: 'How satisfied are you with your health?', hindi: 'आप अपने स्वास्थ्य से कितने संतुष्ट हैं?', kannada: 'ನಿಮ್ಮ ಆರೋಗ್ಯದಿಂದ ನೀವು ಎಷ್ಟು ತೃಪ್ತರಾಗಿದ್ದೀರಿ?' }
  ];

  return questions.map(q => ({
    questionText: q,
    type: 'radio',
    options,
    required: true
  }));
}
