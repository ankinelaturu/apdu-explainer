## What it does

CHANGE REFERENCE DATA replaces a PIN or other reference. P2 selects the reference (same encoding as VERIFY). Command data is typically old PIN || new PIN, or only the new PIN if the current security status already allows the change.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Changed |
| `63 Cx` | Old PIN wrong; `x` tries left |
| `6983` | Blocked |
| `6982` | Not allowed |
