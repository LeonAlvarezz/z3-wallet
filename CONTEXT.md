# My Wallet

My Wallet tracks personal cashflow by recording wallet transactions and grouping expenses into categories.

## Language

**Transaction**:
A saved wallet record that changes the user's cashflow. A Transaction is either an **Expense** or a **Top Up**.

**Expense**:
A Transaction that represents money spent from the wallet. Every Expense must have one **Category**.

**Top Up**:
A Transaction that represents money added to the wallet. A Top Up has no Category.
_Avoid_: Income, deposit

**Category**:
A user-defined grouping for Expenses, used for review and statistics.

**Category Rule**:
A user-defined matching rule that can suggest a **Category** from transaction note text. Category Rules help prefill Imported Transactions, but the user confirms the final Category during review, and imports do not create Category Rules automatically.
_Avoid_: Auto-category, classifier

**Imported Transaction**:
A transaction candidate parsed from an uploaded bank file before the user confirms it into their wallet. It may be incomplete, invalid, or incorrectly mapped until reviewed, and must match the wallet's currency assumption before it can be saved.
_Avoid_: Raw transaction, CSV row, bank transaction

**Note**:
User-visible text describing a **Transaction**. Imported notes preserve the bank-provided text with only whitespace cleanup unless the user edits them during Import Review.
_Avoid_: Memo, description

**Transaction Date**:
The user's local date and time when a **Transaction** happened. Imported bank dates are interpreted as local Transaction Dates unless the bank file provides stronger date-time information.
_Avoid_: Server date, upload date

**Import Format**:
A known CSV layout for parsing a bank file into **Imported Transactions**. An Import Format may be built in for common bank exports or created by the user through field mapping, and it must provide explicit money direction for **Expense** versus **Top Up**. An Import Format is applied only when its required fields can be recognized.
_Avoid_: Bank parser, bank support, CSV template

**Built-in Import Format**:
An **Import Format** shipped with My Wallet for a known bank CSV export layout. The first Built-in Import Formats are ABA CSV and Wing CSV, and they are auto-detected before browser-local **Custom Import Formats**. Auto-detection suggests a format, but the user can change the chosen Import Format before confirming the import.
_Avoid_: Hard-coded bank support

**Field Mapping**:
The assignment of bank file fields to the Transaction facts needed for import. A valid Field Mapping must identify amount, money direction, and Transaction Date; note and currency may be mapped when present. Field Mapping is changed by remapping and reparsing a file, not by editing individual rows in Import Review.
_Avoid_: Column picker, row correction

**Custom Import Format**:
A reusable **Import Format** created from a user's successful manual Field Mapping. In v1, Custom Import Formats are browser-local and can be applied automatically to later bank files with the same recognizable layout on that browser. New successful mappings create new Custom Import Formats by default rather than changing older ones.
_Avoid_: One-time mapping, unsaved template

**Import Review**:
The required user confirmation step for one uploaded bank file where **Imported Transactions** are checked, categorized, selected, or excluded before valid selected rows become saved **Transactions**. Import Review applies the **Import Cutoff** as a default selection rule, but the user decides which valid rows to save. Users may edit type, Note, and Category during Import Review, but not amount or Transaction Date.
_Avoid_: Preview-only table, staging area

**Import Cutoff**:
The latest saved **Transaction Date** in the wallet, interpreted as a local calendar day and used to reduce accidental overlapping imports. Imported Transactions on or before the Import Cutoff day are deselected by default, but can still be manually selected.
_Avoid_: Duplicate detection, duplicate rule

## Example Dialogue

Dev: "When the user uploads a bank file, do we immediately create Transactions?"

Domain expert: "No. We first show Imported Transactions in Import Review so the user can review the amount, Note, date, type, and Category."

Dev: "Are ABA and Wing the import concepts?"

Domain expert: "They are sources for Built-in Import Formats. The format matters because one bank can export more than one layout."

Dev: "What happens when a user uploads an ABA or Wing CSV?"

Domain expert: "The app should auto-detect the Built-in Import Format. If the guess is wrong, the user can change the chosen Import Format. If no built-in format matches, the user creates or chooses a Custom Import Format."

Dev: "If the app cannot recognize the bank file, does the user map fields every time?"

Domain expert: "No. Once the user successfully maps a file, that mapping becomes a Custom Import Format that can be reused."

Dev: "Does every Imported Transaction become a Transaction?"

Domain expert: "No. Only valid rows selected during Import Review are saved as Transactions."

Dev: "If the imported amount or Transaction Date looks wrong, should the user edit it in Import Review?"

Domain expert: "No. Import Review lets the user edit type, note, and Category, but amount and Transaction Date come from the bank file."

Dev: "How does the user fix a wrong amount or Transaction Date?"

Domain expert: "They change the Field Mapping and reparse the file, or exclude invalid rows from Import Review."

Dev: "If an Imported Transaction is older than the latest saved Transaction, is it a duplicate?"

Domain expert: "No. It is past the Import Cutoff, so it is deselected by default, but the user can still choose to save it."

Dev: "If an Imported Transaction note matches a Category Rule, is the Category final?"

Domain expert: "No. Category Rules suggest Categories, but the user confirms or changes them during Import Review."

Dev: "If a bank file only has a date, is that the upload date?"

Domain expert: "No. It is the Transaction Date from the bank file, interpreted in the user's local time."

Dev: "Can a Top Up have a Category?"

Domain expert: "No. Categories only apply to Expenses."
