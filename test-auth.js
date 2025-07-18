const fetch = require('node-fetch');

async function testAuth() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('🔍 Testing authentication flow...\n');
    
    // Test 1: Get CSRF token
    console.log('1. Getting CSRF token...');
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
    const csrfData = await csrfResponse.json();
    console.log('CSRF Token:', csrfData.csrfToken ? '✅ Retrieved' : '❌ Failed');
    
    // Test 2: Test sign-in
    console.log('\n2. Testing sign-in...');
    const signInData = new URLSearchParams({
        email: 'test@example.com',
        password: 'TestPass123!',
        csrfToken: csrfData.csrfToken,
        callbackUrl: `${baseUrl}/dashboard`
    });
    
    const signInResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: signInData,
        redirect: 'manual'
    });
    
    console.log('Sign-in Status:', signInResponse.status);
    console.log('Sign-in Headers:', Object.fromEntries(signInResponse.headers));
    
    // Test 3: Check session with cookies
    console.log('\n3. Testing session with cookies...');
    const cookies = signInResponse.headers.get('set-cookie');
    
    if (cookies) {
        const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
            headers: {
                'Cookie': cookies
            }
        });
        
        const sessionData = await sessionResponse.json();
        console.log('Session Data:', sessionData);
        
        if (sessionData.user) {
            console.log('✅ Authentication successful!');
            console.log('User:', sessionData.user);
        } else {
            console.log('❌ Authentication failed - no user in session');
        }
    } else {
        console.log('❌ No cookies received from sign-in');
    }
    
    // Test 4: Test dashboard access
    console.log('\n4. Testing dashboard access...');
    if (cookies) {
        const dashboardResponse = await fetch(`${baseUrl}/dashboard`, {
            headers: {
                'Cookie': cookies
            },
            redirect: 'manual'
        });
        
        console.log('Dashboard Status:', dashboardResponse.status);
        if (dashboardResponse.status === 200) {
            console.log('✅ Dashboard accessible');
        } else {
            console.log('❌ Dashboard not accessible');
        }
    }
}

testAuth().catch(console.error); 