'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Smartphone, Wifi } from 'lucide-react';

interface QRPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export function QRPairingModal({ isOpen, onClose, roomId }: QRPairingModalProps) {
  const [copied, setCopied] = useState(false);
  const [lanUrl, setLanUrl] = useState('');
  const [primaryIp, setPrimaryIp] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const protocol = window.location.protocol;
    setPrimaryIp(hostname);
    setLanUrl(`${protocol}//${hostname}${port}/?room=${roomId}`);
  }, [roomId]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!lanUrl) return;
    navigator.clipboard.writeText(lanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm p-6 rounded-2xl bg-card border border-border shadow-2xl text-center space-y-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Image
              src="/favicon.png"
              alt="LocalDrop Logo"
              width={22}
              height={22}
              className="w-5 h-5 object-contain drop-shadow-[0_1px_4px_rgba(37,99,235,0.35)]"
            />
            <span className="font-bold text-foreground">Pair Another Device</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-muted-foreground">
          Scan this QR code with your phone camera or tablet on the same Wi-Fi network.
        </p>

        {/* QR Code Container */}
        <div className="flex justify-center py-2">
          <div className="p-4 bg-white rounded-2xl shadow-md border border-neutral-200">
            {lanUrl ? (
              <QRCodeSVG
                value={lanUrl}
                size={200}
                level="M"
                includeMargin={false}
              />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center text-neutral-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>
        </div>

        {/* LAN IP & URL display */}
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted border border-border text-xs">
            <div className="flex items-center gap-2 truncate text-muted-foreground font-mono">
              <Wifi className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{lanUrl || 'Detecting network address...'}</span>
            </div>
            <button
              onClick={handleCopy}
              className="p-1.5 ml-2 rounded-md hover:bg-background transition-colors text-foreground shrink-0"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Room ID: <span className="font-mono font-medium text-foreground">{roomId}</span></span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-sm bg-muted hover:bg-muted/80 text-foreground transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
