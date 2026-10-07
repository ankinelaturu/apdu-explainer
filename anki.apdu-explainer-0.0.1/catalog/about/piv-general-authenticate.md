## What it does

PIV GENERAL AUTHENTICATE (INS `87`) is used for PIV AUTH / DIG SIG / KEY MGMT / CARD AUTH challenge–response, key establishment, and on-card key generation. Data is a Dynamic Authentication template (tag `7C`) with witness, challenge, response, exponentiation nested tags.

P1-P2 name the algorithm and key reference (for example `00 9A` PIV Authentication key).

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Step succeeded |
| `6982` | PIN / touch required |
| `6A 80` | Bad `7C` template |
