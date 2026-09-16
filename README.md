# HireHub

HireHub is a browser-only employee onboarding interest portal. Candidates can read the company story and submit a validated interest record; a single demo administrator can review, edit, and delete records stored in that browser.

## Stack

- React 18 + Vite
- JavaScript/JSX and React Router v6
- Plain CSS (`frontend/src/App.css`)
- `localStorage` for submissions and `sessionStorage` for the demo admin gate
- Vitest, Testing Library, and Playwright

There is deliberately no backend, database, API, or real authentication.

## Run locally

```bash
cd frontend
npm install --no-bin-links
node node_modules/vite/bin/vite.js
```

Open the address Vite prints (normally `http://localhost:5173`).

## Demo administrator

- Username: `admin`
- Password: `admin`

These static credentials are intentionally part of the PRD-defined demo gate and must not be used for a production system.

## Tests

```bash
cd frontend
node node_modules/vitest/vitest.mjs run
node node_modules/@playwright/test/cli.js test
```

## Production build

```bash
cd frontend
node node_modules/vite/bin/vite.js build
```

The output is `frontend/dist/`. `vercel.json` supplies the required SPA routing rewrite. The included `frontend/Dockerfile` builds the bundle and serves it through nginx with an SPA fallback.

## Browser data boundary

Submissions are stored under `hirehub_submissions` in the browser's localStorage. They persist across reloads in that browser only. Clearing browser site data clears submissions. Admin session state is session-scoped under `hirehub_admin_auth`.

## License

Private and proprietary. All rights reserved.
