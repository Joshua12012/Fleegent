pub mod proto {
    tonic::include_proto!("edge.v1");
}

pub mod nats_subjects {
    pub const TELEMETRY_HARDWARE: &str = "telemetry.hardware";
    pub const INFERENCE_REQUEST: &str = "inference.request";
    pub const INFERENCE_RESPONSE: &str = "inference.response";
    pub const MODEL_DEPLOY: &str = "model.deploy";
    pub const WORKER_HEALTH: &str = "worker.health";
}

pub mod telemetry {
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct HardwareSample {
        pub device_id: String,
        pub cpu_pct: f64,
        pub mem_used_mb: i32,
        pub mem_total_mb: i32,
        pub uptime_s: i64,
        pub ts: String,
    }
}

pub mod inference {
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Request {
        pub request_id: String,
        pub payload_b64: String,
        pub ts: String,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Response {
        pub request_id: String,
        pub result: serde_json::Value,
        pub latency_ms: f64,
        pub ts: String,
    }
}

pub mod deploy {
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ModelDeploy {
        pub model_path: String,
        pub sha256: String,
        pub version: String,
    }
}

pub mod worker {
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Health {
        pub status: String,
        pub ts: String,
    }
}

pub mod auth {
    use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
    use serde::{Deserialize, Serialize};
    use thiserror::Error;

    #[derive(Debug, Error)]
    pub enum AuthError {
        #[error("JWT error: {0}")]
        Jwt(#[from] jsonwebtoken::errors::Error),
        #[error("Token expired")]
        Expired,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct Claims {
        pub sub: String,
        pub exp: usize,
        pub iat: usize,
    }

    pub fn create_token(
        device_id: &str,
        secret: &str,
        expiry_hours: u64,
    ) -> Result<String, AuthError> {
        let now = chrono::Utc::now().timestamp() as usize;
        let claims = Claims {
            sub: device_id.to_string(),
            iat: now,
            exp: now + (expiry_hours as usize * 3600),
        };
        Ok(encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret.as_bytes()),
        )?)
    }

    pub fn verify_token(token: &str, secret: &str) -> Result<Claims, AuthError> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret.as_bytes()),
            &Validation::default(),
        )?;
        Ok(token_data.claims)
    }
}

pub mod db {
    use rusqlite::{params, Connection, Result};
    use std::sync::Mutex;

    pub struct TelemetryBuffer {
        conn: Mutex<Connection>,
    }

    impl TelemetryBuffer {
        pub fn open(path: &str) -> Result<Self> {
            let conn = Connection::open(path)?;
            conn.execute_batch(
                "CREATE TABLE IF NOT EXISTS telemetry (
                    id           INTEGER PRIMARY KEY AUTOINCREMENT,
                    payload      TEXT NOT NULL,
                    synced       INTEGER DEFAULT 0,
                    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );",
            )?;
            Ok(Self {
                conn: Mutex::new(conn),
            })
        }

        pub fn insert(&self, payload: &str) -> Result<i64> {
            let conn = self.conn.lock().unwrap();
            conn.execute(
                "INSERT INTO telemetry (payload) VALUES (?1)",
                params![payload],
            )?;
            Ok(conn.last_insert_rowid())
        }

        pub fn get_unsynced(&self, limit: usize) -> Result<Vec<(i64, String)>> {
            let conn = self.conn.lock().unwrap();
            let mut stmt =
                conn.prepare("SELECT id, payload FROM telemetry WHERE synced = 0 LIMIT ?1")?;
            let rows = stmt.query_map(params![limit as i64], |row| {
                Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?))
            })?;
            rows.collect()
        }

        pub fn mark_synced(&self, ids: &[i64]) -> Result<()> {
            let conn = self.conn.lock().unwrap();
            for id in ids {
                conn.execute(
                    "UPDATE telemetry SET synced = 1 WHERE id = ?1",
                    params![id],
                )?;
            }
            Ok(())
        }

        pub fn purge_old(&self, hours: i64) -> Result<usize> {
            let conn = self.conn.lock().unwrap();
            let rows = conn.execute(
                "DELETE FROM telemetry WHERE synced = 1 AND created_at < datetime('now', ?1)",
                params![format!("-{} hours", hours)],
            )?;
            Ok(rows)
        }

        pub fn count_unsynced(&self) -> Result<usize> {
            let conn = self.conn.lock().unwrap();
            let count: i64 =
                conn.query_row("SELECT COUNT(*) FROM telemetry WHERE synced = 0", [], |r| {
                    r.get(0)
                })?;
            Ok(count as usize)
        }
    }
}

pub mod config {
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct EdgeConfig {
        pub device_serial: String,
        pub device_secret: String,
        pub control_plane_url: String,
        pub nats_socket_path: String,
        pub telemetry_db_path: String,
        pub token_path: String,
        pub wasm_binary_path: String,
        pub deployments_path: String,
        pub telemetry_interval_secs: u64,
        pub sync_interval_secs: u64,
    }

    impl Default for EdgeConfig {
        fn default() -> Self {
            let run_dir = std::env::var("EDGE_RUN_DIR")
                .unwrap_or_else(|_| "/var/lib/edge".to_string());
            Self {
                device_serial: std::env::var("EDGE_DEVICE_SERIAL")
                    .unwrap_or_else(|_| "device-001".to_string()),
                device_secret: std::env::var("EDGE_DEVICE_SECRET")
                    .unwrap_or_else(|_| "shared-secret-001".to_string()),
                control_plane_url: std::env::var("EDGE_CONTROL_PLANE_URL")
                    .unwrap_or_else(|_| "http://localhost:50051".to_string()),
                nats_socket_path: std::env::var("EDGE_NATS_URL")
                    .unwrap_or_else(|_| format!("{}/nats.sock", run_dir)),
                telemetry_db_path: std::env::var("EDGE_TELEMETRY_DB")
                    .unwrap_or_else(|_| format!("{}/telemetry.db", run_dir)),
                token_path: std::env::var("EDGE_TOKEN_PATH")
                    .unwrap_or_else(|_| format!("{}/token.jwt", run_dir)),
                wasm_binary_path: std::env::var("EDGE_WASM_PATH")
                    .unwrap_or_else(|_| format!("{}/worker.wasm", run_dir)),
                deployments_path: std::env::var("EDGE_DEPLOYMENTS_PATH")
                    .unwrap_or_else(|_| format!("{}/deployments.json", run_dir)),
                telemetry_interval_secs: std::env::var("EDGE_TELEMETRY_INTERVAL")
                    .ok().and_then(|v| v.parse().ok()).unwrap_or(10),
                sync_interval_secs: std::env::var("EDGE_SYNC_INTERVAL")
                    .ok().and_then(|v| v.parse().ok()).unwrap_or(30),
            }
        }
    }
}
