ERASE BINARY clears a range of bytes in a **transparent EF**. P1-P2 use the same offset / SFI encoding as READ BINARY.

## How much is erased

If command data is present it can name an end offset. Otherwise the card erases from the P1-P2 offset to the end of the file (or to a card-defined length). Erased bytes typically read back as `FF` or `00`.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Erased |
| `6982` | Access conditions not satisfied |
| `6981` | Not a transparent EF |
| `6B 00` | Offset outside the file |
