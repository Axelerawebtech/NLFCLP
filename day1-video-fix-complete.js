/**
 * Complete Day 1 Video Fix Solution
 * 
 * This script provides multiple approaches to fix the Day 1 video issue:
 * 1. Manual database fix (when server is down)
 * 2. API-based fix (when server is running)
 * 3. Configuration verification
 */

console.log('🔧 Day 1 Video Fix - Comprehensive Solution\n');

// Method 1: Manual Database Fix (using MongoDB driver directly)
async function manualDatabaseFix() {
  console.log('📋 Method 1: Manual Database Fix');
  console.log('═'.repeat(50));
  
  const { MongoClient } = require('mongodb');
  const uri = process.env.MONGODB_URI || 'mongodb+srv://axelerawebtech_db_user:M7EOU2FK8vqO7vs3@cluster0.e6faone.mongodb.net/cancercare?retryWrites=true&w=majority&appName=Cluster0';
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('cancercare');
    const collection = db.collection('programconfigs');
    
    // Find the global config
    const config = await collection.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No global config found. Creating new one...');
      
      // Create a new global config with Day 1 structure
      const newConfig = {
        configType: 'global',
        caregiverId: null,
        day1: {
          videos: {
            mild: {
              videoTitle: { english: 'Day 1 Support Video for Mild Burden' },
              videoUrl: { english: '' }, // Will be filled with actual URL
              description: { english: 'Personalized support for caregivers with mild burden levels.' }
            },
            moderate: {
              videoTitle: { english: 'Day 1 Support Video for Moderate Burden' },
              videoUrl: { english: '' },
              description: { english: 'Personalized support for caregivers with moderate burden levels.' }
            },
            severe: {
              videoTitle: { english: 'Day 1 Support Video for Severe Burden' },
              videoUrl: { english: '' },
              description: { english: 'Personalized support for caregivers with severe burden levels.' }
            }
          }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await collection.insertOne(newConfig);
      console.log('✅ New global config created');
      
    } else {
      console.log('📋 Found existing global config');
      
      // Check current Day 1 structure
      if (!config.day1 || !config.day1.videos) {
        console.log('🔧 Adding Day 1 video structure...');
        
        const day1Structure = {
          videos: {
            mild: {
              videoTitle: { english: 'Day 1 Support Video for Mild Burden' },
              videoUrl: { english: '' },
              description: { english: 'Personalized support for caregivers with mild burden levels.' }
            },
            moderate: {
              videoTitle: { english: 'Day 1 Support Video for Moderate Burden' },
              videoUrl: { english: '' },
              description: { english: 'Personalized support for caregivers with moderate burden levels.' }
            },
            severe: {
              videoTitle: { english: 'Day 1 Support Video for Severe Burden' },
              videoUrl: { english: '' },
              description: { english: 'Personalized support for caregivers with severe burden levels.' }
            }
          }
        };
        
        await collection.updateOne(
          { _id: config._id },
          { 
            $set: { 
              day1: day1Structure,
              updatedAt: new Date()
            }
          }
        );
        
        console.log('✅ Day 1 structure added');
      }
      
      // Look for any Cloudinary video URLs in the database
      console.log('\n🔍 Searching for existing video URLs...');
      
      const findCloudinaryUrls = (obj, path = '') => {
        const urls = [];
        if (typeof obj === 'string' && obj.includes('cloudinary.com') && obj.includes('.mp4')) {
          urls.push({ path, url: obj });
        } else if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            urls.push(...findCloudinaryUrls(value, path ? `${path}.${key}` : key));
          }
        }
        return urls;
      };
      
      const foundUrls = findCloudinaryUrls(config);
      
      if (foundUrls.length > 0) {
        console.log('🎬 Found video URLs:');
        foundUrls.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.path}: ${item.url}`);
        });
        
        // If we find a video URL, assume it's the mild burden video
        if (foundUrls.length > 0) {
          const videoUrl = foundUrls[0].url;
          console.log(`\n🔧 Setting first video as mild burden video...`);
          
          await collection.updateOne(
            { _id: config._id },
            {
              $set: {
                'day1.videos.mild.videoUrl.english': videoUrl,
                'day1.videos.mild.videoTitle.english': 'Day 1 Support Video for Mild Burden',
                'day1.videos.mild.description.english': 'Personalized support content for caregivers with mild burden levels.',
                updatedAt: new Date()
              }
            }
          );
          
          console.log('✅ Mild burden video configured:', videoUrl);
        }
      } else {
        console.log('ℹ️ No existing video URLs found. You need to upload a video first.');
      }
    }
    
    // Verify the configuration
    console.log('\n🔍 Verifying Day 1 configuration...');
    const verifyConfig = await collection.findOne({ configType: 'global' });
    
    if (verifyConfig.day1?.videos?.mild?.videoUrl?.english) {
      console.log('✅ Day 1 mild video is configured:');
      console.log('   URL:', verifyConfig.day1.videos.mild.videoUrl.english);
    } else {
      console.log('❌ Day 1 mild video is not configured');
      console.log('\n💡 Next steps:');
      console.log('1. Upload a video through the admin panel');
      console.log('2. Use the API fix method to assign it to mild burden level');
      console.log('3. Or manually set the video URL in the database');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Method 2: API-based fix (when server is running)
function generateAPIFixInstructions() {
  console.log('\n📋 Method 2: API-based Fix (when server is running)');
  console.log('═'.repeat(50));
  
  console.log('If your server is running, use these API calls:\n');
  
  console.log('1. Check current Day 1 video configuration:');
  console.log('   curl http://localhost:3000/api/admin/day1-video\n');
  
  console.log('2. Add a video for mild burden level:');
  console.log(`   curl -X POST http://localhost:3000/api/admin/day1-video \\
     -H "Content-Type: application/json" \\
     -d '{
       "burdenLevel": "mild",
       "language": "english", 
       "videoUrl": "YOUR_CLOUDINARY_VIDEO_URL",
       "videoTitle": "Day 1 Support Video for Mild Burden",
       "description": "Personalized support for mild burden level"
     }'\n`);
  
  console.log('3. Test the video content API:');
  console.log('   curl http://localhost:3000/api/caregiver/get-video-content?day=1&language=english&burdenLevel=mild\n');
}

// Method 3: Manual URL insertion (if you know the Cloudinary URL)
function generateManualURLFix(videoUrl) {
  console.log('\n📋 Method 3: Manual URL Fix');
  console.log('═'.repeat(50));
  
  console.log('If you know your Cloudinary video URL, run this MongoDB update:');
  console.log(`
const { MongoClient } = require('mongodb');
const uri = 'YOUR_MONGODB_URI';
const client = new MongoClient(uri);

async function updateVideo() {
  await client.connect();
  const db = client.db('cancercare');
  const collection = db.collection('programconfigs');
  
  await collection.updateOne(
    { configType: 'global' },
    {
      $set: {
        'day1.videos.mild.videoUrl.english': '${videoUrl || 'YOUR_CLOUDINARY_VIDEO_URL'}',
        'day1.videos.mild.videoTitle.english': 'Day 1 Support Video for Mild Burden',
        'day1.videos.mild.description.english': 'Personalized support for mild burden level',
        updatedAt: new Date()
      }
    }
  );
  
  console.log('Video URL updated successfully');
  await client.close();
}

updateVideo();
`);
}

// Method 4: Test the fix
function generateTestInstructions() {
  console.log('\n📋 Method 4: Test the Fix');
  console.log('═'.repeat(50));
  
  console.log('After applying the fix, test it:');
  console.log('\n1. Start your development server:');
  console.log('   npm run dev\n');
  
  console.log('2. Complete the Zarit burden assessment with mild burden score');
  console.log('   (Answer questions to get a low total score)\n');
  
  console.log('3. Check if the video appears after assessment completion\n');
  
  console.log('4. If video still doesn\'t appear, check browser console for errors');
  console.log('   and verify the API response:\n');
  console.log('   curl http://localhost:3000/api/caregiver/get-video-content?day=1&language=english&burdenLevel=mild');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const method = args[0] || 'database';
  
  switch (method) {
    case 'database':
    case 'db':
      await manualDatabaseFix();
      break;
      
    case 'api':
      generateAPIFixInstructions();
      break;
      
    case 'manual':
      const videoUrl = args[1];
      generateManualURLFix(videoUrl);
      break;
      
    case 'test':
      generateTestInstructions();
      break;
      
    case 'all':
    default:
      await manualDatabaseFix();
      generateAPIFixInstructions();
      generateManualURLFix();
      generateTestInstructions();
      break;
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error.message);
});

// Run the fix
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { manualDatabaseFix, generateAPIFixInstructions, generateManualURLFix, generateTestInstructions };