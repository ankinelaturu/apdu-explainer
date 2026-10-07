CHANGE REFERENCE DATA replaces a PIN or other stored secret.

## Which PIN (P2)

P2 uses the same encoding as VERIFY: bit 8 global vs DF-specific, bits 5–1 = reference number.

## Old PIN then new PIN

Command data is typically `old PIN || new PIN`. If the current security status already allows the change (you just VERIFYed), some cards accept only the new PIN.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Changed |
| `63 Cx` | Old PIN wrong; `x` tries left |
| `6983` | Blocked |
| `6982` | Not allowed |
