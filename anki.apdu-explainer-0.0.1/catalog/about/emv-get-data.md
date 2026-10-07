EMV GET DATA (INS `CA`, proprietary CLA `80`) reads a few well-known tags without going through record files.

## Tags in P1-P2

| P1-P2 | Object |
|-------|--------|
| `9F 36` | Application Transaction Counter |
| `9F 13` | Last online ATC |
| `9F 17` | PIN try counter |
| `9F 4F` | Log format |

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Value returned |
| `6A 88` | Tag not available |
