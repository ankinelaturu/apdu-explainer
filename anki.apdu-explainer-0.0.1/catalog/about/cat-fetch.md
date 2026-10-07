## What it does

FETCH (CLA `80`, INS `12`) retrieves a pending **proactive command** after the card returned `91 xx`. Le should be `xx`. The terminal then performs the proactive command and answers with TERMINAL RESPONSE.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Proactive command in DATA |
| `91 xx` | Another command already pending |
