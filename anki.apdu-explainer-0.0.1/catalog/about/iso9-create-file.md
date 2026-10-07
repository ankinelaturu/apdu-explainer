CREATE FILE allocates an MF, DF, or EF. Command data is a BER-TLV **FCP** (file control parameters): FID, file descriptor, size, life cycle, and access rules. The new file is often selected as a side effect.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Created |
| `6A 89` | File already exists |
| `6A 8A` | DF name already exists |
| `6A 84` | Not enough memory |
| `6982` | Not allowed |
