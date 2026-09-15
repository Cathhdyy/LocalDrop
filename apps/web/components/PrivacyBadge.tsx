'use client';

import React from 'react';
import { ShieldCheck, Lock, X, Radio, EyeOff } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border shadow-2xl space-y-5 animate-slide-up">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2 text-emerald-500 font-bold">
            <Lock className="w-5 h-5" />
            <span className="text-base text-foreground">Private P2P Transfer</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-sm text-muted-foreground leading-relaxed">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
            <Radio className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground block mb-0.5">Direct Device-to-Device</span>
              Your files stream directly over your local Wi-Fi or WebRTC data channels. Nothing bounces through a storage server.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
            <EyeOff className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground block mb-0.5">Zero Server Storage</span>
              LocalDrop will never store, inspect, or log your files, photos, or text. The signaling server handles only ephemeral discovery handshakes.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground block mb-0.5">End-to-End Encrypted</span>
              All WebRTC connections are authenticated and encrypted using mandatory DTLS and SRTP protocol ciphers.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-sm bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
