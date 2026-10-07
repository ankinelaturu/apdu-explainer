"use strict";

const vscode = require("vscode");
const { detectHexRuns, parseHex, tokenSpans } = require("./parseHex");
const { classify, shouldAutoDetect, parseCommand } = require("./parseApdu");
const { explain, lensTitle } = require("./explain");

function splitIntoApdus(bytes, swIndex) {
  if (!bytes || bytes.length < 2) return [];
  if (parseCommand(bytes)) return [{ bytes, from: 0, to: bytes.length }];
  const two = classify(bytes, swIndex);
  if (bytes.length === 2 && two.kind === "response") {
    return [{ bytes, from: 0, to: 2 }];
  }
  const parts = [];
  let offset = 0;
  while (offset < bytes.length) {
    const rest = bytes.slice(offset);
    let taken = 0;
    for (let n = rest.length; n >= 2; n--) {
      const slice = rest.slice(0, n);
      if (parseCommand(slice)) {
        taken = n;
        break;
      }
      const parsed = classify(slice, swIndex);
      if (n === 2 && parsed.kind === "response") {
        taken = 2;
        break;
      }
    }
    if (!taken) break;
    parts.push({ bytes: rest.slice(0, taken), from: offset, to: offset + taken });
    offset += taken;
  }
  return parts;
}

const cache = new WeakMap();

function getSpans(document, catalog) {
  const cached = cache.get(document);
  if (cached && cached.version === document.version && cached.catalog === catalog) {
    return cached.spans;
  }
  const spans = [];
  const lineCount = document.lineCount;
  if (document.getText().length > 2_000_000) {
    cache.set(document, { version: document.version, catalog, spans: [] });
    return [];
  }
  for (let line = 0; line < lineCount; line++) {
    const text = document.lineAt(line).text;
    const runs = detectHexRuns(text);
    for (const run of runs) {
      const tokens = tokenSpans(run.text);
      const parts = splitIntoApdus(run.bytes, catalog.swIndex);
      const chunks = parts.length ? parts : [{ bytes: run.bytes, from: 0, to: run.bytes.length }];
      for (const part of chunks) {
        const parsed = classify(part.bytes, catalog.swIndex);
        if (!shouldAutoDetect(part.bytes, parsed)) continue;
        const startTok = tokens[part.from];
        const endTok = tokens[part.to - 1];
        if (!startTok || !endTok) continue;
        const explanation = explain(part.bytes, catalog);
        spans.push({
          range: new vscode.Range(line, run.start + startTok.start, line, run.start + endTok.end),
          bytes: part.bytes,
          text: run.text.slice(startTok.start, endTok.end),
          explanation,
          title: lensTitle(explanation),
        });
      }
    }
  }
  cache.set(document, { version: document.version, catalog, spans });
  return spans;
}

function spanAt(document, position, catalog) {
  return getSpans(document, catalog).find((s) => s.range.contains(position));
}

function parseSelection(document, selection) {
  const text = document.getText(selection);
  return parseHex(text);
}

module.exports = {
  getSpans,
  spanAt,
  parseSelection,
};
