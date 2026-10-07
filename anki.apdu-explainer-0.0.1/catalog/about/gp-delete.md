## What it does

GlobalPlatform DELETE removes an executable load file, application, or related objects from the card registry. P2 `00` deletes the object; `80` deletes the object and related objects (for example an AID and its ELF).

Command data is TLV: tag `4F` AID, or a load-file AID. Requires a secure channel to the SSD that owns the object.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Deleted |
| `6A 88` | Referenced data not found |
| `6985` | Not the owner / conditions of use |
