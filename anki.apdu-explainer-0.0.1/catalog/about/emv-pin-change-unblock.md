PIN CHANGE/UNBLOCK (INS `24`, EMV CLA) is the **issuer-script** form of changing or unblocking the offline PIN. Data is SM-wrapped.

## Not ISO CHANGE REFERENCE DATA

ISO CHANGE REFERENCE DATA / RESET RETRY COUNTER use interindustry CLA `00` and INS `24` / `2C`. This command is CLA `8x` after GENERATE AC went online.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | PIN changed or unblocked |
| `6988` | SM failed |
| `63 Cx` | Tries remaining on some cards |
