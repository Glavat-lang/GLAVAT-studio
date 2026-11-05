"use strict";

const crypto = require("node:crypto");
const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATABASE_URL = process.env.DATABASE_URL;
const ALLOWED_ORIGINS = new Set([
  ...(process.env.CORS_ORIGIN || "https://glavat-lang.github.io").split(",").map((origin) => origin.trim()).filter(Boolean),
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500"
]);
const THEMES = new Set(["cream", "wine", "night", "noir", "botanical", "minimal"]);
const FONTS = new Set([
  "playfair", "cormorant", "lora", "merriweather", "cinzel", "roboto-slab",
  "dm-sans", "montserrat", "raleway", "oswald", "caveat", "pacifico"
]);
const ATTENDANCE = new Set(["yes", "no", "maybe"]);
const rateBuckets = new Map();

const pool = DATABASE_URL ? new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
}) : null;

function jsonError(res, status, error, message) {
  return res.status(status).json({ error, message });
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function safeEqualHex(left, right) {
  if (typeof left !== "string" || typeof right !== "string" || left.length !== right.length) return false;
  return crypto.timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

function normalizeInvitation(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Некорректные данные приглашения.");
  }
  const title = String(input.title || "").trim().slice(0, 70);
  const text = String(input.text || "").trim().slice(0, 500);
  const date = String(input.date || "");
  const time = String(input.time || "");
  const place = String(input.place || "").trim().slice(0, 100);
  const theme = THEMES.has(input.theme) ? input.theme : "cream";
  const font = FONTS.has(input.font) ? input.font : "playfair";
  const image = typeof input.image === "string" ? input.image : "";
  if (!title && !text) throw new Error("Добавь заголовок или текст приглашения.");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Некорректная дата.");
  if (time && !/^\d{2}:\d{2}$/.test(time)) throw new Error("Некорректное время.");
  if (image && (image.length > 180000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image))) {
    throw new Error("Фотография имеет неподдерживаемый формат или слишком большой размер.");
  }
  return { title, text, date, time, place, theme, font, image };
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
}

function rateLimit({ windowMs = 60000, max = 90 } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const key = clientIp(req) + ":" + req.route?.path;
    const bucket = rateBuckets.get(key);
    if (!bucket || now - bucket.startedAt > windowMs) {
      rateBuckets.set(key, { startedAt: now, count: 1 });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.set("Retry-After", String(Math.ceil((windowMs - (now - bucket.startedAt)) / 1000)));
      return jsonError(res, 429, "rate_limited", "Слишком много запросов. Попробуй немного позже.");
    }
    next();
  };
}

function requireOwner(req, res, next) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!/^[A-Za-z0-9_-]{40,80}$/.test(token)) {
    return jsonError(res, 401, "unauthorized", "Нет доступа к ответам этого приглашения.");
  }
  req.ownerTokenHash = hashToken(token);
  next();
}

async function findOwnedInvite(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT id, data, owner_token_hash, created_at FROM invitations WHERE id = $1",
      [req.params.id]
    );
    const invite = result.rows[0];
    if (!invite || !safeEqualHex(invite.owner_token_hash, req.ownerTokenHash)) {
      return jsonError(res, 404, "not_found", "Приглашение не найдено или доступ запрещён.");
    }
    req.invite = invite;
    next();
  } catch (error) {
    next(error);
  }
}

app.disable("x-powered-by");
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return jsonError(res, 403, "origin_not_allowed", "Источник запроса не разрешён.");
  }
  if (origin) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  }
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "no-referrer");
  res.set("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: "300kb", strict: true }));

app.get("/healthz", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, service: "glavat-studio-api" });
  } catch {
    jsonError(res, 503, "database_unavailable", "База данных временно недоступна.");
  }
});

app.post("/api/invites", rateLimit({ windowMs: 60000, max: 20 }), async (req, res, next) => {
  try {
    const data = normalizeInvitation(req.body);
    const ownerToken = crypto.randomBytes(32).toString("base64url");
    const ownerTokenHash = hashToken(ownerToken);
    let id;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      id = crypto.randomBytes(6).toString("base64url");
      try {
        await pool.query(
          "INSERT INTO invitations (id, data, owner_token_hash) VALUES ($1, $2::jsonb, $3)",
          [id, JSON.stringify(data), ownerTokenHash]
        );
        return res.status(201).json({ id, ownerToken });
      } catch (error) {
        if (error.code !== "23505") throw error;
      }
    }
    throw new Error("Не удалось создать уникальную ссылку. Попробуй ещё раз.");
  } catch (error) {
    if (error.message && !error.code) return jsonError(res, 400, "invalid_invitation", error.message);
    next(error);
  }
});

app.get("/api/invites/:id", rateLimit(), async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, data, created_at FROM invitations WHERE id = $1",
      [req.params.id]
    );
    if (!result.rows[0]) return jsonError(res, 404, "not_found", "Это приглашение не найдено.");
    const row = result.rows[0];
    res.json({ id: row.id, invitation: row.data, createdAt: row.created_at });
  } catch (error) {
    next(error);
  }
});

app.post("/api/invites/:id/rsvps", rateLimit({ windowMs: 300000, max: 8 }), async (req, res, next) => {
  try {
    const exists = await pool.query("SELECT 1 FROM invitations WHERE id = $1", [req.params.id]);
    if (!exists.rowCount) return jsonError(res, 404, "not_found", "Это приглашение не найдено.");
    const name = String(req.body?.name || "").trim().slice(0, 60);
    const attendance = String(req.body?.attendance || "");
    const guests = Math.max(0, Math.min(10, Number.parseInt(req.body?.guests, 10) || 0));
    const comment = String(req.body?.comment || "").trim().slice(0, 300);
    if (!name) return jsonError(res, 400, "name_required", "Напиши, как тебя зовут.");
    if (!ATTENDANCE.has(attendance)) return jsonError(res, 400, "invalid_attendance", "Выбери вариант ответа.");
    if (attendance === "yes" && guests < 1) return jsonError(res, 400, "guest_count_required", "Укажи количество гостей.");
    const result = await pool.query(
      "INSERT INTO rsvps (invite_id, name, attendance, guests, comment) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at",
      [req.params.id, name, attendance, attendance === "yes" ? guests : 0, comment]
    );
    res.status(201).json({ ok: true, id: result.rows[0].id, createdAt: result.rows[0].created_at });
  } catch (error) {
    next(error);
  }
});

app.get("/api/invites/:id/rsvps", rateLimit(), requireOwner, findOwnedInvite, async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, attendance, guests, comment, created_at FROM rsvps WHERE invite_id = $1 ORDER BY created_at DESC",
      [req.invite.id]
    );
    const counts = { yes: 0, no: 0, maybe: 0, guests: 0 };
    for (const row of result.rows) {
      counts[row.attendance] += 1;
      counts.guests += row.guests;
    }
    res.json({ invitation: req.invite.data, counts, responses: result.rows });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/invites/:id", rateLimit(), requireOwner, findOwnedInvite, async (req, res, next) => {
  try {
    await pool.query("DELETE FROM invitations WHERE id = $1", [req.invite.id]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  if (error.type === "entity.too.large") return jsonError(res, 413, "payload_too_large", "Данные приглашения слишком большие.");
  if (error instanceof SyntaxError && "body" in error) return jsonError(res, 400, "invalid_json", "Не удалось прочитать данные запроса.");
  console.error("API error:", error.message);
  jsonError(res, 500, "internal_error", "Не удалось выполнить запрос. Попробуй позже.");
});

async function start() {
  if (!DATABASE_URL || !pool) throw new Error("DATABASE_URL is required");
  let connected = false;
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS invitations (
          id VARCHAR(32) PRIMARY KEY,
          data JSONB NOT NULL,
          owner_token_hash CHAR(64) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS rsvps (
          id BIGSERIAL PRIMARY KEY,
          invite_id VARCHAR(32) NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
          name VARCHAR(60) NOT NULL,
          attendance VARCHAR(8) NOT NULL CHECK (attendance IN ('yes', 'no', 'maybe')),
          guests SMALLINT NOT NULL DEFAULT 0 CHECK (guests BETWEEN 0 AND 10),
          comment VARCHAR(300) NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS rsvps_invite_created_idx ON rsvps(invite_id, created_at DESC);
      `);
      connected = true;
      break;
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/12 failed:`, error.message);
      await new Promise((resolve) => setTimeout(resolve, Math.min(attempt * 2000, 10000)));
    }
  }
  if (!connected) throw new Error("Could not initialize PostgreSQL");
  app.listen(PORT, "0.0.0.0", () => console.log(`GLAVAT STUDIO API listening on ${PORT}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error("API startup failed:", error.message);
    process.exit(1);
  });
}

module.exports = { normalizeInvitation, hashToken, safeEqualHex, start };
