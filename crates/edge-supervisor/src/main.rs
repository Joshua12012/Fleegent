use anyhow::Result;
use async_nats::Subject;
use edge_shared::config::EdgeConfig;
use edge_shared::nats_subjects;
use edge_shared::worker::Health;
use std::path::Path;
use std::sync::Arc;
use std::time::Duration;
use tokio_stream::StreamExt;
use wasmtime::*;
use wasmtime_wasi::preview1::{self, WasiP1Ctx};
use wasmtime_wasi::WasiCtxBuilder;

struct HostState {
    wasi: WasiP1Ctx,
}

struct WorkerRuntime {
    engine: Engine,
    module: Option<Module>,
    wasm_path: String,
}

impl WorkerRuntime {
    fn new(wasm_path: &str) -> Result<Self> {
        let engine = Engine::default();
        Ok(Self {
            engine,
            module: None,
            wasm_path: wasm_path.to_string(),
        })
    }

    fn load_module(&mut self) -> Result<()> {
        if !Path::new(&self.wasm_path).exists() {
            tracing::warn!("WASM binary not found at {}", self.wasm_path);
            return Ok(());
        }
        let module = Module::from_file(&self.engine, &self.wasm_path)?;
        tracing::info!("Loaded WASM module from {}", self.wasm_path);
        self.module = Some(module);
        Ok(())
    }

    fn execute(&self, input_json: &str) -> Result<String> {
        let module = match &self.module {
            Some(m) => m,
            None => anyhow::bail!("No WASM module loaded"),
        };

        let wasi = WasiCtxBuilder::new().inherit_stdout().build_p1();
        let mut store = Store::new(&self.engine, HostState { wasi });
        let mut linker = Linker::new(&self.engine);

        preview1::add_to_linker_sync(&mut linker, |state: &mut HostState| &mut state.wasi)?;

        let instance = linker.instantiate(&mut store, module)?;

        let get_buffer_ptr = instance.get_typed_func::<(), i32>(&mut store, "get_buffer_ptr")?;
        let buffer_ptr = get_buffer_ptr.call(&mut store, ())?;

        let memory = instance.get_memory(&mut store, "memory").unwrap();
        let input_bytes = input_json.as_bytes();
        memory
            .write(&mut store, buffer_ptr as usize, input_bytes)
            .map_err(|e| anyhow::anyhow!("Failed writing to WASM memory: {}", e))?;

        let process = instance.get_typed_func::<i32, i32>(&mut store, "process_telemetry")?;
        let output_len = process.call(&mut store, input_bytes.len() as i32)?;

        if output_len == 0 {
            anyhow::bail!("Execution failed or produced 0 bytes inside WASM");
        }

        let mut output_bytes = vec![0u8; output_len as usize];
        memory
            .read(&mut store, buffer_ptr as usize, &mut output_bytes)
            .map_err(|e| anyhow::anyhow!("Failed reading from WASM memory: {}", e))?;

        Ok(String::from_utf8_lossy(&output_bytes).to_string())
    }
}

struct Supervisor {
    #[allow(dead_code)]
    config: EdgeConfig,
    nats_client: async_nats::Client,
    worker_runtime: WorkerRuntime,
    restart_count: u32,
}

impl Supervisor {
    async fn new(config: EdgeConfig) -> Result<Self> {
        let nats_client = async_nats::connect(&config.nats_socket_path).await?;
        let mut worker_runtime = WorkerRuntime::new(&config.wasm_binary_path)?;
        let _ = worker_runtime.load_module();

        Ok(Self {
            config,
            nats_client,
            worker_runtime,
            restart_count: 0,
        })
    }

    fn calculate_backoff(&self) -> Duration {
        if self.restart_count == 0 {
            return Duration::from_secs(1);
        }
        let base = 1u64.pow(self.restart_count.min(5));
        let backoff = base.min(30);
        Duration::from_secs(backoff)
    }

    fn record_restart(&mut self) {
        self.restart_count += 1;
    }

    async fn run_worker(&mut self) -> Result<()> {
        let mut sub = self
            .nats_client
            .subscribe(nats_subjects::TELEMETRY_HARDWARE)
            .await?;

        tracing::info!("Worker started, processing telemetry from NATS");

        loop {
            match sub.next().await {
                Some(msg) => {
                    let payload = match std::str::from_utf8(&msg.payload) {
                        Ok(p) => p,
                        Err(e) => {
                            tracing::error!("Invalid UTF-8 in telemetry: {}", e);
                            continue;
                        }
                    };

                    match self.worker_runtime.execute(payload) {
                        Ok(result) => {
                            self.restart_count = 0;
                            tracing::debug!(
                                "Worker processed telemetry: {}",
                                &result[..result.len().min(100)]
                            );

                            if let Err(e) = self
                                .nats_client
                                .publish(
                                    Subject::from(nats_subjects::INFERENCE_RESPONSE),
                                    result.into(),
                                )
                                .await
                            {
                                tracing::error!("Failed to publish inference response: {}", e);
                            }

                            let health = Health {
                                status: "ok".to_string(),
                                ts: chrono::Utc::now().to_rfc3339(),
                            };
                            if let Ok(health_json) = serde_json::to_string(&health) {
                                let _ = self
                                    .nats_client
                                    .publish(
                                        Subject::from(nats_subjects::WORKER_HEALTH),
                                        health_json.into(),
                                    )
                                    .await;
                            }
                        }
                        Err(e) => {
                            tracing::error!("Worker execution failed: {}", e);
                            self.record_restart();
                            let backoff = self.calculate_backoff();
                            tracing::info!(
                                "Restarting worker in {}s (attempt {})",
                                backoff.as_secs(),
                                self.restart_count
                            );
                            tokio::time::sleep(backoff).await;
                            if let Err(e) = self.worker_runtime.load_module() {
                                tracing::error!("Failed to reload WASM module: {}", e);
                            }
                        }
                    }
                }
                None => {
                    tracing::warn!("NATS subscription ended, reconnecting...");
                    tokio::time::sleep(Duration::from_secs(1)).await;
                    sub = self
                        .nats_client
                        .subscribe(nats_subjects::TELEMETRY_HARDWARE)
                        .await?;
                }
            }
        }
    }

    async fn run(&mut self) -> Result<()> {
        let deploy_sub = self
            .nats_client
            .subscribe(nats_subjects::MODEL_DEPLOY)
            .await?;

        tokio::spawn(async move {
            let mut sub = deploy_sub;
            while let Some(msg) = sub.next().await {
                if let Ok(payload) = std::str::from_utf8(&msg.payload) {
                    tracing::info!("Model deployment received: {}", payload);
                }
            }
        });

        tracing::info!("Edge supervisor started");
        self.run_worker().await
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
    let mut supervisor = Supervisor::new(config).await?;
    supervisor.run().await
}
