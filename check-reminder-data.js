const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/caregiver-support')
  .then(async () => {
    const ProgramConfig = mongoose.model('ProgramConfig', new mongoose.Schema({}, { strict: false }));
    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (config && config.dynamicDays) {
      const day0 = config.dynamicDays.find(d => d.dayNumber === 0 && d.language === 'english');
      if (day0 && day0.contentByLevel) {
        const defaultLevel = day0.contentByLevel.find(l => l.levelKey === 'default');
        if (defaultLevel && defaultLevel.tasks) {
          const reminderTask = defaultLevel.tasks.find(t => t.taskType === 'reminder');
          if (reminderTask) {
            console.log('\n📋 Reminder Task in Database:');
            console.log(JSON.stringify(reminderTask, null, 2));
            console.log('\n🔍 Content field specifically:');
            console.log(JSON.stringify(reminderTask.content, null, 2));
          } else {
            console.log('\n⚠️ No reminder task found');
            console.log('Available tasks:', defaultLevel.tasks.map(t => t.taskType));
          }
        }
      }
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
