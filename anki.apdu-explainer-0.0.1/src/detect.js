"use strict";

const vscode = require("vscode");
const { parseHex } = require("./parseHex");
const { isDisplayableApdu } = require("./parseApdu");
const { explain, lensTitle } = require("./explain");
const { collectLineRuns, joinLineRuns, byteMap, wrapRowsWellFormed } = require("./joinHex");

const cache = new WeakMap();

function getSpans(document, catalog) {
  const cached = cache.get(document);
  if (cached && cached.version === document.version && cached.catalog === catalog) {
    return cached.spans;
  }
  const spans = [];
  if (document.getText().length > 2_000_000) {
    cache.set(document, { version: document.version, catalog, spans: [] });
    return [];
  }
  const lines = [];
  for (let line = 0; line < document.lineCount; line++) {
    lines.push(document.lineAt(line).text);
  }
  const groups = joinLineRuns(collectLineRuns(lines), { lines });
  for (const group of groups) {
    if (!wrapRowsWellFormed(group.parts)) continue;
    if (!isDisplayableApdu(group.bytes, catalog.swIndex)) continue;
    const map = byteMap(group.parts);
    const startTok = map[0];
    const endTok = map[map.length - 1];
    if (!startTok || !endTok) continue;
    const explanation = explain(group.bytes, catalog);
    spans.push({
      range: new vscode.Range(startTok.line, startTok.start, endTok.line, endTok.end),
      bytes: group.bytes,
      explanation,
      title: lensTitle(explanation),
    });
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
