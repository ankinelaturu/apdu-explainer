## What it does

GP GET DATA (INS `CA`, GP CLA) reads security-domain data objects: IIN, CIN, card production life cycle, key information template, confirmation counter. P1-P2 is the tag (`00 66`, `00 E0`, `9F 7F`, …).

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Object returned |
| `6A 88` | Tag not found |
