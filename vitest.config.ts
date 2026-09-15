import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@localdrop/protocol': path.resolve(__dirname, './packages/protocol/src/index.ts'),
      '@localdrop/p2p': path.resolve(__dirname, './packages/p2p/src/index.ts'),
      '@localdrop/signaling': path.resolve(__dirname, './apps/signaling/src/index.ts'),
    },
  },
});
