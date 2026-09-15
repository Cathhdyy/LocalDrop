'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  DeviceInfo,
  DataChannelMessage,
  TransferProgress,
  TransferHistoryItem,
  SharedTextMessage,
  WebRTCDiagnostics,
  RTCSignalPayload,
} from '@localdrop/protocol';
import {
  P2PPeer,
  FileChunkSender,
  FileChunkReceiver,
  calculateSHA256,
} from '@localdrop/p2p';

export interface IncomingTransferPrompt {
  transferId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  senderName: string;
  peerId: string;
  totalChunks: number;
  checksum?: string;
}

export function useWebRTC(
  device: DeviceInfo,
  sendSignal: (targetPeerId: string, signal: RTCSignalPayload) => void,
  setSignalHandler: (handler: (senderPeerId: string, signal: RTCSignalPayload) => void) => void
) {
  const [activePeers, setActivePeers] = useState<Map<string, P2PPeer>>(new Map());
  const [connectedPeerIds, setConnectedPeerIds] = useState<string[]>([]);
  const [currentTransfer, setCurrentTransfer] = useState<TransferProgress | null>(null);
  const [incomingTransfer, setIncomingTransfer] = useState<IncomingTransferPrompt | null>(null);
  const [textMessages, setTextMessages] = useState<SharedTextMessage[]>([]);
  const [history, setHistory] = useState<TransferHistoryItem[]>([]);
  const [diagnostics, setDiagnostics] = useState<WebRTCDiagnostics>({
    iceConnectionState: 'uninitialized',
    connectionState: 'uninitialized',
    signalingState: 'uninitialized',
    dataChannelState: 'closed',
    rttMs: null,
    currentThroughputBytesPerSec: 0,
    bufferedAmount: 0,
    recentLogs: [],
  });

  const peersRef = useRef<Map<string, P2PPeer>>(new Map());
  const activeSenderRef = useRef<FileChunkSender | null>(null);
  const activeReceiverRef = useRef<FileChunkReceiver | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('localdrop_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const saveHistoryItem = useCallback((item: TransferHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.slice(0, 49)];
      try {
        localStorage.setItem('localdrop_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Initialize or retrieve a peer connection
  const getOrCreatePeer = useCallback(
    (targetPeerId: string, isInitiator: boolean): P2PPeer => {
      const existing = peersRef.current.get(targetPeerId);
      if (existing) return existing;

      const peer = new P2PPeer(targetPeerId, isInitiator, {
        onSignal: (sig) => {
          sendSignal(targetPeerId, sig);
        },
        onDataChannelOpen: () => {
          setConnectedPeerIds((prev) => Array.from(new Set([...prev, targetPeerId])));
          // Exchange device info
          peer.sendControlMessage({
            type: 'device-info',
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            platform: device.platform,
            timestamp: Date.now(),
          });
        },
        onDataChannelClose: () => {
          setConnectedPeerIds((prev) => prev.filter((id) => id !== targetPeerId));
        },
        onMessage: (msg: DataChannelMessage) => {
          handleDataChannelMessage(targetPeerId, msg);
        },
        onBinaryChunk: (buffer: ArrayBuffer) => {
          if (activeReceiverRef.current) {
            activeReceiverRef.current.handleChunk(buffer);
          }
        },
        onDiagnosticsUpdate: (diag) => {
          setDiagnostics(diag);
        },
        onError: (err) => {
          console.error(`Peer ${targetPeerId} error:`, err);
        },
      });

      peersRef.current.set(targetPeerId, peer);
      setActivePeers(new Map(peersRef.current));
      return peer;
    },
    [device, sendSignal]
  );

  // Connect to target peer
  const connectToPeer = useCallback(
    async (targetPeerId: string) => {
      const peer = getOrCreatePeer(targetPeerId, true);
      await peer.startOffer();
    },
    [getOrCreatePeer]
  );

  // Handle incoming signaling messages
  useEffect(() => {
    setSignalHandler((senderPeerId, signal) => {
      const isInitiator = false;
      const peer = getOrCreatePeer(senderPeerId, isInitiator);
      peer.handleSignal(signal);
    });
  }, [setSignalHandler, getOrCreatePeer]);

  // Handle RTCDataChannel JSON control messages
  const handleDataChannelMessage = useCallback(
    (senderPeerId: string, msg: DataChannelMessage) => {
      switch (msg.type) {
        case 'transfer-request': {
          setIncomingTransfer({
            transferId: msg.transferId,
            fileName: msg.fileName,
            fileSize: msg.fileSize,
            mimeType: msg.mimeType,
            senderName: 'Connected Peer',
            peerId: senderPeerId,
            totalChunks: msg.totalChunks,
            checksum: msg.checksum,
          });
          break;
        }

        case 'transfer-accept': {
          // Peer accepted our transfer request; start sending binary chunks
          if (activeSenderRef.current) {
            setCurrentTransfer((prev) => (prev ? { ...prev, state: 'TRANSFERRING' } : null));
            activeSenderRef.current.send().then((success) => {
              if (success && currentTransfer) {
                const peer = peersRef.current.get(senderPeerId);
                peer?.sendControlMessage({
                  type: 'transfer-complete',
                  transferId: currentTransfer.transferId,
                  checksum: currentTransfer.checksum || '',
                  totalBytes: currentTransfer.totalBytes,
                });

                setCurrentTransfer((prev) => (prev ? { ...prev, state: 'COMPLETED' } : null));

                saveHistoryItem({
                  id: currentTransfer.transferId,
                  fileName: currentTransfer.fileName,
                  fileSize: currentTransfer.totalBytes,
                  mimeType: currentTransfer.mimeType,
                  direction: 'sent',
                  peerName: currentTransfer.peerName,
                  peerId: senderPeerId,
                  state: 'COMPLETED',
                  timestamp: Date.now(),
                  durationMs: Date.now() - currentTransfer.startTime,
                  speedAvgBytesPerSec: currentTransfer.averageSpeed || currentTransfer.currentSpeed,
                  checksum: currentTransfer.checksum,
                });
              }
            });
          }
          break;
        }

        case 'transfer-reject': {
          if (activeSenderRef.current) {
            activeSenderRef.current.cancel();
            activeSenderRef.current = null;
          }
          setCurrentTransfer((prev) =>
            prev ? { ...prev, state: 'CANCELLED', error: msg.reason || 'Declined by recipient' } : null
          );
          break;
        }

        case 'transfer-cancel': {
          if (activeReceiverRef.current) {
            activeReceiverRef.current.cancel();
            activeReceiverRef.current = null;
          }
          if (activeSenderRef.current) {
            activeSenderRef.current.cancel();
            activeSenderRef.current = null;
          }
          setCurrentTransfer((prev) => (prev ? { ...prev, state: 'CANCELLED' } : null));
          setIncomingTransfer(null);
          break;
        }

        case 'transfer-complete': {
          // Finalized confirmation
          break;
        }

        case 'text-share': {
          const receivedItem: SharedTextMessage = {
            id: msg.id,
            text: msg.text,
            senderName: msg.senderName,
            senderId: senderPeerId,
            timestamp: msg.timestamp,
            direction: 'received',
          };
          setTextMessages((prev) => [receivedItem, ...prev]);
          break;
        }

        case 'rtt-ping': {
          const peer = peersRef.current.get(senderPeerId);
          peer?.sendControlMessage({ type: 'rtt-pong', timestamp: msg.timestamp });
          break;
        }
      }
    },
    [currentTransfer, saveHistoryItem]
  );

  // Send a file to a peer
  const sendFile = useCallback(
    async (targetPeerId: string, file: File, peerName: string) => {
      const peer = peersRef.current.get(targetPeerId);
      if (!peer || !peer.isConnected()) {
        throw new Error('Peer is not connected');
      }

      const transferId = 'tx_' + Math.random().toString(36).substring(2, 10);
      const chunkSize = 64 * 1024;
      const totalChunks = Math.ceil(file.size / chunkSize) || 1;

      // Pre-calculate SHA-256 checksum for small/medium files (< 100MB) for integrity verification
      let checksum: string | undefined = undefined;
      if (file.size <= 100 * 1024 * 1024) {
        try {
          const buffer = await file.slice(0, Math.min(file.size, 10 * 1024 * 1024)).arrayBuffer();
          checksum = await calculateSHA256(buffer);
        } catch (e) {}
      }

      const sender = new FileChunkSender(file, transferId, peer.getDataChannel()!, {
        chunkSize,
        onProgress: (p) => {
          setCurrentTransfer((prev) =>
            prev
              ? {
                  ...prev,
                  bytesTransferred: p.bytesTransferred,
                  chunksTransferred: p.chunkIndex,
                  currentSpeed: p.speedBytesPerSec,
                  estimatedSecondsRemaining: p.estimatedSecondsRemaining,
                }
              : null
          );
        },
      });

      activeSenderRef.current = sender;

      const progressItem: TransferProgress = {
        transferId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        state: 'WAITING',
        direction: 'sending',
        peerId: targetPeerId,
        peerName,
        bytesTransferred: 0,
        totalBytes: file.size,
        chunksTransferred: 0,
        totalChunks,
        currentSpeed: 0,
        averageSpeed: 0,
        estimatedSecondsRemaining: 0,
        startTime: Date.now(),
        checksum,
      };

      setCurrentTransfer(progressItem);

      // Send transfer request
      peer.sendControlMessage({
        type: 'transfer-request',
        transferId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        totalChunks,
        chunkSize,
        checksum,
      });
    },
    []
  );

  // Accept incoming transfer
  const acceptIncomingTransfer = useCallback(() => {
    if (!incomingTransfer) return;

    const { transferId, fileName, fileSize, mimeType, totalChunks, peerId, senderName, checksum } =
      incomingTransfer;

    const peer = peersRef.current.get(peerId);
    if (!peer) return;

    const receiver = new FileChunkReceiver({
      transferId,
      fileName,
      fileSize,
      mimeType,
      totalChunks,
      expectedChecksum: checksum,
      onProgress: (p) => {
        setCurrentTransfer((prev) =>
          prev
            ? {
                ...prev,
                bytesTransferred: p.bytesReceived,
                chunksTransferred: p.chunksReceived,
                currentSpeed: p.speedBytesPerSec,
                estimatedSecondsRemaining: p.estimatedSecondsRemaining,
              }
            : null
        );
      },
      onComplete: (blob, actualChecksum) => {
        // Trigger file download
        FileChunkReceiver.triggerDownload(blob, fileName);

        setCurrentTransfer((prev) => (prev ? { ...prev, state: 'COMPLETED' } : null));

        saveHistoryItem({
          id: transferId,
          fileName,
          fileSize,
          mimeType,
          direction: 'received',
          peerName: senderName,
          peerId,
          state: 'COMPLETED',
          timestamp: Date.now(),
          durationMs: Date.now() - (currentTransfer?.startTime || Date.now()),
          speedAvgBytesPerSec: currentTransfer?.currentSpeed || 0,
          checksum: actualChecksum,
        });

        activeReceiverRef.current = null;
      },
      onError: (err) => {
        setCurrentTransfer((prev) =>
          prev ? { ...prev, state: 'FAILED', error: err.message } : null
        );
      },
    });

    activeReceiverRef.current = receiver;

    setCurrentTransfer({
      transferId,
      fileName,
      fileSize,
      mimeType,
      state: 'TRANSFERRING',
      direction: 'receiving',
      peerId,
      peerName: senderName,
      bytesTransferred: 0,
      totalBytes: fileSize,
      chunksTransferred: 0,
      totalChunks,
      currentSpeed: 0,
      averageSpeed: 0,
      estimatedSecondsRemaining: 0,
      startTime: Date.now(),
      checksum,
    });

    peer.sendControlMessage({
      type: 'transfer-accept',
      transferId,
    });

    setIncomingTransfer(null);
  }, [incomingTransfer, currentTransfer, saveHistoryItem]);

  // Reject incoming transfer
  const rejectIncomingTransfer = useCallback(() => {
    if (!incomingTransfer) return;
    const peer = peersRef.current.get(incomingTransfer.peerId);
    peer?.sendControlMessage({
      type: 'transfer-reject',
      transferId: incomingTransfer.transferId,
      reason: 'Rejected by user',
    });
    setIncomingTransfer(null);
  }, [incomingTransfer]);

  // Cancel active transfer
  const cancelTransfer = useCallback(() => {
    if (activeSenderRef.current) {
      activeSenderRef.current.cancel();
      activeSenderRef.current = null;
    }
    if (activeReceiverRef.current) {
      activeReceiverRef.current.cancel();
      activeReceiverRef.current = null;
    }

    if (currentTransfer) {
      const peer = peersRef.current.get(currentTransfer.peerId);
      peer?.sendControlMessage({
        type: 'transfer-cancel',
        transferId: currentTransfer.transferId,
      });

      saveHistoryItem({
        id: currentTransfer.transferId,
        fileName: currentTransfer.fileName,
        fileSize: currentTransfer.totalBytes,
        mimeType: currentTransfer.mimeType,
        direction: currentTransfer.direction === 'sending' ? 'sent' : 'received',
        peerName: currentTransfer.peerName,
        peerId: currentTransfer.peerId,
        state: 'CANCELLED',
        timestamp: Date.now(),
        durationMs: Date.now() - currentTransfer.startTime,
        speedAvgBytesPerSec: currentTransfer.currentSpeed,
      });

      setCurrentTransfer((prev) => (prev ? { ...prev, state: 'CANCELLED' } : null));
    }
  }, [currentTransfer, saveHistoryItem]);

  // Send shared text
  const sendText = useCallback(
    (targetPeerId: string, text: string) => {
      const peer = peersRef.current.get(targetPeerId);
      if (!peer || !peer.isConnected()) return false;

      const item: SharedTextMessage = {
        id: 'txt_' + Math.random().toString(36).substring(2, 10),
        text,
        senderName: device.deviceName,
        senderId: device.deviceId,
        timestamp: Date.now(),
        direction: 'sent',
      };

      peer.sendControlMessage({
        type: 'text-share',
        id: item.id,
        text: item.text,
        timestamp: item.timestamp,
        senderName: item.senderName,
      });

      setTextMessages((prev) => [item, ...prev]);
      return true;
    },
    [device]
  );

  return {
    connectedPeerIds,
    currentTransfer,
    incomingTransfer,
    textMessages,
    history,
    diagnostics,
    connectToPeer,
    sendFile,
    acceptIncomingTransfer,
    rejectIncomingTransfer,
    cancelTransfer,
    sendText,
    clearCurrentTransfer: () => setCurrentTransfer(null),
  };
}
