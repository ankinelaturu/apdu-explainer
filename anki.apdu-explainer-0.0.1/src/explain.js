"use strict";

const { toHexByte, toHexBytes, toHexString } = require("./parseHex");
const { classify, parseCommand } = require("./parseApdu");
const {
  findCommands,
  lookupFiles,
  lookupFilesBySfi,
  lookupAids,
  lookupTags,
  lookupStatusWords,
  normHex,
} = require("./catalog");

function mapLookup(map, value) {
  if (!map) return null;
  const hex = toHexByte(value);
  if (Object.prototype.hasOwnProperty.call(map, hex)) return map[hex];
  if (Object.prototype.hasOwnProperty.call(map, hex.toLowerCase())) return map[hex.toLowerCase()];
  if (Object.prototype.hasOwnProperty.call(map, "*")) return map["*"];
  return null;
}

function bitRange(byte, from, to) {
  // bits numbered 8 (MSB) .. 1 (LSB)
  const width = from - to + 1;
  const shift = to - 1;
  const mask = (1 << width) - 1;
  return (byte >> shift) & mask;
}

function decodeBitfield(byte, bitfield) {
  if (!Array.isArray(bitfield)) return [];
  return bitfield.map((field) => {
    let from;
    let to;
    if (typeof field.bits === "string" && field.bits.includes("-")) {
      const [a, b] = field.bits.split("-").map((n) => Number(n.trim()));
      from = Math.max(a, b);
      to = Math.min(a, b);
    } else if (typeof field.bits === "string" || typeof field.bits === "number") {
      from = to = Number(field.bits);
    } else {
      from = field.from;
      to = field.to;
    }
    const raw = bitRange(byte, from, to);
    const width = from - to + 1;
    const bin = raw.toString(2).padStart(width, "0");
    const hex = raw.toString(16).toUpperCase().padStart(Math.ceil(width / 4), "0");
    let meaning = null;
    if (field.map) {
      meaning =
        field.map[bin] ||
        field.map[hex] ||
        field.map[raw] ||
        field.map[String(raw)] ||
        field.map["*"] ||
        null;
    }
    return {
      name: field.name,
      bits: `${from}-${to}`,
      value: hex,
      binary: bin,
      meaning,
      kind: field.kind || null,
    };
  });
}

function decodeParam(def, value) {
  if (!def) return { meaning: null, bits: [] };
  if (typeof def === "string") return { meaning: def, bits: [] };
  const map = def.map || (looksLikeMap(def) ? def : null);
  const meaning = map ? mapLookup(map, value) : null;
  const bits = def.bitfield ? decodeBitfield(value, def.bitfield) : [];
  return { meaning, bits };
}

function looksLikeMap(obj) {
  if (!obj || Array.isArray(obj) || typeof obj !== "object") return false;
  if (obj.map || obj.bitfield || obj.kind || obj.byP1 || obj.fields) return false;
  return Object.keys(obj).length > 0;
}

function pillsFromHits(hits) {
  return hits.map((h) => ({
    name: h.name || h.fid || h.aid || h.tag || "unknown",
    spec: h.spec || "unknown",
  }));
}

function unknownPill(hex) {
  return [{ name: hex, spec: "unknown" }];
}

function decodeFidList(catalog, bytes) {
  const pills = [];
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const fid = toHexByte(bytes[i]) + toHexByte(bytes[i + 1]);
    const hits = lookupFiles(catalog, fid);
    if (hits.length) pills.push(...pillsFromHits(hits));
    else pills.push(...unknownPill(fid));
  }
  if (bytes.length % 2 === 1) {
    pills.push(...unknownPill(toHexByte(bytes[bytes.length - 1])));
  }
  return pills;
}

function decodeData(kind, data, command, catalog) {
  if (!data || !data.length) return { kind: kind || "raw", pills: [], fields: [] };
  const hex = toHexString(data);

  if (kind === "fid") {
    return { kind, pills: decodeFidList(catalog, data), fields: [], hex };
  }
  if (kind === "path") {
    return { kind, pills: decodeFidList(catalog, data), fields: [], hex };
  }
  if (kind === "aid") {
    const hits = lookupAids(catalog, hex.replace(/\s/g, ""));
    return {
      kind,
      pills: hits.length ? pillsFromHits(hits) : unknownPill(hex.replace(/\s/g, "")),
      fields: [],
      hex,
    };
  }
  if (kind === "tag") {
    const hits = lookupTags(catalog, hex.replace(/\s/g, ""));
    return {
      kind,
      pills: hits.length ? pillsFromHits(hits) : unknownPill(hex.replace(/\s/g, "")),
      fields: [],
      hex,
    };
  }
  if (kind === "fields" || (kind && kind.kind === "fields")) {
    const spec = kind.fields || [];
    let offset = 0;
    const fields = [];
    for (const f of spec) {
      if (offset >= data.length) break;
      let slice;
      if (f.length === "rest") {
        slice = data.slice(offset);
        offset = data.length;
      } else {
        const n = Number(f.length) || 0;
        slice = data.slice(offset, offset + n);
        offset += n;
      }
      const fieldHex = toHexString(slice);
      let extra = [];
      if (f.kind === "fid") extra = decodeFidList(catalog, slice);
      else if (f.kind === "aid") {
        const hits = lookupAids(catalog, fieldHex.replace(/\s/g, ""));
        extra = hits.length ? pillsFromHits(hits) : unknownPill(fieldHex.replace(/\s/g, ""));
      } else if (f.map) {
        const meaning = mapLookup(f.map, slice[0]);
        if (meaning) extra = [{ name: meaning, spec: command && command.spec ? command.spec : "catalog" }];
      }
      fields.push({ name: f.name, hex: fieldHex, pills: extra });
    }
    return { kind: "fields", pills: [], fields, hex };
  }
  return { kind: kind || "raw", pills: [], fields: [], hex };
}

function resolveDataKind(dataDef, p1) {
  if (!dataDef) return "raw";
  if (typeof dataDef === "string") return dataDef;
  if (dataDef.kind) return dataDef.kind === "fields" ? dataDef : dataDef.kind;
  if (dataDef.byP1) {
    const hex = toHexByte(p1);
    return dataDef.byP1[hex] || dataDef.byP1["*"] || "raw";
  }
  if (dataDef.fields) return dataDef;
  if (dataDef.map) return "raw";
  return "raw";
}

function decodeCla(cla, catalog) {
  const hex = toHexByte(cla);
  const known = (catalog.cla.values || []).filter((v) => normHex(v.cla) === hex);
  const proprietary = (cla & 0x80) !== 0;
  let bitMeaning;
  if (!proprietary) {
    const sm = (cla >> 2) & 0x03;
    const smMap = {
      0: "No secure messaging",
      1: "Proprietary secure messaging",
      2: "SM, header not authenticated",
      3: "SM, header authenticated",
    };
    bitMeaning = {
      kind: "ISO 7816 interindustry",
      secureMessaging: smMap[sm],
      chaining: !!(cla & 0x10),
      logicalChannel: cla & 0x03,
    };
  } else if ((cla & 0xf0) === 0x80) {
    const smBits = cla & 0x0f;
    const gpSm = {
      0x0: "No SM",
      0x4: "C-MAC",
      0x8: "C-MAC (alternative)",
      0xc: "C-DEC + C-MAC",
      0xd: "C-DEC + C-MAC + R-MAC",
      0x1: "R-MAC",
    };
    bitMeaning = {
      kind: "Proprietary / GlobalPlatform-style",
      secureMessaging: gpSm[smBits] || `CLA nibble ${toHexByte(smBits)}`,
      logicalChannel: 0,
    };
  } else {
    bitMeaning = { kind: "Proprietary", secureMessaging: null, logicalChannel: null };
  }
  return {
    hex,
    pills: known.length ? pillsFromHits(known) : [],
    ...bitMeaning,
  };
}

function sfiFromReadBinary(p1) {
  if ((p1 & 0x80) === 0) return null;
  return p1 & 0x1f;
}

function sfiFromReadRecord(p2) {
  const sfi = (p2 >> 3) & 0x1f;
  return sfi ? sfi : null;
}

function explainCommand(bytes, catalog) {
  const parsed = parseCommand(bytes) || {};
  if (!parsed.ins && parsed.ins !== 0) return null;
  const matches = findCommands(catalog, parsed.cla, parsed.ins, parsed.p1, parsed.p2);
  const best = matches[0] ? matches[0].entry : null;
  const title = best && best.name ? best.name : "CUSTOM APDU";
  const specPills = [];
  const seen = new Set();
  for (const m of matches) {
    const spec = m.entry.spec || "catalog";
    if (seen.has(spec + m.entry.name)) continue;
    seen.add(spec + m.entry.name);
    specPills.push({ name: m.entry.name, spec });
  }

  const claInfo = decodeCla(parsed.cla, catalog);
  const p1Info = decodeParam(best && best.p1, parsed.p1);
  const p2Info = decodeParam(best && best.p2, parsed.p2);
  const dataKind = resolveDataKind(best && best.data, parsed.p1);
  const dataInfo = decodeData(dataKind, parsed.data || [], best, catalog);

  const extraPills = [...dataInfo.pills];
  const p1Pills = [];
  const p2Pills = [];
  const insHex = toHexByte(parsed.ins);
  if (insHex === "B0") {
    const sfi = sfiFromReadBinary(parsed.p1);
    if (sfi != null) {
      const hits = lookupFilesBySfi(catalog, toHexByte(sfi));
      p1Pills.push(...(hits.length ? pillsFromHits(hits) : unknownPill("SFI " + toHexByte(sfi))));
    }
  }
  if (insHex === "B2") {
    const sfi = sfiFromReadRecord(parsed.p2);
    if (sfi != null) {
      const hits = lookupFilesBySfi(catalog, toHexByte(sfi));
      p2Pills.push(...(hits.length ? pillsFromHits(hits) : unknownPill("SFI " + toHexByte(sfi))));
    }
  }
  if (best && /GET DATA|PUT DATA/i.test(best.name || "")) {
    const tag = toHexByte(parsed.p1) + toHexByte(parsed.p2);
    const hits = lookupTags(catalog, tag);
    p1Pills.push(...(hits.length ? pillsFromHits(hits) : unknownPill(tag)));
  }

  const fields = [
    {
      id: "cla",
      name: "CLA",
      hex: toHexByte(parsed.cla),
      meaning: claInfo.kind,
      detail: claInfo,
    },
    {
      id: "ins",
      name: "INS",
      hex: toHexByte(parsed.ins),
      meaning: title,
    },
    {
      id: "p1",
      name: "P1",
      hex: toHexByte(parsed.p1),
      meaning: p1Info.meaning,
      bits: p1Info.bits,
      pills: p1Pills,
    },
    {
      id: "p2",
      name: "P2",
      hex: toHexByte(parsed.p2),
      meaning: p2Info.meaning,
      bits: p2Info.bits,
      pills: p2Pills,
    },
  ];
  if (parsed.lc) {
    fields.push({
      id: "lc",
      name: "Lc",
      hex: toHexString(parsed.lcRaw || [parsed.lc]),
      meaning: `${parsed.lc} data byte${parsed.lc === 1 ? "" : "s"}`,
    });
  }
  if (parsed.data && parsed.data.length) {
    fields.push({
      id: "data",
      name: "DATA",
      hex: toHexString(parsed.data),
      meaning: typeof dataKind === "string" ? dataKind : dataKind.kind,
      pills: dataInfo.pills.concat(extraPills),
      parts: dataInfo.fields,
    });
  } else if (dataInfo.pills.length || extraPills.length) {
    fields.push({
      id: "data",
      name: "DATA",
      hex: "",
      meaning: "from P1/P2",
      pills: dataInfo.pills.concat(extraPills),
    });
  }
  if (parsed.le != null) {
    fields.push({
      id: "le",
      name: "Le",
      hex: toHexString(parsed.leRaw || []),
      meaning: `Expect up to ${parsed.le} response byte${parsed.le === 1 ? "" : "s"}`,
    });
  }

  return {
    title,
    summary: best && best.summary ? best.summary : null,
    specPills,
    known: !!best,
    case: parsed.case,
    extended: !!parsed.extended,
    fields,
    claInfo,
  };
}

function explainResponse(bytes, catalog) {
  const data = bytes.slice(0, bytes.length - 2);
  const sw1 = bytes[bytes.length - 2];
  const sw2 = bytes[bytes.length - 1];
  const sw = toHexByte(sw1) + toHexByte(sw2);
  const hits = lookupStatusWords(catalog, sw);
  const title = hits.length ? hits[0].name : "Response APDU";
  return {
    title: hits.length ? `SW ${sw}` : "Response APDU",
    summary: hits.length ? hits.map((h) => h.name).join(" · ") : "Trailing two bytes treated as status word.",
    specPills: hits.length ? pillsFromHits(hits) : unknownPill(sw),
    known: hits.length > 0,
    fields: [
      ...(data.length
        ? [{ id: "data", name: "DATA", hex: toHexString(data), meaning: "Response data" }]
        : []),
      {
        id: "sw",
        name: "SW",
        hex: `${toHexByte(sw1)} ${toHexByte(sw2)}`,
        meaning: title,
        pills: hits.length ? pillsFromHits(hits) : unknownPill(sw),
      },
    ],
  };
}

function lensTitle(explanation) {
  if (!explanation) return "CUSTOM APDU";
  if (explanation.role === "response") {
    const swField = explanation.fields.find((f) => f.id === "sw");
    return swField ? `SW ${swField.hex.replace(/\s/g, "")}` : "Response APDU";
  }
  return explanation.title || "CUSTOM APDU";
}

function explain(bytes, catalog) {
  const classified = classify(bytes, catalog.swIndex);
  const hex = toHexBytes(bytes);

  if (classified.kind === "response") {
    const body = explainResponse(bytes, catalog);
    return {
      role: "response",
      confidence: classified.responseScore >= 6 ? "high" : "medium",
      bytes: hex,
      ...body,
    };
  }

  const commandBody = classified.command ? explainCommand(bytes, catalog) : null;
  if (!commandBody) {
    const fallback = bytes.length >= 2 ? explainResponse(bytes, catalog) : null;
    return {
      role: fallback ? "response" : "unknown",
      confidence: "low",
      bytes: hex,
      title: fallback ? fallback.title : "CUSTOM APDU",
      summary: "Could not parse a standard command case.",
      specPills: [],
      known: false,
      fields: fallback ? fallback.fields : [{ id: "raw", name: "BYTES", hex: toHexString(bytes) }],
    };
  }

  return {
    role: classified.kind === "ambiguous" ? "ambiguous" : "command",
    confidence: classified.commandScore >= 5 ? "high" : "medium",
    bytes: hex,
    alternate:
      classified.kind === "ambiguous" && classified.response
        ? explainResponse(bytes, catalog)
        : null,
    ...commandBody,
  };
}

module.exports = {
  explain,
  lensTitle,
  decodeCla,
};
