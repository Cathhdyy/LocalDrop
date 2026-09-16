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
import { LandingHero } from '../components/LandingHero';
import { Footer } from '../components/Footer';
import { LegalModal, LegalTab } from '../components/LegalModal';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { useDevice } from '../hooks/useDevice';
import { useSignaling } from '../hooks/useSignaling';
import { useWebRTC } from '../hooks/useWebRTC';
import { soundEffects } from '../utils/audio';
import { DeviceInfo } from '@localdrop/protocol';
import { Files, MessageSquareText, ShieldAlert, Smartphone, Sparkles } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'files' | 'text'>('files');
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('app');
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
        setViewMode('app');
      } else {
        const lastView = localStorage.getItem('localdrop_last_view');
        if (lastView === 'landing') {
          setViewMode('landing');
        } else {
          setViewMode('app');
        }
      }

      const storedSound = localStorage.getItem('localdrop_sound');
      if (storedSound !== null) {
        setSoundEnabled(storedSound === 'true');
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
    history,
    diagnostics,
    connectToPeer,
    sendFile,
    acceptIncomingTransfer,
    rejectIncomingTransfer,
    cancelTransfer,
    sendText,
    clearCurrentTransfer,
  } = useWebRTC(device, sendSignal, setSignalHandler);

  // Play connection sound when a peer joins or connects
  useEffect(() => {
    if (connectedPeerIds.length > 0 && soundEnabled) {
      soundEffects.playConnect();
    }
  }, [connectedPeerIds.length, soundEnabled]);

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

  // Handle sending files
  const handleSendFiles = async (files: File[]) => {
    if (!selectedPeer) return;
    for (const file of files) {
      await sendFile(selectedPeer.deviceId, file, selectedPeer.deviceName);
    }
  };

  // Handle sending text
  const handleSendText = (text: string) => {
    if (!selectedPeer) return;
    const ok = sendText(selectedPeer.deviceId, text);
    if (ok) {
      addToast('info', 'Text Sent', `Sent to ${selectedPeer.deviceName}`);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('localdrop_history');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-blue-500/30">
      {/* Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

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
      />

      {/* Landing or App View */}
      {viewMode === 'landing' ? (
        <main className="flex-1 pb-16 animate-fade-in">
          <LandingHero
            onStartSharing={() => {
              setViewMode('app');
              localStorage.setItem('localdrop_last_view', 'app');
            }}
          />
        </main>
      ) : (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
          {/* Sub-header navigation & Mode Switch */}
          <div className="flex items-center justify-between">
            {/* Files / Text tab switcher */}
            <div className="inline-flex p-1 rounded-2xl bg-muted/80 border border-border">
              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'files'
                    ? 'bg-card text-foreground shadow-sm shadow-black/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Files className="w-3.5 h-3.5 text-blue-400" />
                <span>Files</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'text'
                    ? 'bg-card text-foreground shadow-sm shadow-black/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquareText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Text</span>
              </button>
            </div>

            <button
              onClick={() => {
                setViewMode('landing');
                localStorage.setItem('localdrop_last_view', 'landing');
              }}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              About LocalDrop
            </button>
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
            onConnectPeer={(peerId) => connectToPeer(peerId)}
            onOpenQR={() => setIsQrOpen(true)}
          />

          {/* Transfer Area (Files or Text) */}
          {activeTab === 'files' ? (
            <DropZone
              selectedPeer={selectedPeer}
              onSendFiles={handleSendFiles}
              disabled={!selectedPeer}
            />
          ) : (
            <TextShare
              selectedPeer={selectedPeer}
              textMessages={textMessages}
              onSendText={handleSendText}
              disabled={!selectedPeer}
            />
          )}

          {/* Recent Transfers History */}
          <HistoryList history={history} onClearHistory={handleClearHistory} />

          {/* Developer Mode Diagnostics Panel */}
          <DevModePanel diagnostics={diagnostics} isVisible={devMode} />
        </main>
      )}

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
        devMode={devMode}
        onToggleDevMode={toggleDevMode}
      />

      {/* Universal Responsive Footer */}
      <Footer
        onOpenAbout={() => {
          setViewMode('landing');
          localStorage.setItem('localdrop_last_view', 'landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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
