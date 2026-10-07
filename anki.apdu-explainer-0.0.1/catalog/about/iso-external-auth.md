## What it does

EXTERNAL AUTHENTICATE proves the **host** to the card. The card issued a challenge (often via GET CHALLENGE). Command data is the host’s cryptogram / signature over that challenge, using keys selected by MSE.

GlobalPlatform uses the same INS `82` after INITIALIZE UPDATE, but that is the GP secure-channel finish — see that page when CLA is `84`/`80` with GP SM bits.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Host authenticated |
| `6300` | Authentication failed |
| `6983` | Method blocked |
| `6982` | Wrong security environment |
