WRITE RECORD writes a record in a **linear or cyclic EF**. P1 is the record number (`00` = current). P2 encodes SFI and write mode with the same bit packing as READ RECORD.

## WRITE vs UPDATE

Like WRITE BINARY, ISO WRITE RECORD may **OR** bits into an existing record. UPDATE RECORD replaces the whole record. Prefer UPDATE when you mean overwrite.

## P2 mode bits (3–1)

| Mode | Meaning |
|------|---------|
| `000` | First |
| `001` | Last |
| `010` | Next |
| `011` | Previous |
| `100` | Record P1 |

Bits 8–4 are SFI (`00000` = current EF). Command data is the record body.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Written |
| `6A 83` | Record not found |
| `6A 84` | Not enough space |
| `6981` | Not a record EF |
