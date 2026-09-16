'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  File,
  Image as ImageIcon,
  Camera,
  Video,
  Folder,
  X,
  Send,
  Film,
  FileArchive,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { DeviceInfo } from '@localdrop/protocol';

interface DropZoneProps {
  selectedPeer: DeviceInfo | null;
  onSendFiles: (files: File[]) => void;
  disabled?: boolean;
}

interface FileItemWithPreview {
  file: File;
  previewUrl?: string;
  isVideo?: boolean;
  extension: string;
}

export function DropZone({ selectedPeer, onSendFiles, disabled }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileItemWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getExtensionBadge = (name: string, type: string) => {
    const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
    if (type.startsWith('image/')) {
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">{ext}</span>;
    }
    if (type.startsWith('video/')) {
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">{ext}</span>;
    }
    if (ext === 'ZIP' || ext === 'TAR' || ext === 'GZ' || ext === '7Z') {
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">{ext}</span>;
    }
    if (ext === 'PDF') {
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">PDF</span>;
    }
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border">{ext}</span>;
  };

  const handleFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    const newItems: FileItemWithPreview[] = list.map((file) => {
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      let previewUrl: string | undefined = undefined;

      if (isImg) {
        previewUrl = URL.createObjectURL(file);
      }

      return {
        file,
        previewUrl,
        isVideo: isVid,
        extension: ext,
      };
    });

    setSelectedFiles((prev) => [...prev, ...newItems]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const item = prev[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSend = () => {
    if (selectedFiles.length === 0 || !selectedPeer) return;
    onSendFiles(selectedFiles.map((f) => f.file));
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone Box */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-14 rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all cursor-pointer select-none ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/[0.08] scale-[1.01] shadow-2xl shadow-blue-500/10'
            : 'border-border bg-card/60 hover:border-blue-500/50 hover:bg-muted/40'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={disabled}
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          // @ts-ignore
          webkitdirectory=""
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={disabled}
        />
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={disabled}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={disabled}
        />

        {/* Ambient glow in center of drop zone */}
        <div className="absolute w-40 h-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center mb-3 sm:mb-4 text-blue-400 shadow-inner group-hover:scale-105 transition-transform">
          <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8 stroke-[1.75]" />
        </div>

        <div className="relative z-10 text-center space-y-1 sm:space-y-1.5 px-4">
          <h3 className="text-sm sm:text-lg font-bold text-foreground tracking-tight">
            <span className="hidden sm:inline">Drop files here to send</span>
            <span className="sm:hidden">Tap to choose files to send</span>
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            or <span className="text-blue-400 font-semibold underline underline-offset-2">browse photos & files</span>
          </p>
        </div>

        {/* File Type Badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 sm:gap-4 mt-4 sm:mt-6 text-[11px] sm:text-xs text-muted-foreground">
          <span className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-muted/60 border border-border/60">
            <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" /> Photos
          </span>
          <span className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-muted/60 border border-border/60">
            <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" /> 4K Videos
          </span>
          <span className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-muted/60 border border-border/60">
            <FileArchive className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" /> Archives
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              folderInputRef.current?.click();
            }}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-muted/60 hover:bg-muted border border-border/60 text-foreground hover:text-blue-400 transition-colors"
          >
            <Folder className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> Folder
          </button>
        </div>
      </div>

      {/* Quick Action Touch Bar (Mobile Friendly) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-card border border-border hover:border-blue-500/40 hover:bg-muted/50 text-xs font-semibold text-foreground transition-all shadow-sm active:scale-95 disabled:opacity-50 min-h-[44px]"
        >
          <Camera className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Camera</span>
        </button>

        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-card border border-border hover:border-blue-500/40 hover:bg-muted/50 text-xs font-semibold text-foreground transition-all shadow-sm active:scale-95 disabled:opacity-50 min-h-[44px]"
        >
          <ImageIcon className="w-4 h-4 text-pink-400 shrink-0" />
          <span>Photos</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-card border border-border hover:border-blue-500/40 hover:bg-muted/50 text-xs font-semibold text-foreground transition-all shadow-sm active:scale-95 disabled:opacity-50 min-h-[44px]"
        >
          <File className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Files</span>
        </button>

        <button
          type="button"
          onClick={() => folderInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-card border border-border hover:border-blue-500/40 hover:bg-muted/50 text-xs font-semibold text-foreground transition-all shadow-sm active:scale-95 disabled:opacity-50 min-h-[44px]"
        >
          <Folder className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Folders</span>
        </button>
      </div>

      {/* Selected Files Preview List */}
      {selectedFiles.length > 0 && (
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xl space-y-4 animate-slide-up">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-2 border-b border-border/60">
            <span className="flex items-center gap-2">
              <span className="font-bold text-foreground">
                {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
              </span>
              <span>•</span>
              <span className="font-mono">
                {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.file.size, 0))}
              </span>
            </span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {selectedFiles.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border border-border/70 text-xs hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3 truncate mr-2">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                    />
                  ) : item.isVideo ? (
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <Film className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
                      <File className="w-5 h-5" />
                    </div>
                  )}

                  <div className="truncate">
                    <p className="font-semibold text-foreground truncate">{item.file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {formatFileSize(item.file.size)}
                      </span>
                      {getExtensionBadge(item.file.name, item.file.type)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFile(idx)}
                  className="p-1.5 rounded-xl hover:bg-card text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Send CTA Button */}
          <button
            onClick={handleSend}
            disabled={!selectedPeer || disabled}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              selectedPeer && !disabled
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 active:scale-[0.99]'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            {selectedPeer
              ? `Send to ${selectedPeer.deviceName}`
              : 'Select a nearby device above to send'}
          </button>
        </div>
      )}
    </div>
  );
}
