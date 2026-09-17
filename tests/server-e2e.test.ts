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

  it('should prevent senderPeerId spoofing and enforce authenticated socket identity', async () => {
    const wsX = new WebSocket(wsUrl);
    const wsY = new WebSocket(wsUrl);

    await Promise.all([
      new Promise<void>((resolve) => wsX.on('open', resolve)),
      new Promise<void>((resolve) => wsY.on('open', resolve)),
    ]);

    const realDeviceX = {
      deviceId: 'device-real-x',
      deviceName: 'Real Device X',
      platform: 'linux' as const,
    };

    const targetDeviceY = {
      deviceId: 'device-target-y',
      deviceName: 'Target Device Y',
      platform: 'android' as const,
    };

    // Join room
    wsX.send(JSON.stringify({ type: 'join-room', roomId: 'room-security', device: realDeviceX }));
    wsY.send(JSON.stringify({ type: 'join-room', roomId: 'room-security', device: targetDeviceY }));

    // Drain initial join messages
    await new Promise((r) => setTimeout(r, 80));

    // Device X attempts to send pairing request claiming to be someone else ('spoofed-peer-id')
    const spoofPromise = new Promise<SignalingMessage>((resolve) => {
      wsY.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'pairing-request') resolve(parsed);
      });
    });

    wsX.send(
      JSON.stringify({
        type: 'pairing-request',
        targetPeerId: targetDeviceY.deviceId,
        senderPeerId: 'spoofed-peer-id', // <--- Forged ID
        device: { deviceId: 'spoofed-peer-id', deviceName: 'Spoofed Device', platform: 'ios' },
      })
    );

    const received = (await spoofPromise) as any;
    // Server should override spoofed ID with the actual registered socket ID
    expect(received.senderPeerId).toBe(realDeviceX.deviceId);
    expect(received.device.deviceId).toBe(realDeviceX.deviceId);

    wsX.close();
    wsY.close();
  });

  it('should broadcast peer-left to old room when a peer switches rooms on the same socket', async () => {
    const ws1 = new WebSocket(wsUrl);
    const ws2 = new WebSocket(wsUrl);

    await Promise.all([
      new Promise<void>((resolve) => ws1.on('open', resolve)),
      new Promise<void>((resolve) => ws2.on('open', resolve)),
    ]);

    const dev1 = { deviceId: 'dev-switch-1', deviceName: 'Device 1', platform: 'windows' as const };
    const dev2 = { deviceId: 'dev-switch-2', deviceName: 'Device 2', platform: 'macos' as const };

    ws1.send(JSON.stringify({ type: 'join-room', roomId: 'room-orig', device: dev1 }));
    ws2.send(JSON.stringify({ type: 'join-room', roomId: 'room-orig', device: dev2 }));

    await new Promise((r) => setTimeout(r, 60));

    const leftPromise = new Promise<SignalingMessage>((resolve) => {
      ws2.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'peer-left') resolve(parsed);
      });
    });

    // dev1 switches to room-new on the same socket
    ws1.send(JSON.stringify({ type: 'join-room', roomId: 'room-new', device: dev1 }));

    const leftMsg = (await leftPromise) as any;
    expect(leftMsg.type).toBe('peer-left');
    expect(leftMsg.peerId).toBe(dev1.deviceId);

    ws1.close();
    ws2.close();
  });
});
