TERMINATE EF is the elementary-file counterpart of TERMINATE DF: the EF is put in a terminal, non-operational state. SELECT / READ afterward typically fail with `6285` or `6A82`.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Terminated |
| `6982` | Not allowed |
| `6A 82` | File not found |
