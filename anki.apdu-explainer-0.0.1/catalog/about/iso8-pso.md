PERFORM SECURITY OPERATION (INS `2A`) is the ISO 7816-8 crypto workhorse: hash, sign, verify, encipher, decipher, checksum, verify certificate. P1-P2 name the operation. MSE should already point at the key.

## P1-P2 operations

| P1 | P2 | Typical operation |
|----|-----|-------------------|
| `9E` | `9A` | Compute digital signature |
| `00` | `A8` | Hash |
| `80` | `86` | Encipher |
| `00` | `AE` | Verify certificate |
| `00` | `A2` | Verify cryptographic checksum |
| `80` | `8E` | Compute cryptographic checksum |

Input is command data (a hash, a CRT, or plaintext). Output, if any, is response data.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Done |
| `6982` | Key / SE not available |
| `6A 80` | Bad input |
| `6280` | Verification failed (some cards) |
