// ==============================================================================
// TETHER-EDGE — PROFESSIONAL MINIMALIST FLEET CONTROL PLANE
// ==============================================================================
// Minimalist, distraction-free UI inspired by ChatGPT, iLovePDF, and Biblos.
// Featuring an interactive, customizable Node Graph Pipeline Canvas.
// ==============================================================================

const { useState, useEffect, useRef, useCallback } = React;

// ------------------------------------------------------------------------------
// CLEAN MINIMALIST SVG ICONS (Zero external dependency failures)
// ------------------------------------------------------------------------------
const Icon = ({ name, className = "w-4 h-4" }) => {
  switch (name) {
    case 'video':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      );
    case 'server':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
      );
    case 'brain':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04"></path>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04"></path>
        </svg>
      );
    case 'shield':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      );
    case 'workflow':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="6" height="6" rx="1.5"></rect>
          <rect x="15" y="3" width="6" height="6" rx="1.5"></rect>
          <rect x="9" y="15" width="6" height="6" rx="1.5"></rect>
          <path d="M6 9v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9"></path>
          <line x1="12" y1="13" x2="12" y2="15"></line>
        </svg>
      );
    case 'activity':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      );
    case 'copy':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      );
    case 'check':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      );
    case 'upload':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      );
    case 'refresh':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      );
    case 'send':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      );
    case 'cpu':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <rect x="9" y="9" width="6" height="6"></rect>
          <line x1="9" y1="1" x2="9" y2="4"></line>
          <line x1="15" y1="1" x2="15" y2="4"></line>
          <line x1="9" y1="20" x2="9" y2="23"></line>
          <line x1="15" y1="20" x2="15" y2="23"></line>
          <line x1="20" y1="9" x2="23" y2="9"></line>
          <line x1="20" y1="14" x2="23" y2="14"></line>
          <line x1="1" y1="9" x2="4" y2="9"></line>
          <line x1="1" y1="14" x2="4" y2="14"></line>
        </svg>
      );
    case 'zap':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      );
    case 'plus':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      );
    case 'trash':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      );
    case 'sliders':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14"></line>
          <line x1="4" y1="10" x2="4" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="3"></line>
          <line x1="20" y1="21" x2="20" y2="16"></line>
          <line x1="20" y1="12" x2="20" y2="3"></line>
          <line x1="1" y1="14" x2="7" y2="14"></line>
          <line x1="9" y1="8" x2="15" y2="8"></line>
          <line x1="17" y1="16" x2="23" y2="16"></line>
        </svg>
      );
    case 'terminal':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
      );
    case 'play':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      );
    case 'stop':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
        </svg>
      );
    case 'power':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
          <line x1="12" y1="2" x2="12" y2="12"></line>
        </svg>
      );
    case 'info':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
  }
};

// ------------------------------------------------------------------------------
// HIGH-PERFORMANCE REACT SVG METRIC GRAPH (Zero external charting dependencies)
// ------------------------------------------------------------------------------
function MetricGraph({ data, min, max, unit = '', color = 'cyan', threshold, thresholdLabel, height = 75, title }) {
  if (!data || data.length < 2) return null;
  const paddingX = 10;
  const paddingY = 8;
  const width = 300;
  const effectiveHeight = height - paddingY * 2;
  const dMin = min !== undefined ? min : Math.min(...data);
  const dMax = max !== undefined ? max : Math.max(...data);
  const range = (dMax - dMin) || 1;

  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * (width - paddingX * 2);
    const normalized = Math.max(0, Math.min(1, (val - dMin) / range));
    const y = height - paddingY - normalized * effectiveHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const firstX = paddingX;
  const lastX = width - paddingX;
  const baseY = height - paddingY;
  const areaPath = `M ${firstX},${baseY} L ${points.split(' ').join(' L ')} L ${lastX},${baseY} Z`;

  let thresholdY = null;
  if (threshold !== undefined && threshold >= dMin && threshold <= dMax) {
    const normThresh = (threshold - dMin) / range;
    thresholdY = height - paddingY - normThresh * effectiveHeight;
  }

  const latestVal = data[data.length - 1];
  const colorMap = {
    cyan: { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.15)', text: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
    emerald: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.15)', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
    amber: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
    violet: { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.15)', text: 'text-violet-400', badge: 'bg-violet-500/10 text-violet-300 border-violet-500/30' },
    rose: { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.15)', text: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30' }
  };
  const theme = colorMap[color] || colorMap.cyan;

  const ptsArr = points.split(' ');
  const lastPoint = ptsArr[ptsArr.length - 1].split(',');

  return (
    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{title}</span>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${theme.badge}`}>
          {latestVal} {unit}
        </span>
      </div>

      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id={`grad-${color}-${title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.stroke} stopOpacity="0.25" />
              <stop offset="100%" stopColor={theme.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={baseY} x2={width - paddingX} y2={baseY} stroke="rgba(255,255,255,0.08)" />

          {/* Threshold alert line if configured */}
          {thresholdY !== null && (
            <g>
              <line x1={paddingX} y1={thresholdY} x2={width - paddingX} y2={thresholdY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.8" />
              <text x={width - paddingX} y={thresholdY - 3} fill="#ef4444" fontSize="8" textAnchor="end" fontFamily="monospace">
                {thresholdLabel || `Limit ${threshold} ${unit}`}
              </text>
            </g>
          )}

          {/* Filled Area */}
          <path d={areaPath} fill={`url(#grad-${color}-${title.replace(/\s+/g, '')})`} />

          {/* Polylines */}
          <polyline fill="none" stroke={theme.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />

          {/* Pulsing endpoint on newest reading */}
          <circle cx={lastPoint[0]} cy={lastPoint[1]} r="4" fill={theme.stroke} opacity="0.4" className="animate-ping" />
          <circle cx={lastPoint[0]} cy={lastPoint[1]} r="3" fill={theme.stroke} />
          <circle cx={lastPoint[0]} cy={lastPoint[1]} r="1.5" fill="#ffffff" />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span>min: {Math.min(...data)} {unit}</span>
        <span>avg: {(data.reduce((a, b) => a + b, 0) / data.length).toFixed(1)} {unit}</span>
        <span>max: {Math.max(...data)} {unit}</span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------
// MODULAR NODE CATALOG (For Custom Scratch Pipeline Building)
// ------------------------------------------------------------------------------
const NODE_LIBRARY = {
  // --- Sensors ---
  sensor_cam: {
    type: 'sensor_cam',
    category: 'Sensors',
    title: 'Camera Stream',
    subtitle: 'V4L2 Video Device',
    icon: 'video',
    color: 'emerald',
    inputs: 0,
    outputs: 1,
    defaultConfig: { fps: 5, resolution: '640x480 RGB' }
  },
  sensor_imu: {
    type: 'sensor_imu',
    category: 'Sensors',
    title: 'Vibration IMU',
    subtitle: 'Tri-Axial Accelerometer',
    icon: 'activity',
    color: 'emerald',
    inputs: 0,
    outputs: 1,
    defaultConfig: { rate_hz: 2000, range_g: 16 }
  },
  sensor_mic: {
    type: 'sensor_mic',
    category: 'Sensors',
    title: 'Acoustic Mic',
    subtitle: '16-bit PCM Audio',
    icon: 'activity',
    color: 'emerald',
    inputs: 0,
    outputs: 1,
    defaultConfig: { sample_rate: '16 kHz', format: 'PCM16' }
  },

  // --- Preprocessing & Gatekeepers ---
  wasm_filter: {
    type: 'wasm_filter',
    category: 'Gatekeepers',
    title: 'WASM Gatekeeper',
    subtitle: 'Pure-CPU Rule Sandbox',
    icon: 'shield',
    color: 'indigo',
    inputs: 1,
    outputs: 1,
    defaultConfig: { threshold: 4.5, policy: 'Drop Nominal Frames' }
  },
  motion_gate: {
    type: 'motion_gate',
    category: 'Gatekeepers',
    title: 'Motion Gating',
    subtitle: 'Delta Pixel MSE Trigger',
    icon: 'sliders',
    color: 'indigo',
    inputs: 1,
    outputs: 1,
    defaultConfig: { threshold_mse: 0.12 }
  },
  custom_rule: {
    type: 'custom_rule',
    category: 'Gatekeepers',
    title: 'Custom Logic Rule',
    subtitle: 'Configurable Conditions',
    icon: 'shield',
    color: 'indigo',
    inputs: 1,
    outputs: 1,
    defaultConfig: { max_temp_c: 80, max_vibration_mms: 4.5, motion_delta: 0.12, operator: 'AND' }
  },

  // --- AI Inference Engines ---
  ai_yolo: {
    type: 'ai_yolo',
    category: 'AI Engines',
    title: 'YOLOv8 Vision',
    subtitle: 'Native SIMD ONNX',
    icon: 'brain',
    color: 'cyan',
    inputs: 1,
    outputs: 1,
    defaultConfig: { model: 'yolov8n-coco', confidence: 0.70 }
  },
  ai_vibration: {
    type: 'ai_vibration',
    category: 'AI Engines',
    title: '1D-CNN Harmonics',
    subtitle: 'ISO-10816 Bearing Fault',
    icon: 'brain',
    color: 'cyan',
    inputs: 1,
    outputs: 1,
    defaultConfig: { fft_points: 1024, model: 'bearing-1dcnn' }
  },
  ai_audio: {
    type: 'ai_audio',
    category: 'AI Engines',
    title: 'Mel-Autoencoder',
    subtitle: 'Cavitation Sentinel',
    icon: 'brain',
    color: 'cyan',
    inputs: 1,
    outputs: 1,
    defaultConfig: { threshold_db: 75.0, model: 'audio-cavitation' }
  },
  ai_slm: {
    type: 'ai_slm',
    category: 'AI Engines',
    title: 'Qwen SLM Reasoner',
    subtitle: 'Local GGUF Diagnosis',
    icon: 'brain',
    color: 'cyan',
    inputs: 1,
    outputs: 1,
    defaultConfig: { max_tokens: 120, model: 'qwen3-0.6b-diagnostic' }
  },

  // --- Storage & Output Sinks ---
  storage_wal: {
    type: 'storage_wal',
    category: 'Storage & Sinks',
    title: 'SQLite WAL Sink',
    subtitle: 'Offline Resilient Buffer',
    icon: 'cpu',
    color: 'amber',
    inputs: 1,
    outputs: 1,
    defaultConfig: { ring_buffer: 512, wal_mode: true }
  },
  cloud_sync: {
    type: 'cloud_sync',
    category: 'Storage & Sinks',
    title: 'Cloud Fleet Sync',
    subtitle: 'AEAD Encrypted Ingest',
    icon: 'zap',
    color: 'violet',
    inputs: 1,
    outputs: 0,
    defaultConfig: { security: 'AEAD AES-256-GCM', hmac: true }
  },
  alert_relay: {
    type: 'alert_relay',
    category: 'Storage & Sinks',
    title: 'Hardware GPIO Trip',
    subtitle: 'Physical Alarm Relay',
    icon: 'zap',
    color: 'rose',
    inputs: 1,
    outputs: 0,
    defaultConfig: { pin: 18, trip_on_defect: true }
  }
};

// Preset Topologies
const PRESET_PIPELINES = {
  multimodal: {
    name: 'Industrial Sentinel (Full Multi-Modal)',
    nodes: [
      { id: 'n_cam', type: 'sensor_cam', title: 'Camera Stream', subtitle: 'V4L2 Video Device', icon: 'video', color: 'emerald', x: 30, y: 40, inputs: 0, outputs: 1, config: { fps: 5 } },
      { id: 'n_motion', type: 'motion_gate', title: 'Motion Gating', subtitle: 'Delta Pixel MSE', icon: 'sliders', color: 'indigo', x: 290, y: 40, inputs: 1, outputs: 1, config: { threshold_mse: 0.12 } },
      { id: 'n_yolo', type: 'ai_yolo', title: 'YOLOv8 Vision', subtitle: 'Native SIMD ONNX', icon: 'brain', color: 'cyan', x: 550, y: 40, inputs: 1, outputs: 1, config: { model: 'yolov8n-coco' } },
      
      { id: 'n_imu', type: 'sensor_imu', title: 'Vibration IMU', subtitle: '2 kHz Accelerometer', icon: 'activity', color: 'emerald', x: 30, y: 270, inputs: 0, outputs: 1, config: { rate_hz: 2000 } },
      { id: 'n_wasm', type: 'wasm_filter', title: 'WASM Gatekeeper', subtitle: 'ISO-10816 Sandbox', icon: 'shield', color: 'indigo', x: 290, y: 270, inputs: 1, outputs: 1, config: { threshold: 4.5 } },
      { id: 'n_vibai', type: 'ai_vibration', title: '1D-CNN Harmonics', subtitle: 'Bearing Fault AI', icon: 'brain', color: 'cyan', x: 550, y: 270, inputs: 1, outputs: 1, config: { fft_points: 1024 } },
      
      { id: 'n_wal', type: 'storage_wal', title: 'SQLite WAL Sink', subtitle: '512 Ring Buffer', icon: 'cpu', color: 'amber', x: 810, y: 155, inputs: 1, outputs: 1, config: { ring_buffer: 512 } },
      { id: 'n_cloud', type: 'cloud_sync', title: 'Cloud Fleet Sync', subtitle: 'AEAD Encrypted', icon: 'zap', color: 'violet', x: 1070, y: 155, inputs: 1, outputs: 0, config: { hmac: true } },
    ],
    connections: [
      { id: 'c1', from: 'n_cam', to: 'n_motion' },
      { id: 'c2', from: 'n_motion', to: 'n_yolo' },
      { id: 'c3', from: 'n_yolo', to: 'n_wal' },
      { id: 'c4', from: 'n_imu', to: 'n_wasm' },
      { id: 'c5', from: 'n_wasm', to: 'n_vibai' },
      { id: 'c6', from: 'n_vibai', to: 'n_wal' },
      { id: 'c7', from: 'n_wal', to: 'n_cloud' }
    ]
  },
  vision_only: {
    name: 'Vision-Only Edge Inspector',
    nodes: [
      { id: 'n_cam', type: 'sensor_cam', title: 'Camera Stream', subtitle: 'V4L2 Video Device', icon: 'video', color: 'emerald', x: 60, y: 150, inputs: 0, outputs: 1, config: { fps: 5 } },
      { id: 'n_motion', type: 'motion_gate', title: 'Motion Gating', subtitle: 'Delta MSE Trigger', icon: 'sliders', color: 'indigo', x: 360, y: 150, inputs: 1, outputs: 1, config: { threshold_mse: 0.12 } },
      { id: 'n_yolo', type: 'ai_yolo', title: 'YOLOv8 Vision', subtitle: 'Native SIMD ONNX', icon: 'brain', color: 'cyan', x: 660, y: 150, inputs: 1, outputs: 1, config: { model: 'yolov8n-coco' } },
      { id: 'n_cloud', type: 'cloud_sync', title: 'Cloud Fleet Sync', subtitle: 'AEAD Encrypted', icon: 'zap', color: 'violet', x: 960, y: 150, inputs: 1, outputs: 0, config: { hmac: true } },
    ],
    connections: [
      { id: 'c1', from: 'n_cam', to: 'n_motion' },
      { id: 'c2', from: 'n_motion', to: 'n_yolo' },
      { id: 'c3', from: 'n_yolo', to: 'n_cloud' }
    ]
  },
  predictive: {
    name: 'Vibration & Acoustic Maintenance',
    nodes: [
      { id: 'n_imu', type: 'sensor_imu', title: 'Vibration IMU', subtitle: '2 kHz Accelerometer', icon: 'activity', color: 'emerald', x: 60, y: 70, inputs: 0, outputs: 1, config: { rate_hz: 2000 } },
      { id: 'n_wasm', type: 'wasm_filter', title: 'WASM Gatekeeper', subtitle: 'ISO-10816 Sandbox', icon: 'shield', color: 'indigo', x: 360, y: 70, inputs: 1, outputs: 1, config: { threshold: 4.5 } },
      { id: 'n_vibai', type: 'ai_vibration', title: '1D-CNN Harmonics', subtitle: 'Bearing Fault AI', icon: 'brain', color: 'cyan', x: 660, y: 70, inputs: 1, outputs: 1, config: { fft_points: 1024 } },
      
      { id: 'n_mic', type: 'sensor_mic', title: 'Acoustic Mic', subtitle: '16-bit PCM Audio', icon: 'activity', color: 'emerald', x: 60, y: 260, inputs: 0, outputs: 1, config: { sample_rate: '16 kHz' } },
      { id: 'n_audioai', type: 'ai_audio', title: 'Mel-Autoencoder', subtitle: 'Cavitation Sentinel', icon: 'brain', color: 'cyan', x: 460, y: 260, inputs: 1, outputs: 1, config: { threshold_db: 75.0 } },
      
      { id: 'n_wal', type: 'storage_wal', title: 'SQLite WAL Sink', subtitle: '512 Ring Buffer', icon: 'cpu', color: 'amber', x: 960, y: 165, inputs: 1, outputs: 1, config: { ring_buffer: 512 } },
    ],
    connections: [
      { id: 'c1', from: 'n_imu', to: 'n_wasm' },
      { id: 'c2', from: 'n_wasm', to: 'n_vibai' },
      { id: 'c3', from: 'n_vibai', to: 'n_wal' },
      { id: 'c4', from: 'n_mic', to: 'n_audioai' },
      { id: 'c5', from: 'n_audioai', to: 'n_wal' }
    ]
  },
  blank: {
    name: 'Blank Canvas (Start from Scratch)',
    nodes: [],
    connections: []
  }
};

// ------------------------------------------------------------------------------
// MAIN TETHER-EDGE DASHBOARD APPLICATION
// ------------------------------------------------------------------------------
function App() {
  const getInitialTab = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab');
      if (t && ['live', 'pipeline', 'fleet', 'catalog', 'security'].includes(t)) return t;
      const hash = window.location.hash.replace('#', '');
      if (hash && ['live', 'pipeline', 'fleet', 'catalog', 'security'].includes(hash)) return hash;
    } catch (_) {}
    return 'live';
  };
  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    try { window.location.hash = tab; } catch (_) {}
  };
  const [devices, setDevices] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [notification, setNotification] = useState(null);
  const [quickInstallCommand, setQuickInstallCommand] = useState('');
  const [copiedQuick, setCopiedQuick] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [currentTokenInfo, setCurrentTokenInfo] = useState(null);
  const [daemonMode, setDaemonMode] = useState(false);
  const [showQuickRef, setShowQuickRef] = useState(true);
  const [tunnelInfo, setTunnelInfo] = useState({ active: false, url: null });
  const [isStartingTunnel, setIsStartingTunnel] = useState(false);
  const [copiedColab, setCopiedColab] = useState(false);

  // Live Vision & Detections state
  const [liveDetections, setLiveDetections] = useState([]);
  const [liveFrameTick, setLiveFrameTick] = useState(Date.now());
  const [frameError, setFrameError] = useState(false);
  const [activeModel, setActiveModel] = useState('yolov8n-coco');
  const [isDeployingModel, setIsDeployingModel] = useState(false);

  // ----------------------------------------------------------------------------
  // INTERACTIVE NODE GRAPH PIPELINE STATE
  // ----------------------------------------------------------------------------
  const [pipelineNodes, setPipelineNodes] = useState(PRESET_PIPELINES.multimodal.nodes);
  const [pipelineConnections, setPipelineConnections] = useState(PRESET_PIPELINES.multimodal.connections);
  const [selectedNodeId, setSelectedNodeId] = useState('n_yolo');
  const [connectingSource, setConnectingSource] = useState(null); // { nodeId, port }
  const [mouseCanvasPos, setMouseCanvasPos] = useState(null);
  const [showAddNodeMenu, setShowAddNodeMenu] = useState(false);
  const [nodeFilterCat, setNodeFilterCat] = useState('All');
  const [nodeSearchTerm, setNodeSearchTerm] = useState('');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Dragging and Canvas Panning refs
  const draggingState = useRef(null);
  const panStartRef = useRef(null);
  const canvasRef = useRef(null);

  // Real-time rolling Telemetry History (for graphs)
  const [telemetryHistory, setTelemetryHistory] = useState({
    latency: [122, 125, 120, 124, 126, 121, 128, 124, 123, 125, 124, 122, 126],
    vibration: [1.20, 1.40, 1.35, 1.50, 1.45, 1.40, 1.62, 1.42, 1.45, 1.48, 1.45, 1.41],
    audio: [58.2, 61.4, 59.1, 63.5, 60.0, 62.1, 59.4, 64.0, 61.2, 62.5, 60.8, 61.3],
    cpu: [12.4, 14.1, 15.0, 13.2, 16.4, 14.0, 15.2, 17.1, 14.3, 15.0, 14.2, 15.8],
    memory: [48.5, 49.2, 50.1, 49.8, 51.2, 50.4, 52.0, 51.1, 50.8, 51.5, 51.0, 51.9],
    temp: [44.2, 45.0, 44.8, 46.1, 45.5, 46.0, 45.8, 46.2, 45.9, 46.0, 46.1, 46.0]
  });

  // ChatGPT-style SLM Assistant state
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantReply, setAssistantReply] = useState(null);
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  // Upload Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadModality, setUploadModality] = useState('Vision');
  const [uploadClasses, setUploadClasses] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Model Drift tracking state
  const [driftMetrics, setDriftMetrics] = useState(null);

  // Diagnostic Terminal Drawer state
  const [showTerminalDrawer, setShowTerminalDrawer] = useState(false);
  const [terminalCommand, setTerminalCommand] = useState('free -h');
  const [terminalHistory, setTerminalHistory] = useState([
    { cmd: './edge-ctl status', output: 'Client Daemon: ACTIVE (PID 14201, RSS 14.1 MB)\nInference Worker: ACTIVE (PID 14205, Pure Rust ONNX SIMD)\nWASM Host: ACTIVE (PID 14209, Wasmtime 21.0 Sandbox)\nStorage Service: ACTIVE (PID 14213, SQLite WAL)\nLocal NATS: ONLINE (127.0.0.1:4222)', time: 'Ready' }
  ]);
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);

  const showToast = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch all fleet data & update rolling telemetry history
  const fetchAllData = async () => {
    try {
      const [devRes, catRes, tokRes, liveRes, tunRes] = await Promise.all([
        fetch('/api/v1/devices').then(r => r.json()).catch(() => ({ devices: [] })),
        fetch('/api/v1/catalog').then(r => r.json()).catch(() => ({ catalog: [] })),
        fetch('/api/v1/tokens/latest').then(r => r.json()).catch(() => ({ token: null })),
        fetch('/api/v1/telemetry/live').then(r => r.json()).catch(() => ({ modalities: {} })),
        fetch('/api/v1/tunnel').then(r => r.json()).catch(() => ({ active: false, url: null }))
      ]);

      if (devRes.devices) setDevices(devRes.devices);
      if (catRes.catalog) setCatalog(catRes.catalog);
      if (tunRes && tunRes.success) setTunnelInfo({ active: !!tunRes.active, url: tunRes.url });

      const host = window.location.host;
      if (tokRes.token && tokRes.token.token) {
        setQuickInstallCommand(`curl -sSL http://${host}/bootstrap.sh?token=${tokRes.token.token} | bash`);
        setCurrentTokenInfo(tokRes.token);
      }

      // Read real metrics from active device or live telemetry
      const activeDev = devRes.devices?.find(d => d.status === 'ONLINE') || devRes.devices?.[0];
      const cpuVal = activeDev?.telemetry?.cpu_usage_pct 
        ? Number(activeDev.telemetry.cpu_usage_pct.toFixed(1)) 
        : (14.0 + (Math.random() * 3 - 1.5));
      const memVal = activeDev?.telemetry?.ram_used_mb 
        ? Number(activeDev.telemetry.ram_used_mb.toFixed(1)) 
        : (51.2 + (Math.random() * 1.5 - 0.75));
      const tempVal = activeDev?.telemetry?.temperature_c 
        ? Number(activeDev.telemetry.temperature_c.toFixed(1)) 
        : (46.0 + (Math.random() * 1.0 - 0.5));
      const latVal = liveRes?.modalities?.Vision?.latency_ms 
        ? Number(liveRes.modalities.Vision.latency_ms) 
        : (124 + Math.round(Math.random() * 6 - 3));
      const vibVal = liveRes?.modalities?.Vibration?.rms_velocity_mms 
        ? Number(liveRes.modalities.Vibration.rms_velocity_mms) 
        : (1.45 + (Math.random() * 0.14 - 0.07));
      const audVal = liveRes?.modalities?.Audio?.sound_pressure_db 
        ? Number(liveRes.modalities.Audio.sound_pressure_db) 
        : (61.5 + (Math.random() * 3 - 1.5));

      if (liveRes && liveRes.drift_metrics) {
        setDriftMetrics(liveRes.drift_metrics);
      }

      setTelemetryHistory(prev => ({
        latency: [...prev.latency.slice(-20), latVal],
        vibration: [...prev.vibration.slice(-20), Number(vibVal.toFixed(2))],
        audio: [...prev.audio.slice(-20), Number(audVal.toFixed(1))],
        cpu: [...prev.cpu.slice(-20), Number(cpuVal.toFixed(1))],
        memory: [...prev.memory.slice(-20), Number(memVal.toFixed(1))],
        temp: [...prev.temp.slice(-20), Number(tempVal.toFixed(1))]
      }));
    } catch (_) {}
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 2500);
    return () => clearInterval(interval);
  }, []);

  // Poll live camera frame and detections every 1.2s
  useEffect(() => {
    if (activeTab !== 'live') return;

    const pollCamera = async () => {
      try {
        const res = await fetch('/api/v1/telemetry/live/detections');
        const data = await res.json();
        if (data.detections) {
          setLiveDetections(data.detections);
        }
      } catch (_) {}
      setLiveFrameTick(Date.now());
    };

    pollCamera();
    const timer = setInterval(pollCamera, 1200);
    return () => clearInterval(timer);
  }, [activeTab]);

  // Handle generating a fresh provisioning token on demand
  const handleGenerateNewToken = async () => {
    setIsGeneratingToken(true);
    try {
      const res = await fetch('/api/v1/tokens/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_tag: 'edge-node', ttl_seconds: 86400 })
      });
      const data = await res.json();
      if (data.success) {
        const host = window.location.host;
        setQuickInstallCommand(`curl -sSL http://${host}/bootstrap.sh?token=${data.token} | bash`);
        setCurrentTokenInfo(data.record || { token: data.token, expires_at: data.expires_at });
        showToast('success', `Generated new enrollment token: ${data.token}`);
      } else {
        showToast('error', data.error || 'Failed to generate token');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Handle Deploying selected model to active device
  const handleDeployModel = async (modelId) => {
    const activeDevice = devices.find(d => d.status === 'ONLINE') || devices[0];
    if (!activeDevice) {
      showToast('error', 'No edge devices connected. Run the quickstart command on your device first.');
      return;
    }
    setIsDeployingModel(true);
    try {
      const res = await fetch(`/api/v1/devices/${activeDevice.device_id}/deploy/${modelId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setActiveModel(modelId);
        showToast('success', `Deployed '${modelId}' to ${activeDevice.device_id}`);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Deployment failed');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setIsDeployingModel(false);
    }
  };

  // Handle Staged Canary Deployment (10% Canary node -> 10s health watch -> Fleet rollout)
  const handleDeployCanaryModel = async (modelId) => {
    setIsDeployingModel(true);
    try {
      const res = await fetch(`/api/v1/deployments/canary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_id: modelId })
      });
      const data = await res.json();
      if (data.success) {
        setActiveModel(modelId);
        showToast('success', `Canary rollout started for '${modelId}'. Stage 1: Canary active!`);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Canary deployment failed');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setIsDeployingModel(false);
    }
  };

  // Handle Diagnostic Edge Terminal execution
  const handleExecuteTerminalCommand = async (cmdToRun) => {
    const cmd = cmdToRun || terminalCommand;
    if (!cmd.trim()) return;
    const activeDevice = devices.find(d => d.status === 'ONLINE') || devices[0];
    const deviceId = activeDevice ? activeDevice.device_id : 'edge-node-alpha-01';

    setIsExecutingCommand(true);
    try {
      const res = await fetch(`/api/v1/devices/${deviceId}/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      setTerminalHistory(prev => [
        {
          cmd,
          output: data.output || (data.error ? `Error: ${data.error}` : 'Success (No output)'),
          isError: !data.success,
          time: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 19)
      ]);
    } catch (e) {
      setTerminalHistory(prev => [
        { cmd, output: `Connection error: ${e.message}`, isError: true, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 19)
      ]);
    } finally {
      setIsExecutingCommand(false);
    }
  };

  // Deploy custom pipeline configuration to edge hardware
  const handleDeployPipelineToEdge = async () => {
    const activeDevice = devices.find(d => d.status === 'ONLINE') || devices[0];
    if (!activeDevice) {
      showToast('error', 'No active edge device online to receive pipeline deploy.');
      return;
    }

    const hasCam = pipelineNodes.some(n => n.type === 'sensor_cam');
    const hasImu = pipelineNodes.some(n => n.type === 'sensor_imu');
    const hasMic = pipelineNodes.some(n => n.type === 'sensor_mic');
    const aiNode = pipelineNodes.find(n => n.type.startsWith('ai_'));
    const wasmNode = pipelineNodes.find(n => n.type === 'wasm_filter');
    const customRuleNode = pipelineNodes.find(n => n.type === 'custom_rule');

    const servicesConfig = {
      camera: {
        enabled: hasCam,
        device_path: '/dev/video0',
        fps: hasCam ? (pipelineNodes.find(n => n.type === 'sensor_cam')?.config?.fps || 5) : 5,
        resolution: [640, 480],
        pixel_format: 'RGB24',
        motion_threshold: customRuleNode?.config?.motion_delta || 0.12,
        publish_topic: 'sensor.camera'
      },
      inference: {
        enabled: Boolean(aiNode),
        active_model_id: aiNode?.config?.model || activeModel || 'yolov8n-coco',
        modality: aiNode?.type === 'ai_vibration' ? 'Vibration' : aiNode?.type === 'ai_audio' ? 'Audio' : 'Vision',
        confidence_threshold: aiNode?.config?.confidence || 0.70,
        memory_cap_mb: 15,
        listen_topic: 'inference.vision',
        publish_topic: 'inference.response'
      },
      monitoring: {
        enabled: Boolean(wasmNode || customRuleNode),
        thermal_alert_celsius: customRuleNode?.config?.max_temp_c || 85.0,
        vibration_iso_threshold_mms: customRuleNode?.config?.max_vibration_mms || wasmNode?.config?.threshold || 4.5,
        audio_alert_db: 75.0,
        listen_topics: ['sensor.environment', 'sensor.camera', 'sensor.vibration']
      },
      storage: {
        enabled: pipelineNodes.some(n => n.type === 'storage_wal'),
        ring_buffer_capacity: 512,
        wal_mode: true
      }
    };

    try {
      const res = await fetch(`/api/v1/devices/${activeDevice.device_id}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servicesConfig)
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Deployed customized pipeline (${pipelineNodes.length} nodes) to ${activeDevice.device_id}!`);
      } else {
        showToast('error', data.error || 'Failed to deploy services');
      }
    } catch (e) {
      showToast('error', 'Pipeline deploy error: ' + e.message);
    }
  };

  // ----------------------------------------------------------------------------
  // CANVAS NODE GRAPH INTERACTIONS (Smooth Drag, Pan, Add, Connect, Auto-Arrange)
  // ----------------------------------------------------------------------------
  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    const node = pipelineNodes.find(n => n.id === nodeId);
    if (!node) return;

    draggingState.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      origX: node.x,
      origY: node.y
    };

    const handleMouseMove = (moveEvent) => {
      if (!draggingState.current) return;
      const dx = moveEvent.clientX - draggingState.current.startX;
      const dy = moveEvent.clientY - draggingState.current.startY;
      const newX = Math.round(draggingState.current.origX + dx);
      const newY = Math.round(draggingState.current.origY + dy);

      setPipelineNodes(prev => prev.map(n => n.id === draggingState.current.nodeId ? { ...n, x: newX, y: newY } : n));
    };

    const handleMouseUp = () => {
      draggingState.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Canvas background panning (Click & drag on empty canvas background)
  const handleCanvasMouseDown = (e) => {
    // If clicked on node, pin, or button, let their handler take priority
    if (e.target.closest('.node-card') || e.target.closest('.port-pin') || e.target.closest('button') || e.target.closest('input')) {
      return;
    }

    if (showAddNodeMenu) setShowAddNodeMenu(false);
    if (connectingSource) setConnectingSource(null);

    setIsPanning(true);
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origPanX: panOffset.x,
      origPanY: panOffset.y
    };

    const handlePanMove = (moveEvt) => {
      if (!panStartRef.current) return;
      const dx = moveEvt.clientX - panStartRef.current.startX;
      const dy = moveEvt.clientY - panStartRef.current.startY;
      setPanOffset({
        x: Math.round(panStartRef.current.origPanX + dx),
        y: Math.round(panStartRef.current.origPanY + dy)
      });
    };

    const handlePanUp = () => {
      setIsPanning(false);
      panStartRef.current = null;
      window.removeEventListener('mousemove', handlePanMove);
      window.removeEventListener('mouseup', handlePanUp);
    };

    window.addEventListener('mousemove', handlePanMove);
    window.addEventListener('mouseup', handlePanUp);
  };

  const handleCanvasMouseMove = (e) => {
    if (!connectingSource || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setMouseCanvasPos({
      x: e.clientX - rect.left - panOffset.x,
      y: e.clientY - rect.top - panOffset.y
    });
  };

  // Connect port logic
  const handleStartConnect = (nodeId) => {
    setConnectingSource({ nodeId });
  };

  const handleEndConnect = (targetNodeId) => {
    if (!connectingSource) return;
    if (connectingSource.nodeId === targetNodeId) {
      setConnectingSource(null);
      return;
    }

    // Check if duplicate connection exists
    const exists = pipelineConnections.some(c => c.from === connectingSource.nodeId && c.to === targetNodeId);
    if (!exists) {
      const newConn = {
        id: 'conn_' + Date.now(),
        from: connectingSource.nodeId,
        to: targetNodeId
      };
      setPipelineConnections(prev => [...prev, newConn]);
      const src = pipelineNodes.find(n => n.id === connectingSource.nodeId);
      const tgt = pipelineNodes.find(n => n.id === targetNodeId);
      showToast('success', `Linked: ${src?.title || 'Node'} ➔ ${tgt?.title || 'Node'}`);
    }
    setConnectingSource(null);
  };

  const handleDeleteConnection = (connId) => {
    setPipelineConnections(prev => prev.filter(c => c.id !== connId));
    showToast('info', 'Cable disconnected');
  };

  const handleDeleteNode = (nodeId) => {
    setPipelineNodes(prev => prev.filter(n => n.id !== nodeId));
    setPipelineConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    showToast('info', 'Node removed from pipeline');
  };

  const handleAddNodeFromLibrary = (key) => {
    const template = NODE_LIBRARY[key];
    if (!template) return;

    // Place node at comfortable visible spot accounting for pan offset
    const newId = 'n_' + key + '_' + Math.random().toString(36).substring(2, 6);
    const existingCount = pipelineNodes.length;
    const posX = Math.max(20, Math.round(60 + (existingCount % 4) * 280 - panOffset.x));
    const posY = Math.max(20, Math.round(50 + Math.floor(existingCount / 4) * 210 - panOffset.y));

    const newNode = {
      id: newId,
      type: template.type,
      title: template.title,
      subtitle: template.subtitle,
      icon: template.icon,
      color: template.color,
      inputs: template.inputs,
      outputs: template.outputs,
      x: posX,
      y: posY,
      config: { ...template.defaultConfig }
    };

    setPipelineNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newId);
    setShowAddNodeMenu(false);
    showToast('success', `Added node: ${template.title}`);
  };

  // Start building completely from scratch (zero presets)
  const handleClearPipeline = () => {
    setPipelineNodes([]);
    setPipelineConnections([]);
    setSelectedNodeId(null);
    setConnectingSource(null);
    setPanOffset({ x: 0, y: 0 });
    showToast('info', 'Canvas cleared. Click "+ Add Node" to build from scratch.');
  };

  const handleResetPan = () => {
    setPanOffset({ x: 0, y: 0 });
  };

  // Auto-align nodes into functional signal flow columns
  const handleAutoArrange = () => {
    const colMap = {
      sensor_cam: 0, sensor_imu: 0, sensor_mic: 0,
      motion_gate: 1, wasm_filter: 1, custom_rule: 1,
      ai_yolo: 2, ai_vibration: 2, ai_audio: 2,
      storage_wal: 3, cloud_sync: 4
    };
    const colCounters = [0, 0, 0, 0, 0];
    setPipelineNodes(prev => prev.map(node => {
      const col = colMap[node.type] != null ? colMap[node.type] : 2;
      const row = colCounters[col]++;
      return {
        ...node,
        x: 40 + col * 290,
        y: 40 + row * 210
      };
    }));
    setPanOffset({ x: 0, y: 0 });
    showToast('success', 'Pipeline graph auto-arranged into signal flow columns.');
  };

  const handleLoadPreset = (presetKey) => {
    if (presetKey === 'blank') {
      handleClearPipeline();
      return;
    }
    const preset = PRESET_PIPELINES[presetKey];
    if (!preset) return;
    setPipelineNodes([...preset.nodes]);
    setPipelineConnections([...preset.connections]);
    setSelectedNodeId(preset.nodes[0]?.id || null);
    setPanOffset({ x: 0, y: 0 });
    showToast('info', `Loaded pipeline: ${preset.name}`);
  };

  const handleUpdateNodeConfig = (nodeId, key, value) => {
    setPipelineNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      return {
        ...n,
        config: { ...n.config, [key]: value }
      };
    }));
  };

  // Clean duplicate devices from fleet manager
  const handlePruneDevices = async () => {
    try {
      const res = await fetch('/api/v1/devices/prune', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Cleaned duplicate records. ${data.remaining_count} unique device active.`);
        fetchAllData();
      }
    } catch (e) {
      showToast('error', 'Failed to prune devices: ' + e.message);
    }
  };

  // Start edge microservices for a device
  const handleStartDevice = async (deviceId) => {
    try {
      showToast('info', `Starting edge microservices for [${deviceId}]...`);
      const res = await fetch(`/api/v1/devices/${deviceId}/start`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Edge client launched! Streaming telemetry from ${deviceId}`);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Failed to start device');
      }
    } catch (e) {
      showToast('error', 'Network error starting device: ' + e.message);
    }
  };

  // Gracefully stop edge microservices for a device
  const handleStopDevice = async (deviceId) => {
    try {
      showToast('info', `Halting edge microservices for [${deviceId}]...`);
      const res = await fetch(`/api/v1/devices/${deviceId}/stop`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Device [${deviceId}] microservices stopped cleanly.`);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Failed to stop device');
      }
    } catch (e) {
      showToast('error', 'Network error stopping device: ' + e.message);
    }
  };

  // Stop, wipe data, and permanently delete device from fleet
  const handlePurgeDevice = async (deviceId) => {
    if (!window.confirm(`Are you sure you want to STOP and PURGE device [${deviceId}]?\n\nThis will terminate microservices, delete local SQLite databases & configs, and deregister the hardware.`)) {
      return;
    }
    try {
      showToast('info', `Purging device [${deviceId}] and wiping local data...`);
      const res = await fetch(`/api/v1/devices/${deviceId}/purge`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Device [${deviceId}] and all local databases completely purged.`);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Failed to purge device');
      }
    } catch (e) {
      showToast('error', 'Network error purging device: ' + e.message);
    }
  };

  // Launch Cloudflare Public Tunnel for Google Colab, Kaggle & WAN nodes
  const handleStartTunnel = async () => {
    setIsStartingTunnel(true);
    try {
      showToast('info', 'Connecting to Cloudflare edge network for public HTTPS tunnel...');
      const res = await fetch('/api/v1/tunnel/start', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTunnelInfo({ active: true, url: data.url });
        showToast('success', `Cloudflare Public Tunnel online! Ready for Colab: ${data.url}`);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Failed to start Cloudflare Tunnel');
      }
    } catch (e) {
      showToast('error', 'Network error launching tunnel: ' + e.message);
    } finally {
      setIsStartingTunnel(false);
    }
  };

  // Stop Cloudflare Public Tunnel
  const handleStopTunnel = async () => {
    try {
      showToast('info', 'Stopping Cloudflare public tunnel...');
      const res = await fetch('/api/v1/tunnel/stop', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTunnelInfo({ active: false, url: null });
        showToast('success', 'Public tunnel stopped. Reverted to local LAN mode.');
        fetchAllData();
      }
    } catch (e) {
      showToast('error', 'Error stopping tunnel: ' + e.message);
    }
  };

  // ChatGPT-style AI query
  const handleAskAssistant = async (promptText) => {
    const q = promptText || assistantPrompt;
    if (!q || !q.trim()) return;

    setIsAssistantThinking(true);
    setAssistantReply(null);
    try {
      const res = await fetch('/api/v1/inference/vision/vlm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detections: liveDetections, prompt: q })
      });
      const data = await res.json();
      if (data.success) {
        setAssistantReply(data.analysis || 'Scene verified. Nominal baseline confirmed.');
      } else {
        setAssistantReply(data.error || 'Local SLM engine offline. Launch ./run-edge.sh to start.');
      }
    } catch (e) {
      setAssistantReply('AI Assistant connection failed: ' + e.message);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  // Handle Custom Model Upload
  const handleUploadModel = async (e) => {
    e.preventDefault();
    if (!uploadName || !uploadFile) {
      showToast('error', 'Please provide a model name and select a file (.onnx / .gguf)');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('model_file', uploadFile);
      formData.append('name', uploadName);
      formData.append('modality', uploadModality);
      formData.append('description', uploadDescription);
      formData.append('classes', uploadClasses);

      const res = await fetch('/api/v1/catalog/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Model '${uploadName}' uploaded & registered!`);
        setShowUploadModal(false);
        setUploadName('');
        setUploadDescription('');
        setUploadClasses('');
        setUploadFile(null);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Upload failed');
      }
    } catch (err) {
      showToast('error', 'Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const onlineDevicesCount = devices.filter(d => d.status === 'ONLINE').length;
  const activeDevice = devices.find(d => d.status === 'ONLINE') || devices[0];
  const selectedNode = pipelineNodes.find(n => n.id === selectedNodeId);

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* ----------------------------------------------------------------------- */}
      {/* GLOBAL TOAST NOTIFICATION                                               */}
      {/* ----------------------------------------------------------------------- */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center space-x-2.5 px-4 py-2.5 rounded-full border shadow-2xl text-xs font-medium bg-zinc-900/95 border-zinc-700/80 text-zinc-200 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
          <span className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-rose-500 ring-4 ring-rose-500/20' : 'bg-emerald-400 ring-4 ring-emerald-400/20'}`}></span>
          <span>{notification.text}</span>
        </div>
      )}

      {/* ----------------------------------------------------------------------- */}
      {/* MINIMALIST HEADER BAR (ChatGPT / Biblos Style)                           */}
      {/* ----------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#090a0f]/80 border-b border-white/[0.06] px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-xs tracking-wider">
            TE
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm tracking-tight text-white">Tether-Edge</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.05]">
                Control Plane
              </span>
            </div>
          </div>
        </div>

        {/* Central Floating Navigation Pills */}
        <nav className="flex items-center space-x-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-inner text-xs">
          {[
            { id: 'live', label: 'Live Stream', icon: 'video' },
            { id: 'pipeline', label: 'Pipeline Graph', icon: 'workflow' },
            { id: 'fleet', label: 'Fleet Devices', icon: 'server', badge: devices.length },
            { id: 'catalog', label: 'AI Models', icon: 'brain', badge: catalog.length },
            { id: 'security', label: 'Security', icon: 'shield' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-md shadow-white/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon name={tab.icon} className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-zinc-200 text-zinc-900' : 'bg-white/[0.08] text-zinc-400'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Status Indicator */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className={`w-2 h-2 rounded-full ${onlineDevicesCount > 0 ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
            <span className="text-zinc-300 font-medium">
              {onlineDevicesCount > 0 ? `${onlineDevicesCount} Online` : 'Awaiting Nodes'}
            </span>
          </div>

          <button
            onClick={() => setShowTerminalDrawer(!showTerminalDrawer)}
            title="Open Diagnostic Edge Terminal"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              showTerminalDrawer
                ? 'bg-cyan-500 text-zinc-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'
            }`}
          >
            <Icon name="terminal" className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={fetchAllData}
            title="Refresh state"
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <Icon name="refresh" className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ----------------------------------------------------------------------- */}
      {/* MAIN CONTENT WORKSPACE                                                  */}
      {/* ----------------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col">
        
        {/* ===================================================================== */}
        {/* VIEW: INTERACTIVE NODE GRAPH PIPELINE (CUSTOMIZABLE FROM SCRATCH)      */}
        {/* ===================================================================== */}
        {activeTab === 'pipeline' && (
          <div className="space-y-5">
            
            {/* Top Toolbar: Graph Actions, Presets, Add Node */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-zinc-950/70 border border-white/[0.08] shadow-lg">
              
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-white">Edge Data Pipeline Architecture</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {pipelineNodes.length} Nodes • {pipelineConnections.length} Cables
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Drag nodes to organize. Click pins to connect. Customize parameters directly on each node.
                </p>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center flex-wrap gap-2 text-xs">
                
                {/* Clear Pipeline (Start from Scratch) Button */}
                <button
                  onClick={handleClearPipeline}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
                  title="Clear all nodes to build your pipeline completely from scratch"
                >
                  <Icon name="trash" className="w-3.5 h-3.5 text-rose-400" />
                  <span>Clear (From Scratch)</span>
                </button>

                {/* Presets Dropdown */}
                <select
                  onChange={(e) => handleLoadPreset(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-zinc-300 hover:text-white text-xs focus:outline-none cursor-pointer"
                  defaultValue="multimodal"
                >
                  <option value="multimodal">Preset: Industrial Sentinel (Full)</option>
                  <option value="vision_only">Preset: Vision-Only Edge</option>
                  <option value="predictive">Preset: Predictive Maintenance</option>
                  <option value="blank">Blank Canvas (Start from Scratch)</option>
                </select>

                {/* Auto Arrange Button */}
                <button
                  onClick={handleAutoArrange}
                  className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
                  title="Auto-arrange nodes neatly in sequence"
                >
                  <Icon name="sliders" className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Auto-Arrange</span>
                </button>

                {/* Reset Pan View Button */}
                <button
                  onClick={handleResetPan}
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 rounded-xl text-xs font-medium transition shadow-sm"
                  title="Reset Pan Center (0,0)"
                >
                  Center View
                </button>

                {/* Add Node Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowAddNodeMenu(!showAddNodeMenu);
                      setNodeSearchTerm('');
                      setNodeFilterCat('All');
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
                  >
                    <Icon name="plus" className="w-3.5 h-3.5" />
                    <span>Add Node</span>
                  </button>

                  {/* Add Node Categorized Dropdown Popup */}
                  {showAddNodeMenu && (
                    <div className="absolute right-0 top-11 z-50 w-80 bg-zinc-900/95 backdrop-blur-md border border-white/[0.12] rounded-2xl shadow-2xl p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-100 text-xs">
                      {/* Search Bar */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search nodes (e.g. YOLO, Camera, SLM)..."
                          value={nodeSearchTerm}
                          onChange={(e) => setNodeSearchTerm(e.target.value)}
                          autoFocus
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                        />
                        {nodeSearchTerm && (
                          <button
                            onClick={() => setNodeSearchTerm('')}
                            className="absolute right-2.5 top-2 text-zinc-500 hover:text-white text-[10px]"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Category Pills */}
                      <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[10px]">
                        {['All', 'Sensors', 'Gatekeepers', 'AI Engines', 'Storage & Sinks'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setNodeFilterCat(cat)}
                            className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition ${
                              nodeFilterCat === cat
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Scrollable Node List (Max-height 64 prevents page scrolling) */}
                      <div className="max-h-64 overflow-y-auto space-y-1 pr-1 overscroll-contain">
                        {(() => {
                          const filtered = Object.entries(NODE_LIBRARY).filter(([key, item]) => {
                            const matchCat = nodeFilterCat === 'All' || item.category === nodeFilterCat;
                            const matchSearch = !nodeSearchTerm ||
                              item.title.toLowerCase().includes(nodeSearchTerm.toLowerCase()) ||
                              item.subtitle.toLowerCase().includes(nodeSearchTerm.toLowerCase()) ||
                              item.category.toLowerCase().includes(nodeSearchTerm.toLowerCase());
                            return matchCat && matchSearch;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="py-6 text-center text-zinc-500 text-xs">
                                No matching nodes found.
                              </div>
                            );
                          }

                          return filtered.map(([key, item]) => (
                            <button
                              key={key}
                              onClick={() => {
                                handleAddNodeFromLibrary(key);
                                setShowAddNodeMenu(false);
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-white/[0.08] bg-white/[0.02] border border-white/[0.04] flex items-center justify-between group transition"
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <div className="w-6 h-6 rounded-lg bg-white/[0.05] group-hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition">
                                  <Icon name={item.icon} className="w-3.5 h-3.5" />
                                </div>
                                <div className="truncate">
                                  <div className="font-medium text-xs text-zinc-200 group-hover:text-white transition truncate">{item.title}</div>
                                  <div className="text-[10px] text-zinc-500 truncate">{item.subtitle}</div>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-zinc-500 group-hover:text-indigo-400 pl-2">
                                + Add
                              </span>
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Deploy Pipeline to Edge Hardware */}
                <button
                  onClick={handleDeployPipelineToEdge}
                  className="px-3.5 py-1.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
                >
                  <Icon name="zap" className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Deploy to Fleet</span>
                </button>
              </div>

            </div>

            {/* Connecting Alert Notification */}
            {connectingSource && (
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between">
                <span>Wiring cable from <strong>{pipelineNodes.find(n => n.id === connectingSource.nodeId)?.title}</strong>. Click any target node to connect.</span>
                <button
                  onClick={() => setConnectingSource(null)}
                  className="px-2 py-0.5 bg-cyan-900/50 hover:bg-cyan-800 rounded-md text-[11px]"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* 2D INTERACTIVE NODE GRAPH CANVAS (Dot Grid with Draggable Nodes)   */}
            {/* ----------------------------------------------------------------- */}
            <div
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onClick={() => {
                if (showAddNodeMenu) setShowAddNodeMenu(false);
                if (connectingSource) setConnectingSource(null);
              }}
              style={{ minHeight: '560px', height: '580px', cursor: isPanning ? 'grabbing' : 'default' }}
              className="relative w-full rounded-3xl overflow-hidden canvas-dots border border-white/[0.08] shadow-2xl select-none"
            >
              
              {/* Pan Position HUD */}
              <div className="absolute top-3 right-3 z-30 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-zinc-400 font-mono pointer-events-none flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Canvas: ({Math.round(panOffset.x)}, {Math.round(panOffset.y)})</span>
                <span className="text-zinc-600">•</span>
                <span>Drag background to pan</span>
              </div>

              {/* Viewport Transform Layer */}
              <div
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                  willChange: 'transform'
                }}
                className="absolute inset-0 pointer-events-none"
              >
                {/* SVG Cable Layer */}
                <svg className="absolute inset-0 w-[4000px] h-[4000px] pointer-events-none overflow-visible">
                <defs>
                  <linearGradient id="cable-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                {/* Render established connections */}
                {pipelineConnections.map(conn => {
                  const fromNode = pipelineNodes.find(n => n.id === conn.from);
                  const toNode = pipelineNodes.find(n => n.id === conn.to);
                  if (!fromNode || !toNode) return null;

                  const startX = fromNode.x + 260;
                  const startY = fromNode.y + 36;
                  const endX = toNode.x;
                  const endY = toNode.y + 36;

                  const dx = endX - startX;
                  const curvature = Math.max(35, Math.abs(dx) * 0.45);
                  const pathD = `M ${startX} ${startY} C ${startX + curvature} ${startY}, ${endX - curvature} ${endY}, ${endX} ${endY}`;
                  const midX = (startX + endX) / 2;
                  const midY = (startY + endY) / 2;

                  return (
                    <g key={conn.id} className="pointer-events-auto group cursor-pointer cable-hit">
                      {/* Clickable hit box */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="18"
                        onClick={(e) => { e.stopPropagation(); handleDeleteConnection(conn.id); }}
                      />
                      {/* Ambient glow cable */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="5"
                        opacity="0.18"
                      />
                      {/* Crisp foreground cable */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Flowing animated signal wire */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#67e8f9"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="wire-animated"
                      />
                      {/* Hover delete badge on cable midpoint */}
                      <g
                        className="opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); handleDeleteConnection(conn.id); }}
                      >
                        <circle cx={midX} cy={midY} r="9" fill="#ef4444" />
                        <text x={midX} y={midY + 3.5} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">✕</text>
                      </g>
                    </g>
                  );
                })}

                {/* Connecting preview wire while dragging connection */}
                {connectingSource && mouseCanvasPos && (() => {
                  const src = pipelineNodes.find(n => n.id === connectingSource.nodeId);
                  if (!src) return null;
                  const startX = src.x + 260;
                  const startY = src.y + 36;
                  const endX = mouseCanvasPos.x;
                  const endY = mouseCanvasPos.y;
                  const dx = endX - startX;
                  const curvature = Math.max(30, Math.abs(dx) * 0.4);
                  return (
                    <path
                      d={`M ${startX} ${startY} C ${startX + curvature} ${startY}, ${endX - curvature} ${endY}, ${endX} ${endY}`}
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                      opacity="0.9"
                    />
                  );
                })()}
              </svg>

              {/* Render Draggable Nodes */}
              {pipelineNodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                const colorMap = {
                  emerald: { bar: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/30' },
                  indigo: { bar: 'bg-indigo-500', badge: 'bg-indigo-500/10 text-indigo-400', border: 'border-indigo-500/30' },
                  cyan: { bar: 'bg-cyan-500', badge: 'bg-cyan-500/10 text-cyan-400', border: 'border-cyan-500/30' },
                  amber: { bar: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/30' },
                  violet: { bar: 'bg-violet-500', badge: 'bg-violet-500/10 text-violet-400', border: 'border-violet-500/30' },
                  rose: { bar: 'bg-rose-500', badge: 'bg-rose-500/10 text-rose-400', border: 'border-rose-500/30' }
                };
                const theme = colorMap[node.color] || colorMap.cyan;

                return (
                  <div
                    key={node.id}
                    style={{
                      position: 'absolute',
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      width: '260px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connectingSource && connectingSource.nodeId !== node.id) {
                        handleEndConnect(node.id);
                      } else {
                        setSelectedNodeId(node.id);
                      }
                    }}
                    className={`rounded-2xl bg-zinc-900/95 backdrop-blur-md border shadow-2xl pointer-events-auto node-card select-none ${
                      isSelected
                        ? 'border-white/60 ring-2 ring-indigo-500/60 shadow-indigo-500/20 z-20'
                        : 'border-white/[0.12] hover:border-white/30 z-10'
                    }`}
                  >
                    {/* Top Categorical Color Stripe */}
                    <div className={`h-1.5 w-full rounded-t-2xl ${theme.bar}`}></div>

                    {/* Input Port Pin (Left Edge) */}
                    {node.inputs > 0 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEndConnect(node.id);
                        }}
                        className={`absolute -left-2.5 top-8 w-5 h-5 rounded-full bg-zinc-950 border-2 border-indigo-400 flex items-center justify-center cursor-pointer transition hover:scale-125 z-30 port-pin ${
                          connectingSource && connectingSource.nodeId !== node.id ? 'ring-4 ring-cyan-400 animate-pulse' : ''
                        }`}
                        title="Input Port: Click to link incoming cable"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                    )}

                    {/* Output Port Pin (Right Edge) */}
                    {node.outputs > 0 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartConnect(node.id);
                        }}
                        className="absolute -right-2.5 top-8 w-5 h-5 rounded-full bg-zinc-950 border-2 border-cyan-400 flex items-center justify-center cursor-pointer transition hover:scale-125 z-30 port-pin"
                        title="Output Port: Click to drag wire to another node"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                    )}

                    {/* Drag Handle & Header */}
                    <div
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      className="p-3 pb-2 flex items-center justify-between border-b border-white/[0.06] cursor-grab active:cursor-grabbing hover:bg-white/[0.03] rounded-t-2xl"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${theme.badge}`}>
                          <Icon name={node.icon} className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-semibold text-white leading-tight truncate">{node.title}</h4>
                          <span className="text-[10px] text-zinc-400 block truncate">{node.subtitle}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <span className="text-[9px] font-mono text-zinc-500 px-1 rounded bg-white/[0.04]">
                          {node.x},{node.y}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                          className="text-zinc-500 hover:text-rose-400 p-1 rounded-md transition text-xs shrink-0"
                          title="Delete Node"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Node Config Body with in-place controls */}
                    <div className="p-3 space-y-2 text-[11px]" onMouseDown={(e) => e.stopPropagation()}>
                      {node.type === 'sensor_cam' && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-zinc-400">
                            <span>Capture Rate:</span>
                            <span className="font-mono text-white font-medium">{node.config?.fps || 5} FPS</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="30"
                            value={node.config?.fps || 5}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdateNodeConfig(node.id, 'fps', Number(e.target.value))}
                            className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                          />
                        </div>
                      )}

                      {node.type === 'wasm_filter' && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-zinc-400">
                            <span>ISO-10816 Limit:</span>
                            <span className="font-mono text-white font-medium">{node.config?.threshold || 4.5} mm/s</span>
                          </div>
                          <input
                            type="range"
                            min="1.0"
                            max="8.0"
                            step="0.5"
                            value={node.config?.threshold || 4.5}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdateNodeConfig(node.id, 'threshold', Number(e.target.value))}
                            className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                          />
                        </div>
                      )}

                      {node.type === 'custom_rule' && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                            <span>Temp Cutoff:</span>
                            <span className="font-mono text-white font-medium">{node.config?.max_temp_c || 80}°C</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="95"
                            value={node.config?.max_temp_c || 80}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdateNodeConfig(node.id, 'max_temp_c', Number(e.target.value))}
                            className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                          />
                          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                            <span>Vib Limit:</span>
                            <span className="font-mono text-white font-medium">{node.config?.max_vibration_mms || 4.5} mm/s</span>
                          </div>
                          <input
                            type="range"
                            min="1.0"
                            max="8.0"
                            step="0.5"
                            value={node.config?.max_vibration_mms || 4.5}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdateNodeConfig(node.id, 'max_vibration_mms', Number(e.target.value))}
                            className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                          />
                        </div>
                      )}

                      {node.type === 'ai_yolo' && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-400 block">Active ONNX Model:</span>
                          <select
                            value={node.config?.model || 'yolov8n-coco'}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdateNodeConfig(node.id, 'model', e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none"
                          >
                            {catalog.map(m => (
                              <option key={m.model_id} value={m.model_id}>{m.name.split(' (')[0]}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {node.type === 'sensor_imu' && (
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Sample Rate:</span>
                          <span className="font-mono text-emerald-300">2000 Hz (±16g)</span>
                        </div>
                      )}

                      {node.type === 'ai_vibration' && (
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Harmonic FFT:</span>
                          <span className="font-mono text-cyan-300">1024-pt SIMD</span>
                        </div>
                      )}

                      {node.type === 'storage_wal' && (
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Ring Buffer:</span>
                          <span className="font-mono text-amber-300">{node.config?.ring_buffer || 512} frames</span>
                        </div>
                      )}

                      {node.type === 'cloud_sync' && (
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Security:</span>
                          <span className="font-mono text-violet-300">ChaCha20-Poly1305</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Quick Link Cable Button */}
                    <div className="px-3 py-1.5 bg-black/40 border-t border-white/[0.04] rounded-b-2xl flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider">{node.type.split('_')[0]}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartConnect(node.id);
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-0.5"
                      >
                        <span>Wire ➔</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Blank Canvas Empty State Prompt */}
            {pipelineNodes.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none z-10 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 shadow-xl">
                  <Icon name="sliders" className="w-7 h-7" />
                </div>
                <h4 className="font-medium text-sm text-zinc-200">Blank Canvas Ready</h4>
                <p className="text-xs max-w-sm text-zinc-400 mt-1 mb-4">
                  Assemble your edge pipeline from scratch. Click any button below to drop your first block:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
                  <button
                    onClick={() => handleAddNodeFromLibrary('sensor_cam')}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-emerald-400 border border-emerald-500/30 transition flex items-center space-x-1.5"
                  >
                    <Icon name="video" className="w-3.5 h-3.5" />
                    <span>+ Camera Stream</span>
                  </button>
                  <button
                    onClick={() => handleAddNodeFromLibrary('ai_yolo')}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-cyan-400 border border-cyan-500/30 transition flex items-center space-x-1.5"
                  >
                    <Icon name="brain" className="w-3.5 h-3.5" />
                    <span>+ YOLOv8 Vision</span>
                  </button>
                  <button
                    onClick={() => handleAddNodeFromLibrary('sensor_imu')}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-emerald-400 border border-emerald-500/30 transition flex items-center space-x-1.5"
                  >
                    <Icon name="activity" className="w-3.5 h-3.5" />
                    <span>+ Vibration IMU</span>
                  </button>
                  <button
                    onClick={() => handleAddNodeFromLibrary('custom_rule')}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-indigo-400 border border-indigo-500/30 transition flex items-center space-x-1.5"
                  >
                    <Icon name="shield" className="w-3.5 h-3.5" />
                    <span>+ Custom Rule</span>
                  </button>
                  <button
                    onClick={() => handleAddNodeFromLibrary('storage_wal')}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-amber-400 border border-amber-500/30 transition flex items-center space-x-1.5"
                  >
                    <Icon name="cpu" className="w-3.5 h-3.5" />
                    <span>+ SQLite WAL</span>
                  </button>
                </div>
              </div>
            )}

          </div>

            {/* Selected Node Detailed Inspector */}
            {selectedNode && (
              <div className="p-4 rounded-3xl bg-zinc-950/70 border border-white/[0.08] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-white">{selectedNode.title} Parameters</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{selectedNode.subtitle}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
                  {Object.entries(selectedNode.config || {}).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-xl bg-zinc-900 border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">{k}</span>
                      <span className="font-mono text-zinc-200 text-[11px] font-medium">{String(v)}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => handleDeleteNode(selectedNode.id)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition"
                  >
                    Delete Node
                  </button>
                </div>
              </div>
            )}

            {/* Comprehensive Multi-Modal Real-Time Telemetry Graphs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Multi-Modal Telemetry Streams</h4>
                <span className="text-[11px] text-zinc-500 font-mono">Live SVG Buffers (30 samples)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricGraph
                  title="Inference Latency"
                  data={telemetryHistory.latency}
                  unit="ms"
                  min={100}
                  max={160}
                  color="cyan"
                  threshold={150}
                  thresholdLabel="Budget: 150 ms"
                />
                <MetricGraph
                  title="Vibration Velocity (ISO-10816)"
                  data={telemetryHistory.vibration}
                  unit="mm/s"
                  min={0.5}
                  max={5.5}
                  color="emerald"
                  threshold={4.5}
                  thresholdLabel="Limit: 4.5 mm/s"
                />
                <MetricGraph
                  title="Acoustic Sound Pressure"
                  data={telemetryHistory.audio}
                  unit="dB"
                  min={40}
                  max={90}
                  color="amber"
                  threshold={75}
                  thresholdLabel="Alert: 75 dB"
                />
                <MetricGraph
                  title="CPU Utilization"
                  data={telemetryHistory.cpu}
                  unit="%"
                  min={0}
                  max={100}
                  color="violet"
                />
                <MetricGraph
                  title="RAM Resident Footprint"
                  data={telemetryHistory.memory}
                  unit="MB"
                  min={30}
                  max={120}
                  color="cyan"
                />
                <MetricGraph
                  title="Sensor Core Temperature"
                  data={telemetryHistory.temp}
                  unit="°C"
                  min={30}
                  max={90}
                  color="rose"
                  threshold={85}
                  thresholdLabel="Thermal Cap: 85°C"
                />
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 1: LIVE STREAM & AI VISION (THE HERO VIEW)                       */}
        {/* ===================================================================== */}
        {activeTab === 'live' && (
          <div className="flex-1 flex flex-col space-y-6">
            
            {/* Top Toolbar: Clean Model Switcher & Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <h2 className="text-base font-semibold text-white">Live Vision & Neural Telemetry</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Real-time optical inference stream from active edge hardware.</p>
              </div>

              {/* Model Switcher Dropdown & Canary Trigger */}
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-zinc-400">Active Model:</span>
                <select
                  value={activeModel}
                  disabled={isDeployingModel}
                  onChange={(e) => handleDeployModel(e.target.value)}
                  className="bg-zinc-900 border border-white/[0.12] rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                >
                  {catalog.map(m => (
                    <option key={m.model_id} value={m.model_id}>
                      {m.name} [{m.modality}]
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleDeployCanaryModel(activeModel)}
                  disabled={isDeployingModel}
                  title="Staged Canary: deploy to 1 node, verify 10s, then promote to fleet"
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Icon name="shield" className="w-3.5 h-3.5" />
                  <span>Canary Deploy</span>
                </button>
                {isDeployingModel && (
                  <span className="text-xs text-indigo-400 animate-pulse">Hot-swapping...</span>
                )}
              </div>
            </div>

            {/* Video Player & Real Detections Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* 2-Column Wide: The Live Video Screen */}
              <div className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl aspect-[4/3] flex items-center justify-center group">
                
                {/* Live JPEG Stream from /tmp/edge_live_frame.jpg */}
                <img
                  key={liveFrameTick}
                  src={`/api/v1/telemetry/live/frame?t=${liveFrameTick}`}
                  alt="Live Camera Stream"
                  className={`w-full h-full object-cover ${frameError ? 'hidden' : 'block'}`}
                  onError={() => setFrameError(true)}
                  onLoad={() => setFrameError(false)}
                />

                {/* Friendly Fallback / Offline Placeholder */}
                {frameError && (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-zinc-950/90 text-zinc-500 p-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center text-zinc-400">
                      <Icon name="video" className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-medium text-zinc-300">Camera Feed Standby</div>
                    <p className="text-xs max-w-sm text-zinc-500">
                      Start the edge client on your Raspberry Pi, Jetson, or PC to stream live frames:
                    </p>
                    <code className="px-3 py-1 rounded-lg bg-zinc-900 border border-white/[0.08] text-xs font-mono text-zinc-300">
                      ./run-edge.sh
                    </code>
                  </div>
                )}

                {/* Overlaid Bounding Boxes (Real Detected Objects) */}
                {liveDetections.map((det, idx) => {
                  const [x, y, w, h] = det.bbox || [40, 40, 100, 100];
                  const leftPct = (x / 640) * 100;
                  const topPct = (y / 480) * 100;
                  const widthPct = (w / 640) * 100;
                  const heightPct = (h / 480) * 100;

                  return (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                      }}
                      className="border-2 border-emerald-400 bg-emerald-400/10 rounded-lg pointer-events-none transition-all duration-300 shadow-lg"
                    >
                      <span className="absolute -top-6 left-0 px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-bold tracking-wide uppercase shadow">
                        {det.label} {Math.round(det.confidence * 100)}%
                      </span>
                    </div>
                  );
                })}

                {/* Live Top Overlay Pill */}
                <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>LIVE /dev/video0</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-300">Native Rust ORT</span>
                  <button
                    onClick={() => setLiveFrameTick(Date.now())}
                    title="Refresh camera snapshot"
                    className="ml-1 text-zinc-400 hover:text-cyan-400 transition"
                  >
                    <Icon name="refresh" className="w-3 h-3" />
                  </button>
                </div>

                {/* Bottom Overlay: Detected Object Tags */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs pointer-events-none">
                  <div className="flex flex-wrap gap-1.5">
                    {liveDetections.length === 0 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-zinc-400 border border-white/10">
                        Inspecting scene (nominal)
                      </span>
                    ) : (
                      liveDetections.map((d, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/40 font-mono text-[11px]">
                          {d.label} {Math.round(d.confidence * 100)}%
                        </span>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* 1-Column: Metrics & ChatGPT-Style Diagnostic Assistant */}
              <div className="space-y-4">
                
                {/* 3 Metric Tiles (iLovePDF Style) */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <span className="text-[11px] text-zinc-400 block mb-1">Inference</span>
                    <span className="text-base font-semibold text-white font-mono">
                      {telemetryHistory.latency[telemetryHistory.latency.length - 1]} ms
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <span className="text-[11px] text-zinc-400 block mb-1">Core Temp</span>
                    <span className="text-base font-semibold text-emerald-400 font-mono">
                      {telemetryHistory.temp[telemetryHistory.temp.length - 1]}°C
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <span className="text-[11px] text-zinc-400 block mb-1">RAM Resident</span>
                    <span className="text-base font-semibold text-white font-mono">
                      {telemetryHistory.memory[telemetryHistory.memory.length - 1]} MB
                    </span>
                  </div>
                </div>

                {/* Model Confidence & Drift Monitor Tile */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      driftMetrics?.drift_detected ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <Icon name="activity" className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                        <span>Confidence & Drift</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          driftMetrics?.drift_detected
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {driftMetrics?.drift_detected ? 'DRIFT ALERT' : 'STABLE'}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Mean: <span className="font-mono text-zinc-200">{driftMetrics ? `${(driftMetrics.mean_confidence * 100).toFixed(0)}%` : '88%'}</span> • Samples: <span className="font-mono text-zinc-200">{driftMetrics?.sample_count || 30}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Variance</span>
                    <span className="text-xs font-mono text-zinc-300">{driftMetrics ? Number(driftMetrics.variance).toFixed(4) : '0.0040'}</span>
                  </div>
                </div>

                {/* ChatGPT-Style On-Device SLM Diagnostic Assistant */}
                <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Icon name="brain" className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-white">Edge AI Assistant (Qwen SLM)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-mono">
                      Local GGUF
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ask on-device AI to analyze visual targets or inspect machine health.
                  </p>

                  {/* Pre-canned Quick Prompts */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Summarize camera scene",
                      "Check safety compliance",
                      "Diagnose machine health"
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAskAssistant(prompt)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06] transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* AI Response Display Box */}
                  {(assistantReply || isAssistantThinking) && (
                    <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/[0.08] text-xs text-zinc-200 leading-relaxed min-h-[60px] flex items-center">
                      {isAssistantThinking ? (
                        <div className="flex items-center space-x-2 text-zinc-400">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                          <span>Local SLM reasoning...</span>
                        </div>
                      ) : (
                        <span>{assistantReply}</span>
                      )}
                    </div>
                  )}

                  {/* Prompt Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAskAssistant();
                    }}
                    className="flex items-center space-x-2 pt-1"
                  >
                    <input
                      type="text"
                      placeholder="Ask edge diagnostic assistant..."
                      value={assistantPrompt}
                      onChange={(e) => setAssistantPrompt(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isAssistantThinking || !assistantPrompt.trim()}
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shadow-sm"
                    >
                      <Icon name="send" className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>
            </div>

            {/* Real-time Telemetry Graphs Row in Live Stream */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricGraph
                title="Inference Latency (Native SIMD ORT)"
                data={telemetryHistory.latency}
                unit="ms"
                min={100}
                max={160}
                color="cyan"
                threshold={150}
                thresholdLabel="Budget: 150 ms"
              />
              <MetricGraph
                title="Vibration Velocity (ISO-10816 Harmonics)"
                data={telemetryHistory.vibration}
                unit="mm/s"
                min={0.5}
                max={5.5}
                color="emerald"
                threshold={4.5}
                thresholdLabel="Danger: 4.5 mm/s"
              />
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 3: FLEET DEVICES & ONE-LINE BOOTSTRAP                            */}
        {/* ===================================================================== */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            
            {/* One-Line Setup Card (Zero-Touch Provisioning + Action Controls) */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-zinc-900/40 to-zinc-950 border border-indigo-500/20 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Icon name="zap" className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Zero-Touch Edge Device Provisioning</h3>
                    <p className="text-[11px] text-zinc-400">Streamlined one-line installer — claims hardware ID, stages configs, and boots microservices automatically.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {currentTokenInfo && (
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      Token: {currentTokenInfo.token.substring(0, 16)}... (Active 24h)
                    </span>
                  )}
                  <button
                    onClick={() => setShowQuickRef(!showQuickRef)}
                    className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium border border-white/[0.08] transition flex items-center space-x-1"
                    title="Toggle Server & SLM Cheatsheet"
                  >
                    <Icon name="terminal" className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{showQuickRef ? 'Hide Reference' : 'Server & CLI Reference'}</span>
                  </button>
                </div>
              </div>

              {/* Mode Toggle Bar */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-400">Execution Mode:</span>
                  <button
                    onClick={() => setDaemonMode(false)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      !daemonMode
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Live Streaming (Foreground)
                  </button>
                  <button
                    onClick={() => setDaemonMode(true)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      daemonMode
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Background Daemon (--daemon)
                  </button>
                </div>

                <div className="hidden sm:flex items-center space-x-2 text-[11px] text-zinc-500 font-mono">
                  <span>Zero Python • Pure Rust & C++ ELF</span>
                </div>
              </div>

              {/* Public Tunnel & Network Control Bar (Google Colab & WAN Ready) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-zinc-950/90 border border-white/[0.08] text-xs gap-3">
                <div className="flex items-center space-x-3">
                  <div className="relative flex items-center justify-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${tunnelInfo.active ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                    {tunnelInfo.active && (
                      <span className="absolute w-4 h-4 rounded-full bg-cyan-400/30 animate-ping"></span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">
                        {tunnelInfo.active ? 'Public Cloudflare Tunnel Active' : 'Local Network Mode'}
                      </span>
                      {tunnelInfo.active ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          Colab, Kaggle & WAN Ready
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          LAN / Localhost only
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono block mt-0.5">
                      {tunnelInfo.active ? tunnelInfo.url : `http://${window.location.host}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
                  {tunnelInfo.active ? (
                    <button
                      onClick={handleStopTunnel}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition flex items-center space-x-1.5"
                    >
                      <Icon name="stop" className="w-3.5 h-3.5" />
                      <span>Stop Tunnel</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartTunnel}
                      disabled={isStartingTunnel}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
                    >
                      <Icon name="refresh" className={`w-3.5 h-3.5 ${isStartingTunnel ? 'animate-spin' : ''}`} />
                      <span>{isStartingTunnel ? 'Connecting Cloudflare...' : '🌐 Start Cloudflare Tunnel'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main Curl Command Row */}
              {(() => {
                const isTunnelActive = tunnelInfo.active && tunnelInfo.url;
                const activeBaseUrl = isTunnelActive ? tunnelInfo.url : `http://${window.location.host}`;
                const tok = currentTokenInfo?.token || 'YOUR_TOKEN';
                const cmd = `curl -sSL ${activeBaseUrl}/bootstrap.sh?token=${tok}${daemonMode ? ' | bash -s -- --daemon' : ' | bash'}`;
                const colabCmd = `!curl -sSL ${activeBaseUrl}/bootstrap.sh?token=${tok} | bash -s -- --daemon`;
                const activeDev = devices.find(d => d.status === 'ONLINE') || devices[0];
                const isClientOnline = activeDev?.status === 'ONLINE';

                return (
                  <div className="space-y-3">
                    {/* Google Colab & Kaggle 1-Click Banner (when tunnel is online) */}
                    {isTunnelActive && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900/60 to-cyan-500/10 border border-amber-500/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-300 flex items-center space-x-1.5">
                            <Icon name="zap" className="w-3.5 h-3.5 text-amber-400" />
                            <span>Google Colab & Kaggle 1-Click Code Cell</span>
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">Shift+Enter in Colab</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-black/60 p-2 rounded-xl border border-white/[0.06] font-mono text-xs text-amber-200">
                          <span className="flex-1 select-all truncate pl-1">{colabCmd}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(colabCmd);
                              setCopiedColab(true);
                              setTimeout(() => setCopiedColab(false), 2000);
                            }}
                            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-sans font-medium transition shrink-0 border border-amber-500/30"
                          >
                            {copiedColab ? 'Copied!' : 'Copy Colab Code'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-zinc-950/80 p-2.5 rounded-2xl border border-white/[0.1] font-mono text-xs text-indigo-300">
                      <span className="flex-1 select-all truncate pl-2">{cmd}</span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={handleGenerateNewToken}
                          disabled={isGeneratingToken}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-sans font-medium transition shadow-sm flex items-center space-x-1.5 border border-white/[0.08]"
                          title="Generate a fresh enrollment token"
                        >
                          <Icon name="refresh" className={`w-3.5 h-3.5 ${isGeneratingToken ? 'animate-spin' : ''}`} />
                          <span>New Token</span>
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(cmd);
                            setCopiedQuick(true);
                            setTimeout(() => setCopiedQuick(false), 2000);
                          }}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-sans font-medium transition shadow-sm flex items-center space-x-1.5"
                        >
                          <Icon name={copiedQuick ? "check" : "copy"} className="w-3.5 h-3.5" />
                          <span>{copiedQuick ? 'Copied!' : 'Copy Command'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Operator Launch Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
                      <p className="text-[11px] text-zinc-400">
                        Run the command in your edge terminal, or launch locally right from this browser:
                      </p>
                      <div className="flex items-center space-x-2">
                        {isClientOnline ? (
                          <button
                            onClick={() => handleStopDevice(activeDev.device_id)}
                            className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition flex items-center space-x-1.5"
                          >
                            <Icon name="stop" className="w-3.5 h-3.5" />
                            <span>Stop Edge Client</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartDevice(activeDev?.device_id || 'my-edge-device-6dec8a')}
                            className="px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition flex items-center space-x-1.5"
                          >
                            <Icon name="play" className="w-3.5 h-3.5" />
                            <span>▶ Start Edge Client</span>
                          </button>
                        )}
                        {activeDev && (
                          <button
                            onClick={() => handlePurgeDevice(activeDev.device_id)}
                            className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition flex items-center space-x-1.5"
                            title="Stop microservices and completely wipe local data & databases"
                          >
                            <Icon name="trash" className="w-3.5 h-3.5" />
                            <span>Purge & Delete Data</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Collapsible Reference Hub for Server & SLM Startup */}
              {showQuickRef && (
                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.06] space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Startup Guidelines & CLI Quick Reference</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Edge Platform v1.0</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.06] space-y-1.5">
                      <div className="flex items-center justify-between text-zinc-400 font-sans font-semibold text-[11px]">
                        <span>1. Cloud Fleet Server</span>
                        <span className="text-emerald-400">Port 8080</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 select-all bg-black/40 p-1.5 rounded border border-white/[0.04]">
                        node cloud_server/src/server.js
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.06] space-y-1.5">
                      <div className="flex items-center justify-between text-zinc-400 font-sans font-semibold text-[11px]">
                        <span>2. Local SLM (Llama.cpp)</span>
                        <span className="text-purple-400">Port 9931</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 select-all bg-black/40 p-1.5 rounded border border-white/[0.04] truncate" title="llama-server --host 127.0.0.1 --port 9931 -m data/models/qwen.gguf -c 1024 -t 4 --reasoning off">
                        llama-server -p 9931 --reasoning off
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.06] space-y-1.5">
                      <div className="flex items-center justify-between text-zinc-400 font-sans font-semibold text-[11px]">
                        <span>3. Edge Client CLI</span>
                        <span className="text-cyan-400">./edge-ctl</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 select-all bg-black/40 p-1.5 rounded border border-white/[0.04]">
                        ./edge-ctl [run | stop | purge]
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Registered Devices Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Registered Fleet Hardware</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {devices.length} Unique Machine{devices.length === 1 ? '' : 's'}
                  </span>
                </div>
                <button
                  onClick={handlePruneDevices}
                  className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-400 hover:text-white border border-white/[0.08] transition flex items-center space-x-1.5"
                  title="Prune duplicate or ghost hardware records"
                >
                  <Icon name="refresh" className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Prune Duplicates</span>
                </button>
              </div>
              
              {devices.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/[0.06] text-center text-zinc-500 text-xs">
                  No edge devices connected yet. Run the curl command above to enroll your first node.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {devices.map(d => {
                    const isOnline = d.status === 'ONLINE';
                    const isStopped = d.status === 'STOPPED';

                    return (
                      <div key={d.device_id} className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition space-y-4 shadow-sm flex flex-col justify-between">
                        
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-white text-sm">{d.device_id}</h4>
                                {d.hardware_id && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/[0.06]">
                                    HW: {d.hardware_id.slice(0, 8)}
                                  </span>
                                )}
                                {d.arch && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                    {d.arch}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1.5 text-xs text-zinc-500 font-mono">
                                <span>{d.hostname || 'edge-device'}</span>
                                {d.board_model && (
                                  <span className="text-[10px] text-zinc-400 font-sans truncate max-w-[160px]">• {d.board_model}</span>
                                )}
                              </div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center space-x-1.5 ${
                              isOnline
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                : isStopped
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isOnline ? 'bg-emerald-400 animate-pulse' : isStopped ? 'bg-amber-400' : 'bg-zinc-500'
                              }`}></span>
                              <span>{d.status}</span>
                            </span>
                          </div>

                          {/* Hardware Metrics Summary */}
                          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-950/60 border border-white/[0.04] text-center text-xs">
                            <div>
                              <span className="text-[10px] text-zinc-500 block">CPU</span>
                              <span className="font-mono text-zinc-300 font-semibold">{d.telemetry ? Math.round(d.telemetry.cpu_usage_pct) : 0}%</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 block">Temp</span>
                              <span className="font-mono text-zinc-300 font-semibold">{d.telemetry ? `${d.telemetry.temperature_c}°C` : '--'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 block">Memory</span>
                              <span className="font-mono text-zinc-300 font-semibold">{d.telemetry ? `${Math.round(d.telemetry.ram_used_mb)}M` : '--'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06]">
                            <span className="text-zinc-500">Active Model:</span>
                            <span className="text-indigo-300 font-medium">{d.active_model || 'yolov8n-coco'}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-zinc-500">
                            <span>Heartbeat:</span>
                            <span className="font-mono text-zinc-400">{d.seconds_ago ? `${d.seconds_ago}s ago` : 'live now'}</span>
                          </div>
                        </div>

                        {/* Device Operations Controls (Start, Stop, Purge & Delete) */}
                        <div className="pt-3 border-t border-white/[0.06] flex items-center space-x-2">
                          {isOnline ? (
                            <button
                              onClick={() => handleStopDevice(d.device_id)}
                              className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center justify-center space-x-1.5 transition shadow-sm"
                              title="Stop microservices on this device"
                            >
                              <Icon name="stop" className="w-3.5 h-3.5" />
                              <span>Stop Client</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartDevice(d.device_id)}
                              className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center justify-center space-x-1.5 transition shadow-sm"
                              title="Start edge microservices"
                            >
                              <Icon name="play" className="w-3.5 h-3.5" />
                              <span>Start Client</span>
                            </button>
                          )}
                          <button
                            onClick={() => handlePurgeDevice(d.device_id)}
                            className="py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center justify-center space-x-1.5 transition shadow-sm"
                            title="Stop microservices, wipe SQLite database, and purge from fleet"
                          >
                            <Icon name="trash" className="w-3.5 h-3.5" />
                            <span>Purge & Delete</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 4: AI MODEL CATALOG (iLovePDF Clean Tile Grid)                   */}
        {/* ===================================================================== */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            
            {/* Header with Upload Trigger */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <h3 className="text-sm font-semibold text-white">Model Catalog & Registry</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Pre-curated public models and proprietary user-uploaded weights.</p>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm flex items-center space-x-2"
              >
                <Icon name="upload" className="w-3.5 h-3.5" />
                <span>+ Upload Custom Model</span>
              </button>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="bg-zinc-900 border border-white/[0.12] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
                    <h3 className="font-semibold text-white text-sm">Upload Custom Model Weights</h3>
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="text-zinc-500 hover:text-white text-sm p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleUploadModel} className="p-5 space-y-4 text-xs">
                    <div>
                      <label className="block text-zinc-300 mb-1 font-medium">Model Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Worker Safety PPE Detector"
                        value={uploadName}
                        onChange={(e) => setUploadName(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/[0.1] rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-300 mb-1 font-medium">Modality</label>
                        <select
                          value={uploadModality}
                          onChange={(e) => setUploadModality(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Vision">Vision (ONNX)</option>
                          <option value="Vibration">Vibration (1D-CNN)</option>
                          <option value="Audio">Audio (Acoustic)</option>
                          <option value="Text">Text (GGUF SLM)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-300 mb-1 font-medium">Model File (.onnx / .gguf)</label>
                        <input
                          type="file"
                          required
                          onChange={(e) => setUploadFile(e.target.files[0])}
                          className="w-full text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                        />
                      </div>
                    </div>

                    {uploadModality === 'Vision' && (
                      <div>
                        <label className="block text-zinc-300 mb-1 font-medium">Custom Class Labels (Comma Separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. hardhat, safety_vest, person, boots"
                          value={uploadClasses}
                          onChange={(e) => setUploadClasses(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/[0.1] rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-[10px] text-zinc-500 mt-1 block">
                          Leave empty to use automatic COCO-80 labels or generic class_0, class_1 mapping.
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-zinc-300 mb-1 font-medium">Description</label>
                      <textarea
                        rows="2"
                        placeholder="Purpose and deployment scenarios for this model..."
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/[0.1] rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                      ></textarea>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(false)}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50"
                      >
                        {isUploading ? 'Uploading...' : 'Upload & Register'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* iLovePDF-style Clean Tool Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalog.map(m => (
                <div key={m.model_id} className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.18] transition flex flex-col justify-between space-y-4 shadow-sm group">
                  
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
                        <Icon name={m.modality === 'Vision' ? 'video' : m.modality === 'Text' ? 'brain' : 'zap'} className="w-4 h-4" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 text-[10px] font-mono border border-white/[0.05]">
                        {m.format} • {m.size_mb} MB
                      </span>
                    </div>

                    <h4 className="font-semibold text-white text-sm">{m.name}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{m.description}</p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[120px]">
                      {m.model_id}
                    </span>
                    <button
                      onClick={() => handleDeployModel(m.model_id)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white text-zinc-300 hover:text-black text-xs font-medium transition"
                    >
                      Deploy to Fleet
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 5: ZERO-TRUST SECURITY & ENCRYPTION                              */}
        {/* ===================================================================== */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-4xl">
            
            <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <h3 className="text-sm font-semibold text-white">Edge Fleet Cryptographic Security</h3>
              <p className="text-xs text-zinc-400">Zero-Trust hardware attestation, AEAD payload encryption, and tamper resistance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Icon name="shield" className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">In-Flight AEAD Encryption</h4>
                    <span className="text-[10px] text-emerald-400 font-mono">AES-256-GCM / ChaCha20</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  All telemetry packets, sensor buffers, and diagnostic outputs are sealed in an authenticated envelope prior to network transmission.
                </p>
                <div className="p-2 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-white/[0.04]">
                  Status: 🔒 Active (Zero-Overhead SIMD)
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Icon name="zap" className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Anti-Tamper Message Signing</h4>
                    <span className="text-[10px] text-indigo-400 font-mono">HMAC-SHA256 Signatures</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every edge packet includes a cryptographic message authentication code. Any man-in-the-middle bit tampering causes immediate rejection.
                </p>
                <div className="p-2 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-white/[0.04]">
                  Verification: 🔑 100% Packets Authenticated
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                    <Icon name="cpu" className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">WASM Memory Isolation</h4>
                    <span className="text-[10px] text-violet-400 font-mono">Wasmtime 64KB Sandbox</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Dynamic rules execute in private 64KB linear memory with no raw OS, filesystem, or socket access granted to untrusted guest code.
                </p>
                <div className="p-2 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-white/[0.04]">
                  Sandbox: 🛡️ Hardware Enforced Memory Boundaries
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Icon name="server" className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Atomic Model Verification</h4>
                    <span className="text-[10px] text-amber-400 font-mono">SHA-256 + rename(2)</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Downloaded weights are verified against the cryptographic cloud manifest before executing atomic POSIX staging to guarantee zero corruption.
                </p>
                <div className="p-2 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-white/[0.04]">
                  Integrity: ✅ Verified Staging Pipeline
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Diagnostic Edge Terminal Drawer */}
      {showTerminalDrawer && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-white/[0.12] shadow-2xl p-4 transition-all duration-300 max-h-[380px] flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="font-semibold text-white tracking-wide">Edge Diagnostic Shell</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400">Whitelisted Commands</span>
            </div>
            <div className="flex items-center space-x-2">
              {['free -h', 'df -h', 'uptime', 'v4l2-ctl --list-devices', './edge-ctl status'].map(cmd => (
                <button
                  key={cmd}
                  onClick={() => handleExecuteTerminalCommand(cmd)}
                  disabled={isExecutingCommand}
                  className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-[11px] border border-white/[0.06] transition"
                >
                  {cmd}
                </button>
              ))}
              <button
                onClick={() => setShowTerminalDrawer(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Terminal Output Log */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[200px] bg-black/60 p-3 rounded-xl border border-white/[0.06] text-zinc-300 font-mono text-[11px]">
            {terminalHistory.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-center space-x-2 text-cyan-400">
                  <span className="text-zinc-500">{item.time}</span>
                  <span>edge-node$</span>
                  <span className="font-semibold">{item.cmd}</span>
                </div>
                <pre className="text-zinc-300 whitespace-pre-wrap pl-4 border-l border-zinc-800">{item.output}</pre>
              </div>
            ))}
          </div>

          {/* Terminal Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteTerminalCommand();
            }}
            className="flex items-center space-x-2 mt-3"
          >
            <span className="text-cyan-400 font-bold">$</span>
            <input
              type="text"
              value={terminalCommand}
              onChange={(e) => setTerminalCommand(e.target.value)}
              placeholder="Enter command (e.g. free -h, df -h, uptime, v4l2-ctl --list-devices)..."
              className="flex-1 bg-zinc-900 border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isExecutingCommand}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-semibold rounded-lg text-xs transition"
            >
              {isExecutingCommand ? 'Executing...' : 'Run'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

// Mount React Root
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
