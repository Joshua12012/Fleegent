.PHONY: all run client server setup stop purge build clean test check help

all: run

## Command 1: Setup edge directories, configuration, and pre-compiled binaries
setup:
	@./edge-ctl setup

## Command 2: Start all edge client processes and connect to server
run:
	@./edge-ctl run

## Alias for Command 2
client: run

## Stop all edge client processes cleanly (preserves data)
stop:
	@./edge-ctl stop

## Command 3: Stop all edge processes and completely purge all data, models, and configs
purge:
	@./edge-ctl purge

## Start the Cloud Fleet Management Server (Control Plane + Web Dashboard)
server:
	@fuser -k 8080/tcp 2>/dev/null || true
	@node cloud_server/src/server.js

## Start Cloudflare Public Tunnel for Google Colab, Kaggle & WAN Edge Nodes
tunnel:
	@./tunnel.sh start

## Stop Cloudflare Public Tunnel
tunnel-stop:
	@./tunnel.sh stop

## Compile WASM worker and Rust release binaries
build:
	@./run-edge.sh build

## Run Rust test suite
test:
	cargo test --workspace

## Run Rust format and clippy checks
check:
	cargo fmt --all -- --check
	cargo clippy --workspace -- -D warnings

## Clean run files (SQLite telemetry DB, tokens, logs)
clean:
	@./run-edge.sh clean

## Show available targets
help:
	@echo "Edge Fleet Management Platform"
	@echo "The 3 Client Lifecycle Commands:"
	@echo "  1. make setup   - Setup all files, dirs, and bundled binaries (Command 1)"
	@echo "  2. make client  - Run edge client fleet & connect to server   (Command 2)"
	@echo "  3. make purge   - Completely stop and purge all data & config (Command 3)"
	@echo ""
	@echo "Server Command:"
	@echo "  make server     - Start Cloud Server & Web Dashboard (http://localhost:8080)"
