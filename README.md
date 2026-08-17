# Edge Fleet Management Platform

A sandboxed edge computing platform that processes telemetry data through WebAssembly (WASM) modules, providing fault isolation and secure workload execution on edge devices.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         EDGE DEVICE (Linux)                              │
│                                                                          │
│  ┌─────────────────┐         UDS          ┌─────────────────────────┐   │
│  │  CLIENT DAEMON   │ ◄─────────────────► │   HOST SUPERVISOR       │   │
│  │                  │  /tmp/edge_          │                         │   │
│  │  • Creates       │   supervisor.sock   │  • Accepts connections  │   │
│  │    telemetry     │                      │  • Loads WASM module    │   │
│  │    metrics       │                      │  • Creates sandboxed    │   │
│  │  • Sends JSON    │                      │    instances per request│   │
│  │    payload       │                      │  • Routes I/O to/from   │   │
│  │  • Receives      │                      │    WASM guest           │   │
│  │    processed     │                      │                         │   │
│  │    result        │                      │                         │   │
│  └─────────────────┘                      └───────────┬─────────────┘   │
│                                                        │                 │
│                                             spawn_blocking               │
│                                              (isolated)                  │
│                                                        │                 │
│                                              ┌─────────▼─────────┐      │
│                                              │   WASM SANDBOX     │      │
│                                              │                    │      │
│                                              │  ┌──────────────┐  │      │
│                                              │  │ BUFFER[2KB]  │  │      │
│                                              │  │ (shared mem) │  │      │
│                                              │  └──────┬───────┘  │      │
│                                              │         │          │      │
│                                              │  get_buffer_ptr()  │      │
│                                              │  ┌───────▼───────┐ │      │
│                                              │  │ InputMetric   │ │      │
│                                              │  │ {name, val,   │ │      │
│                                              │  │  timestamp}   │ │      │
│                                              │  └───────┬───────┘ │      │
│                                              │          │         │      │
│                                              │  process_telemetry │      │
│                                              │  ┌───────▼───────┐ │      │
│                                              │  │ THRESHOLD     │ │      │
│                                              │  │ CHECK (>85.0) │ │      │
│                                              │  └───────┬───────┘ │      │
│                                              │          │         │      │
│                                              │  ┌───────▼───────┐ │      │
│                                              │  │ProcessedResult│ │      │
│                                              │  │ {name, val,   │ │      │
│                                              │  │  alert,reason}│ │      │
│                                              │  └───────────────┘ │      │
│                                              └────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Step 1: Connection          Step 2: Payload              Step 3: WASM Processing
┌──────────────┐           ┌──────────────┐            ┌──────────────────────┐
│ CLIENT DAEMON│           │ CLIENT DAEMON│            │    WASM SANDBOX      │
└──────┬───────┘           └──────┬───────┘            └──────────┬───────────┘
       │                          │                              │
       │  UnixStream::connect()   │                              │
       │─────────────────────────►│                              │
       │                          │                              │
       │                          │  stream.write_all(JSON)     │
       │                          │─────────────────────────────►│
       │                          │                              │
       │                          │                  ┌───────────┴───────────┐
       │                          │                  │ 1. get_buffer_ptr()   │
       │                          │                  │ 2. memory.write()     │
       │                          │                  │ 3. process_telemetry()│
       │                          │                  │ 4. memory.read()      │
       │                          │                  └───────────┬───────────┘
       │                          │                              │
       │                          │  stream.read(result)         │
       │                          │◄─────────────────────────────│
       │  stream.read(result)     │                              │
       │◄─────────────────────────│                              │
       │                          │                              │
       │  Print: alert=true       │                              │
       ▼                          ▼                              ▼
```

## Project Structure

```
edge-platform-demo/
├── README.md                    # This file
├── client_daemon/               # Edge client daemon
│   ├── Cargo.toml               # Rust dependencies (tokio, serde)
│   └── src/
│       └── main.rs              # UDS client, sends telemetry metrics
├── server/                      # Host supervisor (WASM orchestrator)
│   ├── Cargo.toml               # Rust dependencies (tokio, wasmtime, serde)
│   └── src/
│       └── main.rs              # UDS server, WASM instance management
└── wasm_worker/                 # WASM guest module
    ├── Cargo.toml               # Rust dependencies (tokio, serde)
    └── src/
        └── lib.rs               # WASM exports: get_buffer_ptr, process_telemetry
```

## Components

### Client Daemon (`client_daemon`)

A simple edge client that:
- Connects to the host supervisor via Unix Domain Socket (UDS)
- Creates telemetry metrics (e.g., `edge_gpu_temp: 91.4`)
- Serializes metrics to JSON and sends them over UDS
- Receives processed results and displays alert status

**Key Structures:**
```rust
struct InputMetric {
    name: String,        // Metric name (e.g., "edge_gpu_temp")
    value: f64,          // Metric value (e.g., 91.4)
    timestamp: u64,      // Unix timestamp
}

struct ProcessedResult {
    name: String,        // Original metric name
    original_value: f64, // Original metric value
    alert: bool,         // Whether threshold was exceeded
    reason: String,      // Explanation of alert status
}
```

### Host Supervisor (`server`)

The central orchestrator that:
- Listens on UDS at `/tmp/edge_supervisor.sock`
- Loads the compiled WASM module at startup
- Creates fresh, isolated WASM instances for each request
- Routes data between client and WASM sandbox
- Runs WASM execution on a blocking thread pool

**Key Design:**
- Each request gets a **new WASM Store + Instance** = isolated memory
- No state leaks between requests
- Fault isolation: crashing one request doesn't affect others

**WASM Execution Flow:**
1. Create isolated WASM Store
2. Instantiate WASM module (fresh linear memory)
3. Call `get_buffer_ptr()` to get buffer offset
4. Write payload into WASM memory
5. Call `process_telemetry(len)` to execute
6. Read result bytes from WASM memory
7. Return result to client

### WASM Worker (`wasm_worker`)

A WASI-compliant WebAssembly module that:
- Exports a fixed 2KB shared buffer via `get_buffer_ptr()`
- Exports `process_telemetry(input_len)` for business logic
- Deserializes input JSON, applies threshold logic, serializes output

**Business Logic:**
```rust
// Anomaly detection: value > 85.0 triggers alert
let is_critical = metric.value > 85.0;
let result = ProcessedResult {
    name: metric.name,
    original_value: metric.value,
    alert: is_critical,
    reason: if is_critical {
        "Value exceeds threshold (85.0)".to_string()
    } else {
        "Normal".to_string()
    },
};
```

## Building & Running

### Prerequisites

- Rust toolchain with `wasm32-wasip1` target:
  ```bash
  rustup target add wasm32-wasip1
  ```

### Build

```bash
# Build WASM worker first
cd wasm_worker
cargo build --target wasm32-wasip1 --release

# Build host supervisor
cd ../server
cargo build --release

# Build client daemon
cd ../client_daemon
cargo build --release
```

### Run

```bash
# Terminal 1: Start host supervisor
cd server
cargo run

# Terminal 2: Run client daemon
cd client_daemon
cargo run
```

**Expected Output:**
```
[Host Supervisor] Active & Sandboxed
[Host Supervisor] Loaded WASM Module: ../wasm_worker/target/wasm32-wasip1/release/wasm_worker.wasm
[Host Supervisor] Listening on IPC Socket: /tmp/edge_supervisor.sock

[Client Daemon] Connecting to supervisor via UDS (/tmp/edge_supervisor.sock)
[Client Daemon] Sending JSON metric: InputMetric { name: "edge_gpu_temp", value: 91.4, timestamp: 1720000000 }
--------------------------------------------------
[Client Daemon] Received WASM Evaluated Output:
  - Target:         edge_gpu_temp
  - Recorded Value: 91.4
  - Trigger Alert:  true
  - Reason:         Value exceeds threshold (85.0)
--------------------------------------------------
```

## Safety Properties

| Property | Description |
|----------|-------------|
| **Request Isolation** | Each request gets a fresh WASM instance with its own memory |
| **Fault Containment** | WASM panics are trapped; host process survives |
| **No State Leakage** | No shared state between concurrent requests |
| **Memory Safety** | WASM linear memory is bounds-checked by the runtime |
| **Minimal Attack Surface** | WASM module has no filesystem/network access |

## Spec Compliance (Current vs Target)

| Feature | Status | Spec Reference |
|---------|--------|----------------|
| WASM sandboxing | ✅ Implemented | FR-5.1, FR-5.2 |
| UDS IPC | ✅ Implemented | FR-4.1 (partial) |
| Telemetry processing | ✅ Implemented | FR-2.1 (partial) |
| Threshold-based alerting | ✅ Implemented | Business logic |
| Device authentication | ❌ Not implemented | FR-1.1 to FR-1.6 |
| NATS messaging | ❌ Not implemented | FR-4.1 to FR-4.4 |
| SQLite buffer | ❌ Not implemented | FR-2.3 to FR-2.7 |
| Worker restart/backoff | ❌ Not implemented | FR-3.2 to FR-3.6 |
| Control Plane (gRPC) | ❌ Not implemented | FR-6.1 to FR-6.5 |
| Dashboard (Web UI) | ❌ Not implemented | FR-7.1 to FR-7.4 |

## Development

### Adding New WASM Functions

1. Define exported function in `wasm_worker/src/lib.rs`:
   ```rust
   #[unsafe(no_mangle)]
   pub extern "C" fn my_new_function(input: i32) -> i32 {
       // Implementation
   }
   ```

2. Add corresponding host call in `server/src/main.rs`:
   ```rust
   let my_fn = instance
       .get_typed_func::<i32, i32>(&mut store, "my_new_function")
       .map_err(|e| format!("Missing 'my_new_function': {}", e))?;
   ```

### Testing Threshold Logic

Modify the `value` field in `client_daemon/src/main.rs`:
```rust
let metric = InputMetric {
    name: "edge_gpu_temp".to_string(),
    value: 84.9,  // Below threshold → alert: false
    // value: 85.1,  // Above threshold → alert: true
    timestamp: 1720000000,
};
```

## License

This project is for demonstration purposes.
