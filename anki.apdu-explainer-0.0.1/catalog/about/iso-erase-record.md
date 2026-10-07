ERASE RECORD erases one or more records of a linear or cyclic EF.

## Starting record (P1)

P1 is the first record number to erase. P2 uses the READ RECORD SFI/mode packing (SFI in bits 8–4, mode in bits 3–1) so you can erase “this record”, “from here to the end”, or an SFI file without SELECT.

Erased records typically read back as the logical erased value (`FF` or zeros).

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Erased |
| `6A 83` | Record not found |
| `6982` | Not allowed |
