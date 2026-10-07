OpenPGP GET DATA (INS `CA`) reads application data objects. P1-P2 is the tag.

## Tags you will see

| P1-P2 | Object |
|-------|--------|
| `5F 52` | Historical bytes |
| `C0`–`C2` | Public-key data objects |
| `C4` | PW status bytes |
| `5E` | Login data |

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Object returned |
| `6A 88` | Tag not found |
