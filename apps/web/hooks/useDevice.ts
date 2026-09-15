'use client';

import { useState, useEffect } from 'react';
import { DeviceInfo, PlatformType } from '@localdrop/protocol';

function detectPlatform(): PlatformType {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'web';
  }
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/macintosh|mac os x/.test(ua)) return 'macos';
  if (/windows|win32/.test(ua)) return 'windows';
  if (/linux/.test(ua)) return 'linux';
  return 'web';
}

function detectBrowser(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'Browser';
  }
  const ua = navigator.userAgent;
  if (/Edg/.test(ua)) return 'Edge';
  if (/Chrome/.test(ua) && !/Edg/.test(ua)) return 'Chrome';
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
  if (/Firefox/.test(ua)) return 'Firefox';
  return 'Browser';
}

function getDefaultDeviceName(platform: PlatformType): string {
  switch (platform) {
    case 'windows':
      return 'Windows PC';
    case 'macos':
      return 'MacBook';
    case 'ios':
      return 'iPhone';
    case 'android':
      return 'Android Phone';
    case 'linux':
      return 'Linux Machine';
    default:
      return 'LocalDrop Device';
  }
}

export function useDevice() {
  const [device, setDevice] = useState<DeviceInfo>({
    deviceId: 'init',
    deviceName: 'LocalDrop Device',
    platform: 'web',
  });

  const [devMode, setDevMode] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // 1. Device ID
    let storedId = localStorage.getItem('localdrop_device_id');
    if (!storedId) {
      storedId = 'dev_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('localdrop_device_id', storedId);
    }

    const platform = detectPlatform();
    const browser = detectBrowser();

    // 2. Device Name
    let storedName = localStorage.getItem('localdrop_device_name');
    if (!storedName) {
      storedName = getDefaultDeviceName(platform);
      localStorage.setItem('localdrop_device_name', storedName);
    }

    setDevice({
      deviceId: storedId,
      deviceName: storedName,
      platform,
      browser,
    });

    // 3. Dev Mode
    const storedDevMode = localStorage.getItem('localdrop_dev_mode') === 'true';
    setDevMode(storedDevMode);

    // 4. Theme
    const storedTheme = (localStorage.getItem('localdrop_theme') as 'dark' | 'light') || 'dark';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, []);

  const updateDeviceName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem('localdrop_device_name', trimmed);
    setDevice((prev) => ({ ...prev, deviceName: trimmed }));
  };

  const toggleDevMode = (enabled: boolean) => {
    localStorage.setItem('localdrop_dev_mode', String(enabled));
    setDevMode(enabled);
  };

  const toggleTheme = (newTheme: 'dark' | 'light') => {
    localStorage.setItem('localdrop_theme', newTheme);
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return {
    device,
    devMode,
    theme,
    updateDeviceName,
    toggleDevMode,
    toggleTheme,
  };
}
