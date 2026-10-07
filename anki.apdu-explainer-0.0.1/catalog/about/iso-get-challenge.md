## What it does

GET CHALLENGE returns a card-generated random (or counter-based) challenge. Le is the length you want. The next EXTERNAL AUTHENTICATE (or a PSO) is expected to use this value.

P1 and P2 are `00` on most cards. A challenge is typically single-use.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Challenge in response data |
| `6C xx` | Wrong Le |
| `6A 81` | Not supported |
