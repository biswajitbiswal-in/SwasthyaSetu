import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from './app';

test('Health Check Endpoint Smoke Test', async (t) => {
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const address = server.address();
  assert(address && typeof address === 'object', 'Server address must be an object');
  const port = address.port;

  await t.test('GET /api/v1/health returns HTTP 200 with status "ok"', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/health`);
    assert.equal(res.status, 200);

    const body: any = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.version, '1.0.0');
    assert.equal(body.service, 'Swasthya Setu API Gateway');
    assert(body.timestamp, 'Timestamp should be present');
    assert(body.database, 'Database status object should be present');
  });

  await t.test('HEAD /api/v1/health returns HTTP 200 for network heartbeat probe', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/health`, { method: 'HEAD' });
    assert.equal(res.status, 200);
  });

  await t.test('GET /api/v1/non-existent returns 404 with standard error envelope', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/non-existent`);
    assert.equal(res.status, 404);
    const body: any = await res.json();
    assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
  });

  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});
