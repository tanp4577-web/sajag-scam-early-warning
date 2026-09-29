# Sajag Network — Server

A small backend so reports and alerts are shared across every device, not just one browser.

## Endpoints
- `GET /api/health` — check it's running
- `GET /api/meta` — village and scam-type lists for the report form
- `POST /api/reports` — submit a report `{ village, type, note?, channel? }`
- `GET /api/reports` — grouped pending reports for the moderator screen (flags `outbreak: true` at 3+ similar reports)
- `POST /api/reports/confirm` — `{ village, type }` → creates an alert, resolves those reports
- `POST /api/reports/reject` — `{ village, type }` → discards those reports
- `GET /api/alerts` — confirmed alerts, newest first

## Run locally
```
cd server
npm install
npm start
```
Server runs on `http://localhost:3000`.

## Deploy for free (so it has a public URL)
1. Push this repo to GitHub (already done).
2. Go to [render.com](https://render.com), sign in with GitHub, choose **New Web Service**.
3. Pick this repo, set **Root Directory** to `server`, **Build Command** to `npm install`, **Start Command** to `npm start`.
4. Deploy. Render gives a URL like `https://sajag-server.onrender.com`.
5. In `demo/index.html`, set `API_BASE` (top of the `<script>`) to that URL.

Free tier sleeps after inactivity, so the first request after a pause is slow — fine for a pilot demo, not for production.

## Data storage
Currently a single `data.json` file — enough for a pilot. Before a real launch, replace `loadDB`/`saveDB` with a real database (Postgres, Supabase, etc.), since a JSON file will not survive redeploys on most free hosts.
