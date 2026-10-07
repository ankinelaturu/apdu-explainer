## What it does

DEACTIVATE FILE temporarily takes a file out of use. SELECT of a deactivated file often returns `6283`. ACTIVATE FILE brings it back. INS `04` is easy to confuse with a malformed SELECT — look at the full header.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Deactivated |
| `6982` | Not allowed |
