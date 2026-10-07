## What it does

INSTALL is the GP registry multi-tool. P1 chooses the stage; several bits can be combined (install + make selectable = `0C`).

| P1 | Stage |
| --- | --- |
| `02` | For load |
| `04` | For install |
| `08` | For make selectable |
| `0C` | Install and make selectable |
| `10` | Extradition |
| `20` | Registry update |
| `40` | Personalization |

Data is a concatenation of AID / privileges / install parameters TLVs. LOAD of CAP blocks usually follows INSTALL [for load].

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Done |
| `6A 80` | Bad parameters |
| `6A 84` | Not enough memory |
| `6985` | Privileges / state |
