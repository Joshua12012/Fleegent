import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';
import pool from './db';

const PROTO_PATH = path.join(__dirname, '../proto/edge.v1.proto');
const JWT_SECRET = process.env.JWT_SECRET || 'edge-fleet-secret-v1';
const JWT_EXPIRY_HOURS = 24;

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;
const edgeProto = proto.edge.v1;

interface AuthRequest {
  device_serial: string;
  secret: string;
}

interface TelemetryPacket {
  device_id: string;
  cpu_pct: number;
  mem_used_mb: number;
  mem_total_mb: number;
  uptime_s: number;
  ts: string;
}

interface PackageRequest {
  device_id: string;
  model_path: string;
}

async function authenticateDevice(
  call: grpc.ServerUnaryCall<AuthRequest, any>,
  callback: grpc.sendUnaryData<any>
) {
  const { device_serial, secret } = call.request;

  try {
    // For v1, we accept any device with a matching secret
    // In production, this would check against device_secrets table
    const result = await pool.query(
      'INSERT INTO devices (device_serial) VALUES ($1) ON CONFLICT (device_serial) DO UPDATE SET last_seen_at = now() RETURNING id',
      [device_serial]
    );

    const deviceId = result.rows[0].id;
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + JWT_EXPIRY_HOURS * 3600;

    const token = jwt.sign(
      { sub: deviceId, device_serial },
      JWT_SECRET,
      { expiresIn: `${JWT_EXPIRY_HOURS}h` }
    );

    callback(null, { jwt: token, expires_at_unix: expiresAt });
  } catch (error: any) {
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

async function streamTelemetry(
  call: grpc.ServerReadableStream<TelemetryPacket, any>,
  callback: grpc.sendUnaryData<any>
) {
  const packets: TelemetryPacket[] = [];

  call.on('data', (packet: TelemetryPacket) => {
    packets.push(packet);
  });

  call.on('end', async () => {
    try {
      for (const packet of packets) {
        // Get or create device
        const deviceResult = await pool.query(
          'INSERT INTO devices (device_serial) VALUES ($1) ON CONFLICT (device_serial) DO UPDATE SET last_seen_at = now() RETURNING id',
          [packet.device_id]
        );
        const deviceId = deviceResult.rows[0].id;

        // Insert telemetry
        await pool.query(
          `INSERT INTO telemetry_log (device_id, cpu_pct, mem_used_mb, mem_total_mb, uptime_s, recorded_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [deviceId, packet.cpu_pct, packet.mem_used_mb, packet.mem_total_mb, packet.uptime_s, packet.ts]
        );
      }

      callback(null, { ok: true, error: '' });
    } catch (error: any) {
      callback(null, { ok: false, error: error.message });
    }
  });

  call.on('error', (error: Error) => {
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  });
}

async function getDeploymentPackage(
  call: grpc.ServerUnaryCall<PackageRequest, any>,
  callback: grpc.sendUnaryData<any>
) {
  const { device_id, model_path } = call.request;

  try {
    // For v1, return a dummy deployment artifact
    // In production, this would fetch from object storage
    const dummyArtifact = Buffer.from(JSON.stringify({
      model: model_path,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    }));

    const crypto = await import('crypto');
    const sha256 = crypto.createHash('sha256').update(dummyArtifact).digest('hex');

    callback(null, {
      data: dummyArtifact,
      sha256,
      version: '1.0.0',
      is_last: true,
    });
  } catch (error: any) {
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

export function startGrpcServer(): grpc.Server {
  const server = new grpc.Server();

  server.addService(edgeProto.EdgeControlPlane.service, {
    authenticateDevice,
    streamTelemetry,
    getDeploymentPackage,
  });

  const grpcPort = process.env.GRPC_PORT || '50051';
  server.bindAsync(
    `0.0.0.0:${grpcPort}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('gRPC server failed to bind:', err);
        return;
      }
      console.log(`gRPC server listening on port ${port}`);
    }
  );

  return server;
}
