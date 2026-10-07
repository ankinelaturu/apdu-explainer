GENERATE AC asks the card for an application cryptogram at the end of an EMV transaction (and sometimes for a second AC after online approval).

## Cryptogram type (P1 bits 8–7)

| P1 bits 8–7 | Type |
|-------------|------|
| `00` | AAC — decline |
| `01` | TC — approve offline |
| `10` | ARQC — go online |

P1 bit 5 requests CDA (combined DDA/AC generation). Command data is the CDOL-related data object.

The response is cryptogram information data, ATC, and AC (tag `9F26`), plus optional signed dynamic data. Check CID for the type the **card** actually chose — it may refuse TC and return AAC.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | AC returned |
| `6985` | Not in a state to generate an AC |
