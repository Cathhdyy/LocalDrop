# ⚡ LocalDrop Architecture

LocalDrop is designed as a decentralized, privacy-first peer-to-peer file and data sharing system. It replaces cumbersome cloud uploads, cables, and proprietary walled gardens (such as Apple-only AirDrop or Android QuickShare) with an open web-standards stack.

```
                          ┌─────────────────────────┐
                          │   WebSocket Signaling   │
                          │      Server (:8787)     │
                          └───────────┬─────────────┘
                                      │ (Offer / Answer / ICE)
                      ┌───────────────┴───────────────┐
                      ▼                               ▼
          ┌───────────────────────┐       ┌───────────────────────┐
          │   Device A (e.g. PC)  │       │ Device B (e.g. Phone) │
          │  http://192.168.1.5   │       │  Scanned QR Code URL  │
          └───────────┬───────────┘       └───────────┬───────────┘
                      │                               │
                      │    WebRTC RTCDataChannel      │
                      │◄─────────────────────────────►│
                      │  Encrypted Direct P2P Stream  │
                      │  - Chunked 64KB Slices        │
                      │  - Backpressure Watermarks    │
                      │  - SHA-256 Checksum           │
                      │  - Zero Server Storage        │
```

---

## 1. Networking Layers

### Phase A: Discovery & Pairing
1. **Host Setup**: Device A starts LocalDrop (`npx localdrop`), detecting the local IPv4 address (e.g., `192.168.1.42:8787`).
2. **QR Code**: A connection URL containing the room ID is rendered in both the terminal and Web UI.
3. **Join Request**: Device B scans the QR code and connects via WebSocket to `ws://<host>:8787/ws`.
4. **Explicit Authorization**: Device A receives an incoming pairing prompt ("📱 iPhone wants to connect: [Accept] [Decline]"). When accepted, signaling is unlocked.

### Phase B: WebRTC Session Negotiation
1. Once paired, Device A creates an `RTCPeerConnection` with STUN servers (`stun.l.google.com:19302`) and calls `createOffer()`.
2. The offer is relayed via WebSocket to Device B.
3. Device B applies the offer, calls `createAnswer()`, and relays it back.
4. Trickle ICE candidates are exchanged until a direct peer candidate pair (preferably `host` candidate on the local LAN) is selected.

### Phase C: Encrypted P2P DataChannel
1. An ordered `RTCDataChannel` named `localdrop-transfer` is opened with `binaryType = 'arraybuffer'`.
2. All subsequent file chunks and control messages stream directly over this channel with DTLS/SRTP encryption.
3. The WebSocket signaling server carries 0 bytes of payload data.

---

## 2. Large File Streaming & Memory Safety

Transferring multi-gigabyte files (such as 4K videos or operating system images) in a browser requires strict memory boundaries:

- **Chunking**: Files are never loaded wholly into RAM. Instead, `File.slice(start, end)` is used to read individual 64 KB slices on demand via `FileReader.readAsArrayBuffer()`.
- **Binary Frame Format**:
  - Bytes 0–3: Magic header (`0x4C444348` -> `"LDCH"`)
  - Bytes 4–19: Transfer ID (16 bytes)
  - Bytes 20–23: Chunk index (`Uint32`)
  - Bytes 24–27: Total chunks (`Uint32`)
  - Bytes 28+: Raw slice payload
- **Backpressure Control**:
  - `RTCDataChannel.bufferedAmount` is continuously monitored.
  - If `bufferedAmount > 1 MB` (High Water Mark), the chunker halts reading and waits for `bufferedamountlow` (Low Water Mark = 256 KB).
  - This guarantees steady, maximum throughput without browser tab memory overflow or crash.
- **Integrity**: Pre-computed and verified using SHA-256 digests.
