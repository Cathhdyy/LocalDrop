'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File, Image as ImageIcon, Video, Folder, X, Send, Film } from 'lucide-react';
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
}

export function DropZone({ selectedPeer, onSendFiles, disabled }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileItemWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    const newItems: FileItemWithPreview[] = list.map((file) => {
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');
      let previewUrl: string | undefined = undefined;

      if (isImg) {
        previewUrl = URL.createObjectURL(file);
      }

      return {
        file,
        previewUrl,
        isVideo: isVid,
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
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer select-none ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
            : 'border-border bg-card/60 hover:border-blue-500/50 hover:bg-muted/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-500 shadow-inner">
          <UploadCloud className="w-8 h-8 stroke-[1.5]" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            Drop files here
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            or <span className="text-blue-500 font-medium">browse</span> from your device
          </p>
        </div>

        <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" /> Photos
          </span>
          <span className="flex items-center gap-1">
            <Video className="w-3.5 h-3.5" /> Videos
          </span>
          <span className="flex items-center gap-1">
            <File className="w-3.5 h-3.5" /> Multi-GB Files
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              folderInputRef.current?.click();
            }}
            className="flex items-center gap-1 hover:text-blue-500 transition-colors"
          >
            <Folder className="w-3.5 h-3.5" /> Folder
          </button>
        </div>
      </div>

      {/* Selected Files Preview List */}
      {selectedFiles.length > 0 && (
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>
              {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected (
              {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.file.size, 0))})
            </span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {selectedFiles.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/60 border border-border/50 text-xs"
              >
                <div className="flex items-center gap-2.5 truncate mr-2">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-9 h-9 rounded-lg object-cover border border-border shrink-0"
                    />
                  ) : item.isVideo ? (
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                      <Film className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                      <File className="w-4 h-4" />
                    </div>
                  )}

                  <div className="truncate">
                    <p className="font-medium text-foreground truncate">{item.file.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFile(idx)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Send Action */}
          <button
            onClick={handleSend}
            disabled={!selectedPeer || disabled}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              selectedPeer && !disabled
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 active:scale-[0.99]'
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
