import pool from './db';

async function setup() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_serial  TEXT UNIQUE NOT NULL,
        public_key     TEXT,
        created_at     TIMESTAMP DEFAULT now(),
        last_seen_at   TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS telemetry_log (
        id             BIGSERIAL PRIMARY KEY,
        device_id      UUID REFERENCES devices(id),
        cpu_pct        REAL,
        mem_used_mb    INT,
        mem_total_mb   INT,
        uptime_s       BIGINT,
        recorded_at    TIMESTAMP NOT NULL,
        received_at    TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS deployments (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id      UUID REFERENCES devices(id),
        model_path     TEXT NOT NULL,
        sha256         TEXT NOT NULL,
        status         TEXT DEFAULT 'pending',
        created_at     TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS device_secrets (
        device_serial  TEXT PRIMARY KEY,
        secret_hash    TEXT NOT NULL,
        created_at     TIMESTAMP DEFAULT now()
      );
    `);
    console.log('Database schema created successfully');
  } finally {
    client.release();
  }
}

setup().catch(console.error);
