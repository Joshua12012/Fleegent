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
    if [[ "${COMMAND:-}" != "run" && "${COMMAND:-}" != "start" && "${COMMAND:-}" != "test" && "${COMMAND:-}" != "verify" ]]; then
        return 0
    fi
    if [[ -z "$WASM_HOST_PID" && -z "$INFERENCE_PID" && -z "$STORAGE_PID" && -z "$NATS_PID" ]]; then
        return 0
    fi
    echo -e "\n${BOLD}[EDGE] Shutting down all edge client microservices...${NC}"
    
    for pid in "$WASM_HOST_PID" "$INFERENCE_PID" "$STORAGE_PID" "$NATS_PID"; do
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

    # Architecture dispatch: auto-link/copy matching binaries if arch subdirectories exist
    HOST_ARCH=$(uname -m 2>/dev/null || echo "x86_64")
    if [[ -d "$ROOT_DIR/bin/$HOST_ARCH" ]]; then
        mkdir -p "$ROOT_DIR/bin" "$ROOT_DIR/target/release"
        cp -f "$ROOT_DIR/bin/$HOST_ARCH"/* "$ROOT_DIR/bin/" 2>/dev/null || true
        cp -f "$ROOT_DIR/bin/$HOST_ARCH"/* "$ROOT_DIR/target/release/" 2>/dev/null || true
    fi
    if [[ -d "$ROOT_DIR/lib/$HOST_ARCH" ]]; then
        mkdir -p "$ROOT_DIR/lib"
        cp -f "$ROOT_DIR/lib/$HOST_ARCH"/* "$ROOT_DIR/lib/" 2>/dev/null || true
    fi

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

    # Ensure Rust / Cargo in PATH if installed in ~/.cargo/bin
    [[ -f "$HOME/.cargo/env" ]] && source "$HOME/.cargo/env" 2>/dev/null || true
    export PATH="$HOME/.cargo/bin:$PATH"

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

    # Step 0: Auto-bridge Camera Stream (Phone IP Webcam or local webcam)
    if command -v python3 >/dev/null 2>&1; then
        pkill -f "shot.jpg" 2>/dev/null || true
        
        # Determine candidate Phone IP Webcam URLs
        CANDIDATE_URLS=()
        if [[ -n "${PHONE_CAM_URL:-}" ]]; then
            CANDIDATE_URLS+=("$PHONE_CAM_URL")
        fi
        if [[ -n "${PHONE_IP:-}" ]]; then
            CANDIDATE_URLS+=("http://${PHONE_IP}:8080/shot.jpg")
            CANDIDATE_URLS+=("http://${PHONE_IP}:4747/video")
        fi
        # Auto-detect default gateway (phone hotspot IP)
        GW_IP=$(ip route 2>/dev/null | grep default | awk '{print $3}' | head -1)
        if [[ -n "$GW_IP" ]]; then
            CANDIDATE_URLS+=("http://${GW_IP}:8080/shot.jpg")
        fi
        # Primary target IP webcam URLs
        CANDIDATE_URLS+=("http://169.254.184.87:8080/shot.jpg")
        CANDIDATE_URLS+=("http://192.168.1.3:8080/shot.jpg")
        CANDIDATE_URLS+=("http://192.168.43.1:8080/shot.jpg")
        CANDIDATE_URLS+=("http://172.20.10.1:8080/shot.jpg")
        # DroidCam fallback port 4747
        CANDIDATE_URLS+=("http://169.254.184.87:4747/video")
        CANDIDATE_URLS+=("http://192.168.1.3:4747/video")

        DETECTED_CAM_URL=""
        for test_url in "${CANDIDATE_URLS[@]}"; do
            if curl -s -m 0.6 "$test_url" >/dev/null 2>&1; then
                DETECTED_CAM_URL="$test_url"
                break
            fi
        done

        if [[ -n "$DETECTED_CAM_URL" ]]; then
            log_info "0/6 Auto-detected Phone IP Webcam at $DETECTED_CAM_URL. Starting background frame bridge..."
            python3 -c "
import urllib.request, time, os
url = '$DETECTED_CAM_URL'
while True:
    try:
        with urllib.request.urlopen(url, timeout=2) as resp:
            data = resp.read()
            if len(data) > 1024:
                with open('/tmp/edge_live_frame.tmp', 'wb') as f:
                    f.write(data)
                os.replace('/tmp/edge_live_frame.tmp', '/tmp/edge_live_frame.jpg')
        time.sleep(0.06)
    except Exception:
        time.sleep(0.5)
" > /tmp/camera_bridge.log 2>&1 &
            CAM_PID=$!
            disown $CAM_PID 2>/dev/null || true
            sleep 0.3
        fi
    fi

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

    # Step 2.5: ModelPulse Dynamic Model Sync (Server to Edge Client)
    CLOUD_URL=""
    if [[ -f "$ROOT_DIR/data/edge.json" ]]; then
        CLOUD_URL=$(grep -o '"cloud_server_url": *"[^"]*"' "$ROOT_DIR/data/edge.json" | cut -d'"' -f4 || true)
    fi

    TARGET_MODEL="yolov8n-coco"
    if [[ -n "$CLOUD_URL" && -f "$ROOT_DIR/data/edge.json" ]]; then
        DEV_ID=$(grep -o '"device_id": *"[^"]*"' "$ROOT_DIR/data/edge.json" | cut -d'"' -f4 || true)
        if [[ -n "$DEV_ID" ]]; then
            SRV_MODEL=$(curl -s --connect-timeout 2 "${CLOUD_URL}/api/v1/devices/${DEV_ID}/services" 2>/dev/null | grep -o '"active_model_id": *"[^"]*"' | head -n1 | cut -d'"' -f4 || true)
            if [[ -n "$SRV_MODEL" && "$SRV_MODEL" != "null" && "$SRV_MODEL" != "None (Standby)" ]]; then
                TARGET_MODEL="$SRV_MODEL"
            fi
        fi
    fi

    TARGET_FILE="${TARGET_MODEL}.onnx"
    [[ "$TARGET_MODEL" == *.onnx ]] && TARGET_FILE="$TARGET_MODEL"

    MODEL_LOCAL_PATH="$ROOT_DIR/data/models/$TARGET_FILE"
    mkdir -p "$ROOT_DIR/data/models"
    if [[ ! -s "$MODEL_LOCAL_PATH" || $(stat -c%s "$MODEL_LOCAL_PATH" 2>/dev/null || echo 0) -lt 1000000 ]]; then
        if [[ -n "$CLOUD_URL" ]]; then
            log_info "2.5/6 [ModelPulse Sync] Dynamic model fetch: $TARGET_FILE from $CLOUD_URL..."
            DOWNLOAD_OK=false
            for _attempt in 1 2 3 4 5; do
                log_info "  [ModelPulse] Download attempt $_attempt/5..."
                if curl --http1.1 -fL \
                    --max-time 600 --connect-timeout 30 \
                    --retry 2 --retry-delay 3 --retry-connrefused \
                    -C - \
                    -sS "${CLOUD_URL}/models/${TARGET_FILE}" \
                    -o "${MODEL_LOCAL_PATH}.tmp"; then
                    ACTUAL_SIZE=$(stat -c%s "${MODEL_LOCAL_PATH}.tmp" 2>/dev/null || echo 0)
                    if [[ "$ACTUAL_SIZE" -gt 1000000 ]]; then
                        mv -f "${MODEL_LOCAL_PATH}.tmp" "$MODEL_LOCAL_PATH"
                        log_ok "[ModelPulse Sync] Successfully staged $TARGET_FILE ($(du -h "$MODEL_LOCAL_PATH" | awk '{print $1}'))."
                        DOWNLOAD_OK=true
                        break
                    else
                        log_warn "  [ModelPulse] Got ${ACTUAL_SIZE} bytes -- incomplete, retrying..."
                        rm -f "${MODEL_LOCAL_PATH}.tmp" 2>/dev/null || true
                    fi
                else
                    log_warn "  [ModelPulse] curl failed on attempt $_attempt, retrying in 5s..."
                    rm -f "${MODEL_LOCAL_PATH}.tmp" 2>/dev/null || true
                    sleep 5
                fi
            done
            if [[ "$DOWNLOAD_OK" != "true" ]]; then
                log_warn "[ModelPulse Sync] Could not download $TARGET_FILE after 5 attempts. Will use fallback weights if available."
            fi
        fi
    else
        log_ok "[ModelPulse Sync] Active model $TARGET_FILE is cached and ready ($(du -h "$MODEL_LOCAL_PATH" | awk '{print $1}'))."
    fi

    # Step 2.6: Dynamic ONNX Runtime Engine Library Sync (ARM64 / Jetson)
    mkdir -p "$ROOT_DIR/lib"
    if [[ "$HOST_ARCH" == "aarch64" || "$HOST_ARCH" == "arm64" ]]; then
        if [[ ! -s "$ROOT_DIR/lib/libonnxruntime.so" ]]; then
            if [[ -f "$ROOT_DIR/lib/aarch64/libonnxruntime.so" ]]; then
                cp -f "$ROOT_DIR/lib/aarch64/libonnxruntime.so" "$ROOT_DIR/lib/libonnxruntime.so"
            elif [[ -f "$ROOT_DIR/data/models/libonnxruntime.so" ]]; then
                cp -f "$ROOT_DIR/data/models/libonnxruntime.so" "$ROOT_DIR/lib/libonnxruntime.so"
            elif [[ -n "$CLOUD_URL" ]]; then
                log_info "2.6/6 [ModelPulse Sync] Downloading ARM64 libonnxruntime.so from $CLOUD_URL..."
                curl --http1.1 -fL --retry 3 --retry-delay 1 -sS "${CLOUD_URL}/models/libonnxruntime.so" -o "$ROOT_DIR/lib/libonnxruntime.so.tmp" && mv -f "$ROOT_DIR/lib/libonnxruntime.so.tmp" "$ROOT_DIR/lib/libonnxruntime.so" || rm -f "$ROOT_DIR/lib/libonnxruntime.so.tmp" 2>/dev/null || true
            fi
        fi
    fi

    # Configure dynamic library search paths for native ONNX Runtime
    export LD_LIBRARY_PATH="$ROOT_DIR/lib:$ROOT_DIR/lib/aarch64:$ROOT_DIR/lib/x86_64:$ROOT_DIR/bin:${LD_LIBRARY_PATH:-}"
    if [[ -f "$ROOT_DIR/lib/libonnxruntime.so" ]]; then
        export ORT_DYLIB_PATH="$ROOT_DIR/lib/libonnxruntime.so"
    elif [[ -f "$ROOT_DIR/lib/aarch64/libonnxruntime.so" && ( "$HOST_ARCH" == "aarch64" || "$HOST_ARCH" == "arm64" ) ]]; then
        export ORT_DYLIB_PATH="$ROOT_DIR/lib/aarch64/libonnxruntime.so"
    elif [[ -f "$ROOT_DIR/lib/x86_64/libonnxruntime.so" && "$HOST_ARCH" == "x86_64" ]]; then
        export ORT_DYLIB_PATH="$ROOT_DIR/lib/x86_64/libonnxruntime.so"
    fi

    # Step 3: Start AI Inference Service (Native Rust YOLO ORT + 1D-CNN + Audio)
    log_info "3/6 Starting AI Inference Service (Native Rust YOLO + Multi-Modal)..."
    "$INFERENCE_BIN" > "$ROOT_DIR/data/inference.log" 2>&1 &
    INFERENCE_PID=$!
    sleep 0.2

    # Step 4: Start WASM Microservice Runtime Host
    log_info "4/6 Starting WASM Microservice Runtime Host (Wasmtime sandbox)..."
    "$WASM_HOST_BIN" > "$ROOT_DIR/data/wasm_host.log" 2>&1 &
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
    pkill -9 -f "http://192.168.43.1:8080/shot.jpg" 2>/dev/null || true
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
# Status Function (Inspects Daemon & Microservice Health)
# ------------------------------------------------------------------------------
status_all() {
    echo -e "${BOLD}================================================================${NC}"
    echo -e "${BOLD}       TETHER-EDGE — DAEMON & MICROSERVICE STATUS               ${NC}"
    echo -e "${BOLD}================================================================${NC}"

    check_proc() {
        local name="$1"
        local pattern="$2"
        local pids
        pids=$(pgrep -f "$pattern" 2>/dev/null || true)
        if [[ -n "$pids" ]]; then
            local pid_first
            pid_first=$(echo "$pids" | awk '{print $1}')
            local cpu_mem
            cpu_mem=$(ps -o %cpu,%mem -p "$pid_first" --no-headers 2>/dev/null | awk '{print "CPU: "$1"%, RAM: "$2"%"}' || echo "")
            echo -e "  ● \033[1;32m${name}\033[0m: RUNNING (PID: $(echo $pids | tr '\n' ' ')) [${cpu_mem}]"
        else
            echo -e "  ○ \033[1;31m${name}\033[0m: STOPPED"
        fi
    }

    check_proc "Client Daemon    " "client_daemon"
    check_proc "Inference Worker " "inference_worker"
    check_proc "NATS Broker      " "nats-server -p 4222"
    check_proc "Storage Service  " "storage_service"
    check_proc "WASM Worker Host " "wasm_host"

    echo -e "----------------------------------------------------------------"
    if systemctl is-active edge-platform.service >/dev/null 2>&1; then
        echo -e "  Systemd Service: \033[1;32mACTIVE (edge-platform.service)\033[0m"
    else
        echo -e "  Systemd Service: \033[1;33mINACTIVE / NOT RUNNING\033[0m"
    fi

    if [[ -f "$ROOT_DIR/data/edge.json" ]]; then
        local dev_id
        dev_id=$(grep -o '"device_id"[[:space:]]*:[[:space:]]*"[^"]*' "$ROOT_DIR/data/edge.json" 2>/dev/null | head -n1 | sed -E 's/.*"([^"]+)$/\1/' || echo "unknown")
        local cloud_url
        cloud_url=$(grep -o '"cloud_server_url"[[:space:]]*:[[:space:]]*"[^"]*' "$ROOT_DIR/data/edge.json" 2>/dev/null | head -n1 | sed -E 's/.*"([^"]+)$/\1/' || echo "http://127.0.0.1:8080")
        echo -e "  Device Identity: \033[1m${dev_id}\033[0m"
        echo -e "  Cloud URL:       \033[1m${cloud_url}\033[0m"
    fi

    # Check last telemetry / inference line
    for log_candidate in "$ROOT_DIR/data/edge.log" "$ROOT_DIR/data/daemon.log" "$ROOT_DIR/client_test.log"; do
        if [[ -f "$log_candidate" ]]; then
            local last_pred
            last_pred=$(grep -E "\[YOLO|PREDICTION" "$log_candidate" | tail -n 1 || true)
            if [[ -n "$last_pred" ]]; then
                echo -e "  Latest Prediction:\n    ${last_pred}"
                break
            fi
        fi
    done
    echo -e "${BOLD}================================================================${NC}\n"
}

# ------------------------------------------------------------------------------
# Logs Function (Follows Daemon & Inference Logs)
# ------------------------------------------------------------------------------
logs_all() {
    for log_candidate in "$ROOT_DIR/data/edge.log" "$ROOT_DIR/data/daemon.log" "$ROOT_DIR/client_test.log"; do
        if [[ -f "$log_candidate" ]]; then
            log_info "Tailing live logs from $log_candidate..."
            tail -f "$log_candidate"
            return 0
        fi
    done
    if systemctl is-active edge-platform.service >/dev/null 2>&1; then
        log_info "Tailing systemd service logs..."
        journalctl -u edge-platform.service -f
    else
        log_warn "No background log file found. Run in background with: ./run-edge.sh run > data/edge.log 2>&1 &"
    fi
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
        rm -f "$ROOT_DIR/data/.maintenance_stop" 2>/dev/null || true
        run_all "$@"
        ;;
    status)
        status_all
        ;;
    logs|log)
        logs_all
        ;;
    restart)
        stop_all
        sleep 1
        rm -f "$ROOT_DIR/data/.maintenance_stop" 2>/dev/null || true
        run_all "$@"
        ;;
    install-systemd|--install-systemd)
        SERVICE_FILE="/etc/systemd/system/edge-platform.service"
        CURRENT_USER=$(id -un)
        log_info "Generating systemd unit at $SERVICE_FILE for user $CURRENT_USER..."
        SERVICE_CONTENT="[Unit]
Description=Edge Platform Microservices Fleet & Orchestrator
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$ROOT_DIR
ExecStart=$ROOT_DIR/run-edge.sh run
Restart=always
RestartSec=3s
RestartPreventExitStatus=42
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target"

        if [[ $EUID -ne 0 ]]; then
            echo "$SERVICE_CONTENT" | sudo tee "$SERVICE_FILE" >/dev/null
            sudo systemctl daemon-reload
            sudo systemctl enable edge-platform.service
        else
            echo "$SERVICE_CONTENT" > "$SERVICE_FILE"
            systemctl daemon-reload
            systemctl enable edge-platform.service
        fi
        log_ok "Systemd service 'edge-platform.service' installed and enabled on boot!"
        log_info "To start service: sudo systemctl start edge-platform"
        log_info "To check status:  sudo systemctl status edge-platform"
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
        echo "Usage: ./run-edge.sh [run|stop|restart|status|logs|purge|test|build|clean]"
        exit 1
        ;;
esac
