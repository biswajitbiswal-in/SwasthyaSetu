import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const SERVER_DIR = path.join(ROOT_DIR, 'server');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');

console.log('====================================================');
console.log('🧪 SWASTHYA SETU — PHASE 1 INTEGRATION TEST SUITE');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

async function waitForServer(url, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return true;
    } catch {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  return false;
}

async function runTests() {
  // 1. Static Asset & Build Verifications
  console.log('📦 1. Verifying Built Artifacts...');
  assert(fs.existsSync(path.join(SERVER_DIR, 'dist', 'index.js')), 'Server compiled bundle exists (dist/index.js)');
  assert(fs.existsSync(path.join(CLIENT_DIR, 'dist', 'index.html')), 'Client HTML bundle exists (dist/index.html)');
  assert(fs.existsSync(path.join(CLIENT_DIR, 'dist', 'sw.js')), 'Service Worker bundle exists (dist/sw.js)');
  assert(fs.existsSync(path.join(CLIENT_DIR, 'dist', 'manifest.webmanifest')), 'PWA Webmanifest exists (dist/manifest.webmanifest)');

  // Verify webmanifest contents
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(CLIENT_DIR, 'dist', 'manifest.webmanifest'), 'utf8'));
    assert(manifest.name === 'Swasthya Setu — Low-Network Telemedicine', 'PWA manifest contains correct platform name');
    assert(manifest.display === 'standalone', 'PWA manifest configured for standalone mobile mode');
  } catch (err) {
    assert(false, `PWA manifest is valid JSON: ${err.message}`);
  }

  // 2. Server Runtime & Endpoint Verification
  console.log('\n🚀 2. Testing Backend Server Runtime on Port 5050...');
  const serverProcess = spawn('node', ['dist/index.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: '5050', CLIENT_ORIGIN: 'http://localhost:5173' },
    stdio: 'pipe'
  });

  serverProcess.stdout.on('data', (d) => {
    // optional debug
  });
  serverProcess.stderr.on('data', (d) => {
    console.error(`Server stderr: ${d.toString()}`);
  });

  const isServerReady = await waitForServer('http://localhost:5050/api/v1/health');
  assert(isServerReady, 'Backend server booted and listening on port 5050');

  if (isServerReady) {
    // Test GET /health
    const resGet = await fetch('http://localhost:5050/api/v1/health');
    assert(resGet.status === 200, 'GET /api/v1/health returns HTTP 200 OK');
    const body = await resGet.json();
    assert(body.status === 'ok', 'Response body has { status: "ok" }');
    assert(body.service === 'Swasthya Setu API Gateway', 'Service identified as Swasthya Setu API Gateway');
    assert(body.version === '1.0.0', 'Version matches 1.0.0');
    assert(body.database && body.database.type === 'PostgreSQL', 'Database type correctly identified as PostgreSQL');

    // Test Security Headers (Helmet)
    assert(resGet.headers.get('x-content-type-options') === 'nosniff', 'Helmet active: X-Content-Type-Options: nosniff');

    // Test HEAD /health
    const resHead = await fetch('http://localhost:5050/api/v1/health', { method: 'HEAD' });
    assert(resHead.status === 200, 'HEAD /api/v1/health returns HTTP 200 OK (heartbeat probe)');

    // Test CORS Preflight
    const resCors = await fetch('http://localhost:5050/api/v1/health', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    assert(resCors.headers.get('access-control-allow-origin') === 'http://localhost:5173', 'CORS origin header matches http://localhost:5173');
    assert(resCors.headers.get('access-control-allow-credentials') === 'true', 'CORS credentials allowed for secure cookies');

    // Test 404 Error Envelope
    const res404 = await fetch('http://localhost:5050/api/v1/non-existent-route');
    assert(res404.status === 404, 'Unknown route returns HTTP 404');
    const errBody = await res404.json();
    assert(errBody.error && errBody.error.code === 'ROUTE_NOT_FOUND', '404 conforms to architectural error envelope');
  }

  // Terminate server process cleanly
  await new Promise((resolve) => {
    serverProcess.on('exit', () => resolve());
    serverProcess.kill();
    setTimeout(resolve, 1000);
  });

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('====================================================');

  if (failCount > 0) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }
}

runTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
