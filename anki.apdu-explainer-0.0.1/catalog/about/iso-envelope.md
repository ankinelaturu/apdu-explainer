ENVELOPE wraps another APDU (or a data blob) inside this command. INS `C2` even / `C3` odd.

## T=0 and secure messaging

T=0 uses ENVELOPE when the real command would not fit the transport, or when the card expects an envelope for SM.

## UICC CAT data download

UICC also uses ENVELOPE for SIM Toolkit / USAT data download from the network. Then `91 xx` means a proactive command is pending — FETCH.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Accepted |
| `91 xx` | Proactive command pending (CAT) |
| `9300` | Toolkit busy |
| `9E xx` | SIM data download error |
