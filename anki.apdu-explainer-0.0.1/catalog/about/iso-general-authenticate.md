## What it does

GENERAL AUTHENTICATE (INS `86` even / `87` odd) is a generic authentication and key-agreement wrapper. eMRTD PACE and Chip Authentication, PIV, and pairing protocols send BER-TLV Dynamic Authentication Data objects in the command data and get the peer’s objects back.

Odd INS `87` is the usual PIV / chaining form. MSE should already have selected the algorithm and key.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Step succeeded; response may hold the card’s nonce / token |
| `6300` | Authentication failed |
| `6982` | SE not set / access denied |
| `6A 80` | Malformed TLV |
