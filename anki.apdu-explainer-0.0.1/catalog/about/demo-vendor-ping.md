DEMO VENDOR PING is the sample **custom** command shipped with this extension (`catalog/custom/demo.json`). Copy that JSON (and this page) to name your own proprietary APDUs.

## P1 — echo vs version

| P1 | Meaning |
|----|---------|
| `00` | Echo |
| `01` | Version query |

CLA `80`, INS `EE`. P2 `00`. Data is a 2-byte token plus payload.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | OK |
| `9F 81` | Demo vendor busy |
