EXTERNAL AUTHENTICATE proves the **host** to the card. The card issued a challenge (GET CHALLENGE). Command data is the host’s cryptogram over that challenge, using keys selected by MSE.

## Challenge from GET CHALLENGE

Send GET CHALLENGE first (unless the protocol already gave you a card challenge, as GP INITIALIZE UPDATE does). Then EXTERNAL AUTHENTICATE with INS `82`.

## ISO vs GlobalPlatform

Same INS `82`, different CLA:

| CLA | Meaning |
|-----|---------|
| `00` (interindustry) | ISO EXTERNAL AUTHENTICATE |
| `80` / `84` (GP) | Finish a secure channel after INITIALIZE UPDATE — see that page for P1 security levels |

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Host authenticated |
| `6300` | Authentication failed |
| `6983` | Method blocked |
| `6982` | Wrong security environment |
