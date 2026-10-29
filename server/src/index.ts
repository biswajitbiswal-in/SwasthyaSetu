import http from 'http';
import app from './app';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/db';

const server = http.createServer(app);

async function startServer() {
  // Check Database Pool Readiness (non-blocking)
  await checkDatabaseConnection();

  server.listen(env.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏥 Swasthya Setu Backend Monolith Service`);
    console.log(`🌐 Server listening on http://localhost:${env.PORT}`);
    console.log(`🩺 Health endpoint: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`🔒 Environment: ${env.NODE_ENV}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
