/* ============================================================
   Alendent — production backend
   Node 22+ built-ins only (no npm packages)
   Env vars: PORT, ADMIN_PASSWORD, SESSION_SECRET
   Run: node server.js
   ============================================================ */

const http   = require("node:http");
const fs     = require("node:fs");
const path   = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

/* ---------- Load .env ---------- */
(function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) process.env[key] = val;
  }
})();

const PORT           = parseInt(process.env.PORT || "3000", 10);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const NODE_ENV       = process.env.NODE_ENV || "development";

if (!ADMIN_PASSWORD) {
  console.error("FATAL: ADMIN_PASSWORD is not set in .env — admin login is disabled.");
  process.exit(1);
}

const PUBLIC_DIR = path.join(__dirname, "public");
const UPLOAD_DIR = path.join(PUBLIC_DIR, "uploads");
const DATA_DIR   = path.join(__dirname, "data");
const DB_PATH    = path.join(DATA_DIR, "alendent.db");

for (const dir of [PUBLIC_DIR, UPLOAD_DIR, DATA_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/* Migrate DB from old location if needed */
const OLD_DB = path.join(__dirname, "alendent.db");
if (fs.existsSync(OLD_DB) && !fs.existsSync(DB_PATH)) {
  fs.renameSync(OLD_DB, DB_PATH);
  console.log("Migrated alendent.db → data/alendent.db");
}

/* ---------- Database ---------- */
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data TEXT NOT NULL, ord INTEGER);
  CREATE TABLE IF NOT EXISTS brands   (name TEXT PRIMARY KEY, data TEXT NOT NULL, ord INTEGER);
`);

function seed() {
  const haveProducts = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
  const haveBrands   = db.prepare("SELECT COUNT(*) AS n FROM brands").get().n;
  if (haveProducts && haveBrands) return;

  global.window = global.window || {};
  try { require("./public/src/data.js"); } catch (e) { console.warn("Could not load data.js seed:", e.message); }

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
const listProducts  = () => db.prepare("SELECT data FROM products ORDER BY ord ASC").all().map(r => JSON.parse(r.data));
const nextProductOrd = () => (db.prepare("SELECT COALESCE(MAX(ord),-1) AS m FROM products").get().m) + 1;
const upsertProduct = (p) => {
  const existing = db.prepare("SELECT ord FROM products WHERE id = ?").get(p.id);
  const ord = existing ? existing.ord : nextProductOrd();
  db.prepare("INSERT OR REPLACE INTO products (id, data, ord) VALUES (?, ?, ?)").run(p.id, JSON.stringify(p), ord);
  return p;
};
const deleteProduct = (id)  => db.prepare("DELETE FROM products WHERE id = ?").run(id);

const listBrands  = () => db.prepare("SELECT data FROM brands ORDER BY ord ASC").all().map(r => JSON.parse(r.data));
const nextBrandOrd = () => (db.prepare("SELECT COALESCE(MAX(ord),-1) AS m FROM brands").get().m) + 1;
const upsertBrand = (b) => {
  const existing = db.prepare("SELECT ord FROM brands WHERE name = ?").get(b.name);
  const ord = existing ? existing.ord : nextBrandOrd();
  db.prepare("INSERT OR REPLACE INTO brands (name, data, ord) VALUES (?, ?, ?)").run(b.name, JSON.stringify(b), ord);
  return b;
};
const deleteBrand = (name) => db.prepare("DELETE FROM brands WHERE name = ?").run(name);

/* ---------- Session auth ---------- */
const sessions = new Map(); // token → { createdAt }
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours
const COOKIE_NAME = "alendent_sess";

function signToken(token) {
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(token).digest("hex");
  return token + "." + sig;
}

function verifyToken(signed) {
  if (!signed || typeof signed !== "string") return null;
  const dot = signed.lastIndexOf(".");
  if (dot === -1) return null;
  const token = signed.slice(0, dot);
  const sig   = signed.slice(dot + 1);
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(token).digest("hex");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
  } catch { return null; }
  return token;
}

function createSession() {
  const token  = crypto.randomBytes(32).toString("hex");
  const signed = signToken(token);
  sessions.set(token, { createdAt: Date.now() });
  return signed;
}

function validateSession(signed) {
  const token = verifyToken(signed);
  if (!token) return false;
  const sess = sessions.get(token);
  if (!sess) return false;
  if (Date.now() - sess.createdAt > SESSION_TTL) { sessions.delete(token); return false; }
  return true;
}

function destroySession(signed) {
  const token = verifyToken(signed);
  if (token) sessions.delete(token);
}

/* ---------- Cookie helpers ---------- */
function parseCookies(req) {
  const raw = req.headers.cookie || "";
  const map = {};
  for (const pair of raw.split(";")) {
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    try {
      const k = decodeURIComponent(pair.slice(0, eq).trim());
      const v = decodeURIComponent(pair.slice(eq + 1).trim());
      map[k] = v;
    } catch { /* skip malformed */ }
  }
  return map;
}

function getSessionCookie(req) {
  return parseCookies(req)[COOKIE_NAME] || null;
}

function sessionCookieHeader(signed, maxAgeSeconds) {
  const secure  = NODE_ENV === "production" ? "; Secure" : "";
  const maxAge  = maxAgeSeconds != null ? `; Max-Age=${maxAgeSeconds}` : "";
  return `${COOKIE_NAME}=${encodeURIComponent(signed)}${maxAge}; HttpOnly; SameSite=Strict; Path=/${secure}`;
}

function isAuthenticated(req) {
  return validateSession(getSessionCookie(req));
}

/* ---------- Login rate limiter ---------- */
const loginAttempts = new Map(); // ip → { count, resetAt }

function checkLoginRateLimit(ip) {
  const now   = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

/* ---------- HTTP helpers ---------- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".jsx":  "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpeg": "image/jpeg", ".jpg": "image/jpeg",
  ".png":  "image/png",  ".gif": "image/gif",
  ".webp": "image/webp", ".svg": "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff2":"font/woff2", ".woff": "font/woff",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  /* unsafe-eval needed for Babel standalone JSX compilation in the browser */
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' https://unpkg.com 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

function applySecurityHeaders(res, extra = {}) {
  for (const [k, v] of Object.entries({ ...SECURITY_HEADERS, ...extra })) {
    res.setHeader(k, v);
  }
}

function sendJSON(res, code, obj, extra = {}) {
  applySecurityHeaders(res, extra);
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

function redirect(res, location, code = 302) {
  applySecurityHeaders(res);
  res.writeHead(code, { Location: location });
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) { reject(new Error("payload too large")); req.destroy(); }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

/* Validate + save a base64 data-URL image to /uploads, return public path */
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const IMAGE_EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };

function saveDataUrlImage(dataUrl) {
  const m = /^data:(image\/[a-zA-Z0-9+.-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!m) throw new Error("invalid image data");
  const mimeType = m[1].toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) throw new Error("unsupported image type");
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 10 * 1024 * 1024) throw new Error("image too large (max 10 MB)");
  const ext  = IMAGE_EXT[mimeType];
  const name = crypto.randomBytes(16).toString("hex") + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf, { mode: 0o644 });
  return "/uploads/" + name;
}

/* ---------- Auth API ---------- */
async function handleAuthApi(req, res, urlPath) {
  if (urlPath === "/api/auth/login" && req.method === "POST") {
    const ip = req.socket.remoteAddress || "unknown";
    if (!checkLoginRateLimit(ip)) {
      return sendJSON(res, 429, { error: "Too many attempts. Try again in 15 minutes." });
    }
    let body;
    try { body = JSON.parse(await readBody(req)); } catch { return sendJSON(res, 400, { error: "bad request" }); }
    const { password } = body || {};
    if (typeof password !== "string" || !password) return sendJSON(res, 400, { error: "password required" });
    const pwdBuf  = Buffer.from(password);
    const adminBuf = Buffer.from(ADMIN_PASSWORD);
    const match = pwdBuf.length === adminBuf.length
      && crypto.timingSafeEqual(pwdBuf, adminBuf);
    if (!match) {
      return sendJSON(res, 401, { error: "Incorrect password" });
    }
    const signed = createSession();
    return sendJSON(res, 200, { ok: true }, {
      "Set-Cookie": sessionCookieHeader(signed, SESSION_TTL / 1000),
    });
  }

  if (urlPath === "/api/auth/logout" && req.method === "POST") {
    const signed = getSessionCookie(req);
    if (signed) destroySession(signed);
    return sendJSON(res, 200, { ok: true }, {
      "Set-Cookie": sessionCookieHeader("", 0),
    });
  }

  return sendJSON(res, 404, { error: "not found" });
}

/* ---------- Data API (products & brands) ---------- */
async function handleDataApi(req, res, parts) {
  const resource = parts[1]; // "products" | "brands" | "upload"
  const id       = parts[2] ? decodeURIComponent(parts[2]) : null;
  const isWrite  = req.method !== "GET" && req.method !== "HEAD";

  /* Write operations require a valid session */
  if (isWrite && !isAuthenticated(req)) {
    return sendJSON(res, 401, { error: "Unauthorized" });
  }

  try {
    if (resource === "products") {
      if (req.method === "GET")    return sendJSON(res, 200, listProducts());
      if (req.method === "POST") {
        const p = JSON.parse(await readBody(req));
        if (!p || typeof p.id !== "string" || !p.id.trim()) return sendJSON(res, 400, { error: "product.id required" });
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
      if (req.method === "GET")    return sendJSON(res, 200, listBrands());
      if (req.method === "POST") {
        const b = JSON.parse(await readBody(req));
        if (!b || typeof b.name !== "string" || !b.name.trim()) return sendJSON(res, 400, { error: "brand.name required" });
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
    if (err.message === "payload too large") return sendJSON(res, 413, { error: err.message });
    return sendJSON(res, 500, { error: "server error" });
  }
}

/* ---------- Static files ---------- */
/* Paths that must never be served as static files */
const BLOCKED_PATHS = new Set([".env", "server.js", "package.json", "package-lock.json"]);

function serveStatic(req, res, urlPathname) {
  /* Block access to server-side files */
  const top = urlPathname.split("/").filter(Boolean)[0] || "";
  if (BLOCKED_PATHS.has(top) || top === "data") {
    applySecurityHeaders(res);
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("Forbidden");
  }

  let rel = urlPathname === "/" ? "/index.html" : urlPathname;
  /* Safe path join: normalize and ensure it stays inside public/ */
  const filePath = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== PUBLIC_DIR) {
    applySecurityHeaders(res);
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      applySecurityHeaders(res);
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    const isImmutable = filePath.startsWith(path.join(PUBLIC_DIR, "uploads"));
    applySecurityHeaders(res);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": isImmutable ? "public, max-age=31536000, immutable" : "no-cache",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ---------- Admin routes ---------- */
function handleAdmin(req, res, urlPath) {
  /* /admin/logout */
  if (urlPath === "/admin/logout" && req.method === "POST") {
    const signed = getSessionCookie(req);
    if (signed) destroySession(signed);
    res.setHeader("Set-Cookie", sessionCookieHeader("", 0));
    return redirect(res, "/admin/login");
  }

  /* /admin/login — always serve the login page */
  if (urlPath === "/admin/login") {
    const loginPath = path.join(PUBLIC_DIR, "admin-login.html");
    applySecurityHeaders(res);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    return fs.createReadStream(loginPath).pipe(res);
  }

  /* /admin (and any sub-path like /admin/) — require auth */
  if (!isAuthenticated(req)) {
    return redirect(res, "/admin/login");
  }

  const adminPath = path.join(PUBLIC_DIR, "admin.html");
  applySecurityHeaders(res);
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  fs.createReadStream(adminPath).pipe(res);
}

/* ---------- Main request router ---------- */
http.createServer(async (req, res) => {
  let urlPath;
  try {
    urlPath = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  } catch {
    res.writeHead(400);
    return res.end("Bad request");
  }

  /* Auth API */
  if (urlPath.startsWith("/api/auth/")) return handleAuthApi(req, res, urlPath);

  /* Data API */
  if (urlPath.startsWith("/api/")) {
    const parts = urlPath.split("/").filter(Boolean);
    return handleDataApi(req, res, parts);
  }

  /* Admin panel */
  if (urlPath === "/admin" || urlPath.startsWith("/admin/")) return handleAdmin(req, res, urlPath);

  /* Everything else → static files from public/ */
  serveStatic(req, res, urlPath);

}).listen(PORT, () => {
  console.log(`\n  Alendent running  →  http://localhost:${PORT}`);
  console.log(`  Admin panel       →  http://localhost:${PORT}/admin`);
  console.log(`  Database          →  ${DB_PATH}`);
  console.log(`  Environment       →  ${NODE_ENV}\n`);
});
