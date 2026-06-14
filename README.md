# Taxora UI

React + Vite frontend for Taxora — Nigerian e-invoicing compliance.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API defaults to `http://localhost:4000` (`VITE_API_URL`).

## GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys the SPA to **GitHub Pages** on every push to `main`.

### One-time setup

1. **Create a GitHub repository** for this frontend (e.g. `taxora-ui`) and push this folder as the repo root.
2. In the repo on GitHub: **Settings → Pages → Build and deployment**
   - Source: **GitHub Actions**
3. *(Optional)* **Settings → Secrets and variables → Actions → Variables**
   - Add `API_URL` = your public Taxora API base URL (e.g. `https://api.taxora.app`)
   - If unset, the built app falls back to `http://localhost:4000` (fine for a static demo).

### Deploy

Push to `main` (or run **Actions → Deploy frontend to GitHub Pages → Run workflow**).

Your site will be published at:

| Repo type | URL |
|---|---|
| Project page | `https://<user>.github.io/<repo>/` |
| User/org page (`<user>.github.io` repo) | `https://<user>.github.io/` |
| Custom domain | Your configured domain |

The workflow sets `VITE_BASE` automatically so assets and client-side routes work under the correct subpath.

### SPA routing

GitHub Pages does not rewrite unknown paths to `index.html`. This project ships:

- `public/404.html` — redirects deep links back into the app
- A small restore script in `index.html` — lets React Router recover the intended route

### Manual build (same as CI)

```bash
# Project page example (replace taxora-ui with your repo name)
VITE_BASE=/taxora-ui/ VITE_API_URL=https://api.example.com npm run build
npx vite preview
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build locally |
# taxora_ui
