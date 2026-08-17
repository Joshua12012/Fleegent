use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::path::Path;
use std::sync::Arc;

use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{UnixListener, UnixStream};
use wasmtime::*;
use wasmtime_wasi::preview1::{self, WasiP1Ctx};
use wasmtime_wasi::WasiCtxBuilder;

struct HostState {
    wasi: WasiP1Ctx,
}

struct WasmExecutor {
    engine: Engine,
    module: Module,
}

impl WasmExecutor {
    pub fn new(wasm_path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let engine = Engine::default();
        let module = Module::from_file(&engine, wasm_path)?;
        Ok(Self { engine, module })
    }

    /// Sandboxed execution: Loads an isolated WASM instance per request,
    /// copies the incoming bytes into WASM memory, runs process_telemetry,
    /// and reads the response back.
    pub fn execute_workload(&self, payload: &[u8]) -> Result<Vec<u8>, String> {
        let wasi = WasiCtxBuilder::new().inherit_stdout().build_p1();
        let mut store = Store::new(&self.engine, HostState { wasi });

        let mut linker = Linker::new(&self.engine);
        preview1::add_to_linker_sync(&mut linker, |state: &mut HostState| &mut state.wasi)
            .map_err(|e| e.to_string())?;

        // Instantiate isolated memory space for this execution
        let instance = linker
            .instantiate(&mut store, &self.module)
            .map_err(|e| format!("WASM instantiation failed: {}", e))?;

        // 1. Resolve exported WASM symbols and memory
        let memory = instance
            .get_memory(&mut store, "memory")
            .ok_or("Failed to find 'memory' export in WASM module")?;

        let get_buf_ptr = instance
            .get_typed_func::<(), i32>(&mut store, "get_buffer_ptr")
            .map_err(|e| format!("Missing 'get_buffer_ptr': {}", e))?;

        let process_fn = instance
            .get_typed_func::<i32, i32>(&mut store, "process_telemetry")
            .map_err(|e| format!("Missing 'process_telemetry': {}", e))?;

        // 2. Write payload into the WASM guest buffer
        let buf_offset = get_buf_ptr.call(&mut store, ()).map_err(|e| e.to_string())? as usize;

        memory
            .write(&mut store, buf_offset, payload)
            .map_err(|e| format!("Failed writing to WASM memory: {}", e))?;

        // 3. Trigger processing function inside the WASM sandbox
        let output_len = process_fn
            .call(&mut store, payload.len() as i32)
            .map_err(|e| format!("WASM execution trapped/panicked: {}", e))? as usize;

        if output_len == 0 {
            return Err("Execution failed or produced 0 bytes inside WASM".to_string());
        }

        // 4. Read the resulting bytes back from the WASM guest buffer
        let mut output_bytes = vec![0u8; output_len];
        memory
            .read(&store, buf_offset, &mut output_bytes)
            .map_err(|e| format!("Failed reading from WASM memory: {}", e))?;

        Ok(output_bytes)
    }
}

// ==========================================
// UDS IPC Listener
// ==========================================

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let socket_path = "/tmp/edge_supervisor.sock";
    
    // Update this path to where your compiled wasm_worker.wasm is located
    let wasm_file = "../wasm_worker/target/wasm32-wasip1/release/wasm_worker.wasm";

    if !Path::new(wasm_file).exists() {
        eprintln!("[Error] WASM binary not found at: {}", wasm_file);
        eprintln!("Please check the path or compile wasm_worker first.");
        return Ok(());
    }

    if Path::new(socket_path).exists() {
        fs::remove_file(socket_path)?;
    }

    let executor = Arc::new(WasmExecutor::new(wasm_file)?);
    let listener = UnixListener::bind(socket_path)?;

    // Set socket file permissions to 0660 (read/write for owner & group)
    fs::set_permissions(socket_path, fs::Permissions::from_mode(0o660))?;

    println!("==================================================");
    println!("[Host Supervisor] Active & Sandboxed");
    println!("[Host Supervisor] Loaded WASM Module: {}", wasm_file);
    println!("[Host Supervisor] Listening on IPC Socket: {}", socket_path);
    println!("==================================================");

    loop {
        let (mut stream, _) = listener.accept().await?;
        let exec = Arc::clone(&executor);

        tokio::spawn(async move {
            let mut buf = [0u8; 2048];
            let bytes_read = match stream.read(&mut buf).await {
                Ok(n) if n > 0 => n,
                _ => return,
            };

            let payload = buf[..bytes_read].to_vec();

            // Run WASM compute on a blocking thread pool to keep the Tokio event loop responsive
            let result = tokio::task::spawn_blocking(move || exec.execute_workload(&payload))
                .await
                .unwrap();

            match result {
                Ok(response_bytes) => {
                    let _ = stream.write_all(&response_bytes).await;
                }
                Err(err) => {
                    let err_json = format!("{{\"error\": \"{}\"}}", err);
                    let _ = stream.write_all(err_json.as_bytes()).await;
                }
            }
        });
    }
}