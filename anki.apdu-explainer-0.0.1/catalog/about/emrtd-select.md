## What it does

On an ePassport / eMRTD this is still ISO SELECT FILE, used in two ways: select the eMRTD application by AID `A0 00 00 02 47 10 01` (P1 `04`), then select LDS EFs by FID (P1 `02`, P2 `0C` so no FCI).

| FID | File |
| --- | --- |
| `011E` | EF.COM |
| `0101`–`0110` | DG1–DG16 |
| `011D` | EF.SOD |
| `011C` | EF.CVCA |

P2 `0C` is the usual ePassport choice. After SELECT AID, READ BINARY of EF.COM (SFI `1E`) is the normal next step.
