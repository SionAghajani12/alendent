/* ============================================================
   Alendent — self-hosted backend
   Zero external dependencies. Uses Node 24 built-ins:
     node:http     -> web server + REST API
     node:sqlite   -> real SQLite database (alendent.db)
     node:fs       -> static files + image uploads
   Run:  node server.js     then open  http://localhost:3000
   ============================================================ */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

const ROOT = __dirname;
const UPLOAD_DIR = path.join(ROOT, "uploads");
const DB_PATH = path.join(ROOT, "alendent.db");
const PORT = process.env.PORT || 3000;

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* ---------- Database ---------- */
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data TEXT NOT NULL, ord INTEGER);
  CREATE TABLE IF NOT EXISTS brands   (name TEXT PRIMARY KEY, data TEXT NOT NULL, ord INTEGER);
`);

/* Seed once from data.js (which assigns to a window.* shim) */
function seed() {
  const haveProducts = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
  const haveBrands = db.prepare("SELECT COUNT(*) AS n FROM brands").get().n;
  if (haveProducts && haveBrands) return;

  global.window = global.window || {};
  try { require("./data.js"); } catch (e) { console.warn("Could not load data.js seed:", e.message); }

  if (!haveProducts && Array.isArray(global.window.PRODUCTS)) {
    const ins = db.prepare("INSERT OR IGNORE INTO products (id, data, ord) VALUES (?, ?, ?)");
    global.window.PRODUCTS.forEach((p, i) => ins.run(p.id, JSON.stringify(p), i));
    console.log(`Seeded ${global.window.PRODUCTS.length} products`);
  }
  if (!haveBrands && Array.isArray(global.window.VENDORS)) {
    const ins = db.prepare("INSERT OR IGNORE INTO brands (name, data, ord) VALUES (?, ?, ?)");
    global.window.VENDORS.forEach((name, i) =>
      ins.run(name, JSON.stringify({ name, country: "", logo: "" }), i)
    );
    console.log(`Seeded ${global.window.VENDORS.length} brands`);
  }
}
seed();

/* ---------- DB helpers ---------- */
const listProducts = () =>
  db.prepare("SELECT data FROM products ORDER BY ord ASC").all().map(r => JSON.parse(r.data));
const nextProductOrd = () =>
  (db.prepare("SELECT COALESCE(MAX(ord), -1) AS m FROM products").get().m) + 1;
const upsertProduct = (p) => {
  const existing = db.prepare("SELECT ord FROM products WHERE id = ?").get(p.id);
  const ord = existing ? existing.ord : nextProductOrd();
  db.prepare("INSERT OR REPLACE INTO products (id, data, ord) VALUES (?, ?, ?)")
    .run(p.id, JSON.stringify(p), ord);
  return p;
};
const deleteProduct = (id) => db.prepare("DELETE FROM products WHERE id = ?").run(id);

const listBrands = () =>
  db.prepare("SELECT data FROM brands ORDER BY ord ASC").all().map(r => JSON.parse(r.data));
const nextBrandOrd = () =>
  (db.prepare("SELECT COALESCE(MAX(ord), -1) AS m FROM brands").get().m) + 1;
const upsertBrand = (b) => {
  const existing = db.prepare("SELECT ord FROM brands WHERE name = ?").get(b.name);
  const ord = existing ? existing.ord : nextBrandOrd();
  db.prepare("INSERT OR REPLACE INTO brands (name, data, ord) VALUES (?, ?, ?)")
    .run(b.name, JSON.stringify(b), ord);
  return b;
};
const deleteBrand = (name) => db.prepare("DELETE FROM brands WHERE name = ?").run(name);

/* ---------- HTTP helpers ---------- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".jsx": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpeg": "image/jpeg", ".jpg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => {
      data += c;
      if (data.length > 25 * 1024 * 1024) { reject(new Error("payload too large")); req.destroy(); }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

/* Save a base64 data-URL image to /uploads, return public path */
function saveDataUrlImage(dataUrl) {
  const m = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/s.exec(dataUrl || "");
  if (!m) throw new Error("invalid image data");
  const ext = ({ "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp",
                 "image/gif": ".gif", "image/svg+xml": ".svg" })[m[1]] || ".img";
  const name = crypto.randomBytes(8).toString("hex") + Date.now().toString(36) + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(m[2], "base64"));
  return "/uploads/" + name;
}

/* ---------- API ---------- */
async function handleApi(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean); // ["api", "products", ":id"]
  const resource = parts[1];
  const id = parts[2] ? decodeURIComponent(parts[2]) : null;

  try {
    if (resource === "products") {
      if (req.method === "GET") return sendJSON(res, 200, listProducts());
      if (req.method === "POST") {
        const p = JSON.parse(await readBody(req));
        if (!p || !p.id) return sendJSON(res, 400, { error: "product.id required" });
        return sendJSON(res, 200, upsertProduct(p));
      }
      if (req.method === "PUT" && id) {
        const p = JSON.parse(await readBody(req));
        return sendJSON(res, 200, upsertProduct({ ...p, id }));
      }
      if (req.method === "DELETE" && id) {
        deleteProduct(id);
        return sendJSON(res, 200, { ok: true });
      }
    }

    if (resource === "brands") {
      if (req.method === "GET") return sendJSON(res, 200, listBrands());
      if (req.method === "POST") {
        const b = JSON.parse(await readBody(req));
        if (!b || !b.name) return sendJSON(res, 400, { error: "brand.name required" });
        return sendJSON(res, 200, upsertBrand(b));
      }
      if (req.method === "DELETE" && id) {
        deleteBrand(id);
        return sendJSON(res, 200, { ok: true });
      }
    }

    if (resource === "upload" && req.method === "POST") {
      const { dataUrl } = JSON.parse(await readBody(req));
      return sendJSON(res, 200, { url: saveDataUrlImage(dataUrl) });
    }

    return sendJSON(res, 404, { error: "not found" });
  } catch (err) {
    return sendJSON(res, 500, { error: err.message });
  }
}

/* ---------- Static files ---------- */
function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/Alendent Website.html";
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); return res.end("Not found"); }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ---------- Server ---------- */
http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) return handleApi(req, res, url);
  serveStatic(req, res, url);
}).listen(PORT, () => {
  console.log(`\n  Alendent running →  http://localhost:${PORT}`);
  console.log(`  Admin panel      →  http://localhost:${PORT}/#admin`);
  console.log(`  Database file    →  ${DB_PATH}\n`);
});
