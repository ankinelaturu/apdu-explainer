## What it does

PIN CHANGE/UNBLOCK (INS `24`, EMV CLA) is the issuer-script form of changing or unblocking the offline PIN. Data is SM-wrapped. Distinct from ISO CHANGE REFERENCE DATA / RESET RETRY COUNTER, which use interindustry CLA.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | PIN changed or unblocked |
| `6988` | SM failed |
| `63 Cx` | Tries remaining on some cards |
