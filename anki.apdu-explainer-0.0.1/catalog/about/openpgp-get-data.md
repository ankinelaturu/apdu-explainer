## What it does

OpenPGP GET DATA (INS `CA`) reads application data objects: historical bytes `5F52`, application identifier, PW status `C4`, public-key data objects `C0`–`C2`, fingerprints, and so on. P1-P2 is the tag.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Object returned |
| `6A 88` | Tag not found |
