## What it does

WRITE RECORD writes a record in a linear or cyclic EF. P1 is the record number (`00` = current). P2 encodes SFI and write mode (first, last, next, previous, or record P1), using the same bit packing as READ RECORD.

Like WRITE BINARY, ISO WRITE RECORD may OR bits into an existing record rather than replace it. UPDATE RECORD is the replace form.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Written |
| `6A 83` | Record not found |
| `6A 84` | Not enough space |
| `6981` | Not a record EF |
