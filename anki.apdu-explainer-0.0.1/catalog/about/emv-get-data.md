## What it does

EMV GET DATA (INS `CA`, proprietary CLA) reads a few well-known tags without going through record files: ATC `9F36`, last online ATC `9F13`, PIN try counter `9F17`, log format `9F4F`. P1-P2 is the tag.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Value returned |
| `6A 88` | Tag not available |
