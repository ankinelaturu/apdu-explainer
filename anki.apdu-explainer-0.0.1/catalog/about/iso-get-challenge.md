GET CHALLENGE returns a card-generated random (or counter-based) nonce. The next EXTERNAL AUTHENTICATE or PSO is expected to use this value.

## Le is the length

P1 and P2 are `00` on most cards. Le is how many challenge bytes you want (often 8). A challenge is typically single-use.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Challenge in response data |
| `6C xx` | Wrong Le; resend with Le = `xx` |
| `6A 81` | Not supported |
