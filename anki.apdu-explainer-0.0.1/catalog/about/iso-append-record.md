## What it does

APPEND RECORD adds a new record at the end of a linear EF, or as the newest record of a cyclic EF. P1 is `00`. P2 may name an SFI. Command data is the full record body.

Cyclic files overwrite the oldest record when full rather than returning `6A84`.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Appended |
| `6A 84` | File full (linear) |
| `6981` | Not a record EF |
