## What it does

STORE DATA personalizes an application or SSD. P1/P2 encode block number, last-block, and whether data is DGI-formatted or TLV. Used after INSTALL [for personalization] or against a selected app.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Stored |
| `6A 80` | Bad DGI/TLV |
| `6982` | No SM / not allowed |
