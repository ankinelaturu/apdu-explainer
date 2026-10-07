TERMINATE DF irreversibly ends a dedicated file’s life cycle. The DF cannot be selected for normal use afterward (`6285` / terminated state).

This is not DELETE: the structure may remain as a tombstone. There is no ISO “unterminate”.

## Status words you will see

| SW | Meaning |
|----|---------|
| `90 00` | Terminated |
| `6982` | Not allowed |
| `6A 82` | File not found |
