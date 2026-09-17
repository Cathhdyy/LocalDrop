import { WebSocket } from 'ws';
import { DeviceInfo, SignalingMessage } from '@localdrop/protocol';

export interface ConnectedPeer {
  id: string;
  ws: WebSocket;
  device: DeviceInfo;
  roomId: string;
  isHost: boolean;
  lastSeen: number;
  approvedPeers: Set<string>; // peers approved for P2P connection
}

export class RoomManager {
  // Map of roomId -> Set of peerIds
  private rooms: Map<string, Set<string>> = new Map();
  // Map of peerId -> ConnectedPeer
  private peers: Map<string, ConnectedPeer> = new Map();
  // Map of ws -> peerId
  private wsToPeerId: Map<WebSocket, string> = new Map();

  public registerPeer(
    ws: WebSocket,
    roomId: string,
    device: DeviceInfo
  ): { peer: ConnectedPeer; existingPeers: DeviceInfo[] } {
    const prevPeer = this.getPeerByWs(ws);
    if (prevPeer && prevPeer.roomId !== roomId) {
      this.broadcastToRoom(prevPeer.roomId, {
        type: 'peer-left',
        peerId: prevPeer.id,
      });
    }

    // Remove existing if any
    this.removePeerByWs(ws);

    const peerId = device.deviceId;
    let room = this.rooms.get(roomId);
    const isFirstInRoom = !room || room.size === 0;

    if (!room) {
      room = new Set();
      this.rooms.set(roomId, room);
    }

    const peer: ConnectedPeer = {
      id: peerId,
      ws,
      device: { ...device, isHost: isFirstInRoom },
      roomId,
      isHost: isFirstInRoom,
      lastSeen: Date.now(),
      approvedPeers: new Set(),
    };

    room.add(peerId);
    this.peers.set(peerId, peer);
    this.wsToPeerId.set(ws, peerId);

    // Collect info on existing peers in room
    const existingPeers: DeviceInfo[] = [];
    for (const existingId of room) {
      if (existingId !== peerId) {
        const p = this.peers.get(existingId);
        if (p) existingPeers.push(p.device);
      }
    }

    return { peer, existingPeers };
  }

  public getPeerById(peerId: string): ConnectedPeer | undefined {
    return this.peers.get(peerId);
  }

  public getPeerByWs(ws: WebSocket): ConnectedPeer | undefined {
    const peerId = this.wsToPeerId.get(ws);
    return peerId ? this.peers.get(peerId) : undefined;
  }

  public getRoomPeers(roomId: string): ConnectedPeer[] {
    const peerIds = this.rooms.get(roomId);
    if (!peerIds) return [];
    const result: ConnectedPeer[] = [];
    for (const id of peerIds) {
      const p = this.peers.get(id);
      if (p) result.push(p);
    }
    return result;
  }

  public approvePairing(peerAId: string, peerBId: string): void {
    const peerA = this.peers.get(peerAId);
    const peerB = this.peers.get(peerBId);
    if (peerA) peerA.approvedPeers.add(peerBId);
    if (peerB) peerB.approvedPeers.add(peerAId);
  }

  public isPairingApproved(peerAId: string, peerBId: string): boolean {
    const peerA = this.peers.get(peerAId);
    return peerA ? peerA.approvedPeers.has(peerBId) : false;
  }

  public sendToPeer(peerId: string, message: SignalingMessage): boolean {
    const peer = this.peers.get(peerId);
    if (!peer || peer.ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    try {
      peer.ws.send(JSON.stringify(message));
      return true;
    } catch (e) {
      return false;
    }
  }

  public broadcastToRoom(roomId: string, message: SignalingMessage, excludePeerId?: string): void {
    const peers = this.getRoomPeers(roomId);
    const serialized = JSON.stringify(message);
    for (const peer of peers) {
      if (peer.id !== excludePeerId && peer.ws.readyState === WebSocket.OPEN) {
        try {
          peer.ws.send(serialized);
        } catch (e) {}
      }
    }
  }

  public removePeerByWs(ws: WebSocket): ConnectedPeer | null {
    const peerId = this.wsToPeerId.get(ws);
    if (!peerId) return null;

    const peer = this.peers.get(peerId);
    this.wsToPeerId.delete(ws);
    this.peers.delete(peerId);

    if (peer) {
      const room = this.rooms.get(peer.roomId);
      if (room) {
        room.delete(peerId);
        if (room.size === 0) {
          this.rooms.delete(peer.roomId);
        }
      }
    }

    return peer || null;
  }

  public updateHeartbeat(ws: WebSocket): void {
    const peer = this.getPeerByWs(ws);
    if (peer) {
      peer.lastSeen = Date.now();
    }
  }

  public cleanStalePeers(timeoutMs: number): ConnectedPeer[] {
    const now = Date.now();
    const removed: ConnectedPeer[] = [];
    for (const [peerId, peer] of Array.from(this.peers.entries())) {
      if (now - peer.lastSeen > timeoutMs) {
        const removedPeer = this.removePeerByWs(peer.ws);
        if (removedPeer) {
          removed.push(removedPeer);
        }
        try {
          peer.ws.terminate();
        } catch (e) {}
      }
    }
    return removed;
  }
}
