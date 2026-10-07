READ BINARY returns bytes from a **transparent EF** (a flat byte array). Offset comes from P1-P2; how many bytes comes from Le. This is how you read eMRTD data groups and many proprietary EFs.

It does **not** apply to record files — use READ RECORD. On a linear/cyclic EF you typically get `6981` or `6986`.

## Offset vs short file identifier (P1-P2)

Two encodings share INS `B0`:

| Mode | How to recognize | Offset |
|------|------------------|--------|
| Full offset | P1 bit 8 = `0` | 15-bit offset in P1-P2 |
| Short File Identifier | P1 bit 8 = `1` | SFI in P1 bits 5–1, offset in P2 |

SFI lets you read a well-known EF **without** SELECT FILE first. eMRTD EF.COM is often SFI `1E` (`P1 = 9E`). Offset `00` is the start of the file.

Le is the maximum you want. Short Le `00` means 256. If the file is shorter, the card returns what it has, often with `6282`.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Returned Le bytes (or the rest of the file) |
| `6282` | Hit the end of the file before Le |
| `6B 00` | Offset outside the file |
| `6982` | Not allowed (SM / access conditions) |
| `6986` | No current EF |
| `6C xx` | Wrong Le; resend with Le = `xx` |
| `61 xx` | More data (T=0) — GET RESPONSE |

## Reading past the first chunk

Increment the offset by the number of bytes you already got and READ BINARY again. If Le was `00` and you got fewer than 256 bytes, check `6282` before assuming the file is done.
