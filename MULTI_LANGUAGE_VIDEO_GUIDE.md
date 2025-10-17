# Multi-Language Video Management Guide

## 🌐 **Language Support Overview**
Your NLFCLP system now supports 3 languages:
- **English (en)** - Default language
- **Hindi (hi)** - हिंदी
- **Kannada (kn)** - ಕನ್ನಡ

## 📁 **Video Organization Structure**

### **Cloudinary Upload Naming Convention:**
```
CORE_MODULE-ENGLISH.mp4
CORE_MODULE-HINDI.mp4
CORE_MODULE-KANNADA.mp4

DAY1-LOW-ENGLISH.mp4
DAY1-LOW-HINDI.mp4
DAY1-LOW-KANNADA.mp4

DAY1-MODERATE-ENGLISH.mp4
DAY1-MODERATE-HINDI.mp4
DAY1-MODERATE-KANNADA.mp4
...and so on
```

## 🔧 **How to Update Video URLs**

### **Step 1: Upload Videos to Cloudinary**
1. Go to your Cloudinary dashboard
2. Upload videos with consistent naming
3. Copy the URLs for each video

### **Step 2: Update config/videoConfig.js**
For each day and level, update the video URLs:

```javascript
// Day 0 Example
0: {
  videos: {
    en: {
      videoUrl: 'https://res.cloudinary.com/YOUR_CLOUD/video/upload/v1234567890/CORE_MODULE-ENGLISH.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/YOUR_CLOUD/video/upload/v1234567890/CORE_MODULE-ENGLISH.jpg',
      provider: 'cloudinary'
    },
    hi: {
      videoUrl: 'https://res.cloudinary.com/YOUR_CLOUD/video/upload/v1234567890/CORE_MODULE-HINDI.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/YOUR_CLOUD/video/upload/v1234567890/CORE_MODULE-HINDI.jpg',
      provider: 'cloudinary'
    },
    kn: {
      videoUrl: 'https://res.cloudinary.com/YOUR_CLOUD/video/upload/v1234567890/CORE_MODULE-KANNADA.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/YOUR_CLOUD/video/upload/v1234567890/CORE_MODULE-KANNADA.jpg',
      provider: 'cloudinary'
    }
  }
}
```

## 📊 **Video Requirements Per Language**

### **Total Videos Needed:**
- **Core Module:** 3 videos (1 per language)
- **Daily Modules:** 63 videos (21 days × 3 levels × 3 languages)
- **Grand Total:** 66 videos

### **Upload Checklist:**
```
Core Module:
□ English version
□ Hindi version  
□ Kannada version

Day 1:
□ Low level - English
□ Low level - Hindi
□ Low level - Kannada
□ Moderate level - English
□ Moderate level - Hindi
□ Moderate level - Kannada
□ High level - English
□ High level - Hindi
□ High level - Kannada

...repeat for Days 2-7
```

## 🎯 **How It Works**

### **Automatic Language Detection:**
1. User selects language in LanguageSelector component
2. Language is stored in LanguageContext
3. VideoContentPlayer automatically loads the correct language video
4. If a language video is missing, falls back to English

### **Dynamic Video Loading:**
```javascript
// User selects Hindi
currentLanguage = 'hi'

// VideoContentPlayer automatically gets Hindi video
const videoContent = getVideoContent(dayModule.day, burdenLevel, 'hi');
// Returns Hindi video URL if available, English if not
```

## 🔄 **Testing Multi-Language Videos**

### **Test Process:**
1. Start your development server: `npm run dev`
2. Go to caregiver dashboard
3. Change language using LanguageSelector
4. Navigate to Day 0 (Core Module)
5. Verify the correct language video loads
6. Test all three languages: English, Hindi, Kannada

### **Test URLs:**
- English: `http://localhost:3002/caregiver/dashboard?lang=en`
- Hindi: `http://localhost:3002/caregiver/dashboard?lang=hi`
- Kannada: `http://localhost:3002/caregiver/dashboard?lang=kn`

## 🚀 **Quick Start Guide**

### **Current Status:**
✅ Multi-language video system implemented
✅ VideoContentPlayer updated for language support
✅ Kannada video for Day 0 already configured
⏳ Need to upload English and Hindi videos
⏳ Need to complete Day 1-7 videos for all languages

### **Next Steps:**
1. **Upload Core Module videos** for English and Hindi
2. **Update Day 0 configuration** with English and Hindi URLs
3. **Upload Day 1-7 videos** for all languages and levels
4. **Update configuration** for each day and level
5. **Test thoroughly** across all languages

## 💡 **Pro Tips**

1. **Batch Upload:** Upload all videos for one language at a time
2. **Consistent Naming:** Use exact naming convention for easy management
3. **Quality Check:** Test each video before updating configuration
4. **Fallback Strategy:** Always ensure English versions are available
5. **Documentation:** Keep track of which videos are uploaded

## 🛠️ **Troubleshooting**

### **Video Not Loading:**
- Check if video URL is correct in videoConfig.js
- Verify video is public in Cloudinary
- Check browser console for error messages

### **Wrong Language Loading:**
- Verify currentLanguage in LanguageContext
- Check if video exists for selected language
- Confirm fallback to English is working

### **Missing Videos:**
- Videos without language support will show "Content Coming Soon"
- Add videos to complete the experience

Your multi-language video system is now ready! 🌍✨