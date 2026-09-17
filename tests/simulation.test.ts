import { describe, it, expect } from 'vitest';
import { createBinaryChunkPacket } from '../packages/p2p/src/chunker';
import { FileChunkReceiver } from '../packages/p2p/src/reassembler';
import { calculateSHA256 } from '../packages/p2p/src/crypto';

describe('Device A ↔ Device B Simulated P2P File Transfer', () => {
  it('should stream chunks from Device A and reassemble accurately on Device B', async () => {
    // 1. Simulate a synthetic 256 KB file on Device A
    const fileSize = 256 * 1024;
    const testData = new Uint8Array(fileSize);
    for (let i = 0; i < fileSize; i++) {
      testData[i] = (i * 31) % 256;
    }

    const expectedChecksum = await calculateSHA256(testData.buffer);
    const chunkSize = 32 * 1024;
    const totalChunks = Math.ceil(fileSize / chunkSize);
    const transferId = 'tx_sim_001';
    const fileName = 'simulated_video.mp4';
    const mimeType = 'video/mp4';

    let receivedCompleted = false;
    let completedBlob: Blob | null = null;
    let verifiedChecksum: string = '';

    // 2. Instantiate Device B receiver
    const receiver = new FileChunkReceiver({
      transferId,
      fileName,
      fileSize,
      mimeType,
      totalChunks,
      expectedChecksum,
      onProgress: (p) => {
        expect(p.bytesReceived).toBeGreaterThan(0);
        expect(p.totalBytes).toBe(fileSize);
      },
      onComplete: (blob, checksum) => {
        receivedCompleted = true;
        completedBlob = blob;
        verifiedChecksum = checksum;
      },
    });

    // 3. Simulate Device A transmitting chunks sequentially through mock data channel
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      const slice = testData.slice(start, end);

      const packet = createBinaryChunkPacket(transferId, i, totalChunks, slice);
      await receiver.handleChunk(packet);
    }

    // 4. Assert reassembly success and data integrity
    expect(receivedCompleted).toBe(true);
    expect(completedBlob).not.toBeNull();
    expect(completedBlob!.size).toBe(fileSize);
    expect(verifiedChecksum).toBe(expectedChecksum);
  });

  it('should sanitize unsafe filenames and match UUID transfer IDs properly', async () => {
    const uuidTransferId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
    const payload = new Uint8Array([65, 66, 67, 68]);
    let done = false;
    let savedBlob: Blob | null = null;

    const receiver = new FileChunkReceiver({
      transferId: uuidTransferId,
      fileName: '../../unsafe/malicious.sh',
      fileSize: 4,
      mimeType: 'text/plain',
      totalChunks: 1,
      onComplete: (blob) => {
        done = true;
        savedBlob = blob;
      },
    });

    // File name should be sanitized
    expect(receiver.fileName).toBe('.._.._unsafe_malicious.sh');

    // Chunker will truncate to 16 bytes in packet header
    const packet = createBinaryChunkPacket(uuidTransferId, 0, 1, payload);
    const accepted = await receiver.handleChunk(packet);

    expect(accepted).toBe(true);
    expect(done).toBe(true);
    expect(savedBlob).not.toBeNull();
    expect(savedBlob!.size).toBe(4);
  });
});
