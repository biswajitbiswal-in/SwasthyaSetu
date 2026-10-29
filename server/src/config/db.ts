import { Pool } from 'pg';
import { env } from './env';

// Create a singleton PostgreSQL pool
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

let isDbConnected = false;

// Non-blocking initial connection probe
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isDbConnected = true;
    console.log('✅ PostgreSQL database connection established successfully.');
    return true;
  } catch (err: any) {
    isDbConnected = false;
    const reason = err?.message || err?.code || 'Connection refused';
    console.warn(`⚠️ PostgreSQL connection not available (${reason}). Server running in offline/standby DB mode.`);
    return false;
  }
}

export function getDatabaseStatus(): { connected: boolean; type: string } {
  return {
    connected: isDbConnected,
    type: 'PostgreSQL'
  };
}
