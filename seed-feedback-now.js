const http = require('http');

const postData = JSON.stringify({});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/admin/seed-feedback-template',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('\nSeed Result:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success && result.template && result.template.feedbackFields) {
        console.log(`\n✅ Successfully seeded ${result.template.feedbackFields.length} feedback questions!`);
      }
    } catch (err) {
      console.error('Error parsing response:', err);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(postData);
req.end();
