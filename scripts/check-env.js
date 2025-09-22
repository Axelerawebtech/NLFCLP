

// Simple script to check environment variables
console.log('Environment Check:');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

if (process.env.MONGODB_URI) {
  // Hide password in URI for security
  const uri = process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@');
  console.log('MongoDB URI (masked):', uri);
}
