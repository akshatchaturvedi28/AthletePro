// Simple test script to verify OIDC setup
const fetch = require('node-fetch');

async function testAuthFlow() {
  console.log('🔍 Testing OIDC Authentication Setup...\n');

  // Test 1: Environment Variables
  console.log('1. Environment Variables Check:');
  console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
  console.log('   GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
  console.log('   GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || '❌ Missing');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('   SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing');
  console.log('');

  // Test 2: Server endpoints
  console.log('2. Testing Server Endpoints:');
  
  try {
    console.log('   Testing /auth/debug endpoint...');
    const debugResponse = await fetch('http://localhost:8080/auth/debug');
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('   ✅ Debug endpoint accessible');
      console.log('   Environment check:', {
        hasGoogleClientId: debugData.environment.hasGoogleClientId,
        hasGoogleClientSecret: debugData.environment.hasGoogleClientSecret,
        callbackUrl: debugData.environment.callbackUrl,
        nodeEnv: debugData.environment.nodeEnv
      });
    } else {
      console.log('   ❌ Debug endpoint failed:', debugResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Cannot connect to server:', error.message);
    console.log('   💡 Make sure server is running: npm run dev');
  }

  try {
    console.log('   Testing /auth/me endpoint...');
    const authResponse = await fetch('http://localhost:8080/auth/me');
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('   ✅ Auth endpoint accessible');
      console.log('   Authentication status:', authData.authenticated ? '✅ Authenticated' : '❌ Not authenticated');
    } else {
      console.log('   ❌ Auth endpoint failed:', authResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Auth endpoint error:', error.message);
  }

  console.log('');
  console.log('3. Next Steps:');
  console.log('   📝 Ensure all environment variables are set in your .env file');
  console.log('   🏃 Start the server: npm run dev');
  console.log('   🌐 Visit: http://localhost:8080/login');
  console.log('   🔍 Check console logs for detailed debugging information');
  console.log('   🐛 Visit http://localhost:8080/auth/debug for real-time debug info');
}

testAuthFlow().catch(console.error);
