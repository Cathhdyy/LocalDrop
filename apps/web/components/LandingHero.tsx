'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
  CheckCircle2,
  Layers,
  Sparkles,
  ExternalLink,
  Wifi,
  Radio,
  FileText,
  HardDrive,
  Cpu,
} from 'lucide-react';

interface LandingHeroProps {
  onStartSharing: () => void;
}

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      delay: custom * 0.1,
    },
  }),
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardHover = {
  rest: { scale: 1, y: 0, boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 20px 30px -10px rgba(59,130,246,0.15)',
    transition: { duration: 0.25, ease: 'easeOut' },
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
    <div className="relative overflow-hidden pt-2 pb-12 sm:pt-4 sm:pb-20 space-y-16 sm:space-y-24">
      {/* Ambient Animated Background Glow Orbs */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-purple-600/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-[700px] -left-40 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[1300px] -right-40 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ============================================================ */}
      {/* 1. HERO SECTION */}
      {/* ============================================================ */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="text-center space-y-6 sm:space-y-7 max-w-4xl mx-auto px-4 pt-1 sm:pt-2"
      >
        {/* Top Badges */}
        <motion.div variants={fadeInUp} custom={0} className="flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-400 backdrop-blur-md shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>AirDrop for EVERY device</span>
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.div variants={fadeInUp} custom={1} className="space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.08]">
            Transfer anything. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500">
              Directly between devices.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Send multi-gigabyte files, 4K videos, folders, photos, and text directly over your local Wi-Fi.
            Zero cloud uploads. Zero account logins. No cables.
          </p>
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div variants={fadeInUp} custom={2} className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onStartSharing}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Start Sharing Now</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="https://github.com/Cathhdyy/LocalDrop"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl font-semibold text-sm bg-card/80 hover:bg-muted text-foreground border border-white/[0.08] flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Github className="w-4 h-4 text-foreground" />
            <span>View on GitHub</span>
            <span className="ml-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-muted border border-white/[0.08] text-muted-foreground font-bold">
              ★ Star
            </span>
          </motion.a>
        </motion.div>

        {/* ============================================================ */}
        {/* INTERACTIVE P2P TRANSFER SIMULATION MOCKUP */}
        {/* ============================================================ */}
        <motion.div variants={fadeInUp} custom={3} className="pt-2 sm:pt-4">
          <div className="relative max-w-2xl mx-auto rounded-3xl bg-card/80 backdrop-blur-xl border border-white/[0.05] shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Header row with transfer status */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wide uppercase text-foreground">
                  Direct P2P WebRTC DataChannel
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-muted-foreground">
                  64KB Slices
                </span>
              </div>
            </div>

            {/* Devices visualization */}
            <div className="grid grid-cols-12 gap-3 items-center">
              {/* Device 1 (Sender PC) */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="col-span-4 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex items-center gap-3 text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-foreground truncate">MacBook Pro</div>
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Sender
                  </div>
                </div>
              </motion.div>

              {/* Animated Transfer Beam (Center) */}
              <div className="col-span-4 flex flex-col items-center justify-center px-1">
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-blue-400 mb-1">
                  <Zap className="w-3.5 h-3.5 fill-blue-400 animate-bounce" />
                  <span>28.4 MB/s</span>
                </div>

                {/* Flow beam line with animated packet */}
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

              {/* Device 2 (Receiver Phone) */}
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="col-span-4 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex items-center gap-3 text-right justify-end"
              >
                <div className="truncate">
                  <div className="text-xs font-bold text-foreground truncate">iPhone 16 Pro</div>
                  <div className="text-[10px] text-blue-400 font-semibold flex items-center justify-end gap-1">
                    Receiver
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
              </motion.div>
            </div>

            {/* Active file metadata pill */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-foreground truncate">
                  raw_cinema_4k_footage.mov
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground font-mono text-[11px] shrink-0">
                <span>SHA-256 Verified</span>
                <span className="text-emerald-400 font-bold">✓ 0 Errors</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ============================================================ */}
      {/* 2. CROSS-PLATFORM SUPPORT BADGES */}
      {/* ============================================================ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
        className="text-center space-y-5 max-w-4xl mx-auto px-4"
      >
        <motion.span variants={fadeInUp} className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
          Zero Ecosystem Lock-In • Universal Compatibility
        </motion.span>

        <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-3">
          {[
            { name: 'Windows 11 / 10', icon: Laptop, tag: 'Full Native P2P' },
            { name: 'macOS Sonoma / Ventura', icon: Laptop, tag: 'Safari & Chrome' },
            { name: 'iOS & iPadOS', icon: Smartphone, tag: 'Camera QR Pairing' },
            { name: 'Android 14 / 13', icon: Smartphone, tag: 'Direct Share Sheet' },
            { name: 'Linux (Ubuntu / Arch)', icon: Cpu, tag: 'Terminal CLI & Web' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2.5 rounded-2xl bg-card/70 border border-white/[0.05] text-xs font-semibold text-foreground flex items-center gap-2 shadow-sm transition-colors hover:border-blue-500/40"
              >
                <Icon className="w-4 h-4 text-blue-400" />
                <span>{item.name}</span>
                <span className="text-[10px] font-mono font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {item.tag}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* ============================================================ */}
      {/* 3. HOW IT WORKS (3 SIMPLE STEPS) */}
      {/* ============================================================ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
        className="max-w-4xl mx-auto px-4 space-y-10"
      >
        <div className="text-center space-y-2">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5" />
            <span>Frictionless Flow</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            How It Works
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-sm text-muted-foreground">
            Connect any two devices in 2 seconds. No configuration required.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Open LocalDrop',
              desc: 'Open the web app at localdropp.vercel.app or run npx localdrop from any terminal.',
              icon: GlobeIcon,
              color: 'from-blue-600 to-cyan-600',
            },
            {
              step: '02',
              title: 'Scan QR to Pair',
              desc: 'Point your phone or secondary device camera at the pairing QR code to establish an instant WebRTC handshake.',
              icon: QrCode,
              color: 'from-indigo-600 to-purple-600',
            },
            {
              step: '03',
              title: 'Drop & Stream',
              desc: 'Drag multi-GB files, photos, folders, or text. Data streams in encrypted slices directly across your local network.',
              icon: Zap,
              color: 'from-emerald-600 to-teal-600',
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.step}
                variants={fadeInUp}
                custom={i}
                whileHover="hover"
                initial="rest"
                animate="rest"
                className="relative group p-7 rounded-3xl bg-card/70 border border-white/[0.05] overflow-hidden transition-colors hover:border-blue-500/50"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-black font-mono text-muted-foreground/30 group-hover:text-blue-500/60 transition-colors">
                    {card.step}
                  </span>
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/* 4. PERFORMANCE & PRIVACY HIGHLIGHTS */}
      {/* ============================================================ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
        className="max-w-4xl mx-auto px-4 space-y-10"
      >
        <div className="text-center space-y-2">
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Architected for Speed & Uncompromising Privacy
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-sm text-muted-foreground">
            Why LocalDrop outperforms cloud file lockers and traditional Bluetooth tools.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Zero Cloud Storage',
              desc: 'Transfers stream directly device-to-device. Files never touch or reside on a remote server.',
              icon: Lock,
              color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            },
            {
              title: 'Direct LAN Speeds',
              desc: 'Takes full advantage of 5GHz Wi-Fi and Gigabit Ethernet with speeds up to 100+ MB/s.',
              icon: Zap,
              color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            },
            {
              title: 'Multi-GB Streaming',
              desc: 'Streams 4K video files and massive archives in 64KB backpressured slices without browser crashes.',
              icon: Layers,
              color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            },
            {
              title: 'End-to-End Encrypted',
              desc: 'Protected by WebRTC DTLS/SRTP encryption standards with cryptographically secure handshakes.',
              icon: ShieldCheck,
              color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                custom={i}
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-6 rounded-3xl bg-card/70 border border-white/[0.05] hover:border-blue-500/40 transition-all space-y-3 shadow-sm"
              >
                <div className={`w-11 h-11 rounded-2xl border border-white/[0.05] flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/* 5. DEVELOPER CLI SECTION */}
      {/* ============================================================ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
        className="max-w-3xl mx-auto px-4"
      >
        <motion.div
          variants={fadeInUp}
          whileHover={{ scale: 1.01 }}
          className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-card/80 to-muted/30 border border-white/[0.05] shadow-2xl text-center space-y-6"
        >
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              For Hackers & Power Users
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Launch in 2 Seconds from Your Terminal
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Run LocalDrop on your workstation, server, or Raspberry Pi without installing any packages globally.
            </p>
          </div>

          <div className="flex items-center justify-between max-w-md mx-auto p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-200 font-mono text-xs sm:text-sm shadow-inner group">
            <div className="flex items-center gap-2.5">
              <span className="text-blue-400 font-bold select-none">$</span>
              <span className="font-semibold tracking-wide">npx localdrop</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyCliCommand}
              className="px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Copy to clipboard"
            >
              {copiedCli ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </motion.button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Auto LAN IP Detection
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Terminal QR Code
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero Permanent Config
            </span>
          </div>
        </motion.div>
      </motion.section>

      {/* ============================================================ */}
      {/* 6. GITHUB & CREATOR CALL TO ACTION */}
      {/* ============================================================ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={staggerContainer}
        className="text-center max-w-2xl mx-auto px-4 space-y-6"
      >
        <motion.div variants={fadeInUp} className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center mb-3 shadow-inner">
            <Github className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
            Open Source. Non-Commercial.
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            LocalDrop is built for the global open-source community. Fork, inspect, contribute, or self-host your own instance.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-3">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://github.com/Cathhdyy/LocalDrop"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md active:scale-95"
          >
            <Github className="w-4 h-4" />
            <span>⭐ Star on GitHub</span>
          </motion.a>
        </motion.div>
      </motion.section>
    </div>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
