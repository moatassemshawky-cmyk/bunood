import { Client } from '@neondatabase/serverless';

export function createNeonClient() {
  const connectionString =
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    throw new Error('Missing database connection string. Set NEON_DATABASE_URL or DATABASE_URL.');
  }

  return new Client({ connectionString });
}
