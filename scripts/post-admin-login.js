const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
  try {
  const res = await fetch('http://localhost:3002/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
