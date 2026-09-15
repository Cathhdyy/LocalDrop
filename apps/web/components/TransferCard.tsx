'use client';

import React from 'react';
import { TransferProgress } from '@localdrop/protocol';
import { IncomingTransferPrompt } from '../hooks/useWebRTC';
import {
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CheckCircle,
  AlertTriangle,
  Zap,
  Clock,
  HardDrive,
} from 'lucide-react';

interface TransferCardProps {
  currentTransfer: TransferProgress | null;
  incomingPrompt: IncomingTransferPrompt | null;
  onAcceptIncoming: () => void;
  onRejectIncoming: () => void;
  onCancelTransfer: () => void;
  onDismiss: () => void;
}

export function TransferCard({
  currentTransfer,
  incomingPrompt,
  onAcceptIncoming,
  onRejectIncoming,
  onCancelTransfer,
  onDismiss,
}: TransferCardProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec <= 0) return '0 KB/s';
    const mb = bytesPerSec / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB/s`;
    const kb = bytesPerSec / 1024;
    return `${kb.toFixed(0)} KB/s`;
  };

  const formatEta = (seconds: number): string => {
    if (seconds <= 0 || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Incoming File Prompt Dialog
  if (incomingPrompt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-5 animate-slide-up text-center">
          <div className="relative w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 mx-auto flex items-center justify-center text-blue-400">
            <ArrowDownLeft className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase font-mono font-bold tracking-widest text-blue-400">
              Incoming File Transfer
            </span>
            <h3 className="text-base font-bold text-foreground truncate max-w-[260px] mx-auto">
              {incomingPrompt.fileName}
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-muted/60 border border-border/60 text-xs space-y-2 text-left">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
                File Size
              </span>
              <span className="font-mono font-bold text-foreground">
                {formatBytes(incomingPrompt.fileSize)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">From Device</span>
              <span className="font-semibold text-foreground">{incomingPrompt.senderName}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRejectIncoming}
              className="py-3 px-4 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all"
            >
              Decline
            </button>
            <button
              onClick={onAcceptIncoming}
              className="py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              Accept File
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Transfer Progress Card
  if (!currentTransfer) return null;

  const percent =
    currentTransfer.totalBytes > 0
      ? Math.min(100, Math.round((currentTransfer.bytesTransferred / currentTransfer.totalBytes) * 100))
      : 0;

  const isSending = currentTransfer.direction === 'sending';
  const isCompleted = currentTransfer.state === 'COMPLETED';
  const isFailed = currentTransfer.state === 'FAILED' || currentTransfer.state === 'CANCELLED';

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border/90 shadow-xl space-y-4 animate-slide-up">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5 truncate mr-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isFailed
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="w-5 h-5" />
            ) : isFailed ? (
              <AlertTriangle className="w-5 h-5" />
            ) : isSending ? (
              <ArrowUpRight className="w-5 h-5 animate-pulse" />
            ) : (
              <ArrowDownLeft className="w-5 h-5 animate-pulse" />
            )}
          </div>

          <div className="truncate">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-muted-foreground block">
              {isCompleted
                ? '✓ Completed'
                : isFailed
                ? '✕ Transfer Cancelled'
                : isSending
                ? `Sending to ${currentTransfer.peerName}`
                : `Receiving from ${currentTransfer.peerName}`}
            </span>
            <h4 className="text-sm font-bold text-foreground truncate max-w-[240px] sm:max-w-xs">
              {currentTransfer.fileName}
            </h4>
          </div>
        </div>

        {isCompleted || isFailed ? (
          <button
            onClick={onDismiss}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onCancelTransfer}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl hover:bg-rose-500/10 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar with glowing beam */}
      <div className="space-y-2">
        <div className="relative h-3 w-full bg-muted/80 rounded-full overflow-hidden border border-border/40">
          <div
            className={`h-full transition-all duration-200 rounded-full relative overflow-hidden ${
              isCompleted
                ? 'bg-emerald-500'
                : isFailed
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-blue-600 to-indigo-500'
            }`}
            style={{ width: `${percent}%` }}
          >
            {!isCompleted && !isFailed && <div className="shimmer-beam" />}
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-1">
          <span className="font-bold text-foreground">{percent}%</span>

          <span>
            {formatBytes(currentTransfer.bytesTransferred)} / {formatBytes(currentTransfer.totalBytes)}
          </span>

          {!isCompleted && !isFailed && (
            <>
              <span className="flex items-center gap-1 text-blue-400 font-semibold">
                <Zap className="w-3.5 h-3.5" />
                {formatSpeed(currentTransfer.currentSpeed)}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                ETA {formatEta(currentTransfer.estimatedSecondsRemaining)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
