## What it does

ERASE BINARY erases a range of bytes in a **transparent EF**. P1-P2 use the same offset encoding as READ BINARY. Command data, when present, can name an end offset; otherwise the card erases from the offset to the end of the file (or to a card-defined length).

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Erased |
| `6982` | Access conditions not satisfied |
| `6981` | Not a transparent EF |
| `6B 00` | Offset outside the file |
