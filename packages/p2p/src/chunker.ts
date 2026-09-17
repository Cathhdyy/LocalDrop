import {
  DEFAULT_CHUNK_SIZE,
  BUFFERED_AMOUNT_HIGH_WATER_MARK,
  BUFFERED_AMOUNT_LOW_WATER_MARK,
} from '@localdrop/protocol';

export interface ChunkProgressCallback {
  (progress: {
    bytesTransferred: number;
    totalBytes: number;
    chunkIndex: number;
    totalChunks: number;
    speedBytesPerSec: number;
    estimatedSecondsRemaining: number;
  }): void;
}

export interface ChunkerOptions {
  chunkSize?: number;
  highWaterMark?: number;
  lowWaterMark?: number;
  onProgress?: ChunkProgressCallback;
}

const CHUNK_HEADER_MAGIC = 0x4c444348; // "LDCH" (LocalDrop CHunk)
const HEADER_SIZE = 28; // 4 bytes magic + 16 bytes transferId + 4 bytes chunkIndex + 4 bytes totalChunks

/**
 * Creates a binary packet with header + chunk data.
 */
export function createBinaryChunkPacket(
  transferId: string,
  chunkIndex: number,
  totalChunks: number,
  chunkData: Uint8Array
): ArrayBuffer {
  const packetBuffer = new ArrayBuffer(HEADER_SIZE + chunkData.byteLength);
  const dataView = new DataView(packetBuffer);

  // 1. Magic (4 bytes)
  dataView.setUint32(0, CHUNK_HEADER_MAGIC, false);

  // 2. TransferId (16 bytes, ASCII/UTF-8 padded or truncated)
  const idEncoder = new TextEncoder();
  const idBytes = idEncoder.encode(transferId.slice(0, 16));
  const idView = new Uint8Array(packetBuffer, 4, 16);
  idView.set(idBytes);

  // 3. Chunk Index (4 bytes)
  dataView.setUint32(20, chunkIndex, false);

  // 4. Total Chunks (4 bytes)
  dataView.setUint32(24, totalChunks, false);

  // 5. Payload
  const payloadView = new Uint8Array(packetBuffer, HEADER_SIZE, chunkData.byteLength);
  payloadView.set(chunkData);

  return packetBuffer;
}

/**
 * Decodes a binary packet into header info and raw chunk payload.
 */
export function parseBinaryChunkPacket(packetBuffer: ArrayBuffer): {
  transferId: string;
  chunkIndex: number;
  totalChunks: number;
  payload: Uint8Array;
} | null {
  if (packetBuffer.byteLength < HEADER_SIZE) {
    return null;
  }

  const dataView = new DataView(packetBuffer);
  const magic = dataView.getUint32(0, false);
  if (magic !== CHUNK_HEADER_MAGIC) {
    return null;
  }

  const idDecoder = new TextDecoder();
  const idBytes = new Uint8Array(packetBuffer, 4, 16);
  // remove null padding
  const transferId = idDecoder.decode(idBytes).replace(/\0/g, '').trim();

  const chunkIndex = dataView.getUint32(20, false);
  const totalChunks = dataView.getUint32(24, false);

  const payload = new Uint8Array(packetBuffer, HEADER_SIZE);

  return {
    transferId,
    chunkIndex,
    totalChunks,
    payload,
  };
}

export class FileChunkSender {
  private file: Blob;
  private transferId: string;
  private dataChannel: RTCDataChannel;
  private chunkSize: number;
  private highWaterMark: number;
  private lowWaterMark: number;
  private onProgress?: ChunkProgressCallback;

  private isCancelled = false;
  private isPaused = false;
  private resumeResolver: (() => void) | null = null;

  constructor(
    file: Blob,
    transferId: string,
    dataChannel: RTCDataChannel,
    options?: ChunkerOptions
  ) {
    this.file = file;
    this.transferId = transferId;
    this.dataChannel = dataChannel;
    this.chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
    this.highWaterMark = options?.highWaterMark ?? BUFFERED_AMOUNT_HIGH_WATER_MARK;
    this.lowWaterMark = options?.lowWaterMark ?? BUFFERED_AMOUNT_LOW_WATER_MARK;
    this.onProgress = options?.onProgress;
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      if (this.resumeResolver) {
        const resolve = this.resumeResolver;
        this.resumeResolver = null;
        resolve();
      }
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.resumeResolver) {
      const resolve = this.resumeResolver;
      this.resumeResolver = null;
      resolve();
    }
  }

  /**
   * Streams the file in chunks over the RTCDataChannel with backpressure control.
   */
  public async send(): Promise<boolean> {
    const totalBytes = this.file.size;
    const totalChunks = Math.ceil(totalBytes / this.chunkSize) || 1;

    let bytesTransferred = 0;
    const startTime = Date.now();
    let lastTime = startTime;
    let bytesInWindow = 0;
    let currentSpeed = 0;

    // Set low water mark for backpressure notifications
    if ('bufferedAmountLowThreshold' in this.dataChannel) {
      this.dataChannel.bufferedAmountLowThreshold = this.lowWaterMark;
    }

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      if (this.isCancelled) {
        return false;
      }

      if (this.isPaused) {
        await new Promise<void>((resolve) => {
          this.resumeResolver = resolve;
        });
        if (this.isCancelled) return false;
      }

      // Read chunk slice
      const start = chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, totalBytes);
      const slice = this.file.slice(start, end);
      const arrayBuffer = await slice.arrayBuffer();
      const chunkData = new Uint8Array(arrayBuffer);

      // Backpressure: Wait if RTCDataChannel buffer is full
      await this.waitForBufferDrain();

      if (this.isCancelled || this.dataChannel.readyState !== 'open') {
        return false;
      }

      // Create binary packet and send
      const packet = createBinaryChunkPacket(
        this.transferId,
        chunkIndex,
        totalChunks,
        chunkData
      );

      try {
        this.dataChannel.send(packet);
      } catch (err) {
        return false;
      }
      bytesTransferred += chunkData.byteLength;
      bytesInWindow += chunkData.byteLength;

      // Calculate speed and ETA every 200ms
      const now = Date.now();
      const elapsedWindow = now - lastTime;
      if (elapsedWindow >= 200 || chunkIndex === totalChunks - 1) {
        const instantSpeed = (bytesInWindow / elapsedWindow) * 1000;
        currentSpeed = currentSpeed === 0 ? instantSpeed : currentSpeed * 0.7 + instantSpeed * 0.3;
        lastTime = now;
        bytesInWindow = 0;

        const remainingBytes = Math.max(0, totalBytes - bytesTransferred);
        const eta = currentSpeed > 0 ? Math.round(remainingBytes / currentSpeed) : 0;

        this.onProgress?.({
          bytesTransferred,
          totalBytes,
          chunkIndex: chunkIndex + 1,
          totalChunks,
          speedBytesPerSec: currentSpeed,
          estimatedSecondsRemaining: eta,
        });
      }
    }

    // Wait until remaining buffer is fully transmitted
    await this.waitForBufferEmpty();

    return !this.isCancelled && this.dataChannel.readyState === 'open';
  }

  private async waitForBufferDrain(): Promise<void> {
    if (this.dataChannel.readyState !== 'open' || this.dataChannel.bufferedAmount <= this.highWaterMark) {
      return;
    }

    return new Promise<void>((resolve) => {
      const onBufferedAmountLow = () => {
        this.dataChannel.removeEventListener('bufferedamountlow', onBufferedAmountLow);
        resolve();
      };

      this.dataChannel.addEventListener('bufferedamountlow', onBufferedAmountLow);

      // Fallback check in case event is missed
      const interval = setInterval(() => {
        if (
          this.dataChannel.readyState !== 'open' ||
          this.dataChannel.bufferedAmount <= this.lowWaterMark ||
          this.isCancelled
        ) {
          clearInterval(interval);
          this.dataChannel.removeEventListener('bufferedamountlow', onBufferedAmountLow);
          resolve();
        }
      }, 50);
    });
  }

  private async waitForBufferEmpty(): Promise<void> {
    if (this.dataChannel.readyState !== 'open' || this.dataChannel.bufferedAmount === 0) {
      return;
    }

    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (
          this.dataChannel.readyState !== 'open' ||
          this.dataChannel.bufferedAmount === 0 ||
          this.isCancelled
        ) {
          clearInterval(interval);
          resolve();
        }
      }, 30);
    });
  }
}
