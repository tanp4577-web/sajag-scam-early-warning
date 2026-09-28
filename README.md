# Sajag (सजग): Village-Level Scam Early-Warning System

Seva First Innovation Challenge 2026 | Surakshit Bharat | Track A

When a scam is reported in one village, a local moderator confirms it and nearby people get a short voice or SMS alert in Marathi or Hindi, on smartphones and keypad phones, before it spreads.

## What is in this repo

| Folder | What it is | Status |
|---|---|---|
| `checker/` | Message scam checker (English, Hindi, Marathi), runs on the phone, no data sent out | Working prototype |
| `demo/` | Report form, moderator screen and alert page with outbreak detection (3 similar reports in a village) | Working demo, data stored in the browser only |
| `docs/` | Pitch document (PDF) | Done |

## Run it

Open `checker/index.html` or `demo/index.html` in a browser. No install needed.

## Planned

WhatsApp reporting with voice replies, SMS alerts, phone-call (IVR) reporting for keypad phones, a real backend and database, and a pilot in one village.

## Notes

- Alerts are always confirmed by a human moderator before they go out.
- The checker never says "safe", only "no obvious signs, stay careful".
- Do not commit API keys. Use `.env` (see `.env.example`).

Author: Tanmay Pondhe, VIT Vellore. License: MIT.
