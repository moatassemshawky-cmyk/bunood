import { Client } from '@neondatabase/serverless';

export function createNeonClient() {
  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing NEON_DATABASE_URL environment variable');
  }
  return new Client({ connectionString });
}
