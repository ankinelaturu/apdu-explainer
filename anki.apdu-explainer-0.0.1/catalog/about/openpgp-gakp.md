## What it does

OpenPGP GENERATE ASYMMETRIC KEY PAIR uses odd INS `47`. Data names the CRT (signature `B6`, decryption `B8`, authentication `A4`). The card returns the public key. PW3 required.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Key generated |
| `6982` | Not allowed |
