'use client';

import React, { useState } from 'react';
import { X, Laptop, Shield, Code, Palette, Check } from 'lucide-react';
import { DeviceInfo } from '@localdrop/protocol';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceInfo;
  onSaveDeviceName: (name: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: (theme: 'dark' | 'light') => void;
  devMode: boolean;
  onToggleDevMode: (enabled: boolean) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  device,
  onSaveDeviceName,
  theme,
  onToggleTheme,
  devMode,
  onToggleDevMode,
}: SettingsModalProps) {
  const [nameInput, setNameInput] = useState(device.deviceName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDeviceName(nameInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Settings</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device Name Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5" />
            Device Nickname
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Simran's PC"
              maxLength={32}
              className="flex-1 px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 transition-all"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : 'Save'}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            This name will be visible to other devices on your local network.
          </p>
        </form>

        {/* Theme Settings */}
        <div className="space-y-2 pt-2 border-t border-border">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Appearance
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onToggleTheme('dark')}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-500/10 text-foreground font-semibold'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              Dark Theme
            </button>
            <button
              type="button"
              onClick={() => onToggleTheme('light')}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-500/10 text-foreground font-semibold'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              Light Theme
            </button>
          </div>
        </div>

        {/* Developer Mode Switch */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-blue-400" />
              Developer Mode
            </label>
            <p className="text-[11px] text-muted-foreground">
              Display live WebRTC ICE diagnostics, RTT, and logs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onToggleDevMode(!devMode)}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              devMode ? 'bg-blue-600' : 'bg-muted border border-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                devMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Custom Signaling Server (for Vercel & Cloud deployments) */}
        <div className="pt-2 border-t border-border space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Signaling Server (Vercel / Cloud)
          </label>
          <input
            type="text"
            defaultValue={typeof window !== 'undefined' ? localStorage.getItem('localdrop_signaling_url') || '' : ''}
            placeholder="Auto (e.g. wss://my-signaling.railway.app)"
            onBlur={(e) => {
              const val = e.target.value.trim();
              if (val) {
                localStorage.setItem('localdrop_signaling_url', val);
              } else {
                localStorage.removeItem('localdrop_signaling_url');
              }
            }}
            className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <p className="text-[11px] text-muted-foreground">
            Leave blank for auto local network detection, or specify a custom WebSocket URL if hosted on Vercel.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-muted hover:bg-muted/80 text-foreground transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
