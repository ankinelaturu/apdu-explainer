## What it does

GET DATA retrieves a **data object** identified by a BER-TLV tag, not a file. The tag is usually P1-P2 (even INS `CA`). Odd INS `CB` often puts the tag in the command data instead (PIV, UICC RETRIEVE DATA).

Typical objects: application template, ATC (`9F36`), PIN try counter (`9F17`), card production life cycle, OpenPGP application data.

## Even vs odd INS

| INS | Form |
|-----|------|
| `CA` | Tag in P1-P2, empty command data, Le = expected length |
| `CB` | Tag (and optional nested TLV) in DATA; P1-P2 often `3F FF` or `00 00` |

PIV GET DATA is `00 CB 3F FF` with `{ 5C <len> <tag> }` in the data field.

## Typical status

| SW | Meaning |
|----|---------|
| `90 00` | Object returned |
| `6A 88` | Referenced data not found |
| `6A 80` | Incorrect data field |
| `6982` | Access conditions not satisfied |
| `6C xx` | Wrong Le |
| `61 xx` | More bytes — GET RESPONSE |

If several specs match the same INS (ISO, PIV, UICC, EMV), the pills above list them. The object you get still depends on the selected application.
