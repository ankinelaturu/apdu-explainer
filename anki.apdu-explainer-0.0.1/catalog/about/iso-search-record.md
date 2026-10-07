## What it does

SEARCH RECORD looks for a pattern inside records of the current (or SFI) EF. P1/P2 choose the starting record and mode. Command data is the search string, sometimes with a simple mask.

A match usually returns the record number and/or the record body, depending on the card.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Match |
| `6A 83` | No match / record not found |
