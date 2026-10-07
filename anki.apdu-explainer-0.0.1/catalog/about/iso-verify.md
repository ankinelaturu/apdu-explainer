## What it does

VERIFY compares presented data (PIN, password, biometric) with a **reference** stored on the card. Success sets a security status that later commands can require. Failure decrements a retry counter; `63 Cx` reports remaining tries `x`.

Empty command data (Lc = 0) often means “check whether this PIN is already verified” without presenting a PIN.

## P2 — which reference

| Bit | Meaning |
|-----|---------|
| 8 | `0` global reference, `1` specific to the current DF |
| 5–1 | Reference data number (PIN 1, PIN 2, …) |

OpenPGP maps this to PW1 signing (`81`), PW1 other (`82`), and PW3 admin (`83`).

## Typical status

| SW | Meaning |
|----|---------|
| `90 00` | Verified (or already verified, empty VERIFY) |
| `63 Cx` | Failed; `x` tries left |
| `6983` | Authentication method blocked (tries exhausted) |
| `6984` | Reference data invalidated |
| `6A 88` | Reference not found |

After `6983`, RESET RETRY COUNTER or an unblock command is required (EMV PIN CHANGE/UNBLOCK, OpenPGP resetting code).
