TERMINAL RESPONSE (CLA `80`, INS `14`) reports the result of a proactive command to the UICC (OK, user cancelled, terminal unable, …). Data is BER-TLV matching the FETCH’d command.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Accepted; session idle |
| `91 xx` | Another proactive command pending |
