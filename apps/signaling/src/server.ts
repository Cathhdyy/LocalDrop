import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import {
  SignalingMessage,
  isValidSignalingMessage,
  DEFAULT_PORT,
  HEARTBEAT_INTERVAL_MS,
  HEARTBEAT_TIMEOUT_MS,
} from '@localdrop/protocol';
import { RoomManager } from './rooms';
import { getPrimaryNetworkAddress, getLocalNetworkAddresses } from './network';

export interface SignalingServerOptions {
  port?: number;
  host?: string;
  server?: http.Server;
  onClientConnected?: (deviceInfo: any) => void;
  onClientDisconnected?: (deviceInfo: any) => void;
}

export function createSignalingServer(options: SignalingServerOptions = {}) {
  const port = options.port ?? DEFAULT_PORT;
  const roomManager = new RoomManager();

  const httpServer =
    options.server ??
    http.createServer((req, res) => {
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

      if (url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', time: Date.now() }));
        return;
      }

      if (url.pathname === '/api/network') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            primaryIp: getPrimaryNetworkAddress(),
            allAddresses: getLocalNetworkAddresses(),
            port,
          })
        );
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    });

  const wss = new WebSocketServer({
    noServer: true,
  });

  // Handle WebSocket upgrade
  httpServer.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (rawData) => {
      try {
        const text = rawData.toString();
        const data = JSON.parse(text);

        if (!isValidSignalingMessage(data)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid signaling message format' }));
          return;
        }

        const msg = data as SignalingMessage;
        roomManager.updateHeartbeat(ws);

        switch (msg.type) {
          case 'ping': {
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
          }

          case 'join-room': {
            const { roomId, device } = msg;
            const { peer, existingPeers } = roomManager.registerPeer(ws, roomId, device);

            // Notify joining peer of room state
            ws.send(
              JSON.stringify({
                type: 'room-joined',
                roomId,
                peers: existingPeers,
                isHost: peer.isHost,
              })
            );

            // Announce to all other peers in room
            roomManager.broadcastToRoom(
              roomId,
              {
                type: 'peer-joined',
                peer: peer.device,
              },
              peer.id
            );

            options.onClientConnected?.(peer.device);
            break;
          }

          case 'pairing-request': {
            const { targetPeerId, senderPeerId, device } = msg;
            roomManager.sendToPeer(targetPeerId, {
              type: 'pairing-request',
              targetPeerId,
              senderPeerId,
              device,
            });
            break;
          }

          case 'pairing-response': {
            const { targetPeerId, senderPeerId, accepted } = msg;
            if (accepted) {
              roomManager.approvePairing(senderPeerId, targetPeerId);
            }
            roomManager.sendToPeer(targetPeerId, {
              type: 'pairing-response',
              targetPeerId,
              senderPeerId,
              accepted,
            });
            break;
          }

          case 'signal': {
            const { targetPeerId, senderPeerId, signal } = msg;
            // Relay WebRTC signal to target peer
            roomManager.sendToPeer(targetPeerId, {
              type: 'signal',
              targetPeerId,
              senderPeerId,
              signal,
            });
            break;
          }
        }
      } catch (err: any) {
        try {
          ws.send(JSON.stringify({ type: 'error', message: err.message }));
        } catch (e) {}
      }
    });

    ws.on('close', () => {
      const peer = roomManager.removePeerByWs(ws);
      if (peer) {
        roomManager.broadcastToRoom(peer.roomId, {
          type: 'peer-left',
          peerId: peer.id,
        });
        options.onClientDisconnected?.(peer.device);
      }
    });
  });

  // Heartbeat interval to prune dead connections
  const heartbeatTimer = setInterval(() => {
    const stale = roomManager.cleanStalePeers(HEARTBEAT_TIMEOUT_MS);
    if (stale.length > 0) {
      // peers cleaned
    }
  }, HEARTBEAT_INTERVAL_MS);

  const start = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      httpServer.listen(port, options.host, () => {
        resolve(port);
      });
      httpServer.on('error', reject);
    });
  };

  const close = (): Promise<void> => {
    clearInterval(heartbeatTimer);
    return new Promise((resolve) => {
      wss.close(() => {
        httpServer.close(() => resolve());
      });
    });
  };

  return {
    httpServer,
    wss,
    roomManager,
    start,
    close,
  };
}
