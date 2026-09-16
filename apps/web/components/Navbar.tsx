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
  Github,
  Zap,
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
  onLogoClick?: () => void;
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
  onLogoClick,
}: NavbarProps) {
  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'ios':
      case 'android':
        return <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'macos':
      case 'windows':
      case 'linux':
        return <Laptop className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      default:
        return <Monitor className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-background/80 dark:bg-[#09090c]/85 backdrop-blur-2xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={onLogoClick}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onLogoClick?.();
            }
          }}
          title="Toggle Home / Sharing"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-2xl blur-sm opacity-30 group-hover:opacity-75 transition duration-300" />
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight text-foreground group-hover:text-blue-400 transition-colors">
                LocalDrop
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                P2P
              </span>
              {/* Mobile status indicator dot */}
              <span
                className={`md:hidden w-2 h-2 rounded-full ${
                  status === 'connected'
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : status === 'connecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-500'
                }`}
                title={`Status: ${status}`}
              />
            </div>
          </div>
        </div>

        {/* Center: Unified Status Capsule (Apple Dynamic Island Inspired) */}
        <div className="hidden md:flex items-center gap-1.5 p-1 px-3 rounded-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] backdrop-blur-md transition-all shadow-inner text-xs">
          {/* Live Connection Status */}
          <div className="flex items-center gap-1.5 pr-2">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'connected'
                  ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : status === 'connecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <span
              className={`font-semibold capitalize text-[11px] ${
                status === 'connected'
                  ? 'text-emerald-400'
                  : status === 'connecting'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {status === 'connected' ? 'Ready' : status}
            </span>
          </div>

          <span className="w-px h-3.5 bg-white/10" />

          {/* Device Name Pill */}
          <button
            onClick={onOpenSettings}
            title="Click to rename device in Settings"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-white/10 text-foreground transition-colors font-medium"
          >
            {getPlatformIcon(device.platform)}
            <span className="truncate max-w-[140px] text-xs font-semibold">{device.deviceName}</span>
          </button>

          <span className="w-px h-3.5 bg-white/10" />

          {/* E2EE Privacy Indicator */}
          <button
            onClick={onOpenPrivacy}
            title="End-to-End Encrypted Direct Transfer (Zero Cloud)"
            className="flex items-center gap-1.5 pl-2 pr-1 text-muted-foreground hover:text-emerald-400 transition-colors group"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-medium hidden lg:inline">Private Transfer</span>
          </button>
        </div>

        {/* Right: Actions & Micro-Toolbar */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Pair Device Button */}
          <button
            onClick={onOpenQR}
            aria-label="Scan QR Code to Pair"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-blue-500/25 active:scale-95 min-h-[38px] cursor-pointer"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>Pair<span className="hidden sm:inline"> Device</span></span>
          </button>

          {/* Segmented Utility Toolbar */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-md">
            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              aria-label="Toggle Sound Effects"
              title={soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors active:scale-90"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors active:scale-90"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              aria-label="Open settings"
              title="Settings & Network"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors active:scale-90 group"
            >
              <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
            </button>

            {/* GitHub Repo */}
            <a
              href="https://github.com/Cathhdyy/LocalDrop"
              target="_blank"
              rel="noopener noreferrer"
              title="Star LocalDrop on GitHub"
              aria-label="GitHub Repository"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors active:scale-90"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
