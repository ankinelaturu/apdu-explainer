TERMINAL PROFILE (CLA `80`, INS `10`) tells the UICC which SIM Toolkit / USAT facilities the terminal supports. Command data is a bit-mapped capability list. Sent once after ATR / PROFILE DOWNLOAD.

## After `91 xx`

FETCH the pending proactive command, then TERMINAL RESPONSE.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Accepted |
| `91 xx` | Proactive command pending — FETCH |
