PIV PUT DATA (INS `DB`) writes a PIV data object. Data is `{ 5C tag } { 53 value }`. Usually needs PIN and a card management key / SM, depending on the object.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Written |
| `6982` | Not allowed |
| `6A 84` | Too large |
