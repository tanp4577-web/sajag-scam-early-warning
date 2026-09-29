// Sajag Network backend. No dependencies. Run: MOD_PIN=1234 node server/server.js
const http = require("http"), fs = require("fs"), path = require("path");
const PORT = process.env.PORT || 3000;
const PIN = process.env.MOD_PIN || "";                 // moderator PIN (set it!)
const FILE = process.env.DATA_FILE || path.join(__dirname, "data.json");
const VILLAGES = ["Shivapur", "Ambegaon", "Wadgaon", "Kasarwadi"];
const TYPES = ["otp", "police", "prize", "apk", "elec", "job"];
const CHANNELS = ["web", "whatsapp", "sms", "call", "helper"];
let D = { reports: [], alerts: [] };
try { D = JSON.parse(fs.readFileSync(FILE, "utf8")); } catch (e) {}
const save = () => fs.writeFileSync(FILE, JSON.stringify(D));
const hits = {};                                        // simple rate limit: 30 reports / 10 min / IP
const limited = ip => { const n = Date.now(); hits[ip] = (hits[ip] || []).filter(t => n - t < 6e5); hits[ip].push(n); return hits[ip].length > 30; };
const send = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,x-mod-pin" }); res.end(JSON.stringify(obj)); };
const body = req => new Promise((ok, no) => { let s = ""; req.on("data", c => { s += c; if (s.length > 10000) { no(new Error("big")); req.destroy(); } }); req.on("end", () => { try { ok(JSON.parse(s || "{}")); } catch (e) { no(e); } }); });
const MIME = { ".html": "text/html; charset=utf-8", ".pdf": "application/pdf" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "OPTIONS") return send(res, 204, {});
  try {
    if (url.pathname === "/api/health") return send(res, 200, { ok: true });
    if (url.pathname === "/api/state" && req.method === "GET") return send(res, 200, D);
    if (url.pathname === "/api/reports" && req.method === "POST") {
      if (limited(req.socket.remoteAddress)) return send(res, 429, { error: "Too many reports. Try later." });
      const b = await body(req);
      if (!VILLAGES.includes(b.v) || !TYPES.includes(b.t)) return send(res, 400, { error: "Invalid village or type" });
      D.reports.push({ v: b.v, t: b.t, n: String(b.n || "").slice(0, 200), c: CHANNELS.includes(b.c) ? b.c : "web", s: "p", at: Date.now() });
      save(); return send(res, 201, { ok: true });
    }
    if (url.pathname === "/api/moderate" && req.method === "POST") {
      if (!PIN || req.headers["x-mod-pin"] !== PIN) return send(res, 401, { error: "Wrong or missing moderator PIN" });
      const b = await body(req); let n = 0;
      if (!VILLAGES.includes(b.v) || !TYPES.includes(b.t) || !["c", "x"].includes(b.a)) return send(res, 400, { error: "Invalid input" });
      D.reports.forEach(r => { if (r.s === "p" && r.v === b.v && r.t === b.t) { r.s = b.a; n++; } });
      if (b.a === "c" && n) D.alerts.unshift({ v: b.v, t: b.t, n, at: Date.now() });
      save(); return send(res, 200, { ok: true, count: n });
    }
    // serve the demo page and docs
    const f = url.pathname === "/" ? "/demo/index.html" : url.pathname;
    const p = path.normalize(path.join(__dirname, "..", f));
    if (!p.startsWith(path.join(__dirname, "..")) || !/^\/(demo|checker|docs)\//.test(f)) return send(res, 404, { error: "Not found" });
    fs.readFile(p, (e, d) => e ? send(res, 404, { error: "Not found" }) : (res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "text/plain" }), res.end(d)));
  } catch (e) { send(res, 400, { error: "Bad request" }); }
}).listen(PORT, () => console.log("Sajag server on http://localhost:" + PORT + (PIN ? "" : "  (WARNING: MOD_PIN not set, moderation disabled)")));
