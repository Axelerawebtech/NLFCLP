// Pre-configured Caregiver Assessment Data
// This contains Zarit Burden Assessment (22 items), DASS-7 Stress (7 items), and WHOQOL questions

export const CAREGIVER_ASSESSMENT_DATA = {
  zaritBurden: {
    title: {
      en: "Zarit Burden Interview",
      hi: "ज़रित भार साक्षात्कार",
      kn: "ಝರಿತ್ ಭಾರ ಸಂದರ್ಶನ"
    },
    description: {
      en: "The following questions reflect how people sometimes feel when caring for another person.",
      hi: "निम्नलिखित प्रश्न यह दर्शाते हैं कि किसी अन्य व्यक्ति की देखभाल करते समय लोग कभी-कभी कैसा महसूस करते हैं।",
      kn: "ಈ ಕೆಳಗಿನ ಪ್ರಶ್ನೆಗಳು ಇನ್ನೊಬ್ಬ ವ್ಯಕ್ತಿಯ ಕಾಳಜಿ ವಹಿಸುವಾಗ ಜನರು ಕೆಲವೊಮ್ಮೆ ಹೇಗೆ ಅನುಭವಿಸುತ್ತಾರೆ ಎಂಬುದನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತವೆ."
    },
    questions: [
      {
        questionText: {
          en: "Do you feel that your relative asks for more help than he or she needs?",
          hi: "क्‍या आप महसूस करते हैं कि आपके/आपकी रिश्‍तेदार को जितनी मदद की ज़रूरत है वह उससे ज़्यादा मांगता/मांगती है?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಯು ಅವನಿಗೆ/ಅವಳಿಗೆ ಅಗತ್ಯವಿರುವುದಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಸಹಾಯವನ್ನು ಕೇಳುತ್ತಾರೆ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel that, because of the time you spend with your relative, you don't have enough time for yourself?",
          hi: "क्‍या आप महसूस करते हैं कि अपने/अपनी रिश्‍तेदार के साथ आप जो समय बिताते हैं उसके कारण आपके पास अपने लिए पर्याप्‍त समय नहीं बचता?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಯೊಂದಿಗೆ ನೀವು ಸಮಯ ಕಳೆಯುವುದರಿಂದ ನಿಮಗಾಗಿ ನಿಮ್ಮ ಬಳಿ ಸಾಕಷ್ಟು ಸಮಯವಿಲ್ಲವೆಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel stressed between caring for your relative and trying to meet other responsibilities for your family or work?",
          hi: "क्‍या आप अपने/अपनी रिश्‍तेदार की देखभाल करने और अपने परिवार या कामकाज की दूसरी ज़ि‍म्‍मेदारियों को पूरा करने की कोशिश के कारण अपने आप को तनाव में महसूस करते हैं?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿ ವಹಿಸುವುದು ಹಾಗೂ ನಿಮ್ಮ ಕುಟುಂಬ ಅಥವಾ ಕೆಲಸಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಇತರ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಪೂರೈಸಲು ಪ್ರಯತ್ನಿಸುವುದರ ಕುರಿತು ನೀವು ಮಾನಸಿಕ ಒತ್ತಡ ಅನುಭವಿಸಿದಿರಾ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel embarrassed about your relative's behavior?",
          hi: "क्‍या आप अपने/अपनी रिश्‍तेदार के व्‍यवहार के कारण शर्मिन्‍दगी महसूस करते हैं?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಯ ವರ್ತನೆಯಿಂದಾಗಿ ನಿಮಗೆ ಮುಜುಗರ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel angry when you are around your relative?",
          hi: "जब आप अपने/अपनी रिश्‍तेदार के साथ होते हैं तो क्‍या आपको गुस्‍सा आता है?",
          kn: "ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಸಮೀಪದಲ್ಲಿರುವಾಗ ನಿಮಗೆ ಸಿಟ್ಟು ಬರುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel that your relative currently affects your relationship with other family members?",
          hi: "क्‍या आप महसूस करते हैं कि आपके/आपकी रिश्‍तेदार के कारण इस समय अपने परिवार के अन्‍य सदस्‍यों या दोस्‍तों के साथ आपके संबंधों पर बुरा असर पड़ रहा है?",
          kn: "ಕುಟುಂಬದ ಇತರ ಸದಸ್ಯರು, ಅಥವಾ ಸ್ನೇಹಿತರೊಂದಿಗಿನ ನಿಮ್ಮ ಸಂಬಂಧದ ಮೇಲೆ ಈಗ ನಿಮ್ಮ ಸಂಬಂಧಿಯು ನಕಾರಾತ್ಮಕ ಪರಿಣಾಮವನ್ನು ಮಾಡುತ್ತಿದ್ದಾರೆ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Are you afraid about what the future holds for your relative?",
          hi: "क्या अपने/अपनी रिश्‍तेदार के भविष्‍य को लेकर आप डरते हैं?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಗೆ ಭವಿಷ್ಯದಲ್ಲಿ ಏನು ಕಾದಿದೆ ಎಂದು ನಿಮಗೆ ಭಯವಾಗುತ್ತಿದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel that your relative is dependent upon you?",
          hi: "क्‍या आप महसूस करते हैं कि आपका/आपकी रिश्‍तेदार आप पर निर्भर है?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿ ನಿಮ್ಮ ಮೇಲೆ ಅವಲಂಬಿತನಾಗಿದ್ದಾನೆ/ಆಗಿದ್ದಾಳೆ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel strained when you are around your relative?",
          hi: "जब आप अपने/अपनी रिश्‍तेदार के साथ होते हैं तो क्‍या आप तनाव महसूस करते हैं?",
          kn: "ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಸಮೀಪದಲ್ಲಿರುವಾಗ ಮಾನಸಿಕವಾಗಿ ದಣಿದಂತೆ ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel that your health has suffered because of your involvement with your relative?",
          hi: "क्‍या आप महसूस करते हैं कि अपने/अपनी रिश्‍तेदार की देखभाल में लगे होने के कारण आपकी सेहत पर बुरा असर पड़ा है?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಯೊಂದಿಗಿನ ಒಡನಾಟದಿಂದಾಗಿ ನಿಮ್ಮ ಆರೋಗ್ಯದ ಮೇಲೆ ಕೆಟ್ಟ ಪರಿಣಾಮವಾಗಿದೆ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel that you don't have as much privacy as you would like, because of your relative?",
          hi: "क्‍या आप महसूस करते हैं कि अपने/अपनी रिश्‍तेदार के कारण आपको निजी गतिविधियों के लिए उतना समय नहीं मिल पाता है जितना आप चाहते हैं?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಯಿಂದಾಗಿ, ನೀವು ಬಯಸಿದಷ್ಟು ಖಾಸಗಿತನ ನಿಮಗಿಲ್ಲ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel that your social life has suffered because you are caring for your relative?",
          hi: "क्‍या आप महसूस करते हैं कि अपने/अपनी रिश्‍तेदार की देखभाल के कारण आपके सामाजिक जीवन पर बुरा असर पड़ा है?",
          kn: "ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿ ವಹಿಸುತ್ತಿರುವುದರಿಂದ ನಿಮ್ಮ ಸಾಮಾಜಿಕ ಜೀವನಕ್ಕೆ ಧಕ್ಕೆ ಉಂಟಾಗಿದೆ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel uncomfortable having your friends over because of your relative?",
          hi: "क्‍या अपने/अपनी रिश्‍तेदार के कारण अपने दोस्‍तों को घर बुलाने में आप असुविधा महसूस करते हैं?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಯಿಂದಾಗಿ, ನಿಮ್ಮ ಜೊತೆ ಸ್ನೇಹಿತರಿರುವುದು ನಿಮಗೆ ಅನನುಕೂಲ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel that your relative seems to expect you to take care of him or her, as if you were the only one he or she could depend on?",
          hi: "क्‍या आप महसूस करते हैं कि आपका/आपकी रिश्‍तेदार आपसे इस तरह से देखभाल की उम्‍मीद करता/करती है, जैसे कि केवल आप ही हैं जिस पर वह निर्भर हो सकता/सकती है?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಗೆ, ಅವರು ಅವಲಂಬಿಸಬಹುದಾದವರು ನೀವು ಮಾತ್ರ ಎಂಬಂತೆ ನೀವು ಅವರ ಕಾಳಜಿ ವಹಿಸಬೇಕೆಂದು ನಿರೀಕ್ಷಿಸುವಂತೆ ತೋರುತ್ತದೆ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel that you don't have enough money to care for your relative, in addition to the rest of your expenses?",
          hi: "क्‍या आप महसूस करते हैं कि अपने बाकी खर्चों के अलावा अपने/अपनी रिश्‍तेदार की देखभाल के लिए आपके पास पर्याप्‍त पैसे नहीं हैं?",
          kn: "ನಿಮ್ಮ ಉಳಿದ ಖರ್ಚುಗಳ ಜೊತೆಗೆ, ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿ ವಹಿಸಲು ನಿಮ್ಮಲ್ಲಿ ಸಾಕಷ್ಟು ಹಣ ಇಲ್ಲ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel that you will be unable to take care of your relative much longer?",
          hi: "क्‍या आप महसूस करते हैं कि आप अब ज़्यादा दिनों तक अपने/अपनी रिश्‍तेदार की देखभाल नहीं कर पाएंगे?",
          kn: "ಬಹಳ ಸಮಯದವರೆಗೆ ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿ ವಹಿಸಲು ನಿಮ್ಮಿಂದ ಸಾಧ್ಯವಿಲ್ಲ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel that you have lost control of your life since your relative's illness?",
          hi: "क्‍या आपको लगता है कि जबसे आपका/आपकी रिश्‍तेदार बीमार है तब से अपने जीवन पर आपका नियंत्रण नहीं रह गया है?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಯಿಲೆಯ ಆರಂಭದಿಂದ ತೊಡಗಿ ನಿಮ್ಮ ಜೀವನದ ಮೇಲೆ ನೀವು ಹಿಡಿತವನ್ನು ಕಳೆದುಕೊಂಡಿದ್ದೀರೆಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you wish that you could just leave the care of your relative to someone else?",
          hi: "क्‍या आप इच्‍छा करते हैं कि काश आप अपने/अपनी रिश्‍तेदार की देखभाल किसी और को सौंप सकते?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿಯನ್ನು ಬೇರೆ ಯಾರಿಗಾದರೂ ವಹಿಸಿಕೊಡುವಂತಿದ್ದರೆ ಚೆನ್ನಾಗಿತ್ತು ಎಂದು ನೀವು ಬಯಸುವಿರಾ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel uncertain about what to do about your relative?",
          hi: "क्‍या आप इस बात को लेकर अनिश्चित महसूस करते हैं कि अपने/अपनी रिश्‍तेदार के बारे में क्‍या करें?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕುರಿತು ಏನು ಮಾಡಬೇಕು ಎಂದು ನಿಮಗೆ ಗೊಂದಲ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel that you should be doing more for your relative?",
          hi: "क्‍या आप महसूस करते हैं कि अपने/अपनी रिश्‍तेदार के लिए आपको और अधिक करना चाहिए?",
          kn: "ನಿಮ್ಮ ಸಂಬಂಧಿಗಾಗಿ ಇನ್ನೂ ಹೆಚ್ಚಿನದನ್ನು ಮಾಡಬೇಕು ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Do you feel that you could do a better job in caring for your relative?",
          hi: "क्‍या आप महसूस करते हैं कि आप अपने/अपनी रिश्‍तेदार की देखभाल और बेहतर ढंग से कर सकते हैं?",
          kn: "ಇನ್ನೂ ಚೆನ್ನಾಗಿ ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿ ವಹಿಸಬಹುದು ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?"
        },
        options: {
          en: ["Never", "Rarely", "Sometimes", "Quite Frequently", "Nearly Always"],
          hi: ["कभी नहीं", "बहुत ही कम", "कभी-कभी", "अक्‍सर ही", "लगभग हमेशा"],
          kn: ["ಎಂದಿಗೂ ಇಲ್ಲ", "ಅಪರೂಪವಾಗಿ", "ಕೆಲವೊಮ್ಮೆ", "ಆಗಾಗ", "ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ"]
        },
        scores: [0, 1, 2, 3, 4]
      },
      {
        questionText: {
          en: "Overall, how burdened do you feel in caring for your relative?",
          hi: "कुल मिलाकर, अपने/अपनी रिश्‍तेदार की देखभाल करने में आप कितना बोझ महसूस करते हैं?",
          kn: "ಒಟ್ಟಾರೆಯಾಗಿ, ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿ ವಹಿಸುವುದು ನಿಮಗೆ ಎಷ್ಟು ಹೊರೆ ಅನ್ನಿಸಿದೆ?"
        },
        options: {
          en: ["Not at all", "A little", "Moderately", "Quite a bit", "Extremely"],
          hi: ["बिल्‍कुल नहीं", "थोड़ा-बहुत", "औसत", "काफ़ी", "बहुत अधिक"],
          kn: ["ಇಲ್ಲವೇ ಇಲ್ಲ", "ಸ್ವಲ್ಪ", "ಮಧ್ಯಮ", "ಸಾಕಷ್ಟು", "ತೀವ್ರವಾಗಿ"]
        },
        scores: [0, 1, 2, 3, 4]
      }
    ]
  },
  dass7Stress: {
    title: {
      en: "DASS-7 Stress Assessment",
      hi: "DASS-7 तनाव मूल्यांकन",
      kn: "DASS-7 ಒತ್ತಡ ಮೌಲ್ಯಮಾಪನ"
    },
    description: {
      en: "Please read each statement and select a number 0, 1, 2 or 3 which indicates how much the statement applied to you over the past week.",
      hi: "कृपया प्रत्येक कथन पढ़ें और एक संख्या 0, 1, 2 या 3 का चयन करें जो दर्शाती है कि पिछले सप्ताह में यह कथन आप पर कितना लागू हुआ।",
      kn: "ದಯವಿಟ್ಟು ಪ್ರತಿ ಹೇಳಿಕೆಯನ್ನು ಓದಿ ಮತ್ತು ಸಂಖ್ಯೆ 0, 1, 2 ಅಥವಾ 3 ಅನ್ನು ಆಯ್ಕೆಮಾಡಿ, ಇದು ಕಳೆದ ವಾರದಲ್ಲಿ ಹೇಳಿಕೆಯು ನಿಮಗೆ ಎಷ್ಟು ಅನ್ವಯಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ಸೂಚಿಸುತ್ತದೆ."
    },
    ratingScale: {
      en: ["Did not apply to me at all", "Applied to me to some degree, or some of the time", "Applied to me to a considerable degree or a good part of time", "Applied to me very much or most of the time"],
      hi: ["मुझ पर बिल्कुल लागू नहीं हुआ", "मुझ पर कुछ हद तक, या कुछ समय के लिए लागू हुआ", "मुझ पर काफी हद तक या अच्छे समय तक लागू हुआ", "मुझ पर बहुत अधिक या अधिकांश समय लागू हुआ"],
      kn: ["ನನಗೆ ಬಿಲ್ಕುಲ ಅನ್ವಯವಾಗಲಿಲ್ಲ", "ನನಗೆ ಸ್ವಲ್ಪ ಮಟ್ಟಿಗೆ, ಅಥವಾ ಸ್ವಲ್ಪ ಸಮಯದವರೆಗೆ ಅನ್ವಯವಾಯಿತು", "ನನಗೆ ಗಣನೀಯ ಮಟ್ಟಿಗೆ ಅಥವಾ ಉತ್ತಮ ಸಮಯದವರೆಗೆ ಅನ್ವಯವಾಯಿತು", "ನನಗೆ ಬಹಳವಾಗಿ ಅಥವಾ ಹೆಚ್ಚಿನ ಸಮಯ ಅನ್ವಯವಾಯಿತು"]
    },
    questions: [
      {
        questionText: {
          en: "I found it hard to wind down",
          hi: "मुझे आराम करने में मुश्किल हो रही थी",
          kn: "ನನಗೆ ನನ್ನನ್ನು ಶಾಂತಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ"
        },
        options: {
          en: ["0", "1", "2", "3"],
          hi: ["0", "1", "2", "3"],
          kn: ["0", "1", "2", "3"]
        },
        scores: [0, 1, 2, 3]
      },
      {
        questionText: {
          en: "I tended to over-react to situations",
          hi: "मैं परिस्थितियों पर अति प्रतिक्रिया करने के लिए प्रवृत्त हुआ",
          kn: "ನಾನು ಸನ್ನಿವೇಶಗಳಿಗೆ ಅತಿಯಾಗಿ ಸ್ಪಂದಿಸುತ್ತಿದ್ದೆ"
        },
        options: {
          en: ["0", "1", "2", "3"],
          hi: ["0", "1", "2", "3"],
          kn: ["0", "1", "2", "3"]
        },
        scores: [0, 1, 2, 3]
      },
      {
        questionText: {
          en: "I felt that I was using a lot of nervous energy",
          hi: "मुझे लगा कि मैं बहुत अधिक नर्वस एनर्जी (तंत्रिका ऊर्जा) का उपयोग कर रहा था",
          kn: "ನಾನು ಹೆಚ್ಚು ಆತಂಕಕ್ಕೊಳಗಾಗಿದ್ದೇನೆ ಎನಿಸುತ್ತಿತ್ತು"
        },
        options: {
          en: ["0", "1", "2", "3"],
          hi: ["0", "1", "2", "3"],
          kn: ["0", "1", "2", "3"]
        },
        scores: [0, 1, 2, 3]
      },
      {
        questionText: {
          en: "I found myself getting agitated",
          hi: "मैंने अपने आप को व्यथित पाया",
          kn: "ನನಗೆ ಕೋಪ ಉಂಟಾಗುವುದು ಮತ್ತು ಮಾನಸಿಕವಾಗಿ ಅಸ್ವಸ್ಥನಾಗುವುದು ತಿಳಿದುಬಂತು"
        },
        options: {
          en: ["0", "1", "2", "3"],
          hi: ["0", "1", "2", "3"],
          kn: ["0", "1", "2", "3"]
        },
        scores: [0, 1, 2, 3]
      },
      {
        questionText: {
          en: "I found it difficult to relax",
          hi: "मुझे आराम करना मुश्किल लगा",
          kn: "ನನಗೆ ಆತಂಕರಹಿತವಾಗಿರಲು ಕಷ್ಟವೆನಿಸುತ್ತಿತ್ತು"
        },
        options: {
          en: ["0", "1", "2", "3"],
          hi: ["0", "1", "2", "3"],
          kn: ["0", "1", "2", "3"]
        },
        scores: [0, 1, 2, 3]
      },
      {
        questionText: {
          en: "I was intolerant of anything that kept me from getting on with what I was doing",
          hi: "मैं जो कुछ कर रहा था उसमें बाध्य रूप कोई भी चीज़ के प्रति मैं असहिष्णु था",
          kn: "ನಾನು ಮಾಡುವ ಕೆಲಸಕ್ಕೊ ಅಡ್ಡಬರುವ ಯಾವುದೇ ವಿಷಯದ ಬಗ್ಗೆ ನನಗೆ ಅಸಹಿಷ್ಣುತೆಯಿತ್ತು"
        },
        options: {
          en: ["0", "1", "2", "3"],
          hi: ["0", "1", "2", "3"],
          kn: ["0", "1", "2", "3"]
        },
        scores: [0, 1, 2, 3]
      },
      {
        questionText: {
          en: "I felt that I was rather touchy",
          hi: "मुझे लगा कि मैं यूँही अतिभावुक था",
          kn: "ನಾನು ಹೆಚ್ಚು ಸೂಕ್ಷ್ಮ ಮನಸ್ಸಿನವನು ಎನಿಸುತ್ತಿತ್ತು"
        },
        options: {
          en: ["0", "1", "2", "3"],
          hi: ["0", "1", "2", "3"],
          kn: ["0", "1", "2", "3"]
        },
        scores: [0, 1, 2, 3]
      }
    ]
  }
};
