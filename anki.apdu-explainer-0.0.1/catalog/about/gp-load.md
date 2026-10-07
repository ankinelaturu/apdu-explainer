## What it does

LOAD sends executable load-file blocks after INSTALL [for load]. P1 bit 8 set means **last block**. Each command carries a block number and a chunk of the load file. The card reassembles and links on the last block.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Block accepted |
| `6A 80` | Bad block |
| `6581` | Memory failure |
