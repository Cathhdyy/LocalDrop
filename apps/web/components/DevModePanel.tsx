'use client';

import React from 'react';
import { Terminal, Activity, Zap, Shield, ChevronDown } from 'lucide-react';
import { WebRTCDiagnostics } from '@localdrop/protocol';

interface DevModePanelProps {
  diagnostics: WebRTCDiagnostics;
  isVisible: boolean;
}

export function DevModePanel({ diagnostics, isVisible }: DevModePanelProps) {
  if (!isVisible) return null;

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec <= 0) return '0 KB/s';
    const mb = bytesPerSec / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB/s`;
    const kb = bytesPerSec / 1024;
    return `${kb.toFixed(1)} KB/s`;
  };

  const formatBytes = (bytes?: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 rounded-3xl bg-card border border-border/80 font-mono text-xs space-y-3 shadow-inner">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
          <Terminal className="w-4 h-4" />
          <span>WebRTC Developer Diagnostics</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Live Stats
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-muted-foreground">
        <div className="p-2 rounded-xl bg-muted/50 border border-border/40 space-y-0.5">
          <span className="text-[10px] uppercase text-muted-foreground block">ICE State</span>
          <span
            className={`font-semibold text-xs ${
              diagnostics.iceConnectionState === 'connected'
                ? 'text-emerald-400'
                : diagnostics.iceConnectionState === 'checking'
                ? 'text-amber-400'
                : 'text-foreground'
            }`}
          >
            {diagnostics.iceConnectionState}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-muted/50 border border-border/40 space-y-0.5">
          <span className="text-[10px] uppercase text-muted-foreground block">DataChannel</span>
          <span
            className={`font-semibold text-xs ${
              diagnostics.dataChannelState === 'open'
                ? 'text-emerald-400'
                : diagnostics.dataChannelState === 'connecting'
                ? 'text-amber-400'
                : 'text-foreground'
            }`}
          >
            {diagnostics.dataChannelState}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-muted/50 border border-border/40 space-y-0.5">
          <span className="text-[10px] uppercase text-muted-foreground block">RTT Latency</span>
          <span className="font-semibold text-xs text-foreground">
            {diagnostics.rttMs !== null ? `${diagnostics.rttMs} ms` : '—'}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-muted/50 border border-border/40 space-y-0.5">
          <span className="text-[10px] uppercase text-muted-foreground block">Throughput</span>
          <span className="font-semibold text-xs text-blue-400">
            {formatSpeed(diagnostics.currentThroughputBytesPerSec)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground">
        <div>
          <span>Channel Buffer: </span>
          <span className="font-semibold text-foreground">
            {formatBytes(diagnostics.bufferedAmount)}
          </span>
        </div>
        <div>
          <span>Total Transferred: </span>
          <span className="font-semibold text-foreground">
            {formatBytes((diagnostics.bytesSent || 0) + (diagnostics.bytesReceived || 0))}
          </span>
        </div>
      </div>

      {/* Raw Event Logs */}
      {diagnostics.recentLogs.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase">Recent WebRTC Events:</span>
          <div className="max-h-24 overflow-y-auto space-y-1 text-[10px] pr-1">
            {diagnostics.recentLogs.slice(-6).map((log, idx) => (
              <div key={idx} className="truncate text-muted-foreground">
                <span className="text-neutral-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                <span
                  className={
                    log.level === 'error'
                      ? 'text-rose-400'
                      : log.level === 'warn'
                      ? 'text-amber-400'
                      : 'text-neutral-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
