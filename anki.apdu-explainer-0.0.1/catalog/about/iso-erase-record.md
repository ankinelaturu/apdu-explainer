## What it does

ERASE RECORD erases one or more records of a linear/cyclic EF. P1 is the starting record number. P2 uses the READ RECORD SFI/mode packing. Erased records typically read back as the logical erased value (often `FF` or zeros).

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Erased |
| `6A 83` | Record not found |
| `6982` | Not allowed |
