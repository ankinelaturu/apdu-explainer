## What it does

SET STATUS changes the life-cycle of the ISD, an SSD, or an application (Installed → Selectable → Locked, and so on). Data names the AID and the new state byte.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Updated |
| `6A 88` | AID not found |
| `6985` | Illegal transition |
