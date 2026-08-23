# Edge Fleet Management Platform — Full Codebase Explanation

## Table of Contents

1. [The Big Picture](#the-big-picture)
2. [System Architecture Diagram](#system-architecture-diagram)
3. [The Three Key Messages](#the-three-key-messages-that-flow)
4. [Folder-by-Folder Walkthrough](#folder-by-folder-walkthrough)
5. [File-by-File Explanation](#file-by-file-explanation)
6. [Data Flow Diagram](#how-everything-connects)
7. [Build vs Not-Built Status](#whats-built-vs-whats-not)
8. [Sprint Plan](#sprint-plan)

---

## The Big Picture: What Is This Project?

You're building an **Edge Fleet Management Platform**. Imagine you have 100 small computers
(like Raspberry Pis) scattered across factories, vehicles, or cell towers. You need to:

1. **Monitor them** — collect CPU usage, memory, uptime from each device
2. **Control them** — push new software/models to them from a central cloud server
3. **Process data on them** — run AI/ML inference workloads inside sandboxed containers (WASM)

The "fleet" is all those devices. The "platform" is the software that manages them.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    EDGE DEVICE                           │
│  (A small computer in the field — e.g. Raspberry Pi)    │
│                                                         │
│  ┌───────────────────┐     ┌────────────────────────┐   │
│  │   EDGE-DAEMON      │     │   EDGE-SUPERVISOR      │   │
│  │                    │     │                        │   │
│  │ • Talks to cloud   │     │ • Runs the WASM worker │   │
│  │ • Collects CPU/RAM │     │ • If worker crashes,   │   │
│  │ • Stores data in   │     │   restarts it          │   │
│  │   SQLite (offline  │     │ • Feeds telemetry into │   │
│  │   buffer)          │     │   the WASM worker      │   │
│  │ • Sends telemetry  │     │                        │   │
│  │   to cloud         │     │                        │   │
│  └────────┬──────────┘     └──────────┬─────────────┘   │
│           │                            │                 │
│           │   ◄── NATS messaging ──►   │                 │
│           │   (local message bus on     │                 │
│           │    Unix Domain Socket)      │                 │
│           │                            │                 │
│           │                  ┌─────────▼──────────┐     │
│           │                  │    WASM WORKER      │     │
│           │                  │  (sandboxed code)   │     │
│           │                  │                     │     │
│           │                  │ • Receives telemetry│     │
│           │                  │ • Checks thresholds │     │
│           │                  │ • Returns alerts    │     │
│           │                  └────────────────────┘     │
│           │                                             │
└───────────┼─────────────────────────────────────────────┘
            │
            │ gRPC (outbound to cloud)
            │
┌───────────▼─────────────────────────────────────────────┐
│                  CONTROL PLANE                           │
│  (Cloud server — not built yet, scaffolded in TS)       │
│                                                         │
│  • Authenticates devices (issues JWT tokens)            │
│  • Receives telemetry, stores in Postgres              │
│  • Serves deployment packages to devices                │
│  • Exposes REST API for the dashboard                   │
│                                                         │
│  ┌────────────────────┐                                 │
│  │     DASHBOARD      │  (Web UI — not built yet)      │
│  │  Shows fleet status│                                 │
│  │  Triggers deploys  │                                 │
│  └────────────────────┘                                 │
└─────────────────────────────────────────────────────────┘
```

---

## The Three Key Messages That Flow

```
telemetry.hardware    →  Daemon publishes CPU/RAM samples every 10s
inference.response    →  Supervisor publishes worker's processed results
model.deploy          →  Cloud pushes new WASM binary to the device
```

---

## Folder-by-Folder Walkthrough

```
edge-platform-demo/
│
├── Cargo.toml              ← THE MASTER FILE (workspace root)
├── proto/                  ← API contract between device and cloud
│   └── edge.v1.proto
├── wit/                    ← WASM interface contract
│   └── edge_platform.wit
│
├── crates/                 ← ALL RUST CODE LIVES HERE
│   ├── shared/             ← Shared library (used by both daemon & supervisor)
│   ├── edge-daemon/        ← The daemon binary
│   ├── edge-supervisor/    ← The supervisor binary
│   └── wasm-worker/        ← The WASM sandboxed worker
│
├── control-plane/          ← TypeScript cloud server (scaffolded, not compiled)
├── dashboard/              ← TypeScript web UI (scaffolded, not compiled)
│
├── client_daemon/          ← OLD code from before the rewrite (ignore)
├── server/                 ← OLD code from before the rewrite (ignore)
└── wasm_worker/            ← OLD code from before the rewrite (ignore)
```

---

## File-by-File Explanation

### 1. `Cargo.toml` (workspace root) — The Manager File

```toml
[workspace]
resolver = "2"
members = [
    "crates/shared",         # Library used by others
    "crates/edge-daemon",    # Binary: the edge-daemon
    "crates/edge-supervisor",# Binary: the edge-supervisor
    "crates/wasm-worker",    # Library (compiled to WASM): the worker
]
```

**Beginner concept:** In Rust, `Cargo.toml` is like `package.json` in Node.js — it declares
your project, its dependencies, and how to build it. A **workspace** lets you have multiple
related projects in one repo that share the same dependency versions.

The `[workspace.dependencies]` section lists every dependency ONCE. Each crate then says
`tokio = { workspace = true }` to inherit it. This means if you upgrade `tokio` in one place,
ALL crates get the same version.

**Key dependencies and what they do:**

| Dependency     | What it does                              | Beginner analogy                      |
|---------------|-------------------------------------------|---------------------------------------|
| `tokio`       | Async runtime (lets Rust do many things)  | Like Python's `asyncio`              |
| `serde`       | Convert structs to/from JSON               | Like `JSON.parse/stringify`          |
| `async-nats`  | Connect to NATS message bus                | Like sending/receiving local emails  |
| `rusqlite`    | SQLite database access                     | Like Python's `sqlite3`              |
| `tonic`       | gRPC client/server                         | Like making API calls, but faster    |
| `prost`       | Protocol Buffers for Rust                  | Binary serialization format          |
| `wasmtime`    | Runs WASM modules                          | Like Node.js running JavaScript      |
| `wit-bindgen` | Generates Rust code from .wit files        | Like code generation tools           |
| `sysinfo`     | Reads CPU/memory stats                     | Like `top` command                   |
| `jsonwebtoken`| Create/verify JWT tokens                   | Like login session cookies           |
| `sha2`        | SHA-256 hashing (verify downloads)         | Like checking a file's fingerprint   |
| `chrono`      | Date/time handling                         | Like Python's `datetime`             |
| `tracing`     | Structured logging                         | Like `console.log` but much better   |
| `anyhow`      | Easy error handling                        | Wraps errors with context            |

---

### 2. `proto/edge.v1.proto` — The Cloud API Contract

This file defines **what the cloud server and edge device can say to each other**
using Protocol Buffers (a compact binary format, like JSON but smaller and faster).

```protobuf
service EdgeControlPlane {
  rpc AuthenticateDevice(AuthRequest) returns (AuthResponse);
  rpc StreamTelemetry(stream TelemetryPacket) returns (Ack);
  rpc GetDeploymentPackage(PackageRequest) returns (stream FileChunk);
}
```

**Three conversations:**

```
DEVICE says: "Hey cloud, I'm device-001, here's my secret password"
CLOUD says:  "OK, here's your JWT token (like a hotel keycard)"

DEVICE says: "Here are 50 telemetry samples" (stream of packets)
CLOUD says:  "Got them" (acknowledgment)

DEVICE says: "Give me the model at path /models/classifier.wasm"
CLOUD says:  "Here it is" (streams the file back in chunks)
```

**Beginner concept:** Protocol Buffers (protobuf) are a way to define data structures and APIs
in a `.proto` file. Tools like `tonic-build` read this file and auto-generate Rust code so you
can call `client.authenticate_device(request)` instead of manually constructing HTTP requests.
It's like having an auto-generated SDK.

---

### 3. `wit/edge_platform.wit` — The WASM Worker Contract

WIT stands for **WebAssembly Interface Types**. It defines what the WASM worker looks like
from the outside — what functions it exposes, what data types it accepts.

```wit
interface types {
    record metric {
        name: string,        // e.g. "edge_gpu_temp"
        value: float64,      // e.g. 91.4
        timestamp: u64,      // e.g. 1700000000
    }

    record processed-result {
        name: string,
        original-value: float64,
        alert: bool,         // true if value exceeds threshold
        reason: string,      // e.g. "Value 91.4 exceeds threshold 85.0"
    }
}

interface service-handler {
    handle-telemetry: func(input: metric) -> result<processed-result, string>;
}

world user-workload {
    export service-handler;  // The WASM module MUST export this function
}
```

**Beginner concept:** Think of this like a TypeScript `.d.ts` type definition file, but for WASM.
It tells both the worker (what to implement) and the supervisor (what to expect). The
`wit-bindgen` tool reads this file and auto-generates Rust code that the worker uses to export
the right functions.

---

### 4. `crates/shared/` — The Shared Library

This is NOT a binary — it's a **library** that both `edge-daemon` and `edge-supervisor` import.
It contains everything they both need.

#### `crates/shared/Cargo.toml`

```toml
[package]
name = "edge-shared"      # Other crates import it as: use edge_shared::...

[build-dependencies]
tonic-build = "0.12"      # Used only at build time to generate proto code
```

#### `crates/shared/build.rs` — Pre-Build Script

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Points to the proto/ directory at the project root
    let proto_root = std::env::var("CARGO_MANIFEST_DIR")
        .map(|m| std::path::PathBuf::from(m).join("../../proto"))
        .unwrap_or_else(|_| Path::new("../../proto").into());

    // Reads edge.v1.proto and generates Rust structs + gRPC client/server code
    tonic_build::configure().compile_protos(
        &[proto_root.join("edge.v1.proto")],
        &[&proto_root],
    )?;
    Ok(())
}
```

**Beginner concept:** `build.rs` is a special Rust convention. When you run `cargo build`,
Rust sees this file and runs it FIRST, before compiling your actual code. It's like a
pre-build script. Here it reads the `.proto` file and generates Rust code like:

```rust
// AUTO-GENERATED (you don't write this):
pub struct AuthRequest { pub device_serial: String, pub secret: String }
pub struct AuthResponse { pub jwt: String, pub expires_at_unix: i64 }
// ... plus all the gRPC client/server code
```

#### `crates/shared/src/lib.rs` — The Library Code

Organized into modules:

```
lib.rs
├── pub mod proto          → Auto-generated gRPC types (from .proto)
├── pub mod nats_subjects  → String constants for NATS topic names
├── pub mod telemetry      → HardwareSample struct (what telemetry looks like)
├── pub mod inference      → Request/Response structs
├── pub mod deploy         → ModelDeploy struct
├── pub mod worker         → Health struct
├── pub mod auth           → JWT create/verify functions
├── pub mod db             → TelemetryBuffer (SQLite wrapper)
└── pub mod config         → EdgeConfig (settings)
```

##### `pub mod proto` (lines 1-3):

```rust
pub mod proto {
    tonic::include_proto!("edge.v1");  // Pulls in auto-generated code
}
```

This one line brings in ALL the structs and gRPC client/server code that `build.rs`
generated from the `.proto` file. After this, you can write
`edge_shared::proto::AuthRequest` and use it.

##### `pub mod nats_subjects` (lines 5-11):

```rust
pub const TELEMETRY_HARDWARE: &str = "telemetry.hardware";
pub const INFERENCE_RESPONSE: &str = "inference.response";
pub const MODEL_DEPLOY: &str = "model.deploy";
pub const WORKER_HEALTH: &str = "worker.health";
pub const INFERENCE_REQUEST: &str = "inference.request";
```

Just string constants. Instead of typing `"telemetry.hardware"` everywhere (and possibly
making typos), you write `nats_subjects::TELEMETRY_HARDWARE`. Defined ONCE, shared everywhere.

##### `pub mod telemetry` (lines 13-25):

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HardwareSample {
    pub device_id: String,     // "device-001"
    pub cpu_pct: f64,          // 45.2 (percent)
    pub mem_used_mb: i32,      // 1024
    pub mem_total_mb: i32,     // 4096
    pub uptime_s: i64,         // 86400 (seconds since boot)
    pub ts: String,            // "2026-08-19T10:30:00Z" (ISO 8601)
}
```

This is a plain data structure. The `#[derive(Serialize, Deserialize)]` (from `serde`)
auto-generates code to convert this struct to/from JSON. So you can write
`serde_json::to_string(&sample)` and get:
`{"device_id":"device-001","cpu_pct":45.2,...}`.

**Beginner concept — `derive`:** In Rust, `#[derive(...)]` is a macro that generates boilerplate
code for you. `Debug` lets you print the struct with `{:?}`. `Clone` lets you `.clone()` it.
`Serialize`/`Deserialize` lets you convert to/from JSON.

##### `pub mod inference` (lines 27-44):

```rust
pub struct Request {
    pub request_id: String,      // Unique ID for this request
    pub payload_b64: String,     // Base64-encoded input data
    pub ts: String,              // Timestamp
}

pub struct Response {
    pub request_id: String,      // Same ID as the request
    pub result: serde_json::Value, // Any JSON value (the inference output)
    pub latency_ms: f64,         // How long it took
    pub ts: String,              // Timestamp
}
```

These define what an inference request/response looks like on the message bus.

##### `pub mod deploy` (lines 46-55):

```rust
pub struct ModelDeploy {
    pub model_path: String,  // "/models/classifier-v1.wasm"
    pub sha256: String,      // "a1b2c3d4..." (to verify integrity)
    pub version: String,     // "1.0.0"
}
```

This is what the cloud sends when it wants to deploy a new WASM worker.

##### `pub mod worker` (lines 57-65):

```rust
pub struct Health {
    pub status: String,  // "ok"
    pub ts: String,      // "2026-08-19T10:30:00Z"
}
```

The worker publishes this after successfully processing telemetry. It's a heartbeat.

##### `pub mod auth` (lines 67-113):

```rust
pub fn create_token(device_id, secret, expiry_hours) -> Result<String> {
    // Creates a JWT token (like a hotel keycard)
    // Contains: who you are (device_id), when issued (iat), when it expires (exp)
}

pub fn verify_token(token, secret) -> Result<Claims> {
    // Checks if a JWT token is valid and not expired
    // Returns the claims (device_id, expiry) if valid
}
```

**Beginner concept — JWT:** JSON Web Tokens are a standard way to prove identity.
The cloud signs a token with a secret. The device stores it and sends it with every request.
The cloud verifies the signature to confirm the device is who it says it is.

##### `pub mod db` (lines 115-187):

```rust
pub struct TelemetryBuffer {
    conn: Mutex<Connection>,  // SQLite connection, wrapped in Mutex for thread safety
}

impl TelemetryBuffer {
    fn open(path) -> Self;           // Opens/creates the database file
    fn insert(payload) -> i64;       // Saves a telemetry sample (returns its ID)
    fn get_unsynced(limit) -> Vec;   // Gets samples not yet sent to cloud
    fn mark_synced(ids);             // Marks samples as sent
    fn purge_old(hours) -> usize;    // Deletes old sent samples (saves disk)
    fn count_unsynced() -> usize;    // Counts unsent samples
}
```

The SQLite database acts as a **buffer**. When the cloud is unreachable (network outage),
telemetry is saved here. When connectivity returns, it's flushed to the cloud. This ensures
no data is ever lost (requirement FR-2.6 from the spec).

**Beginner concept — Mutex:** `Mutex` means "mutual exclusion" — only one thread can access
the SQLite connection at a time. This prevents two async tasks from corrupting the database
simultaneously. Think of it like a bathroom key at a gas station.

##### `pub mod config` (lines 189-222):

```rust
pub struct EdgeConfig {
    pub device_serial: String,         // "device-001"
    pub device_secret: String,         // "shared-secret-001"
    pub control_plane_url: String,     // "http://localhost:50051"
    pub nats_socket_path: String,      // "/run/edge/nats.sock"
    pub telemetry_db_path: String,     // "/var/lib/edge/telemetry.db"
    pub token_path: String,            // "/var/lib/edge/token.jwt"
    pub wasm_binary_path: String,      // "/var/lib/edge/worker.wasm"
    pub telemetry_interval_secs: u64,  // 10
    pub sync_interval_secs: u64,       // 30
}
```

The `Default` impl hardcodes sensible values for development. In production you'd load
these from environment variables or a config file.

---

### 5. `crates/edge-daemon/src/main.rs` — The Edge Daemon

This is a **binary** (it has `fn main()`). When you run it, it starts the daemon process.

#### What it does, step by step:

```
STARTUP:
  1. Create directories for database and token files
  2. Open SQLite database
  3. Connect to local NATS message bus
  4. Initialize system info collector (CPU, memory)
  5. Try to authenticate with cloud
     → Check if we have a saved JWT token
     → If valid and not expiring soon, reuse it
     → Otherwise, call cloud's AuthenticateDevice RPC
     → Save the JWT token to disk with 0600 permissions

MAIN LOOP (runs forever, doing two things at once):
  ┌─ Every 10 seconds: collect telemetry ──────────────────┐
  │  1. Read CPU%, memory used/total, uptime from the OS   │
  │  2. Turn it into JSON                                  │
  │  3. Publish to NATS subject "telemetry.hardware"       │
  │  4. Save to SQLite database (for offline buffering)    │
  └────────────────────────────────────────────────────────┘

  ┌─ Every 30 seconds: sync to cloud ──────────────────────┐
  │  1. Get up to 100 unsent rows from SQLite              │
  │  2. Convert them to gRPC TelemetryPacket messages      │
  │  3. Stream them to cloud via StreamTelemetry RPC       │
  │  4. If cloud says "OK", mark those rows as synced      │
  │  5. Delete synced rows older than 24 hours             │
  └────────────────────────────────────────────────────────┘
```

#### Key Rust Concepts Used Here:

##### `#[tokio::main]` (line 217):

```rust
#[tokio::main]
async fn main() -> Result<()> { ... }
```

This is a macro that transforms your `main` function into an async function running on the
Tokio runtime. Think of it as: "this program can do many things concurrently" (like threads,
but more efficient).

##### `async fn` and `.await` (throughout):

```rust
async fn authenticate(&mut self) -> Result<()> {
    let mut client = EdgeControlPlaneClient::connect(url).await?;
    let response = client.authenticate_device(request).await?;
}
```

- `async fn` means "this function might need to wait for something (network, file I/O)
  and won't block other work while waiting."
- `.await` means "wait for this async operation to complete."
- The `?` operator means "if this fails, return the error immediately" (Rust's error propagation).

##### `tokio::select!` (lines 194-213):

```rust
loop {
    tokio::select! {
        _ = sleep(telemetry_interval) => {
            // This branch runs every 10 seconds
        }
        _ = sync_tick.tick() => {
            // This branch runs every 30 seconds
        }
    }
}
```

This is like having two alarms — one fires every 10s, another every 30s. The `select!`
macro lets both timers share the same loop. When either fires, it runs that branch.

##### The `Daemon` Struct (lines 16-22):

```rust
struct Daemon {
    config: EdgeConfig,              // Settings
    nats_client: async_nats::Client, // Connection to local message bus
    db: TelemetryBuffer,             // SQLite buffer
    jwt: Option<String>,             // Cloud auth token (None until authenticated)
    sys: System,                     // System info reader (CPU, memory)
}
```

This is the daemon's "state" — all the things it needs to remember while running.
Think of it like a class instance in Python/JavaScript.

---

### 6. `crates/edge-supervisor/src/main.rs` — The Edge Supervisor

Another **binary**. Runs alongside the daemon as a separate process. Its job: manage the WASM worker.

#### What it does:

```
STARTUP:
  1. Connect to local NATS
  2. Load the WASM binary from disk

MAIN LOOP:
  1. Subscribe to NATS topic "telemetry.hardware"
  2. For each message:
     a. Feed the JSON into the WASM worker
     b. If worker succeeds:
        → Reset restart counter
        → Publish result to "inference.response"
        → Publish health status to "worker.health"
     c. If worker crashes:
        → Increment restart counter
        → Wait (exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s)
        → Reload the WASM module
        → Try again

  Also: subscribe to "model.deploy" in a separate task
  (to know when a new WASM binary is available)
```

#### The `WorkerRuntime` Struct (lines 11-65):

```rust
struct WorkerRuntime {
    engine: Engine,           // Wasmtime engine (the WASM "CPU")
    module: Option<Module>,  // The loaded WASM binary (None if not loaded)
    wasm_path: String,       // Where to find the .wasm file on disk
}
```

#### How WASM Execution Works (the `execute` method, lines 38-64):

```
1. Create a fresh WASM "Store" (like a new process)
2. Create a Linker (connects WASM to host functions)
3. Instantiate the module (load the WASM code)
4. Call "get_buffer_ptr" → get pointer to a memory buffer inside WASM
5. Copy the input JSON into that buffer (WASM memory)
6. Call "process_telemetry" → WASM processes it, returns output length
7. Read the result from the same buffer
```

**Beginner concept:** WASM modules have their own isolated memory. To pass data in, you:
1. Ask the WASM module for a pointer to its buffer
2. Write your data there
3. Call a function telling it "here's the input length"
4. Read the result from the same buffer

This is like putting a letter in a mailbox (WASM memory), knocking on the door (calling
the function), and finding the reply in the mailbox.

#### Exponential Backoff (lines 89-96):

```rust
fn calculate_backoff(&self) -> Duration {
    let base = 1u64.pow(self.restart_count.min(5));  // 1, 2, 4, 8, 16, 32
    let backoff = base.min(30);                        // capped at 30 seconds
    Duration::from_secs(backoff)
}
```

If the worker keeps crashing, we wait longer between restarts:
`1s → 2s → 4s → 8s → 16s → 30s → 30s → ...`

This prevents a broken worker from eating all CPU by constantly restarting.

---

### 7. `crates/wasm-worker/src/lib.rs` — The WASM Worker

This is a **library** (not a binary) that compiles to `.wasm` instead of a native executable.
Notice `crate-type = ["cdylib"]` in its `Cargo.toml` — this tells Rust to produce a C-compatible
dynamic library, which is what WASM needs.

```rust
wit_bindgen::generate!({
    world: "user-workload",     // Which WIT world to use
    path: "../../wit"           // Where the .wit file is
});
```

This macro reads `wit/edge_platform.wit` and generates Rust code that:
- Defines the `Metric` and `ProcessedResult` types
- Defines the `Guest` trait (what you must implement)
- Sets up the WASM exports

```rust
impl Guest for Component {
    fn handle_telemetry(input: Metric) -> Result<ProcessedResult, String> {
        let threshold = 85.0;
        let alert = input.value > threshold;
        // ...
    }
}
export!(Component);
```

This is the **actual business logic**. Right now it's simple: "if the metric value exceeds
85.0, raise an alert." In production this could be an AI inference model.

**`export!(Component)`** is the magic line — it tells wit-bindgen to generate the WASM
export functions that the supervisor will call.

---

## How Everything Connects (Data Flow)

```
                    Edge Device
┌──────────────────────────────────────────────────┐
│                                                  │
│   Every 10 seconds:                             │
│   ┌─────────────┐                               │
│   │ sysinfo     │ → CPU 45%, RAM 2048/4096 MB   │
│   └──────┬──────┘                               │
│          │                                       │
│          ▼                                       │
│   ┌─────────────┐    publishes     ┌──────────┐ │
│   │ edge-daemon  │ ──────────────► │ NATS Bus │ │
│   │             │                  └────┬─────┘ │
│   │             │    saves to           │        │
│   │             │  ┌──────────┐         │ subscribe
│   │             │  │ SQLite   │         ▼        │
│   │             │  │ (backup) │   ┌───────────┐  │
│   └──────┬──────┘  └──────────┘   │ edge-     │  │
│          │                        │ supervisor│  │
│          │ syncs every 30s        │           │  │
│          ▼                        │ feeds into│  │
│   ┌──────────────┐                │ ┌───────┐ │  │
│   │ Cloud gRPC   │                │ │ WASM  │ │  │
│   │ (outbound)   │                │ │Worker │ │  │
│   └──────────────┘                │ └───┬───┘ │  │
│                                   └─────┼─────┘  │
│                                         │        │
│                                    publishes     │
│                                         │        │
│                                    ┌────▼────┐   │
│                                    │ NATS Bus│   │
│                                    └─────────┘   │
└──────────────────────────────────────────────────┘
```

---

## What's Built vs What's Not

| Component        | Status                    | What works                                      |
|-----------------|---------------------------|-------------------------------------------------|
| `edge-shared`   | **Done**                  | All types, DB, auth, config                      |
| `edge-daemon`   | **Coded, compiles**       | Auth, telemetry, NATS, SQLite, sync              |
| `edge-supervisor`| **Coded, compiles**      | WASM loading, NATS, crash recovery               |
| `wasm-worker`   | **Done**                  | WIT-based threshold check                        |
| Control Plane   | **Scaffolded (TS)**       | Code exists but not compiled/run                 |
| Dashboard       | **Scaffolded (TS)**       | Code exists but not compiled/run                 |
| NATS server     | **Not installed**         | Need to run one for testing                      |
| Integration test| **Not done**              | Haven't run anything end-to-end yet              |

---

## Sprint Plan

| Sprint | Goal                                                    | Status   |
|--------|---------------------------------------------------------|----------|
| **S0** | Project infra — Cargo workspace, shared types, proto, WIT| **DONE** |
| **S1** | Clean compile + WASM worker builds to `wasm32-wasip1`   | **DONE** |
| **S2** | NATS local messaging — daemon publishes, supervisor subscribes | Next |
| **S3** | Telemetry collection + SQLite buffer (sysinfo + rusqlite)|          |
| **S4** | Device auth — gRPC client, JWT, token persistence        |          |
| **S5** | Telemetry sync — daemon flushes to control plane         |          |
| **S6** | Worker crash recovery — detect, restart, backoff         |          |
| **S7** | Deployment delivery — download, SHA-256, reload WASM     |          |
