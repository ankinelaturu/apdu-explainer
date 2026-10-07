## What it does

GENERATE AC asks the card for an application cryptogram at the end of an EMV transaction (and sometimes for a second AC after online approval).

| P1 bits 8–7 | Type |
| --- | --- |
| `00` | AAC — decline |
| `01` | TC — approve offline |
| `10` | ARQC — go online |

P1 bit 5 requests CDA (combined DDA/AC generation). Command data is the CDOL-related data object. The response is a cryptogram information data, ATC, and AC (tag `9F26`), plus optional signed dynamic data.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | AC returned (check CID for the type the card actually chose) |
| `6985` | Not in a state to generate an AC |
