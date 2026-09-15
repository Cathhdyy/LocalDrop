'use client';

import React from 'react';
import { Laptop, Smartphone, Monitor, Send, Radio, CheckCircle2, QrCode, Wifi } from 'lucide-react';
import { DeviceInfo, PlatformType } from '@localdrop/protocol';

interface DeviceListProps {
  peers: DeviceInfo[];
  connectedPeerIds: string[];
  selectedPeerId: string | null;
  onSelectPeer: (peer: DeviceInfo) => void;
  onConnectPeer: (peerId: string) => void;
  onOpenQR: () => void;
}

export function DeviceList({
  peers,
  connectedPeerIds,
  selectedPeerId,
  onSelectPeer,
  onConnectPeer,
  onOpenQR,
}: DeviceListProps) {
  const getDeviceIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'ios':
      case 'android':
        return <Smartphone className="w-5 h-5 text-blue-400" />;
      case 'macos':
      case 'windows':
        return <Laptop className="w-5 h-5 text-indigo-400" />;
      default:
        return <Monitor className="w-5 h-5 text-purple-400" />;
    }
  };

  const getPlatformLabel = (platform: PlatformType) => {
    switch (platform) {
      case 'windows':
        return 'Windows PC';
      case 'macos':
        return 'macOS';
      case 'ios':
        return 'iPhone / iPad';
      case 'android':
        return 'Android';
      case 'linux':
        return 'Linux';
      default:
        return 'Web Client';
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs uppercase font-mono font-bold tracking-wider text-muted-foreground">
            Nearby Devices
          </h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
            {peers.length} online
          </span>
        </div>
        {peers.length > 0 && (
          <span className="text-xs text-muted-foreground">Tap a device to transfer</span>
        )}
      </div>

      {peers.length === 0 ? (
        /* AirDrop Radar Empty State */
        <div className="relative overflow-hidden p-8 sm:p-12 rounded-3xl border border-border bg-card/40 text-center space-y-4">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Concentric radar rings */}
            <div className="absolute inset-0 rounded-full border border-blue-500/20 radar-wave-1" />
            <div className="absolute inset-2 rounded-full border border-blue-500/15 radar-wave-2" />
            <div className="absolute inset-4 rounded-full border border-blue-500/10 radar-wave-3" />

            {/* Center icon */}
            <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-foreground">
              Scanning for nearby devices...
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Open LocalDrop on another device on this Wi-Fi network, or scan the pairing QR code to connect immediately.
            </p>
          </div>

          <div className="pt-1">
            <button
              onClick={onOpenQR}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all border border-border active:scale-95 shadow-sm"
            >
              <QrCode className="w-4 h-4 text-blue-400" />
              <span>Show Pairing QR Code</span>
            </button>
          </div>
        </div>
      ) : (
        /* Connected Peer Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {peers.map((peer) => {
            const isConnected = connectedPeerIds.includes(peer.deviceId);
            const isSelected = selectedPeerId === peer.deviceId;

            return (
              <div
                key={peer.deviceId}
                onClick={() => {
                  if (!isConnected) {
                    onConnectPeer(peer.deviceId);
                  }
                  onSelectPeer(peer);
                }}
                className={`glow-card group relative p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/[0.06] shadow-lg shadow-blue-500/10'
                    : 'border-border bg-card hover:border-border/80 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-muted/80 border border-border flex items-center justify-center shadow-inner">
                        {getDeviceIcon(peer.platform)}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
                          isConnected ? 'bg-emerald-500' : 'bg-neutral-400'
                        }`}
                      />
                    </div>

                    <div className="truncate">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors truncate">
                        {peer.deviceName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 font-sans">
                        <span>{getPlatformLabel(peer.platform)}</span>
                        <span>•</span>
                        <span
                          className={`font-medium ${
                            isConnected ? 'text-emerald-400' : 'text-muted-foreground'
                          }`}
                        >
                          {isConnected ? 'Connected' : 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isConnected) {
                        onConnectPeer(peer.deviceId);
                      }
                      onSelectPeer(peer);
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
