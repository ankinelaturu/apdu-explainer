PUT KEY replaces or adds keys in a security domain (ENC/MAC/DEK or AES session keys).

## Key version (P1) and identifier (P2)

P1 is the key version. P2 is the key identifier / multiple-key flag. Data includes key type, length, encrypted key value, and **KCV**.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Key stored |
| `9485` | Invalid key check value |
| `9484` | Algorithm not supported |
| `6982` | Not allowed |
