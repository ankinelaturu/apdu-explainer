## What it does

TERMINAL PROFILE (CLA `80`, INS `10`) tells the UICC which SIM Toolkit / USAT facilities the terminal supports. Command data is a bit-mapped capability list. Sent once after ATR / PROFILE DOWNLOAD.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Accepted |
| `91 xx` | Proactive command pending — FETCH |
