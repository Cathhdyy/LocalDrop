'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { DeviceList } from '../components/DeviceList';
import { DropZone } from '../components/DropZone';
import { TextShare } from '../components/TextShare';
import { TransferCard } from '../components/TransferCard';
import { HistoryList } from '../components/HistoryList';
import { QRPairingModal } from '../components/QRPairingModal';
import { PrivacyModal } from '../components/PrivacyBadge';
import { SettingsModal } from '../components/SettingsModal';
import { DevModePanel } from '../components/DevModePanel';
import { Footer } from '../components/Footer';
import { LegalModal, LegalTab } from '../components/LegalModal';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { LiveClipboardPill } from '../components/LiveClipboardPill';
import { ClipboardManager } from '../components/ClipboardManager';
import { useDevice } from '../hooks/useDevice';
import { useSignaling } from '../hooks/useSignaling';
import { useWebRTC } from '../hooks/useWebRTC';
import { soundEffects } from '../utils/audio';
import { DeviceInfo } from '@localdrop/protocol';
import { Files, MessageSquareText, Zap, ShieldAlert, Smartphone, Sparkles } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'files' | 'text' | 'clipboard'>('files');
  const [autoSyncClipboard, setAutoSyncClipboard] = useState(true);
  const [selectedPeer, setSelectedPeer] = useState<DeviceInfo | null>(null);
  const [roomId, setRoomId] = useState<string>('localdrop-lan');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('privacy');

  const handleOpenLegal = (tab: LegalTab) => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  const { device, devMode, theme, updateDeviceName, toggleDevMode, toggleTheme } = useDevice();

  const addToast = useCallback((type: ToastMessage['type'], title: string, description?: string) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Read URL search params on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setRoomId(roomParam);
      }

      const storedSound = localStorage.getItem('localdrop_sound');
      if (storedSound !== null) {
        setSoundEnabled(storedSound === 'true');
      }

      const storedAutoClip = localStorage.getItem('localdrop_auto_clipboard');
      if (storedAutoClip !== null) {
        setAutoSyncClipboard(storedAutoClip === 'true');
      }
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('localdrop_sound', String(next));
    if (next) soundEffects.playComplete();
  };

  // 1. Signaling hook
  const {
    status: signalingStatus,
    peers,
    isHost,
    incomingPairingRequest,
    sendSignal,
    requestPairing,
    respondPairing,
    setSignalHandler,
  } = useSignaling(device, roomId);

  // 2. WebRTC P2P hook
  const {
    connectedPeerIds,
    currentTransfer,
    incomingTransfer,
    textMessages,
    clipboardItems,
    incomingClipboardPill,
    history,
    diagnostics,
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
    clearCurrentTransfer,
  } = useWebRTC(device, sendSignal, setSignalHandler);

  // Play connection sound when a peer joins or connects
  useEffect(() => {
    if (connectedPeerIds.length > 0 && soundEnabled) {
      soundEffects.playConnect();
    }
  }, [connectedPeerIds.length, soundEnabled]);

  // Play sound when incoming clipboard pill arrives
  useEffect(() => {
    if (incomingClipboardPill && soundEnabled) {
      soundEffects.playNotification();
    }
  }, [incomingClipboardPill, soundEnabled]);

  // Global paste listener for instant cross-device broadcast
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const text = e.clipboardData?.getData('text/plain');
      if (text && text.trim() && connectedPeerIds.length > 0 && autoSyncClipboard) {
        const ok = sendClipboard(selectedPeer ? selectedPeer.deviceId : 'all', text);
        if (ok) {
          addToast(
            'success',
            'Clipboard Broadcasted',
            `Sent to ${selectedPeer ? selectedPeer.deviceName : 'all connected devices'}`
          );
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [connectedPeerIds.length, autoSyncClipboard, selectedPeer, sendClipboard, addToast]);

  // Play sound when transfer finishes
  useEffect(() => {
    if (currentTransfer?.state === 'COMPLETED' && soundEnabled) {
      soundEffects.playComplete();
      addToast(
        'success',
        'Transfer Complete',
        `${currentTransfer.fileName} (${(currentTransfer.totalBytes / (1024 * 1024)).toFixed(1)} MB)`
      );
    }
  }, [currentTransfer?.state, soundEnabled, addToast]);

  // Auto-select peer if only one peer is available and none selected
  useEffect(() => {
    if (peers.length === 1 && !selectedPeer) {
      setSelectedPeer(peers[0]);
    } else if (selectedPeer && !peers.some((p) => p.deviceId === selectedPeer.deviceId)) {
      setSelectedPeer(null);
    }
  }, [peers, selectedPeer]);

  // Handle connecting to peer with explicit pairing approval
  const handleConnectPeer = async (peerId: string) => {
    if (connectedPeerIds.includes(peerId)) {
      return;
    }
    const target = peers.find((p) => p.deviceId === peerId);
    const targetName = target ? target.deviceName : 'Device';

    addToast('info', 'Pairing Request Sent', `Waiting for approval from ${targetName}...`);
    try {
      const accepted = await requestPairing(peerId);
      if (accepted) {
        await connectToPeer(peerId);
        if (soundEnabled) soundEffects.playConnect();
        addToast('success', 'Pairing Approved', `Connected to ${targetName}`);
      } else {
        addToast('error', 'Pairing Declined', `${targetName} declined or request timed out.`);
      }
    } catch (e) {
      addToast('error', 'Connection Failed', 'Could not establish connection.');
    }
  };

  const ensureConnected = async (peerId: string, peerName: string): Promise<boolean> => {
    if (connectedPeerIds.includes(peerId)) {
      return true;
    }
    addToast('info', 'Connecting first...', `Pairing with ${peerName} before transfer`);
    try {
      const accepted = await requestPairing(peerId);
      if (accepted) {
        await connectToPeer(peerId);
        if (soundEnabled) soundEffects.playConnect();
        addToast('success', 'Connected', `Paired with ${peerName}`);
        let attempts = 30;
        while (attempts > 0) {
          await new Promise((r) => setTimeout(r, 100));
          attempts--;
        }
        return true;
      } else {
        addToast('error', 'Pairing Declined', `${peerName} declined the connection request.`);
        return false;
      }
    } catch (e) {
      addToast('error', 'Connection Failed', `Could not connect to ${peerName}.`);
      return false;
    }
  };

  // Handle sending files with sequential queueing
  const handleSendFiles = async (files: File[]) => {
    if (!selectedPeer) return;
    const isReady = await ensureConnected(selectedPeer.deviceId, selectedPeer.deviceName);
    if (!isReady) return;
    try {
      await sendFiles(selectedPeer.deviceId, files, selectedPeer.deviceName);
    } catch (err: any) {
      addToast('error', 'Transfer Failed', err?.message || 'Could not send file');
    }
  };

  // Handle sending text
  const handleSendText = async (text: string) => {
    if (!selectedPeer) return;
    const isReady = await ensureConnected(selectedPeer.deviceId, selectedPeer.deviceName);
    if (!isReady) return;
    const ok = sendText(selectedPeer.deviceId, text);
    if (ok) {
      addToast('info', 'Text Sent', `Sent to ${selectedPeer.deviceName}`);
    } else {
      addToast('error', 'Send Failed', `Could not send text to ${selectedPeer.deviceName}`);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    addToast('info', 'History Cleared', 'Transfer history has been emptied.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-blue-500/30">
      {/* Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Floating Apple-Style Live Clipboard Pill */}
      <LiveClipboardPill
        item={incomingClipboardPill}
        onDismiss={dismissClipboardPill}
        onCopied={() => {
          if (soundEnabled) soundEffects.playComplete();
          addToast('success', 'Copied to Clipboard', incomingClipboardPill?.content.slice(0, 45));
        }}
      />

      {/* Top Navbar */}
      <Navbar
        device={device}
        status={signalingStatus}
        theme={theme}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onToggleTheme={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenQR={() => setIsQrOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onLogoClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Core File & Text Sharing Interface */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6 pb-32 sm:pb-16 space-y-4 sm:space-y-6 animate-fade-in">
          {/* Sub-header navigation & Mode Switch */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Files / Text / Clipboard tab switcher */}
            <div className="flex-1 sm:flex-initial inline-flex p-1 rounded-2xl bg-muted/80 border border-white/[0.08] shadow-sm">
              <button
                onClick={() => setActiveTab('files')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'files'
                    ? 'bg-card text-foreground shadow-sm shadow-black/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Files className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Files</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'text'
                    ? 'bg-card text-foreground shadow-sm shadow-black/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquareText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Text</span>
              </button>
              <button
                onClick={() => setActiveTab('clipboard')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                  activeTab === 'clipboard'
                    ? 'bg-card text-foreground shadow-sm shadow-black/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Clipboard</span>
                {connectedPeerIds.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Active Transfer Card */}
          <TransferCard
            currentTransfer={currentTransfer}
            incomingPrompt={incomingTransfer}
            onAcceptIncoming={acceptIncomingTransfer}
            onRejectIncoming={rejectIncomingTransfer}
            onCancelTransfer={cancelTransfer}
            onDismiss={clearCurrentTransfer}
          />

          {/* Device List (Nearby Devices) */}
          <DeviceList
            peers={peers}
            connectedPeerIds={connectedPeerIds}
            selectedPeerId={selectedPeer ? selectedPeer.deviceId : null}
            onSelectPeer={(p) => setSelectedPeer(p)}
            onConnectPeer={(peerId) => handleConnectPeer(peerId)}
            onOpenQR={() => setIsQrOpen(true)}
          />

          {/* Transfer Area (Files, Text, or Clipboard) */}
          {activeTab === 'files' ? (
            <DropZone
              selectedPeer={selectedPeer}
              onSendFiles={handleSendFiles}
              disabled={!selectedPeer}
            />
          ) : activeTab === 'text' ? (
            <TextShare
              selectedPeer={selectedPeer}
              textMessages={textMessages}
              onSendText={handleSendText}
              disabled={!selectedPeer}
            />
          ) : (
            <ClipboardManager
              selectedPeer={selectedPeer}
              connectedPeerCount={connectedPeerIds.length}
              clipboardItems={clipboardItems}
              onSendClipboard={sendClipboard}
              onDeleteClipboardItem={deleteClipboardItem}
              onClearHistory={clearClipboardHistory}
              autoSyncEnabled={autoSyncClipboard}
              onToggleAutoSync={(val) => {
                setAutoSyncClipboard(val);
                try {
                  localStorage.setItem('localdrop_auto_clipboard', String(val));
                } catch (e) {}
              }}
            />
          )}

          {/* Recent Transfers History */}
          <HistoryList history={history} onClearHistory={handleClearHistory} />

          {/* Developer Mode Diagnostics Panel */}
          <DevModePanel diagnostics={diagnostics} isVisible={devMode} />
        </main>

        {/* Incoming Pairing Request Modal */}
      {incomingPairingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-5 animate-slide-up text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 mx-auto flex items-center justify-center text-blue-400 shadow-inner">
              <Smartphone className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                {incomingPairingRequest.device.deviceName}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                wants to connect and transfer files directly via P2P.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => respondPairing(incomingPairingRequest.senderPeerId, false)}
                className="py-3 px-4 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  respondPairing(incomingPairingRequest.senderPeerId, true);
                  connectToPeer(incomingPairingRequest.senderPeerId);
                  if (soundEnabled) soundEffects.playConnect();
                  addToast(
                    'success',
                    'Connected',
                    `Paired with ${incomingPairingRequest.device.deviceName}`
                  );
                }}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pairing QR Modal */}
      <QRPairingModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        roomId={roomId}
      />

      {/* Privacy Guarantee Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        device={device}
        onSaveDeviceName={(name) => {
          updateDeviceName(name);
          addToast('success', 'Device Name Saved', name);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        devMode={devMode}
        onToggleDevMode={toggleDevMode}
      />

      {/* Universal Responsive Footer */}
      <Footer
        onOpenLegal={handleOpenLegal}
      />

      {/* Legal & Compliance Modal */}
      <LegalModal
        isOpen={isLegalOpen}
        initialTab={legalTab}
        onClose={() => setIsLegalOpen(false)}
      />
    </div>
  );
}
