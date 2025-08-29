const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testAuth() {
  console.log('🔍 Testing Authentication System...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test 2: Register new user
    console.log('\n2. Testing user registration...');
    const registerData = {
      email: 'testuser@example.com',
      name: 'Test User',
      password: 'password123'
    };

    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log('✅ Registration successful:', registerResult.data.user.email);
      
      // Test 3: Login with new user
      console.log('\n3. Testing user login...');
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const loginResult = await loginResponse.json();
      console.log('✅ Login successful:', loginResult.data.user.email);
      const token = loginResult.data.token;

      // Test 4: Access protected profile endpoint
      console.log('\n4. Testing protected profile endpoint...');
      const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const profileResult = await profileResponse.json();
      console.log('✅ Profile access successful:', profileResult.data.name);

      // Test 5: Access achievements (should be empty for new user)
      console.log('\n5. Testing user-scoped achievements...');
      const achievementsResponse = await fetch(`${API_BASE}/achievements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const achievementsResult = await achievementsResponse.json();
      console.log('✅ Achievements fetched:', achievementsResult.data.length, 'achievements');

      console.log('\n🎉 All authentication tests passed!');
    } else {
      const error = await registerResponse.json();
      console.log('❌ Registration failed:', error.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();