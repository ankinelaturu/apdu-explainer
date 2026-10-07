OpenPGP GENERATE ASYMMETRIC KEY PAIR uses odd INS `47`.

## Which slot (CRT in DATA)

| Tag | Slot |
|-----|------|
| `B6` | Signature |
| `B8` | Decryption |
| `A4` | Authentication |

The card returns the public key. PW3 required.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Key generated |
| `6982` | Not allowed |
