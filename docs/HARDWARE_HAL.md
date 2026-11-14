# Hardware Abstraction Layer (HAL)

This document describes the **Hardware Abstraction Layer (HAL)** in the Edge Platform Demo, located in [`client_daemon/src/hal/`](file:///home/joshua/edge-platform-demo/client_daemon/src/hal/).

The HAL interfaces directly with native Linux kernel drivers and character devices, shielding higher-level microservices from hardware-specific nuances.

---

## 1. Camera & Optical Vision Driver

- **File**: [`client_daemon/src/hal/camera.rs`](file:///home/joshua/edge-platform-demo/client_daemon/src/hal/camera.rs)
- **Interface**: Linux Video4Linux2 (`/dev/video*`).

### Why Standard `read()` Failed on USB Webcams
Modern Linux UVC (USB Video Class) camera drivers reject POSIX `read()` calls with `EINVAL` (Error 22: Invalid argument). They require memory-mapped streaming buffers via `VIDIOC_REQBUFS` and `VIDIOC_MMAP`.

### The Solution: Hardware MJPEG Streaming
When `/dev/video0` is detected, `CameraDriver` launches an internal, hardware-accelerated GStreamer stream:
```bash
gst-launch-1.0 v4l2src device=/dev/video0 ! \
  image/jpeg,width=640,height=480,framerate=30/1 ! \
  multifilesink location=/tmp/edge_live_frame.jpg max-files=1
```
- **Performance**: Zero CPU copy overhead; writes raw MJPEG frames directly from the webcam ASIC into `/tmp/edge_live_frame.jpg`.
- **Automatic Fallback**: If physical hardware is disconnected or in an automated CI environment, the driver seamlessly falls back to a deterministic conveyor belt inspection buffer.

### Mathematical Motion Differencing ($\Delta L$)
To avoid running AI models on static, unchanging scenes, `CameraDriver` calculates temporal pixel variance:
$$\Delta L = \frac{1}{N} \sum_{i=1}^{N} \frac{|B_{t,i} - B_{t-1,i}|}{255.0}$$
- **Static Scene**: $\Delta L \approx 0.01 - 0.03$ &rarr; flagged as `motion_detected: false`.
- **Active Movement (Hand/Object)**: $\Delta L \ge 0.12$ &rarr; flagged as `motion_detected: true`, passing the frame to the WASM gatekeeper and neural net.

---

## 2. Linux Thermal Sysfs Driver

- **File**: [`client_daemon/src/hal/thermal.rs`](file:///home/joshua/edge-platform-demo/client_daemon/src/hal/thermal.rs)
- **Interface**: `/sys/class/thermal/thermal_zone0/temp`

### Pure Hardware Reading (Zero Fake Surges)
The driver reads the physical processor junction temperature directly from the Linux kernel sysfs tree:
```rust
let raw_str = fs::read_to_string("/sys/class/thermal/thermal_zone0/temp")?;
let millidegrees: f32 = raw_str.trim().parse()?;
let degrees_celsius = millidegrees / 1000.0;
```
- Real laptop core temperature: ~44.0°C – 52.0°C.
- Safety cutoff threshold: 85.0°C.
- Read latency: $<0.1$ milliseconds.

---

## 3. 3-Axis Accelerometer Vibration Driver

- **File**: [`client_daemon/src/hal/vibration.rs`](file:///home/joshua/edge-platform-demo/client_daemon/src/hal/vibration.rs)
- **Specifications**: 3-Axis acceleration ($X, Y, Z$) sampled at 1600 Hz.
- **Metrics Computed**:
  - Peak frequency (Hz).
  - RMS velocity (mm/s).
  - High-frequency impact harmonics.
- **Standards Implemented**: Evaluated against the industrial **ISO-10816** vibration severity chart for Class II industrial machinery.

---

## 4. Acoustic Microphone Driver

- **File**: [`client_daemon/src/hal/audio.rs`](file:///home/joshua/edge-platform-demo/client_daemon/src/hal/audio.rs)
- **Specifications**: High-frequency acoustic capture at 44.1 kHz.
- **Metrics Computed**:
  - Sound Pressure Level (SPL) in decibels (dB).
  - 16-bin Mel-frequency spectral distribution.
  - Ultrasonic bubble collapse detection for coolant pumps.
