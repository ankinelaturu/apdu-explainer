SEARCH RECORD looks for a pattern **inside records** of the current EF (or an SFI named in P2).

## Starting record and mode

P1/P2 choose where to start, using the same SFI + mode packing as READ RECORD (`010` = next, `100` = record P1, and so on).

## The pattern

Command data is the search string. Some cards allow a simple mask; ISO does not require one. A match usually returns the record number and/or the record body, depending on the card.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Match |
| `6A 83` | No match / record not found |
| `6981` | Not a record EF |
