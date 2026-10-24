# Toolmingle Play — casual web games MVP

A TypeScript + Vite multi-page static site based on the v1.2 design plan. The MVP contains the Toolmingle Play hub, **Zapdash** (30-second reaction game), **Prismerge** (7×7 tile merge puzzle), About, Privacy and Contact pages.

## Requirements
- Node.js 20+ recommended
- npm

## Local development (Windows PowerShell)
```powershell
Copy-Item .env.beta.example .env.beta
# Open .env.beta and replace SITE_URL with your actual beta URL
npm install
npm run dev
```
Open the Vite URL printed in the terminal. Routes are `/`, `/zapdash/`, `/prismerge/`, `/about/`, `/privacy/`, and `/contact/`.

## Test and build
```bash
npm test
npm run build
npm run preview
```
The default build is beta/noindex. Before building, copy `.env.beta.example` to `.env.beta` and set the actual beta `SITE_URL`. For production, copy `.env.production.example` to `.env.production`, set the real custom domain, and run `npm run build:production`.

The build generates `robots.txt`, `sitemap.xml`, and `_headers` in `dist/`. Beta intentionally uses `noindex`. Verify the actual response headers and HTML after deployment.

## Cloudflare Workers Static Assets
`wrangler.jsonc` points to `dist/`. After a successful build and account login:
```bash
npm run deploy:beta
```
Do not deploy until the repository builds and the Cloudflare project/account/domain are confirmed. Production deployment uses `npm run deploy:production` only after custom domain and privacy/contact details are finalized.

## Known MVP limits
- Accuracy formula: `valid taps / (valid taps + early taps + misses)`; confirm this product interpretation during play testing.
- Prismerge wave/charge mechanics are not enabled; wave mode is visual only.
- Local scores and an in-progress Prismerge game are browser-origin scoped. There is no cross-device sync or export/import.
- Privacy and contact pages are starter copy. Add real operator contact details and review legal requirements before public launch.
- AdSense is disabled.
- Zapdash and Prismerge are working names; trademark/domain availability has not been verified.

## Verification status
The source package was inspected and engine smoke checks were run in the authoring environment. Full `npm install`, Vitest, and Vite build could not be completed there because npm registry DNS resolution failed (`EAI_AGAIN`). Run the commands above locally and resolve any reported errors before Cloudflare setup.
