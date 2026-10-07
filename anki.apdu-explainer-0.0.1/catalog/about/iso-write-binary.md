WRITE BINARY stores bytes in a **transparent EF** at the offset in P1-P2. Command data is the payload; Lc is its length. P1-P2 use the same offset / SFI encoding as READ BINARY.

## WRITE vs UPDATE

ISO WRITE is not always a straight overwrite. On some files it is a **logical OR** into existing bytes (write-once / bit-set). UPDATE BINARY replaces bytes. If a write seems to “stick extra 1-bits”, that is the OR behavior. Many modern cards treat WRITE like UPDATE.

## Offset (P1-P2)

| Mode | P1 bit 8 | Offset |
|------|----------|--------|
| Full offset | `0` | 15-bit offset in P1-P2 |
| SFI | `1` | SFI in P1 bits 5–1, offset in P2 |

Usually case 3 (data, no Le). Writing past the end of the file returns `6B00` or `6A84`. The current EF must be transparent, or P1 must name an SFI.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Written |
| `63 81` | File filled up by the last write |
| `6982` | Access conditions not satisfied |
| `6981` | Wrong file structure |
| `6A 84` | Not enough space |
| `6581` | Memory failure |
