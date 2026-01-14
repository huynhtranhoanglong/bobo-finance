# Changelog

## [1.1.5] - 2026-01-14

### Features
- **Accurate Net Worth Calculation**:
  - Updated the logic for **Total Assets (Net Worth)** on the dashboard.
  - **New Formula**: `Net Worth = Total Wallet Balances - Total Payable Debts`.
  - Previously, it only counted assets without subtracting debts. This change reflects a truer picture of financial health.
  - **Financial Freedom/Safety Targets**: Progress bars are now also calculated based on this "Real Net Worth".

### Technical Details
- Updated `get_financial_metrics` RPC function in Database.
- Added `sql_backup/202601140840_update_net_worth_logic.sql`.

## [1.1.4] - 2026-01-13

### Rebranding
- **Product Name**: Officially renamed from "Bobo Finance" to "**Bobo**".
- **Visual Identity**:
  - Updated application Logo/Icon to the new "Styled S" design.
  - Added `apple-icon.png` to support "Add to Home Screen" on iOS and Android with the new logo.
  - Updated Browser Tab Title to "Bobo".
  - Updated Email Sender Name for Feedback/Notifications to "Bobo".
- **UI Updates**:
  - Refined Login Page header to "Đăng nhập Bobo".
  - Updated Dashboard header to "Tài sản của tôi (Bobo)".
  - Updated Dashboard footer version to `v1.1.4`.

## [1.1.2] - 2026-01-13

### Features
- **Feedback Hub**:
  - Added a **Feedback Hub** feature allowing users to submit feedback directly from the application.
  - Feedback form is divided into **2 categories**:
    1. **Feature Feedback** (🔧 Tính năng): Suggestions for new features or improvements.
    2. **UI Feedback** (🎨 Giao diện): Feedback about the user interface and design.
  - Submitted feedback is sent via email to the product owner using **Resend** email service.
  - Email includes: Feedback type, Title, Content, and Sender's email.

### UI Improvements
- Added **"Góp ý" (Feedback)** menu item in the User dropdown menu (accessible via avatar button).
- Feedback dialog with **tabbed interface** for easy category selection.
- **Success state** with auto-close after submission.

### Technical Details
- Added `components/feedback-dialog.tsx` - Dialog component with 2-tab form.
- Added `app/actions/send-feedback.ts` - Server Action for sending emails via Resend API.
- Modified `components/user-nav.tsx` - Integrated Feedback menu item and dialog.
- Added **Resend** package (`resend`) for email delivery.
- New environment variable: `RESEND_API_KEY`.

### Bug Fixes
- **Vercel Serverless Compatibility**: Fixed "Missing API Key" error on Vercel deployment by moving Resend SDK initialization from global scope to function scope. This ensures environment variables are available at runtime in serverless environments.



## [1.1.3] - 2026-01-13

### Features
- **Privacy Mode (Chế độ Riêng tư)**:
  - Added a **Privacy Toggle** button (Eye icon) on the Dashboard header.
  - **Functionality**: Instantly masks all sensitive financial numbers (Net Worth, Balances, Debts, Monthly Stats) with `******`.
  - **Default State**: Enabled by default for new users/sessions to ensure privacy in public spaces.
  - **Persistence**: Remembers user preference via LocalStorage.
  - **Color Preservation**: Retains Red/Green color coding even when numbers are hidden, allowing users to gauge financial health (Positive/Negative) without revealing exact figures.
  - **Usage**: Only affects the **View Layer** (Dashboard, Transactions, Debts). Interaction Dialogs still show actual numbers to ensure accurate input.
  - **Consistency**: Header logic (Privacy Toggle + User Nav) is now unified across all main screens.

### Technical Details
- Added `components/providers/privacy-provider.tsx` - Context for managing privacy state.
- Added `components/ui/privacy-amount.tsx` - Utility component for rendering masked/unmasked amounts.
- Added `components/ui/privacy-toggle.tsx` - UI Button for toggling mode.
- Wrapped application root in `PrivacyProvider`.
- Updated all major dashboard components (`FinancialOverview`, `MonthlyStats`, `FundGroup`, `WalletCard`) to utilize `PrivacyAmount`.

## [1.1.1] - 2026-01-12

### Features
- **Automatic Default Funds Creation**:
  - Users now automatically receive **4 default funds** when they first access the Dashboard:
    1. Daily Expenses
    2. Emergency Fund
    3. Sinking Fund
    4. Investment Fund
  - This ensures a consistent experience for all users without requiring manual fund setup.
  - **New Users**: Default funds are created on first login.
  - **Existing Users without Funds**: Default funds are created automatically when accessing the Dashboard.
  - **Existing Users with Funds**: No action taken (existing data preserved).

### UI Improvements
- Added **Build Version Indicator** at the bottom of the Dashboard for easy version tracking.

### Technical Details
- Added `app/actions/ensure-funds.ts` - Server Action to ensure default funds exist.
- Modified `app/page.tsx` to call `ensureDefaultFunds()` on Dashboard load.
- Added `sql_backup/202601112025_ensure_default_funds.sql` for reference.


## [1.1.0] - 2026-01-11

### Infrastructure
- **Deployment**:
  - Successfully prepared application for Vercel deployment.
  - Implemented **Single Database Strategy** using Row Level Security (RLS) to support both Production and Development environments on a single Supabase project.
  - Updated configuration to support dynamic Redirect URLs for OAuth (Google Login) on both `localhost`, `vercel.app` (preview), and production domain.

## [1.0.14] - 2026-01-11

### Security Fixes
- **Data Isolation & RLS Enforcement**:
  - **Critical Fix**: Patched `get_financial_metrics` RPC function which was previously exposing financial metrics (Net Worth, Safety Targets) across different user accounts due to missing parameters.
  - **Transaction Security**: Hardened `update_transaction_v2` and `delete_transaction_v2` functions with strict `auth.uid()` checks to prevent unauthorized modification of other users' data, even if Transaction IDs are guessed.
  - **Note**: These fixes require running the `202601111715_fix_rpc_security.sql` script in the Supabase SQL Editor.


## [1.0.13] - 2026-01-11

### Bug Fixes
- **Authentication Bypass for Callbacks**:
  - Fixed a critical issue where the Application Middleware was incorrectly redirecting OAuth callback requests (`/auth/callback`) back to the Login page.
  - Allowed unauthenticated access to routes starting with `/auth`, ensuring that Google's authentication response (containing the session code) can reach the server for processing without being intercepted.


## [1.0.12] - 2026-01-11

### Bug Fixes
- **Google Login Validation**:
  - Fixed an issue where the "Sign in with Google" button was blocked by HTML5 form validation (requiring Email/Password fields to be filled).
  - Applied `formNoValidate` attribute to the Google Login button, allowing the OAuth flow to proceed immediately without checking the login form inputs.


## [1.0.11] - 2026-01-11

### Features
- **Google Authentication (OAuth)**:
  - Added support for "Sign in with Google" to provide a faster and more convenient login experience.
  - Implemented secure OAuth 2.0 flow using Supabase Auth:
    - **UI**: Added a Google Sign-In button with proper branding on the login page.
    - **Backend**: Created a dedicated `auth/callback` route to handle OAuth redirects and session exchange securely.
    - **Configuration**: Prepared system to handle `localhost:3001` redirect URIs for local development.


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
