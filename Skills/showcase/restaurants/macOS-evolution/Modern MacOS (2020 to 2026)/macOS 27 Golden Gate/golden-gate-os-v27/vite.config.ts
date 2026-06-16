import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const COOP_HEADERS = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
};

const emulatorHeadersPlugin = () => ({
  name: 'emulator-headers',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url?.startsWith('/emulatorjs/')) {
        res.setHeader('Cross-Origin-Opener-Policy', COOP_HEADERS['Cross-Origin-Opener-Policy']);
        res.setHeader('Cross-Origin-Embedder-Policy', COOP_HEADERS['Cross-Origin-Embedder-Policy']);
      }
      next();
    });
  },
  configurePreviewServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url?.startsWith('/emulatorjs/')) {
        res.setHeader('Cross-Origin-Opener-Policy', COOP_HEADERS['Cross-Origin-Opener-Policy']);
        res.setHeader('Cross-Origin-Embedder-Policy', COOP_HEADERS['Cross-Origin-Embedder-Policy']);
      }
      next();
    });
  },
});

const cacheAssetsPlugin = () => ({
  name: 'cache-assets',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url?.startsWith('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      next();
    });
  },
});

export default defineConfig({
  server: {
    headers: COOP_HEADERS,
  },
  plugins: [react(), tailwindcss(), emulatorHeadersPlugin(), cacheAssetsPlugin()],
});
