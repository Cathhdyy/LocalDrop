export interface ChangelogSection {
  category: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  title: string;
  date: string;
  isLatest?: boolean;
  dateColor?: string;
  previewType?: 'clipboard' | 'pairing';
  sections: ChangelogSection[];
}

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: 'v1.2.0',
    title: 'Universal Live Clipboard & UI Overhaul',
    date: '17 Sep 2026',
    isLatest: true,
    dateColor: 'text-blue-500 dark:text-blue-400',
    previewType: 'clipboard',
    sections: [
      {
        category: 'Features:',
        items: [
          'Added Universal P2P Live Clipboard synchronization across all connected devices.',
          'Smart content detection with auto-classification for URLs, code snippets, and hex/rgb color swatches.',
          'Apple-inspired floating Dynamic Island pill with instant one-tap clipboard copy and haptic feedback.',
          'Dedicated Clipboard Hub with search, category filtering, and local history persistence.',
        ],
      },
      {
        category: 'UI & Design:',
        items: [
          'Redesigned landing page with interactive architectural comparison cards ("Why LocalDrop?").',
          'Consolidated Navbar status into a unified Dynamic Island status capsule with live ping pulse.',
          'Modern frosted micro-toolbar for sound controls, theme toggling, and device settings.',
          'Fixed dark mode input field contrast and system background color overrides.',
        ],
      },
      {
        category: 'Code & Core:',
        items: [
          'Extended @localdrop/protocol with clipboard-share message schemas and payload typing.',
          'Added localdrop_clipboard_history persistence with zero cloud transmission.',
          'Optimized mobile touch targets to prevent layout shifts on iOS Safari and Android Chrome.',
        ],
      },
    ],
  },
  {
    version: 'v1.1.0',
    title: 'Dynamic QR Mesh & 6-Digit PIN Pairing',
    date: '10 Sep 2026',
    dateColor: 'text-indigo-500 dark:text-indigo-400',
    previewType: 'pairing',
    sections: [
      {
        category: 'Features:',
        items: [
          'Instant cross-network pairing via dynamic QR code scanning and 6-digit verification PINs.',
          'Multi-device radar discovery visualization showing nearby peers on the local network.',
          'Audio sound effects for connection establishment, transfer progress, and pairing prompts.',
          'Configurable device nicknames with real-time propagation across active peers.',
        ],
      },
      {
        category: 'Protocol & Security:',
        items: [
          'Implemented WebRTC DTLS 1.3 handshake encryption for all direct peer connections.',
          'Zero-knowledge signaling channel: ICE candidates negotiated without logging payload metadata.',
          'Optimized chunked file streaming with sliding-window flow control over RTCDataChannel.',
        ],
      },
      {
        category: 'Performance & Fixes:',
        items: [
          'Streamlined memory footprint to under 15MB during multi-gigabyte file transfers.',
          'Automatic peer reconnection with exponential backoff on intermittent Wi-Fi drops.',
        ],
      },
    ],
  },
  {
    version: 'v1.0.0',
    title: 'Initial Release — AirDrop for EVERY Device',
    date: '01 Sep 2026',
    dateColor: 'text-emerald-500 dark:text-emerald-400',
    sections: [
      {
        category: 'Features:',
        items: [
          'Direct peer-to-peer file sharing between iOS, Android, macOS, Windows, and Linux.',
          'Zero account requirements, zero cloud servers, and zero telemetry.',
          'Drag-and-drop file staging area with support for files of any size or format.',
          'Instant plain text sharing directly into connected devices.',
        ],
      },
      {
        category: 'Architecture:',
        items: [
          'Turbo monorepo architecture with modular @localdrop/protocol, @localdrop/p2p, and @localdrop/signaling packages.',
          'Next.js 14 App Router client with responsive Tailwind CSS styling.',
          'Progressive Web App (PWA) manifest support for standalone installation.',
        ],
      },
    ],
  },
];
