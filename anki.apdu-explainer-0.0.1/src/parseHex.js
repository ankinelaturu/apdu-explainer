"use strict";

const HEX_PAIR = /^[0-9A-Fa-f]{2}$/;
const TOKEN_0X = /0x[0-9A-Fa-f]{2}/gi;
const RUN_0X_COMMA = /0x[0-9A-Fa-f]{2}(?:\s*,\s*0x[0-9A-Fa-f]{2})+/gi;
const RUN_0X_SPACE = /0x[0-9A-Fa-f]{2}(?:[ \t]0x[0-9A-Fa-f]{2})+/gi;
const RUN_PLAIN = /\b[0-9A-Fa-f]{2}(?:[ \t][0-9A-Fa-f]{2})+\b/g;

function bytesFrom0xTokens(text) {
  const tokens = text.match(TOKEN_0X);
  if (!tokens || tokens.length < 2) return null;
  const leftover = text.replace(TOKEN_0X, "").replace(/[\s,]/g, "");
  if (leftover.length) return null;
  return tokens.map((t) => parseInt(t.slice(2), 16));
}

function bytesFromPlainTokens(text) {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return null;
  if (!tokens.every((t) => HEX_PAIR.test(t))) return null;
  return tokens.map((t) => parseInt(t, 16));
}

function parseHex(text) {
  if (typeof text !== "string") return null;
  const t = text.trim();
  if (!t) return null;
  if (/0x/i.test(t)) return bytesFrom0xTokens(t);
  return bytesFromPlainTokens(t);
}

function markOccupied(occupied, start, end) {
  for (let i = start; i < end; i++) occupied[i] = true;
}

function isFree(occupied, start, end) {
  for (let i = start; i < end; i++) {
    if (occupied[i]) return false;
  }
  return true;
}

function hexKind(text) {
  if (/0x/i.test(text) && /,/.test(text)) return "0x-comma";
  if (/0x/i.test(text)) return "0x-space";
  return "plain";
}

function collectRuns(line, regex, occupied) {
  const runs = [];
  regex.lastIndex = 0;
  let m;
  while ((m = regex.exec(line))) {
    const start = m.index;
    const end = start + m[0].length;
    if (!isFree(occupied, start, end)) continue;
    const bytes = parseHex(m[0]);
    if (!bytes) continue;
    markOccupied(occupied, start, end);
    runs.push({ start, end, text: m[0], bytes, kind: hexKind(m[0]) });
  }
  return runs;
}

const RUN_0X_SINGLE = /0x[0-9A-Fa-f]{2}/gi;
const RUN_PLAIN_SINGLE = /\b[0-9A-Fa-f]{2}\b/g;

function collectSingleRuns(line, regex, occupied) {
  const runs = [];
  regex.lastIndex = 0;
  let m;
  while ((m = regex.exec(line))) {
    const start = m.index;
    const end = start + m[0].length;
    if (!isFree(occupied, start, end)) continue;
    const token = m[0];
    const bytes = /0x/i.test(token) ? [parseInt(token.slice(2), 16)] : [parseInt(token, 16)];
    markOccupied(occupied, start, end);
    runs.push({ start, end, text: token, bytes, kind: hexKind(token) });
  }
  return runs;
}

function detectHexRuns(line, opts) {
  if (!line) return [];
  const occupied = new Array(line.length).fill(false);
  const comma = collectRuns(line, RUN_0X_COMMA, occupied);
  const spaced = collectRuns(line, RUN_0X_SPACE, occupied);
  const plain = collectRuns(line, RUN_PLAIN, occupied);
  let runs = comma.concat(spaced, plain);
  if (opts && opts.allowSingle && runs.length === 0) {
    const singles = /0x/i.test(line)
      ? collectSingleRuns(line, RUN_0X_SINGLE, occupied)
      : collectSingleRuns(line, RUN_PLAIN_SINGLE, occupied);
    runs = runs.concat(singles);
  }
  return runs.sort((a, b) => a.start - b.start);
}

function toHexByte(value) {
  return value.toString(16).toUpperCase().padStart(2, "0");
}

function toHexBytes(bytes) {
  return bytes.map(toHexByte);
}

function toHexString(bytes, sep) {
  return toHexBytes(bytes).join(sep == null ? " " : sep);
}

function tokenSpans(text) {
  const re = /0x/i.test(text) ? /0x[0-9A-Fa-f]{2}/gi : /[0-9A-Fa-f]{2}/g;
  const spans = [];
  let m;
  while ((m = re.exec(text))) {
    spans.push({ start: m.index, end: m.index + m[0].length });
  }
  return spans;
}

module.exports = {
  parseHex,
  detectHexRuns,
  hexKind,
  toHexByte,
  toHexBytes,
  toHexString,
  tokenSpans,
};
