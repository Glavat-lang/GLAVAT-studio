"use strict";

const assert = require("node:assert/strict");

const base = String(process.env.API_BASE || "https://glavat-studio-api-production.up.railway.app").replace(/\/$/, "");
const headers = { "Content-Type": "application/json", Origin: "https://glavat-lang.github.io" };

async function request(path, options = {}) {
  const response = await fetch(base + path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${options.method || "GET"} ${path}: ${response.status} ${body.message || ""}`);
  return body;
}

async function main() {
  let created;
  try {
    let health;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      try {
        health = await request("/healthz");
        break;
      } catch (error) {
        if (attempt === 11) throw error;
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
    assert.equal(health.ok, true);

    created = await request("/api/invites", {
      method: "POST",
      body: JSON.stringify({
        title: "Проверка GLAVAT STUDIO",
        text: "Тестовое приглашение. Оно будет удалено автоматически.",
        date: "2026-12-31",
        time: "18:00",
        place: "Пермь",
        theme: "wine",
        font: "playfair",
        image: ""
      })
    });
    assert.ok(created.id);
    assert.ok(created.ownerToken);

    const invitation = await request("/api/invites/" + encodeURIComponent(created.id));
    assert.equal(invitation.invitation.title, "Проверка GLAVAT STUDIO");

    await request("/api/invites/" + encodeURIComponent(created.id) + "/rsvps", {
      method: "POST",
      body: JSON.stringify({ name: "Тестовый гость", attendance: "yes", guests: 2, comment: "Проверка ответа" })
    });

    const ownerData = await request("/api/invites/" + encodeURIComponent(created.id) + "/rsvps", {
      headers: { Authorization: "Bearer " + created.ownerToken }
    });
    assert.equal(ownerData.counts.yes, 1);
    assert.equal(ownerData.counts.guests, 2);
    assert.equal(ownerData.responses[0].name, "Тестовый гость");

    console.log("GLAVAT STUDIO API smoke test passed: health, create, public read, RSVP, owner dashboard.");
  } finally {
    if (created?.id && created?.ownerToken) {
      await request("/api/invites/" + encodeURIComponent(created.id), {
        method: "DELETE",
        headers: { Authorization: "Bearer " + created.ownerToken }
      }).catch((error) => console.error("Cleanup warning:", error.message));
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
