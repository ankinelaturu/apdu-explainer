DEACTIVATE FILE temporarily takes a file out of use. SELECT of a deactivated file often returns `6283`. ACTIVATE FILE brings it back.

## Easy to confuse with SELECT

INS `04` looks like a malformed SELECT if you only glance at the first bytes. Check the full header: SELECT is INS `A4`.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Deactivated |
| `6982` | Not allowed |
| `6A 82` | File not found |
