"use strict";

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripFrontmatter(src) {
  const text = String(src || "").replace(/^\uFEFF/, "");
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) return text;
  const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return match ? text.slice(match[0].length) : text;
}

function inline(text) {
  const codes = [];
  let s = String(text).replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\0C${codes.length - 1}\0`;
  });
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/\0C(\d+)\0/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
  return s;
}

function isTableRow(line) {
  return /^\s*\|.*\|\s*$/.test(line);
}

function isTableSep(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

function renderMarkdown(src) {
  const lines = stripFrontmatter(src).replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;

  const flushPara = (buf) => {
    const text = buf.join(" ").trim();
    if (text) out.push(`<p>${inline(text)}</p>`);
    buf.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2].trim())}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      out.push("<hr />");
      i += 1;
      continue;
    }

    if (/^```/.test(line.trim())) {
      const code = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        code.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
      continue;
    }

    if (isTableRow(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const body = [];
      while (i < lines.length && isTableRow(lines[i])) {
        body.push(splitRow(lines[i]));
        i += 1;
      }
      const thead = `<thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${body
        .map((row) => `<tr>${row.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody>`;
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ""))}</li>`);
        i += 1;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ""))}</li>`);
        i += 1;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim()) {
      if (
        /^(#{1,3})\s+/.test(lines[i]) ||
        /^\s*[-*]\s+/.test(lines[i]) ||
        /^\s*\d+\.\s+/.test(lines[i]) ||
        /^```/.test(lines[i].trim()) ||
        /^---+$/.test(lines[i].trim()) ||
        (isTableRow(lines[i]) && i + 1 < lines.length && isTableSep(lines[i + 1]))
      ) {
        break;
      }
      para.push(lines[i].trim());
      i += 1;
    }
    flushPara(para);
  }

  return out.join("\n");
}

module.exports = {
  renderMarkdown,
  stripFrontmatter,
};
