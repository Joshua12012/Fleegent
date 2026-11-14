// ==============================================================================
// BOOTSTRAP ROUTES — ONE-LINE CURL INSTALLER SCRIPT
// ==============================================================================

const express = require('express');
const router = express.Router();
const store = require('../store/state');

/**
 * Serves the dynamic bootstrap.sh script.
 * Usage: curl -sSL http://<cloud>:8080/bootstrap.sh?token=dev_tok_XXXXXX | bash
 */
router.get('/bootstrap.sh', (req, res) => {
  const token = req.query.token || '';
  const host = req.get('host') || '127.0.0.1:8080';
  const protocol = req.protocol || 'http';
  const cloudUrl = store.tunnel_url || `${protocol}://${host}`;

  const script = `#!/usr/bin/env bash
# ==============================================================================
# EDGE PLATFORM — ZERO-TOUCH DEVICE BOOTSTRAP SCRIPT
# ==============================================================================
set -euo pipefail

BOLD='\\033[1m'
GREEN='\\033[0;32m'
CYAN='\\033[0;36m'
YELLOW='\\033[1;33m'
RED='\\033[0;31m'
NC='\\033[0m'

echo -e "\${BOLD}================================================================\${NC}"
echo -e "\${BOLD}  🚀 EDGE PLATFORM — ZERO-TOUCH DEVICE PROVISIONING             \${NC}"
echo -e "\${BOLD}================================================================\${NC}"

TOKEN="${token}"
CLOUD_URL="${cloudUrl}"

if [[ -z "\$TOKEN" ]]; then
    echo -e "\${RED}\${BOLD}[ERROR]\${NC} Missing enrollment token. Usage: curl -sSL \${CLOUD_URL}/bootstrap.sh?token=YOUR_TOKEN | bash"
    exit 1
fi

echo -e "\${CYAN}[1/4]\${NC} Gathering hardware fingerprint and network identity..."
HOSTNAME=\$(hostname 2>/dev/null || echo "edge-device")
ARCH=\$(uname -m 2>/dev/null || echo "x86_64")
OS_INFO=\$(uname -s -r 2>/dev/null || echo "Linux")

BOARD_MODEL=""
if [[ -f /sys/firmware/devicetree/base/model ]]; then
    BOARD_MODEL=\$(tr -d '\\0' < /sys/firmware/devicetree/base/model 2>/dev/null || true)
elif [[ -f /etc/nv_tegra_release ]]; then
    BOARD_MODEL="NVIDIA Jetson (Tegra)"
elif grep -qi "raspberry" /proc/cpuinfo 2>/dev/null; then
    BOARD_MODEL="Raspberry Pi"
fi
if [[ -z "\$BOARD_MODEL" ]]; then
    BOARD_MODEL="\$ARCH Linux Host"
fi

HARDWARE_ID=""
if [[ -f /etc/machine-id ]]; then
    HARDWARE_ID=\$(cat /etc/machine-id | tr -d ' \\n')
elif command -v ip >/dev/null 2>&1; then
    HARDWARE_ID=\$(ip link show 2>/dev/null | awk '/ether/ {print \$2; exit}' | tr -d ':')
fi
if [[ -z "\$HARDWARE_ID" ]]; then
    HARDWARE_ID="hw_\$(date +%s%N | cut -b1-12)"
fi

echo "  - Hostname:     \$HOSTNAME"
echo "  - Hardware:     \$BOARD_MODEL"
echo "  - Architecture: \$ARCH"
echo "  - Machine UUID: \$HARDWARE_ID"
echo "  - Cloud Server: \$CLOUD_URL"

echo -e "\\n\${CYAN}[2/4]\${NC} Claiming device identity with Cloud Control Plane..."
CLAIM_PAYLOAD=\$(cat <<EOF
{
  "token": "\$TOKEN",
  "hardware_id": "\$HARDWARE_ID",
  "board_model": "\$BOARD_MODEL",
  "hostname": "\$HOSTNAME",
  "os_info": "\$OS_INFO",
  "arch": "\$ARCH"
}
EOF
)

CLAIM_RESP=\$(curl -sSL -X POST "\${CLOUD_URL}/api/v1/devices/claim" \\
    -H "Content-Type: application/json" \\
    -d "\$CLAIM_PAYLOAD")

SUCCESS=\$(echo "\$CLAIM_RESP" | grep -o '"success":true' || true)
if [[ -z "\$SUCCESS" ]]; then
    echo -e "\${RED}\${BOLD}[FAILED]\${NC} Cloud Server rejected token claim:"
    echo "\$CLAIM_RESP"
    exit 1
fi

DEVICE_ID=\$(echo "\$CLAIM_RESP" | grep -o '"device_id":"[^"]*' | head -n1 | cut -d'"' -f4)
echo -e "\${GREEN}\${BOLD}[OK]\${NC} Successfully enrolled as: \${BOLD}\$DEVICE_ID\${NC}"

echo -e "\n\${CYAN}[3/4]\${NC} Staging local edge directories and configuration..."
mkdir -p data data/models data/samples

cat <<EOF > data/edge.json
{
  "device_id": "\$DEVICE_ID",
  "hostname": "\$HOSTNAME",
  "cloud_server_url": "\$CLOUD_URL",
  "nats_url": "127.0.0.1:4222",
  "created_at": \$(date +%s)
}
EOF
echo -e "\${GREEN}\${BOLD}[OK]\${NC} Staged identity config: data/edge.json"

echo -e "  - Downloading latest Edge Client binaries from: \${CLOUD_URL}/edge-client-bundle.tar.gz"
curl -sSL "\${CLOUD_URL}/edge-client-bundle.tar.gz" | tar -xz
chmod +x edge-ctl run-edge.sh client_daemon inference_worker wasm_host storage_service nats-server target/release/* 2>/dev/null || true
echo -e "\${GREEN}\${BOLD}[OK]\${NC} Edge runtime package ready."

MODE="\${1:-foreground}"
if [[ "\$MODE" == "--daemon" || "\$MODE" == "-d" || "\$MODE" == "daemon" ]]; then
    echo -e "\n\${CYAN}[4/4]\${NC} Starting Edge Microservice Fleet in background daemon mode..."
    mkdir -p data
    if [[ -f "./run-edge.sh" ]]; then
        nohup ./run-edge.sh run </dev/null > data/client.log 2>&1 &
        CLIENT_PID=\$!
        disown \$CLIENT_PID 2>/dev/null || true
    elif [[ -f "./edge-ctl" ]]; then
        nohup ./edge-ctl run </dev/null > data/client.log 2>&1 &
        CLIENT_PID=\$!
        disown \$CLIENT_PID 2>/dev/null || true
    fi
    echo -e "\${GREEN}\${BOLD}[OK]\${NC} Edge microservices running in background (PID: \$CLIENT_PID)."
    echo -e "  - Dashboard URL:          \${BOLD}\${CLOUD_URL}\${NC}"
    echo -e "  - Runtime log:            \${BOLD}tail -f data/client.log\${NC}"
    echo -e "  - Stop microservices:     \${BOLD}./run-edge.sh stop\${NC} or \${BOLD}./edge-ctl stop\${NC}  (or click Stop in Web UI)"
    echo -e "  - Purge device and data:  \${BOLD}./run-edge.sh purge\${NC} or \${BOLD}./edge-ctl purge\${NC} (or click Purge in Web UI)\n"
else
    echo -e "\n\${CYAN}[4/4]\${NC} Starting Edge Microservice Fleet in live streaming mode via run-edge.sh..."
    echo -e "  - Hit \${BOLD}Ctrl+C\${NC} anytime to stop cleanly without orphaned PIDs."
    echo -e "  - Background daemon mode: \${BOLD}curl -sSL \${CLOUD_URL}/bootstrap.sh?token=\${TOKEN} | bash -s -- --daemon\${NC}\n"
    if [[ -f "./run-edge.sh" ]]; then
        exec ./run-edge.sh run </dev/tty 2>/dev/null || exec ./run-edge.sh run </dev/null
    elif [[ -f "./edge-ctl" ]]; then
        exec ./edge-ctl run </dev/tty 2>/dev/null || exec ./edge-ctl run </dev/null
    else
        echo -e "\${RED}[ERROR]\${NC} Missing run-edge.sh binary."
        exit 1
    fi
fi
`;

  res.setHeader('Content-Type', 'text/x-shellscript');
  res.send(script);
});

module.exports = router;
