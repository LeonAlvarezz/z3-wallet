# Frontend-owned transaction import parsing

Transaction import CSV parsing, Import Format detection, remapping, and Import Review are owned by the frontend so uploaded bank files do not need to leave the browser. The backend receives only reviewed Imported Transactions selected for confirmation and atomically creates saved Transactions after normal server-side validation.
