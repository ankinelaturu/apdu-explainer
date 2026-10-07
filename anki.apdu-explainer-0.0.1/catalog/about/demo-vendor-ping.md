## What it does

DEMO VENDOR PING is the sample **custom** command shipped with this extension (`catalog/custom/demo.json`). Copy that JSON (and this page) to name your own proprietary APDUs.

CLA `80`, INS `EE`. P1 `00` echo / `01` version query. Data is a 2-byte token plus payload.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | OK |
| `9F 81` | Demo vendor busy |
