PIV GET DATA is odd-INS `CB` with P1-P2 `3F FF`.

## Tag `5C` in command data

Command data is `{ 5C <len> <BER-TLV tag> }` naming the object. Response is `{ 53 <len> <object> }`.

| Tag | Object |
|-----|--------|
| `5FC107` | CCC |
| `5FC102` | CHUID |
| `5FC10A` | X.509 PIV Auth |
| `5FC10B` | X.509 Card Auth |

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Object returned |
| `6A 82` | Object not found |
| `6982` | Access conditions (PIN / OCC) |
