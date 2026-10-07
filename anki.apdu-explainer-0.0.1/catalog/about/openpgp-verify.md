OpenPGP VERIFY presents PW1 or PW3. Empty VERIFY checks whether that password is already satisfied for this session.

## Which password (P2)

| P2 | Password |
|----|----------|
| `81` | PW1 — signing |
| `82` | PW1 — other commands (decrypt / auth) |
| `83` | PW3 — admin |

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Verified |
| `63 Cx` | Wrong PIN; tries left |
| `6983` | Blocked |
