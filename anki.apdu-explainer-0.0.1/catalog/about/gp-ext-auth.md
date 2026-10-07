GP EXTERNAL AUTHENTICATE finishes the secure channel started by INITIALIZE UPDATE. Command data is the host cryptogram.

## Requested security level (P1)

| P1 | Level |
|----|--------|
| `00` | No SM |
| `01` | C-MAC |
| `03` | C-DECRYPTION and C-MAC |
| `15` | C-MAC and R-MAC |
| `33` | C-DECRYPTION, C-MAC, R-MAC |

After `90 00`, later APDUs use the matching CLA SM bits (`84`, …).

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Channel established |
| `6300` | Cryptogram failed |
