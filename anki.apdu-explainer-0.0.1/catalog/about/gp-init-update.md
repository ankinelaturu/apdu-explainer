INITIALIZE UPDATE starts a GlobalPlatform secure channel (SCP02 or SCP03).

## Key version (P1)

P1 is the key version (`00` = default). P2 is the key identifier. Command data is the host challenge (typically 8 bytes).

## Card cryptogram in the response

The response is key diversification data, key version, SCP identifier, card challenge, and card cryptogram. Next command is EXTERNAL AUTHENTICATE with the host cryptogram.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Channel started |
| `6A 88` | Key version not found |
| `6982` | Not allowed |
