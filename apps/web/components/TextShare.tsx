'use client';

import React, { useState } from 'react';
import { Send, Copy, Check, Terminal, Globe, FileText } from 'lucide-react';
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
      {/* Input box */}
      <div className="p-4 rounded-3xl bg-card border border-border space-y-3 shadow-sm">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste links, code snippets, notes, terminal commands, or text here..."
          rows={4}
          disabled={disabled}
          className="w-full bg-transparent resize-none focus:outline-none text-sm text-foreground placeholder:text-muted-foreground font-sans leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSend();
            }
          }}
        />

        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <span className="text-muted-foreground text-[11px]">
            Press <kbd className="px-1 py-0.5 rounded bg-muted font-mono">⌘/Ctrl + Enter</kbd> to send
          </span>
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || !selectedPeer || disabled}
            className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all ${
              inputText.trim() && selectedPeer && !disabled
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 active:scale-95'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            {selectedPeer ? `Send to ${selectedPeer.deviceName}` : 'Select a device to send'}
          </button>
        </div>
      </div>

      {/* Shared messages list */}
      {textMessages.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Shared Text Messages
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {textMessages.map((msg) => {
              const isSent = msg.direction === 'sent';
              const isCopied = copiedId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-2xl border transition-all text-xs space-y-2 ${
                    isSent
                      ? 'bg-card border-border/60'
                      : 'bg-blue-500/5 border-blue-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium">
                      {getPreviewIcon(msg.text)}
                      <span className={isSent ? 'text-foreground' : 'text-blue-500'}>
                        {isSent ? 'You sent' : `From ${msg.senderName}`}
                      </span>
                    </div>
                    <span className="font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-muted/70 font-mono text-xs text-foreground whitespace-pre-wrap break-words selection:bg-blue-500/30">
                    {msg.text}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors border border-border/60"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-muted-foreground" />
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
