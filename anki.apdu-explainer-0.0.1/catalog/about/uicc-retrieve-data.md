RETRIEVE DATA (INS `CB`) is the UICC odd-INS GET DATA: read a data object from the current DF. Tag is in the command data.

Used for UICC-specific objects rather than ISO even-INS `CA`.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Object returned |
| `6A 88` | Not found |
