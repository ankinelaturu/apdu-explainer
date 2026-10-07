GENERATE ASYMMETRIC KEY PAIR creates a key in a card slot. INS `46` even / `47` odd.

## Even vs odd INS

Odd `47` is the usual OpenPGP form (CRT tags for signature / decryption / authentication slots). P1-P2 and the data field name the key identifier and whether the public key is returned. PW3 / admin is required on most cards.

PIV generates keys through GENERAL AUTHENTICATE rather than this INS on many cards.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Generated; public key may follow |
| `6982` | Not allowed (need PW3 / admin) |
| `6A 84` | No space for a new key |
