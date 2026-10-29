import { spawn } from 'child_process';
import path from 'path';

const ROOT_DIR = process.cwd();
const SERVER_DIR = path.join(ROOT_DIR, 'server');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');

console.log('====================================================');
console.log('🧪 TESTING VITE DEV SERVER & PROXY INTEGRATION');
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

async function runTest() {
  // 1. Start backend server on port 5000
  console.log('1. Starting Backend Server on Port 5000...');
  const serverProcess = spawn('node', ['dist/index.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: '5000', CLIENT_ORIGIN: 'http://localhost:5173' },
    stdio: 'pipe'
  });

  const backendReady = await waitForUrl('http://localhost:5000/api/v1/health');
  assert(backendReady, 'Backend server is ready on http://localhost:5000');

  // 2. Start Vite dev server on port 5173
  console.log('\n2. Starting Vite Dev Server on Port 5173...');
  // Start Vite dev server on port 5173
  const viteBin = path.join(CLIENT_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
  const viteProcess = spawn('node', [viteBin, '--port', '5173'], {
    cwd: CLIENT_DIR,
    env: { ...process.env },
    stdio: 'pipe'
  });

  const viteReady = await waitForUrl('http://localhost:5173/');
  assert(viteReady, 'Vite dev server is ready on http://localhost:5173');

  // 3. Query Vite root page
  console.log('\n3. Probing Frontend Root Page...');
  const resClient = await fetch('http://localhost:5173/');
  assert(resClient.status === 200, 'Frontend root returns HTTP 200');
  const html = await resClient.text();
  assert(html.includes('Swasthya Setu'), 'HTML contains platform title "Swasthya Setu"');
  assert(html.includes('id="root"'), 'HTML contains React mount point root div');

  // 4. Query Vite proxy to backend API
  console.log('\n4. Probing Vite API Proxy (/api/v1/health -> port 5000)...');
  const resProxy = await fetch('http://localhost:5173/api/v1/health');
  assert(resProxy.status === 200, 'Vite proxy forward returns HTTP 200 from backend');
  const proxyBody = await resProxy.json();
  assert(proxyBody.status === 'ok', 'Proxied response JSON contains status: "ok"');
  assert(proxyBody.service === 'Swasthya Setu API Gateway', 'Proxied response confirms backend service identity');

  // Cleanup processes cleanly
  console.log('\n5. Cleaning up child processes...');
  try { viteProcess.kill(); } catch {}
  try { serverProcess.kill(); } catch {}
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n====================================================');
  console.log(`📊 VITE PROXY TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('====================================================');

  if (failCount > 0) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }
}

runTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
