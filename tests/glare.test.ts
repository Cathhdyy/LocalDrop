import { describe, it, expect, vi, beforeEach } from 'vitest';
import { P2PPeer } from '../packages/p2p/src/connection';

describe('P2PPeer WebRTC Glare and State Guards', () => {
  let mockSetRemoteDescription: any;
  let mockSetLocalDescription: any;
  let mockCreateOffer: any;
  let mockCreateAnswer: any;
  let mockAddIceCandidate: any;
  let mockSignalingState: string;

  beforeEach(() => {
    mockSignalingState = 'stable';
    mockSetRemoteDescription = vi.fn().mockImplementation(async () => {});
    mockSetLocalDescription = vi.fn().mockImplementation(async (desc) => {
      if (desc?.type === 'rollback') {
        mockSignalingState = 'stable';
      } else if (desc?.type === 'offer') {
        mockSignalingState = 'have-local-offer';
      } else if (desc?.type === 'answer') {
        mockSignalingState = 'stable';
      }
    });
    mockCreateOffer = vi.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-offer-sdp' });
    mockCreateAnswer = vi.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-answer-sdp' });
    mockAddIceCandidate = vi.fn().mockResolvedValue(undefined);

    (globalThis as any).RTCPeerConnection = class {
      public get signalingState() {
        return mockSignalingState;
      }
      public set signalingState(val) {
        mockSignalingState = val;
      }
      public createOffer = mockCreateOffer;
      public createAnswer = mockCreateAnswer;
      public setLocalDescription = mockSetLocalDescription;
      public setRemoteDescription = mockSetRemoteDescription;
      public addIceCandidate = mockAddIceCandidate;
      public createDataChannel = vi.fn().mockReturnValue({
        readyState: 'open',
        send: vi.fn(),
        close: vi.fn(),
      });
      public close = vi.fn();
      public getStats = vi.fn().mockResolvedValue(new Map());
      public onicecandidate: any = null;
      public onconnectionstatechange: any = null;
      public oniceconnectionstatechange: any = null;
      public ondatachannel: any = null;
    };

    (globalThis as any).RTCSessionDescription = class {
      constructor(public init: any) {
        Object.assign(this, init);
      }
    };

    (globalThis as any).RTCIceCandidate = class {
      constructor(public init: any) {
        Object.assign(this, init);
      }
    };
  });

  it('should deterministically assign polite and impolite roles based on peer IDs', () => {
    const politePeer = new P2PPeer('peer_aaa', true, { onSignal: vi.fn() }, 'peer_zzz');
    expect(politePeer.isPolite).toBe(true);

    const impolitePeer = new P2PPeer('peer_zzz', true, { onSignal: vi.fn() }, 'peer_aaa');
    expect(impolitePeer.isPolite).toBe(false);
  });

  it('should ignore incoming answers when in stable signaling state (avoiding InvalidStateError)', async () => {
    const onSignal = vi.fn();
    const peer = new P2PPeer('peer_b', false, { onSignal });

    mockSignalingState = 'stable';

    await peer.handleSignal({
      type: 'answer',
      sdp: 'unexpected-answer-sdp',
    });

    // Should NOT call setRemoteDescription because it is in 'stable' state
    expect(mockSetRemoteDescription).not.toHaveBeenCalled();
  });

  it('should accept remote answer when in have-local-offer state', async () => {
    const onSignal = vi.fn();
    const peer = new P2PPeer('peer_b', true, { onSignal });

    mockSignalingState = 'have-local-offer';

    await peer.handleSignal({
      type: 'answer',
      sdp: 'valid-answer-sdp',
    });

    expect(mockSetRemoteDescription).toHaveBeenCalled();
  });

  it('polite peer should rollback local offer upon offer collision (glare)', async () => {
    const onSignal = vi.fn();
    // polite peer: local 'peer_z' > target 'peer_a'
    const politePeer = new P2PPeer('peer_a', true, { onSignal }, 'peer_z');

    mockSignalingState = 'have-local-offer';

    await politePeer.handleSignal({
      type: 'offer',
      sdp: 'colliding-offer-sdp',
    });

    // Polite peer must issue a rollback before accepting remote offer
    expect(mockSetLocalDescription).toHaveBeenCalledWith({ type: 'rollback' });
    expect(mockSetRemoteDescription).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'offer', sdp: 'colliding-offer-sdp' })
    );
    expect(mockCreateAnswer).toHaveBeenCalled();
  });

  it('impolite peer should ignore incoming offer upon offer collision (glare)', async () => {
    const onSignal = vi.fn();
    // impolite peer: local 'peer_a' < target 'peer_z'
    const impolitePeer = new P2PPeer('peer_z', true, { onSignal }, 'peer_a');

    mockSignalingState = 'have-local-offer';

    await impolitePeer.handleSignal({
      type: 'offer',
      sdp: 'colliding-offer-sdp',
    });

    // Impolite peer ignores colliding offer
    expect(mockSetLocalDescription).not.toHaveBeenCalledWith({ type: 'rollback' });
    expect(mockSetRemoteDescription).not.toHaveBeenCalled();
  });
});
