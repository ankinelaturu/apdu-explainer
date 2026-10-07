## What it does

READ BINARY returns bytes from a **transparent EF** (a flat byte array). Offset and length come from P1-P2 and Le. It is the usual way to read eMRTD data groups, PIV objects stored as files, and many proprietary EFs.

It does **not** apply to record-oriented EFs — use READ RECORD there. Sending READ BINARY to a linear/cyclic file typically returns `6981` (incompatible with file structure) or `6986` (no current EF).

## Where to read (P1-P2)

Two encodings share the same INS `B0`:

| Mode | How to recognize | Offset |
|------|------------------|--------|
| Full offset | P1 bit 8 = `0` | 15-bit offset in P1-P2 |
| Short File Identifier | P1 bit 8 = `1` | SFI in P1 bits 5–1, offset in P2 |

SFI lets you read a well-known EF **without** SELECT FILE first. eMRTD EF.COM is often SFI `1E` (`P1 = 9E`). Offset `00` means “start of file”.

Le is the maximum number of bytes you want. `00` as a short Le means 256. If the file is shorter, the card returns what it has, often with `6282` (end of file before Le bytes).

## Typical status

| SW | Meaning |
|----|---------|
| `90 00` | Returned `Le` bytes (or the rest of the file) |
| `6282` | Hit the end of the file before Le |
| `6B 00` | Offset outside the file |
| `6982` | Not allowed (SM / access conditions) |
| `6986` | No current EF |
| `6C xx` | Wrong Le; resend with Le = `xx` |
| `61 xx` | More data (T=0) — GET RESPONSE |

## What to send next

To continue a large file, increment the offset by the number of bytes you already got and READ BINARY again. Do not assume a 256-byte file if you asked for `Le = 00` and got fewer bytes — check `6282`.
