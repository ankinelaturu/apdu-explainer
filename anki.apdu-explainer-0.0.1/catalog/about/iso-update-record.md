UPDATE RECORD **replaces** a record in a linear or cyclic EF. P1 is the record number. P2 is SFI + mode, same layout as READ RECORD.

## Addressing the record

`P2` mode `100` (record P1) is the usual absolute update. `P1 = 01` is the first record. SFI in P2 bits 8–4 lets you skip SELECT if the EF has a short file identifier.

Command data is the full new record. Length must match the file’s record size on fixed-length EFs (`6A80` / `6700` if it does not).

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Updated |
| `6A 83` | Record not found |
| `6982` | Access conditions not satisfied |
| `6981` | Not a record EF |
