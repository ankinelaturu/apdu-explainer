RESET RETRY COUNTER unblocks a PIN after too many wrong VERIFY attempts (`6983`).

## Which PIN (P2)

P2 names the reference (same encoding as VERIFY).

## PUK and new PIN in DATA

Command data is usually `resetting code / PUK || new PIN`. Send only the resetting code if you are unblocking without changing the PIN (card-dependent).

## Tries left vs blocked (`63 Cx` / `6983`)

| SW | Meaning |
|----|---------|
| `90 00` | Unblocked; retry counter restored |
| `63 Cx` | Resetting code wrong; `x` tries left |
| `6983` | Resetting code itself blocked |
| `6982` | Not allowed |
