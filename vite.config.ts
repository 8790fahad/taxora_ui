import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` controls the public path the app is served from.
//   - Local dev / custom domain / user page:  "/"  (default)
//   - GitHub project page (user.github.io/repo): "/repo/"
// The deploy workflow injects VITE_BASE automatically from the repo name.
const base = process.env.VITE_BASE || '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
  },
});
