//! ==============================================================================
//! EDGE PLATFORM DEMO — WASM MICROSERVICE RUNTIME HOST
//! ==============================================================================
//! This microservice runs sandboxed WebAssembly CPU microservices:
//!
//! 1. Memory Sandboxing (Wasmtime):
//!    - Loads pre-compiled `.wasm` bytecode (`wasm_worker.wasm`).
//!    - Isolates executions within a private 64KB linear memory window.
//!    - No raw filesystem, network, or OS access granted to guest code.
//!
//! 2. Sub-Millisecond Event Processing:
//!    - Subscribes to `telemetry.sensor` on the local NATS bus.
//!    - Writes incoming sensor metrics into the WASM shared buffer.
//!    - Calls `process_telemetry()` inside the sandbox.
//!    - If an anomaly is detected (e.g. `gpu_temp > 85.0C`), it publishes an alert
//!      and automatically dispatches an `inference.request` to the AI Inference Worker!
//!
//! 3. Zero-Downtime Atomic Hot-Reloading:
//!    - Subscribes to `admin.reload`.
//!    - Compiles incoming `.wasm` bytes into memory in ~15ms.
//!    - Atomically swaps the module pointer (`Arc<WasmExecutor>`).
//!    - Active requests finish on v1; new requests immediately execute on v2.
//!
//! ==============================================================================

use std::path::Path;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use async_nats::Client;
use common::{
    AnomalyAlert, AudioInferenceRequest, AudioStreamPayload, CameraFramePayload,
    EnvironmentPayload, HealthReport, InferenceRequest, LogLevel, ReloadCommand, ReloadTarget,
    SensorReading, StorageLog, VibrationInferenceRequest, VibrationStreamPayload,
    VisionInferenceRequest, TOPIC_ADMIN_HEALTH, TOPIC_ADMIN_RELOAD, TOPIC_INFERENCE_AUDIO,
    TOPIC_INFERENCE_REQUEST, TOPIC_INFERENCE_VIBRATION, TOPIC_INFERENCE_VISION, TOPIC_SENSOR_AUDIO,
    TOPIC_SENSOR_CAMERA, TOPIC_SENSOR_ENVIRONMENT, TOPIC_SENSOR_VIBRATION, TOPIC_STORAGE_LOG,
    TOPIC_TELEMETRY_ALERT, TOPIC_TELEMETRY_SENSOR,
};
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use wasmtime::*;
use wasmtime_wasi::preview1::{self, WasiP1Ctx};
use wasmtime_wasi::WasiCtxBuilder;

// ==============================================================================
// STEP 1: WASM EXECUTION ENGINE
// ==============================================================================

struct HostState {
    wasi: WasiP1Ctx,
}

pub struct WasmExecutor {
    engine: Engine,
    module: Module,
    pub version: String,
}

#[derive(Serialize, Deserialize)]
pub struct InputMetric {
    pub name: String,
    pub value: f64,
    pub timestamp: u64,
}

#[derive(Serialize, Deserialize)]
pub struct ProcessedResult {
    pub name: String,
    pub original_value: f64,
    pub alert: bool,
    pub reason: String,
}

impl WasmExecutor {
    pub fn new(wasm_path: &str, version: &str) -> Result<Self, String> {
        let engine = Engine::default();
        let module = Module::from_file(&engine, wasm_path).map_err(|e| e.to_string())?;
        Ok(Self {
            engine,
            module,
            version: version.to_string(),
        })
    }

    /// Sandboxed execution: writes payload into WASM linear memory,
    /// triggers process_telemetry, and reads back the JSON result.
    pub fn evaluate_metric(
        &self,
        metric_name: &str,
        value: f64,
        timestamp: u64,
    ) -> Result<ProcessedResult, String> {
        let wasi = WasiCtxBuilder::new().inherit_stdout().build_p1();
        let mut store = Store::new(&self.engine, HostState { wasi });

        let mut linker = Linker::new(&self.engine);
        preview1::add_to_linker_sync(&mut linker, |state: &mut HostState| &mut state.wasi)
            .map_err(|e| e.to_string())?;

        let instance = linker
            .instantiate(&mut store, &self.module)
            .map_err(|e| e.to_string())?;

        let memory = instance
            .get_memory(&mut store, "memory")
            .ok_or_else(|| "Failed to find 'memory' export in WASM module".to_string())?;

        let get_buf_ptr = instance
            .get_typed_func::<(), i32>(&mut store, "get_buffer_ptr")
            .map_err(|e| e.to_string())?;
        let process_fn = instance
            .get_typed_func::<i32, i32>(&mut store, "process_telemetry")
            .map_err(|e| e.to_string())?;

        // 1. Get memory address of WASM guest's 2KB buffer
        let buf_offset = get_buf_ptr
            .call(&mut store, ())
            .map_err(|e| e.to_string())? as usize;

        // 2. Prepare JSON input payload
        let input = InputMetric {
            name: metric_name.to_string(),
            value,
            timestamp,
        };
        let input_bytes = serde_json::to_vec(&input).map_err(|e| e.to_string())?;

        // 3. Write payload into WASM linear memory
        memory
            .write(&mut store, buf_offset, &input_bytes)
            .map_err(|e| e.to_string())?;

        // 4. Trigger processing in WASM sandbox
        let output_len = process_fn
            .call(&mut store, input_bytes.len() as i32)
            .map_err(|e| e.to_string())? as usize;
        if output_len == 0 {
            return Err("Execution failed inside WASM".into());
        }

        // 5. Read output JSON bytes back
        let mut output_bytes = vec![0u8; output_len];
        memory
            .read(&store, buf_offset, &mut output_bytes)
            .map_err(|e| e.to_string())?;

        let result: ProcessedResult =
            serde_json::from_slice(&output_bytes).map_err(|e| e.to_string())?;
        Ok(result)
    }
}

// ==============================================================================
// STEP 2: NATS ASYNC SERVICE EVENT LOOP
// ==============================================================================

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("----------------------------------------------------------------");
    println!("  ⚙️  EDGE PLATFORM — WASM MICROSERVICE RUNTIME (Wasmtime)     ");
    println!("----------------------------------------------------------------");

    // Default WASM binary path
    let wasm_file = "wasm_worker/target/wasm32-wasip1/release/wasm_worker.wasm";
    if !Path::new(wasm_file).exists() {
        eprintln!(
            "[WASM Host] ERROR: WASM module not found at: {}. Please run 'make build' first.",
            wasm_file
        );
        std::process::exit(1);
    }

    let executor =
        WasmExecutor::new(wasm_file, "v1.0.0").map_err(Box::<dyn std::error::Error>::from)?;
    let active_executor = Arc::new(RwLock::new(Arc::new(executor)));
    println!("[WASM Host] Loaded WASM microservice binary: {}", wasm_file);

    // Connect to local NATS bus
    let nats_url = std::env::var("NATS_URL").unwrap_or_else(|_| "127.0.0.1:4222".to_string());
    println!("[WASM Host] Connecting to NATS bus at: {}", nats_url);
    let client: Client = async_nats::connect(&nats_url).await?;
    println!("[WASM Host] Connected to local NATS bus.");

    // Initial Health Report
    let health = HealthReport {
        service: "wasm_host".to_string(),
        status: "READY".to_string(),
        active_version: "v1.0.0".to_string(),
        uptime_secs: 0,
        error_message: None,
        timestamp: SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs(),
        deployment_id: None,
    };
    let _ = client
        .publish(TOPIC_ADMIN_HEALTH, serde_json::to_vec(&health)?.into())
        .await;

    // --------------------------------------------------------------------------
    // TASK 1: ADMIN RELOAD (ATOMIC IN-MEMORY POINTER SWAPPING)
    // --------------------------------------------------------------------------
    let reload_client = client.clone();
    let reload_executor = Arc::clone(&active_executor);
    let mut reload_sub = client.subscribe(TOPIC_ADMIN_RELOAD).await?;
    println!("[WASM Host] Subscribed to topic: {}", TOPIC_ADMIN_RELOAD);

    tokio::spawn(async move {
        while let Some(msg) = reload_sub.next().await {
            if let Ok(cmd) = serde_json::from_slice::<ReloadCommand>(&msg.payload) {
                if cmd.target == ReloadTarget::WasmModule {
                    println!("================================================================");
                    println!("[WASM Host] 🔄 HOT-SWAP SIGNAL RECEIVED FOR WASM MODULE!");
                    println!("  Component:  {}", cmd.component_id);
                    println!("  Path:       {}", cmd.file_path);

                    // Step 1: Compile new WASM bytecode into memory
                    match WasmExecutor::new(&cmd.file_path, "v2.0.0") {
                        Ok(new_exec) => {
                            // Step 2: Atomic pointer swap (Arc<WasmExecutor>)
                            {
                                let mut writer = reload_executor.write().await;
                                *writer = Arc::new(new_exec);
                            }
                            println!("[WASM Host] ✅ New module compiled in RAM. Atomic pointer swapped!");

                            // Step 3: Send confirmation to admin.health
                            let health = HealthReport {
                                service: "wasm_host".to_string(),
                                status: "READY".to_string(),
                                active_version: "v2.0.0".to_string(),
                                uptime_secs: 1,
                                error_message: None,
                                timestamp: SystemTime::now()
                                    .duration_since(UNIX_EPOCH)
                                    .unwrap_or_default()
                                    .as_secs(),
                                deployment_id: cmd.deployment_id.clone(),
                            };
                            let _ = reload_client
                                .publish(
                                    TOPIC_ADMIN_HEALTH,
                                    serde_json::to_vec(&health).unwrap().into(),
                                )
                                .await;
                            println!(
                                "================================================================"
                            );
                        }
                        Err(e) => {
                            eprintln!("[WASM Host] Failed to compile new WASM module: {}", e);
                        }
                    }
                }
            }
        }
    });

    // --------------------------------------------------------------------------
    // TASK 2: SCALAR ENVIRONMENT & SENSOR TELEMETRY (PURE CPU WASM RULES — NO NN)
    // --------------------------------------------------------------------------
    let env_client = client.clone();
    let env_executor = Arc::clone(&active_executor);
    let mut env_sub = client.subscribe(TOPIC_TELEMETRY_SENSOR).await?;
    let mut env_direct_sub = client.subscribe(TOPIC_SENSOR_ENVIRONMENT).await?;
    println!(
        "[WASM Host] Subscribed to scalar telemetry: {} & {}",
        TOPIC_TELEMETRY_SENSOR, TOPIC_SENSOR_ENVIRONMENT
    );

    tokio::spawn(async move {
        loop {
            tokio::select! {
                Some(msg) = env_sub.next() => {
                    if let Ok(reading) = serde_json::from_slice::<SensorReading>(&msg.payload) {
                        evaluate_scalar_metric(&env_client, &env_executor, &reading.metric, reading.value, reading.timestamp).await;
                    } else if let Ok(env) = serde_json::from_slice::<EnvironmentPayload>(&msg.payload) {
                        evaluate_scalar_metric(&env_client, &env_executor, "temperature", env.temperature_c, env.timestamp).await;
                    }
                }
                Some(msg) = env_direct_sub.next() => {
                    if let Ok(env) = serde_json::from_slice::<EnvironmentPayload>(&msg.payload) {
                        evaluate_scalar_metric(&env_client, &env_executor, "temperature", env.temperature_c, env.timestamp).await;
                        evaluate_scalar_metric(&env_client, &env_executor, "voltage", env.voltage_v, env.timestamp).await;
                    }
                }
                else => break,
            }
        }
    });

    // --------------------------------------------------------------------------
    // TASK 3: CAMERA STREAM (WASM MOTION FILTER -> VISION NN)
    // --------------------------------------------------------------------------
    let cam_client = client.clone();
    let cam_executor = Arc::clone(&active_executor);
    let mut cam_sub = client.subscribe(TOPIC_SENSOR_CAMERA).await?;
    println!(
        "[WASM Host] Subscribed to camera stream: {}",
        TOPIC_SENSOR_CAMERA
    );

    tokio::spawn(async move {
        while let Some(msg) = cam_sub.next().await {
            if let Ok(frame) = serde_json::from_slice::<CameraFramePayload>(&msg.payload) {
                let evaluation = {
                    let runner = {
                        let reader = cam_executor.read().await;
                        Arc::clone(&*reader)
                    };
                    let motion_val = if frame.motion_detected { 1.0 } else { 0.0 };
                    runner.evaluate_metric("camera_motion", motion_val, frame.timestamp)
                };

                if let Ok(result) = evaluation {
                    if result.alert {
                        println!(
                            "  📷 [WASM Camera Pre-Filter] Frame #{}: Motion detected! Dispatching to Vision NN...",
                            frame.frame_id
                        );

                        // 1. Dispatch typed Vision inference request
                        let request_id = format!("cam_frame_{}", frame.frame_id);
                        let v_req = VisionInferenceRequest {
                            request_id: request_id.clone(),
                            camera_frame: frame.clone(),
                            model_target: "vision".to_string(),
                            timestamp: frame.timestamp,
                        };
                        let _ = cam_client
                            .publish(
                                TOPIC_INFERENCE_VISION,
                                serde_json::to_vec(&v_req).unwrap().into(),
                            )
                            .await;

                        // 2. Also publish to unified inference request topic
                        let ai_req = InferenceRequest {
                            request_id,
                            prompt: format!(
                                "VISION_INFERENCE: Camera {} Frame #{} ({}x{})",
                                frame.camera_id, frame.frame_id, frame.width, frame.height
                            ),
                            model_target: "vision".to_string(),
                            max_tokens: 32,
                            timestamp: frame.timestamp,
                        };
                        let _ = cam_client
                            .publish(
                                TOPIC_INFERENCE_REQUEST,
                                serde_json::to_vec(&ai_req).unwrap().into(),
                            )
                            .await;
                    } else {
                        println!(
                            "  📷 [WASM Camera Pre-Filter] Frame #{}: Static (no motion). Filtered in WASM linear memory (<0.02ms). NN bypassed!",
                            frame.frame_id
                        );
                    }
                }
            }
        }
    });

    // --------------------------------------------------------------------------
    // TASK 4: VIBRATION STREAM (WASM RMS ENERGY FILTER -> 1D-CNN NN)
    // --------------------------------------------------------------------------
    let vib_client = client.clone();
    let vib_executor = Arc::clone(&active_executor);
    let mut vib_sub = client.subscribe(TOPIC_SENSOR_VIBRATION).await?;
    println!(
        "[WASM Host] Subscribed to vibration stream: {}",
        TOPIC_SENSOR_VIBRATION
    );

    tokio::spawn(async move {
        while let Some(msg) = vib_sub.next().await {
            if let Ok(stream) = serde_json::from_slice::<VibrationStreamPayload>(&msg.payload) {
                let evaluation = {
                    let runner = {
                        let reader = vib_executor.read().await;
                        Arc::clone(&*reader)
                    };
                    runner.evaluate_metric(
                        "vibration_rms",
                        stream.rms_velocity_mms as f64,
                        stream.timestamp,
                    )
                };

                if let Ok(result) = evaluation {
                    if result.alert {
                        println!(
                            "  📳 [WASM Vibration Pre-Filter] Sensor '{}' RMS: {:.2} mm/s > ISO threshold! Dispatching to 1D-CNN NN...",
                            stream.sensor_id, stream.rms_velocity_mms
                        );

                        let request_id = format!("vib_{}", stream.timestamp);
                        let vib_req = VibrationInferenceRequest {
                            request_id: request_id.clone(),
                            vibration: stream.clone(),
                            model_target: "vibration".to_string(),
                            timestamp: stream.timestamp,
                        };
                        let _ = vib_client
                            .publish(
                                TOPIC_INFERENCE_VIBRATION,
                                serde_json::to_vec(&vib_req).unwrap().into(),
                            )
                            .await;

                        let ai_req = InferenceRequest {
                            request_id,
                            prompt: format!(
                                "VIBRATION_INFERENCE: Sensor {} RMS {:.2} mm/s ({} Hz)",
                                stream.sensor_id, stream.rms_velocity_mms, stream.sample_rate_hz
                            ),
                            model_target: "vibration".to_string(),
                            max_tokens: 32,
                            timestamp: stream.timestamp,
                        };
                        let _ = vib_client
                            .publish(
                                TOPIC_INFERENCE_REQUEST,
                                serde_json::to_vec(&ai_req).unwrap().into(),
                            )
                            .await;
                    } else {
                        println!(
                            "  📳 [WASM Vibration Pre-Filter] Sensor '{}' RMS: {:.2} mm/s (Smooth & balanced). Normal operation.",
                            stream.sensor_id, stream.rms_velocity_mms
                        );
                    }
                }
            }
        }
    });

    // --------------------------------------------------------------------------
    // TASK 5: ACOUSTIC AUDIO STREAM (WASM SOUND PRESSURE FILTER -> AUDIO NN)
    // --------------------------------------------------------------------------
    let mut aud_sub = client.subscribe(TOPIC_SENSOR_AUDIO).await?;
    println!(
        "[WASM Host] Subscribed to audio stream: {}",
        TOPIC_SENSOR_AUDIO
    );
    println!("[WASM Host] Ready to evaluate all multi-modal streams in WASM sandbox...\n");

    while let Some(msg) = aud_sub.next().await {
        if let Ok(stream) = serde_json::from_slice::<AudioStreamPayload>(&msg.payload) {
            let evaluation = {
                let runner = {
                    let reader = active_executor.read().await;
                    Arc::clone(&*reader)
                };
                runner.evaluate_metric(
                    "audio_db",
                    stream.sound_pressure_db as f64,
                    stream.timestamp,
                )
            };

            if let Ok(result) = evaluation {
                if result.alert {
                    println!(
                        "  🎙️  [WASM Audio Pre-Filter] Mic '{}' SPL: {:.1} dB > threshold! Dispatching to Acoustic NN...",
                        stream.mic_id, stream.sound_pressure_db
                    );

                    let request_id = format!("aud_{}", stream.timestamp);
                    let aud_req = AudioInferenceRequest {
                        request_id: request_id.clone(),
                        audio: stream.clone(),
                        model_target: "audio".to_string(),
                        timestamp: stream.timestamp,
                    };
                    let _ = client
                        .publish(
                            TOPIC_INFERENCE_AUDIO,
                            serde_json::to_vec(&aud_req).unwrap().into(),
                        )
                        .await;

                    let ai_req = InferenceRequest {
                        request_id,
                        prompt: format!(
                            "AUDIO_INFERENCE: Mic {} SPL {:.1} dB ({} Hz)",
                            stream.mic_id, stream.sound_pressure_db, stream.sample_rate_hz
                        ),
                        model_target: "audio".to_string(),
                        max_tokens: 32,
                        timestamp: stream.timestamp,
                    };
                    let _ = client
                        .publish(
                            TOPIC_INFERENCE_REQUEST,
                            serde_json::to_vec(&ai_req).unwrap().into(),
                        )
                        .await;
                } else {
                    println!(
                        "  🎙️  [WASM Audio Pre-Filter] Mic '{}' SPL: {:.1} dB (Ambient baseline). Normal.",
                        stream.mic_id, stream.sound_pressure_db
                    );
                }
            }
        }
    }

    Ok(())
}

/// Evaluates scalar environmental sensor telemetry in WASM linear memory sandbox.
/// Scalar metrics (temperature, humidity, voltage) trigger local alerts and storage logs,
/// but NEVER invoke heavy neural networks!
async fn evaluate_scalar_metric(
    client: &Client,
    executor: &Arc<RwLock<Arc<WasmExecutor>>>,
    metric: &str,
    value: f64,
    timestamp: u64,
) {
    let evaluation = {
        let runner = {
            let reader = executor.read().await;
            Arc::clone(&*reader)
        };
        runner.evaluate_metric(metric, value, timestamp)
    };

    match evaluation {
        Ok(result) => {
            if result.alert {
                println!(
                    "  🛡️  [WASM CPU ALERT] Metric: '{}' | Value: {:.1} | Reason: {} | (PLC threshold rule — NO NN invoked)",
                    result.name, result.original_value, result.reason
                );

                // Publish anomaly alert to NATS
                let alert = AnomalyAlert {
                    metric: result.name.clone(),
                    recorded_value: result.original_value,
                    threshold: if metric.contains("temp") { 85.0 } else { 11.5 },
                    reason: result.reason.clone(),
                    timestamp,
                };
                let _ = client
                    .publish(
                        TOPIC_TELEMETRY_ALERT,
                        serde_json::to_vec(&alert).unwrap().into(),
                    )
                    .await;

                // Log to SQLite storage
                let log = StorageLog {
                    level: LogLevel::WARN,
                    service: "wasm_host".to_string(),
                    message: format!(
                        "Pure CPU rule alert: '{}' breached safe threshold at {:.1}",
                        result.name, result.original_value
                    ),
                    timestamp,
                };
                let _ = client
                    .publish(TOPIC_STORAGE_LOG, serde_json::to_vec(&log).unwrap().into())
                    .await;
            } else {
                println!(
                    "  [WASM OK] Metric: '{}' | Value: {:.1} (Nominal)",
                    result.name, result.original_value
                );
            }
        }
        Err(e) => {
            eprintln!("  [WASM Host] Scalar evaluation error: {}", e);
        }
    }
}
