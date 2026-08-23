import express from 'express';
import pool from './db';

const app = express();
app.use(express.json());

app.get('/api/v1/devices', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.device_serial,
        d.created_at,
        d.last_seen_at,
        t.cpu_pct,
        t.mem_used_mb,
        t.mem_total_mb,
        t.uptime_s,
        t.recorded_at
      FROM devices d
      LEFT JOIN LATERAL (
        SELECT cpu_pct, mem_used_mb, mem_total_mb, uptime_s, recorded_at
        FROM telemetry_log
        WHERE device_id = d.id
        ORDER BY recorded_at DESC
        LIMIT 1
      ) t ON true
      ORDER BY d.last_seen_at DESC NULLS LAST
    `);

    const devices = result.rows.map((row) => ({
      id: row.id,
      device_serial: row.device_serial,
      online: row.last_seen_at &&
        (Date.now() - new Date(row.last_seen_at).getTime()) < 30000,
      created_at: row.created_at,
      last_seen_at: row.last_seen_at,
      telemetry: row.cpu_pct !== null ? {
        cpu_pct: row.cpu_pct,
        mem_used_mb: row.mem_used_mb,
        mem_total_mb: row.mem_total_mb,
        uptime_s: row.uptime_s,
        recorded_at: row.recorded_at,
      } : null,
    }));

    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/devices/:id/telemetry', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;

    const result = await pool.query(
      `SELECT cpu_pct, mem_used_mb, mem_total_mb, uptime_s, recorded_at
       FROM telemetry_log
       WHERE device_id = $1
       ORDER BY recorded_at DESC
       LIMIT $2`,
      [id, limit]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/deployments', async (req, res) => {
  try {
    const { device_id, model_path } = req.body;

    if (!device_id || !model_path) {
      return res.status(400).json({ error: 'device_id and model_path required' });
    }

    // Verify device exists
    const deviceCheck = await pool.query(
      'SELECT id FROM devices WHERE id = $1',
      [device_id]
    );

    if (deviceCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Create deployment record
    const crypto = await import('crypto');
    const sha256 = crypto.createHash('sha256').update(model_path).digest('hex');

    const result = await pool.query(
      `INSERT INTO deployments (device_id, model_path, sha256, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id, device_id, model_path, sha256, status, created_at`,
      [device_id, model_path, sha256]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/deployments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dep.*, d.device_serial
      FROM deployments dep
      JOIN devices d ON d.id = dep.device_id
      ORDER BY dep.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export function startRestServer(): express.Application {
  const port = parseInt(process.env.REST_PORT || '3001');
  app.listen(port, () => {
    console.log(`REST API listening on port ${port}`);
  });
  return app;
}
