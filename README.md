<div align="center">

# ⚡ LocalDrop

### AirDrop for EVERY Device.

**Direct • Private • Encrypted • Multi-Gigabyte • Peer-to-Peer**

Transfer files, folders, 4K videos, photos, and text directly between your devices.<br />
**No account. No cloud storage. No cables.**

<br />

[![Live App](https://img.shields.io/badge/Live_App-localdropp.vercel.app-3b82f6?style=for-the-badge&logo=vercel&logoColor=white)](https://localdropp.vercel.app)
[![Signaling Backend](https://img.shields.io/badge/Signaling-Railway_Production-0b0d0e?style=for-the-badge&logo=railway&logoColor=white)](https://localdrop-signaling-production.up.railway.app/health)
[![Tests](https://img.shields.io/badge/Tests-10%20Passed-10b981?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/Cathhdyy/LocalDrop)
[![License](https://img.shields.io/badge/License-CC_BY--NC_4.0-purple?style=for-the-badge)](LICENSE)

<br />

[**Try Live Demo**](https://localdropp.vercel.app) • [**Architecture**](docs/ARCHITECTURE.md) • [**Security Model**](docs/SECURITY.md) • [**Deploy Guide**](docs/DEPLOYMENT.md) • [**Report Bug**](https://github.com/Cathhdyy/LocalDrop/issues)

</div>

---

```
             ┌────────────────────────────────────────────────────────┐
             │                     ⚡ LOCALDROP                        │
             │              AirDrop for EVERY Device                  │
             └──────────────────────────┬─────────────────────────────┘
                                        │
             ┌──────────────────────────┴─────────────────────────────┐
             │            Encrypted Direct WebRTC Stream              │
             │           (64KB Chunk Slices + Backpressure)           │
             └──────────┬─────────────────────────────────┬───────────┘
                        ▼                                 ▼
         ┌─────────────────────────────┐   ┌─────────────────────────────┐
         │ 💻 Windows / Mac / Linux    │   │ 📱 iPhone / iPad / Android  │
         │                             │   │                             │
         │  vacation_4k.mp4 (2.4 GB)   │   │  ⚡ 18.4 MB/s   ETA 00:19   │
         │  ████████████████░░░░  82%  │   │  ✓ Reassembling Blob        │
         └─────────────────────────────┘   └─────────────────────────────┘
```

---

## ⚡ The LocalDrop Experience

| Feature | ⚡ LocalDrop | 🍎 Apple AirDrop | 🤖 Quick Share | ☁️ WeTransfer / Drive |
|---|:---:|:---:|:---:|:---:|
| **Cross-Platform** (Win, Mac, iOS, Android, Linux) | ✅ **Any Device** | ❌ Apple Only | ❌ Android/Windows | ⚠️ Web only |
| **Direct P2P Transfer** | ✅ **WebRTC DTLS** | ✅ Wi-Fi Direct | ✅ Wi-Fi Direct | ❌ Cloud Uploads |
| **Zero Server Storage** | ✅ **Never Stored** | ✅ Never Stored | ✅ Never Stored | ❌ Permanently Stored |
| **No Account Required** | ✅ **1-Click Open** | ❌ Apple ID | ❌ Google/Samsung | ❌ Account / Email |
| **Multi-GB Large Files** | ✅ **Streaming Slices** | ⚠️ Can stall | ⚠️ Timeout prone | ❌ Upload Caps |
| **Terminal CLI Support** | ✅ `npx localdrop` | ❌ None | ❌ None | ❌ None |
| **Instant Camera QR Pairing** | ✅ **1 Second** | ❌ None | ❌ None | ❌ None |
| **Text & Clipboard Sharing** | ✅ **1-Click Copy** | ⚠️ Mac/iOS only | ⚠️ Restricted | ❌ Email/Chat |

---

## 🚀 Instant Quickstart

### Option 1: Run via NPX (Zero Setup)

Run from any terminal on your Mac, Windows PC, or Linux box:

```bash
npx localdrop
```

The CLI starts your local signaling server and renders an instant terminal QR code:

```text
╭──────────────────────────────────────────────────────────╮
│                                                          │
│                       ⚡ LocalDrop                       │
│                 AirDrop for EVERY device                 │
│                                                          │
╰──────────────────────────────────────────────────────────╯

✓ Local server running on port 8787

Local:   http://localhost:8787
Network: http://192.168.0.103:8787?room=localdrop-lan

Scan this QR code with your phone camera:
  █████████████████████████████████
  █ ▄▄▄▄▄ █▀▄█▀▄█ █ ▄▄▄▄▄ █  ▀▀▄█ █
  █ █   █ █ ▄ █▄▀██ █   █ █  █▄▀█ █
  █ █▄▄▄█ █▄█ █▀▀▀█ █▄▄▄█ █  ▀▄█▀ █
  █████████████████████████████████

Waiting for devices...
```

1. Point your phone camera at the terminal QR code.
2. Accept the pairing prompt.
3. Drag any file or paste text to transfer at full local network speeds!

---

### Option 2: Open the Web Application

Visit our production deployment directly from your phone and laptop:

🌐 **[https://localdropp.vercel.app](https://localdropp.vercel.app)**

Both devices will discover each other over WebRTC and begin transferring immediately.

---

### Option 3: Clone & Develop Locally

```bash
# Clone the repository
git clone https://github.com/Cathhdyy/LocalDrop.git
cd LocalDrop

# Install dependencies
npm install

# Run automated test suites (Protocol, Chunking, P2P Simulation, Signaling E2E)
npm test

# Build all packages & web application
npm run build

# Start LocalDrop
npm start
```

---

## ✨ Features

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3>🚀 Direct WebRTC Streaming</h3>
      <p>Transfers stream peer-to-peer via encrypted <code>RTCDataChannel</code> sockets at full network bandwidth. Bypasses the internet whenever devices are on the same Wi-Fi.</p>
    </td>
    <td width="50%" valign="top">
      <h3>🔒 Absolute Privacy Guarantee</h3>
      <p>Your files, photos, videos, and text never touch or sit on a central storage server. Signaling handles only initial SDP connection handshakes.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>📦 64KB Chunk Slicing & Backpressure</h3>
      <p>Multi-gigabyte files (4K videos, OS images, ZIP archives) are sliced into 64KB buffers with active <code>bufferedAmount</code> backpressure flow control to eliminate browser tab crashes.</p>
    </td>
    <td width="50%" valign="top">
      <h3>📱 1-Second Camera QR Pairing</h3>
      <p>Scan the on-screen QR code from your mobile camera to join the transfer room instantly. No Bluetooth pairing headaches or account sign-ins.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>💬 Text & Clipboard Sharing</h3>
      <p>Dedicated "Text" tab allows you to paste URLs, terminal commands, Wi-Fi passwords, or code snippets with one-click clipboard copying and toast alerts.</p>
    </td>
    <td width="50%" valign="top">
      <h3>🎛️ Developer Mode & Diagnostics</h3>
      <p>Built-in developer panel displaying live WebRTC ICE connection state, data channel throughput, RTT latency in milliseconds, and raw protocol event logs.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🎵 Tactile Audio Chimes</h3>
      <p>Zero-asset Web Audio API synthesizer generates gentle harmonic chimes upon device connection and celebratory chimes on transfer completion.</p>
    </td>
    <td width="50%" valign="top">
      <h3>🎨 Apple + Linear Design System</h3>
      <p>Deep rich dark mode backgrounds, ambient mesh glow, glassmorphic frosted cards, animated AirDrop radar scanner, and smooth progress shimmer beams.</p>
    </td>
  </tr>
</table>

---

## 🔒 Security Architecture

```
                 Device A (Sender)                   Device B (Receiver)
                        │                                    │
                        ├────── 1. Ephemeral Room Token ─────┤
                        │       (ws://<host>:8787/ws)        │
                        │                                    │
                        ├────── 2. Explicit User Consent ────┤
                        │       ("iPhone wants to connect")  │
                        │                                    │
                        ├────── 3. WebRTC DTLS Handshake ────┤
                        │       (AES-GCM / ChaCha20)         │
                        │                                    │
                        ├══════ 4. Encrypted P2P Chunks ════►│
                        │       (Direct RTCDataChannel)      │
                        │                                    │
                        │◄───── 5. SHA-256 Checksum Match ───┤
```

1. **Mandatory Encryption**: WebRTC mandates DTLS/SRTP encryption. Traffic is unreadable even over public airport or coffee-shop Wi-Fi.
2. **Explicit Consent**: Inbound connections require explicit acceptance (`📱 iPhone wants to connect: [ Accept ] [ Decline ]`).
3. **Directory Traversal Defense**: All filenames are sanitized to prevent malicious path traversal exploits (`../`, `..\`, special characters).
4. **Zero Cloud Residue**: Once transfer is complete, the file exists solely in the recipient's browser download sandbox.

---

## 🛠️ Monorepo Structure

```text
localdrop/
├── apps/
│   ├── web/            # Next.js 14 Web UI & PWA (React, Tailwind CSS, Lucide)
│   ├── signaling/      # WebSocket signaling server (ws, network detection)
│   └── cli/            # CLI binary (commander, chalk, boxen, qrcode-terminal)
├── packages/
│   ├── protocol/       # Shared TypeScript protocol types, constants, schemas
│   └── p2p/            # Chunking, backpressure, reassembly, crypto engine
├── tests/              # Vitest test suite (protocol, chunking, simulation, E2E)
├── docs/               # Architecture & security specifications
├── Dockerfile          # Full-stack container deployment
└── railway.json        # Railway deployment configuration
```

---

## 🧪 Verification & Test Suite

LocalDrop features an automated test suite verifying protocol compliance, chunking, and simulated P2P transfers:

```bash
npm test
```

```text
 ✓ tests/protocol.test.ts    (5 tests)  - Message schemas & path traversal sanitizer
 ✓ tests/chunker.test.ts     (3 tests)  - Binary chunk framing (0x4C444348) & SHA-256
 ✓ tests/simulation.test.ts  (1 test)   - Virtual Peer A ↔ Peer B 256KB chunk stream
 ✓ tests/server-e2e.test.ts  (1 test)   - WebSocket room discovery & signaling flow

 Test Files  4 passed (4)
      Tests  10 passed (10)
```

---

## 🌐 Production Deployments

| Component | Host | URL | Status |
|---|---|---|---|
| **Web Frontend** | **Vercel** | [https://localdropp.vercel.app](https://localdropp.vercel.app) | 🟢 **● Ready** |
| **Signaling Backend** | **Railway** | [https://localdrop-signaling-production.up.railway.app](https://localdrop-signaling-production.up.railway.app) | 🟢 **Live (`status: ok`)** |
| **WebSocket Stream** | **Railway** | `wss://localdrop-signaling-production.up.railway.app/ws` | 🟢 **Connected** |

---

## 📄 License & Permissions

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license.

| Permission | Allowed? | Description |
|---|:---:|---|
| 🏢 **Commercial Use** | ❌ **No** | You may not use this software for commercial advantage or monetary compensation. |
| 🛠️ **Modification** | ✅ **Yes** | You are free to remix, transform, and build upon the material. |
| 📦 **Distribution** | ✅ **Yes** | You may copy, share, and redistribute the material in any medium or format. |
| 🔒 **Private Use** | ✅ **Yes** | You are free to run, test, self-host, and use LocalDrop privately on your devices. |

See the complete terms in the [LICENSE](LICENSE) file.

---

<div align="center">
  <sub>Built with ❤️ by the LocalDrop Contributors • AirDrop for EVERY Device</sub>
</div>
