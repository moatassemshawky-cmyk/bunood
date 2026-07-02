import { Client } from '@neondatabase/serverless';

function getConnectionString(): string {
  const cs =
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (!cs) {
    throw new Error('Missing database connection string. Set NEON_DATABASE_URL or DATABASE_URL.');
  }
  return cs;
}

/**
 * Single DB access point for the whole app: opens a connection, runs fn,
 * always closes the connection afterward — even if fn throws.
 */
export async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: getConnectionString() });
  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}
