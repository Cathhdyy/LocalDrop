'use client';

import React, { useState, useEffect } from 'react';
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
import { useDevice } from '../hooks/useDevice';
import { useSignaling } from '../hooks/useSignaling';
import { useWebRTC } from '../hooks/useWebRTC';
import { DeviceInfo } from '@localdrop/protocol';
import { Files, MessageSquareText, ShieldAlert, Smartphone } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'files' | 'text'>('files');
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('app');
  const [selectedPeer, setSelectedPeer] = useState<DeviceInfo | null>(null);
  const [roomId, setRoomId] = useState<string>('localdrop-lan');

  // Modals
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const { device, devMode, theme, updateDeviceName, toggleDevMode, toggleTheme } = useDevice();

  // Read URL search params on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setRoomId(roomParam);
        setViewMode('app');
      } else {
        // If visiting root with no query, check if user preferred app
        const lastView = localStorage.getItem('localdrop_last_view');
        if (lastView === 'landing') {
          setViewMode('landing');
        } else {
          setViewMode('app');
        }
      }
    }
  }, []);

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
    sendText(selectedPeer.deviceId, text);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('localdrop_history');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-blue-500/30">
      {/* Top Navbar */}
      <Navbar
        device={device}
        status={signalingStatus}
        theme={theme}
        onToggleTheme={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenQR={() => setIsQrOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Landing or App View */}
      {viewMode === 'landing' ? (
        <main className="flex-1 pb-16">
          <LandingHero
            onStartSharing={() => {
              setViewMode('app');
              localStorage.setItem('localdrop_last_view', 'app');
            }}
          />
        </main>
      ) : (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6">
          {/* Sub-header navigation & Quick Mode Switch */}
          <div className="flex items-center justify-between">
            {/* Files / Text tab switcher */}
            <div className="inline-flex p-1 rounded-2xl bg-muted border border-border">
              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'files'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Files className="w-3.5 h-3.5" />
                <span>Files</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'text'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Text</span>
              </button>
            </div>

            <button
              onClick={() => {
                setViewMode('landing');
                localStorage.setItem('localdrop_last_view', 'landing');
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-5 animate-slide-up text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 mx-auto flex items-center justify-center text-blue-500">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                {incomingPairingRequest.device.deviceName}
              </h3>
              <p className="text-xs text-muted-foreground">
                wants to connect and transfer files directly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => respondPairing(incomingPairingRequest.senderPeerId, false)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  respondPairing(incomingPairingRequest.senderPeerId, true);
                  connectToPeer(incomingPairingRequest.senderPeerId);
                }}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all"
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
        onSaveDeviceName={updateDeviceName}
        theme={theme}
        onToggleTheme={toggleTheme}
        devMode={devMode}
        onToggleDevMode={toggleDevMode}
      />
    </div>
  );
}
