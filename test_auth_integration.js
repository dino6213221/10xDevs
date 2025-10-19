// Simple test script to verify auth API endpoints
// This can be run with: node test_auth_integration.js

const BASE_URL = 'http://localhost:3001';

async function testAuthEndpoint(endpoint, payload, expectedStatus = 200) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(`${endpoint}: Status ${response.status}, Expected ${expectedStatus}`);

    if (response.status === expectedStatus) {
      console.log('✅ SUCCESS');
    } else {
      console.log('❌ FAILED - Error:', data.error);
    }

    return { success: response.status === expectedStatus, data };
  } catch (error) {
    console.log(`${endpoint}: NETWORK ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Authentication Integration...\n');

  console.log('🔗 Auth Page URLs (visit these to test the UI):');
  console.log('   Login:    http://localhost:3001/auth/login');
  console.log('   Register: http://localhost:3001/auth/register');
  console.log('   Reset:    http://localhost:3001/auth/reset-password');
  console.log('');

  // Test register endpoint (this should fail with existing email, which is expected)
  await testAuthEndpoint('/api/auth/register', {
    email: 'test@example.com',
    password: 'Password123!'
  }, 400); // Expected to fail due to existing user or invalid email

  // Test login endpoint (should fail with invalid credentials)
  await testAuthEndpoint('/api/auth/login', {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  }, 401); // Expected to fail with invalid credentials (401 Unauthorized is correct)

  // Test reset password endpoint
  await testAuthEndpoint('/api/auth/reset-password', {
    email: 'test@example.com'
  }, 200); // Should succeed even if email doesn't exist for security

  console.log('\n🎉 Auth integration testing complete!');
  console.log('Note: Full end-to-end testing requires valid Supabase credentials in .env');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { testAuthEndpoint, runTests };
