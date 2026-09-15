/**
 * LocalDrop Protocol Types
 * Shared between Web frontend, P2P engine, Signaling server, and CLI.
 */

export type PlatformType = 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'web' | 'unknown';

export type TransferState =
  | 'WAITING'
  | 'CONNECTING'
  | 'ACCEPTING'
  | 'TRANSFERRING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: PlatformType;
  browser?: string;
  isHost?: boolean;
}

// ---------------------------------------------------------------------------
// Signaling Server Messages (WebSocket)
// ---------------------------------------------------------------------------

export type SignalingMessage =
  | {
      type: 'join-room';
      roomId: string;
      device: DeviceInfo;
    }
  | {
      type: 'room-joined';
      roomId: string;
      peers: DeviceInfo[];
      isHost: boolean;
    }
  | {
      type: 'peer-joined';
      peer: DeviceInfo;
    }
  | {
      type: 'peer-left';
      peerId: string;
    }
  | {
      type: 'signal';
      targetPeerId: string;
      senderPeerId: string;
      signal: RTCSignalPayload;
    }
  | {
      type: 'pairing-request';
      targetPeerId: string;
      senderPeerId: string;
      device: DeviceInfo;
    }
  | {
      type: 'pairing-response';
      targetPeerId: string;
      senderPeerId: string;
      accepted: boolean;
    }
  | {
      type: 'ping';
    }
  | {
      type: 'pong';
    }
  | {
      type: 'error';
      message: string;
      code?: string;
    };

export type RTCSignalPayload =
  | { type: 'offer'; sdp: string }
  | { type: 'answer'; sdp: string }
  | { type: 'candidate'; candidate: any };

// ---------------------------------------------------------------------------
// Peer-to-Peer DataChannel Messages
// ---------------------------------------------------------------------------

export type DataChannelMessage =
  | {
      type: 'device-info';
      deviceId: string;
      deviceName: string;
      platform: PlatformType;
      timestamp: number;
    }
  | {
      type: 'transfer-request';
      transferId: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      totalChunks: number;
      chunkSize: number;
      checksum?: string;
    }
  | {
      type: 'transfer-accept';
      transferId: string;
    }
  | {
      type: 'transfer-reject';
      transferId: string;
      reason?: string;
    }
  | {
      type: 'transfer-chunk-header';
      transferId: string;
      chunkIndex: number;
      chunkSize: number;
    }
  | {
      type: 'transfer-complete';
      transferId: string;
      checksum: string;
      totalBytes: number;
    }
  | {
      type: 'transfer-cancel';
      transferId: string;
      reason?: string;
    }
  | {
      type: 'transfer-pause';
      transferId: string;
    }
  | {
      type: 'transfer-resume';
      transferId: string;
    }
  | {
      type: 'text-share';
      id: string;
      text: string;
      timestamp: number;
      senderName: string;
    }
  | {
      type: 'rtt-ping';
      timestamp: number;
    }
  | {
      type: 'rtt-pong';
      timestamp: number;
    };

// ---------------------------------------------------------------------------
// File Transfer & History Models
// ---------------------------------------------------------------------------

export interface TransferProgress {
  transferId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  state: TransferState;
  direction: 'sending' | 'receiving';
  peerId: string;
  peerName: string;
  bytesTransferred: number;
  totalBytes: number;
  chunksTransferred: number;
  totalChunks: number;
  currentSpeed: number; // bytes per second
  averageSpeed: number; // bytes per second
  estimatedSecondsRemaining: number;
  startTime: number;
  error?: string;
  checksum?: string;
}

export interface TransferHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  direction: 'sent' | 'received';
  peerName: string;
  peerId: string;
  state: 'COMPLETED' | 'CANCELLED' | 'FAILED';
  timestamp: number;
  durationMs: number;
  speedAvgBytesPerSec: number;
  checksum?: string;
}

export interface SharedTextMessage {
  id: string;
  text: string;
  senderName: string;
  senderId: string;
  timestamp: number;
  direction: 'sent' | 'received';
}

export interface WebRTCDiagnostics {
  iceConnectionState: RTCIceConnectionState | 'uninitialized';
  connectionState: RTCPeerConnectionState | 'uninitialized';
  signalingState: RTCSignalingState | 'uninitialized';
  dataChannelState: RTCDataChannelState | 'closed';
  rttMs: number | null;
  currentThroughputBytesPerSec: number;
  bufferedAmount: number;
  packetsSent?: number;
  packetsReceived?: number;
  bytesSent?: number;
  bytesReceived?: number;
  recentLogs: Array<{ timestamp: number; level: 'info' | 'warn' | 'error'; message: string }>;
}
