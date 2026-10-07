## What it does

WRITE BINARY writes bytes into a **transparent EF**. P1-P2 encode the offset the same way as READ BINARY (full offset, or SFI in P1 with offset in P2). Command data is the payload; Lc is its length.

ISO 7816 “write” is not always a straight overwrite. Depending on the file, WRITE can be a **logical OR** into existing bytes (once-programmable bits), while UPDATE BINARY replaces bytes. Many modern cards treat WRITE like UPDATE. If a write seems to “stick extra 1-bits”, you are seeing the OR behavior.

## Header

| Field | Role |
|-------|------|
| P1-P2 | Offset, same encoding as READ BINARY |
| Lc + DATA | Bytes to write |
| Le | usually absent (case 3) |

The current EF must be a transparent file, or P1 must name an SFI. Writing past the end of the file returns `6B00` or `6A84`.

## Typical status

| SW | Meaning |
|----|---------|
| `90 00` | Written |
| `63 81` | File filled up by the last write |
| `6982` | Access conditions not satisfied |
| `6981` | Wrong file structure |
| `6A 84` | Not enough space |
| `6581` | Memory failure |

## What to send next

READ BINARY at the same offset to confirm. For a full replace of existing data, prefer UPDATE BINARY when the card distinguishes the two.
