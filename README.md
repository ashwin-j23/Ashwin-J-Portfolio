# Ashwin J — Portfolio

Personal portfolio: DevOps · SecOps · Pentesting · AWS · Node.js backend.
Plain HTML / CSS / JavaScript — no framework, no build step.

## What's inside

| Path | What it is |
|---|---|
| `index.html`, `style.css`, `script.js` | The portfolio (animations, role-fit scanner, mail chooser, live GitHub repos) |
| `resume.html`, `resume.js` | Printable resume — "Download PDF" opens the print dialog (choose *Save as PDF*) |
| `demos/` | HTML + CSS demos of each project (sample data only, no keys) |
| `assets/` | Favicon, real project logos, brand icons (Simple Icons, CC0) |
| `404.html` | Not-found page |
| `vercel.json`, `_headers` | Security headers (CSP, HSTS, nosniff, frame-deny, referrer, permissions) |
| `.well-known/security.txt` | How to report a security issue |
| `scripts/check-site.mjs` | Site checks: broken links/anchors, alt text, CSP-safe markup |
| `.github/workflows/ci.yml` | CI on every push + deploy to GitHub Pages from `main` |

## Run locally
```bash
python3 -m http.server 5500   # then open http://localhost:5500
node scripts/check-site.mjs . # run the same checks as CI
```

## Deploy

**GitHub Pages (CI included)**
1. Push this folder to a GitHub repo on the `main` branch.
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. Every push runs the checks, then deploys. Note: GitHub Pages cannot send custom headers, so `vercel.json` / `_headers` are not applied there.

**Vercel / Netlify / Cloudflare Pages (security headers applied)**
Import the repo; no build command, output directory = root. Headers come from `vercel.json` (Vercel) or `_headers` (Netlify / Cloudflare). Check the result at https://securityheaders.com.

## Updating
- Text lives in `index.html`; colours are CSS variables at the top of `style.css`.
- After editing CSS/JS, bump the `?v=` number on the `<link>`/`<script>` tags so browsers load the new files.
- Role-fit scanner skills, evidence and gaps live in `script.js` (`SKILLS`, `GAPS`, `TITLES`). When you learn something new, move it from `GAPS` to `SKILLS`.
- `security.txt` has an `Expires` date — renew it before 2027-11-07.
