import { describe, it, expect } from 'vitest';
import {
  createBinaryChunkPacket,
  parseBinaryChunkPacket,
} from '../packages/p2p/src/chunker';
import { FileChunkReceiver } from '../packages/p2p/src/reassembler';
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

  it('should handle transfer IDs longer than 16 characters gracefully', () => {
    const longTransferId = 'tx_uuid_123456789_abcdef_987654321';
    const packet = createBinaryChunkPacket(longTransferId, 0, 1, new Uint8Array([1, 2, 3]));
    const parsed = parseBinaryChunkPacket(packet);

    expect(parsed).not.toBeNull();
    // Headers truncate to 16 bytes
    expect(parsed?.transferId).toBe(longTransferId.slice(0, 16));
  });

  it('should reject packets with out-of-bounds chunkIndex to prevent memory exhaustion', async () => {
    const receiver = new FileChunkReceiver({
      transferId: 'tx_safe_bounds',
      fileName: 'bounds_test.bin',
      fileSize: 1024,
      mimeType: 'application/octet-stream',
      totalChunks: 2,
    });

    // Valid packet at index 0
    const validPacket = createBinaryChunkPacket('tx_safe_bounds', 0, 2, new Uint8Array([1, 2]));
    const validResult = await receiver.handleChunk(validPacket);
    expect(validResult).toBe(false); // only 1 of 2 chunks received, not finalized yet

    // Malicious packet at index 999999 (out-of-bounds)
    const oobPacket = createBinaryChunkPacket('tx_safe_bounds', 999999, 2, new Uint8Array([3, 4]));
    const oobResult = await receiver.handleChunk(oobPacket);
    expect(oobResult).toBe(false);

    // Valid packet at index 1 completes reassembly
    const finalPacket = createBinaryChunkPacket('tx_safe_bounds', 1, 2, new Uint8Array([5, 6]));
    const finalResult = await receiver.handleChunk(finalPacket);
    expect(finalResult).toBe(true);
  });
});
