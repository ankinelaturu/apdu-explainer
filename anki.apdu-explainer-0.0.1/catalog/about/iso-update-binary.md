## What it does

UPDATE BINARY **replaces** bytes in a transparent EF at the offset in P1-P2. Unlike WRITE BINARY, the new value is stored as given (no OR with previous bits).

Offset encoding matches READ BINARY: P1 bit 8 clear → 15-bit offset in P1-P2; P1 bit 8 set → SFI in P1, offset in P2.

## Typical status

| SW | Meaning |
|----|---------|
| `90 00` | Updated |
| `6982` | Access conditions not satisfied |
| `6981` | Not a transparent EF |
| `6B 00` | Offset outside the file |
| `6581` | Memory failure |

Use this when you mean “put these bytes here”. Use WRITE BINARY when the file is write-once / bit-set style.
