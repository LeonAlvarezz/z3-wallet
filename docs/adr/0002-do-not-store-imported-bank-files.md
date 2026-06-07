# Do not store imported bank files

Uploaded bank files are temporary inputs to Transaction import and are not stored permanently after parsing or confirmation. The active import session may keep the original upload long enough to reparse it when the user changes the chosen Import Format. The app keeps saved Transactions and reusable Custom Import Formats, but avoids retaining original bank files or raw bank rows because they may contain sensitive account details, balances, names, and reference numbers that are not needed for My Wallet's core cashflow tracking.
