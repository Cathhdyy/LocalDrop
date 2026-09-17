import { SignalingMessage, DataChannelMessage, TransferState } from './types';
import { TRANSFER_STATES } from './constants';

export function isValidSignalingMessage(data: unknown): data is SignalingMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  if (typeof msg.type !== 'string') return false;

  switch (msg.type) {
    case 'join-room':
      return typeof msg.roomId === 'string' && typeof msg.device === 'object';
    case 'room-joined':
      return typeof msg.roomId === 'string' && Array.isArray(msg.peers);
    case 'peer-joined':
      return typeof msg.peer === 'object' && msg.peer !== null;
    case 'peer-left':
      return typeof msg.peerId === 'string';
    case 'signal':
      return typeof msg.targetPeerId === 'string' && typeof msg.signal === 'object';
    case 'pairing-request':
      return typeof msg.targetPeerId === 'string' && typeof msg.senderPeerId === 'string';
    case 'pairing-response':
      return typeof msg.targetPeerId === 'string' && typeof msg.accepted === 'boolean';
    case 'ping':
    case 'pong':
      return true;
    case 'error':
      return typeof msg.message === 'string';
    default:
      return false;
  }
}

export function isValidDataChannelMessage(data: unknown): data is DataChannelMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  if (typeof msg.type !== 'string') return false;

  switch (msg.type) {
    case 'device-info':
      return typeof msg.deviceId === 'string' && typeof msg.deviceName === 'string';
    case 'transfer-request':
      return (
        typeof msg.transferId === 'string' &&
        typeof msg.fileName === 'string' &&
        typeof msg.fileSize === 'number' &&
        msg.fileSize >= 0
      );
    case 'transfer-accept':
    case 'transfer-reject':
    case 'transfer-pause':
    case 'transfer-resume':
    case 'transfer-cancel':
      return typeof msg.transferId === 'string';
    case 'transfer-chunk-header':
      return typeof msg.transferId === 'string' && typeof msg.chunkIndex === 'number';
    case 'transfer-complete':
      return typeof msg.transferId === 'string' && typeof msg.checksum === 'string';
    case 'text-share':
      return typeof msg.id === 'string' && typeof msg.text === 'string';
    case 'clipboard-share':
      return (
        typeof msg.id === 'string' &&
        typeof msg.content === 'string' &&
        typeof msg.contentType === 'string'
      );
    case 'rtt-ping':
    case 'rtt-pong':
      return typeof msg.timestamp === 'number';
    default:
      return false;
  }
}

export function isValidTransferState(state: unknown): state is TransferState {
  return typeof state === 'string' && (TRANSFER_STATES as readonly string[]).includes(state);
}

export function sanitizeFileName(name: string): string {
  // Prevent directory traversal and malicious characters
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim() || 'unnamed-file';
}
