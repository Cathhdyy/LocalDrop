# ⚡ LocalDrop

### AirDrop for EVERY device.

Transfer files, photos, videos, and text directly between your devices.

**No account. No cloud. No cables.**

```bash
npx localdrop
```

---

```
   Device A (PC / Mac / Linux)                  Device B (iPhone / Android)
   ┌───────────────────────────┐                ┌───────────────────────────┐
   │ ⚡ LocalDrop              │                │ ⚡ LocalDrop              │
   │                           │                │                           │
   │  Drop files here          │                │   Tap to send files       │
   └─────────────┬─────────────┘                └─────────────▲─────────────┘
                 │                                            │
                 │      Direct Encrypted P2P Connection       │
                 └────────────────────────────────────────────┘
                         (WebRTC DataChannel • DTLS)
```

---

## 🌟 Highlights

- **AirDrop for Every Device**: Connect Windows, macOS, Linux, iOS, Android, and web browsers.
- **Zero Cloud Storage**: Transferred files stream directly device-to-device. Nothing is permanently stored or uploaded to a cloud server.
- **Multi-Gigabyte Streaming**: Chunked 64KB streaming engine with backpressure control transfers multi-GB files without memory exhaustion.
- **Instant QR Pairing**: Point your phone camera at the screen QR code to connect in seconds.
- **Text & Clipboard Sharing**: Share URLs, passwords, code snippets, and notes with 1-click copy.
- **End-to-End Encrypted**: WebRTC DTLS/SRTP encryption protects all traffic, even on public Wi-Fi.
- **CLI & Web Interface**: Run `npx localdrop` from any terminal or open the web app.

---

## 🚀 Quick Start

### Option 1: Run via NPX (Recommended)

No installation required. Just run:

```bash
npx localdrop
```

The terminal displays your local and network URLs along with a pairing QR code:

```text
╭──────────────────────────────────────╮
│             ⚡ LocalDrop              │
│        AirDrop for EVERY device      │
╰──────────────────────────────────────╯

✓ Local server started

Local:   http://localhost:8787
Network: http://192.168.1.42:8787

Scan this QR code with another device:
  ███████████████████████████
  █ ▄▄▄▄▄ █▀▄█▀▄█ █ ▄▄▄▄▄ █
  █ █   █ █ ▄ █▄▀██ █   █ █
  █ █▄▄▄█ █▄█ █▀▀▀█ █▄▄▄█ █
  ███████████████████████████

Waiting for devices...
```

Scan the QR code with your phone camera, and you are ready to transfer files!

---

### Option 2: Clone and Run Locally

```bash
git clone https://github.com/localdrop/localdrop.git
cd localdrop

# Install dependencies
npm install

# Run unit and integration tests
npm test

# Build all packages and web frontend
npm run build

# Start LocalDrop
npm start
```

---

## 📱 How It Works

```
        Device A                                       Device B
           │                                              │
           ├──────────── 1. Scan QR Code ─────────────────┤
           │                                              │
           ├──────────── 2. WebSocket Signaling ──────────┤
           │             (SDP Offer / Answer)             │
           │                                              │
           ├──────────── 3. Direct P2P Channel ───────────┤
           │             (WebRTC RTCDataChannel)          │
           │                                              │
           ├════════════ 4. Chunked File Stream ═════════►│
           │             (64KB slices + Backpressure)     │
           │                                              │
           │◄─────────── 5. Checksum Verified ────────────┤
```

1. **Discovery & Signaling**: When you start LocalDrop, an ephemeral WebSocket room is created on port `8787`.
2. **Pairing Approval**: When another device joins, the host receives an explicit connection prompt (`📱 iPhone wants to connect: [ Accept ] [ Decline ]`).
3. **P2P Establishment**: Browsers exchange WebRTC offers/answers via the signaling server, then establish a direct encrypted `RTCDataChannel`.
4. **Chunked Streaming**: Files are sliced into 64KB buffers and streamed directly peer-to-peer.
5. **Zero Cloud Residue**: Once the transfer is complete, the file exists solely on the recipient's device.

---

## 🔒 Security & Privacy Model

| Guarantee | How LocalDrop Delivers It |
|---|---|
| **Zero Cloud Storage** | Files never transit or sit on a central storage server. |
| **End-to-End Encryption** | WebRTC requires DTLS (AES-GCM / ChaCha20-Poly1305) on all channels. |
| **Explicit Authorization** | Receivers must explicitly accept incoming connections and incoming files. |
| **No Device Directory** | There is no public registry of online devices. Sessions use random tokens. |
| **Sanitized Handling** | Filenames are sanitized against directory traversal attacks. |

Read the full [Security Documentation](docs/SECURITY.md) and [Architecture Guide](docs/ARCHITECTURE.md).

---

## 💻 Supported Platforms

- **Windows 10 / 11** (Chrome, Edge, Firefox, Brave)
- **macOS** (Safari, Chrome, Arc, Firefox)
- **Linux** (Chrome, Firefox)
- **iOS / iPadOS** (Safari, Chrome)
- **Android** (Chrome, Samsung Internet, Firefox)

---

## 🛠️ Project Structure

```
localdrop/
├── apps/
│   ├── web/            # Next.js 14 Web UI & PWA (React, Tailwind CSS, Lucide)
│   ├── signaling/      # WebSocket signaling server (ws, network detection)
│   └── cli/            # CLI binary (commander, chalk, boxen, qrcode-terminal)
├── packages/
│   ├── protocol/       # Shared TypeScript protocol types, constants, schemas
│   └── p2p/            # Chunking, backpressure, reassembly, crypto engine
├── tests/              # Vitest test suite (protocol, chunking, simulation)
└── docs/               # Architecture & security specifications
```

---

## 🗺️ Roadmap

- [x] **v0.1 (MVP)**:
  - CLI `npx localdrop` with terminal QR code
  - WebRTC P2P direct transfers
  - 64KB chunking with backpressure for large files
  - Device nickname detection and customization
  - Text & URL sharing with 1-click copy
  - Image previews and video thumbnails
  - Transfer history and developer diagnostics panel
  - Responsive mobile-first UI with dark/light themes
- [ ] **v0.2**:
  - Folder hierarchy transfers
  - Pause & resume transfers
  - Multi-device broadcast transfer
- [ ] **v0.3**:
  - Direct local LAN mDNS / Bonjour discovery
  - Clipboard auto-sync
- [ ] **v0.4**:
  - Native desktop wrappers (Electron / Tauri)
  - Background transfers

---

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License & Permissions

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license.

| Permission | Allowed? |
|---|:---:|
| 🏢 **Commercial Use** | ❌ **No** |
| 🛠️ **Modification** | ✅ **Yes** |
| 📦 **Distribution** | ✅ **Yes** |
| 🔒 **Private Use** | ✅ **Yes** |

You are free to share, adapt, and build upon this material in any medium or format for non-commercial purposes, provided appropriate attribution is given. See the full terms in the [LICENSE](LICENSE) file.
