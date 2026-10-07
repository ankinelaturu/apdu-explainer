## What it does

APPLICATION BLOCK disables the currently selected EMV application (issuer script after an online session). Later SELECT of that AID typically returns `6283` (invalidated) or fails cardholder functions. Requires a secure session (issuer script MAC).

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Blocked |
| `6985` | Not allowed in this state |
| `6988` | Bad SM |
