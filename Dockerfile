FROM node:20-alpine AS builder

WORKDIR /app

# Copy repository
COPY . .

# Install dependencies and build all packages
RUN npm install
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787

COPY --from=builder /app /app

EXPOSE 8787

CMD ["node", "apps/cli/bin/localdrop.js"]
