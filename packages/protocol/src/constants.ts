/**
 * Protocol Constants for LocalDrop
 */

// Optimal WebRTC DataChannel chunk size (64KB)
export const DEFAULT_CHUNK_SIZE = 64 * 1024; // 65,536 bytes

// Backpressure thresholds for RTCDataChannel.bufferedAmount
export const BUFFERED_AMOUNT_HIGH_WATER_MARK = 1024 * 1024; // 1 MB
export const BUFFERED_AMOUNT_LOW_WATER_MARK = 256 * 1024;  // 256 KB

// Default server & signaling port
export const DEFAULT_PORT = 8787;

// Default STUN & TURN configuration for reliable NAT & cellular traversal
export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  // Fast Google STUN servers for direct local P2P connections
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  // OpenRelay TURN servers for NAT, Symmetric NAT, mobile cellular (4G/5G), and firewall traversal
  {
    urls: [
      'turn:openrelay.metered.ca:80',
      'turn:openrelay.metered.ca:443',
      'turn:openrelay.metered.ca:443?transport=tcp',
    ],
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

// Room & signaling timeouts
export const HEARTBEAT_INTERVAL_MS = 15000;
export const HEARTBEAT_TIMEOUT_MS = 35000;
export const PAIRING_REQUEST_TIMEOUT_MS = 30000;
export const TRANSFER_ACCEPT_TIMEOUT_MS = 45000;

export const TRANSFER_STATES = [
  'WAITING',
  'CONNECTING',
  'ACCEPTING',
  'TRANSFERRING',
  'PAUSED',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
] as const;
