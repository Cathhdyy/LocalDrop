'use client';

import React from 'react';
import { Github, Shield, FileText, Scale, Sparkles, ExternalLink, Info } from 'lucide-react';
import { LegalTab } from './LegalModal';

interface FooterProps {
  onOpenAbout: () => void;
  onOpenLegal: (tab: LegalTab) => void;
}

export function Footer({ onOpenAbout, onOpenLegal }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card/40 backdrop-blur-xl mt-auto transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/20">
                ⚡
              </div>
              <span className="font-extrabold text-base tracking-tight text-foreground">
                LocalDrop
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                P2P
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              AirDrop for EVERY device. High-speed encrypted peer-to-peer file transfers, folder sharing, and text exchange with zero cloud storage, zero tracking, and no account requirements.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border/70 text-[11px] font-medium text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Zero Cloud Storage
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border/70 text-[11px] font-medium text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                End-to-End Encrypted
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenAbout}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-1 tap-target"
                >
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>About LocalDrop</span>
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/Cathhdyy/LocalDrop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-1 tap-target group"
                >
                  <Github className="w-3.5 h-3.5 text-foreground group-hover:text-blue-400 transition-colors" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Cathhdyy/LocalDrop/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-1 tap-target group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Releases & Changelog</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-1 tap-target text-left"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Privacy Policy (Zero Data Collection)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-1 tap-target text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('license')}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-1 tap-target text-left"
                >
                  <Scale className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>License (CC BY-NC 4.0 Non-Commercial)</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Attribution Bar */}
        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          {/* Creator Attribution */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="text-foreground font-medium">Made by</span>
            <a
              href="https://sanscarr.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 font-bold hover:bg-blue-500/20 hover:border-blue-500/40 transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>Sanskar Sharma</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Copyright & License Note */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80 font-mono text-center sm:text-right">
            <span>© {currentYear} LocalDrop.</span>
            <span>•</span>
            <button
              onClick={() => onOpenLegal('license')}
              className="hover:text-foreground transition-colors underline underline-offset-2 decoration-border hover:decoration-foreground"
            >
              CC BY-NC 4.0 Licensed
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
