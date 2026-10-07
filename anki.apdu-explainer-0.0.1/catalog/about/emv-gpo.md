## What it does

GET PROCESSING OPTIONS starts EMV application processing after SELECT of the AID. Command data is a PDOL-related data object, tag `83`, whose value is the terminal data the card listed in the PDOL.

The response is an Application Interchange Profile (AIP) and Application File Locator (AFL): which records to READ RECORD, and whether SDA/DDA/CDA and CVM lists apply.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | AIP + AFL returned |
| `6985` | Conditions not satisfied (wrong PDOL / state) |
| `6A 80` | PDOL data malformed |
