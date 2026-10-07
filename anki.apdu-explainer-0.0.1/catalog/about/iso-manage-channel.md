MANAGE CHANNEL opens or closes a **logical channel**. Channel 0 always exists. Extra channels let several applications stay selected at once.

## Open vs close (P1-P2)

| P1 | P2 | Meaning |
|----|-----|---------|
| `00` | `00` | Open; card assigns the channel number in the response |
| `00` | `01`–`13` | Open this channel number (if the card allows) |
| `80` | `01`–`13` | Close this channel |

CLA of later commands encodes the channel in the low bits (interindustry CLA).

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Opened or closed; open returns the channel number |
| `6881` | Logical channel not supported |
| `6A 81` | No more channels |
