UPDATE BINARY **replaces** bytes in a transparent EF. Unlike WRITE BINARY, the new value is stored as given (no OR with previous bits).

## Offset (P1-P2)

Same encoding as READ BINARY:

| Mode | P1 bit 8 | Offset |
|------|----------|--------|
| Full offset | `0` | 15-bit offset in P1-P2 |
| SFI | `1` | SFI in P1 bits 5–1, offset in P2 |

Use this when you mean “put these bytes here”. Use WRITE BINARY when the file is write-once / bit-set style.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Updated |
| `6982` | Access conditions not satisfied |
| `6981` | Not a transparent EF |
| `6B 00` | Offset outside the file |
| `6581` | Memory failure |
