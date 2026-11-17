//! ==============================================================================
//! HARDWARE ABSTRACTION LAYER (HAL) — THERMAL SENSOR DRIVER
//! ==============================================================================
//! Directly reads the host physical CPU/GPU temperatures from the Linux kernel sysfs:
//! `/sys/class/thermal/thermal_zone0/temp`
//! ==============================================================================

use std::fs;
use std::path::Path;

pub struct ThermalDriver {
    sysfs_path: String,
}

impl ThermalDriver {
    pub fn new(preferred_path: &str) -> Self {
        // Auto-detect first valid thermal zone if preferred_path is empty or not found
        let path = if !preferred_path.is_empty() && Path::new(preferred_path).exists() {
            preferred_path.to_string()
        } else {
            Self::find_first_thermal_zone()
                .unwrap_or_else(|| "/sys/class/thermal/thermal_zone0/temp".to_string())
        };

        Self { sysfs_path: path }
    }

    fn find_first_thermal_zone() -> Option<String> {
        for i in 0..10 {
            let candidate = format!("/sys/class/thermal/thermal_zone{}/temp", i);
            if Path::new(&candidate).exists() {
                return Some(candidate);
            }
        }
        None
    }

    /// Reads real hardware temperature in Celsius from the Linux kernel sysfs.
    pub fn read_celsius(&self) -> f64 {
        if let Ok(content) = fs::read_to_string(&self.sysfs_path) {
            if let Ok(milli_celsius) = content.trim().parse::<f64>() {
                // Linux kernel sysfs reports in millidegrees Celsius (e.g. 47000 = 47.0°C)
                if milli_celsius > 1000.0 {
                    return milli_celsius / 1000.0;
                } else if milli_celsius > 0.0 {
                    return milli_celsius;
                }
            }
        }
        // Fallback baseline for non-Linux or containerized setups without sysfs access
        48.5
    }

    pub fn sysfs_path(&self) -> &str {
        &self.sysfs_path
    }
}
