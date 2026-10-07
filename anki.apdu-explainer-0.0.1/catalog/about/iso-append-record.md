APPEND RECORD adds a new record at the end of a linear EF, or as the newest record of a cyclic EF.

## P1 and P2

P1 is `00`. P2 may name an SFI (bits 8–4); otherwise the current EF is used. Command data is the full record body.

## Linear vs cyclic

A **linear** file returns `6A84` when full. A **cyclic** file overwrites the oldest record and still returns `90 00`.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Appended |
| `6A 84` | File full (linear) |
| `6981` | Not a record EF |
| `6982` | Access conditions not satisfied |
