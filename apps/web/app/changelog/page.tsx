'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Github,
  Sun,
  Moon,
  ArrowRight,
  Rss,
  Mail,
  Share2,
  Check,
  Copy,
  Laptop,
  Smartphone,
  Sparkles,
  QrCode,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { CHANGELOG_DATA, ChangelogEntry } from '../../data/changelog';

export default function ChangelogPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize theme from document or localStorage
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('localdrop_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('localdrop_theme', 'light');
    }
  };

  const handleCopyFeed = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30 flex flex-col relative overflow-x-hidden">
      {/* Background Dot-Grid Texture matching Reference UI */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:22px_22px] opacity-80"
        aria-hidden="true"
      />

      {/* Subtle ambient lighting glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[280px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* ============================================================ */}
      {/* HEADER / NAVIGATION                                           */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 w-full bg-background/85 dark:bg-[#09090c]/85 backdrop-blur-2xl transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand / Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 select-none group"
            title="LocalDrop Home"
          >
            <div className="relative shrink-0 flex items-center justify-center">
              <Image
                src="/favicon.png"
                alt="LocalDrop Logo"
                width={32}
                height={32}
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-[0_2px_8px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-transform duration-200"
                priority
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[17px] sm:text-[19px] tracking-tight text-foreground">
                Local<span className="text-blue-500">Drop</span>
              </span>
              <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 leading-none">
                Changelog
              </span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* GitHub Star */}
            <a
              href="https://github.com/Cathhdyy/LocalDrop"
              target="_blank"
              rel="noopener noreferrer"
              title="Star LocalDrop on GitHub"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-all active:scale-95"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-all active:scale-90"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* Launch App Primary CTA */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 transition-all active:scale-95"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN CHANGELOG CONTENT                                       */}
      {/* ============================================================ */}
      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-24">
        {/* Page Title & Subtitle matching Reference Layout */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-8 sm:pb-12">
          <div className="space-y-2">
            <h1 className="font-serif italic font-normal text-4xl sm:text-5xl tracking-tight text-foreground">
              Changelog
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-sans">
              New updates, improvements, and fixes to LocalDrop.
            </p>
          </div>

          {/* Social / Subscription action icons matching reference */}
          <div className="flex items-center gap-1.5 self-start sm:self-center pt-1 sm:pt-0">
            {/* GitHub Link replacing Twitter */}
            <a
              href="https://github.com/Cathhdyy/LocalDrop"
              target="_blank"
              rel="noopener noreferrer"
              title="View LocalDrop on GitHub"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* RSS / Copy URL */}
            <button
              onClick={handleCopyFeed}
              title={copiedLink ? 'Link Copied!' : 'Copy Changelog Link'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors relative"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Rss className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Mail / Feedback */}
            <a
              href="https://github.com/Cathhdyy/LocalDrop/issues"
              target="_blank"
              rel="noopener noreferrer"
              title="Report an Issue / Suggest Feature"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TIMELINE LIST                                                */}
        {/* ============================================================ */}
        <div className="pt-10 space-y-12 sm:space-y-16">
          {CHANGELOG_DATA.map((entry, idx) => (
            <article
              key={entry.version}
              className="relative grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-3 sm:gap-8 items-start"
            >
              {/* Left Column: Date & Timeline Dot */}
              <div className="sm:text-right pt-0.5 sm:pt-1">
                <div className="flex items-center sm:justify-end gap-2">
                  <time className={`font-mono text-xs font-semibold ${entry.dateColor || 'text-muted-foreground'}`}>
                    {entry.date}
                  </time>
                  <span className="text-muted-foreground/60 text-sm leading-none">•</span>
                </div>
              </div>

              {/* Right Column: Title, Preview Card, Categories & Bullet Points */}
              <div className="space-y-5">
                {/* Entry Title & Badge */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                      {entry.title}
                    </h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-foreground">
                      {entry.version}
                    </span>
                    {entry.isLatest && (
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        Latest
                      </span>
                    )}
                  </div>
                </div>

                {/* Embedded UI Preview Mockup (Matching the reference screenshot style) */}
                {entry.previewType === 'clipboard' && (
                  <div className="rounded-2xl border border-white/[0.08] bg-card/70 dark:bg-[#111116]/80 p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3 overflow-hidden">
                    {/* Mockup Window Chrome */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Universal Live Clipboard
                      </span>
                      <div className="w-10" />
                    </div>

                    {/* Mockup Floating Pill Preview */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <div className="w-full max-w-sm rounded-full bg-[#0a0a0f] border border-blue-500/40 px-4 py-2.5 shadow-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                            <Laptop className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <span className="text-[10px] text-muted-foreground block leading-none">
                              Copied on MacBook Pro
                            </span>
                            <span className="text-xs font-mono font-semibold text-foreground truncate block">
                              npm install @localdrop/cli
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-sm shadow-blue-500/30">
                          Tap to Paste
                        </span>
                      </div>
                    </div>

                    {/* Mockup Smart Tags */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[10px] font-mono text-muted-foreground">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                        ⚡ Auto-Detected: Code
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                        🔒 RAM-to-RAM DTLS 1.3
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                        📱 iOS • Android • Mac • PC
                      </span>
                    </div>
                  </div>
                )}

                {entry.previewType === 'pairing' && (
                  <div className="rounded-2xl border border-white/[0.08] bg-card/70 dark:bg-[#111116]/80 p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3 overflow-hidden">
                    {/* Mockup Window Chrome */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        P2P Verification & QR Mesh
                      </span>
                      <div className="w-10" />
                    </div>

                    {/* Mockup PIN Preview */}
                    <div className="py-2 flex items-center justify-center gap-2">
                      {['8', '4', '9', '2', '0', '1'].map((digit, i) => (
                        <div
                          key={i}
                          className="w-8 h-10 rounded-lg bg-white/[0.05] border border-indigo-500/30 font-mono font-extrabold text-base flex items-center justify-center text-indigo-400"
                        >
                          {digit}
                        </div>
                      ))}
                    </div>

                    <p className="text-center text-[11px] text-muted-foreground">
                      Instant zero-config device handshake over secure WebRTC datachannel.
                    </p>
                  </div>
                )}

                {/* Structured Sections matching Reference Code/Figma/Feature lists */}
                <div className="space-y-4 pt-1">
                  {entry.sections.map((sec) => (
                    <div key={sec.category} className="space-y-1.5 text-xs sm:text-sm">
                      <h3 className="font-mono font-bold text-foreground tracking-tight text-xs sm:text-xs">
                        {sec.category}
                      </h3>
                      <ul className="space-y-1 text-muted-foreground leading-relaxed pl-2">
                        {sec.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2">
                            <span className="text-muted-foreground/60 select-none">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA / Return to App */}
        <div className="mt-16 sm:mt-24 pt-8 text-center space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Experience direct, zero-cloud file transfers across all your devices.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            <span>Start Sharing on LocalDrop</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
