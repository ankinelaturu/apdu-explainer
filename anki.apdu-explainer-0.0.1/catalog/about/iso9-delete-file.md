DELETE FILE removes the current file, or a file named in the data field. Deleting a DF may require it to be empty.

## ISO vs GlobalPlatform

This is ISO 7816-9 file management. GlobalPlatform DELETE of applets uses the same INS `E4` but a proprietary CLA (`80`/`84`) — see that page when CLA is GP.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Deleted |
| `6982` | Not allowed |
| `6A 82` | File not found |
