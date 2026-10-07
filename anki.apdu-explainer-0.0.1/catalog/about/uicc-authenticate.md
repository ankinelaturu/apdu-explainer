UICC AUTHENTICATE (INS `88` / odd `89`) runs the USIM / ISIM / GSM authentication algorithm.

## RAND and AUTN in DATA

Command data is RAND (and AUTN for UMTS/EPS/5G). Success returns RES / CK / IK, or GSM SRES/Kc, or AUTS on sync failure.

## MF vs DF (P2)

P2 encodes MF vs DF-specific (bit 8) and the reference number (bits 5–1).

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Authentication output in DATA |
| `9862` | Authentication error (profile-specific) |
| `6982` | Access conditions |
