import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom domain (taxora.com.ng) serves from the site root — assets and routes
// must use "/" or GitHub Pages returns HTML for JS/CSS (MIME type errors).
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
});
