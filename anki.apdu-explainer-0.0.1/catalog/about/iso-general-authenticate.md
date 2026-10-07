GENERAL AUTHENTICATE is a generic authentication and key-agreement wrapper. eMRTD PACE and Chip Authentication, PIV, and pairing protocols send BER-TLV Dynamic Authentication Data in command data and get the peer’s objects back.

## Even `86` vs odd `87`

| INS | Typical use |
|-----|-------------|
| `86` | ISO / eMRTD even INS |
| `87` | PIV, chaining, odd-INS form |

MSE should already have selected the algorithm and key. Command data is usually tag `7C` with nested witness / challenge / response / exponentiation tags.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Step succeeded; response may hold the card’s nonce or token |
| `6300` | Authentication failed |
| `6982` | SE not set / access denied |
| `6A 80` | Malformed TLV |
