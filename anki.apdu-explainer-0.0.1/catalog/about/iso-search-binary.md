## What it does

SEARCH BINARY looks for a byte string inside a transparent EF, starting at the offset in P1-P2. Command data is the search pattern. A successful response often returns the offset where the pattern was found.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Found (offset in response data) |
| `6A 83` | Not found |
| `6981` | Wrong file structure |
