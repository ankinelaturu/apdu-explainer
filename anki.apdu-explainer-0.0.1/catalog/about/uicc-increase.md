INCREASE adds a value to a cyclic record EF that stores a **counter** (for example a call-meter file). Command data is the increment. The response is often the new value.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Increased |
| `6A 84` | Overflow / no space |
| `6981` | Wrong file type |
