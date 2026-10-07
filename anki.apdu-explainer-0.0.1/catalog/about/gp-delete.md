GlobalPlatform DELETE removes an executable load file, application, or related objects from the card registry. Requires a secure channel to the SSD that owns the object.

## Object vs related objects (P2)

| P2 | Meaning |
|----|---------|
| `00` | Delete object |
| `80` | Delete object and related objects (AID and its ELF, for example) |

Command data is TLV: tag `4F` AID, or a load-file AID.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Deleted |
| `6A 88` | Referenced data not found |
| `6985` | Not the owner / conditions of use |
