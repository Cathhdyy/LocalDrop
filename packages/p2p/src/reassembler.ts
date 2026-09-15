import { parseBinaryChunkPacket } from './chunker';
import { calculateSHA256 } from './crypto';

export interface FileReceiverOptions {
  transferId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  totalChunks: number;
  expectedChecksum?: string;
  onProgress?: (progress: {
    bytesReceived: number;
    totalBytes: number;
    chunksReceived: number;
    totalChunks: number;
    speedBytesPerSec: number;
    estimatedSecondsRemaining: number;
  }) => void;
  onComplete?: (blob: Blob, checksum: string) => void;
  onError?: (error: Error) => void;
}

export class FileChunkReceiver {
  public readonly transferId: string;
  public readonly fileName: string;
  public readonly fileSize: number;
  public readonly mimeType: string;
  public readonly totalChunks: number;
  public readonly expectedChecksum?: string;

  private chunks: (Uint8Array | null)[];
  private receivedChunkCount = 0;
  private bytesReceived = 0;
  private startTime = 0;
  private lastProgressTime = 0;
  private bytesInWindow = 0;
  private currentSpeed = 0;
  private isCancelled = false;

  private onProgress?: FileReceiverOptions['onProgress'];
  private onComplete?: FileReceiverOptions['onComplete'];
  private onError?: FileReceiverOptions['onError'];

  constructor(options: FileReceiverOptions) {
    this.transferId = options.transferId;
    this.fileName = options.fileName;
    this.fileSize = options.fileSize;
    this.mimeType = options.mimeType || 'application/octet-stream';
    this.totalChunks = options.totalChunks;
    this.expectedChecksum = options.expectedChecksum;
    this.onProgress = options.onProgress;
    this.onComplete = options.onComplete;
    this.onError = options.onError;

    this.chunks = new Array(options.totalChunks).fill(null);
  }

  public cancel(): void {
    this.isCancelled = true;
    this.chunks = [];
  }

  /**
   * Handle incoming raw ArrayBuffer chunk from RTCDataChannel
   */
  public async handleChunk(packetBuffer: ArrayBuffer): Promise<boolean> {
    if (this.isCancelled) return false;

    const parsed = parseBinaryChunkPacket(packetBuffer);
    if (!parsed || parsed.transferId !== this.transferId) {
      return false;
    }

    if (this.startTime === 0) {
      this.startTime = Date.now();
      this.lastProgressTime = this.startTime;
    }

    const { chunkIndex, payload } = parsed;

    if (!this.chunks[chunkIndex]) {
      this.chunks[chunkIndex] = payload;
      this.receivedChunkCount++;
      this.bytesReceived += payload.byteLength;
      this.bytesInWindow += payload.byteLength;
    }

    // Update progress metrics
    const now = Date.now();
    const elapsedWindow = now - this.lastProgressTime;
    if (elapsedWindow >= 200 || this.receivedChunkCount === this.totalChunks) {
      const instantSpeed = (this.bytesInWindow / elapsedWindow) * 1000;
      this.currentSpeed = this.currentSpeed === 0 ? instantSpeed : this.currentSpeed * 0.7 + instantSpeed * 0.3;
      this.lastProgressTime = now;
      this.bytesInWindow = 0;

      const remainingBytes = Math.max(0, this.fileSize - this.bytesReceived);
      const eta = this.currentSpeed > 0 ? Math.round(remainingBytes / this.currentSpeed) : 0;

      this.onProgress?.({
        bytesReceived: this.bytesReceived,
        totalBytes: this.fileSize,
        chunksReceived: this.receivedChunkCount,
        totalChunks: this.totalChunks,
        speedBytesPerSec: this.currentSpeed,
        estimatedSecondsRemaining: eta,
      });
    }

    // When all chunks are received, assemble Blob and verify checksum
    if (this.receivedChunkCount >= this.totalChunks) {
      await this.finalize();
      return true;
    }

    return false;
  }

  private async finalize(): Promise<void> {
    try {
      // Build final Blob from received chunks
      const parts: any[] = [];
      for (let i = 0; i < this.totalChunks; i++) {
        const chunk = this.chunks[i];
        if (!chunk) {
          throw new Error(`Missing chunk #${i} of ${this.totalChunks}`);
        }
        parts.push(chunk);
      }

      const fileBlob = new Blob(parts, { type: this.mimeType });
      const arrayBuffer = await fileBlob.arrayBuffer();
      const actualChecksum = await calculateSHA256(arrayBuffer);

      if (this.expectedChecksum && this.expectedChecksum !== actualChecksum) {
        throw new Error(
          `Checksum mismatch! Expected: ${this.expectedChecksum}, Got: ${actualChecksum}`
        );
      }

      // Free chunk references to keep memory low
      this.chunks = [];

      this.onComplete?.(fileBlob, actualChecksum);
    } catch (err: any) {
      this.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }

  /**
   * Helper to trigger native browser file download
   */
  public static triggerDownload(blob: Blob, fileName: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 1000);
  }
}
