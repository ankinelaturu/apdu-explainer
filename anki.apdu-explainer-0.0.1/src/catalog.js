"use strict";

const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function isCustomPath(file, root) {
  const rel = path.relative(root, file).split(path.sep);
  return rel[0] === "custom";
}

function loadJsonTree(dir, root, acc) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir).sort()) {
    if (name.startsWith(".")) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      loadJsonTree(full, root, acc);
      continue;
    }
    if (!name.endsWith(".json")) continue;
    const data = readJson(full);
    const items = Array.isArray(data) ? data : data && data.items ? data.items : [data];
    const custom = isCustomPath(full, root);
    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      acc.push({ ...item, _custom: custom, _file: path.relative(root, full) });
    }
  }
}

function mergeById(items) {
  const byId = new Map();
  const extras = [];
  for (const item of items) {
    if (item.id) {
      byId.set(item.id, item);
    } else {
      extras.push(item);
    }
  }
  return [...byId.values(), ...extras].filter((item) => item.disabled !== true);
}

function compileSwPattern(sw) {
  const raw = String(sw).toUpperCase().replace(/\s/g, "");
  if (/^[0-9A-F]{4}$/.test(raw)) {
    return { exact: raw };
  }
  const reSrc = "^" + raw.replace(/X/g, "[0-9A-F]") + "$";
  return { re: new RegExp(reSrc), pattern: raw };
}

function indexStatusWords(items) {
  const exact = new Map();
  const patterns = [];
  for (const item of items) {
    if (!item.sw) continue;
    const compiled = compileSwPattern(item.sw);
    if (compiled.exact) {
      const list = exact.get(compiled.exact) || [];
      list.push(item);
      exact.set(compiled.exact, list);
    } else {
      patterns.push({ ...compiled, item });
    }
  }
  return { exact, patterns };
}

function classifyItem(item) {
  if (item && item.match) return "commands";
  if (item && item.fid) return "files";
  if (item && item.aid) return "aids";
  if (item && item.tag) return "tags";
  if (item && item.sw) return "statusWords";
  if (item && item.ins && item.name) return "commands";
  return null;
}

function loadCatalog(root) {
  const commands = [];
  const files = [];
  const aids = [];
  const tags = [];
  const statusWords = [];
  loadJsonTree(path.join(root, "commands"), root, commands);
  loadJsonTree(path.join(root, "files"), root, files);
  loadJsonTree(path.join(root, "aids"), root, aids);
  loadJsonTree(path.join(root, "tags"), root, tags);
  loadJsonTree(path.join(root, "status-words"), root, statusWords);

  const customItems = [];
  loadJsonTree(path.join(root, "custom"), root, customItems);
  for (const item of customItems) {
    const bucket = classifyItem(item);
    if (bucket === "commands") commands.push(item);
    else if (bucket === "files") files.push(item);
    else if (bucket === "aids") aids.push(item);
    else if (bucket === "tags") tags.push(item);
    else if (bucket === "statusWords") statusWords.push(item);
  }

  const claPath = path.join(root, "cla.json");
  const cla = fs.existsSync(claPath) ? readJson(claPath) : { values: [] };

  const commandsMerged = mergeById(commands);
  const swMerged = mergeById(statusWords);

  return {
    commands: commandsMerged,
    files: mergeById(files),
    aids: mergeById(aids),
    tags: mergeById(tags),
    statusWords: swMerged,
    cla,
    swIndex: {
      exact: new Set(swMerged.filter((s) => /^[0-9A-Fa-f]{4}$/.test(String(s.sw || "").replace(/\s/g, ""))).map((s) => String(s.sw).toUpperCase().replace(/\s/g, ""))),
      patterns: swMerged
        .filter((s) => /x/i.test(String(s.sw || "")))
        .map((s) => compileSwPattern(s.sw)),
      lookup: indexStatusWords(swMerged),
    },
  };
}

function claKindMatches(cla, kind) {
  if (!kind || kind === "any") return true;
  if (kind === "iso") return (cla & 0x80) === 0;
  if (kind === "gp") return (cla & 0xf0) === 0x80;
  if (kind === "emv") return (cla & 0xf0) === 0x80;
  if (kind === "proprietary") return (cla & 0x80) !== 0;
  return true;
}

function byteInList(value, list) {
  if (list == null) return true;
  const items = Array.isArray(list) ? list : [list];
  const hex = value.toString(16).toUpperCase().padStart(2, "0");
  return items.some((item) => String(item).toUpperCase().padStart(2, "0") === hex);
}

function matchScore(entry, cla, ins, p1, p2) {
  const match = entry.match || {};
  if (match.ins == null) return 0;
  const insHex = ins.toString(16).toUpperCase().padStart(2, "0");
  if (String(match.ins).toUpperCase().padStart(2, "0") !== insHex) return 0;
  if (!claKindMatches(cla, match.claKind)) return 0;
  if (!byteInList(cla, match.cla)) return 0;
  if (match.p1 != null && !byteInList(p1, match.p1)) return 0;
  if (match.p2 != null && !byteInList(p2, match.p2)) return 0;

  let score = 10;
  if (match.claKind) score += 4;
  if (match.cla) score += 6;
  if (match.p1 != null) score += 3;
  if (match.p2 != null) score += 3;
  if (entry._custom) score += 1;
  return score;
}

function findCommands(catalog, cla, ins, p1, p2) {
  const scored = [];
  for (const entry of catalog.commands) {
    const score = matchScore(entry, cla, ins, p1, p2);
    if (score > 0) scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score || Number(b.entry._custom) - Number(a.entry._custom));
  return scored;
}

function normHex(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^0-9A-F]/g, "");
}

function lookupByHex(list, field, hex) {
  const key = normHex(hex);
  if (!key) return [];
  return list.filter((item) => normHex(item[field]) === key);
}

function lookupFiles(catalog, fid) {
  return lookupByHex(catalog.files, "fid", fid);
}

function lookupFilesBySfi(catalog, sfi) {
  return lookupByHex(catalog.files, "sfi", sfi);
}

function lookupAids(catalog, aid) {
  const key = normHex(aid);
  if (!key) return [];
  const exact = lookupByHex(catalog.aids, "aid", key);
  if (exact.length) return exact;
  return catalog.aids.filter((item) => {
    const rid = normHex(item.aid);
    return rid.length >= 10 && key.startsWith(rid);
  });
}

function lookupTags(catalog, tag) {
  const key = normHex(tag);
  const hits = lookupByHex(catalog.tags, "tag", key);
  if (hits.length) return hits;
  if (key.length === 4 && key.startsWith("00")) {
    return lookupByHex(catalog.tags, "tag", key.slice(2));
  }
  return [];
}

function lookupStatusWords(catalog, sw) {
  const key = normHex(sw);
  const hits = [];
  const exact = catalog.swIndex.lookup.exact.get(key);
  if (exact) hits.push(...exact);
  for (const p of catalog.swIndex.lookup.patterns) {
    if (p.re.test(key)) hits.push(p.item);
  }
  return hits;
}

module.exports = {
  loadCatalog,
  findCommands,
  lookupFiles,
  lookupFilesBySfi,
  lookupAids,
  lookupTags,
  lookupStatusWords,
  normHex,
};
