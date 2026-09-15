import { createSignalingServer } from './server';
import { getPrimaryNetworkAddress } from './network';
import { DEFAULT_PORT } from '@localdrop/protocol';

export * from './server';
export * from './rooms';
export * from './network';

// Run directly if invoked as main script
if (require.main === module) {
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const server = createSignalingServer({
    port,
    onClientConnected: (device) => {
      console.log(`[Signaling] Device connected: ${device.deviceName} (${device.platform})`);
    },
    onClientDisconnected: (device) => {
      console.log(`[Signaling] Device disconnected: ${device.deviceName}`);
    },
  });

  server.start().then((listeningPort) => {
    const primaryIp = getPrimaryNetworkAddress();
    console.log(`\n⚡ LocalDrop Signaling Server running:`);
    console.log(`  Local:   http://localhost:${listeningPort}`);
    console.log(`  Network: http://${primaryIp}:${listeningPort}`);
    console.log(`  WS:      ws://${primaryIp}:${listeningPort}/ws\n`);
  }).catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
