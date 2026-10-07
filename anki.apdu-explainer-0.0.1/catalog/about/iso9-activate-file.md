ACTIVATE FILE moves a file from created / deactivated to the **operational** state so it can be selected and used.

P1-P2 or the data field identify the file when it is not already current. SELECT of a deactivated file often returned `6283`; after ACTIVATE it should return `90 00`.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Activated |
| `6982` | Not allowed |
| `6A 82` | File not found |
