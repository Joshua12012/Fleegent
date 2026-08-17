use serde::{Deserialize, Serialize};
use std::ptr::addr_of_mut;

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

// Global fixed memory buffer for guest-host communication
static mut BUFFER: [u8; 2048] = [0u8; 2048];

/// Returns a raw pointer to the WASM memory buffer so the host can write input
#[unsafe(no_mangle)]
pub extern "C" fn get_buffer_ptr() -> *mut u8 {
    unsafe { addr_of_mut!(BUFFER) as *mut u8 }
}

/// Executes processing over input data and writes response back to BUFFER
#[unsafe(no_mangle)]
pub extern "C" fn process_telemetry(input_len: usize) -> usize {
    let buf_ptr = unsafe { addr_of_mut!(BUFFER) as *mut u8 };
    let input_bytes = unsafe { std::slice::from_raw_parts(buf_ptr, input_len) };

    // Deserialize payload
    let metric: InputMetric = match serde_json::from_slice(input_bytes) {
        Ok(m) => m,
        Err(_) => return 0,
    };

    // Business Logic / Anomaly Check
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

    // Serialize result back into the shared buffer
    let output_bytes = match serde_json::to_vec(&result) {
        Ok(b) => b,
        Err(_) => return 0,
    };

    if output_bytes.len() > 2048 {
        return 0;
    }

    unsafe {
        std::ptr::copy_nonoverlapping(
            output_bytes.as_ptr(),
            buf_ptr,
            output_bytes.len(),
        );
    }

    output_bytes.len()
}