"use strict";

const { renderMarkdown } = require("./markdown");

function vscodeApi() {
  return require("vscode");
}

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pillHtml(pills) {
  if (!pills || !pills.length) return "";
  return `<div class="pills">${pills
    .map(
      (p) =>
        `<span class="chip"><span class="chip-name">${esc(p.name)}</span><span class="chip-spec">${esc(
          p.spec
        )}</span></span>`
    )
    .join("")}</div>`;
}

const HEX_PER_LINE = 16;

function hexRows(hex, perLine) {
  const bytes = String(hex || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const lines = [];
  for (let i = 0; i < bytes.length; i += perLine) {
    lines.push(bytes.slice(i, i + perLine).join(" "));
  }
  return lines;
}

function fieldNoteHtml(field) {
  const pills = pillHtml(field.pills);
  const meaningText = field.meaning ? String(field.meaning) : "";
  const pillTextValue = pillText(field.pills);
  let meaning = "";
  if (meaningText) {
    const skip =
      pillTextValue &&
      (pillTextValue === meaningText ||
        pillTextValue.startsWith(`${meaningText} `) ||
        pillTextValue.startsWith(`${meaningText} (`));
    if (!skip) meaning = `<span class="meaning">${esc(meaningText)}</span>`;
  }
  const bits = bitsHtml(field.bits);
  if (!meaning && !pills && !bits) return "";
  return `${meaning}${pills}${bits}`;
}

function fieldNameCell(field) {
  return `<th scope="row"><span class="tag tag-${esc(field.id)}">${esc(field.name)}</span></th>`;
}

function tableRow(nameCell, value, note, extraClass, valueClass) {
  const cls = extraClass ? ` class="${extraClass}"` : "";
  const vcls = valueClass || "val mono";
  return `<tr${cls}>${nameCell}<td class="${vcls}">${esc(value || "")}</td><td class="note">${
    note || ""
  }</td></tr>`;
}

function dataHexRow(line) {
  return `<tr class="data-hex"><th></th><td class="val mono" colspan="2">${esc(line)}</td></tr>`;
}

function dataKindLabel(meaning) {
  const s = String(meaning || "");
  if (/^(aid|fid|tag|path|raw|fields)$/i.test(s)) return s.toUpperCase();
  return s;
}

function dataFieldRows(field) {
  const rows = [];
  rows.push(
    tableRow(
      fieldNameCell(field),
      dataKindLabel(field.meaning),
      pillHtml(field.pills),
      "data-kind",
      "val"
    )
  );
  for (const line of hexRows(field.hex, HEX_PER_LINE)) {
    rows.push(dataHexRow(line));
  }
  for (const part of field.parts || []) {
    const lines = hexRows(part.hex, HEX_PER_LINE);
    rows.push(
      tableRow(`<th class="part">${esc(part.name)}</th>`, lines[0] || "", pillHtml(part.pills), "data-part")
    );
    for (const line of lines.slice(1)) {
      rows.push(dataHexRow(line));
    }
  }
  return rows.join("");
}

function fieldsTable(fields) {
  if (!fields || !fields.length) return "";
  const chunks = [];
  let current = [];
  const flush = () => {
    if (!current.length) return;
    chunks.push(`<tbody>${current.join("")}</tbody>`);
    current = [];
  };
  for (const field of fields) {
    if (field.id === "data") {
      flush();
      chunks.push(`<tbody class="data">${dataFieldRows(field)}</tbody>`);
      continue;
    }
    current.push(tableRow(fieldNameCell(field), field.hex, fieldNoteHtml(field)));
  }
  flush();
  return `<table class="apdu"><colgroup><col class="col-name" /><col class="col-val" /><col class="col-note" /></colgroup>${chunks.join(
    ""
  )}</table>`;
}

const SPEC_PILL_COLORS = {
  "ISO 7816-4": ["#3d5a80", "#eaf2ff"],
  "ISO 7816-8": ["#35506f", "#eaf2ff"],
  "ISO 7816-9": ["#2f4864", "#eaf2ff"],
  eMRTD: ["#1b7a4a", "#d8f5e3"],
  EMV: ["#8a4b12", "#ffe8cc"],
  GlobalPlatform: ["#5b4a86", "#eee6ff"],
  "NIST PIV": ["#7a3e3e", "#ffdede"],
  "ETSI TS 102 221": ["#0e6b72", "#d4f4f7"],
  "ETSI TS 102 223": ["#0b5c62", "#d4f4f7"],
  "OpenPGP Card": ["#2f5d73", "#d6eef8"],
  U2F: ["#4a5a2a", "#eaf3c8"],
};

const SPEC_PILL_TONES = [
  ["#3d5a80", "#eaf2ff"],
  ["#1b7a4a", "#d8f5e3"],
  ["#8a4b12", "#ffe8cc"],
  ["#5b4a86", "#eee6ff"],
  ["#7a3e3e", "#ffdede"],
  ["#0e6b72", "#d4f4f7"],
  ["#2f5d73", "#d6eef8"],
  ["#4a5a2a", "#eaf3c8"],
];

function specTone(spec) {
  let h = 0;
  for (const c of String(spec)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % SPEC_PILL_TONES.length;
}

function specSlug(spec) {
  return (
    String(spec)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "other"
  );
}

function specColor(spec) {
  return SPEC_PILL_COLORS[spec] || SPEC_PILL_TONES[specTone(spec)];
}

function uniqueSpecs(explanation) {
  const seen = new Set();
  const specs = [];
  for (const p of explanation.specPills || []) {
    const spec = p.spec || p.name;
    if (!spec || seen.has(spec)) continue;
    seen.add(spec);
    specs.push(spec);
  }
  return specs;
}

function specPillsHtml(specs) {
  if (!specs.length) return "";
  return `<div class="spec-pills">${specs
    .map((spec) => {
      const [bg, fg] = specColor(spec);
      return `<span class="spec-chip spec-${esc(specSlug(spec))} spec-tone-${specTone(
        spec
      )}" style="background:${bg};color:${fg}">${esc(spec)}</span>`;
    })
    .join("")}</div>`;
}

function specPillsHoverHtml(specs) {
  if (!specs.length) return "";
  return specs.map(specPillMarkdownImage).join(" ");
}

function specPillMarkdownImage(spec) {
  const [bg, fg] = specColor(spec);
  const label = String(spec);
  const width = Math.max(32, Math.ceil(label.length * 5.9 + 14));
  const height = 16;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<rect width="${width}" height="${height}" rx="8" fill="${bg}"/>` +
    `<text x="${(width / 2).toFixed(1)}" y="11.5" text-anchor="middle" font-size="9" font-family="-apple-system,Segoe UI,Helvetica,sans-serif" font-weight="400" fill="${fg}">${esc(
      label
    )}</text>` +
    `</svg>`;
  return `![${label}](data:image/svg+xml;utf8,${encodeURIComponent(svg)})`;
}

function bitsHtml(bits) {
  if (!bits || !bits.length) return "";
  return `<table class="bits"><tbody>${bits
    .map(
      (b) =>
        `<tr><td class="k">b${esc(b.bits)}</td><td class="v">${esc(b.binary)} (${esc(b.value)})</td><td>${esc(
          b.name
        )}${b.meaning ? " — " + esc(b.meaning) : ""}</td></tr>`
    )
    .join("")}</tbody></table>`;
}

function aboutHtml(explanation) {
  if (explanation.aboutMarkdown) {
    return `<section class="about">${renderMarkdown(explanation.aboutMarkdown)}</section>`;
  }
  const name = explanation.title || "this APDU";
  const role = explanation.role === "response" ? "status word" : "command";
  return `<section class="about">
    <h2>About this ${esc(role)}</h2>
    <p class="placeholder">No teaching page yet for ${esc(name)}.</p>
  </section>`;
}

function bodyFor(explanation) {
  const specs = specPillsHtml(uniqueSpecs(explanation));
  const table = fieldsTable(explanation.fields);
  const alt = explanation.alternate
    ? `<details class="alt"><summary>Also plausible as a response APDU</summary>${fieldsTable(
        explanation.alternate.fields
      )}</details>`
    : "";
  return `
    <header>
      <h1>${esc(explanation.title)}</h1>
      ${specs}
      ${explanation.summary ? `<p class="summary">${esc(explanation.summary)}</p>` : ""}
    </header>
    ${table ? `<div class="instance">${table}${alt}</div>` : alt}
    ${aboutHtml(explanation)}
  `;
}

function shellHtml(webview, extensionUri, title, inner) {
  const vscode = vscodeApi();
  const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "panel.css"));
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource};" />
  <link rel="stylesheet" href="${cssUri}" />
  <title>${esc(title)}</title>
</head>
<body>
  ${inner}
</body>
</html>`;
}

function renderHtml(explanation, webview, extensionUri) {
  return shellHtml(webview, extensionUri, explanation.title, bodyFor(explanation));
}

function emptyHtml(webview, extensionUri) {
  return shellHtml(
    webview,
    extensionUri,
    "APDU Explainer",
    `<header>
      <div class="kicker">APDU Explainer</div>
      <h1>No APDU selected</h1>
      <p class="summary">Click an APDU CodeLens, hover and open the explanation, or right-click a hex selection.</p>
    </header>`
  );
}

const HOVER_NAME_W = 6;
const HOVER_VAL_W = 8;
const HOVER_HEX_PER_LINE = 16;

function padCol(text, width) {
  const s = String(text == null ? "" : text);
  return s.length >= width ? `${s} ` : s.padEnd(width, " ");
}

function pillText(pills) {
  if (!pills || !pills.length) return "";
  const seen = new Set();
  const out = [];
  for (const p of pills) {
    const key = `${p.name}|${p.spec || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p.spec ? `${p.name} (${p.spec})` : p.name);
  }
  return out.join(", ");
}

function fieldNote(field) {
  const pills = pillText(field.pills);
  const meaning = field.meaning ? String(field.meaning) : "";
  if (!pills) return meaning;
  if (!meaning) return pills;
  if (pills === meaning || pills.startsWith(`${meaning} `) || pills.startsWith(`${meaning} (`)) return pills;
  return `${meaning}  ${pills}`;
}

function compactMarkdown(explanation) {
  const vscode = vscodeApi();
  const md = new vscode.MarkdownString();
  md.isTrusted = true;
  md.supportHtml = true;
  const specs = uniqueSpecs(explanation);
  md.appendMarkdown(`**${explanation.title}**\n\n`);
  if (specs.length) md.appendMarkdown(`${specPillsHoverHtml(specs)}\n\n`);
  if (explanation.summary) md.appendMarkdown(`${explanation.summary}\n\n`);

  const rows = [];
  for (const f of explanation.fields || []) {
    const pills = pillText(f.pills);
    if (f.id === "data") {
      rows.push(padCol(f.name, HOVER_NAME_W) + padCol(f.meaning || "", HOVER_VAL_W) + pills);
      for (const line of hexRows(f.hex, HOVER_HEX_PER_LINE)) {
        rows.push(padCol("", HOVER_NAME_W) + line);
      }
      continue;
    }
    rows.push(padCol(f.name, HOVER_NAME_W) + padCol(f.hex || "", HOVER_VAL_W) + fieldNote(f));
  }
  if (rows.length) md.appendCodeblock(rows.join("\n"), "text");
  return md;
}

module.exports = {
  renderHtml,
  emptyHtml,
  compactMarkdown,
  bodyFor,
};
