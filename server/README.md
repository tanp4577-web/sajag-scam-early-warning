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

## Real neural voice (Hindi, Marathi, English)

By default, voice alerts play with the viewer's browser's own text-to-speech, which
sounds robotic and often has no Hindi/Marathi voice installed at all. To use a real,
natural-sounding voice instead:

1. Sign up free at [sarvam.ai](https://sarvam.ai) (built specifically for Indian
   languages) and get an API key from their dashboard.
2. On Render, add an environment variable `SARVAM_API_KEY` with that key.
3. Optionally set `SARVAM_SPEAKER` to a voice name from their dashboard (default: `meera`).
4. Redeploy. The demo's "Play voice" button will now use this automatically — if the
   key isn't set, or the call fails, it quietly falls back to the browser's own voice.

Check Sarvam's current docs for valid speaker names and pricing before relying on
this for anything beyond a demo — voice names and free-tier limits can change.
