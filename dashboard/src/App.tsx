import { useState, useEffect, useCallback } from 'react';

interface Device {
  id: string;
  device_serial: string;
  online: boolean;
  created_at: string;
  last_seen_at: string | null;
  telemetry: {
    cpu_pct: number;
    mem_used_mb: number;
    mem_total_mb: number;
    uptime_s: number;
    recorded_at: string;
  } | null;
}

function DeviceCard({ device, onDeploy }: { device: Device; onDeploy: (id: string) => void }) {
  const memPercent = device.telemetry
    ? ((device.telemetry.mem_used_mb / device.telemetry.mem_total_mb) * 100).toFixed(1)
    : '0';

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{device.device_serial}</h3>
          <span style={{ fontSize: '12px', color: '#666' }}>
            ID: {device.id.slice(0, 8)}...
          </span>
        </div>
        <span style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600,
          background: device.online ? '#dcfce7' : '#fee2e2',
          color: device.online ? '#166534' : '#991b1b',
        }}>
          {device.online ? 'Online' : 'Offline'}
        </span>
      </div>

      {device.telemetry && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>CPU</div>
            <div style={{ fontSize: '24px', fontWeight: 600 }}>
              {device.telemetry.cpu_pct.toFixed(1)}%
            </div>
            <div style={{
              height: '4px',
              background: '#e5e7eb',
              borderRadius: '2px',
              marginTop: '4px',
            }}>
              <div style={{
                height: '100%',
                width: `${device.telemetry.cpu_pct}%`,
                background: device.telemetry.cpu_pct > 85 ? '#ef4444' : '#3b82f6',
                borderRadius: '2px',
              }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Memory</div>
            <div style={{ fontSize: '24px', fontWeight: 600 }}>
              {memPercent}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {device.telemetry.mem_used_mb}MB / {device.telemetry.mem_total_mb}MB
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Uptime</div>
            <div style={{ fontSize: '24px', fontWeight: 600 }}>
              {Math.floor(device.telemetry.uptime_s / 3600)}h {Math.floor((device.telemetry.uptime_s % 3600) / 60)}m
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => onDeploy(device.id)}
        style={{
          width: '100%',
          padding: '8px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        Deploy Model
      </button>
    </div>
  );
}

function DeployModal({ deviceId, onClose }: { deviceId: string; onClose: () => void }) {
  const [modelPath, setModelPath] = useState('');
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const res = await fetch('/api/v1/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, model_path: modelPath }),
      });
      if (res.ok) {
        alert('Deployment created successfully');
        onClose();
      } else {
        const err = await res.json();
        alert(`Deployment failed: ${err.error}`);
      }
    } catch (err) {
      alert('Network error');
    }
    setDeploying(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '400px',
      }}>
        <h2 style={{ marginBottom: '16px' }}>Deploy Model</h2>
        <input
          type="text"
          placeholder="Model path (e.g., /models/classifier-v1.wasm)"
          value={modelPath}
          onChange={(e) => setModelPath(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '8px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDeploy}
            disabled={!modelPath || deploying}
            style={{
              flex: 1,
              padding: '8px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              opacity: !modelPath || deploying ? 0.5 : 1,
            }}
          >
            {deploying ? 'Deploying...' : 'Deploy'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [deployDeviceId, setDeployDeviceId] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/devices');
      const data = await res.json();
      setDevices(data);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
          Edge Fleet Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          {devices.length} device{devices.length !== 1 ? 's' : ''} registered
          {' '}&middot;{' '}
          {devices.filter(d => d.online).length} online
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading...</div>
      ) : devices.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '8px',
          color: '#666',
        }}>
          No devices registered. Start an edge daemon to see it here.
        </div>
      ) : (
        devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            onDeploy={setDeployDeviceId}
          />
        ))
      )}

      {deployDeviceId && (
        <DeployModal
          deviceId={deployDeviceId}
          onClose={() => setDeployDeviceId(null)}
        />
      )}
    </div>
  );
}
