INTERNAL AUTHENTICATE proves the **card** to the host. Command data is the host challenge. The card returns a cryptogram computed with an internal key (selected by MSE).

This is the opposite direction of EXTERNAL AUTHENTICATE (host proves itself). UICC AUTHENTICATE (`88` in a USIM) is a related but 3GPP-specific algorithm — see that page when the selected DF is a USIM.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Cryptogram returned |
| `6982` | Key not usable / access denied |
| `6A 88` | Referenced key not found |
