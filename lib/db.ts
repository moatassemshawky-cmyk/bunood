import { Client } from '@neondatabase/serverless';

function getConnectionString(): string {
  return (
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ''
  );
}

export async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const cs = getConnectionString();
  if (!cs) throw new Error('Missing DB connection string');
  const client = new Client({ connectionString: cs });
  try {
    await client.connect();
    return await fn(client);
  } catch (err) {
    console.error('[db] error', err);
    throw err;
  } finally {
    try { await client.end(); } catch { /* ignore */ }
  }
}
