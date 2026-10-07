"use strict";

const { detectHexRuns, tokenSpans } = require("./parseHex");
const { parseCommand, isIncompleteCommand, maxNeededCommandLength, isDisplayableApdu } = require("./parseApdu");

function kindsCompatible(a, b) {
  if (a === b) return true;
  return !!(a && b && a.startsWith("0x") && b.startsWith("0x"));
}

function collectLineRuns(lines) {
  const runs = [];
  lines.forEach((text, line) => {
    for (const run of detectHexRuns(text)) {
      runs.push({ line, ...run });
    }
  });
  return runs;
}

function uniqueRunOnLine(runs, line) {
  const on = runs.filter((r) => r.line === line);
  return on.length === 1 ? on[0] : null;
}

function concatBytes(parts) {
  const bytes = [];
  for (const part of parts) bytes.push(...part.bytes);
  return bytes;
}

function continuationRun(runs, lines, line) {
  const existing = uniqueRunOnLine(runs, line);
  if (existing) return existing;
  if (!lines || lines[line] == null) return null;
  const extra = detectHexRuns(lines[line], { allowSingle: true });
  if (extra.length !== 1) return null;
  return { line, ...extra[0] };
}

function joinLineRuns(runs, opts) {
  const lines = (opts && opts.lines) || [];
  const isComplete = (opts && opts.isComplete) || parseCommand;
  const isIncomplete = (opts && opts.isIncomplete) || isIncompleteCommand;
  const maxNeeded = (opts && opts.maxNeeded) || maxNeededCommandLength;
  const maxBytes = (opts && opts.maxBytes) || 4096;
  const used = new Set();
  const groups = [];

  for (let i = 0; i < runs.length; i++) {
    if (used.has(i)) continue;
    const parts = [runs[i]];
    used.add(i);
    let bytes = runs[i].bytes.slice();

    if (isIncomplete(bytes)) {
      let nextLine = runs[i].line + 1;
      while (bytes.length < maxBytes) {
        if (isComplete(bytes)) break;
        const next = continuationRun(runs, lines, nextLine);
        if (!next) break;
        if (!kindsCompatible(runs[i].kind, next.kind)) break;
        const need = maxNeeded(bytes);
        if (!need || bytes.length >= need) break;
        parts.push(next);
        runs.forEach((r, idx) => {
          if (r.line === nextLine) used.add(idx);
        });
        bytes = concatBytes(parts);
        nextLine++;
      }
    }

    groups.push({ parts, bytes: concatBytes(parts) });
  }
  return groups;
}

function byteMap(parts) {
  const map = [];
  for (const part of parts) {
    for (const tok of tokenSpans(part.text)) {
      map.push({
        line: part.line,
        start: part.start + tok.start,
        end: part.start + tok.end,
      });
    }
  }
  return map;
}

function wrapRowsWellFormed(parts) {
  if (!parts || parts.length <= 1) return true;
  const width = parts[0].bytes.length;
  if (width < 2) return false;
  for (let i = 1; i < parts.length - 1; i++) {
    if (parts[i].bytes.length !== width) return false;
  }
  const last = parts[parts.length - 1].bytes.length;
  return last >= 1 && last <= width;
}

function displayableGroupsFromLines(lines, swIndex) {
  const groups = joinedRunsFromLines(lines);
  const out = [];
  for (const group of groups) {
    if (!wrapRowsWellFormed(group.parts)) continue;
    if (!isDisplayableApdu(group.bytes, swIndex)) continue;
    out.push(group);
  }
  return out;
}

function joinedRunsFromLines(lines) {
  return joinLineRuns(collectLineRuns(lines), { lines });
}

module.exports = {
  kindsCompatible,
  collectLineRuns,
  joinLineRuns,
  byteMap,
  wrapRowsWellFormed,
  displayableGroupsFromLines,
  joinedRunsFromLines,
};
