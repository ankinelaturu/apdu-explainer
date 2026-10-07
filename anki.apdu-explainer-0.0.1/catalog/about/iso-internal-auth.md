## What it does

INTERNAL AUTHENTICATE proves the **card** to the host. Command data is the host challenge. The card returns a cryptogram computed with an internal key (selected by MSE). This is the classic challenge–response card authentication, distinct from EXTERNAL AUTHENTICATE.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Cryptogram returned |
| `6982` | Key not usable / access denied |
| `6A 88` | Referenced key not found |
