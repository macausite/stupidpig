import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 3005,
    strictPort: true,
    open: false
  },
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500
  }
});
