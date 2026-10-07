## What it does

TERMINATE CARD USAGE is the last life-cycle command: the card (or MF) is permanently taken out of service. There is no ISO reactivate. Issuer-defined remnants may still answer ATR but reject application commands.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Terminated |
| `6982` | Not allowed |
