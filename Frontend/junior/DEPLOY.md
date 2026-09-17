# Deploying UniAssist

UniAssist is a TanStack Start SSR app built for **Cloudflare Workers + Pages**.  
The build output lives in `.output/` — a Cloudflare Workers bundle (`server/`) + static assets (`public/`).

---

## Option 1 — Cloudflare Pages (recommended, free)

### First deploy

1. **Install Wrangler** (already in devDependencies):
   ```bash
   npm install
   ```

2. **Login to Cloudflare:**
   ```bash
   npx wrangler login
   ```
   This opens a browser tab — log in or create a free Cloudflare account.

3. **Build + deploy:**
   ```bash
   npm run build
   npx wrangler pages deploy .output/public --project-name uniassist
   ```
   On first run Wrangler asks to create the project — confirm and it will deploy.

4. Your site is live at:
   ```
   https://uniassist.pages.dev
   ```

### Subsequent deploys
```bash
npm run build
npx wrangler pages deploy .output/public --project-name uniassist
```

### Custom domain
In the Cloudflare dashboard → Pages → uniassist → Custom domains → add your domain.

---

## Option 2 — Cloudflare Workers (full SSR, free tier)

```bash
npm run build
npx wrangler deploy --config wrangler.toml
```

This deploys as a Worker with the SSR server running at the edge.  
Live at: `https://uniassist.<your-subdomain>.workers.dev`

---

## Option 3 — GitHub → Cloudflare Pages (CI/CD, recommended for teams)

1. Push the repo to GitHub.
2. Go to [Cloudflare Pages](https://pages.cloudflare.com) → Create a project → Connect to Git.
3. Set build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `.output/public`
   - **Node version:** `20`
4. Save — every push to `main` auto-deploys.

---

## Environment variables

If you add a `.env` file locally, mirror those vars in:
- Cloudflare Pages: Dashboard → Settings → Environment variables
- Cloudflare Workers: `wrangler secret put VAR_NAME`

---

## Build output structure

```
.output/
  public/        ← Static assets (served by Cloudflare CDN)
    assets/      ← Hashed JS/CSS chunks
    favicon.png
    ...
  server/        ← Worker SSR bundle
    index.mjs    ← Entry point
    wrangler.json
```
