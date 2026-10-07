"use strict";

const vscode = require("vscode");
const { loadCatalog } = require("./src/catalog");
const { getSpans, spanAt, parseSelection } = require("./src/detect");
const { explain } = require("./src/explain");
const { renderHtml, emptyHtml, compactMarkdown } = require("./src/panel");
const path = require("path");

let catalog;
let detailsView;
let lastExplanation;
let decorationType;
let paddingType;
let onDidChangeCodeLenses;

function codeLensSettings() {
  const cfg = vscode.workspace.getConfiguration("apduExplainer");
  const nested = cfg.get("codeLens") || {};
  return {
    enabled: nested.enabled !== false,
    fontSize: Number(nested.fontSize) > 0 ? Number(nested.fontSize) : 11,
    paddingTop: Math.max(0, Number(nested.paddingTop) || 0),
  };
}

function catalogRoot(context) {
  return path.join(context.extensionPath, "catalog");
}

function reloadCatalog(context) {
  catalog = loadCatalog(catalogRoot(context));
}

function configureWebview(webview, context) {
  webview.options = {
    enableScripts: false,
    localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "media")],
  };
}

function setDetailsHtml(context, explanation) {
  if (!detailsView) return;
  detailsView.title = explanation ? explanation.title : "APDU Explainer";
  detailsView.description = explanation ? explanation.title : undefined;
  detailsView.webview.html = explanation
    ? renderHtml(explanation, detailsView.webview, context.extensionUri)
    : emptyHtml(detailsView.webview, context.extensionUri);
}

function showExplanation(context, explanation) {
  if (!explanation) {
    vscode.window.showErrorMessage("Could not explain that APDU.");
    return;
  }
  lastExplanation = explanation;
  setDetailsHtml(context, explanation);
  vscode.commands.executeCommand("apduExplainer.details.focus");
}

function explainBytes(context, bytes) {
  if (!bytes || bytes.length < 2) {
    vscode.window.showErrorMessage("Selection is not a valid hex APDU (need at least two bytes).");
    return;
  }
  showExplanation(context, explain(bytes, catalog));
}

function recreatePaddingType() {
  if (paddingType) {
    paddingType.dispose();
    paddingType = undefined;
  }
  const { enabled, paddingTop } = codeLensSettings();
  if (!enabled || paddingTop <= 0) return;
  paddingType = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    borderWidth: `${paddingTop}px 0 0 0`,
    borderStyle: "solid",
    borderColor: "transparent",
  });
}

function syncCodeLensFontSize() {
  const { fontSize } = codeLensSettings();
  const editorCfg = vscode.workspace.getConfiguration("editor");
  if (editorCfg.get("codeLensFontSize") !== fontSize) {
    editorCfg.update("codeLensFontSize", fontSize, vscode.ConfigurationTarget.Workspace);
  }
}

function updateDecorations(editor) {
  if (!editor || !decorationType) return;
  const cfg = vscode.workspace.getConfiguration("apduExplainer");
  const { enabled, paddingTop } = codeLensSettings();
  const spans = getSpans(editor.document, catalog);
  editor.setDecorations(
    decorationType,
    cfg.get("enableDecorations", true) ? spans.map((s) => ({ range: s.range })) : []
  );
  if (paddingType) {
    const lines = new Set(spans.map((s) => s.range.start.line));
    editor.setDecorations(
      paddingType,
      enabled && paddingTop > 0
        ? [...lines].map((line) => ({
            range: new vscode.Range(line, 0, line, 0),
          }))
        : []
    );
  }
}

function lensKindPrefix(span) {
  if (span.explanation && span.explanation.role === "response") return "Response APDU";
  return "Command APDU";
}

function lensTitleFor(document, span) {
  const counts = getSpans(document, catalog).filter(
    (s) => s.range.start.line === span.range.start.line && s.title === span.title
  ).length;
  const name = counts > 1 ? `${span.title}  ${(span.explanation.bytes || []).slice(0, 4).join(" ")}` : span.title;
  return `${lensKindPrefix(span)}: ${name}`;
}

function activate(context) {
  reloadCatalog(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "apduExplainer.details",
      {
        resolveWebviewView(webviewView) {
          detailsView = webviewView;
          configureWebview(webviewView.webview, context);
          setDetailsHtml(context, lastExplanation);
          webviewView.onDidDispose(() => {
            if (detailsView === webviewView) detailsView = undefined;
          });
        },
      },
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  decorationType = vscode.window.createTextEditorDecorationType({
    borderRadius: "3px",
    backgroundColor: new vscode.ThemeColor("editor.wordHighlightBackground"),
    overviewRulerColor: new vscode.ThemeColor("editorOverviewRuler.infoForeground"),
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    light: { backgroundColor: "rgba(88, 132, 255, 0.16)" },
    dark: { backgroundColor: "rgba(120, 170, 255, 0.22)" },
  });

  onDidChangeCodeLenses = new vscode.EventEmitter();

  context.subscriptions.push(
    vscode.commands.registerCommand("apduExplainer.explain", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const bytes = parseSelection(editor.document, editor.selection);
      explainBytes(context, bytes);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("apduExplainer.explainRange", (arg) => {
      const editor = vscode.window.activeTextEditor;
      if (arg && arg.uri) {
        const uri = vscode.Uri.parse(arg.uri);
        vscode.workspace.openTextDocument(uri).then((doc) => {
          const range = new vscode.Range(
            arg.start.line,
            arg.start.character,
            arg.end.line,
            arg.end.character
          );
          const bytes = parseSelection(doc, range);
          explainBytes(context, bytes);
        });
        return;
      }
      if (!editor) return;
      const bytes = parseSelection(editor.document, editor.selection);
      explainBytes(context, bytes);
    })
  );

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider([{ scheme: "file" }, { scheme: "untitled" }], {
      onDidChangeCodeLenses: onDidChangeCodeLenses.event,
      provideCodeLenses(document) {
        if (!codeLensSettings().enabled) {
          return [];
        }
        return getSpans(document, catalog).map((span) => {
          return new vscode.CodeLens(span.range, {
            title: lensTitleFor(document, span),
            tooltip: "Open APDU explanation",
            command: "apduExplainer.explainRange",
            arguments: [
              {
                uri: document.uri.toString(),
                start: {
                  line: span.range.start.line,
                  character: span.range.start.character,
                },
                end: {
                  line: span.range.end.line,
                  character: span.range.end.character,
                },
              },
            ],
          });
        });
      },
    })
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider([{ scheme: "file" }, { scheme: "untitled" }], {
      provideHover(document, position) {
        const span = spanAt(document, position, catalog);
        if (!span) return undefined;
        const md = compactMarkdown(span.explanation);
        const arg = encodeURIComponent(
          JSON.stringify([
            {
              uri: document.uri.toString(),
              start: {
                line: span.range.start.line,
                character: span.range.start.character,
              },
              end: {
                line: span.range.end.line,
                character: span.range.end.character,
              },
            },
          ])
        );
        md.appendMarkdown(`\n\n[Open full explanation](command:apduExplainer.explainRange?${arg})`);
        return new vscode.Hover(md, span.range);
      },
    })
  );

  const refresh = () => {
    if (vscode.window.activeTextEditor) updateDecorations(vscode.window.activeTextEditor);
    if (onDidChangeCodeLenses) onDidChangeCodeLenses.fire();
  };

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(refresh),
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
        updateDecorations(vscode.window.activeTextEditor);
      }
      if (onDidChangeCodeLenses) onDidChangeCodeLenses.fire();
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("apduExplainer.codeLens")) {
        recreatePaddingType();
        syncCodeLensFontSize();
        refresh();
      } else if (e.affectsConfiguration("apduExplainer")) {
        refresh();
      }
    }),
    decorationType,
    onDidChangeCodeLenses
  );

  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(vscode.Uri.file(catalogRoot(context)), "custom/*.json")
  );
  const reload = () => {
    reloadCatalog(context);
    refresh();
  };
  watcher.onDidChange(reload);
  watcher.onDidCreate(reload);
  watcher.onDidDelete(reload);
  context.subscriptions.push(watcher);

  recreatePaddingType();
  syncCodeLensFontSize();
  refresh();
}

function deactivate() {
  if (paddingType) paddingType.dispose();
}

module.exports = { activate, deactivate };
