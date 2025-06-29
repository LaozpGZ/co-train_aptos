// Global teardown for Jest tests

module.exports = async () => {
  console.log('🧹 Cleaning up test environment...');
  
  // Cleanup test database, stop test servers, etc.
  // For example:
  // await cleanupTestDatabase();
  // await stopTestServer();
  
  console.log('✅ Test environment cleanup complete');
};