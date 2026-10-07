## What it does

UICC STATUS (INS `F2`) returns information about the currently selected file — similar to SELECT FCI without changing the current file. P2 chooses the response type (FCP / FMD / no data / DF name).

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Status returned |
| `6C xx` | Wrong Le |
| `91 xx` | Proactive command pending |
