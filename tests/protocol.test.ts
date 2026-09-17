import { describe, it, expect } from 'vitest';
import {
  isValidSignalingMessage,
  isValidDataChannelMessage,
  isValidTransferState,
  sanitizeFileName,
} from '../packages/protocol/src/validation';

describe('Protocol Message & State Validation', () => {
  it('should validate valid signaling messages', () => {
    expect(
      isValidSignalingMessage({
        type: 'join-room',
        roomId: 'room123',
        device: { deviceId: 'd1', deviceName: 'PC', platform: 'windows' },
      })
    ).toBe(true);

    expect(
      isValidSignalingMessage({
        type: 'room-joined',
        roomId: 'room123',
        peers: [],
        isHost: true,
      })
    ).toBe(true);

    expect(
      isValidSignalingMessage({
        type: 'pairing-request',
        targetPeerId: 'p2',
        senderPeerId: 'p1',
        device: { deviceId: 'p1', deviceName: 'Phone', platform: 'ios' },
      })
    ).toBe(true);
  });

  it('should reject invalid signaling messages', () => {
    expect(isValidSignalingMessage(null)).toBe(false);
    expect(isValidSignalingMessage({})).toBe(false);
    expect(isValidSignalingMessage({ type: 'unknown-type' })).toBe(false);
    expect(isValidSignalingMessage({ type: 'join-room' })).toBe(false);
  });

  it('should validate valid DataChannel messages', () => {
    expect(
      isValidDataChannelMessage({
        type: 'device-info',
        deviceId: 'd1',
        deviceName: 'MacBook',
        platform: 'macos',
        timestamp: Date.now(),
      })
    ).toBe(true);

    expect(
      isValidDataChannelMessage({
        type: 'transfer-request',
        transferId: 'tx_123',
        fileName: 'vacation.mp4',
        fileSize: 2147483648,
        mimeType: 'video/mp4',
        totalChunks: 32768,
        chunkSize: 65536,
      })
    ).toBe(true);

    expect(
      isValidDataChannelMessage({
        type: 'text-share',
        id: 'txt_1',
        text: 'Hello LocalDrop!',
        timestamp: Date.now(),
        senderName: 'Simran',
      })
    ).toBe(true);

    expect(
      isValidDataChannelMessage({
        type: 'clipboard-share',
        id: 'clip_1',
        content: 'https://github.com/Cathhdyy/LocalDrop',
        contentType: 'url',
        senderName: 'Simran',
        senderPlatform: 'windows',
        timestamp: Date.now(),
      })
    ).toBe(true);
  });

  it('should validate transfer states correctly', () => {
    expect(isValidTransferState('WAITING')).toBe(true);
    expect(isValidTransferState('CONNECTING')).toBe(true);
    expect(isValidTransferState('ACCEPTING')).toBe(true);
    expect(isValidTransferState('TRANSFERRING')).toBe(true);
    expect(isValidTransferState('PAUSED')).toBe(true);
    expect(isValidTransferState('COMPLETED')).toBe(true);
    expect(isValidTransferState('FAILED')).toBe(true);
    expect(isValidTransferState('CANCELLED')).toBe(true);
    expect(isValidTransferState('INVALID_STATE')).toBe(false);
  });

  it('should sanitize unsafe file names', () => {
    expect(sanitizeFileName('../../etc/passwd')).toBe('.._.._etc_passwd');
    expect(sanitizeFileName('file:with*bad?chars.png')).toBe('file_with_bad_chars.png');
    expect(sanitizeFileName('')).toBe('unnamed-file');
    expect(sanitizeFileName('normal_file.pdf')).toBe('normal_file.pdf');
  });
});
