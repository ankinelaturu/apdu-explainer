## What it does

DELETE FILE removes the current file, or a file named in the data field. Deleting a DF may require it to be empty. This is ISO 7816-9 file management, not GlobalPlatform DELETE of applets (same INS `E4` but proprietary CLA).

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Deleted |
| `6982` | Not allowed |
| `6A 82` | File not found |
