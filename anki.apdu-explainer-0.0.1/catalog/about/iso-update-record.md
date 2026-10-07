## What it does

UPDATE RECORD **replaces** a record in a linear or cyclic EF. P1 is the record number. P2 is SFI + mode, same layout as READ RECORD (`100` = record P1 is the usual absolute update).

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Updated |
| `6A 83` | Record not found |
| `6982` | Access conditions not satisfied |
