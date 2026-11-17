//! ==============================================================================
//! EDGE PLATFORM DEMO — STORAGE & LOGGING MICROSERVICE
//! ==============================================================================
//! This microservice manages local persistence on the edge device:
//!
//! 1. SQLite in WAL (Write-Ahead Logging) Mode:
//!    - Provides non-blocking, sub-millisecond writes for audit logs and sensor telemetry.
//!    - Sequential append to `.db-wal` protects SD cards and flash storage from wear.
//!    - Zero-lock contention: readers (cloud sync) never block writers (sensors).
//!
//! 2. Model Staging Directory Management (/data/models/):
//!    - Verifies cryptographic SHA-256 hashes of incoming `.tmp` downloads.
//!    - Executes atomic Linux POSIX renames (`rename(2)`) to ensure zero-corruption.
//!
//! 3. NATS Integration:
//!    - Subscribes to `storage.log` and `telemetry.sensor`.
//!
//! ==============================================================================

use std::fs;
use std::path::Path;
use std::sync::{Arc, Mutex};

use async_nats::Client;
use common::{LogLevel, SensorReading, StorageLog, TOPIC_STORAGE_LOG, TOPIC_TELEMETRY_SENSOR};
use futures::StreamExt;
use rusqlite::{params, Connection};
use sha2::{Digest, Sha256};

// ==============================================================================
// STEP 1: SQLITE DATABASE INITIALIZATION WITH WAL MODE
// ==============================================================================

/// Opens SQLite and activates WAL mode + optimal edge performance pragmas.
fn init_sqlite_database(db_path: &str) -> Result<Connection, Box<dyn std::error::Error>> {
    // Ensure parent directory exists (e.g. ./data/)
    if let Some(parent) = Path::new(db_path).parent() {
        fs::create_dir_all(parent)?;
    }

    let conn = Connection::open(db_path)?;

    // PRAGMA journal_mode = WAL:
    // Enables Write-Ahead Logging. Writes append to a .wal scratchpad file instead
    // of locking the entire database, allowing concurrent reads and writes.
    conn.pragma_update(None, "journal_mode", "WAL")?;

    // PRAGMA synchronous = NORMAL:
    // Syncs to disk at critical WAL checkpoints. 3x faster than FULL sync, perfectly safe on edge.
    conn.pragma_update(None, "synchronous", "NORMAL")?;

    // Table 1: Operational audit logs from all microservices
    conn.execute(
        "CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level TEXT NOT NULL,
            service TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        )",
        [],
    )?;

    // Table 2: Historical sensor telemetry buffer
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sensor_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sensor_id TEXT NOT NULL,
            metric TEXT NOT NULL,
            value REAL NOT NULL,
            timestamp INTEGER NOT NULL
        )",
        [],
    )?;

    println!(
        "[Storage Service] SQLite WAL database initialized at: {}",
        db_path
    );
    Ok(conn)
}

// ==============================================================================
// STEP 2: ATOMIC FILE VERIFICATION & STAGING (FOR ZERO-DOWNTIME UPDATES)
// ==============================================================================

/// Verifies the SHA-256 hash of a staged `.tmp` file and atomically renames it.
/// This prevents half-downloaded or corrupted models from ever reaching running engines.
#[allow(dead_code)]
pub fn stage_and_verify_model(
    temp_path: &str,
    final_path: &str,
    expected_sha256: &str,
) -> Result<bool, Box<dyn std::error::Error>> {
    let bytes = fs::read(temp_path)?;
    let mut hasher = Sha256::new();
    hasher.update(&bytes);
    let hash_bytes = hasher.finalize();
    let computed_hash: String = hash_bytes.iter().map(|b| format!("{:02x}", b)).collect();

    if computed_hash.to_lowercase() != expected_sha256.to_lowercase() {
        eprintln!(
            "[Storage Service] Checksum mismatch! Expected: {}, Computed: {}",
            expected_sha256, computed_hash
        );
        fs::remove_file(temp_path)?;
        return Ok(false);
    }

    // In Linux, fs::rename() translates directly to the atomic rename(2) syscall.
    // If a crash occurs at this instant, the file is either 100% old or 100% new.
    fs::rename(temp_path, final_path)?;
    println!(
        "[Storage Service] Checksum verified. Atomically staged: {}",
        final_path
    );
    Ok(true)
}

// ==============================================================================
// STEP 3: ASYNC NATS SUBSCRIPTION LOOPS
// ==============================================================================

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("----------------------------------------------------------------");
    println!("  📦 EDGE PLATFORM — STORAGE & LOGGING SERVICE (SQLite WAL)    ");
    println!("----------------------------------------------------------------");

    let db_path = "data/edge_storage.db";
    let conn = init_sqlite_database(db_path)?;
    let conn_shared = Arc::new(Mutex::new(conn));

    // Connect to local NATS bus
    let nats_url = std::env::var("NATS_URL").unwrap_or_else(|_| "127.0.0.1:4222".to_string());
    println!("[Storage Service] Connecting to NATS bus at: {}", nats_url);
    let client: Client = async_nats::connect(&nats_url).await?;
    println!("[Storage Service] Connected successfully to NATS IPC bus.");

    // Task 1: Subscribe to operational audit logs (storage.log)
    let log_conn = Arc::clone(&conn_shared);
    let mut log_sub = client.subscribe(TOPIC_STORAGE_LOG).await?;
    println!(
        "[Storage Service] Subscribed to topic: {}",
        TOPIC_STORAGE_LOG
    );

    tokio::spawn(async move {
        while let Some(msg) = log_sub.next().await {
            if let Ok(entry) = serde_json::from_slice::<StorageLog>(&msg.payload) {
                let level_str = match entry.level {
                    LogLevel::INFO => "INFO",
                    LogLevel::WARN => "WARN",
                    LogLevel::ERROR => "ERROR",
                };
                if let Ok(db) = log_conn.lock() {
                    let _ = db.execute(
                        "INSERT INTO audit_logs (level, service, message, timestamp) VALUES (?1, ?2, ?3, ?4)",
                        params![level_str, entry.service, entry.message, entry.timestamp as i64],
                    );
                }
                println!(
                    "  [LOG DB] [{}] [{}] {}",
                    level_str, entry.service, entry.message
                );
            }
        }
    });

    // Task 2: Subscribe to sensor telemetry stream (telemetry.sensor)
    let sensor_conn = Arc::clone(&conn_shared);
    let mut sensor_sub = client.subscribe(TOPIC_TELEMETRY_SENSOR).await?;
    println!(
        "[Storage Service] Subscribed to topic: {}",
        TOPIC_TELEMETRY_SENSOR
    );

    let sensor_task = tokio::spawn(async move {
        while let Some(msg) = sensor_sub.next().await {
            if let Ok(reading) = serde_json::from_slice::<SensorReading>(&msg.payload) {
                if let Ok(db) = sensor_conn.lock() {
                    let _ = db.execute(
                        "INSERT INTO sensor_history (sensor_id, metric, value, timestamp) VALUES (?1, ?2, ?3, ?4)",
                        params![reading.sensor_id, reading.metric, reading.value, reading.timestamp as i64],
                    );
                }
            }
        }
    });

    println!("[Storage Service] Ready and listening for events.");
    sensor_task.await?;

    Ok(())
}
