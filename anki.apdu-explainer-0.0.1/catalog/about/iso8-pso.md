## What it does

PERFORM SECURITY OPERATION (INS `2A`) is the ISO 7816-8 crypto workhorse: hash, sign, verify, encipher, decipher, checksum, verify certificate. P1-P2 name the operation. Input is command data (often a CRT or a hash). MSE should already point at the key.

| P1 | P2 | Typical operation |
| --- | --- | --- |
| `9E` | `9A` | Compute digital signature |
| `00` | `A8` | Hash |
| `80` | `86` | Encipher |
| `00` | `AE` | Verify certificate |
| `00` | `A2` | Verify cryptographic checksum |

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Done; output may be in response data |
| `6982` | Key / SE not available |
| `6A 80` | Bad input |
| `6280` | Verification failed (some cards) |
