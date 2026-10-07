## What it does

PUT KEY replaces or adds keys in a security domain (ENC/MAC/DEK or AES session keys). P1 is the key version; P2 is the key identifier / multiple-key flag. Data includes key type, length, encrypted key value, and KCV.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Key stored |
| `9485` | Invalid key check value |
| `9484` | Algorithm not supported |
| `6982` | Not allowed |
