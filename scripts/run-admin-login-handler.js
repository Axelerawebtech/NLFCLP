require('dotenv').config({ path: '.env.local' });
const httpMocks = require('node-mocks-http');

(async () => {
  try {
    const handler = require('../pages/api/auth/admin-login').default;

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { username: 'admin', password: 'admin123' }
    });
    const res = httpMocks.createResponse();

    await handler(req, res);

    console.log('Status:', res._getStatusCode());
    console.log('Body:', res._getData());
  } catch (err) {
    console.error('Error invoking handler:', err.message, err.stack);
  }
})();
