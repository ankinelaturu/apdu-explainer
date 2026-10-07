GET DATA retrieves a **data object** identified by a BER-TLV tag, not a file. Typical objects: ATC (`9F36`), PIN try counter (`9F17`), card production life cycle, OpenPGP application data.

## Even INS `CA` — tag in P1-P2

P1-P2 is the tag. Command data is empty. Le is the expected length (`00` = 256). This is the ISO / EMV / OpenPGP / GP form.

## Odd INS `CB` — tag in DATA

The tag (often nested in tag `5C`) sits in the command data. P1-P2 is frequently `3F FF` (PIV) or `00 00`. UICC calls this RETRIEVE DATA.

PIV GET DATA is `00 CB 3F FF` with `{ 5C <len> <tag> }` in DATA.

If several specs match the same INS, the pills above list them. The object you get still depends on the selected application.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Object returned |
| `6A 88` | Referenced data not found |
| `6A 80` | Incorrect data field |
| `6982` | Access conditions not satisfied |
| `6C xx` | Wrong Le |
| `61 xx` | More bytes — GET RESPONSE |
