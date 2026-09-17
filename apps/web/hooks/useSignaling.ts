'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DeviceInfo, SignalingMessage, RTCSignalPayload } from '@localdrop/protocol';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface IncomingPairingRequest {
  senderPeerId: string;
  device: DeviceInfo;
}

export function useSignaling(device: DeviceInfo, roomId: string) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [peers, setPeers] = useState<DeviceInfo[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [incomingPairingRequest, setIncomingPairingRequest] = useState<IncomingPairingRequest | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const signalHandlerRef = useRef<((senderPeerId: string, signal: RTCSignalPayload) => void) | null>(null);
  const pairingResponseHandlerRef = useRef<((senderPeerId: string, accepted: boolean) => void) | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    if (typeof window === 'undefined' || device.deviceId === 'init') return;

    // Determine WebSocket URL (supports custom external signaling for Vercel/cloud deployments)
    const customUrl =
      process.env.NEXT_PUBLIC_SIGNALING_URL ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('localdrop_signaling_url') : null);

    let wsUrl: string;
    if (customUrl) {
      wsUrl = customUrl.replace(/^http/i, 'ws');
      if (!wsUrl.endsWith('/ws') && !wsUrl.includes('?')) {
        wsUrl = wsUrl.replace(/\/$/, '') + '/ws';
      }
    } else {
      const hostname = window.location.hostname;
      const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
      const isLocalIP =
        /^192\.168\./.test(hostname) ||
        /^10\./.test(hostname) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

      if (isLocalHost || isLocalIP) {
        // Local CLI or local dev server
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        let host = window.location.host;
        if (host.includes(':3000')) {
          host = hostname + ':8787';
        }
        wsUrl = `${protocol}//${host}/ws`;
      } else {
        // Cloud production (Vercel, custom domains, etc.)
        // Serverless Vercel frontend cannot host persistent WebSockets,
        // so route signaling to the Railway production signaling cluster.
        wsUrl = 'wss://localdrop-signaling-production.up.railway.app/ws';
      }
    }

    setStatus('connecting');

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        console.log('[LocalDrop Signaling] Connected to', wsUrl);
        // Join room with our device info
        ws.send(
          JSON.stringify({
            type: 'join-room',
            roomId,
            device,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as SignalingMessage;

          switch (msg.type) {
            case 'room-joined': {
              setPeers(msg.peers);
              setIsHost(msg.isHost);
              break;
            }

            case 'peer-joined': {
              setPeers((prev) => {
                const filtered = prev.filter((p) => p.deviceId !== msg.peer.deviceId);
                return [...filtered, msg.peer];
              });
              break;
            }

            case 'peer-left': {
              setPeers((prev) => prev.filter((p) => p.deviceId !== msg.peerId));
              break;
            }

            case 'pairing-request': {
              setIncomingPairingRequest({
                senderPeerId: msg.senderPeerId,
                device: msg.device,
              });
              break;
            }

            case 'pairing-response': {
              pairingResponseHandlerRef.current?.(msg.senderPeerId, msg.accepted);
              break;
            }

            case 'signal': {
              signalHandlerRef.current?.(msg.senderPeerId, msg.signal);
              break;
            }
          }
        } catch (e) {
          console.error('Failed to parse signaling message', e);
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        // Attempt reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        setStatus('disconnected');
        try {
          ws.close();
        } catch (e) {}
      };
    } catch (e) {
      setStatus('disconnected');
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    }
  }, [device, roomId]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendSignal = useCallback((targetPeerId: string, signal: RTCSignalPayload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'signal',
          targetPeerId,
          senderPeerId: device.deviceId,
          signal,
        })
      );
    }
  }, [device.deviceId]);

  const requestPairing = useCallback((targetPeerId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        resolve(false);
        return;
      }

      let timeoutTimer: NodeJS.Timeout | null = null;

      pairingResponseHandlerRef.current = (senderId, accepted) => {
        if (senderId === targetPeerId) {
          if (timeoutTimer) clearTimeout(timeoutTimer);
          pairingResponseHandlerRef.current = null;
          resolve(accepted);
        }
      };

      wsRef.current.send(
        JSON.stringify({
          type: 'pairing-request',
          targetPeerId,
          senderPeerId: device.deviceId,
          device,
        })
      );

      // Timeout pairing request after 30s
      timeoutTimer = setTimeout(() => {
        pairingResponseHandlerRef.current = null;
        resolve(false);
      }, 30000);
    });
  }, [device]);

  const respondPairing = useCallback((targetPeerId: string, accepted: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'pairing-response',
          targetPeerId,
          senderPeerId: device.deviceId,
          accepted,
        })
      );
    }
    setIncomingPairingRequest(null);
  }, [device.deviceId]);

  const setSignalHandler = useCallback((handler: (senderPeerId: string, signal: RTCSignalPayload) => void) => {
    signalHandlerRef.current = handler;
  }, []);

  return {
    status,
    peers,
    isHost,
    incomingPairingRequest,
    sendSignal,
    requestPairing,
    respondPairing,
    setSignalHandler,
  };
}
