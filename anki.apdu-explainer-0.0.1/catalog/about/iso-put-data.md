## What it does

PUT DATA stores a data object. Even INS `DA` names the tag in P1-P2 and puts the value in command data. Odd INS `DB` usually carries a BER-TLV object in the data field (PIV PUT DATA, UICC SET DATA).

This is how you personalize counters, cardholder data, and OpenPGP attributes — not how you write a transparent EF (that is UPDATE BINARY).

## Typical status

| SW | Meaning |
|----|---------|
| `90 00` | Stored |
| `6982` | Not allowed |
| `6A 80` | Malformed object |
| `6A 84` | Not enough memory |
| `6A 88` | Tag not supported in this context |
