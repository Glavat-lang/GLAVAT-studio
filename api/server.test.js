"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeInvitation, hashToken, safeEqualHex } = require("./server");

test("normalizes invitation data and rejects unsupported themes", () => {
  const result = normalizeInvitation({
    title: "  Наш день  ",
    text: "Приходи!",
    date: "2026-12-31",
    time: "18:30",
    place: "Пермь",
    theme: "unknown",
    font: "unknown"
  });
  assert.equal(result.title, "Наш день");
  assert.equal(result.theme, "cream");
  assert.equal(result.font, "playfair");
});

test("requires invitation text", () => {
  assert.throws(() => normalizeInvitation({ title: " ", text: " " }));
});

test("validates date and photo data", () => {
  assert.throws(() => normalizeInvitation({ title: "Test", date: "31.12.2026" }));
  assert.throws(() => normalizeInvitation({ title: "Test", image: "javascript:alert(1)" }));
});

test("hashes owner tokens and compares them safely", () => {
  const hash = hashToken("a-secure-owner-token");
  assert.equal(hash.length, 64);
  assert.equal(safeEqualHex(hash, hash), true);
  assert.equal(safeEqualHex(hash, hashToken("another-token")), false);
});
