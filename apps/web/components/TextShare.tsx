'use client';

import React, { useState } from 'react';
import { Send, Copy, Check, Terminal, Globe, FileText, ClipboardPaste, Share2 } from 'lucide-react';
import { DeviceInfo, SharedTextMessage } from '@localdrop/protocol';

interface TextShareProps {
  selectedPeer: DeviceInfo | null;
  textMessages: SharedTextMessage[];
  onSendText: (text: string) => void;
  disabled?: boolean;
}

export function TextShare({
  selectedPeer,
  textMessages,
  onSendText,
  disabled,
}: TextShareProps) {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !selectedPeer || disabled) return;
    onSendText(trimmed);
    setInputText('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareViaSystem = async (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Shared via LocalDrop',
          text,
        });
      } catch (err) {
        // Ignored if user dismissed share dialog
      }
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputText((prev) => (prev ? `${prev}\n${text}` : text));
        }
      }
    } catch (e) {}
  };

  const getPreviewIcon = (text: string) => {
    if (/^https?:\/\//i.test(text.trim())) {
      return <Globe className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (text.includes('\n') || /[{}();=>]/.test(text)) {
      return <Terminal className="w-3.5 h-3.5 text-purple-400" />;
    }
    return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Input Card */}
      <div className="p-5 rounded-3xl bg-card border border-border shadow-md space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/50">
          <span className="font-semibold text-foreground">Share Text, URLs, or Code</span>
          <button
            type="button"
            onClick={handlePasteClipboard}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Paste from Clipboard</span>
          </button>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste links, Wi-Fi passwords, code snippets, notes, terminal commands..."
          rows={4}
          disabled={disabled}
          className="w-full bg-transparent resize-none focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 font-mono leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSend();
            }
          }}
        />

        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <span className="text-muted-foreground text-[11px] font-mono">
            {inputText.length} chars • <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">Ctrl/⌘ + Enter</kbd> to send
          </span>
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || !selectedPeer || disabled}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              inputText.trim() && selectedPeer && !disabled
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 active:scale-95'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            {selectedPeer ? `Send to ${selectedPeer.deviceName}` : 'Select a device'}
          </button>
        </div>
      </div>

      {/* Shared messages list */}
      {textMessages.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground px-1">
            Shared Text History
          </h3>
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {textMessages.map((msg) => {
              const isSent = msg.direction === 'sent';
              const isCopied = copiedId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border transition-all text-xs space-y-2.5 ${
                    isSent
                      ? 'bg-card border-border/70'
                      : 'bg-blue-500/[0.04] border-blue-500/20 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium">
                      {getPreviewIcon(msg.text)}
                      <span className={isSent ? 'text-foreground font-semibold' : 'text-blue-400 font-semibold'}>
                        {isSent ? 'You sent' : `Received from ${msg.senderName}`}
                      </span>
                    </div>
                    <span className="font-mono text-[10px]">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/70 font-mono text-xs text-foreground whitespace-pre-wrap break-words selection:bg-blue-500/30 border border-border/40">
                    {msg.text}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => shareViaSystem(msg.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors border border-border min-h-[36px] active:scale-95"
                      title="Share text"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Share</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors border border-border min-h-[36px] active:scale-95"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
