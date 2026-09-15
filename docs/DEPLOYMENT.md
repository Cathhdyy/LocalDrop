# 🚀 LocalDrop Deployment Guide

You can run and host LocalDrop in multiple ways depending on your needs.

---

## 1. Hosting on Vercel

### Can I host LocalDrop on Vercel?
**Yes, with one important consideration:**
- **Frontend (`apps/web`)**: 100% compatible with Vercel. Deploys seamlessly as a Next.js application.
- **Signaling Server (`apps/signaling`)**: WebRTC requires a stateful, persistent **WebSocket connection (`ws://` / `wss://`)** for exchanging device offers/answers. Vercel is a serverless platform (stateless lambdas with execution timeouts), so persistent WebSockets cannot run directly on Vercel serverless functions.

### How to Deploy on Vercel:

#### Step 1: Deploy the Signaling Server (Free on Railway / Render / Fly.io)
Deploy `apps/signaling` to any service that supports long-lived Node.js WebSockets:
- **Railway**: Click *New Project* -> *Deploy from GitHub repo* -> Root directory: `apps/signaling` (or Dockerfile).
- **Render**: Create a *Web Service* -> Build command: `npm install && npm run build` -> Start command: `npm start`.
- **Fly.io**: Run `fly launch` in `apps/signaling`.

Once deployed, copy your WebSocket URL (e.g. `wss://localdrop-signaling.up.railway.app`).

#### Step 2: Deploy the Web App to Vercel
1. Import your repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `.` (monorepo root).
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `apps/web/out` (or standard Next.js build)
5. Add Environment Variable:
   ```env
   NEXT_PUBLIC_SIGNALING_URL=wss://localdrop-signaling.up.railway.app
   ```
6. Click **Deploy**!

Your frontend is now live on Vercel, securely communicating with your signaling server, while all file transfers remain **100% direct peer-to-peer (WebRTC)**!

---

## 2. All-in-One Deployment (Railway, Render, Fly.io, or VPS)

If you prefer a single service running both the Web App and the Signaling Server together on port `8787`:

### Using Docker:

Create a container from the root:

```bash
docker build -t localdrop .
docker run -p 8787:8787 localdrop
```

### Dockerfile:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787
COPY --from=builder /app .
EXPOSE 8787
CMD ["node", "apps/cli/bin/localdrop.js"]
```

---

## 3. Local / Self-Hosted (No Cloud)

Simply run:

```bash
npx localdrop
```

No accounts, no cloud setup, completely offline on your local network.
