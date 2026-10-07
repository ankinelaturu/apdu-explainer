GET PROCESSING OPTIONS starts EMV application processing **after SELECT of the AID**.

## PDOL-related data (tag `83`)

Command data is a PDOL-related data object, tag `83`, whose value is the terminal data the card listed in the PDOL (amount, country, TVR, …). Empty `83 00` if there is no PDOL.

## AIP and AFL in the response

The response is Application Interchange Profile (AIP) and Application File Locator (AFL): which records to READ RECORD, and whether SDA/DDA/CDA and CVM lists apply.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | AIP + AFL returned |
| `6985` | Conditions not satisfied (wrong PDOL / state) |
| `6A 80` | PDOL data malformed |
