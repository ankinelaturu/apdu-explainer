CARD BLOCK permanently disables the card (all applications). Issuer-script only, with SM.

After success the card may still ATR, but application commands fail with `6A81` or similar blocked indications. There is no card-unblock in EMV.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Card blocked |
| `6985` | Not allowed |
| `6988` | Bad SM |
