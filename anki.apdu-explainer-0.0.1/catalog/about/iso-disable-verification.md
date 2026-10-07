DISABLE VERIFICATION REQUIREMENT turns off the need to VERIFY a given reference before using protected objects.

## Which reference (P2)

P2 names the PIN / key the same way as VERIFY. Many cards require that PIN (or a higher PIN) in the command data, or a prior VERIFY of PW3 / admin.

After success, commands that used to demand this PIN succeed without it until ENABLE VERIFICATION REQUIREMENT (or reset).

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Disabled |
| `6982` | Not allowed |
| `6A 81` | Function not supported |
