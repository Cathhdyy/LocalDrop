import {
  DEFAULT_ICE_SERVERS,
  DataChannelMessage,
  WebRTCDiagnostics,
  RTCSignalPayload,
} from '@localdrop/protocol';

export interface PeerConnectionCallbacks {
  onSignal: (signal: RTCSignalPayload) => void;
  onDataChannelOpen?: () => void;
  onDataChannelClose?: () => void;
  onMessage?: (message: DataChannelMessage) => void;
  onBinaryChunk?: (buffer: ArrayBuffer) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onDiagnosticsUpdate?: (diag: WebRTCDiagnostics) => void;
  onError?: (error: Error) => void;
}

export class P2PPeer {
  public readonly peerId: string;
  public readonly isInitiator: boolean;
  public readonly isPolite: boolean;
  private pc: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;
  private callbacks: PeerConnectionCallbacks;
  private statsInterval: any = null;
  private lastBytesSent = 0;
  private lastBytesReceived = 0;
  private lastStatsTime = 0;
  private pendingIceCandidates: any[] = [];
  private logs: Array<{ timestamp: number; level: 'info' | 'warn' | 'error'; message: string }> = [];

  constructor(
    peerId: string,
    isInitiator: boolean,
    callbacks: PeerConnectionCallbacks,
    localPeerId?: string
  ) {
    this.peerId = peerId;
    this.isInitiator = isInitiator;
    this.callbacks = callbacks;
    // Deterministic polite peer resolution: if IDs are known, higher ID yields (polite)
    this.isPolite = localPeerId ? localPeerId > peerId : !isInitiator;

    this.pc = new RTCPeerConnection({
      iceServers: DEFAULT_ICE_SERVERS,
    });

    this.setupPeerConnection();

    // Always listen for incoming data channels (essential during glare rollback)
    this.pc.ondatachannel = (event) => {
      this.log('info', 'Incoming RTCDataChannel received');
      this.setupDataChannel(event.channel);
    };

    if (this.isInitiator) {
      this.setupDataChannel(this.pc.createDataChannel('localdrop-transfer', { ordered: true }));
    }

    this.startStatsMonitor();
  }

  private log(level: 'info' | 'warn' | 'error', message: string) {
    const entry = { timestamp: Date.now(), level, message };
    this.logs.push(entry);
    if (this.logs.length > 50) this.logs.shift();
  }

  private setupPeerConnection() {
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.callbacks.onSignal({
          type: 'candidate',
          candidate: event.candidate.toJSON(),
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      this.log('info', `Connection state changed to: ${this.pc.connectionState}`);
      this.callbacks.onConnectionStateChange?.(this.pc.connectionState);
    };

    this.pc.oniceconnectionstatechange = () => {
      this.log('info', `ICE connection state: ${this.pc.iceConnectionState}`);
    };
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;
    this.dataChannel.binaryType = 'arraybuffer';

    this.dataChannel.onopen = () => {
      this.log('info', 'RTCDataChannel opened');
      this.callbacks.onDataChannelOpen?.();
    };

    // WebKit / iOS Safari quirk: channel can already be 'open' when ondatachannel fires
    if (this.dataChannel.readyState === 'open') {
      this.log('info', 'RTCDataChannel was already open on setup');
      setTimeout(() => {
        this.callbacks.onDataChannelOpen?.();
      }, 0);
    }

    this.dataChannel.onclose = () => {
      this.log('warn', 'RTCDataChannel closed');
      this.callbacks.onDataChannelClose?.();
    };

    this.dataChannel.onerror = (err) => {
      this.log('error', `RTCDataChannel error: ${err}`);
      this.callbacks.onError?.(new Error('RTCDataChannel error'));
    };

    this.dataChannel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data);
          this.callbacks.onMessage?.(parsed);
        } catch (e) {
          this.log('warn', `Failed to parse control message: ${event.data}`);
        }
      } else if (event.data instanceof ArrayBuffer) {
        this.callbacks.onBinaryChunk?.(event.data);
      }
    };
  }

  public async startOffer(): Promise<void> {
    if (!this.isInitiator) return;
    if (this.pc.signalingState === 'closed') return;
    if (this.pc.signalingState !== 'stable') {
      this.log('warn', `Cannot start offer in signaling state: ${this.pc.signalingState}`);
      return;
    }
    try {
      const offer = await this.pc.createOffer();
      if (this.pc.signalingState !== 'stable') return;
      await this.pc.setLocalDescription(offer);
      this.log('info', 'Created and set local offer description');
      this.callbacks.onSignal({
        type: 'offer',
        sdp: offer.sdp || '',
      });
    } catch (err: any) {
      this.log('error', `Failed to create offer: ${err.message}`);
      this.callbacks.onError?.(err);
    }
  }

  public async handleSignal(signal: RTCSignalPayload): Promise<void> {
    if (this.pc.signalingState === 'closed') return;
    try {
      if (signal.type === 'offer') {
        const offerCollision = this.pc.signalingState !== 'stable';
        if (offerCollision) {
          if (!this.isPolite) {
            this.log('warn', 'Offer collision detected: impolite peer ignoring incoming offer');
            return;
          }
          this.log('info', 'Offer collision detected: polite peer rolling back local offer');
          await this.pc.setLocalDescription({ type: 'rollback' });
        }

        await this.pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: signal.sdp }));
        await this.drainPendingCandidates();
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        this.log('info', 'Handled offer and sent answer');
        this.callbacks.onSignal({
          type: 'answer',
          sdp: answer.sdp || '',
        });
      } else if (signal.type === 'answer') {
        if (this.pc.signalingState !== 'have-local-offer') {
          this.log('warn', `Ignoring remote answer received in signaling state: ${this.pc.signalingState}`);
          return;
        }
        await this.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }));
        await this.drainPendingCandidates();
        this.log('info', 'Handled remote answer');
      } else if (signal.type === 'candidate' && signal.candidate) {
        if (!this.pc.remoteDescription || !this.pc.remoteDescription.type) {
          this.log('info', 'Remote description not set yet; queueing ICE candidate');
          this.pendingIceCandidates.push(signal.candidate);
        } else {
          try {
            await this.pc.addIceCandidate(signal.candidate);
          } catch (e: any) {
            this.log('warn', `Failed to add ICE candidate: ${e?.message || e}`);
          }
        }
      }
    } catch (err: any) {
      this.log('error', `Signaling handling error: ${err.message}`);
      this.callbacks.onError?.(err);
    }
  }

  private async drainPendingCandidates(): Promise<void> {
    if (this.pendingIceCandidates.length === 0) return;
    this.log('info', `Draining ${this.pendingIceCandidates.length} queued ICE candidate(s)`);
    const queued = [...this.pendingIceCandidates];
    this.pendingIceCandidates = [];
    for (const cand of queued) {
      try {
        if (cand) {
          await this.pc.addIceCandidate(cand);
        }
      } catch (e: any) {
        this.log('warn', `Failed to add queued ICE candidate: ${e?.message || e}`);
      }
    }
  }

  public updateCallbacks(newCallbacks: Partial<PeerConnectionCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...newCallbacks };
  }

  public sendControlMessage(msg: DataChannelMessage): boolean {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return false;
    }
    this.dataChannel.send(JSON.stringify(msg));
    return true;
  }

  public getDataChannel(): RTCDataChannel | null {
    return this.dataChannel;
  }

  public isConnected(): boolean {
    return this.dataChannel !== null && this.dataChannel.readyState === 'open';
  }

  public isClosedOrFailed(): boolean {
    return (
      this.pc.signalingState === 'closed' ||
      this.pc.connectionState === 'closed' ||
      this.pc.connectionState === 'failed' ||
      this.pc.iceConnectionState === 'closed' ||
      this.pc.iceConnectionState === 'failed'
    );
  }

  private startStatsMonitor() {
    this.lastStatsTime = Date.now();
    this.statsInterval = setInterval(async () => {
      if (!this.pc || this.pc.signalingState === 'closed') return;
      try {
        const stats = await this.pc.getStats();
        let rttMs: number | null = null;
        let bytesSent = 0;
        let bytesReceived = 0;
        let packetsSent = 0;
        let packetsReceived = 0;

        stats.forEach((report) => {
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            if (report.currentRoundTripTime !== undefined) {
              rttMs = Math.round(report.currentRoundTripTime * 1000);
            }
          }
          if (report.type === 'data-channel') {
            bytesSent += report.bytesSent || 0;
            bytesReceived += report.bytesReceived || 0;
            packetsSent += report.messagesSent || 0;
            packetsReceived += report.messagesReceived || 0;
          }
        });

        const now = Date.now();
        const elapsedSec = (now - this.lastStatsTime) / 1000;
        const deltaBytes = (bytesSent - this.lastBytesSent) + (bytesReceived - this.lastBytesReceived);
        const currentThroughput = elapsedSec > 0 ? deltaBytes / elapsedSec : 0;

        this.lastBytesSent = bytesSent;
        this.lastBytesReceived = bytesReceived;
        this.lastStatsTime = now;

        const diag: WebRTCDiagnostics = {
          iceConnectionState: this.pc.iceConnectionState,
          connectionState: this.pc.connectionState,
          signalingState: this.pc.signalingState,
          dataChannelState: this.dataChannel ? this.dataChannel.readyState : 'closed',
          rttMs,
          currentThroughputBytesPerSec: Math.max(0, currentThroughput),
          bufferedAmount: this.dataChannel ? this.dataChannel.bufferedAmount : 0,
          packetsSent,
          packetsReceived,
          bytesSent,
          bytesReceived,
          recentLogs: [...this.logs],
        };

        this.callbacks.onDiagnosticsUpdate?.(diag);
      } catch (e) {
        // Ignore stats errors during shutdown
      }
    }, 1000);
  }

  public close(): void {
    if (this.statsInterval) clearInterval(this.statsInterval);
    if (this.dataChannel) {
      try {
        this.dataChannel.close();
      } catch (e) {}
    }
    try {
      this.pc.close();
    } catch (e) {}
  }
}
