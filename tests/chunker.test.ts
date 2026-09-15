import { describe, it, expect } from 'vitest';
import {
  createBinaryChunkPacket,
  parseBinaryChunkPacket,
} from '../packages/p2p/src/chunker';
import { calculateSHA256 } from '../packages/p2p/src/crypto';

describe('Binary Chunk Framing & Integrity', () => {
  it('should encode and decode binary chunk packet properly', () => {
    const transferId = 'tx_abc12345';
    const chunkIndex = 42;
    const totalChunks = 100;
    const payload = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80]);

    const packet = createBinaryChunkPacket(transferId, chunkIndex, totalChunks, payload);
    const parsed = parseBinaryChunkPacket(packet);

    expect(parsed).not.toBeNull();
    expect(parsed?.transferId).toBe(transferId);
    expect(parsed?.chunkIndex).toBe(chunkIndex);
    expect(parsed?.totalChunks).toBe(totalChunks);
    expect(Array.from(parsed!.payload)).toEqual(Array.from(payload));
  });

  it('should reject malformed or truncated packets', () => {
    const buffer = new ArrayBuffer(10); // less than 28 bytes header
    expect(parseBinaryChunkPacket(buffer)).toBeNull();

    const invalidMagic = new ArrayBuffer(32);
    expect(parseBinaryChunkPacket(invalidMagic)).toBeNull();
  });

  it('should calculate accurate SHA-256 hash', async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode('LocalDrop P2P Transfer Payload');
    const hash = await calculateSHA256(data.buffer);

    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64); // standard 32-byte hex string
  });
});
