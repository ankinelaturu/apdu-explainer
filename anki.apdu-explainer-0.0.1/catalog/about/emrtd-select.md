On an ePassport this is still ISO SELECT FILE, used in two ways: select the eMRTD application, then select LDS EFs.

## Application AID (P1 `04`)

AID is `A0 00 00 02 47 10 01`. P2 is usually `0C` (no FCI).

## LDS elementary files (P1 `02`)

| FID | File |
|-----|------|
| `011E` | EF.COM |
| `0101`–`0110` | DG1–DG16 |
| `011D` | EF.SOD |
| `011C` | EF.CVCA |

After SELECT AID, READ BINARY of EF.COM (SFI `1E`, `P1 = 9E`) is the normal next step. The ISO SELECT page covers P1/P2 in full; this file is the eMRTD map.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Selected |
| `6A 82` | File or application not found |
