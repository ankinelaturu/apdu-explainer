## What it does

RESET RETRY COUNTER unblocks a PIN after too many wrong VERIFY attempts (`6983`). P2 names the reference. Command data is usually resetting code / PUK || new PIN, or only the resetting code if you are not changing the PIN.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Unblocked; retry counter restored |
| `63 Cx` | Resetting code wrong; `x` tries left |
| `6983` | Resetting code itself blocked |
