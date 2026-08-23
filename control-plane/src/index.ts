import { startGrpcServer } from './grpc-server';
import { startRestServer } from './rest-server';

async function main() {
  console.log('Starting Edge Fleet Control Plane...');

  startRestServer();
  startGrpcServer();

  console.log('Control plane started successfully');
}

main().catch((error) => {
  console.error('Failed to start control plane:', error);
  process.exit(1);
});
