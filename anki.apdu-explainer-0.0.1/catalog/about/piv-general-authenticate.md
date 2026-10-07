PIV GENERAL AUTHENTICATE (INS `87`) is used for PIV AUTH / DIG SIG / KEY MGMT / CARD AUTH challenge–response, key establishment, and on-card key generation.

## Algorithm and key (P1-P2)

P1-P2 name the algorithm and key reference (for example `00 9A` PIV Authentication key). Data is a Dynamic Authentication template (tag `7C`) with witness, challenge, response, exponentiation nested tags.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Step succeeded |
| `6982` | PIN / touch required |
| `6A 80` | Bad `7C` template |
