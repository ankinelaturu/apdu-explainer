U2F_VERSION (INS `03`) returns the ASCII version string, usually `U2F_V2`.

P1-P2 are `00`. Le is typically `00`. Response data is the version bytes, then `90 00`.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Version string in DATA |
