// Global setup for Jest tests

module.exports = async () => {
  // Set global test environment variables
  process.env.NODE_ENV = 'test';
  process.env.TZ = 'UTC';
  
  // Setup test database if needed
  console.log('🧪 Setting up test environment...');
  
  // You can add database setup, test server startup, etc. here
  // For example:
  // await setupTestDatabase();
  // await startTestServer();
  
  console.log('✅ Test environment setup complete');
};