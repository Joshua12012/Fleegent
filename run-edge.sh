#!/usr/bin/env bash
# ==============================================================================
# EDGE PLATFORM DEMO — SINGLE COMMAND CLIENT-SIDE RUNNER (CLIENT V1)
# ==============================================================================
# Builds and orchestrates the entire Edge Client Microservices architecture:
#  1. Compiles the WASM worker (wasm_worker) to WebAssembly (wasm32-wasip1)
#  2. Compiles all Rust microservices in release mode via Cargo workspace
#  3. Boots local NATS IPC message broker (nats-server on 127.0.0.1:4222)
#  4. Launches Storage Service (SQLite WAL mode + model staging)
#  5. Launches AI Inference Service (WASI-NN bridge + Drain-and-Swap hot-reload)
#  6. Launches WASM Microservice Host (Wasmtime linear memory + atomic pointer swap)
#  7. Runs Master Client Daemon (sysinfo OS telemetry, pipeline verification)
#  8. Gracefully shuts down all processes on Ctrl+C or script exit without zombies
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Track background process PIDs for graceful teardown
NATS_PID=""
STORAGE_PID=""
LLAMA_PID=""
INFERENCE_PID=""
WASM_HOST_PID=""

# ANSI Colors for terminal output
BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info()  { echo -e "${CYAN}${BOLD}[EDGE]${NC} $1"; }
log_ok()    { echo -e "${GREEN}${BOLD}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}${BOLD}[WARN]${NC} $1"; }
log_err()   { echo -e "${RED}${BOLD}[ERROR]${NC} $1"; }

# ------------------------------------------------------------------------------
# Graceful Cleanup Handler
# ------------------------------------------------------------------------------
cleanup() {
    echo -e "\n${BOLD}[EDGE] Shutting down all edge client microservices...${NC}"
    
    for pid in "$WASM_HOST_PID" "$INFERENCE_PID" "$LLAMA_PID" "$STORAGE_PID" "$NATS_PID"; do
        if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
            wait "$pid" 2>/dev/null || true
        fi
    done
    
    log_ok "All edge microservices stopped cleanly. No orphaned PIDs."
}
trap cleanup EXIT INT TERM

# ------------------------------------------------------------------------------
# Build Function
# ------------------------------------------------------------------------------
build_all() {
    log_info "1/2 Compiling WASM CPU microservice to wasm32-wasip1..."
    (cd wasm_worker && cargo build --target wasm32-wasip1 --release --quiet)
    log_ok "WASM bytecode binary ready."

    log_info "2/2 Compiling all client microservices (release mode)..."
    cargo build --workspace --release --quiet
    log_ok "All client microservice binaries ready."
}

# ------------------------------------------------------------------------------
# Run Function (The Master Orchestration Chain)
# ------------------------------------------------------------------------------
run_all() {
    echo -e "${BOLD}================================================================${NC}"
    echo -e "${BOLD}       TETHER-EDGE — CLIENT V1 MICROSERVICES       ${NC}"
    echo -e "${BOLD}================================================================${NC}"

    WASM_FILE="$ROOT_DIR/wasm_worker/target/wasm32-wasip1/release/wasm_worker.wasm"
    STORAGE_BIN="$ROOT_DIR/target/release/storage_service"
    INFERENCE_BIN="$ROOT_DIR/target/release/inference_worker"
    WASM_HOST_BIN="$ROOT_DIR/target/release/wasm_host"
    DAEMON_BIN="$ROOT_DIR/target/release/client_daemon"

    # Fallback to bin/ or local root binaries if target/release is not populated
    [[ ! -f "$STORAGE_BIN" && -f "$ROOT_DIR/bin/storage_service" ]] && STORAGE_BIN="$ROOT_DIR/bin/storage_service"
    [[ ! -f "$STORAGE_BIN" && -f "$ROOT_DIR/storage_service" && ! -d "$ROOT_DIR/storage_service" ]] && STORAGE_BIN="$ROOT_DIR/storage_service"

    [[ ! -f "$INFERENCE_BIN" && -f "$ROOT_DIR/bin/inference_worker" ]] && INFERENCE_BIN="$ROOT_DIR/bin/inference_worker"
    [[ ! -f "$INFERENCE_BIN" && -f "$ROOT_DIR/inference_worker" && ! -d "$ROOT_DIR/inference_worker" ]] && INFERENCE_BIN="$ROOT_DIR/inference_worker"

    [[ ! -f "$WASM_HOST_BIN" && -f "$ROOT_DIR/bin/wasm_host" ]] && WASM_HOST_BIN="$ROOT_DIR/bin/wasm_host"
    [[ ! -f "$WASM_HOST_BIN" && -f "$ROOT_DIR/wasm_host" && ! -d "$ROOT_DIR/wasm_host" ]] && WASM_HOST_BIN="$ROOT_DIR/wasm_host"

    [[ ! -f "$DAEMON_BIN" && -f "$ROOT_DIR/bin/client_daemon" ]] && DAEMON_BIN="$ROOT_DIR/bin/client_daemon"
    [[ ! -f "$DAEMON_BIN" && -f "$ROOT_DIR/client_daemon" && ! -d "$ROOT_DIR/client_daemon" ]] && DAEMON_BIN="$ROOT_DIR/client_daemon"

    [[ ! -f "$WASM_FILE" && -f "$ROOT_DIR/bin/wasm_worker.wasm" ]] && WASM_FILE="$ROOT_DIR/bin/wasm_worker.wasm"
    [[ ! -f "$WASM_FILE" && -f "$ROOT_DIR/wasm_worker.wasm" ]] && WASM_FILE="$ROOT_DIR/wasm_worker.wasm"

    # Architecture validation: clean incompatible x86_64 binaries if running on ARM64 Jetson
    HOST_ARCH=$(uname -m 2>/dev/null || echo "x86_64")
    if [[ "$HOST_ARCH" == "aarch64" || "$HOST_ARCH" == "arm64" ]]; then
        if [[ -f "$DAEMON_BIN" ]] && file "$DAEMON_BIN" 2>/dev/null | grep -qi "x86-64"; then
            log_warn "Detected incompatible x86_64 binaries on ARM64 ($HOST_ARCH) Jetson host."
            log_info "Cleaning x86 binaries to enable native ARM64 compilation..."
            rm -f "$ROOT_DIR/target/release/client_daemon" "$ROOT_DIR/target/release/inference_worker" "$ROOT_DIR/target/release/storage_service" "$ROOT_DIR/target/release/wasm_host" "$ROOT_DIR/bin/client_daemon" "$ROOT_DIR/bin/inference_worker" "$ROOT_DIR/bin/storage_service" "$ROOT_DIR/bin/wasm_host" 2>/dev/null || true
            DAEMON_BIN="$ROOT_DIR/target/release/client_daemon"
            STORAGE_BIN="$ROOT_DIR/target/release/storage_service"
            INFERENCE_BIN="$ROOT_DIR/target/release/inference_worker"
            WASM_HOST_BIN="$ROOT_DIR/target/release/wasm_host"
        fi
    fi

    # Auto-build if any binary is missing and Cargo workspace is present
    if [[ ! -f "$WASM_FILE" ]] || [[ ! -f "$STORAGE_BIN" ]] || [[ ! -f "$INFERENCE_BIN" ]] || [[ ! -f "$WASM_HOST_BIN" ]] || [[ ! -f "$DAEMON_BIN" ]]; then
        if command -v cargo >/dev/null 2>&1 && [[ -d "$ROOT_DIR/wasm_worker" ]] && [[ -f "$ROOT_DIR/Cargo.toml" ]]; then
            build_all
        else
            log_err "Missing pre-built binaries and Cargo workspace not found in $ROOT_DIR to compile."
            log_err "Please run with bundled binaries or check repository contents."
            exit 1
        fi
    fi

    mkdir -p data data/models

    # Locate NATS Broker (system PATH or local root)
    NATS_BIN="nats-server"
    if ! command -v nats-server >/dev/null 2>&1; then
        if [[ -f "$ROOT_DIR/bin/nats-server" ]]; then
            NATS_BIN="$ROOT_DIR/bin/nats-server"
        elif [[ -f "$ROOT_DIR/nats-server" ]]; then
            NATS_BIN="$ROOT_DIR/nats-server"
        fi
    fi

    # Auto-fetch official NATS broker for aarch64 if missing or incompatible
    if [[ "$HOST_ARCH" == "aarch64" || "$HOST_ARCH" == "arm64" ]]; then
        NATS_IS_X86=false
        if command -v "$NATS_BIN" >/dev/null 2>&1 || [[ -f "$NATS_BIN" ]]; then
            if file "$(which "$NATS_BIN" 2>/dev/null || echo "$NATS_BIN")" 2>/dev/null | grep -qi "x86-64"; then
                NATS_IS_X86=true
            fi
        else
            NATS_IS_X86=true
        fi

        if [[ "$NATS_IS_X86" == "true" ]]; then
            log_info "Downloading official NATS Broker for ARM64 (Jetson)..."
            mkdir -p "$ROOT_DIR/bin"
            curl -sSL "https://github.com/nats-io/nats-server/releases/download/v2.10.22/nats-server-v2.10.22-linux-arm64.tar.gz" | tar -xz -C "$ROOT_DIR/bin" --strip-components=1 nats-server-v2.10.22-linux-arm64/nats-server 2>/dev/null || true
            chmod +x "$ROOT_DIR/bin/nats-server" 2>/dev/null || true
            NATS_BIN="$ROOT_DIR/bin/nats-server"
        fi
    fi

    # Step 1: Start local NATS IPC broker (if not already running)
    if ! nc -z 127.0.0.1 4222 2>/dev/null && ! timeout 0.5 bash -c '</dev/tcp/127.0.0.1/4222' 2>/dev/null; then
        log_info "1/5 Starting Local NATS Broker on 127.0.0.1:4222..."
        "$NATS_BIN" -p 4222 > /dev/null 2>&1 &
        NATS_PID=$!
        sleep 0.4
    else
        log_info "1/5 Local NATS Broker is already running on port 4222."
    fi

    # Step 2: Start Storage & Logging Service (SQLite WAL)
    log_info "2/6 Starting Storage Service (SQLite WAL mode & model staging)..."
    "$STORAGE_BIN" > /dev/null 2>&1 &
    STORAGE_PID=$!
    sleep 0.2

    # Step 2.5: Start Local Llama.cpp GGUF Inference Engine (if installed)
    LLAMA_BIN=""
    for cand in "$ROOT_DIR/llama-server" "$ROOT_DIR/bin/llama-server" "/usr/local/bin/llama-server" "llama-server" "/home/joshua/llama.cpp/build/bin/llama-server"; do
        if command -v "$cand" >/dev/null 2>&1 || [[ -f "$cand" ]]; then
            LLAMA_BIN="$cand"
            break
        fi
    done

    QWEN_MODEL=""
    for cand in "$ROOT_DIR/data/models/qwen3-0.6b-q4_k_m.gguf" "$ROOT_DIR/qwen3-0.6b-q4_k_m.gguf" "$ROOT_DIR/data/models/qwen_v1.gguf" "/home/joshua/Downloads/qwen3-0.6b-q4_k_m.gguf"; do
        if [[ -f "$cand" ]]; then
            QWEN_MODEL="$cand"
            break
        fi
    done

    if [[ -n "$LLAMA_BIN" && -n "$QWEN_MODEL" ]]; then
        if ! nc -z 127.0.0.1 9931 2>/dev/null && ! timeout 0.5 bash -c '</dev/tcp/127.0.0.1/9931' 2>/dev/null; then
            log_info "2.5/7 Starting Local Llama.cpp Server (Qwen-0.6B GGUF on 127.0.0.1:9931)..."
            "$LLAMA_BIN" --host 127.0.0.1 --port 9931 -m "$QWEN_MODEL" -c 1024 -t 4 --reasoning off > /dev/null 2>&1 &
            LLAMA_PID=$!
            sleep 1.2
        else
            log_info "2.5/7 Local Llama.cpp Server is already active on port 9931."
        fi
    fi

    # Step 3: Start AI Inference Service (Native Rust YOLO ORT + 1D-CNN + Audio + Llama.cpp)
    log_info "3/6 Starting AI Inference Service (Native Rust YOLO + Multi-Modal)..."
    "$INFERENCE_BIN" > /dev/null 2>&1 &
    INFERENCE_PID=$!
    sleep 0.2

    # Step 4: Start WASM Microservice Runtime Host
    log_info "4/6 Starting WASM Microservice Runtime Host (Wasmtime sandbox)..."
    "$WASM_HOST_BIN" > /dev/null 2>&1 &
    WASM_HOST_PID=$!
    sleep 0.4

    # Step 5: Run Master Client Daemon to orchestrate telemetry & pipeline verification
    log_info "5/6 Running Master Client Daemon (sysinfo OS telemetry & validation)..."
    echo -e "${BOLD}----------------------------------------------------------------${NC}"
    "$DAEMON_BIN" "$@"
    echo -e "${BOLD}----------------------------------------------------------------${NC}"

    log_ok "Client v1 Microservices verified successfully in single-command execution!"
}

# ------------------------------------------------------------------------------
# Stop Function
# ------------------------------------------------------------------------------
stop_all() {
    log_info "Stopping all running edge client microservices..."
    # 1. Signal Python / Colab camera bridge to release browser camera track and turn off LED
    touch /tmp/edge_stop_camera 2>/dev/null || true

    killall -9 inference_worker wasm_host storage_service gst-launch-1.0 ffmpeg 2>/dev/null || true
    pkill -9 -f gst-launch-1.0 2>/dev/null || true
    pkill -9 -f ffmpeg 2>/dev/null || true
    pkill -x inference_worker 2>/dev/null || true
    pkill -x wasm_host 2>/dev/null || true
    pkill -x storage_service 2>/dev/null || true
    pkill -f "nats-server -p 4222" 2>/dev/null || true
    pkill -x client_daemon 2>/dev/null || true
    killall -9 client_daemon 2>/dev/null || true
    rm -f /tmp/edge_live_frame.jpg 2>/dev/null || true
    log_ok "All edge client microservices stopped cleanly. Camera released. Local data & configs preserved."
}

# ------------------------------------------------------------------------------
# Clean Function
# ------------------------------------------------------------------------------
clean_all() {
    log_info "Cleaning runtime databases and temporary files..."
    rm -rf data/*.db data/*.db-wal data/*.db-shm
    log_ok "Clean completed."
}

# ------------------------------------------------------------------------------
# Command Dispatcher
# ------------------------------------------------------------------------------
COMMAND="${1:-run}"
shift || true

case "$COMMAND" in
    run|start)
        run_all "$@"
        ;;
    stop)
        stop_all
        ;;
    purge|uninstall|clean-all)
        log_info "Stopping worker microservices..."
        # 1. Signal Python / Colab camera bridge to release browser camera track immediately
        touch /tmp/edge_stop_camera 2>/dev/null || true

        killall -9 inference_worker wasm_host storage_service gst-launch-1.0 ffmpeg 2>/dev/null || true
        pkill -9 -f gst-launch-1.0 2>/dev/null || true
        pkill -9 -f ffmpeg 2>/dev/null || true
        pkill -x inference_worker 2>/dev/null || true
        pkill -x wasm_host 2>/dev/null || true
        pkill -x storage_service 2>/dev/null || true
        pkill -f "nats-server -p 4222" 2>/dev/null || true
        pkill -x client_daemon 2>/dev/null || true
        killall -9 client_daemon 2>/dev/null || true
        rm -f /tmp/edge_live_frame.jpg /tmp/edge_supervisor.sock 2>/dev/null || true
        if [[ -f "data/edge.json" ]]; then
            DEVICE_ID=$(grep -o '"device_id":"[^"]*' data/edge.json | head -n1 | cut -d'"' -f4 || true)
            CLOUD_URL=$(grep -o '"cloud_server_url":"[^"]*' data/edge.json | head -n1 | cut -d'"' -f4 || true)
            if [[ -n "$DEVICE_ID" && -n "$CLOUD_URL" ]]; then
                log_info "Notifying Cloud Server to deregister device $DEVICE_ID..."
                curl -sSL -X POST "$CLOUD_URL/api/v1/devices/$DEVICE_ID/purge" >/dev/null 2>&1 || true
            fi
        fi
        rm -rf data client_test.log trace.log /tmp/edge_* 2>/dev/null || true
        if [[ ! -d "$ROOT_DIR/.git" ]]; then
            log_info "Standalone client installation detected — removing all binaries, scripts, and benchmark files..."
            rm -rf "$ROOT_DIR/bin" \
                   "$ROOT_DIR/target" \
                   "$ROOT_DIR/sample_data" \
                   "$ROOT_DIR/scripts" \
                   "$ROOT_DIR/benchmark_results" 2>/dev/null || true
            rm -f "$ROOT_DIR/benchmark.sh" \
                  "$ROOT_DIR/client_daemon" \
                  "$ROOT_DIR/inference_worker" \
                  "$ROOT_DIR/storage_service" \
                  "$ROOT_DIR/wasm_host" \
                  "$ROOT_DIR/nats-server" \
                  "$ROOT_DIR/wasm_worker.wasm" \
                  "$ROOT_DIR/edge-ctl" \
                  "$ROOT_DIR/run-edge.sh" 2>/dev/null || true
        else
            rm -rf "$ROOT_DIR/benchmark_results" 2>/dev/null || true
        fi
        log_ok "All edge client data, databases, and microservice files completely purged!"
        ;;
    test|verify|smoke-test)
        run_all --once
        ;;
    build)
        build_all
        ;;
    clean)
        clean_all
        ;;
    *)
        echo "Usage: ./run-edge.sh [run|stop|purge|test|build|clean]"
        exit 1
        ;;
esac
