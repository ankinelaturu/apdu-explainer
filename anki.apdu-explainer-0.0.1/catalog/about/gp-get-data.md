GP GET DATA (INS `CA`, GP CLA) reads security-domain data objects. P1-P2 is the tag.

## Tags you will see

| P1-P2 | Object |
|-------|--------|
| `00 66` | Card / chip data |
| `00 E0` | Key information template |
| `9F 7F` | Card production life cycle |
| `42` / `45` | IIN / CIN (when used as GET DATA tags on this card) |

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Object returned |
| `6A 88` | Tag not found |
