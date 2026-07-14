import { neon } from '@neondatabase/serverless';

let sqlClient = null;

function sql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }
  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }
  return sqlClient;
}

async function ensureTable() {
  const query = sql();
  await query`
    CREATE TABLE IF NOT EXISTS cms_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

export async function readContent() {
  await ensureTable();
  const query = sql();
  const rows = await query`SELECT key, value FROM cms_content`;
  if (rows.length === 0) return null;
  return Object.fromEntries(rows.map(row => [row.key, row.value]));
}

// A single set-based upsert, so the whole save is one atomic statement —
// no multi-statement transaction needed with the HTTP driver.
export async function writeContent(content) {
  await ensureTable();
  const query = sql();
  const entries = Object.entries(content).filter(([, value]) => typeof value === 'string');
  if (entries.length === 0) return;
  const keys = entries.map(([key]) => key);
  const values = entries.map(([, value]) => value);
  await query`
    INSERT INTO cms_content (key, value)
    SELECT * FROM unnest(${keys}::text[], ${values}::text[])
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
  `;
}
