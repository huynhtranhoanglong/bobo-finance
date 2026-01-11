# Changelog

## [1.0.7] - 2026-01-11

### Features
- **Dashboard Redesign**:
  - Refactored "Wallets" section to group wallets by **Funds**.
  - **Fund Grouping**: Wallets are now nested inside their respective Funds using an Accordion UI (Expand/Collapse).
  - **Fund Totals**: Displays total balance for each Fund directly on the group header.
  - **Prioritized Sorting**: Funds are strictly ordered as:
    1. Daily Expense
    2. Emergency Fund
    3. Sinking Fund
    4. Investment Fund
    5. Others (sorted alphabetically)


## [1.0.6] - 2026-01-11

### Features
- **Monthly Stats Dashboard**:
  - Displays **"This Month's Stats"** at the top of the dashboard.
  - Summarizes **Income**, **Expense**, and **Remaining** for the current month (excluding internal transfers).
  - **Expense Breakdown**: Visual Pie Chart showing the distribution of Must Have, Nice to Have, and Waste expenses.
  - **Spending Alert**: If user has debt, a progress bar alerts when monthly spending exceeds the "Average Minimum Spending" (calculated from the last 90 days of essential expenses).


## [1.0.5] - 2026-01-11

### Features
- **Edit & Delete Wallets**:
  - Users can now click on a wallet card to edit its details (Name, Fund, Balance) or delete it.
  - **Smart Balance Adjustment**: When manually editing a wallet's balance, the system automatically creates an adjustment transaction (Income or Expense) to ensure data consistency between the wallet balance and transaction history.
  - **Safe Deletion**: Deleting a wallet prompts a confirmation implementation and utilizes Database Cascade Delete to automatically remove all linked transactions, preventing data orphans.


## [1.0.4] - 2026-01-11

### Features
- **Create New Wallet**:
  - Integrated "Create Wallet" tab into the FAB (Add Transaction Dialog).
  - Users can input initial balance (positive or negative).
  - Automated initial transaction creation:
    - **Positive Balance**: Creates an "Income" transaction named "Số dư ban đầu".
    - **Negative Balance**: Creates an "Expense" transaction named "Số dư ban đầu (Âm)".
  - Linked new wallet to a parent Fund (`fund_id`).

## [1.0.3] - 2026-01-11

### Features
- **Smart Delete for Debt Transactions**:
  - Implemented `delete_transaction_v2` logic.
  - Deleting a transaction that created a debt (Income/Expense linked to Debt) will now automatically reduce the Debt's `total_amount` and `remaining_amount`.
  - Ensures Debt balance stays synchronized with actual transaction history (e.g., deleting a "Loan" transaction removes the corresponding "Debt" record value).

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
