//! ==============================================================================
//! HARDWARE ABSTRACTION LAYER (HAL) MODULE
//! ==============================================================================

pub mod audio;
pub mod camera;
pub mod thermal;
pub mod vibration;

pub use audio::AudioDriver;
pub use camera::CameraDriver;
pub use thermal::ThermalDriver;
pub use vibration::VibrationDriver;
