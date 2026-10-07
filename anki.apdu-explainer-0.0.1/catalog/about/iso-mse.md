## What it does

MANAGE SECURITY ENVIRONMENT (MSE) tells the card **which keys and algorithms** the next security command should use. It does not compute a cryptogram itself. EXTERNAL AUTHENTICATE, INTERNAL AUTHENTICATE, GENERAL AUTHENTICATE, and PERFORM SECURITY OPERATION all read the current SE / CRT set by MSE.

## P1 — set, store, restore

| P1 | Action |
|----|--------|
| `01` / `41` / `81` / `C1` / `F3` | **SET** control reference template |
| `02` / `F4` | **STORE** the current SE |
| `03` / `F2` | **RESTORE** a stored SE |

Exact P1 values vary by profile (ISO, eMRTD PACE, IAS). `C1` SET with an Authentication Template is the usual PACE/Chip Authentication setup.

## P2 — which template

| P2 | Template |
|----|----------|
| `A4` | Authentication (AT) |
| `A6` | Key agreement (KAT) |
| `AA` | Hash (HT) |
| `B4` | Confidentiality (CT) |
| `B6` | Digital signature (DST) |
| `B8` | Cryptographic checksum (CCT) |

Command data is BER-TLV: key identifiers, algorithm references, and domain parameters.

## Typical status

| SW | Meaning |
|----|---------|
| `90 00` | Environment updated |
| `6A 80` | Malformed CRT |
| `6A 88` | Referenced key not found |
| `6982` | Not allowed |
