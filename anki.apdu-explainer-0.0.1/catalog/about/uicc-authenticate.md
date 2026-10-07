## What it does

UICC AUTHENTICATE (INS `88` / odd `89`) runs the USIM/ISIM/GSM authentication algorithm. Command data is RAND (and AUTN for UMTS/EPS/5G). P2 encodes MF vs DF-specific and the reference number.

Success returns RES / CK / IK or a GSM SRES/Kc, or AUTS on sync failure.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Authentication output in DATA |
| `9862` | Authentication error (profile-specific) |
| `6982` | Access conditions |
