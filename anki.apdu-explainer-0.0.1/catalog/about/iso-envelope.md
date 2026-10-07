## What it does

ENVELOPE wraps another APDU (or a data blob) inside this command. T=0 uses it when the real command would not fit the transport, or when the card expects an envelope for SM. INS `C2` even / `C3` odd.

UICC also uses ENVELOPE for SIM Toolkit / USAT data download from the network.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Accepted |
| `91 xx` | Proactive command pending (CAT) |
| `9300` | Toolkit busy |
| `9E xx` | SIM data download error |
