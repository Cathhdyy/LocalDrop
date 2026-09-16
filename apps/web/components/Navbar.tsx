'use client';

import React from 'react';
import {
  QrCode,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DeviceInfo, PlatformType } from '@localdrop/protocol';
import { ConnectionStatus } from '../hooks/useSignaling';

interface NavbarProps {
  device: DeviceInfo;
  status: ConnectionStatus;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onOpenQR: () => void;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
}

export function Navbar({
  device,
  status,
  theme,
  soundEnabled,
  onToggleSound,
  onToggleTheme,
  onOpenQR,
  onOpenSettings,
  onOpenPrivacy,
}: NavbarProps) {
  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'ios':
      case 'android':
        return <Smartphone className="w-3.5 h-3.5 text-blue-400" />;
      case 'macos':
      case 'windows':
        return <Laptop className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Monitor className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Connecting...</span>
          </div>
        );
      case 'disconnected':
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Offline</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border glass-panel">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-lg shadow-inner">
              ⚡
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-foreground">LocalDrop</span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                P2P
              </span>
              {/* Mobile status indicator */}
              <span
                className={`md:hidden w-2 h-2 rounded-full ${
                  status === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : status === 'connecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-500'
                }`}
                title={`Status: ${status}`}
              />
            </div>
          </div>
        </div>

        {/* Center Device & Privacy Info */}
        <div className="hidden md:flex items-center gap-2.5">
          {getStatusBadge()}

          <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-muted/80 border border-border">
            {getPlatformIcon(device.platform)}
            <span className="font-semibold text-foreground truncate max-w-[150px]">
              {device.deviceName}
            </span>
          </div>

          <button
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Private Transfer</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Pair QR CTA */}
          <button
            onClick={onOpenQR}
            aria-label="Scan QR Code to Pair"
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-500/20 active:scale-95 min-h-[38px]"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>Pair<span className="hidden sm:inline"> Device</span></span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label="Toggle Sound Effects"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
