'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCopy,
  Zap,
  Send,
  Trash2,
  Search,
  ExternalLink,
  Code2,
  Palette,
  FileText,
  Check,
  RotateCcw,
  Sparkles,
  Smartphone,
  Laptop,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { SharedClipboardItem, DeviceInfo, PlatformType } from '@localdrop/protocol';

interface ClipboardManagerProps {
  selectedPeer: DeviceInfo | null;
  connectedPeerCount: number;
  clipboardItems: SharedClipboardItem[];
  onSendClipboard: (targetPeerId: string | 'all', content: string) => boolean;
  onDeleteClipboardItem: (id: string) => void;
  onClearHistory: () => void;
  autoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
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
      return <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    case 'code':
      return <Code2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    case 'color':
      return <Palette className="w-3.5 h-3.5 text-pink-400 shrink-0" />;
    default:
      return <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
  }
}

function formatRelativeTime(timestamp: number) {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function ClipboardManager({
  selectedPeer,
  connectedPeerCount,
  clipboardItems,
  onSendClipboard,
  onDeleteClipboardItem,
  onClearHistory,
  autoSyncEnabled,
  onToggleAutoSync,
}: ClipboardManagerProps) {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'url' | 'code' | 'color' | 'text'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleBroadcast = (contentToBroadcast?: string) => {
    const text = contentToBroadcast ?? inputText;
    if (!text.trim()) return;

    const target = selectedPeer ? selectedPeer.deviceId : 'all';
    const ok = onSendClipboard(target, text);
    if (ok) {
      setInputText('');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        if (autoSyncEnabled) {
          handleBroadcast(text);
        }
      }
    } catch (err) {
      console.warn('Clipboard read permission denied:', err);
    }
  };

  const handleCopyItem = async (item: SharedClipboardItem) => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiedId(item.id);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(40);
      }
      setTimeout(() => {
        setCopiedId(null);
      }, 1800);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const filteredItems = useMemo(() => {
    return clipboardItems.filter((item) => {
      const matchesFilter = selectedFilter === 'all' || item.contentType === selectedFilter;
      const matchesSearch =
        searchQuery === '' ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.senderName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [clipboardItems, selectedFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Banner & Control Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">Universal P2P Live Clipboard</h3>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  E2E Encrypted
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Instantly beam copied text, code snippets, or links to all connected devices.
              </p>
            </div>
          </div>

          {/* Auto-Sync Toggle */}
          <div className="flex items-center gap-2.5 sm:self-center self-start bg-muted/60 p-1.5 px-3 rounded-2xl border border-white/[0.05]">
            <span className="text-xs font-semibold text-foreground">Auto-Broadcast</span>
            <button
              onClick={() => onToggleAutoSync(!autoSyncEnabled)}
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                autoSyncEnabled ? 'bg-blue-600' : 'bg-neutral-700'
              }`}
              role="switch"
              aria-checked={autoSyncEnabled}
              title="Broadcast automatically when pasting into LocalDrop"
            >
              <motion.div
                layout
                className="w-4 h-4 rounded-full bg-white shadow-sm"
                animate={{ x: autoSyncEnabled ? 16 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>

        {/* Input & Quick Broadcast Area */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleBroadcast();
                }
              }}
              placeholder="Paste or type text, URL, or code snippet to beam across devices... (Press Ctrl+Enter to broadcast)"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-white/[0.08] text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-white/[0.08] transition-all active:scale-95 shadow-sm"
            >
              <ClipboardCopy className="w-3.5 h-3.5 text-blue-400" />
              <span>Paste from System</span>
            </button>

            <button
              type="button"
              onClick={() => handleBroadcast()}
              disabled={!inputText.trim() || connectedPeerCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer ml-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {connectedPeerCount === 0
                  ? 'Connect a Device to Broadcast'
                  : selectedPeer
                  ? `Broadcast to ${selectedPeer.deviceName}`
                  : `Broadcast to All (${connectedPeerCount})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* History Feed & Search Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(['all', 'url', 'code', 'color', 'text'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all capitalize ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground border border-white/[0.05]'
                }`}
              >
                {filter === 'all' ? 'All Snippets' : filter}
              </button>
            ))}
          </div>

          {/* Search Box & Clear button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-muted/60 border border-white/[0.08] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            {clipboardItems.length > 0 && (
              <button
                onClick={onClearHistory}
                title="Clear clipboard history"
                className="p-1.5 text-muted-foreground hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors border border-white/[0.05]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* List of items */}
        {filteredItems.length === 0 ? (
          <div className="p-10 rounded-3xl border border-white/[0.06] bg-card/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <ClipboardCopy className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-bold text-foreground">No clipboard items yet</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect your devices on local Wi-Fi. Whenever you copy text, a link, or code on one device, it will
                instantly appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {filteredItems.map((item) => {
                const isCopied = copiedId === item.id;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-card/80 border border-white/[0.07] hover:border-blue-500/30 transition-colors space-y-2.5 shadow-sm group"
                  >
                    {/* Item header */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 truncate">
                        <span className="p-1 rounded-md bg-muted flex items-center justify-center">
                          {getContentIcon(item.contentType)}
                        </span>
                        <span className="font-semibold text-foreground capitalize text-[11px]">
                          {item.contentType}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-[11px] truncate">
                          {getPlatformIcon(item.senderPlatform)}
                          <span>
                            {item.direction === 'sent' ? 'Broadcast by You' : `From ${item.senderName}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                        <button
                          onClick={() => onDeleteClipboardItem(item.id)}
                          className="p-1 text-muted-foreground hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete snippet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content snippet body */}
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-white/[0.04]">
                      {item.contentType === 'color' ? (
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-6 h-6 rounded-lg border border-white/20 shadow-sm shrink-0"
                            style={{ backgroundColor: item.content }}
                          />
                          <span className="font-mono text-xs text-foreground font-bold">{item.content}</span>
                        </div>
                      ) : item.contentType === 'url' ? (
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={item.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue-400 hover:underline truncate inline-flex items-center gap-1.5"
                          >
                            <span className="truncate">{item.content}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      ) : item.contentType === 'code' ? (
                        <pre className="font-mono text-[11px] text-neutral-200 whitespace-pre-wrap break-words max-h-48 overflow-y-auto leading-relaxed">
                          {item.content}
                        </pre>
                      ) : (
                        <p className="text-xs text-foreground whitespace-pre-wrap break-words max-h-36 overflow-y-auto leading-relaxed">
                          {item.content}
                        </p>
                      )}
                    </div>

                    {/* Actions footer */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {item.content.length} characters
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleBroadcast(item.content)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Re-broadcast snippet"
                        >
                          <Zap className="w-3 h-3 text-blue-400" />
                          <span>Re-beam</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyItem(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 shadow-sm ${
                            isCopied
                              ? 'bg-emerald-500 text-white'
                              : 'bg-muted hover:bg-muted/80 text-foreground border border-white/[0.08]'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <ClipboardCopy className="w-3 h-3 text-blue-400" />
                              <span>Copy to Device</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
