# APDU Explainer

Local VS Code / Cursor extension that detects hex APDUs in the editor and explains them (CodeLens, hover, highlight, and a bottom panel). No marketplace install and no VSIX — copy the extension folder into your editor’s extensions directory.

## Find the extensions folder

Do not assume `~/.vscode`. Cursor, VS Code Insiders, VSCodium, portable builds, and remote servers all use different paths. Some machines have no `~/.vscode` at all.

**Use the editor to open the folder it actually uses:**

1. Open VS Code or Cursor.
2. Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS).
3. Run **Extensions: Open Extensions Folder**.

That opens this editor’s extensions directory. Copy into *that* folder.

If the command is missing, typical locations are:

| Editor | Extensions folder |
| --- | --- |
| VS Code | `~/.vscode/extensions` (Windows: `%USERPROFILE%\.vscode\extensions`) |
| VS Code Insiders | `~/.vscode-insiders/extensions` |
| VSCodium / Code - OSS | `~/.vscode-oss/extensions` |
| Cursor | `~/.cursor/extensions` (Windows: `%USERPROFILE%\.cursor\extensions`) |
| Portable VS Code | `data/extensions` next to the app (macOS: `code-portable-data/extensions`) |
| Remote SSH / WSL | `~/.vscode-server/extensions` (Insiders: `~/.vscode-server-insiders/extensions`) |

If the editor was started with `--extensions-dir`, that path wins. The Command Palette command still shows the live folder.

## Install

Copy the **`anki.apdu-explainer-0.0.1`** folder (not the whole repo) into the extensions directory you opened above. Keep that folder name; VS Code requires `publisher.name-version`.

Example after **Extensions: Open Extensions Folder** already put you in the right place:

```bash
cp -R anki.apdu-explainer-0.0.1 /path/to/the/extensions/folder/
```

A symlink works too, if you want to keep developing from this repo:

```bash
ln -s /absolute/path/to/apdu-explainer/anki.apdu-explainer-0.0.1 /path/to/the/extensions/folder/anki.apdu-explainer-0.0.1
```

Then reload:

1. Command Palette → **Developer: Reload Window**.
2. Confirm **APDU Explainer** appears under Extensions (installed, not Marketplace).

Repeat the copy/symlink for each editor you use (for example both VS Code and Cursor).

## Use

Open a file with spaced hex, `0xAA 0xBB`, or `0xAA, 0xBB` (see `samples/`). Detected APDUs get a highlight, a CodeLens (`Command APDU:` / `Response APDU:`), and a hover. Click the CodeLens, or select hex and use **Explain APDU** from the editor context menu, to open the bottom **APDU Explainer** panel.

CodeLens follows the editor settings:

- `editor.codeLens` — show or hide
- `editor.codeLensFontSize` — label size

Hex highlighting: `apduExplainer.enableDecorations`.

Custom entries go in `anki.apdu-explainer-0.0.1/catalog/custom/` and overlay the shipped catalogs. Drop a `.json` file there and reload (or save; the folder is watched).
