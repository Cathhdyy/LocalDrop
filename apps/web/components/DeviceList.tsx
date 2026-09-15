'use client';

import React from 'react';
import { Laptop, Smartphone, Monitor, Send, Radio, CheckCircle2 } from 'lucide-react';
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
        return <Laptop className="w-5 h-5 text-blue-400" />;
      default:
        return <Monitor className="w-5 h-5 text-blue-400" />;
    }
  };

  const getPlatformLabel = (platform: PlatformType) => {
    switch (platform) {
      case 'windows':
        return 'Windows';
      case 'macos':
        return 'macOS';
      case 'ios':
        return 'iOS';
      case 'android':
        return 'Android';
      case 'linux':
        return 'Linux';
      default:
        return 'Web';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
          <span>Nearby Devices</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted font-normal text-muted-foreground">
            {peers.length}
          </span>
        </h2>
        {peers.length > 0 && (
          <span className="text-xs text-muted-foreground">Tap a device to select</span>
        )}
      </div>

      {peers.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-border bg-card/50 text-center space-y-4">
          <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 radar-ring" />
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-foreground">Waiting for other devices...</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Open LocalDrop on another phone or computer on this network.
            </p>
          </div>
          <button
            onClick={onOpenQR}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border"
          >
            Show Pairing QR
          </button>
        </div>
      ) : (
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
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/10'
                    : 'border-border bg-card hover:border-border/80 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      {getDeviceIcon(peer.platform)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-blue-500 transition-colors">
                        {peer.deviceName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {getPlatformLabel(peer.platform)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            isConnected ? 'text-emerald-500 font-medium' : 'text-muted-foreground'
                          }`}
                        >
                          {isConnected ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Connected
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                              Available
                            </>
                          )}
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
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {isSelected ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{isSelected ? 'Selected' : 'Send'}</span>
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
