use serde::{Deserialize, Serialize};
use std::ptr::addr_of_mut;

// ==============================================================================
// STEP 1: DATA STRUCTURES (The Question Card & The Answer Card)
// ==============================================================================

/// The incoming telemetry data sent from the host into this WASM sandbox.
/// In JSON, this looks like: {"name": "edge_gpu_temp", "value": 91.4, "timestamp": 1720000000}
#[derive(Debug, Serialize, Deserialize)]
pub struct InputMetric {
    pub name: String,     // Name of the metric (e.g., "edge_gpu_temp")
    pub value: f64,       // Measurement value (e.g., 91.4 degrees Celsius or CPU %)
    pub timestamp: u64,   // Unix timestamp when the measurement was taken
}

/// The result evaluated inside the sandbox and returned to the host.
/// In JSON, this looks like: {"name": "edge_gpu_temp", "original_value": 91.4, "alert": true, "reason": "..."}
#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessedResult {
    pub name: String,        // Name of the original metric
    pub original_value: f64, // The original numeric value that was checked
    pub alert: bool,         // True if threshold was exceeded (danger), False if normal
    pub reason: String,      // Human-readable explanation of why the alert triggered
}

// ==============================================================================
// STEP 2: SHARED MEMORY BUFFER (The "Sliding Tray" / Mailbox)
// ==============================================================================

// A fixed 2,048-byte (2 KB) array inside the WASM sandbox's own memory.
// Because WASM is isolated, the host and guest use this shared tray to exchange data.
static mut BUFFER: [u8; 2048] = [0u8; 2048];

/// Returns a raw pointer (memory address) to the start of BUFFER.
/// The host calls this first so it knows WHERE in memory to write the input JSON.
#[no_mangle]
pub extern "C" fn get_buffer_ptr() -> *mut u8 {
    addr_of_mut!(BUFFER) as *mut u8
}

// ==============================================================================
// STEP 3: BUSINESS LOGIC (The Rule Checker)
// ==============================================================================

/// Called by the host after it has written `input_len` bytes of JSON into BUFFER.
/// Returns the length (in bytes) of the output JSON written back into BUFFER.
#[no_mangle]
pub extern "C" fn process_telemetry(input_len: usize) -> usize {
    // 1. Get a pointer to the shared memory buffer
    let buf_ptr = addr_of_mut!(BUFFER) as *mut u8;

    // 2. Read the input bytes that the host wrote into our buffer
    let input_bytes = unsafe { std::slice::from_raw_parts(buf_ptr, input_len) };

    // 3. Deserialize JSON bytes into our Rust InputMetric struct
    let metric: InputMetric = match serde_json::from_slice(input_bytes) {
        Ok(m) => m,
        Err(_) => return 0, // If the JSON was invalid, return 0 (error)
    };

    // 4. Core Industrial Edge Logic: Multi-sensor CPU rule engine
    let (is_alert, reason) = if metric.name.contains("temp") {
        let thresh = 85.0;
        let alert = metric.value > thresh;
        let r = if alert {
            format!("Thermal critical: {:.1}°C exceeds safe operating threshold ({:.1}°C)", metric.value, thresh)
        } else {
            "Nominal operating temperature".to_string()
        };
        (alert, r)
    } else if metric.name.contains("vibration") || metric.name.contains("rms") {
        let thresh = 4.5;
        let alert = metric.value > thresh;
        let r = if alert {
            format!("Vibration energy: {:.2} mm/s exceeds ISO 10816 threshold ({:.1} mm/s)", metric.value, thresh)
        } else {
            "Vibration levels smooth and balanced".to_string()
        };
        (alert, r)
    } else if metric.name.contains("audio") || metric.name.contains("db") {
        let thresh = 75.0;
        let alert = metric.value > thresh;
        let r = if alert {
            format!("Sound pressure: {:.1} dB exceeds acoustic threshold ({:.1} dB)", metric.value, thresh)
        } else {
            "Acoustic noise within baseline".to_string()
        };
        (alert, r)
    } else if metric.name.contains("voltage") {
        let low_thresh = 11.5;
        let high_thresh = 28.0;
        let alert = metric.value < low_thresh || metric.value > high_thresh;
        let r = if alert {
            format!("Voltage fault: {:.1}V outside permissible range (11.5V - 28.0V)", metric.value)
        } else {
            "Power supply voltage nominal".to_string()
        };
        (alert, r)
    } else if metric.name.contains("motion") {
        let thresh = 0.5;
        let alert = metric.value > thresh;
        let r = if alert {
            "Visual motion trigger detected in camera FOV".to_string()
        } else {
            "Static frame (no visual motion)".to_string()
        };
        (alert, r)
    } else {
        let thresh = 85.0;
        let alert = metric.value > thresh;
        (alert, if alert { format!("Threshold exceeded: {:.1}", metric.value) } else { "Normal".to_string() })
    };

    let result = ProcessedResult {
        name: metric.name,
        original_value: metric.value,
        alert: is_alert,
        reason,
    };

    // 5. Serialize the ProcessedResult struct into JSON bytes
    let output_bytes = match serde_json::to_vec(&result) {
        Ok(b) => b,
        Err(_) => return 0,
    };

    // 6. Safety check: make sure the output fits inside our 2 KB buffer
    if output_bytes.len() > 2048 {
        return 0;
    }

    // 7. Copy the output JSON bytes back into the BUFFER (overwriting the old input)
    unsafe {
        std::ptr::copy_nonoverlapping(
            output_bytes.as_ptr(),
            buf_ptr,
            output_bytes.len(),
        );
    }

    // 8. Return the byte length so the host knows exactly how many bytes to read
    output_bytes.len()
}