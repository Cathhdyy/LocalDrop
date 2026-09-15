'use client';

import React from 'react';
import { TransferHistoryItem } from '@localdrop/protocol';
import { ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';

interface HistoryListProps {
  history: TransferHistoryItem[];
  onClearHistory: () => void;
}

export function HistoryList({ history, onClearHistory }: HistoryListProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec <= 0) return '';
    const mb = bytesPerSec / (1024 * 1024);
    if (mb >= 1) return ` • ${mb.toFixed(1)} MB/s`;
    const kb = bytesPerSec / 1024;
    return ` • ${kb.toFixed(0)} KB/s`;
  };

  if (history.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-border bg-card/40 text-center space-y-2 text-muted-foreground text-xs">
        <Clock className="w-8 h-8 mx-auto stroke-[1.5] text-muted-foreground/50" />
        <p>No recent transfers yet.</p>
        <p className="text-[11px]">Completed transfers will be saved here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Transfers
        </h3>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-rose-500 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {history.map((item) => {
          const isSent = item.direction === 'sent';
          const isSuccess = item.state === 'COMPLETED';

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/70 text-xs"
            >
              <div className="flex items-center gap-3 truncate mr-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSent
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-indigo-500/10 text-indigo-500'
                  }`}
                >
                  {isSent ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4" />
                  )}
                </div>

                <div className="truncate">
                  <h4 className="font-semibold text-foreground truncate">{item.fileName}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                    <span>{formatBytes(item.fileSize)}</span>
                    <span>•</span>
                    <span>
                      {isSent ? `Sent to ${item.peerName}` : `Received from ${item.peerName}`}
                    </span>
                    <span className="font-mono">{formatSpeed(item.speedAvgBytesPerSec)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isSuccess ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3 h-3" />
                    Failed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
