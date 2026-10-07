## What it does

SELECT FILE sets the **current file** on the card: the master file (MF), a dedicated file / application (DF), or an elementary file (EF). Later READ BINARY, UPDATE BINARY, and READ RECORD talk to that file until you SELECT something else.

This is usually the first command after ATR (and after opening a logical channel).

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

`04` is what you see when an application is selected (`A0 00 00 02 47 10 01` for eMRTD, an EMV AID, and so on). `02` plus a 2-byte FID is the usual “open this EF” form.

## What comes back (P2)

| P2 | Meaning |
|----|---------|
| `00` | First or only occurrence, return **FCI** |
| `02` | Next occurrence, return FCI |
| `04` | Return **FCP** (file control parameters) |
| `08` | Return **FMD** (file management data) |
| `0C` | **No response data** |

`0C` is common on ePassports and many applets: you only need the file to become current. If P2 asks for FCI and the card has more than Le bytes, you get `61 xx` and should send GET RESPONSE.

## Typical status

| SW | Meaning |
|----|---------|
| `90 00` | Selected |
| `61 xx` | Success, `xx` more FCI bytes — send GET RESPONSE |
| `6A 82` | File or application not found |
| `6A 86` | P1-P2 not accepted |
| `6982` | Security status not satisfied |
| `6A 87` | Lc does not match P1-P2 |

## What to send next

After `90 00`, read or write the selected file (READ BINARY for a transparent EF, READ RECORD for a record EF). After selecting an application AID, the next command is whatever that applet expects (GET PROCESSING OPTIONS on EMV, READ BINARY of EF.COM on eMRTD).
