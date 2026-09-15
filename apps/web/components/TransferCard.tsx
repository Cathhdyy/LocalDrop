'use client';

import React from 'react';
import {
  TransferProgress,
  TransferState,
} from '@localdrop/protocol';
import { IncomingTransferPrompt } from '../hooks/useWebRTC';
import {
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CheckCircle,
  AlertTriangle,
  File,
  Film,
  Image as ImageIcon,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-5 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <ArrowDownLeft className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
                Incoming File
              </span>
              <h3 className="text-base font-bold text-foreground truncate max-w-[200px]">
                {incomingPrompt.fileName}
              </h3>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/50 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size</span>
              <span className="font-semibold text-foreground">
                {formatBytes(incomingPrompt.fileSize)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">From</span>
              <span className="font-semibold text-foreground">{incomingPrompt.senderName}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRejectIncoming}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onAcceptIncoming}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all"
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
    <div className="p-5 rounded-3xl bg-card border border-border shadow-lg space-y-4 animate-slide-up">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-500'
                : isFailed
                ? 'bg-rose-500/10 text-rose-500'
                : 'bg-blue-500/10 text-blue-500'
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="w-5 h-5" />
            ) : isFailed ? (
              <AlertTriangle className="w-5 h-5" />
            ) : isSending ? (
              <ArrowUpRight className="w-5 h-5" />
            ) : (
              <ArrowDownLeft className="w-5 h-5" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {isCompleted
                ? 'Transfer Completed'
                : isFailed
                ? 'Transfer Cancelled'
                : isSending
                ? `Sending to ${currentTransfer.peerName}`
                : `Receiving from ${currentTransfer.peerName}`}
            </span>
            <h4 className="text-sm font-bold text-foreground truncate max-w-[220px]">
              {currentTransfer.fileName}
            </h4>
          </div>
        </div>

        {isCompleted || isFailed ? (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onCancelTransfer}
            className="text-xs font-semibold text-rose-500 hover:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 rounded-full ${
              isCompleted
                ? 'bg-emerald-500'
                : isFailed
                ? 'bg-rose-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>{percent}%</span>
          <span>
            {formatBytes(currentTransfer.bytesTransferred)} / {formatBytes(currentTransfer.totalBytes)}
          </span>
          {!isCompleted && !isFailed && (
            <>
              <span className="text-blue-500 font-semibold">{formatSpeed(currentTransfer.currentSpeed)}</span>
              <span>ETA {formatEta(currentTransfer.estimatedSecondsRemaining)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
