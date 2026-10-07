SEARCH BINARY looks for a byte string inside a **transparent EF**.

## Where the search starts

P1-P2 is the starting offset, same encoding as READ BINARY (full offset, or SFI in P1 with offset in P2).

## The pattern

Command data is the search string. Some cards accept a simple mask after the pattern; most ISO profiles just take the raw bytes.

## Offset in the response

On `90 00` the response data is often the offset where the pattern was found (2 bytes, big-endian). If nothing matches you get `6A83` rather than a fake offset.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Found (offset in response data) |
| `6A 83` | Not found |
| `6981` | Wrong file structure |
