// Sajag Network backend. Stores reports/alerts in a local JSON file (data.json).
// Good enough for a pilot; swap the DB layer for Postgres/Supabase later.
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "data.json");
const OUTBREAK_THRESHOLD = 3; // reports needed before a moderator sees a flag

function loadDB() {
  if (!fs.existsSync(DB_PATH)) return { reports: [], alerts: [] };
  try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); }
  catch { return { reports: [], alerts: [] }; }
}
function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

const TYPES = ["otp", "police", "prize", "apk", "elec", "job"];
const VILLAGES = ["Shivapur", "Ambegaon", "Wadgaon", "Kasarwadi"];

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Reference data for form dropdowns
app.get("/api/meta", (_req, res) => res.json({ types: TYPES, villages: VILLAGES }));

// Submit a report (from web form, or later: WhatsApp/SMS/IVR webhook)
app.post("/api/reports", (req, res) => {
  const { village, type, note, channel } = req.body || {};
  if (!village || !TYPES.includes(type)) {
    return res.status(400).json({ error: "village and a valid type are required" });
  }
  const db = loadDB();
  const report = {
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    village, type, note: (note || "").slice(0, 500),
    channel: channel || "web",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  db.reports.push(report);
  saveDB(db);
  res.status(201).json(report);
});

// List reports grouped by village+type, for the moderator dashboard
app.get("/api/reports", (_req, res) => {
  const db = loadDB();
  const pending = db.reports.filter(r => r.status === "pending");
  const groups = {};
  for (const r of pending) {
    const key = r.village + "|" + r.type;
    groups[key] = groups[key] || { village: r.village, type: r.type, count: 0, ids: [] };
    groups[key].count++;
    groups[key].ids.push(r.id);
  }
  const list = Object.values(groups).map(g => ({ ...g, outbreak: g.count >= OUTBREAK_THRESHOLD }));
  res.json({ groups: list, total: pending.length });
});

// Moderator confirms a group -> creates one alert, marks reports resolved
app.post("/api/reports/confirm", (req, res) => {
  const { village, type } = req.body || {};
  const db = loadDB();
  let count = 0;
  db.reports.forEach(r => {
    if (r.status === "pending" && r.village === village && r.type === type) { r.status = "confirmed"; count++; }
  });
  if (count === 0) return res.status(404).json({ error: "no matching pending reports" });
  const alert = { id: Date.now() + "-a", village, type, reportCount: count, createdAt: new Date().toISOString() };
  db.alerts.unshift(alert);
  saveDB(db);
  res.status(201).json(alert);
});

// Moderator rejects a group -> discards reports, no alert
app.post("/api/reports/reject", (req, res) => {
  const { village, type } = req.body || {};
  const db = loadDB();
  let count = 0;
  db.reports.forEach(r => {
    if (r.status === "pending" && r.village === village && r.type === type) { r.status = "rejected"; count++; }
  });
  saveDB(db);
  res.json({ rejected: count });
});

// Public feed of confirmed alerts, for the alerts screen / SMS-voice worker to poll
app.get("/api/alerts", (_req, res) => {
  const db = loadDB();
  res.json(db.alerts.slice(0, 100));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Sajag server running on port " + PORT));
