#!/usr/bin/env node

/**
 * Video Upload Diagnostic Script
 * 
 * This script analyzes potential issues with video upload functionality
 * in the admin program configuration interface.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Video Upload Diagnostic Analysis\n');

// Check if required files exist
const requiredFiles = [
  'pages/api/admin/upload-video.js',
  'components/ProgramConfigManager.js',
  'pages/admin/program-config.js'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check environment variables
console.log('\n🔧 Checking environment configuration...');
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasCloudinary = envContent.includes('CLOUDINARY_CLOUD_NAME') &&
                       envContent.includes('CLOUDINARY_API_KEY') &&
                       envContent.includes('CLOUDINARY_API_SECRET');
  console.log(`${hasCloudinary ? '✅' : '❌'} Cloudinary configuration`);
  
  const hasMongoDB = envContent.includes('MONGODB_URI');
  console.log(`${hasMongoDB ? '✅' : '❌'} MongoDB configuration`);
} else {
  console.log('❌ .env.local file not found');
}

// Analyze ProgramConfigManager for potential issues
console.log('\n🧩 Analyzing ProgramConfigManager component...');
if (fs.existsSync('components/ProgramConfigManager.js')) {
  const componentContent = fs.readFileSync('components/ProgramConfigManager.js', 'utf8');
  
  // Check for video upload handler
  const hasVideoUploadHandler = componentContent.includes('handleVideoUpload');
  console.log(`${hasVideoUploadHandler ? '✅' : '❌'} handleVideoUpload function exists`);
  
  // Check for file input elements
  const hasFileInput = componentContent.includes('type="file"') && 
                      componentContent.includes('accept="video/*"');
  console.log(`${hasFileInput ? '✅' : '❌'} File input with video/* accept`);
  
  // Check for video content management section
  const hasVideoContentSection = componentContent.includes('Video Content Management') ||
                                 componentContent.includes('video content');
  console.log(`${hasVideoContentSection ? '✅' : '❌'} Video content management section`);
  
  // Check for upload API call
  const hasUploadAPICall = componentContent.includes("/api/admin/upload-video");
  console.log(`${hasUploadAPICall ? '✅' : '❌'} Upload API call to /api/admin/upload-video`);
  
  // Check for error handling
  const hasErrorHandling = componentContent.includes('catch') && 
                          componentContent.includes('error');
  console.log(`${hasErrorHandling ? '✅' : '❌'} Error handling present`);
  
  // Check for file size validation
  const hasFileSizeValidation = componentContent.includes('file.size') ||
                               componentContent.includes('fileSizeInMB');
  console.log(`${hasFileSizeValidation ? '✅' : '❌'} File size validation`);
}

// Check upload-video API
console.log('\n🌐 Analyzing upload-video API...');
if (fs.existsSync('pages/api/admin/upload-video.js')) {
  const apiContent = fs.readFileSync('pages/api/admin/upload-video.js', 'utf8');
  
  // Check for formidable import
  const hasFormidable = apiContent.includes('formidable');
  console.log(`${hasFormidable ? '✅' : '❌'} Formidable for file parsing`);
  
  // Check for cloudinary import
  const hasCloudinary = apiContent.includes('cloudinary');
  console.log(`${hasCloudinary ? '✅' : '❌'} Cloudinary SDK import`);
  
  // Check for proper config export
  const hasProperConfig = apiContent.includes('bodyParser: false');
  console.log(`${hasProperConfig ? '✅' : '❌'} bodyParser disabled for file uploads`);
  
  // Check for timeout handling
  const hasTimeoutHandling = apiContent.includes('timeout');
  console.log(`${hasTimeoutHandling ? '✅' : '❌'} Timeout configuration`);
  
  // Check for large file handling
  const hasLargeFileHandling = apiContent.includes('upload_large') ||
                              apiContent.includes('chunk');
  console.log(`${hasLargeFileHandling ? '✅' : '❌'} Large file handling (chunked upload)`);
  
  // Check for file cleanup
  const hasFileCleanup = apiContent.includes('unlinkSync') ||
                        apiContent.includes('cleanup');
  console.log(`${hasFileCleanup ? '✅' : '❌'} Temporary file cleanup`);
}

console.log('\n🎯 Common Video Upload Issues & Solutions:\n');

console.log('1. **File Size Limits**');
console.log('   - Browser limit: ~2GB for form uploads');
console.log('   - Cloudinary limit: 100MB for standard upload');
console.log('   - Solution: Use chunked upload for files >100MB\n');

console.log('2. **File Format Issues**');
console.log('   - Supported: MP4, MOV, AVI, MKV, WebM');
console.log('   - Common issue: Unsupported codec or container');
console.log('   - Solution: Convert to MP4 with H.264 codec\n');

console.log('3. **Network Timeouts**');
console.log('   - Large files may timeout during upload');
console.log('   - Solution: Increase timeout values in API and client\n');

console.log('4. **Cloudinary Configuration**');
console.log('   - Missing or incorrect API keys');
console.log('   - Incorrect resource_type (should be "video")');
console.log('   - Solution: Verify .env.local settings\n');

console.log('5. **Frontend Issues**');
console.log('   - File input not triggering upload');
console.log('   - JavaScript errors preventing upload');
console.log('   - Solution: Check browser console for errors\n');

console.log('6. **Backend Processing**');
console.log('   - Formidable parsing errors');
console.log('   - Temporary file access issues');
console.log('   - Solution: Check server logs for detailed errors\n');

console.log('💡 **Debugging Steps:**');
console.log('1. Open browser DevTools (F12)');
console.log('2. Go to Network tab');
console.log('3. Try uploading a small test video (<10MB)');
console.log('4. Check for failed requests or errors');
console.log('5. Check Console tab for JavaScript errors');
console.log('6. Check server terminal for backend errors\n');

console.log('📋 **Quick Test:**');
console.log('1. Start dev server: npm run dev');
console.log('2. Go to: http://localhost:3000/admin/program-config');
console.log('3. Navigate to Video Content Management section');
console.log('4. Try uploading a small MP4 file');
console.log('5. Check browser console and server logs for errors\n');

console.log('🔧 **If uploads still fail:**');
console.log('1. Verify Cloudinary credentials in .env.local');
console.log('2. Test with a very small video file (1-2MB)');
console.log('3. Check if upload-video API responds to simple requests');
console.log('4. Ensure all dependencies are installed (npm install)');
console.log('5. Clear browser cache and try again\n');

console.log('✅ Diagnostic analysis complete!');