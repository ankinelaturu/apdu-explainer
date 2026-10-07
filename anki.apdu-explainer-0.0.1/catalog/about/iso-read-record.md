## What it does

READ RECORD returns one record (or a range) from a **linear or cyclic EF**. Passports use transparent files for data groups, but many UICC/EMV files are record-based (application list, log, phonebook).

## P1 — which record

| P1 | Meaning |
|----|---------|
| `00` | Current / first, depending on P2 |
| `01`–`FE` | Record number (1-based) |

Record `00` is not used as a number. The first record is `01`.

## P2 — SFI and mode

P2 packs a short file identifier and a read mode:

| Bits | Field |
|------|--------|
| 8–4 | SFI (`00000` = currently selected EF) |
| 3–1 | Mode |

| Mode (bits 3–1) | Meaning |
|-----------------|---------|
| `000` | First occurrence |
| `001` | Last occurrence |
| `010` | Next |
| `011` | Previous |
| `100` | Record P1 |
| `101` | Record P1, read up to Le (may return several records) |

## Typical status

| SW | Meaning |
|----|---------|
| `90 00` | Record returned |
| `6A 83` | Record not found |
| `6282` | End of file / last record before Le |
| `6981` | Not a record EF |
| `6C xx` | Wrong Le; exact length is `xx` |

## What to send next

Walk a linear file with P2 mode “next”, or address records by number. EMV application templates in EF.AFL tell you which SFI + record numbers to read after GPO.
