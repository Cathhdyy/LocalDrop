import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { WebSocket } from 'ws';
import { createSignalingServer } from '../apps/signaling/src/server';
import { SignalingMessage } from '../packages/protocol/src/types';

describe('Signaling Server & Room Pairing E2E', () => {
  let server: ReturnType<typeof createSignalingServer>;
  const testPort = 8789;
  const wsUrl = `ws://localhost:${testPort}/ws`;

  beforeAll(async () => {
    server = createSignalingServer({ port: testPort });
    await server.start();
  });

  afterAll(async () => {
    await server.close();
  });

  it('should allow two devices to discover each other, request pairing, and exchange WebRTC signals', async () => {
    // Device A (PC)
    const wsA = new WebSocket(wsUrl);
    // Device B (Phone)
    const wsB = new WebSocket(wsUrl);

    await Promise.all([
      new Promise<void>((resolve) => wsA.on('open', resolve)),
      new Promise<void>((resolve) => wsB.on('open', resolve)),
    ]);

    const deviceA = {
      deviceId: 'device-pc-1',
      deviceName: "Simran's PC",
      platform: 'windows' as const,
    };

    const deviceB = {
      deviceId: 'device-phone-2',
      deviceName: 'iPhone 15',
      platform: 'ios' as const,
    };

    // Device A joins room
    wsA.send(
      JSON.stringify({
        type: 'join-room',
        roomId: 'room-alpha',
        device: deviceA,
      })
    );

    // Wait for room-joined on A
    const msgA1 = await new Promise<SignalingMessage>((resolve) => {
      wsA.once('message', (data) => resolve(JSON.parse(data.toString())));
    });
    expect(msgA1.type).toBe('room-joined');

    // Device B joins room
    const peerJoinedPromise = new Promise<SignalingMessage>((resolve) => {
      wsA.once('message', (data) => resolve(JSON.parse(data.toString())));
    });

    wsB.send(
      JSON.stringify({
        type: 'join-room',
        roomId: 'room-alpha',
        device: deviceB,
      })
    );

    // Device A should be notified that Device B joined
    const peerJoinedMsg = (await peerJoinedPromise) as any;
    expect(peerJoinedMsg.type).toBe('peer-joined');
    expect(peerJoinedMsg.peer.deviceId).toBe(deviceB.deviceId);

    // Device B initiates pairing request to Device A
    const pairingRequestPromise = new Promise<SignalingMessage>((resolve) => {
      wsA.once('message', (data) => resolve(JSON.parse(data.toString())));
    });

    wsB.send(
      JSON.stringify({
        type: 'pairing-request',
        targetPeerId: deviceA.deviceId,
        senderPeerId: deviceB.deviceId,
        device: deviceB,
      })
    );

    const receivedPairingRequest = (await pairingRequestPromise) as any;
    expect(receivedPairingRequest.type).toBe('pairing-request');
    expect(receivedPairingRequest.device.deviceName).toBe('iPhone 15');

    // Device A approves pairing
    const pairingResponsePromise = new Promise<SignalingMessage>((resolve) => {
      wsB.once('message', (data) => resolve(JSON.parse(data.toString())));
    });

    wsA.send(
      JSON.stringify({
        type: 'pairing-response',
        targetPeerId: deviceB.deviceId,
        senderPeerId: deviceA.deviceId,
        accepted: true,
      })
    );

    const receivedPairingResponse = (await pairingResponsePromise) as any;
    expect(receivedPairingResponse.type).toBe('pairing-response');
    expect(receivedPairingResponse.accepted).toBe(true);

    // Exchange WebRTC offer signal
    const signalPromise = new Promise<SignalingMessage>((resolve) => {
      wsB.once('message', (data) => resolve(JSON.parse(data.toString())));
    });

    wsA.send(
      JSON.stringify({
        type: 'signal',
        targetPeerId: deviceB.deviceId,
        senderPeerId: deviceA.deviceId,
        signal: { type: 'offer', sdp: 'v=0\r\no=- 12345 2 IN IP4 127.0.0.1...' },
      })
    );

    const receivedSignal = (await signalPromise) as any;
    expect(receivedSignal.type).toBe('signal');
    expect(receivedSignal.signal.type).toBe('offer');
    expect(receivedSignal.senderPeerId).toBe(deviceA.deviceId);

    wsA.close();
    wsB.close();
  });
});
