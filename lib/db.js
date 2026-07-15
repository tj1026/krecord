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
  try {
    await query`
      CREATE TABLE IF NOT EXISTS cms_content (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
  } catch (error) {
    // Two concurrent "CREATE TABLE IF NOT EXISTS" statements can race on the
    // pg_type system catalog: the existence check isn't atomic with the row
    // each one inserts there, so on a fresh database one caller can hit a
    // duplicate-key error even though the table ends up created. If that
    // happens the table now exists, so it's safe to continue.
    const message = error?.message || '';
    if (!/pg_type_typname_nsp_index|duplicate key|already exists/i.test(message)) {
      throw error;
    }
  }
}

export async function readContent() {
  await ensureTable();
  const query = sql();
  const rows = await query`SELECT key, value FROM cms_content`;
  if (rows.length === 0) return null;
  return Object.fromEntries(rows.map(row => [row.key, row.value]));
}

// Site settings (e.g. whether the visitor password gate is on) live in their
// own table so a "Save changes" content publish can never clobber them.
async function ensureSettingsTable() {
  const query = sql();
  try {
    await query`
      CREATE TABLE IF NOT EXISTS cms_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
  } catch (error) {
    // Same fresh-database create race as ensureTable(); see the note there.
    const message = error?.message || '';
    if (!/pg_type_typname_nsp_index|duplicate key|already exists/i.test(message)) {
      throw error;
    }
  }
}

export async function readSetting(key) {
  await ensureSettingsTable();
  const query = sql();
  const rows = await query`SELECT value FROM cms_settings WHERE key = ${key}`;
  return rows.length ? rows[0].value : null;
}

export async function writeSetting(key, value) {
  await ensureSettingsTable();
  const query = sql();
  await query`
    INSERT INTO cms_settings (key, value)
    VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
  `;
}

const SITE_ACCESS_KEY = 'site_access_password_enabled';

// The gate defaults to ON: an unconfigured database (or no stored setting yet)
// must never accidentally expose a site that was meant to stay private.
export async function isSitePasswordEnabled() {
  const value = await readSetting(SITE_ACCESS_KEY);
  return value === null ? true : value === 'true';
}

export async function setSitePasswordEnabled(enabled) {
  await writeSetting(SITE_ACCESS_KEY, enabled ? 'true' : 'false');
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
