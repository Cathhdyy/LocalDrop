'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import {
  Zap,
  ShieldCheck,
  Smartphone,
  Laptop,
  ArrowRight,
  Github,
  QrCode,
  Lock,
  Copy,
  Check,
  Layers,
  Sparkles,
  FileText,
  ChevronDown,
  Activity,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

interface LandingHeroProps {
  onStartSharing: () => void;
}

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      delay: custom * 0.08,
    },
  }),
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export function LandingHero({ onStartSharing }: LandingHeroProps) {
  const [copiedCli, setCopiedCli] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(72);

  // Auto-run simulation transfer animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulationProgress((prev) => (prev >= 100 ? 0 : Math.min(100, prev + 2)));
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const copyCliCommand = () => {
    navigator.clipboard.writeText('npx localdrop');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="relative overflow-hidden space-y-16 sm:space-y-24">
      {/* Ambient background glow orbs */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[550px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ============================================================ */}
      {/* 1. HERO SECTION (2-COLUMN SPLIT ACCORDING TO REFERENCE)       */}
      {/* ============================================================ */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-10 pb-4 sm:pb-8"
      >
        {/* Floating decorative ambient dots from UI reference */}
        <div className="absolute top-8 left-6 w-2.5 h-2.5 rounded-full bg-blue-500/40 blur-[0.5px] animate-pulse pointer-events-none" />
        <div className="absolute top-24 left-24 w-1.5 h-1.5 rounded-full bg-indigo-400/50 pointer-events-none" />
        <div className="absolute bottom-6 left-12 w-2 h-2 rounded-full bg-blue-400/30 pointer-events-none" />
        <div className="absolute top-16 right-10 w-3 h-3 rounded-full bg-blue-500/30 blur-[0.5px] pointer-events-none" />
        <div className="absolute bottom-12 right-20 w-2 h-2 rounded-full bg-indigo-500/40 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline, subtext, and CTA */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <motion.div variants={fadeInUp} custom={0}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-400 backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AirDrop for EVERY device</span>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} custom={1} className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
                We create <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500">
                  direct transfers
                </span> <br />
                for your devices
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed">
                Direct peer-to-peer file sharing and live clipboard sync without cloud servers, account logins, or cables. Works seamlessly across iOS, Android, Windows, Mac, and Linux.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} custom={2} className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={onStartSharing}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#features"
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group px-2 py-1"
              >
                <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-blue-400 group-hover:border-blue-500/40 transition-colors">
                  <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <span>Explore more</span>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Live P2P Collaboration Scene */}
          <motion.div variants={fadeInUp} custom={3} className="lg:col-span-6 relative">
            <div className="relative rounded-3xl bg-card/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
              {/* Top status bar */}
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                    Direct WebRTC Stream
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  DTLS Encrypted
                </span>
              </div>

              {/* Devices visualization */}
              <div className="grid grid-cols-12 gap-3 items-center py-2">
                {/* Device 1 (MacBook Pro) */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="col-span-4 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-2.5 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-foreground truncate">MacBook</div>
                    <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Sender
                    </div>
                  </div>
                </motion.div>

                {/* Animated Transfer Flow Beam */}
                <div className="col-span-4 flex flex-col items-center justify-center px-1">
                  <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-blue-400 mb-1">
                    <Zap className="w-3.5 h-3.5 fill-blue-400 animate-bounce" />
                    <span>28.4 MB/s</span>
                  </div>

                  <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 rounded-full"
                      style={{ width: `${simulationProgress}%` }}
                    />
                    <motion.div
                      className="absolute top-0 w-8 h-full bg-white/60 blur-[2px] rounded-full"
                      animate={{ left: ['-20%', '100%'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>

                  <span className="text-[10px] text-muted-foreground mt-1 font-mono">
                    {simulationProgress}% • {((2.4 * simulationProgress) / 100).toFixed(1)} / 2.4 GB
                  </span>
                </div>

                {/* Device 2 (iPhone) */}
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  className="col-span-4 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-2.5 text-right justify-end"
                >
                  <div className="truncate">
                    <div className="text-xs font-bold text-foreground truncate">iPhone</div>
                    <div className="text-[10px] text-blue-400 font-semibold flex items-center justify-end gap-1">
                      Receiver
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                </motion.div>
              </div>

              {/* Active file preview pill */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-foreground truncate">
                    vacation_4k_cinematic.mov
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px] shrink-0">
                  <span className="text-emerald-400 font-bold">✓ 0 Errors</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/* 2. SERVICES / 4-CARD FEATURE ROW (ACCORDING TO REFERENCE)     */}
      {/* ============================================================ */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
            We Provide The Best <span className="text-blue-500">Features</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Engineered for high-throughput data transfer, zero configuration, and total device independence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'Direct P2P Stream',
              desc: 'High-speed WebRTC DataChannel streams directly across local Wi-Fi with zero server bandwidth throttling.',
              icon: Zap,
              color: 'bg-amber-500 text-white shadow-amber-500/20',
              link: 'Learn more',
            },
            {
              title: 'Zero Cloud Storage',
              desc: 'Your files never touch or reside on remote cloud servers or third-party buckets. 100% private to your room.',
              icon: ShieldCheck,
              color: 'bg-emerald-500 text-white shadow-emerald-500/20',
              link: 'Learn more',
            },
            {
              title: 'Live Clipboard',
              desc: 'Copy text, code, or links on one device and tap to paste on another in real time with peer attribution.',
              icon: Layers,
              color: 'bg-purple-600 text-white shadow-purple-500/20',
              link: 'Learn more',
            },
            {
              title: 'Terminal CLI / Web',
              desc: 'Run anywhere with zero install. Launch from any terminal via npx localdrop or open directly in your browser.',
              icon: Terminal,
              color: 'bg-blue-600 text-white shadow-blue-500/20',
              link: 'Learn more',
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -5 }}
                className="group p-6 rounded-3xl bg-card/70 border border-white/[0.06] hover:border-blue-500/40 transition-all space-y-4 shadow-sm"
              >
                {/* Colored square icon box from reference */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-base text-foreground group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    <span>{card.link}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. ALTERNATING BAND: SIMPLE 4-STEP TRANSFER PROCESS           */}
      {/* ============================================================ */}
      <section className="w-full bg-blue-500/[0.03] border-y border-white/[0.06] py-16 sm:py-24 relative overflow-hidden">
        {/* Floating decorative dots */}
        <div className="absolute top-10 right-16 w-2.5 h-2.5 rounded-full bg-blue-500/40 pointer-events-none" />
        <div className="absolute bottom-12 left-10 w-2 h-2 rounded-full bg-indigo-500/30 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Column: Device Mockup Scene */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-sm rounded-3xl bg-card border border-white/[0.08] shadow-2xl p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/favicon.png"
                      alt="LocalDrop"
                      width={22}
                      height={22}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-xs font-bold text-foreground">AirDrop Prompt</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                    Live
                  </span>
                </div>

                <div className="text-center space-y-3 py-2">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/15 text-blue-400 mx-auto flex items-center justify-center shadow-inner">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">MacBook Pro wants to share</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">14 Photos & Videos • 1.8 GB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={onStartSharing}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Numbered Step-by-Step List */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                  Simple <span className="text-blue-500">Solutions!</span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed max-w-xl">
                  We understand that transferring files across ecosystems should be frictionless. Here is how LocalDrop works in 4 effortless steps.
                </p>
              </div>

              {/* Numbered Steps with circular badges matching reference */}
              <div className="space-y-4">
                {[
                  {
                    num: '1',
                    title: 'Open LocalDrop',
                    desc: 'Navigate to localdropp.vercel.app on any device on your Wi-Fi, or run npx localdrop in your terminal.',
                  },
                  {
                    num: '2',
                    title: 'Auto-Discover or Scan QR',
                    desc: 'Devices on the same network appear instantly, or point your phone camera at the QR code to pair.',
                  },
                  {
                    num: '3',
                    title: 'Choose Files, Folders or Text',
                    desc: 'Drag multi-gigabyte files, 4K videos, folders, or copy clipboard snippets between devices.',
                  },
                  {
                    num: '4',
                    title: 'Encrypted P2P Stream',
                    desc: 'Data streams directly peer-to-peer at full physical hardware speed with DTLS end-to-end encryption.',
                  },
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-4 p-3.5 rounded-2xl bg-card/50 border border-white/[0.04]">
                    {/* Numbered circular badge */}
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{step.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onStartSharing}
                  className="px-7 py-3 rounded-2xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  Get Started
                </button>
                <a
                  href="https://github.com/Cathhdyy/LocalDrop"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-2xl font-semibold text-xs bg-card border border-white/[0.08] hover:bg-muted text-foreground transition-all"
                >
                  View Source Code
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. ARCHITECTURE SECTION (REVERSED COLUMNS)                   */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Tech Description */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
              Our <span className="text-blue-500">Architecture</span>
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We believe in true decentralization. LocalDrop connects devices through end-to-end encrypted WebRTC DataChannels using DTLS 1.3 and SCTP chunking.
            </p>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Your files stream directly memory-to-memory across your physical Wi-Fi or local switch. Even if the outside internet is disconnected, local transfers continue at wire speed.
            </p>

            {/* Terminal CLI Snippet */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-200 font-mono text-xs flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold">$</span>
                <span className="font-semibold">npx localdrop</span>
              </div>
              <button
                onClick={copyCliCommand}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] flex items-center gap-1 transition-colors"
              >
                {copiedCli ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCli ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Architecture Diagnostics HUD */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-card/80 border border-white/[0.08] shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono font-bold text-foreground uppercase">Network Telemetry</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                  0.8ms LAN Latency
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="text-[11px] text-muted-foreground font-mono">Transfer Protocol</div>
                  <div className="text-sm font-bold text-foreground mt-1">WebRTC DataChannel</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="text-[11px] text-muted-foreground font-mono">Security Layer</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">DTLS 1.3 / SRTP</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="text-[11px] text-muted-foreground font-mono">Chunk Slices</div>
                  <div className="text-sm font-bold text-foreground mt-1">64 KB Flow Control</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="text-[11px] text-muted-foreground font-mono">Data Retention</div>
                  <div className="text-sm font-bold text-blue-400 mt-1">0 Bytes Stored</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. WHY LOCALDROP WINS (THE 3 CORE ADVANTAGES)                 */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
            Why <span className="text-blue-500">LocalDrop?</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            How direct hardware-to-hardware streaming fundamentally outperforms cloud storage and closed ecosystems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              stat: 'Up to 100+ MB/s',
              title: 'Direct Hardware Speed',
              desc: 'Cloud services like Google Drive and WeTransfer force you to upload to a remote data center before downloading. LocalDrop streams data across your local Wi-Fi router at raw physical bandwidth.',
              badge: '10x Faster than Cloud',
              icon: Zap,
              color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            },
            {
              stat: '0 Bytes Stored',
              title: 'True Zero-Knowledge Privacy',
              desc: 'Your files stream directly memory-to-memory between paired devices using WebRTC DTLS 1.3 encryption. No third-party accounts, no tracking cookies, and zero permanent server storage.',
              badge: 'RAM-to-RAM Encryption',
              icon: ShieldCheck,
              color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            },
            {
              stat: '5 Ecosystems',
              title: 'Zero Vendor Lock-In',
              desc: 'Apple AirDrop locks you to Apple devices. Quick Share focuses on Android. LocalDrop bridges iOS, Android, Windows, Mac, and Linux without requiring anyone to buy into a single walled garden.',
              badge: 'Universal Compatibility',
              icon: Layers,
              color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-3xl bg-card/70 border border-white/[0.06] hover:border-blue-500/40 transition-all space-y-5 shadow-sm flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-foreground px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                      {item.stat}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-base text-foreground group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.05]">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{item.badge}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. CALLOUT BANNER ("READY TO GET STARTED?")                   */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-7 sm:p-10 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Ambient light streak */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Ready to transfer without limits?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-md">
              Start sharing files, folders, and clipboard snippets with any device on your local network now.
            </p>
          </div>

          <button
            onClick={onStartSharing}
            className="px-7 py-3.5 rounded-2xl font-bold text-xs bg-white text-blue-600 hover:bg-white/90 shadow-lg transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            Launch LocalDrop Now
          </button>
        </div>
      </section>
    </div>
  );
}
