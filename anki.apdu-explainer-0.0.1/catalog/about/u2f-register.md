## What it does

U2F_REGISTER (INS `01`) registers a new credential. Command data is a 32-byte challenge hash plus a 32-byte application hash. The response is a reserved byte, public key, key handle, attestation certificate, and signature.

CLA is `00`. User presence is required; a wait often returns `6985` until the button is pressed.

## Typical status

| SW | Meaning |
| --- | --- |
| `90 00` | Registered |
| `6985` | Waiting for user presence / conditions |
