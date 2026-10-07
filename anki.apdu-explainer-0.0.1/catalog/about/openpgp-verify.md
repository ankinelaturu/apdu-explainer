## What it does

OpenPGP VERIFY presents PW1 or PW3. P2 chooses the password. Empty VERIFY checks whether that password is already satisfied for this session.

| P2 | Password |
| --- | --- |
| `81` | PW1 — signing |
| `82` | PW1 — other commands (decrypt / auth) |
| `83` | PW3 — admin |

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Verified |
| `63 Cx` | Wrong PIN; tries left |
| `6983` | Blocked |
