PUT DATA stores a data object. This is how you personalize counters, cardholder data, and OpenPGP attributes — not how you write a transparent EF (that is UPDATE BINARY).

## Even INS `DA` — tag in P1-P2

P1-P2 names the tag. Command data is the value. OpenPGP PUT DATA uses this form.

## Odd INS `DB` — TLV in DATA

The object (tag + value) is in the data field. PIV PUT DATA and UICC SET DATA use INS `DB`.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Stored |
| `6982` | Not allowed |
| `6A 80` | Malformed object |
| `6A 84` | Not enough memory |
| `6A 88` | Tag not supported in this context |
