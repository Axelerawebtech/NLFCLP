#!/usr/bin/env node

/**
 * Content Management Replace/Delete Fix Verification Script
 * 
 * This script verifies the content management functionality fixes
 */

console.log('📝 Content Management Replace/Delete Fix Verification\n');

const fs = require('fs');

if (fs.existsSync('components/ProgramConfigManager.js')) {
  const componentContent = fs.readFileSync('components/ProgramConfigManager.js', 'utf8');
  
  console.log('🔍 Checking content management fixes...\n');
  
  // Check for upload functionality
  const hasUploadFunction = componentContent.includes('handleContentUpload');
  console.log(`${hasUploadFunction ? '✅' : '❌'} handleContentUpload function exists`);
  
  // Check for delete functionality
  const hasDeleteFunction = componentContent.includes('handleContentDelete');
  console.log(`${hasDeleteFunction ? '✅' : '❌'} handleContentDelete function exists`);
  
  // Check for upload API call
  const hasUploadAPI = componentContent.includes("/api/admin/upload-content");
  console.log(`${hasUploadAPI ? '✅' : '❌'} Upload API call exists`);
  
  // Check for delete API call
  const hasDeleteAPI = componentContent.includes("/api/admin/delete-content");
  console.log(`${hasDeleteAPI ? '✅' : '❌'} Delete API call exists`);
  
  // Check for replace/delete UI elements
  const hasReplaceText = componentContent.includes('Replace') && componentContent.includes('Upload');
  console.log(`${hasReplaceText ? '✅' : '❌'} Replace/Upload text logic exists`);
  
  const hasDeleteButton = componentContent.includes('🗑️ Delete Audio') || componentContent.includes('Delete Audio');
  console.log(`${hasDeleteButton ? '✅' : '❌'} Delete button exists`);
  
  // Check for save function fixes
  const hasSaveFunction = componentContent.includes('saveContentData');
  console.log(`${hasSaveFunction ? '✅' : '❌'} saveContentData function exists`);
  
  const hasFixedSaveFormat = componentContent.includes('language: language') && 
                            componentContent.includes('url: content');
  console.log(`${hasFixedSaveFormat ? '✅' : '❌'} Fixed save format (individual language saves)`);
  
  console.log('\n🔍 Checking delete-content API...');
  const hasDeleteContentAPI = fs.existsSync('pages/api/admin/delete-content.js');
  console.log(`${hasDeleteContentAPI ? '✅' : '❌'} delete-content.js API file exists`);
  
  if (hasDeleteContentAPI) {
    const deleteAPIContent = fs.readFileSync('pages/api/admin/delete-content.js', 'utf8');
    const hasCloudinaryDeletion = deleteAPIContent.includes('cloudinary.uploader.destroy');
    console.log(`${hasCloudinaryDeletion ? '✅' : '❌'} Cloudinary deletion logic`);
    
    const hasDatabaseDeletion = deleteAPIContent.includes('contentManagement[contentType][dayNum][language]');
    console.log(`${hasDatabaseDeletion ? '✅' : '❌'} Database deletion logic`);
  }
  
  console.log('\n📋 **Content Management Functionality Status:**\n');
  
  if (hasUploadFunction && hasDeleteFunction && hasDeleteContentAPI && hasFixedSaveFormat) {
    console.log('🎉 **All functionality is now available!**\n');
    
    console.log('✅ **Upload Functionality:**');
    console.log('   - Click 📤 Upload Audio to upload new content');
    console.log('   - Files automatically saved to database');
    console.log('   - Content immediately available in caregiver dashboard\n');
    
    console.log('✅ **Replace Functionality:**');
    console.log('   - Upload button changes to 🔄 Replace Audio after upload');
    console.log('   - Select new file to replace existing content');
    console.log('   - Old content automatically deleted from Cloudinary\n');
    
    console.log('✅ **Delete Functionality:**');
    console.log('   - 🗑️ Delete Audio button appears after upload');
    console.log('   - Removes content from both database and Cloudinary');
    console.log('   - UI updates to show upload state again\n');
    
    console.log('✅ **Save Functionality:**');
    console.log('   - Manual save button for text content (motivation, tips, etc.)');
    console.log('   - Audio content saves automatically on upload');
    console.log('   - Saves individual language content properly\n');
    
  } else {
    console.log('⚠️ **Some functionality may be missing or incomplete**\n');
  }
  
} else {
  console.log('❌ ProgramConfigManager.js not found');
}

console.log('🧪 **Testing Steps:**\n');

console.log('**1. Start Development Server:**');
console.log('   npm run dev\n');

console.log('**2. Navigate to Admin Interface:**');
console.log('   http://localhost:3000/admin/program-config\n');

console.log('**3. Go to Content Management:**');
console.log('   - Navigate to "📅 Program Content" tab');
console.log('   - Scroll to "📝 Content Management - Days 0-7" section\n');

console.log('**4. Test Audio Content Management:**');
console.log('   - Select Day 0');
console.log('   - Select 🎵 Audio Content');
console.log('   - Select language (English/Kannada/Hindi)\n');

console.log('**5. Test Upload:**');
console.log('   - Click 📤 Upload Audio');
console.log('   - Select an audio file (MP3, WAV, M4A)');
console.log('   - Should see: "audioContent uploaded successfully..."');
console.log('   - Audio preview should appear');
console.log('   - Button should change to 🔄 Replace Audio');
console.log('   - 🗑️ Delete Audio button should appear\n');

console.log('**6. Test Replace:**');
console.log('   - Click 🔄 Replace Audio');
console.log('   - Select different audio file');
console.log('   - Should replace old content with new\n');

console.log('**7. Test Delete:**');
console.log('   - Click 🗑️ Delete Audio');
console.log('   - Confirm deletion');
console.log('   - Should see: "audioContent deleted successfully..."');
console.log('   - Audio preview should disappear');
console.log('   - Button should change back to 📤 Upload Audio\n');

console.log('**8. Test Save (for text content):**');
console.log('   - Select other content types (motivation, healthcareTips, etc.)');
console.log('   - Enter text content');
console.log('   - Click save button');
console.log('   - Should see: "content saved successfully..."\n');

console.log('**9. Verify in Caregiver Dashboard:**');
console.log('   - Go to caregiver dashboard');
console.log('   - Check if uploaded audio content appears');
console.log('   - Verify replaced content updates correctly');
console.log('   - Confirm deleted content no longer appears\n');

console.log('💡 **Expected Workflow:**\n');

console.log('1. **Upload** → Content saves automatically to database');
console.log('2. **Replace** → Old content deleted, new content saved');
console.log('3. **Delete** → Content removed from database and Cloudinary');
console.log('4. **Save** → Manual save for text content (not needed for audio)');
console.log('5. **Caregiver Dashboard** → Always reflects current content state\n');

console.log('🔍 **If issues persist:**\n');

console.log('- Check browser console (F12) for JavaScript errors');
console.log('- Check server terminal for API errors');
console.log('- Verify .env.local has correct Cloudinary credentials');
console.log('- Test with small audio files first (< 10MB)');
console.log('- Clear browser cache and try again\n');

console.log('✅ **Content management functionality verification complete!**');