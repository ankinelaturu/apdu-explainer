## What it does

GENERATE ASYMMETRIC KEY PAIR creates a key in a card slot. INS `46` even / `47` odd. P1-P2 and the data field name the key identifier and whether the public key is returned.

OpenPGP uses odd INS `47` with CRT tags for the slot (signature, decryption, authentication). PIV generates keys through GENERAL AUTHENTICATE rather than this INS on many cards.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Generated; public key may follow |
| `6982` | Not allowed (need PW3 / admin) |
| `6A 84` | No space for a new key |
