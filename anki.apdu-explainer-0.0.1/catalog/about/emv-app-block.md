APPLICATION BLOCK disables the currently selected EMV application. It is an **issuer script** after an online session and requires a secure session (issuer script MAC).

Later SELECT of that AID typically returns `6283` (invalidated) or fails cardholder functions.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Blocked |
| `6985` | Not allowed in this state |
| `6988` | Bad SM |
