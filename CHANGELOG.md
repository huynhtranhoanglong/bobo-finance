# Changelog

## [1.0.10] - 2026-01-11

### Features
- **User Registration**:
  - Added a **Sign Up** feature directly on the login page.
  - Users can now create a new account by entering their email and password and clicking "Đăng ký tài khoản mới".
  - Implemented backend logic to handle registration via Supabase Auth:
    - Automatically sends a confirmation email (if enabled in Supabase settings).
    - Displays appropriate success/error messages on the login screen.
  - **Account Creation Flow**: Simplified onboarding for new users without needing external admin tools.


## [1.0.9] - 2026-01-11

### Features
- **Authentication & Security**:
  - **Middleware Protection**: Enhanced routing security by implementing Middleware to strictly inspect all incoming requests. Users attempting to access protected routes (Dashboard, Transactions, etc.) without a valid session are now automatically redirected to `/login`.
  - **Login Assurance**: Updated Login UI with a clear security message ensuring users that their financial data is encrypted and secure.
- **Account Management**:
  - **User Menu**: Added a User Dropdown Menu to the Dashboard header.
  - **Profile Quick View**: Displays user's email or initial avatar.
  - **Sign Out**: Implemented secure server-side `Sign Out` functionality accessible directly from the dashboard.
- **Documentation**:
  - **Port Correction**: Updated `README.md` to correctly reflect the development server port as `localhost:3001` (was 3000).


## [1.0.8] - 2026-01-11

### Improvements
- **Dashboard Layout Reordering**:
  - Reorganized dashboard sections for better usability and visual flow.
  - **New Order**:
    1. Header
    2. Financial Overview
    3. Monthly Stats
    4. Wallets (Grouped by Funds)
    5. Debts List
    6. Navigation Buttons (History & Debts)
    7. FAB (Add Transaction)


## [1.0.7] - 2026-01-11

### Features
- **Dashboard Redesign**:
  - Refactored "Wallets" section to group wallets by **Funds**.
  - **Fund Grouping**: Wallets are now nested inside their respective Funds using an Accordion UI (Expand/Collapse).
  - **Fund Totals**: Displays total balance for each Fund directly on the group header.
  - **Prioritized Sorting**: Funds are strictly ordered as:
    1. Daily Expenses
    2. Emergency Fund
    3. Sinking Fund
    4. Invesment Fund (Custom order)
    5. Others (sorted alphabetically)
  - **Empty Funds**: Funds are now displayed even if they have no wallets, ensuring a complete overview of the financial structure.


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
