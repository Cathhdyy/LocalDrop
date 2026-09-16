'use client';

import React, { useState } from 'react';
import {
  Zap,
  ShieldCheck,
  Smartphone,
  Laptop,
  ArrowRight,
  Github,
  QrCode,
  FileCheck,
  Lock,
  Copy,
  Check,
  CheckCircle2,
  FolderSync,
  Layers,
  Sparkles,
} from 'lucide-react';

interface LandingHeroProps {
  onStartSharing: () => void;
}

export function LandingHero({ onStartSharing }: LandingHeroProps) {
  const [copiedCli, setCopiedCli] = useState(false);

  const copyCliCommand = () => {
    navigator.clipboard.writeText('npx localdrop');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto px-4 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-xs font-semibold text-blue-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AirDrop for EVERY device</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Transfer anything. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500">
              Directly between devices.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Send multi-gigabyte files, photos, folders, and text directly over your local network.
            No accounts. No cloud storage. Zero cables.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            onClick={onStartSharing}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <span>Start Sharing Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://github.com/Cathhdyy/LocalDrop"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-semibold text-sm bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center justify-center gap-2 transition-all"
          >
            <Github className="w-4 h-4" />
            <span>View on GitHub</span>
          </a>
        </div>

        {/* Hero Interactive Animation Graphic */}
        <div className="pt-6">
          <div className="max-w-xl mx-auto p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-foreground">Windows PC</div>
                  <div className="text-[11px] text-emerald-400 font-medium">Sender</div>
                </div>
              </div>

              <div className="flex-1 mx-6 flex flex-col items-center">
                <div className="text-[11px] font-mono text-muted-foreground mb-1">
                  2.4 GB • <span className="text-blue-400 font-bold">18.4 MB/s</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-3/4 animate-pulse" />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Direct Encrypted P2P</div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <div className="text-xs font-bold text-foreground">iPhone 15</div>
                  <div className="text-[11px] text-blue-400 font-medium">Receiver</div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Platform Badges */}
      <section className="text-center space-y-4 max-w-4xl mx-auto px-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Works seamlessly across all platforms
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {['Windows', 'macOS', 'Linux', 'iOS', 'Android'].map((platform) => (
            <div
              key={platform}
              className="px-4 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              <span>{platform}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            How It Works
          </h2>
          <p className="text-sm text-muted-foreground">Three steps. No friction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-base text-foreground">Open LocalDrop</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Launch on your desktop with <code>npx localdrop</code> or open in any web browser.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-base text-foreground">Scan QR Code</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Point your phone or tablet camera at the screen to establish an instant direct peer connection.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-base text-foreground">Drop & Transfer</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Drag your files or paste text. Data streams in encrypted 64KB slices directly device-to-device.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Built for Privacy & Performance
          </h2>
          <p className="text-sm text-muted-foreground">No compromises.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-card border border-border space-y-2.5">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h4 className="font-bold text-sm text-foreground">Direct P2P</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Transfers stream over high-speed WebRTC DataChannels at full LAN bandwidth.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-card border border-border space-y-2.5">
            <Lock className="w-6 h-6 text-emerald-500" />
            <h4 className="font-bold text-sm text-foreground">Zero Cloud Storage</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your files never touch or reside on a remote server. Total privacy by design.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-card border border-border space-y-2.5">
            <Layers className="w-6 h-6 text-blue-500" />
            <h4 className="font-bold text-sm text-foreground">Multi-GB Streaming</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Stream massive 4K videos or archives without browser memory exhaustion.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-card border border-border space-y-2.5">
            <QrCode className="w-6 h-6 text-purple-500" />
            <h4 className="font-bold text-sm text-foreground">Instant Pairing</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Scan a QR code from any camera. No pairing PIN hassles or Bluetooth pairing woes.
            </p>
          </div>
        </div>
      </section>

      {/* Developer CLI Section */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="p-8 rounded-3xl bg-gradient-to-b from-card to-muted/40 border border-border shadow-xl text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              Developer Friendly
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Start sharing in two seconds right from your terminal.
            </p>
          </div>

          <div className="flex items-center justify-between max-w-md mx-auto p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-200 font-mono text-xs sm:text-sm">
            <span className="text-blue-400 font-bold">$</span>
            <span className="flex-1 text-left ml-3">npx localdrop</span>
            <button
              onClick={copyCliCommand}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Copy to clipboard"
            >
              {copiedCli ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>• No installation required</span>
            <span>• Auto LAN discovery</span>
            <span>• Terminal QR code</span>
          </div>
        </div>
      </section>

      {/* GitHub CTA */}
      <section className="text-center max-w-2xl mx-auto px-4 space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Open Source. Self-Hostable.</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Built for everyone who wants fast, private, direct sharing between their devices.
        </p>
        <a
          href="https://github.com/localdrop/localdrop"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors shadow-sm"
        >
          <Github className="w-4 h-4" />
          <span>⭐ Star on GitHub</span>
        </a>
      </section>
    </div>
  );
}
