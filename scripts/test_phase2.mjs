import { spawn } from 'child_process';
import path from 'path';

const ROOT_DIR = process.cwd();
const CLIENT_DIR = path.join(ROOT_DIR, 'client');
const SERVER_DIR = path.join(ROOT_DIR, 'server');

console.log('====================================================');
console.log('🧪 SWASTHYA SETU — PHASE 2 ROUTE & UI VERIFICATION');
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

async function waitForUrl(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return true;
    } catch {
      await new Promise(r => setTimeout(r, 400));
    }
  }
  return false;
}

async function runTests() {
  // 1. Boot backend
  console.log('1. Starting Backend Service (:5000)...');
  const serverProcess = spawn('node', ['dist/index.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: '5000', CLIENT_ORIGIN: 'http://localhost:5173' },
    stdio: 'pipe'
  });
  const backendReady = await waitForUrl('http://localhost:5000/api/v1/health');
  assert(backendReady, 'Backend server is running on port 5000');

  // 2. Boot Vite Dev Server
  console.log('\n2. Starting Vite Dev Server (:5173)...');
  const viteBin = path.join(CLIENT_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
  const viteProcess = spawn('node', [viteBin, '--port', '5173'], {
    cwd: CLIENT_DIR,
    env: { ...process.env },
    stdio: 'pipe'
  });
  const viteReady = await waitForUrl('http://localhost:5173/');
  assert(viteReady, 'Vite dev server is listening on port 5173');

  // 3. Test Core Routes
  console.log('\n3. Testing Client-Side Routing Endpoints...');
  const routesToTest = [
    { path: '/', name: 'ASHA / Role Home' },
    { path: '/patients', name: 'Patient Directory & Offline Cache' },
    { path: '/consultations', name: 'Consultation & Visit Notes' },
    { path: '/sync', name: 'Synchronization Dashboard' },
    { path: '/doctor', name: 'Doctor Clinical Workstation' },
    { path: '/doctor/telemedicine', name: 'Telemedicine Call Room Mockup' },
    { path: '/admin', name: 'Administrator Operations Center' },
    { path: '/admin/audit', name: 'Security Audit Trail' },
    // Patient / Citizen User Routes
    { path: '/patient', name: 'Patient / Citizen Home Portal' },
    { path: '/patient/prescriptions', name: 'Patient Prescriptions & Advice' },
    { path: '/patient/call', name: 'Patient Video / Audio Call View' },
    { path: '/patient/emergency', name: 'Patient Emergency Helplines & First-Aid' },
  ];

  for (const r of routesToTest) {
    const res = await fetch(`http://localhost:5173${r.path}`);
    assert(res.status === 200, `Route ${r.path} (${r.name}) returned HTTP 200`);
    const html = await res.text();
    assert(html.includes('id="root"'), `Route ${r.path} contains SPA mount container`);
  }

  // 4. Test API Proxy Connectivity from Client Route
  console.log('\n4. Verifying Client-to-Backend Heartbeat via Proxy...');
  const resProxy = await fetch('http://localhost:5173/api/v1/health');
  assert(resProxy.status === 200, 'Client successfully connects to backend via /api/v1/health proxy');
  const proxyJson = await resProxy.json();
  assert(proxyJson.status === 'ok', 'Heartbeat status is "ok"');

  // 5. Cleanup
  console.log('\n5. Tearing down test processes...');
  try { viteProcess.kill(); } catch {}
  try { serverProcess.kill(); } catch {}
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n====================================================');
  console.log(`📊 PHASE 2 VERIFICATION: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('====================================================');

  if (failCount > 0) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
