# Transaction Import Prototype

This is throwaway UI for validating the CSV import review flow before production implementation.

Question being answered: does the modal flow make format detection, local field mapping, Import Cutoff default deselection, locked amount/date fields, invalid rows, and all-or-nothing confirmation understandable enough for V1?

Run it through the existing web app and open `/transaction/import-prototype`.

Decisions to capture before deleting or absorbing this prototype:

- Whether cutoff rows should stay in the main review list or move to a separate section.
- Whether invalid rows should block confirmation or simply remain unselectable.
- Whether the custom local format copy is clear enough that users do not expect synced account-level import formats.
- Whether locked amount and Transaction Date are acceptable when remapping is available.
