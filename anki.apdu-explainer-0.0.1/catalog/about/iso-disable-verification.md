## What it does

DISABLE VERIFICATION REQUIREMENT turns off the need to VERIFY a given reference before using protected objects. P2 names the reference. Many cards require the PIN (or a higher PIN) in the command data or as a prior VERIFY.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Disabled |
| `6982` | Not allowed |
| `6A 81` | Function not supported |
