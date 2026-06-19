import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Local dev serves index.dev.html; the build copies it to index.html first.
function devHtmlEntry(): Plugin {
  return {
    name: 'dev-html-entry',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          req.url = '/index.dev.html';
        }
        next();
      });
    },
  };
}

export default defineConfig(({ command }) => ({
  base: '/',
  plugins: [react(), command === 'serve' ? devHtmlEntry() : undefined].filter(
    Boolean
  ) as Plugin[],
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  server: {
    port: 5173,
  },
}));
