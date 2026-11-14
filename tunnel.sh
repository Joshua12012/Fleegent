#!/usr/bin/env bash
# ==============================================================================
# TETHER-EDGE — CLOUDFLARE PUBLIC TUNNEL LAUNCHER
# ==============================================================================
# Bridges your local Cloud Server (port 8080) to the public internet using
# Cloudflare Quick Tunnels. Enables instant zero-touch edge enrollment from:
#   - Google Colab / Kaggle Notebooks
#   - Remote Raspberry Pi / NVIDIA Jetson boards across cellular / WAN
#   - External edge devices outside your local Wi-Fi router
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="/tmp/tether_edge_cloudflared.pid"
URL_FILE="/tmp/tether_edge_tunnel.url"

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${CYAN}${BOLD}[TUNNEL]${NC} $1"; }
log_ok()   { echo -e "${GREEN}${BOLD}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}${BOLD}[WARN]${NC} $1"; }
log_err()  { echo -e "${RED}${BOLD}[ERROR]${NC} $1"; }

cmd_start() {
    echo -e "${BOLD}================================================================${NC}"
    echo -e "${BOLD}  🌐 TETHER-EDGE — ESTABLISHING CLOUDFLARE PUBLIC TUNNEL        ${NC}"
    echo -e "${BOLD}================================================================${NC}"

    if ! command -v cloudflared >/dev/null 2>&1; then
        log_err "Missing 'cloudflared' binary. Please install it or use ngrok."
        exit 1
    fi

    # Check if local cloud server is listening on port 8080
    if ! nc -z 127.0.0.1 8080 2>/dev/null && ! timeout 0.5 bash -c '</dev/tcp/127.0.0.1/8080' 2>/dev/null; then
        log_warn "Local Cloud Server is not detected on 127.0.0.1:8080."
        log_info "Starting Cloud Server first..."
        node "$ROOT_DIR/cloud_server/src/server.js" > /dev/null 2>&1 &
        sleep 1.5
    fi

    # If already running, print existing URL
    if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null && [[ -f "$URL_FILE" ]]; then
        TUNNEL_URL=$(cat "$URL_FILE")
        log_ok "Cloudflare Tunnel is already running!"
        echo -e "  - Public Tunnel URL: ${BOLD}${CYAN}${TUNNEL_URL}${NC}"
        echo -e "  - Web Dashboard:     ${BOLD}${TUNNEL_URL}${NC}"
        echo -e "  - Stop Tunnel:       ${BOLD}./tunnel.sh stop${NC}\n"
        exit 0
    fi

    log_info "Launching Cloudflare quick tunnel for http://127.0.0.1:8080..."
    rm -f "$URL_FILE"

    # Start cloudflared in background and tee logs to temporary log
    LOG_FILE="/tmp/cloudflared_quick.log"
    rm -f "$LOG_FILE"

    cloudflared tunnel --url http://127.0.0.1:8080 > "$LOG_FILE" 2>&1 &
    CF_PID=$!
    echo "$CF_PID" > "$PID_FILE"

    # Wait up to 10 seconds for the public trycloudflare.com URL
    TUNNEL_URL=""
    for i in {1..20}; do
        if grep -q "trycloudflare.com" "$LOG_FILE" 2>/dev/null; then
            TUNNEL_URL=$(grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' "$LOG_FILE" | head -n1 || true)
            if [[ -n "$TUNNEL_URL" ]]; then
                break
            fi
        fi
        sleep 0.5
    done

    if [[ -z "$TUNNEL_URL" ]]; then
        log_err "Failed to extract Cloudflare Tunnel URL within 10 seconds."
        kill "$CF_PID" 2>/dev/null || true
        rm -f "$PID_FILE"
        exit 1
    fi

    echo "$TUNNEL_URL" > "$URL_FILE"

    # Automatically notify local Cloud Server
    curl -sSL -X POST http://127.0.0.1:8080/api/v1/tunnel \
        -H "Content-Type: application/json" \
        -d "{\"public_url\": \"${TUNNEL_URL}\"}" >/dev/null 2>&1 || true

    log_ok "Cloudflare Public Tunnel established successfully!"
    echo -e "----------------------------------------------------------------"
    echo -e "  🌐 Public HTTPS URL:    ${BOLD}${GREEN}${TUNNEL_URL}${NC}"
    echo -e "  📊 Web Dashboard:       ${BOLD}${CYAN}${TUNNEL_URL}/?tab=fleet${NC}"
    echo -e "----------------------------------------------------------------"
    echo -e "${BOLD}Google Colab & Kaggle 1-Click Code:${NC}"
    echo -e "  !curl -sSL ${TUNNEL_URL}/bootstrap.sh?token=YOUR_TOKEN | bash -s -- --daemon"
    echo -e "----------------------------------------------------------------"
    echo -e "To stop the public tunnel anytime, run:\n  ${BOLD}./tunnel.sh stop${NC}  or  ${BOLD}make tunnel-stop${NC}\n"
}

cmd_stop() {
    log_info "Stopping Cloudflare Public Tunnel..."

    if [[ -f "$PID_FILE" ]]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID" 2>/dev/null || true
            sleep 0.5
        fi
        rm -f "$PID_FILE"
    fi

    pkill -x cloudflared 2>/dev/null || true
    rm -f "$URL_FILE"

    # Notify Cloud Server to reset tunnel URL
    curl -sSL -X DELETE http://127.0.0.1:8080/api/v1/tunnel >/dev/null 2>&1 || true

    log_ok "Cloudflare Tunnel stopped cleanly. Reverted to local networking."
}

cmd_status() {
    if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null && [[ -f "$URL_FILE" ]]; then
        TUNNEL_URL=$(cat "$URL_FILE")
        log_ok "Cloudflare Tunnel is ACTIVE."
        echo "  URL: $TUNNEL_URL"
    else
        log_warn "Cloudflare Tunnel is NOT active (Local LAN mode)."
    fi
}

COMMAND="${1:-start}"

case "$COMMAND" in
    start|up)
        cmd_start
        ;;
    stop|down)
        cmd_stop
        ;;
    status)
        cmd_status
        ;;
    restart)
        cmd_stop
        sleep 1
        cmd_start
        ;;
    *)
        echo "Usage: ./tunnel.sh [start|stop|status|restart]"
        exit 1
        ;;
esac
