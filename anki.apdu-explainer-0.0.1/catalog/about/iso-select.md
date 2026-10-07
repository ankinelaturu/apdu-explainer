SELECT FILE makes a file **current**: the MF, a DF (application), or an EF. Later READ / UPDATE BINARY and READ RECORD talk to that file until you SELECT again. This is usually the first command after ATR (and after opening a logical channel).

## How the name is given (P1)

| P1 | Meaning | Command data |
|----|---------|--------------|
| `00` | MF, DF, or EF by file identifier | 2-byte FID, or empty for MF |
| `01` | Child DF of the current DF | 2-byte FID |
| `02` | EF under the current DF | 2-byte FID |
| `03` | Parent DF of the current DF | empty |
| `04` | By DF name (AID) | AID, 5–16 bytes |
| `08` | Path from the MF | concatenation of FIDs |
| `09` | Path from the current DF | concatenation of FIDs |

`04` is application select (`A0 00 00 02 47 10 01` for eMRTD, an EMV AID, and so on). `02` plus a 2-byte FID is “open this EF”.

## What comes back (P2)

| P2 | Meaning |
|----|---------|
| `00` | First or only occurrence, return **FCI** |
| `02` | Next occurrence, return FCI |
| `04` | Return **FCP** (file control parameters) |
| `08` | Return **FMD** (file management data) |
| `0C` | **No response data** |

`0C` is common on ePassports: you only need the file to become current. If P2 asks for FCI and the card has more than Le bytes, you get `61 xx` — send GET RESPONSE.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Selected |
| `61 xx` | Success, `xx` more FCI bytes — GET RESPONSE |
| `6A 82` | File or application not found |
| `6A 86` | P1-P2 not accepted |
| `6982` | Security status not satisfied |
| `6A 87` | Lc does not match P1-P2 |

## After SELECT

Read or write the selected file (READ BINARY for a transparent EF, READ RECORD for a record EF). After an application AID, the next command is whatever that applet expects (GET PROCESSING OPTIONS on EMV, READ BINARY of EF.COM on eMRTD).
