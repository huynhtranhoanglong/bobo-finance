# Changelog

## [1.0.2] - 2026-01-11

### Features
- **Advanced Edit Transaction**:
  - Enabled editing of **Date & Time**.
  - Allowed changing **Category** for Income/Expense transactions.
  - Updated Backend SQL logic (`update_transaction_v2`) to correctly handle refunds/deductions when details change.
  - **Note**: Transaction Type remains fixed to ensure cash flow data integrity.

## [1.0.1] - 2026-01-11

### Features
- **Transaction History Upgrade**:
  - **Search**: Find transactions by note content (supports partial match).
  - **Filter**: Filter by Wallet and Transaction Type (Income, Expense, Debt, Transfer).
  - **Sort**: Sort by Date (Newest/Oldest) and Amount (High/Low).
  - **Server-Side Filtering**: URL-based filtering for easy sharing and better performance.

## [1.0.0] - 2026-01-11

### Features
- **Dashboard Overview**:
  - Displays Total Net Worth.
  - Financial Health metrics: Safety Target & Financial Freedom Target progress.
  - List of Wallets with balances and funds classification.
  - List of active Debts (Payable).
- **Transaction Management**:
  - Record Income, Expenses, and Transfers between wallets.
  - `AddTransactionDialog`: Unified interface for all transaction types.
  - `EditTransactionDialog`: Edit amount, wallet, and note for existing transactions.
  - `TransactionHistory`: View history with filters (by date/recency).
  - Delete transactions with automatic balance reversion.
- **Debt Management**:
  - Track debts (Payable) and loans (Receivable).
  - Record debt repayments (adjusts wallet balance and debt remaining amount).
  - Visual indicators for debt status.
- **Wallet Management**:
  - multiple wallets support (Cash, Bank, etc.).
  - Automatic balance updates based on transactions.
- **UI/UX**:
  - Modern, responsive design using Tailwind CSS 4.
  - Interactive components with Radix UI (Dialogs, Selects, Dropdowns).
  - Dark mode compatible styling (partial).
  - Mobile-friendly layout.
- **Database**:
  - Added `sql_backup/` folder containing all current PL/pgSQL functions and schema for reference and recovery.
- **Documentation**:
  - Added `pdd.md` (Product Definition Document) detailing project architecture, database schema, and business logic.
