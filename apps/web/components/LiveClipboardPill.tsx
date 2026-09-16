'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCopy,
  Check,
  X,
  ExternalLink,
  Code2,
  Palette,
  FileText,
  Laptop,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { SharedClipboardItem, PlatformType } from '@localdrop/protocol';

interface LiveClipboardPillProps {
  item: SharedClipboardItem | null;
  onDismiss: () => void;
  onCopied?: () => void;
}

function getPlatformIcon(platform: PlatformType) {
  switch (platform) {
    case 'ios':
    case 'android':
      return <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    case 'macos':
    case 'windows':
    case 'linux':
      return <Laptop className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
  }
}

function getContentIcon(type: SharedClipboardItem['contentType']) {
  switch (type) {
    case 'url':
      return <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" />;
    case 'code':
      return <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    case 'color':
      return <Palette className="w-4 h-4 text-pink-400 shrink-0" />;
    default:
      return <FileText className="w-4 h-4 text-purple-400 shrink-0" />;
  }
}

export function LiveClipboardPill({ item, onDismiss, onCopied }: LiveClipboardPillProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-dismiss after 12 seconds unless hovered
  useEffect(() => {
    if (!item || isHovered || copied) return;

    timerRef.current = setTimeout(() => {
      onDismiss();
    }, 12000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [item, isHovered, copied, onDismiss]);

  if (!item) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
      onCopied?.();
      setTimeout(() => {
        setCopied(false);
        onDismiss();
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md pointer-events-auto">
      <AnimatePresence>
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: -24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative overflow-hidden rounded-2xl bg-neutral-900/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-3 sm:p-3.5 space-y-2.5 text-white"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 bg-blue-500/20 blur-2xl pointer-events-none" />

          {/* Header row */}
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-300 truncate">
                {getPlatformIcon(item.senderPlatform)}
                <span className="truncate">Copied on {item.senderName}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-neutral-300">
                {item.contentType}
              </span>
              <button
                onClick={onDismiss}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Snippet Content Preview */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              {item.contentType === 'color' ? (
                <div
                  className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                  style={{ backgroundColor: item.content }}
                />
              ) : (
                getContentIcon(item.contentType)
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={`text-xs text-neutral-200 truncate ${
                  item.contentType === 'code' ? 'font-mono text-[11px]' : ''
                }`}
              >
                {item.content}
              </p>
            </div>

            {/* Tap to Paste / Copy Action Button */}
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-sm ${
                copied
                  ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardCopy className="w-3.5 h-3.5" />
                  <span>Tap to Paste</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
