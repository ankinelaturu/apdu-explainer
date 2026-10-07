GET STATUS lists GP registry entries: ISD, applications/SSD, or executable load files.

## What to list (P1)

| P1 | Scope |
|----|--------|
| `80` | Issuer Security Domain |
| `40` | Applications / SSD |
| `20` | Executable load files |
| `10` | Load files and modules |

P2 `00` = first/all, `01` = next. Command data is an AID search TLV (often `4F 00` for all).

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | List returned |
| `6A 88` | No more entries |
