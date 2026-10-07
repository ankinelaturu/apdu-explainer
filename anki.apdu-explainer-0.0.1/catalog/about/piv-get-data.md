## What it does

PIV GET DATA is odd-INS `CB` with P1-P2 `3F FF`. Command data is `{ 5C <len> <BER-TLV tag> }` naming the object (CCC `5FC107`, CHUID `5FC102`, X.509 `5FC10A`, …). Response is `{ 53 <len> <object> }`.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Object returned |
| `6A 82` | Object not found |
| `6982` | Access conditions (PIN / OCC) |
