const http = require('http');

console.log('🏀 Testing Basketball App API Endpoints...\n');

const endpoints = [
  '/api/auth/session',
  '/api/users',
  '/api/drills',
  '/api/drills/available',
  '/api/workouts',
  '/api/workouts/available',
  '/api/achievements',
  '/api/challenges',
  '/api/teams',
  '/api/levels',
  '/api/dashboard/stats',
  '/api/parent/dashboard',
  '/api/parent/email-settings'
];

let results = [];
let completed = 0;

endpoints.forEach((endpoint, index) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: endpoint,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const success = res.statusCode >= 200 && res.statusCode < 500;
      console.log(`${success ? '✅' : '❌'} GET ${endpoint} - ${res.statusCode}`);
      results.push({ endpoint, statusCode: res.statusCode, success });
      
      completed++;
      if (completed === endpoints.length) {
        const passed = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        console.log(`\n🎯 Summary: ${passed} passed, ${failed} failed out of ${endpoints.length} total`);
        console.log(`Success Rate: ${((passed / endpoints.length) * 100).toFixed(1)}%`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ GET ${endpoint} - ERROR: ${error.message}`);
    results.push({ endpoint, statusCode: 0, success: false, error: error.message });
    
    completed++;
    if (completed === endpoints.length) {
      const passed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      console.log(`\n🎯 Summary: ${passed} passed, ${failed} failed out of ${endpoints.length} total`);
      console.log(`Success Rate: ${((passed / endpoints.length) * 100).toFixed(1)}%`);
    }
  });

  req.setTimeout(5000, () => {
    req.destroy();
    console.log(`❌ GET ${endpoint} - TIMEOUT`);
    results.push({ endpoint, statusCode: 0, success: false, error: 'timeout' });
    
    completed++;
    if (completed === endpoints.length) {
      const passed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      console.log(`\n🎯 Summary: ${passed} passed, ${failed} failed out of ${endpoints.length} total`);
      console.log(`Success Rate: ${((passed / endpoints.length) * 100).toFixed(1)}%`);
    }
  });

  req.end();
});
