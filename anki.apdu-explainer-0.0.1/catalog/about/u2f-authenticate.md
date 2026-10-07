U2F_AUTHENTICATE (INS `02`) signs a challenge with an existing key handle.

## Presence mode (P1)

| P1 | Mode |
|----|------|
| `03` | Enforce user presence and sign |
| `07` | Check-only (no sign) |
| `08` | Sign without enforcing presence |

Data is `challenge hash || application hash || key-handle length || key handle`. Response is user-presence byte, counter, signature.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Signed |
| `6A 80` | Unknown key handle |
| `6985` | User presence required |
