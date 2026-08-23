use anyhow::Result;
use async_nats::Subject;
use chrono::Utc;
use edge_shared::auth;
use edge_shared::config::EdgeConfig;
use edge_shared::db::TelemetryBuffer;
use edge_shared::nats_subjects;
use edge_shared::proto::edge_control_plane_client::EdgeControlPlaneClient;
use edge_shared::proto::{AuthRequest, TelemetryPacket};
use edge_shared::telemetry::HardwareSample;
use std::path::Path;
use std::time::Duration;
use sysinfo::System;
use tokio::time::sleep;

struct Daemon {
    config: EdgeConfig,
    nats_client: async_nats::Client,
    db: TelemetryBuffer,
    jwt: Option<String>,
    sys: System,
}

impl Daemon {
    async fn new(config: EdgeConfig) -> Result<Self> {
        if let Some(parent) = Path::new(&config.telemetry_db_path).parent() {
            tokio::fs::create_dir_all(parent).await?;
        }
        if let Some(parent) = Path::new(&config.token_path).parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        let db = TelemetryBuffer::open(&config.telemetry_db_path)?;

        let nats_client = async_nats::connect(&config.nats_socket_path).await?;

        let mut sys = System::new_all();
        sys.refresh_all();

        Ok(Self {
            config,
            nats_client,
            db,
            jwt: None,
            sys,
        })
    }

    async fn authenticate(&mut self) -> Result<()> {
        if Path::new(&self.config.token_path).exists() {
            let token = tokio::fs::read_to_string(&self.config.token_path).await?;
            match auth::verify_token(&token, &self.config.device_secret) {
                Ok(claims) => {
                    let now = Utc::now().timestamp() as usize;
                    if claims.exp > now + 300 {
                        tracing::info!("Reusing valid JWT token");
                        self.jwt = Some(token);
                        return Ok(());
                    }
                    tracing::info!("JWT expiring soon, re-authenticating");
                }
                Err(_) => {
                    tracing::info!("Stored JWT invalid, re-authenticating");
                }
            }
        }

        let mut client =
            EdgeControlPlaneClient::connect(self.config.control_plane_url.clone()).await?;

        let request = tonic::Request::new(AuthRequest {
            device_serial: self.config.device_serial.clone(),
            secret: self.config.device_secret.clone(),
        });

        let response = client.authenticate_device(request).await?.into_inner();
        tracing::info!(
            "Authenticated successfully, token expires at {}",
            response.expires_at_unix
        );

        tokio::fs::write(&self.config.token_path, &response.jwt).await?;

        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            tokio::fs::set_permissions(
                &self.config.token_path,
                std::fs::Permissions::from_mode(0o600),
            )
            .await?;
        }

        self.jwt = Some(response.jwt);
        Ok(())
    }

    fn collect_telemetry(&mut self) -> HardwareSample {
        self.sys.refresh_all();

        let cpu_pct = self.sys.global_cpu_info().cpu_usage() as f64;
        let mem_used = self.sys.used_memory() / 1024 / 1024;
        let mem_total = self.sys.total_memory() / 1024 / 1024;
        let uptime = System::uptime() as i64;

        HardwareSample {
            device_id: self.config.device_serial.clone(),
            cpu_pct,
            mem_used_mb: mem_used as i32,
            mem_total_mb: mem_total as i32,
            uptime_s: uptime,
            ts: Utc::now().to_rfc3339(),
        }
    }

    async fn publish_and_buffer(&self, sample: &HardwareSample) -> Result<()> {
        let json = serde_json::to_string(sample)?;

        self.nats_client
            .publish(
                Subject::from(nats_subjects::TELEMETRY_HARDWARE),
                json.clone().into(),
            )
            .await?;

        self.db.insert(&json)?;

        Ok(())
    }

    async fn sync_to_control_plane(&mut self) -> Result<()> {
        let _jwt = match &self.jwt {
            Some(t) => t.clone(),
            None => return Ok(()),
        };

        let unsynced = self.db.get_unsynced(100)?;
        if unsynced.is_empty() {
            return Ok(());
        }

        let mut client =
            EdgeControlPlaneClient::connect(self.config.control_plane_url.clone()).await?;

        let packets: Vec<TelemetryPacket> = unsynced
            .iter()
            .filter_map(|(_, payload)| {
                let sample: HardwareSample = serde_json::from_str(payload).ok()?;
                Some(TelemetryPacket {
                    device_id: sample.device_id,
                    cpu_pct: sample.cpu_pct,
                    mem_used_mb: sample.mem_used_mb,
                    mem_total_mb: sample.mem_total_mb,
                    uptime_s: sample.uptime_s,
                    ts: sample.ts,
                })
            })
            .collect();

        if packets.is_empty() {
            return Ok(());
        }

        let stream = tokio_stream::iter(packets);
        let request = tonic::Request::new(stream);

        let response = client.stream_telemetry(request).await?.into_inner();

        if response.ok {
            let ids: Vec<i64> = unsynced.iter().map(|(id, _)| *id).collect();
            self.db.mark_synced(&ids)?;
            tracing::info!("Synced {} telemetry rows to control plane", ids.len());
        } else {
            tracing::warn!("Control plane rejected telemetry: {}", response.error);
        }

        Ok(())
    }

    async fn run(&mut self) -> Result<()> {
        self.authenticate().await?;

        let telemetry_interval = Duration::from_secs(self.config.telemetry_interval_secs);
        let sync_interval = Duration::from_secs(self.config.sync_interval_secs);

        tracing::info!(
            "Edge daemon started, telemetry every {}s, sync every {}s",
            self.config.telemetry_interval_secs,
            self.config.sync_interval_secs
        );

        let mut sync_tick = tokio::time::interval(sync_interval);

        loop {
            tokio::select! {
                _ = sleep(telemetry_interval) => {
                    let sample = self.collect_telemetry();
                    if let Err(e) = self.publish_and_buffer(&sample).await {
                        tracing::error!("Failed to publish telemetry: {}", e);
                    }
                }
                _ = sync_tick.tick() => {
                    if let Err(e) = self.sync_to_control_plane().await {
                        tracing::error!("Sync failed: {}", e);
                    }
                    if let Ok(purged) = self.db.purge_old(24) {
                        if purged > 0 {
                            tracing::info!("Purged {} old telemetry rows", purged);
                        }
                    }
                }
            }
        }
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .init();

    let config = EdgeConfig::default();
    let mut daemon = Daemon::new(config).await?;
    daemon.run().await
}
