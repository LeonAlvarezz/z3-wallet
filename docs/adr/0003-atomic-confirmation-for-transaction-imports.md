# Atomic confirmation for transaction imports

Confirming selected Imported Transactions is all-or-nothing: either every selected row becomes a saved Transaction, or none of them do. The frontend sends reviewed rows to a backend bulk create boundary so the backend can validate and insert them in one database transaction. This keeps Import Review understandable when final validation fails because the user can fix or exclude problem rows without having to reconcile a partially saved import.
