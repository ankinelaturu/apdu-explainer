GET RESPONSE is the T=0 way to pick up bytes the card could not return with the previous command.

## After `61 xx`

SW2 is the number of extra bytes. Send GET RESPONSE with Le = `xx` (or less, then you may get `61` again). INS is `C0`. P1 and P2 are `00`. No command data (case 2).

On T=1 the card usually returns the whole response in one APDU, so you rarely need this.

## Do not insert another command

The pending buffer is discarded if you send anything else between `61 xx` and GET RESPONSE.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | That was the last chunk |
| `61 xx` | Still more — GET RESPONSE again |
| `6C xx` | Wrong Le; exact remaining length is `xx` |
| `6D 00` | No pending response |
