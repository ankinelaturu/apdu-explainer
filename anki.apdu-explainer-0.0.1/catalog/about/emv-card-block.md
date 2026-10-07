## What it does

CARD BLOCK permanently disables the card (all applications). Issuer-script only. After success, the card may still ATR but application commands fail with `6A81` / blocked indications.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Card blocked |
| `6985` | Not allowed |
