# 🔒 LocalDrop Security Model

Security and privacy are core architectural tenets of LocalDrop.

---

## 1. Zero Cloud Storage Guarantee

- **Ephemeral Signaling**: The signaling server only handles initial WebRTC handshakes (SDP and ICE candidates).
- **No Payload Storage**: Files, photos, videos, and shared text never transit or touch the signaling server. They stream directly peer-to-peer between client browsers.
- **No Database**: No accounts, passwords, or personal logs exist.

---

## 2. End-to-End Encryption

- **WebRTC DTLS/SRTP**: All `RTCDataChannel` traffic is encrypted by default with Datagram Transport Layer Security (DTLS).
- **Ciphers**: Modern WebRTC implementations require AES-GCM or ChaCha20-Poly1305 ciphers.
- **Interception Resistance**: Even on open or public Wi-Fi networks, third parties cannot eavesdrop on or modify file contents in transit.

---

## 3. Explicit Device Authorization

- **No Open Inbound Access**: Devices do not automatically accept incoming connections.
- **Pairing Approval**: When a new device requests a connection, the target device displays an explicit prompt:
  ```text
  📱 iPhone wants to connect.
  [ Accept ]   [ Decline ]
  ```
- Only upon explicit acceptance are WebRTC channels negotiated.

---

## 4. File System & Input Sanitization

- **Path Traversal Protection**: Filenames sent over the data channel are sanitized against path traversal attacks (`../`, `..\`, absolute paths, control characters).
- **Safe Downloads**: Received files are passed to standard browser sandboxed download APIs, preventing arbitrary disk execution.
- **Memory Boundaries**: Backpressure rate-limits prevent buffer exhaustion or denial-of-service memory pressure.
