## What it does

INITIALIZE UPDATE starts a GlobalPlatform secure channel (SCP02 or SCP03). P1 is the key version (`00` = default). P2 is the key identifier. Command data is the host challenge (8 bytes for SCP02, 8 for SCP03 typically).

The response is key diversification data, key version, SCP identifier, card challenge, and card cryptogram. Next command is EXTERNAL AUTHENTICATE with the host cryptogram.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Channel started |
| `6A 88` | Key version not found |
| `6982` | Not allowed |
