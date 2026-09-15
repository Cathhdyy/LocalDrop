'use client';

import React from 'react';
import { QrCode, Settings, ShieldCheck, Sun, Moon, Laptop, Smartphone, Monitor } from 'lucide-react';
import { DeviceInfo, PlatformType } from '@localdrop/protocol';
import { ConnectionStatus } from '../hooks/useSignaling';

interface NavbarProps {
  device: DeviceInfo;
  status: ConnectionStatus;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenQR: () => void;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
}

export function Navbar({
  device,
  status,
  theme,
  onToggleTheme,
  onOpenQR,
  onOpenSettings,
  onOpenPrivacy,
}: NavbarProps) {
  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'ios':
      case 'android':
        return <Smartphone className="w-4 h-4 text-blue-400" />;
      case 'macos':
      case 'windows':
        return <Laptop className="w-4 h-4 text-blue-400" />;
      default:
        return <Monitor className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ready
          </span>
        );
      case 'connecting':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Connecting...
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Offline
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 glass backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20 text-white font-bold text-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight">LocalDrop</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                P2P
              </span>
            </div>
          </div>
        </div>

        {/* Center / Device & Status Info */}
        <div className="hidden sm:flex items-center gap-3">
          {getStatusBadge()}

          <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-muted border border-border">
            {getPlatformIcon(device.platform)}
            <span className="font-medium truncate max-w-[140px]">{device.deviceName}</span>
          </div>

          <button
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Cloud</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Pair QR Button */}
          <button
            onClick={onOpenQR}
            aria-label="Scan QR Code to Pair"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Pair Device</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
