'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  DeviceInfo,
  DataChannelMessage,
  TransferProgress,
  TransferHistoryItem,
  SharedTextMessage,
  SharedClipboardItem,
  WebRTCDiagnostics,
  RTCSignalPayload,
  sanitizeFileName,
} from '@localdrop/protocol';
import {
  P2PPeer,
  FileChunkSender,
  FileChunkReceiver,
  calculateSHA256,
} from '@localdrop/p2p';

export function detectContentType(content: string): 'text' | 'url' | 'code' | 'color' {
  const trimmed = content.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed) || /^rgba?\((\d+,\s*){2,3}\d+(\.\d+)?\)$/i.test(trimmed)) {
    return 'color';
  }
  if (/^https?:\/\/[^\s]+$/i.test(trimmed)) {
    return 'url';
  }
  if (
    trimmed.includes('const ') ||
    trimmed.includes('function ') ||
    trimmed.includes('import ') ||
    trimmed.includes('export ') ||
    trimmed.includes('class ') ||
    trimmed.includes('def ') ||
    trimmed.includes('return ') ||
    trimmed.includes('=>') ||
    trimmed.includes('{}') ||
    (trimmed.includes('{') && trimmed.includes('}')) ||
    trimmed.split('\n').length > 3
  ) {
    return 'code';
  }
  return 'text';
}

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
  const [clipboardItems, setClipboardItems] = useState<SharedClipboardItem[]>([]);
  const [incomingClipboardPill, setIncomingClipboardPill] = useState<SharedClipboardItem | null>(null);
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
  const currentTransferRef = useRef<TransferProgress | null>(null);
  const currentSenderMetaRef = useRef<{
    transferId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    peerId: string;
    peerName: string;
    startTime: number;
    checksum?: string;
  } | null>(null);
  const handleDataChannelMessageRef = useRef<((senderPeerId: string, msg: DataChannelMessage) => void) | null>(null);
  const transferQueueRef = useRef<Array<{ targetPeerId: string; file: File; peerName: string }>>([]);
  const processNextQueueItemRef = useRef<(() => void) | null>(null);
  const wakeLockRef = useRef<any>(null);

  const updateCurrentTransfer = useCallback(
    (updater: TransferProgress | null | ((prev: TransferProgress | null) => TransferProgress | null)) => {
      setCurrentTransfer((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        currentTransferRef.current = next;
        return next;
      });
    },
    []
  );

  // Screen WakeLock to keep screen on during active transfers (iOS / Android)
  useEffect(() => {
    const isTransferring = currentTransfer?.state === 'TRANSFERRING';

    const acquireLock = async () => {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          if (!wakeLockRef.current) {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
            wakeLockRef.current.addEventListener('release', () => {
              wakeLockRef.current = null;
            });
          }
        } catch (e) {}
      }
    };

    const releaseLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch (e) {}
        wakeLockRef.current = null;
      }
    };

    if (isTransferring) {
      acquireLock();
    } else {
      releaseLock();
    }

    return () => {
      releaseLock();
    };
  }, [currentTransfer?.state]);

  // Load history & clipboard from localStorage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('localdrop_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      const storedClipboard = localStorage.getItem('localdrop_clipboard_history');
      if (storedClipboard) {
        setClipboardItems(JSON.parse(storedClipboard));
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

  const saveClipboardItem = useCallback((item: SharedClipboardItem) => {
    setClipboardItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id && i.content !== item.content);
      const updated = [item, ...filtered.slice(0, 49)];
      try {
        localStorage.setItem('localdrop_clipboard_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Initialize or retrieve a peer connection
  const getOrCreatePeer = useCallback(
    (targetPeerId: string, isInitiator: boolean, forceFresh = false): P2PPeer => {
      const existing = peersRef.current.get(targetPeerId);
      if (existing) {
        if (forceFresh || existing.isClosedOrFailed()) {
          existing.close();
          peersRef.current.delete(targetPeerId);
        } else if (!isInitiator || existing.isInitiator) {
          return existing;
        } else {
          // Recreate if existing peer was non-initiator but we now need to initiate with a data channel
          existing.close();
          peersRef.current.delete(targetPeerId);
        }
      }

      const handlePeerDisconnect = () => {
        setConnectedPeerIds((prev) => prev.filter((id) => id !== targetPeerId));
        const deadPeer = peersRef.current.get(targetPeerId);
        if (deadPeer) {
          deadPeer.close();
          peersRef.current.delete(targetPeerId);
          setActivePeers(new Map(peersRef.current));
        }

        const current = currentTransferRef.current;
        if (
          current &&
          current.peerId === targetPeerId &&
          (current.state === 'WAITING' || current.state === 'TRANSFERRING')
        ) {
          if (activeSenderRef.current) {
            activeSenderRef.current.cancel();
            activeSenderRef.current = null;
          }
          if (activeReceiverRef.current) {
            activeReceiverRef.current.cancel();
            activeReceiverRef.current = null;
          }
          updateCurrentTransfer((prev) =>
            prev ? { ...prev, state: 'FAILED', error: 'Connection lost' } : null
          );
          processNextQueueItemRef.current?.();
        }
      };

      const peer = new P2PPeer(
        targetPeerId,
        isInitiator,
        {
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
            handlePeerDisconnect();
          },
          onConnectionStateChange: (state) => {
            if (state === 'failed' || state === 'closed' || state === 'disconnected') {
              handlePeerDisconnect();
            }
          },
          onMessage: (msg: DataChannelMessage) => {
            handleDataChannelMessageRef.current?.(targetPeerId, msg);
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
        },
        device.deviceId
      );

      peersRef.current.set(targetPeerId, peer);
      setActivePeers(new Map(peersRef.current));
      return peer;
    },
    [device, sendSignal, updateCurrentTransfer]
  );

  // Check if a peer has an open RTCDataChannel
  const isPeerConnected = useCallback(
    (targetPeerId: string): boolean => {
      const peer = peersRef.current.get(targetPeerId);
      return peer ? peer.isConnected() : false;
    },
    []
  );

  // Connect to target peer and wait for RTCDataChannel readiness
  const connectToPeer = useCallback(
    async (targetPeerId: string, timeoutMs: number = 25000): Promise<boolean> => {
      const existing = peersRef.current.get(targetPeerId);
      if (existing && existing.isConnected()) {
        return true;
      }
      // Force a fresh peer connection to avoid any stale state from prior failed attempts
      const peer = getOrCreatePeer(targetPeerId, true, true);
      await peer.startOffer();

      const startTime = Date.now();
      while (Date.now() - startTime < timeoutMs) {
        const current = peersRef.current.get(targetPeerId);
        if (current && current.isConnected()) {
          return true;
        }
        if (current && current.isClosedOrFailed()) {
          return false;
        }
        await new Promise((r) => setTimeout(r, 100));
      }
      return peersRef.current.get(targetPeerId)?.isConnected() ?? false;
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
          const safeFileName = sanitizeFileName(msg.fileName);
          setIncomingTransfer({
            transferId: msg.transferId,
            fileName: safeFileName,
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
            updateCurrentTransfer((prev) => (prev ? { ...prev, state: 'TRANSFERRING' } : null));
            const meta = currentSenderMetaRef.current;
            activeSenderRef.current
              .send()
              .then((success) => {
                if (success && meta) {
                  const peer = peersRef.current.get(senderPeerId);
                  peer?.sendControlMessage({
                    type: 'transfer-complete',
                    transferId: meta.transferId,
                    checksum: meta.checksum || '',
                    totalBytes: meta.fileSize,
                  });

                  updateCurrentTransfer((prev) => (prev ? { ...prev, state: 'COMPLETED' } : null));

                  const durationMs = Math.max(1, Date.now() - meta.startTime);
                  const avgSpeed = (meta.fileSize / durationMs) * 1000;

                  saveHistoryItem({
                    id: meta.transferId,
                    fileName: meta.fileName,
                    fileSize: meta.fileSize,
                    mimeType: meta.mimeType,
                    direction: 'sent',
                    peerName: meta.peerName,
                    peerId: senderPeerId,
                    state: 'COMPLETED',
                    timestamp: Date.now(),
                    durationMs,
                    speedAvgBytesPerSec: avgSpeed,
                    checksum: meta.checksum,
                  });

                  activeSenderRef.current = null;
                  processNextQueueItemRef.current?.();
                } else if (!success) {
                  updateCurrentTransfer((prev) =>
                    prev ? { ...prev, state: 'FAILED', error: 'Transfer aborted or connection lost' } : null
                  );
                  activeSenderRef.current = null;
                  processNextQueueItemRef.current?.();
                }
              })
              .catch((err) => {
                updateCurrentTransfer((prev) =>
                  prev ? { ...prev, state: 'FAILED', error: err?.message || 'Transfer failed' } : null
                );
                activeSenderRef.current = null;
                processNextQueueItemRef.current?.();
              });
          }
          break;
        }

        case 'transfer-reject': {
          if (activeSenderRef.current) {
            activeSenderRef.current.cancel();
            activeSenderRef.current = null;
          }
          updateCurrentTransfer((prev) =>
            prev ? { ...prev, state: 'CANCELLED', error: msg.reason || 'Declined by recipient' } : null
          );
          setIncomingTransfer(null);
          processNextQueueItemRef.current?.();
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
          updateCurrentTransfer((prev) => (prev ? { ...prev, state: 'CANCELLED' } : null));
          setIncomingTransfer(null);
          processNextQueueItemRef.current?.();
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

        case 'clipboard-share': {
          const receivedItem: SharedClipboardItem = {
            id: msg.id,
            content: msg.content,
            contentType: msg.contentType,
            senderName: msg.senderName,
            senderPlatform: msg.senderPlatform,
            senderId: senderPeerId,
            timestamp: msg.timestamp,
            direction: 'received',
          };
          saveClipboardItem(receivedItem);
          setIncomingClipboardPill(receivedItem);
          break;
        }

        case 'rtt-ping': {
          const peer = peersRef.current.get(senderPeerId);
          peer?.sendControlMessage({ type: 'rtt-pong', timestamp: msg.timestamp });
          break;
        }
      }
    },
    [saveHistoryItem, saveClipboardItem, updateCurrentTransfer]
  );

  useEffect(() => {
    handleDataChannelMessageRef.current = handleDataChannelMessage;
  }, [handleDataChannelMessage]);

  // Send a file to a peer directly
  const startSendFile = useCallback(
    async (targetPeerId: string, file: File, peerName: string) => {
      const peer = peersRef.current.get(targetPeerId);
      if (!peer || !peer.isConnected()) {
        throw new Error('Peer is not connected');
      }

      const transferId = 'tx_' + Math.random().toString(36).substring(2, 10);
      const chunkSize = 64 * 1024;
      const totalChunks = Math.ceil(file.size / chunkSize) || 1;

      // Pre-calculate SHA-256 checksum for files <= 100MB across entire file
      let checksum: string | undefined = undefined;
      if (file.size <= 100 * 1024 * 1024) {
        try {
          const buffer = await file.arrayBuffer();
          checksum = await calculateSHA256(buffer);
        } catch (e) {}
      }

      const sender = new FileChunkSender(file, transferId, peer.getDataChannel()!, {
        chunkSize,
        onProgress: (p) => {
          updateCurrentTransfer((prev) =>
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

      currentSenderMetaRef.current = {
        transferId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        peerId: targetPeerId,
        peerName,
        startTime: Date.now(),
        checksum,
      };

      updateCurrentTransfer(progressItem);

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
    [updateCurrentTransfer]
  );

  const processNextQueueItem = useCallback(() => {
    if (transferQueueRef.current.length === 0) return;
    const nextItem = transferQueueRef.current.shift();
    if (nextItem) {
      startSendFile(nextItem.targetPeerId, nextItem.file, nextItem.peerName).catch((err) => {
        updateCurrentTransfer((prev) =>
          prev ? { ...prev, state: 'FAILED', error: err?.message || 'Failed to start file transfer' } : null
        );
      });
    }
  }, [startSendFile, updateCurrentTransfer]);

  useEffect(() => {
    processNextQueueItemRef.current = processNextQueueItem;
  }, [processNextQueueItem]);

  // Send a file with queue support
  const sendFile = useCallback(
    async (targetPeerId: string, file: File, peerName: string) => {
      const active = currentTransferRef.current;
      if (
        activeSenderRef.current !== null ||
        (active && (active.state === 'WAITING' || active.state === 'TRANSFERRING'))
      ) {
        transferQueueRef.current.push({ targetPeerId, file, peerName });
        return;
      }
      await startSendFile(targetPeerId, file, peerName);
    },
    [startSendFile]
  );

  const sendFiles = useCallback(
    async (targetPeerId: string, files: File[], peerName: string) => {
      for (const file of files) {
        await sendFile(targetPeerId, file, peerName);
      }
    },
    [sendFile]
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
        updateCurrentTransfer((prev) =>
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

        updateCurrentTransfer((prev) => (prev ? { ...prev, state: 'COMPLETED' } : null));

        const startTime = currentTransferRef.current?.startTime || Date.now();
        const durationMs = Math.max(1, Date.now() - startTime);

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
          durationMs,
          speedAvgBytesPerSec: (fileSize / durationMs) * 1000,
          checksum: actualChecksum,
        });

        activeReceiverRef.current = null;
      },
      onError: (err) => {
        updateCurrentTransfer((prev) =>
          prev ? { ...prev, state: 'FAILED', error: err.message } : null
        );
        activeReceiverRef.current = null;
      },
    });

    activeReceiverRef.current = receiver;

    updateCurrentTransfer({
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
  }, [incomingTransfer, saveHistoryItem, updateCurrentTransfer]);

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
    transferQueueRef.current = [];
    if (activeSenderRef.current) {
      activeSenderRef.current.cancel();
      activeSenderRef.current = null;
    }
    if (activeReceiverRef.current) {
      activeReceiverRef.current.cancel();
      activeReceiverRef.current = null;
    }

    const current = currentTransferRef.current;
    if (current) {
      const peer = peersRef.current.get(current.peerId);
      peer?.sendControlMessage({
        type: 'transfer-cancel',
        transferId: current.transferId,
      });

      saveHistoryItem({
        id: current.transferId,
        fileName: current.fileName,
        fileSize: current.totalBytes,
        mimeType: current.mimeType,
        direction: current.direction === 'sending' ? 'sent' : 'received',
        peerName: current.peerName,
        peerId: current.peerId,
        state: 'CANCELLED',
        timestamp: Date.now(),
        durationMs: Date.now() - current.startTime,
        speedAvgBytesPerSec: current.currentSpeed,
      });

      updateCurrentTransfer((prev) => (prev ? { ...prev, state: 'CANCELLED' } : null));
    }
  }, [saveHistoryItem, updateCurrentTransfer]);

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

  // Send clipboard content to a peer or broadcast to all connected peers
  const sendClipboard = useCallback(
    (targetPeerId: string | 'all', content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return false;

      const contentType = detectContentType(trimmed);
      const item: SharedClipboardItem = {
        id: 'clip_' + Math.random().toString(36).substring(2, 11),
        content: trimmed,
        contentType,
        senderName: device.deviceName,
        senderPlatform: device.platform,
        senderId: device.deviceId,
        timestamp: Date.now(),
        direction: 'sent',
      };

      let sentCount = 0;
      if (targetPeerId === 'all') {
        peersRef.current.forEach((peer) => {
          if (peer.isConnected()) {
            const ok = peer.sendControlMessage({
              type: 'clipboard-share',
              id: item.id,
              content: item.content,
              contentType: item.contentType,
              senderName: item.senderName,
              senderPlatform: item.senderPlatform,
              timestamp: item.timestamp,
            });
            if (ok) sentCount++;
          }
        });
      } else {
        const peer = peersRef.current.get(targetPeerId);
        if (peer && peer.isConnected()) {
          const ok = peer.sendControlMessage({
            type: 'clipboard-share',
            id: item.id,
            content: item.content,
            contentType: item.contentType,
            senderName: item.senderName,
            senderPlatform: item.senderPlatform,
            timestamp: item.timestamp,
          });
          if (ok) sentCount++;
        }
      }

      if (sentCount > 0) {
        saveClipboardItem(item);
        return true;
      }
      return false;
    },
    [device, saveClipboardItem]
  );

  const dismissClipboardPill = useCallback(() => {
    setIncomingClipboardPill(null);
  }, []);

  const deleteClipboardItem = useCallback((id: string) => {
    setClipboardItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem('localdrop_clipboard_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const clearClipboardHistory = useCallback(() => {
    setClipboardItems([]);
    try {
      localStorage.removeItem('localdrop_clipboard_history');
    } catch (e) {}
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('localdrop_history');
    } catch (e) {}
  }, []);

  return {
    connectedPeerIds,
    currentTransfer,
    incomingTransfer,
    textMessages,
    clipboardItems,
    incomingClipboardPill,
    history,
    diagnostics,
    isPeerConnected,
    connectToPeer,
    sendFile,
    sendFiles,
    acceptIncomingTransfer,
    rejectIncomingTransfer,
    cancelTransfer,
    sendText,
    sendClipboard,
    dismissClipboardPill,
    deleteClipboardItem,
    clearClipboardHistory,
    clearHistory,
    clearCurrentTransfer: () => updateCurrentTransfer(null),
  };
}
