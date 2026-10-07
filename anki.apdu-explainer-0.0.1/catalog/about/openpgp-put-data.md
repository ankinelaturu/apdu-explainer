OpenPGP PUT DATA writes those same objects (name, language, fingerprints, PW status). INS `DA`, tag in P1-P2, value in DATA.

PW3 is required for most puts.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Stored |
| `6982` | Need PW3 |
| `6A 80` | Value rejected |
