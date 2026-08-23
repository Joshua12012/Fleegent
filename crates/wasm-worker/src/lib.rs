wit_bindgen::generate!({
    world: "user-workload",
    path: "../../wit"
});

use exports::edge::platform::service_handler::{Guest, Metric, ProcessedResult};

struct Component;

impl Guest for Component {
    fn handle_telemetry(input: Metric) -> Result<ProcessedResult, String> {
        let threshold = 85.0;
        let alert = input.value > threshold;
        let reason = if alert {
            format!("Value {} exceeds threshold {}", input.value, threshold)
        } else {
            "Normal operation".to_string()
        };

        Ok(ProcessedResult {
            name: input.name,
            original_value: input.value,
            alert,
            reason,
        })
    }
}

export!(Component);
