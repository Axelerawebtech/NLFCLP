const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkFeedbackInProgram() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const CaregiverProgram = mongoose.connection.collection('caregiverprograms');
    const programs = await CaregiverProgram.find({}).toArray();
    
    console.log(`Total programs: ${programs.length}\n`);

    for (const prog of programs) {
      console.log(`Caregiver ID: ${prog.caregiverId}`);
      
      // Check day 7 module
      const day7 = prog.dayModules?.find(d => d.day === 7);
      if (day7) {
        console.log(`\n  Day 7 Progress: ${day7.progressPercentage}%`);
        console.log(`  Task Responses: ${day7.taskResponses?.length || 0}`);
        
        if (day7.taskResponses && day7.taskResponses.length > 0) {
          day7.taskResponses.forEach((resp, i) => {
            console.log(`\n    Response ${i+1}:`);
            console.log(`      Task ID: ${resp.taskId}`);
            console.log(`      Task Type: ${resp.taskType}`);
            if (resp.taskType === 'feedback-form') {
              console.log(`      ✅ FEEDBACK FORM FOUND!`);
              console.log(`      Response Data:`, JSON.stringify(resp.responseData, null, 2));
              console.log(`      Response Text:`, resp.responseText);
            }
          });
        }
      }
      console.log('\n---\n');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkFeedbackInProgram();
