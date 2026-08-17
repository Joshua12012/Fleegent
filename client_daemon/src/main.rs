use serde::{Deserialize, Serialize};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::UnixStream;

#[derive(Debug, Serialize, Deserialize)]
pub struct InputMetric {
    pub name: String,
    pub value: f64,
    pub timestamp: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessedResult {
    pub name: String,
    pub original_value: f64,
    pub alert: bool,
    pub reason: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let socket_path = "/tmp/edge_supervisor.sock";

    println!("[Client Daemon] Connecting to supervisor via UDS ({})", socket_path);
    let mut stream = UnixStream::connect(socket_path).await?;

    // Create a sample telemetry metric with a critical temperature value (> 85.0)
    let metric = InputMetric {
        name: "edge_gpu_temp".to_string(),
        value: 91.4,
        timestamp: 1720000000,
    };

    let payload = serde_json::to_vec(&metric)?;
    println!("[Client Daemon] Sending JSON metric: {:?}", metric);

    // Send payload over UDS
    stream.write_all(&payload).await?;

    // Read back processed result from WASM engine
    let mut response_buf = [0u8; 2048];
    let bytes_read = stream.read(&mut response_buf).await?;

    let result: ProcessedResult = serde_json::from_slice(&response_buf[..bytes_read])?;
    println!("--------------------------------------------------");
    println!("[Client Daemon] Received WASM Evaluated Output:");
    println!("  - Target:         {}", result.name);
    println!("  - Recorded Value: {}", result.original_value);
    println!("  - Trigger Alert:  {}", result.alert);
    println!("  - Reason:         {}", result.reason);
    println!("--------------------------------------------------");

    Ok(())
}