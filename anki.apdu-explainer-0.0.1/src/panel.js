"use strict";

const vscode = require("vscode");

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

function partsHtml(parts) {
  if (!parts || !parts.length) return "";
  return `<div class="parts">${parts
    .map(
      (p) =>
        `<div class="part"><div class="part-name">${esc(p.name)}</div><div class="mono">${esc(
          p.hex
        )}</div>${pillHtml(p.pills)}</div>`
    )
    .join("")}</div>`;
}

function fieldCard(field) {
  return `<section class="field field-${esc(field.id)}">
    <div class="field-head">
      <span class="tag tag-${esc(field.id)}">${esc(field.name)}</span>
      <span class="mono">${esc(field.hex)}</span>
    </div>
    ${field.meaning ? `<p class="meaning">${esc(field.meaning)}</p>` : ""}
    ${pillHtml(field.pills)}
    ${bitsHtml(field.bits)}
    ${partsHtml(field.parts)}
  </section>`;
}

function bodyFor(explanation) {
  const specs = pillHtml(explanation.specPills);
  const bytes = `<div class="bytes mono">${esc((explanation.bytes || []).join(" "))}</div>`;
  const alt = explanation.alternate
    ? `<details class="alt"><summary>Also plausible as a response APDU</summary>${explanation.alternate.fields
        .map(fieldCard)
        .join("")}</details>`
    : "";
  return `
    <header>
      <div class="kicker">${esc(explanation.role || "command")} · ${esc(explanation.confidence || "")}</div>
      <h1>${esc(explanation.title)}</h1>
      ${specs}
      ${explanation.summary ? `<p class="summary">${esc(explanation.summary)}</p>` : ""}
      ${bytes}
    </header>
    <div class="fields">${(explanation.fields || []).map(fieldCard).join("")}</div>
    ${alt}
  `;
}

function shellHtml(webview, extensionUri, title, inner) {
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

function compactMarkdown(explanation) {
  const md = new vscode.MarkdownString();
  md.isTrusted = true;
  md.supportHtml = false;
  const specs = (explanation.specPills || []).map((p) => `${p.name} (${p.spec})`).join(" · ");
  md.appendMarkdown(`**${explanation.title}**\n\n`);
  if (specs) md.appendMarkdown(`${specs}\n\n`);
  if (explanation.summary) md.appendMarkdown(`${explanation.summary}\n\n`);
  md.appendMarkdown("`" + (explanation.bytes || []).join(" ") + "`\n\n");
  for (const f of explanation.fields || []) {
    const extra = f.meaning ? ` — ${f.meaning}` : "";
    md.appendMarkdown(`- **${f.name}** \`${f.hex}\`${extra}\n`);
    if (f.pills && f.pills.length) {
      md.appendMarkdown(
        `  - ${f.pills.map((p) => `${p.name} _${p.spec}_`).join(", ")}\n`
      );
    }
  }
  return md;
}

module.exports = {
  renderHtml,
  emptyHtml,
  compactMarkdown,
};
