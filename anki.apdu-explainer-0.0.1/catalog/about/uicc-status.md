UICC STATUS (INS `F2`) returns information about the **currently selected file** — similar to SELECT FCI without changing the current file.

## Response type (P2)

P2 chooses FCP / FMD / no data / DF name, matching SELECT P2 conventions on the UICC.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Status returned |
| `6C xx` | Wrong Le |
| `91 xx` | Proactive command pending |
