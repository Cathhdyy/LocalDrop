'use client';

import React, { useState } from 'react';
import { X, Laptop, Palette, Check, ExternalLink } from 'lucide-react';
import { DeviceInfo } from '@localdrop/protocol';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceInfo;
  onSaveDeviceName: (name: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: (theme: 'dark' | 'light') => void;
  devMode?: boolean;
  onToggleDevMode?: (enabled: boolean) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  device,
  onSaveDeviceName,
  theme,
  onToggleTheme,
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

        {/* Creator & Source Code Info */}
        <div className="pt-3 border-t border-border/80 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Made by</span>
            <a
              href="https://sanscarr.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-foreground hover:text-blue-400 inline-flex items-center gap-1 underline underline-offset-2 transition-colors"
            >
              <span>Sanskar Sharma</span>
              <ExternalLink className="w-3 h-3 text-blue-400" />
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Source Code</span>
            <a
              href="https://github.com/Cathhdyy/LocalDrop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
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
