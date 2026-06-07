import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const cacheAssetsPlugin = () => {
  return {
    name: 'cache-assets',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        next();
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), tailwindcss(), cacheAssetsPlugin()],
});
