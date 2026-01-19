# Changelog

## [1.4.3] - 2026-01-19

### Complete i18n Overhaul - Comprehensive Language Support
> **Purpose**: Address remaining hardcoded Vietnamese text throughout the application for complete bilingual support.

- **Dashboard Refactored**:
  - Converted to Client Component architecture for i18n compatibility.
  - Created `DashboardClient` component with full translation support.
  - Created `DemoDashboard` component for demo mode with i18n.
  - **Removed Family Card** from dashboard for cleaner UI.

- **Private Dashboard Refactored**:
  - Created `PrivateDashboardClient` component with full i18n.

- **Currency Format by Locale**:
  - Updated `formatCurrency()` to support both Vietnamese (VND ₫) and US English (USD $).
  - `PrivacyAmount` component now uses current language locale for formatting.
  - **Note**: USD amounts are converted from VND using approximate rate for display purposes.

- **Greeting System Internationalized**:
  - `GreetingHeader` now uses translated greetings based on time of day.
  - Added: `GREETING_MORNING`, `GREETING_AFTERNOON`, `GREETING_EVENING`, `GREETING_NIGHT`.

- **Net Worth Section**:
  - `NetWorthSection` now uses `LABEL_NET_WORTH` from translations.

- **Section Titles Translated**:
  - `LABEL_SECTION_WALLETS` (Ví tiền / Wallets)
  - `LABEL_SECTION_DEBTS` (Các khoản nợ / Debts)
  - Transaction History button now uses translated label.

- **Fund Names Fully Translated**:
  - `FundGroup` component translates fund names (`Daily Expenses`, `Emergency Fund`, `Sinking Fund`, `Investment Fund`) based on current language.

### Technical Details
- **New Files**:
  - `components/dashboard-client.tsx` - Client wrapper for Dashboard.
  - `components/demo-dashboard.tsx` - Demo mode dashboard with i18n.
  - `components/private-dashboard-client.tsx` - Client wrapper for Private Dashboard.

- **Modified Files**:
  - `app/page.tsx` - Now delegates to DashboardClient.
  - `app/private/page.tsx` - Now delegates to PrivateDashboardClient.
  - `components/greeting-header.tsx` - Uses useTranslation for greetings.
  - `components/net-worth-section.tsx` - Uses useTranslation.
  - `components/ui/privacy-amount.tsx` - Uses locale-aware formatting.
  - `utils/format.ts` - Added locale support for currency formatting.
  - `utils/i18n/vi.ts`, `utils/i18n/en.ts` - Added greeting and net worth labels.

> **Note**: No logic changes. This is a pure UI text update to ensure complete internationalization support.

## [1.4.2] - 2026-01-19

### Complete Multi-Language Support (i18n)
> **Purpose**: Complete the i18n integration started in v1.4.1. All UI components and pages now support language switching.

- **Updated Components (10 files)**:
  - `edit-transaction-dialog.tsx` - Full i18n support.
  - `create-debt-dialog.tsx` - Full i18n support.
  - `edit-debt-dialog.tsx` - Full i18n support.
  - `edit-wallet-dialog.tsx` - Full i18n support.
  - `create-wallet-dialog.tsx` - Full i18n support.
  - `transaction-filters.tsx` - Full i18n support (search, date presets, type filters).
  - `transaction-item.tsx` - Full i18n support.
  - `feedback-dialog.tsx` - Full i18n support.
  - `notification-bell.tsx` - Full i18n support.
  - `notification-item.tsx` - Full i18n support.

- **Updated Pages (5 files)**:
  - `app/login/page.tsx` - Full i18n for login/register form.
  - `app/transactions/page.tsx` - Full i18n for transaction history.
  - `app/family/page.tsx` - Full i18n for family management.
  - `app/account/page.tsx` - Full i18n for account settings.
  - `app/invite/[token]/page.tsx` - Full i18n for invitation page.

- **New Labels Added (~18 labels)**:
  - Invite page: `LABEL_INVITE_TITLE`, `LABEL_INVITE_EXPIRED`, `LABEL_INVITE_USED`, `LABEL_INVITE_EXPIRED_MSG`, `LABEL_INVITE_INVALID`, `LABEL_INVITE_NOT_FOUND`, `LABEL_BACK_TO_LOGIN`, `LABEL_BACK_TO_HOME`, `LABEL_WELCOME`, `LABEL_JOINED_FAMILY`, `LABEL_REDIRECTING`, `LABEL_JOIN_FAMILY`, `LABEL_JOINING`, `LABEL_LATER`, `LABEL_INVITED_BY`, `LABEL_SHARE_DATA_NOTE`.
  - Transaction: `LABEL_TRANSACTION`, `LABEL_DELETED_WALLET`.
  - Others: `LABEL_ERROR`, `LABEL_DEBT_MANAGEMENT`.

- **Translation Files Updated**:
  - `utils/i18n/vi.ts` - Added ~18 new labels (now ~320 labels total).
  - `utils/i18n/en.ts` - Added ~18 new labels (now ~320 labels total).

### Technical Details
- All client components now use `useTranslation()` hook from `language-provider.tsx`.
- Server Components (`app/page.tsx`, `app/private/page.tsx`) continue using `utils/labels.ts` for backward compatibility.
- Child components of server pages (FundGroup, DebtCard, etc.) already use i18n from v1.4.1.
- Build verified successfully with TypeScript.

> **Note**: No logic changes. This is a pure UI text update to complete internationalization support.

## [1.4.1] - 2026-01-19

### Feature - Multi-Language Support (i18n)
> **Purpose**: Enable users to switch between Vietnamese and English languages throughout the application.

- **Language Switcher**:
  - Added language toggle button in User Menu dropdown.
  - Displays current language flag (🇻🇳 / 🇬🇧) with toggle preview.
  - One-click switch between Vietnamese and English.
  - Language preference saved to Cookie (persists across sessions).

- **Translation System**:
  - Created centralized i18n module in `utils/i18n/`.
  - Vietnamese translations: `vi.ts` (~200 labels).
  - English translations: `en.ts` (~200 labels).
  - Type-safe translations using TypeScript.

- **Language Provider**:
  - Created `LanguageProvider` React Context.
  - `useTranslation()` hook for accessing translations.
  - `useLanguage()` hook for language control.
  - Cookie-based persistence for Server Component compatibility.

- **Updated Components**:
  - `user-nav.tsx` - Added language switcher UI.
  - `add-transaction-dialog.tsx` - Dynamic translations.
  - `monthly-stats.tsx` - Dynamic translations.
  - `financial-progress.tsx` - Dynamic translations.
  - `fund-group.tsx` - Dynamic fund name translations.
  - `debt-card.tsx` - Dynamic translations.

- **New Labels**:
  - `LABEL_LANGUAGE` - "Ngôn ngữ" / "Language"
  - `FUND_DAILY_EXPENSES`, `FUND_EMERGENCY`, `FUND_SINKING`, `FUND_INVESTMENT` - Fund name translations.

### Technical Details
- **New Files**:
  - `utils/i18n/vi.ts` - Vietnamese translations.
  - `utils/i18n/en.ts` - English translations.
  - `utils/i18n/index.ts` - Module exports.
  - `components/providers/language-provider.tsx` - Language context and hooks.

- **Modified Files**:
  - `app/layout.tsx` - Wrapped with LanguageProvider.
  - 6 components updated to use `useTranslation()` hook.

> **Note**: No logic changes. This is a pure UI text update for internationalization support. Existing `utils/labels.ts` retained for backward compatibility.

## [1.4.0] - 2026-01-18

### Major Feature - Private Wallets
> **Purpose**: Allow family members to create private wallets that are only visible to themselves and not counted in the family's total assets.

- **New Feature: Private Wallet Toggle**:
  - Added "Ví riêng tư" (Private Wallet) toggle in Create Wallet Dialog.
  - Toggle only appears when user belongs to a family.
  - When enabled, wallet is created with `visibility = 'private'`.
  - Private wallets are excluded from family dashboard and total assets.

- **New Page: Private Dashboard (`/private`)**:
  - Dedicated page to view and manage private wallets.
  - Displays total balance of all private wallets.
  - Shows list of private wallets with standard wallet cards.
  - Create new private wallet button (defaults to private).
  - Only accessible by users who belong to a family.
  - Users without family are redirected to main dashboard.

- **User Menu Update**:
  - Added "Ví riêng tư" menu item in user dropdown.
  - Menu item only visible when user belongs to a family **AND** has at least one private wallet.
  - Users can create their first private wallet via the Dashboard's Create Wallet dialog.
  - Uses Lock icon for visual distinction.

- **Database Changes**:
  - Updated `create_wallet_with_initial_balance` RPC to accept `p_visibility` parameter.
  - Added validation: users without family always get `visibility = 'shared'`.
  - Created new `get_private_dashboard_data` RPC function.
  - **SQL Script**: `sql_backup/202601181800_private_wallet_feature.sql`.

- **New UI Component**:
  - Added `components/ui/switch.tsx` - Toggle switch component.
  - Installed `@radix-ui/react-switch` dependency.

- **Labels Added** (`utils/labels.ts`):
  - `LABEL_WALLET_VISIBILITY`, `LABEL_WALLET_SHARED`, `LABEL_WALLET_PRIVATE`
  - `LABEL_WALLET_PRIVATE_NOTE`, `LABEL_PRIVATE_DASHBOARD`, `LABEL_PRIVATE_DASHBOARD_TITLE`
  - `LABEL_PRIVATE_DASHBOARD_EMPTY`, `LABEL_PRIVATE_DASHBOARD_NOTE`
  - `LABEL_TOTAL_PRIVATE_BALANCE`, `LABEL_CREATE_PRIVATE_WALLET`

- **Documentation**:
  - Updated `LOGIC_CALCULATIONS.md` section 7.2 with comprehensive private wallet details.

### Technical Details
- **New Files**:
  - `app/private/page.tsx` - Private dashboard page.
  - `components/ui/switch.tsx` - Switch component.
  - `sql_backup/202601181800_private_wallet_feature.sql` - Database migrations.
  
- **Modified Files**:
  - `components/create-wallet-dialog.tsx` - Added visibility toggle and props.
  - `components/user-nav.tsx` - Added private wallet menu item.
  - `components/greeting-header.tsx` - Added hasFamily prop forwarding.
  - `app/page.tsx` - Pass hasFamily to components.
  - `app/actions.ts` - Updated createWalletAction, added getPrivateDashboardAction.
  - `utils/labels.ts` - Added private wallet labels.

## [1.3.21] - 2026-01-18

### UI Consistency - Spending Categories & Fund Names
> **Purpose**: Unified spending category labels from English to Vietnamese and fixed fund display names for better user experience and i18n preparation.

- **Spending Category Labels** (`utils/labels.ts`):
  - Changed field label from "Mức độ" to **"Phân loại"** for clearer meaning
  - Changed placeholder from "Chọn mức độ" to **"Chọn phân loại"**
  - Unified category names to Vietnamese with logical emoji colors:
    - `🔴 Must Have` → **`✅ Thiết yếu`** (green = good/essential)
    - `🟡 Nice to Have` → **`🟡 Thứ yếu`** (yellow = neutral)
    - `⚫ Waste` → **`🔴 Lãng phí`** (red = wasteful)

- **Fund Display Name** (`components/fund-group.tsx`):
  - Updated `getDisplayName()` translation for Emergency Fund:
    - "Quỹ dự phòng khẩn cấp" → **"Quỹ dự phòng"** (shorter, cleaner)
  - **i18n Note**: Database still stores English keys (e.g., `"Emergency Fund"`) for future multi-language support

- **Documentation** (`LOGIC_CALCULATIONS.md`):
  - Updated section 1.3 to "Phân Loại Chi Tiêu" with new display names
  - Updated document version to v1.3.21

> **Note**: No logic changes. Database values remain unchanged (`must_have`, `nice_to_have`, `waste`).

## [1.3.20] - 2026-01-18

### Code Quality - UI Labels Consistency & Pages Refactoring
> **Purpose**: Completed the centralization of UI labels across all pages and standardized text capitalization rules for improved consistency and i18n readiness.

- **Labels File Update** (`utils/labels.ts`):
  - Added ~25 new labels for Dashboard, Transactions, Family, and Account pages
  - Updated version header to v1.3.20
  - Added documentation for capitalization rules (Sentence case standard)
  - Standardized all labels to use Sentence case (e.g., "Thu nhập" instead of "Thu Nhập")
  
- **New Labels Added**:
  - **Dashboard**: `LABEL_SECTION_WALLETS`, `LABEL_SECTION_DEBTS`
  - **Transactions**: `LABEL_NO_TRANSACTIONS`, `LABEL_LOAD_MORE_TRANSACTIONS`, `LABEL_TRANSACTIONS_MORE`
  - **Family Page**: `LABEL_FAMILY_PAGE_TITLE`, `LABEL_NO_FAMILY`, `LABEL_NO_FAMILY_DESC`, `LABEL_FAMILY_NAME`, `LABEL_FAMILY_NAME_PLACEHOLDER`, `LABEL_CREATE_FAMILY`, `LABEL_MEMBERS_TITLE`, `LABEL_OWNER_BADGE`, `LABEL_PENDING_INVITATIONS`, `LABEL_INVITE_NEW_MEMBER`, `LABEL_INVITE_EMAIL_PLACEHOLDER`, `LABEL_INVITE_NOTE`, `LABEL_LEAVE_FAMILY`, `LABEL_LEAVE_OWNER_NOTE`, `LABEL_LEAVE_MEMBER_NOTE`, `LABEL_CONFIRM_LEAVE_FAMILY`, `LABEL_INVITE_SENT`
  - **Account Page**: `LABEL_ACCOUNT_PAGE_TITLE`, `LABEL_PERSONAL_INFO`, `LABEL_DISPLAY_NAME`, `LABEL_DISPLAY_NAME_PLACEHOLDER`, `LABEL_DISPLAY_NAME_NOTE`, `LABEL_UPDATE_SUCCESS`

- **Pages Refactored** (4 files):
  - `app/page.tsx`: Replaced hardcoded text with labels for wallets section, debts section, transaction history link, family banner, demo mode
  - `app/transactions/page.tsx`: Replaced hardcoded text with labels for page title, empty state, load more button
  - `app/family/page.tsx`: Replaced all hardcoded Vietnamese text with centralized labels
  - `app/account/page.tsx`: Replaced all hardcoded Vietnamese text with centralized labels

- **Capitalization Standardization**:
  - All transaction types: "Thu nhập", "Chi tiêu", "Chuyển ví", "Trả nợ"
  - All dialog titles: "Thêm giao dịch", "Chỉnh sửa giao dịch", "Tạo ví mới", etc.
  - All buttons: "Xác nhận", "Lưu thay đổi", "Gửi góp ý"
  - All debt types: "Đi vay", "Cho vay"

> **Note**: No logic changes. This is a pure UI text refactoring for better consistency and i18n preparation.


## [1.3.19] - 2026-01-18

### Code Quality - Centralized UI Labels (i18n Preparation)
> **Purpose**: Created a centralized labels file to prepare for internationalization (i18n) support and ensure consistency in UI text across the application.

- **New File**: `utils/labels.ts`
  - Contains ~200 label constants organized by functional groups
  - Groups: Common, Transactions, Wallets, Debts, Dashboard, Filters, Login, Notifications, Feedback
  - Follows naming convention: `LABEL_[CONTEXT]_[DESCRIPTION]`

- **Refactored Components** (17 files):
  - **Dialogs**: `add-transaction-dialog.tsx`, `edit-transaction-dialog.tsx`, `create-wallet-dialog.tsx`, `edit-wallet-dialog.tsx`, `create-debt-dialog.tsx`, `edit-debt-dialog.tsx`, `feedback-dialog.tsx`
  - **Dashboard**: `monthly-stats.tsx`, `debt-card.tsx`, `financial-progress.tsx`, `fund-group.tsx`
  - **Navigation**: `user-nav.tsx`, `notification-bell.tsx`, `notification-item.tsx`, `transaction-filters.tsx`
  - **Pages**: `app/login/page.tsx`

- **Consistency Improvements**:
  - Standardized debt type naming: "Đi Vay" / "Cho Vay"
  - Standardized spending category names: "Thiết yếu", "Thứ yếu", "Lãng phí"
  - All error messages now use `LABEL_ERROR_PREFIX`
  - All loading states now use corresponding labels (`LABEL_LOADING`, `LABEL_SAVING`, `LABEL_DELETING`, `LABEL_CREATING`, `LABEL_SENDING`)

> **Note**: This completes the i18n preparation phase. Future work can add multi-language support by replacing `utils/labels.ts` with a proper i18n library.

## [1.3.18] - 2026-01-17

### Bug Fix - Duplicate Funds in Create Wallet Dialog
> **Issue**: When a family owner opens the "Create Wallet" dialog, the "Fund" dropdown shows duplicate entries (e.g., 12 items instead of 4) because each family member has their own set of default funds.
> **Fix**: Updated `get_dashboard_data` RPC to use `DISTINCT ON (name)` to return only unique fund names.

- **Database**:
  - Updated `get_dashboard_data` RPC function.
  - Query now returns deduplicated funds list based on fund name.
  - **SQL Script**: `sql_backup/202601170830_fix_duplicate_funds.sql`.

> **Note**: This fix maintains the existing database structure for future flexibility (allowing users to customize funds if needed).

## [1.3.17] - 2026-01-17

### UX Improvement - Greeting Logic & Refactoring
> **Purpose**: Improved the greeting display logic to avoid showing email as a fallback name, and eliminated hardcoded strings in the greeting component.

- **Frontend Updates**:
  - `components/greeting-header.tsx`: Refactored to use centralized logic from `utils/timezone.ts`. The greeting now **only** shows the name if explicitly set by the user. If no name is set, it displays a simple greeting (e.g., "☀️ Chào buổi sáng!") without the email.
  - `app/account/page.tsx`: Updated to fallback to email for the heading (`H2`) if the display name is empty, ensuring the user still knows which account they are viewing.

- **Code Quality - Constants**:
  - `utils/constants.ts`: Added constants for all greeting texts and icons (`GREETING_TEXT_*`, `GREETING_ICON_*`).
  - `utils/timezone.ts`: Updated to use constants instead of hardcoded strings.

- **Database**:
  - Updated `get_my_profile` RPC logic to **STOP defaulting display_name to email**. It now returns `null` if no name is set.
  - **SQL Script**: `sql_backup/202601170900_update_get_my_profile_v2.sql`.

## [1.3.16] - 2026-01-17

### Code Quality - Centralized Color Palette
> **Purpose**: Eliminated hardcoded brand colors by creating a centralized color palette file for better maintainability and brand consistency.

- **New File**: `utils/colors.ts`
  - `COLORS` object with `brand`, `positive`, `negative`, `neutral`, `brandHover` (5 colors)
  - `withOpacity()` helper function to create rgba colors with opacity
  - Export aliases: `COLOR_POSITIVE`, `COLOR_NEGATIVE`, `COLOR_NEUTRAL`, `COLOR_BRAND`, `COLOR_BRAND_HOVER`
  - Type annotation `: string` to prevent TypeScript literal type conflicts

- **Refactored Components** (15 files):
  - `components/monthly-stats.tsx` - Removed local COLOR_* declarations
  - `components/debt-card.tsx` - Removed local COLOR_* declarations
  - `components/fund-group.tsx` - Removed local COLOR_* declarations
  - `components/wallet-card.tsx` - Removed local COLOR_* declarations
  - `components/transaction-item.tsx` - Removed local COLOR_* declarations
  - `components/add-transaction-dialog.tsx` - Replaced inline hex colors
  - `components/edit-transaction-dialog.tsx` - Replaced inline hex colors
  - `components/create-wallet-dialog.tsx` - Replaced inline hex colors
  - `components/edit-wallet-dialog.tsx` - Replaced inline hex colors
  - `components/create-debt-dialog.tsx` - Replaced inline hex colors
  - `components/edit-debt-dialog.tsx` - Replaced inline hex colors
  - `components/feedback-dialog.tsx` - Replaced inline hex colors
  - `components/notification-bell.tsx` - Replaced inline hex colors
  - `components/notification-item.tsx` - Replaced inline hex colors
  - `components/net-worth-section.tsx` - Replaced inline hex colors
  - `components/financial-progress.tsx` - Replaced inline hex colors
  - `components/transaction-filters.tsx` - Replaced inline hex colors
  - `components/ui/pull-to-refresh.tsx` - Replaced inline hex colors

- **Refactored Pages** (6 files):
  - `app/page.tsx` - Replaced all inline hex colors
  - `app/login/page.tsx` - Replaced inline hex colors
  - `app/loading.tsx` - Replaced inline hex colors
  - `app/account/page.tsx` - Replaced inline hex colors
  - `app/family/page.tsx` - Replaced inline hex colors
  - `app/invite/[token]/page.tsx` - Replaced inline hex colors
  - `app/transactions/page.tsx` - Replaced inline hex colors

> **Benefit**: To change the brand color, now only need to edit ONE file (`utils/colors.ts`). All components will automatically update.
> **Note**: This is a pure refactoring change. No UI or logic changes.

## [1.3.15] - 2026-01-17

### Code Quality - Centralized Constants
> **Purpose**: Eliminated "magic numbers" by creating a centralized constants file for better maintainability and code clarity.

- **New File**: `utils/constants.ts`
  - Contains all configurable constants with descriptive names and JSDoc comments
  - Financial calculation constants: `SPENDING_CALCULATION_DAYS` (90), `SPENDING_CALCULATION_MONTHS` (3), `MONTHS_IN_YEAR` (12), `RETIREMENT_YEARS` (25)
  - Spending progress threshold: `SPENDING_PROGRESS_THRESHOLD_PERCENT` (10%)
  - Debt progress thresholds: `DEBT_PROGRESS_LOW` (30%), `DEBT_PROGRESS_HIGH` (70%)
  - Emergency fund thresholds: `EMERGENCY_FUND_DANGER_MONTHS` (3), `EMERGENCY_FUND_SAFE_MONTHS` (6)
  - Greeting time ranges: `GREETING_MORNING_START` (5), `GREETING_AFTERNOON_START` (12), `GREETING_EVENING_START` (18), `GREETING_NIGHT_START` (22)

- **Refactored Components**:
  - `components/monthly-stats.tsx` - Uses `SPENDING_PROGRESS_THRESHOLD_PERCENT` instead of hardcoded `10`
  - `components/debt-card.tsx` - Uses `DEBT_PROGRESS_LOW/HIGH` instead of hardcoded `30`, `70`
  - `components/fund-group.tsx` - Uses `EMERGENCY_FUND_*_MONTHS` instead of hardcoded `3`, `6`
  - `utils/timezone.ts` - Uses `GREETING_*_START` instead of hardcoded `5`, `12`, `18`, `22`

- **Documentation**:
  - Added section "9.6. Hằng Số Cấu Hình (Constants)" to `LOGIC_CALCULATIONS.md`
  - Full mapping table of all constants with values, meanings, and usage locations

> **Note**: This is a pure refactoring change. No logic or behavior changes. SQL constants remain unchanged as PostgreSQL does not support global constants.

## [1.3.14] - 2026-01-16

### Bug Fix - Create Wallet/Debt Missing Family ID
> **Issue**: When a family member creates a new wallet or debt, the `family_id` was not being set, causing items to not appear on the family dashboard.
> **Fix**: Updated RPC functions to automatically attach `family_id` using `get_user_family_id()`.

- **Database**:
  - Fixed `create_wallet_with_initial_balance` function to include `family_id` and `visibility`.
  - Fixed `create_new_debt_v2` function to include `family_id` for both debt record and transaction.
  - **SQL Scripts**: 
    - `sql_backup/202601162220_fix_create_wallet_family_id.sql`
    - `sql_backup/202601162230_hotfix_create_debt_family_id.sql`

## [1.3.13] - 2026-01-16

### Feature - Device Timezone Localization
> **Change**: All timezone-dependent calculations now use the user's device timezone instead of hardcoded Vietnam timezone.
> Technical solution: Cookie-based approach for Server Component compatibility.

- **New Files**:
  - `utils/timezone.ts` - Centralized timezone utility with functions:
    - `getUserTimezone()` - Returns device timezone
    - `setTimezoneCookie()` - Saves timezone to cookie
    - `getTimeBasedGreeting()` - Returns greeting based on local time
    - `getDatePreset()` - Returns date ranges for filters
  - `components/timezone-provider.tsx` - Client component that sets timezone cookie on app mount

- **Database**:
  - Updated `get_dashboard_data` RPC to accept `p_timezone` parameter.
  - Uses `DROP FUNCTION IF EXISTS` before creating to avoid conflicts.
  - Defaults to 'Asia/Ho_Chi_Minh' if timezone not provided.
  - **SQL Script**: `sql_backup/202601162200_timezone_v2.sql`.

- **Frontend Updates**:
  - `app/layout.tsx` - Added `TimezoneProvider` wrapper.
  - `app/page.tsx` - Reads timezone from cookie and passes to RPC.

- **Bug Fix**:
  - Dashboard footer now uses `AppVersion` component instead of hardcoded version.

- **Documentation**:
  - Updated `LOGIC_CALCULATIONS.md` timezone section.

## [1.3.12] - 2026-01-16

### Improvement - Net Worth Calculation
> **Change**: Updated the Net Worth formula to include receivable debts (money others owe you).
> **Old Formula**: Total Assets - Payable Debts
> **New Formula**: Total Assets - Payable Debts + Receivable Debts

- **Database**:
  - Updated `get_dashboard_data` RPC function to calculate and include `total_receivable` in the response.
  - Added a new variable to query the sum of all receivable debts with remaining balance > 0.
  - Net Worth now correctly reflects the user's true wealth by including money that will be collected from others.
  - **SQL Script**: `sql_backup/202601162050_fix_net_worth_calculation.sql`.

- **Documentation**:
  - Updated `LOGIC_CALCULATIONS.md` with the new formula explanation.
  - Added section "2.3. Tổng Khoản Cho Vay (Total Receivable Debts)" for clarity.

## [1.3.11] - 2026-01-16

### Bug Fix - Transaction Logic (Family Mode)
> **Issue**: Deleting or updating transactions in family mode (shared wallets) did not correctly update the wallet balance or debt status.
> **Fix**: Implemented new RPC functions `delete_transaction_v3` and `update_transaction_v3` with `SECURITY DEFINER` to ensuring proper permission handling for balance recalculations across family members.

- **Backend**:
  - Added `sql_backup/202601161815_fix_delete_transaction_v3.sql`.
  - Updated `app/actions.ts` to call v3 RPC functions.

## [1.3.10] - 2026-01-16

### Bug Fix - FAB Positioning
> **Issue**: The Floating Action Button (FAB) was not sticky and scrolled with the page content.
> **Cause**: The "Pull to Refresh" feature introduced a CSS transform that broke the `fixed` positioning context of child elements.
> **Fix**: Moved the `<AddTransactionDialog>` (FAB) component outside of the `<PullToRefresh>` wrapper in both Dashboard and Transaction History pages using React Fragments.

- **Files Updated**:
  - `app/page.tsx`: Moved FAB outside `PullToRefresh`.
  - `app/transactions/page.tsx`: Moved FAB outside `PullToRefresh`.
  - `components/app-version.tsx`: Updated version to v1.3.10.

## [1.3.9] - 2026-01-16

### Improvements - Mobile Experience (PWA)
> **Note**: This release enhances the mobile experience by adding a native-like Pull-to-Refresh gesture.

- **Pull to Refresh**:
  - Implemented "Pull to Refresh" functionality on the **Dashboard** and **Transaction History** pages.
  - User can pull down from the top of the screen to reload data.
  - Added a branded loading spinner (Green `#598c58`) for visual feedback.
  - Critical for PWA users who don't have a browser refresh button.

### Technical Details
- **New Component**: 
  - `components/ui/pull-to-refresh.tsx` - Handle pull gestures.
  - `components/app-version.tsx` - Reuseable version footer.
- Integrated `PullToRefresh` into `app/page.tsx` and `app/transactions/page.tsx`.
- Integrated `AppVersion` into all main pages to replace hardcoded version strings.
- Updated version indicator to `v1.3.9`.

## [1.3.8] - 2026-01-16

### Performance - Database Optimization
> **Note**: This release focuses on optimizing database performance to ensure the app remains fast as data grows.

- **Query Optimization**:
  - Rewrote **`get_dashboard_data` RPC** to use **Single Pass Aggregation**.
  - Previously: Dashboard loaded via ~10 separate queries.
  - Now: Dashboard loads via ~2 optimized queries.
  - Result: Significantly reduced database load and faster dashboard response time.

- **Indexing**:
  - Added Composite Index `idx_transactions_filter` on `(family_id, user_id, date)`.
  - Added Index `idx_transactions_date`.
  - Result: Drastically improved filtering speed for Transaction History and Monthly Stats.

- **RLS Optimization**:
  - Updated `get_user_family_id()` helper to be `STABLE`.
  - Helps Postgres cache permission checks, reducing redundant computations during RLS policy execution.

### Technical Details
- **SQL Script**: `sql_backup/202601161630_optimize_performance_v1.3.8.sql`.
- **Modified RPC**: `get_dashboard_data`.
- Updated version indicator to `v1.3.8`.

## [1.3.7] - 2026-01-16

### Bug Fix - Transaction History Empty
> **Issue**: Family/Account owners saw an empty transaction history page due to RLS Infinite Recursion.
> **Fix**: Updated RLS policies to use a `SECURITY DEFINER` helper function (`get_user_family_id`), breaking the recursion loop.

- **Database**:
  - Updated RLS policies for `family_members`, `families`, `transactions`, `wallets`, `debts`, `funds`.
  - Redefined `get_user_family_id()` to ensure it returns the correct family context without triggering RLS loops.

## [1.3.6] - 2026-01-16

### Major Feature - Account Management
> **Note:** Users can now manage their personal profile, including Display Name.

- **New Page: My Account (`/account`)**:
  - Displays user avatar (initials) and email.
  - **Edit Profile**: Allows updating **Display Name**. This name will be used across the application (Greeting, Family Members, Wallet Owners).
  - Logout button integrated into the account page.

- **UI Updates**:
  - **Greeting Header**: Now says "Chào buổi sáng, [Tên]!" instead of just "Xin chào!".
  - **User Menu**: Added "Tài khoản" link to the dropdown for quick access.
  - **Family & Dashboard**: Updated to prioritize showing `display_name` over `email` where applicable.

- **Database Updates**:
  - Updated `profiles` table with `display_name`, `avatar_url`, `updated_at`.
  - Added RPC `update_profile` and `get_my_profile`.
  - Updated `get_dashboard_data` and `get_my_family` to join with `profiles`.

### Technical Details
- **SQL Script**: `sql_backup/202601161550_account_management.sql`.
- **New Component**: `app/account/page.tsx`.
- **Server Actions**: `getProfileAction`, `updateProfileAction`.
- Updated version indicator to `v1.3.6`.

## [1.3.5] - 2026-01-16

### Hotfix - Notification Hub
> **Critical Fix:** Fixed an issue where inviting a family member caused a database error.

- **Fixed: Column `display_name` does not exist**:
  - Root cause: RPC scripts referenced `profiles.display_name` which is not present in the database schema.
  - Fix: Updated `invite_family_member` and `handle_new_user_notifications` to use `auth.users.email` instead.
  - **SQL Script**: `sql_backup/202601161445_hotfix_notification_hub.sql`.

## [1.3.4] - 2026-01-16

### Major Feature - Notification Hub & Family Invites
> **Note:** Moved from Email invitations to In-App Notifications for better user experience.

- **Notification Hub**:
  - Added "Bell" icon to Dashboard header.
  - Displays list of notifications with "Red Dot" indicator for unread items.
  - Support for real-time (on refresh) notifications.

- **Improved Family Invitation Flow**:
  - Invitations are now sent directly to the user's Notification Hub.
  - **Expiry**: Invitations now expire after **24 hours** (reduced from 7 days).
  - **New User Support**: If an invited email is not registered, the system queues the notification. When the user registers with that email, they instantly receive the invitation.

- **Notification Item**:
  - Interactive "Accept" and "Decline" buttons directly within the notification list.

### Technical Details
- **Database**:
  - Created `notifications` table (`id`, `user_id`, `type`, `title`, `content`, `data`, `is_read`).
  - Added Trigger `on_auth_user_created_for_notifications` to handle deferred invites for new users.
  - Updated `invite_family_member` RPC to create notification records.
  - Creates `sql_backup/202601161430_notification_hub.sql`.
- **Frontend**:
  - Added `NotificationBell` and `NotificationItem` components.
  - Integrated into `GreetingHeader`.
  - Updated version indicator to `v1.3.4`.

## [1.3.3] - 2026-01-16

### Bug Fixes - Family Feature

> **Critical Fix:** This release fixes bugs that prevented the Family feature from working after creation.

- **Fixed: RLS Circular Dependency**:
  - Root cause: `families` policy checked `family_members`, and `family_members` policy checked `families` → deadlock.
  - Fix: Added direct owner/user checks to break the circular dependency.
  - `families` policy: `owner_id = auth.uid() OR ...`
  - `family_members` policy: `user_id = auth.uid() OR ...`

- **Fixed: Column `profiles.email` does not exist**:
  - Root cause: `get_my_family()` referenced `profiles.email` which doesn't exist in the `profiles` table.
  - Fix: Changed to use `auth.users.email` instead.

- **Fixed: Column `profiles.display_name` does not exist**:
  - Root cause: `get_my_family()` and `get_dashboard_data()` referenced `profiles.display_name`.
  - Fix: Changed to use `auth.users.email` as display_name.

### Technical Details

- **SQL Hotfix**:
  - `sql_backup/202601161300_hotfix_family_bugs.sql` - Contains all fixes.
  - Users who already ran Phase 1-3 scripts need to run this hotfix.

- **Functions Updated**:
  - `get_my_family()` - Fixed column references.
  - `get_dashboard_data()` - Fixed column references.

- **RLS Policies Updated**:
  - `families.Users can view their own family` - Added `owner_id = auth.uid()`.
  - `family_members.Members can view their family members` - Added `user_id = auth.uid()`.

- Updated version indicator to `v1.3.3`.

## [1.3.2] - 2026-01-16

### Major Feature - Family (Phase 3: User Interface)

> **Note:** This release adds the complete UI for managing families. Users can now create families, invite members, and manage their household finances together.

- **New Page: `/family`**:
  - Users without family see a "Create Family" form.
  - Family owners can view members, invite new people, and remove members.
  - Family members can view the member list and leave the family.
  - Pending invitations displayed with cancel option.

- **New Page: `/invite/[token]`**:
  - Invitation acceptance page for invited users.
  - Shows family name, inviter name, and join button.
  - Handles expired/used invitation gracefully.

- **Dashboard Updates**:
  - Family banner displayed below greeting for users in a family.
  - Shows family name and member count with link to management page.
  - Quick access to family settings via banner click.

- **User Menu**:
  - Added "Gia đình" (Family) link in user dropdown.
  - Icon: Users icon for easy recognition.

- **New Server Actions**:
  - `createFamilyAction` - Create a new family.
  - `getMyFamilyAction` - Get current family info.
  - `inviteMemberAction` - Send email invitation.
  - `getInvitationInfoAction` - Get invitation details.
  - `acceptInvitationAction` - Join a family.
  - `leaveFamilyAction` - Leave current family.
  - `removeMemberAction` - Remove a member (owner only).
  - `cancelInvitationAction` - Cancel pending invitation.
  - `updateFamilyNameAction` - Rename family.

### Technical Details

- **New Files**:
  - `app/family/page.tsx` - Family management page.
  - `app/invite/[token]/page.tsx` - Invitation acceptance page.

- **Modified Files**:
  - `app/actions.ts` - Added 9 family-related server actions.
  - `app/page.tsx` - Added family banner and updated version.
  - `components/user-nav.tsx` - Added Family link to dropdown.

- Updated version indicator to `v1.3.2`.

## [1.3.1] - 2026-01-16

### Major Feature - Family (Phase 2: Dashboard Integration)

> **Note:** This release updates the Dashboard to support family data. Users in a family now see aggregated data from all family members.

- **Updated `get_dashboard_data` RPC**:
  - Now checks if user belongs to a family using `get_user_family_id()`.
  - If user has family → queries use `family_id` to fetch aggregated data.
  - If user has no family → queries use `user_id` (personal data, unchanged behavior).
  - Returns additional `family` object with family name, member count, and owner status.
  - Wallet and debt lists now include `owner_name` for family context.

- **Updated Transaction Creation**:
  - `create_transaction_and_update_wallet` - auto-attaches `family_id`.
  - `create_new_debt_v2` - auto-attaches `family_id` to both debt and transaction.
  - `pay_debt` - auto-attaches `family_id` to repayment transaction.
  - `transfer_funds` - auto-attaches `family_id` to transfer transactions.
  - `update_debt_v2` - auto-attaches `family_id` to adjustment transaction.

- **Backward Compatibility**:
  - Users without a family continue to see personal data as before.
  - No changes to the frontend UI required.

### Technical Details

- **SQL Scripts Added**:
  - `sql_backup/202601161200_get_dashboard_data_v2.sql` - Family-aware dashboard data fetching.
  - `sql_backup/202601161230_update_rpc_family.sql` - Updated 5 RPC functions to auto-attach family_id.

- **Query Logic**:
  - Family wallets: Only `visibility = 'shared'` wallets are included.
  - Family debts/transactions: All records with matching `family_id`.
  - Prepared for future private wallet feature.

- Updated version indicator to `v1.3.1`.

## [1.3.0] - 2026-01-16

### Major Feature - Family (Phase 1: Database Foundation)

> **Note:** This release adds the database foundation for the Family feature. UI will be added in future phases.

- **New Database Tables**:
  - `families` - Stores family groups with name, owner, and creation date.
  - `family_members` - Links users to families with roles (`owner` / `member`).
  - `family_invitations` - Manages pending invitations with email, token, and expiration.

- **Schema Updates**:
  - Added `family_id` column to `wallets`, `funds`, `debts`, `transactions` tables.
  - Added `visibility` column to `wallets` for future private wallet feature (`shared` / `private`).
  - Created indexes for all new columns to optimize query performance.

- **Row Level Security (RLS)**:
  - Family members can view shared data within their family.
  - Only data creator (or family owner) can edit/delete records.
  - Users without family continue to use personal dashboard as before.

- **New RPC Functions**:
  - `create_family(name)` - Create a new family, user becomes owner.
  - `get_my_family()` - Get family info including members and pending invitations.
  - `update_family_name(name)` - Update family name (owner only).
  - `leave_family()` - Leave family, auto-transfer ownership if owner leaves.
  - `remove_family_member(user_id)` - Remove member (owner only).
  - `invite_family_member(email)` - Send invitation via email (owner only).
  - `get_invitation_info(token)` - Get invitation details for acceptance page.
  - `accept_invitation(token)` - Accept invitation and join family.
  - `cancel_invitation(invitation_id)` - Cancel pending invitation (owner only).
  - `get_user_family_id()` - Helper to get current user's family ID.
  - `is_family_owner()` - Helper to check if user is family owner.

### Technical Details

- **SQL Scripts Added**:
  - `sql_backup/202601161100_family_tables.sql` - Tables, columns, indexes, and RLS policies.
  - `sql_backup/202601161130_family_rpc.sql` - All RPC functions for family management.

- **Design Decisions**:
  - One user can only be in one family at a time.
  - When owner leaves, ownership transfers to the earliest member.
  - User data is migrated to family upon joining and unlinked upon leaving.
  - Code is prepared for future features: private wallets, personal dashboard.

- Updated version indicator to `v1.3.0`.

## [1.2.8] - 2026-01-16

### Code Quality - Refactoring & Maintainability

- **Centralized Currency Formatting**:
  - Created `utils/format.ts` with unified formatting functions: `formatCurrency()`, `formatNumber()`, `parseFormattedNumber()`.
  - Replaced 9 instances of inline `Intl.NumberFormat` calls across components with centralized utility.
  - Ensures consistent Vietnamese Dong (VND) formatting throughout the application.
  - **Affected Files**: `wallet-option.tsx`, `privacy-amount.tsx`, `money-input.tsx`, `add-transaction-dialog.tsx`, `edit-debt-dialog.tsx`, `financial-overview.tsx`, `financial-progress.tsx`.

- **Type Definitions**:
  - Created `types/index.ts` with TypeScript interfaces for core entities: `Wallet`, `Fund`, `Debt`, `Transaction`.
  - Added type enums: `TransactionType`, `SpendingCategory`, `DebtType`, `DebtInterestLevel`.
  - Added dashboard data types: `FinancialMetrics`, `MonthlyStatsData`, `DashboardData`.
  - Prepares codebase for future "Family" feature with better type-safety.

### Bug Fixes

- **Fixed Nested SelectContent**:
  - Corrected structural bug in `create-debt-dialog.tsx` and `edit-transaction-dialog.tsx` where `<SelectContent>` was incorrectly nested twice.
  - Dropdown menus for wallet selection now render correctly without HTML structure warnings.

### Code Cleanup

- Removed unused `formatMoney` function from `financial-overview.tsx` and `financial-progress.tsx`.
- These components now rely on `PrivacyAmount` which uses the centralized `formatCurrency()`.

### Technical Details

- Added `utils/format.ts` - centralized currency formatting utilities.
- Added `types/index.ts` - TypeScript type definitions for core entities.
- Modified `components/ui/wallet-option.tsx` - uses `formatCurrency`.
- Modified `components/ui/privacy-amount.tsx` - uses `formatCurrency`.
- Modified `components/ui/money-input.tsx` - uses `formatNumber` and `parseFormattedNumber`.
- Modified `components/add-transaction-dialog.tsx` - uses `formatCurrency`.
- Modified `components/edit-debt-dialog.tsx` - uses `formatCurrency`, fixed structure.
- Modified `components/create-debt-dialog.tsx` - fixed nested SelectContent.
- Modified `components/edit-transaction-dialog.tsx` - fixed nested SelectContent.
- Modified `components/financial-overview.tsx` - removed unused formatMoney.
- Modified `components/financial-progress.tsx` - removed unused formatMoney.
- Updated version indicator to `v1.2.8`.

## [1.2.7] - 2026-01-16

### Bug Fixes - UI Display
- **Fixed "NaN đ" Wallet Balance**:
  - Corrected an issue where wallet balances in transaction dialogs (Add/Edit Transaction, Create Debt) displayed as `NaN đ` due to missing data fetching.
  - Updated `app/transactions/page.tsx` to properly retrieve wallet balances from the database.

### UX Improvements - Filters & Refactor
- **Reset Filter Button**:
  - Added a "Reset" (Rotate Icon) button to the Transaction Filter section.
  - Allows users to quickly clear all active search/filter parameters and return to the default view (All transactions, Newest first).
- **UI Refactoring**:
  - Created reusable `WalletOption` component to standardize wallet display (`Name (Balance)`) across the application.
  - Applied consistent pricing formatting (Vietnamese locale) for all wallet dropdowns.

### Technical Details
- Modified `app/transactions/page.tsx` - added balance field to query.
- Modified `components/transaction-filters.tsx` - added reset button logic.
- Created `components/ui/wallet-option.tsx` - new reusable component.
- Refactored `add-transaction-dialog.tsx`, `edit-transaction-dialog.tsx`, `create-debt-dialog.tsx` to use `WalletOption`.
- Updated version indicator to `v1.2.7`.

## [1.2.6] - 2026-01-16

### Bug Fixes - Timezone Logic
- **Fixed Transaction Filtering Issue**:
  - Previously, filtering by "Today" or "Yesterday" used UTC time, causing discrepancies for users in different timezones (e.g., Vietnam UTC+7).
  - **New Logic**: 
    - Frontend now generates date strings based on **Local Device Time**.
    - Backend query applies the local date range [00:00:00 - 23:59:59] converted correctly to UTC.
  - Users will now see accurate results matching their local day when using filters.

### Technical Details
- Updated `components/transaction-filters.tsx` to use local date construction.
- Updated `app/transactions/page.tsx` to force local parsing with `T00:00:00` suffix.
- Updated version indicator to `v1.2.6`.

## [1.2.5] - 2026-01-16

### Features - Enhanced Debt Management (Historical Debts)
- **Historical Debt Entry**:
  - Added support for entering existing debts that have been partially paid before using the app.
  - **New Fields**: 
    - `Paid Amount`: Users can input the amount already paid.
    - `Just Record`: Option to only record the debt ledger without creating a transaction or affecting wallet balances.
  - **Logic**:
    - If "Just Record" is checked: Records debt with `Remaining = Total - Paid` and progress calculated. No wallet changes.
    - If "Just Record" is unchecked: Creates an incoming/outgoing transaction only for the *remaining* amount (actual cash flow).
  - **Solves the use case where users want to track long-term debts without disrupting their current wallet balances.
- **Enhanced Debt Editing**:
  - Updated **Edit Debt Dialog** to support modifying "Paid Amount".
  - **Just Record Mode**: Consistent with creation, users can choose to update the debt ledger only.
  - **Smart Wallet Sync**: If "Just Record" is disabled, the system automatically calculates the difference (new remaining vs old remaining) and creates an adjustment transaction (Income/Expense) to keep the wallet balance accurate.

### Technical Details
- Added `sql_backup/202601160600_create_new_debt_v2.sql` - New RPC `create_new_debt_v2`.
- Added `sql_backup/202601160800_update_debt_v2.sql` - New RPC `update_debt_v2`.
- Updated `components/create-debt-dialog.tsx` - Added UI for Paid Amount and Just Record mode.
- Updated `components/edit-debt-dialog.tsx` - Added UI for Paid Amount and Just Record mode with difference calculation logic.
- Updated `app/actions.ts` - Integrated new RPC logic for both create and update.
- **Data Query Fix**: Updated `get_dashboard_data` RPC to include 'receivable' (loans I gave) in the Debts list, previously hidden by a filter.
- **UI Refinement**: 
  - `DebtCard`: Aligned colors with brand palette (Green for Receivable, Red for Payable). Updated text to "% đã được trả" for loans given.
  - `Create/Edit Debt`: Context-aware labels ("Số tiền đã được trả") for receivable debts.
  - `AddTransaction`: Excluded "Receivable" debts from the "Debt Repayment" list to prevent logic errors.
- **Smart Sorting**: Updated Dashboard Debt list sorting logic:
  1. **Priority 1**: Payable debts (top) -> Receivable loans (bottom).
  2. **Payable Priority**: High Interest -> Low Interest, then Smallest Amount -> Largest Amount (Snowball method).
  3. **Receivable Priority**: Largest Amount -> Smallest Amount.
- **UX Fix**: Removed server-side `revalidatePath("/")` from `updateDebtAction` to prevent page scroll reset on update. Relies on client-side `router.refresh()` for smoother experience.



### Performance Optimizations

- **Unified Dashboard API (Single RPC)**:
  - Consolidated 5 separate API calls (wallets, debts, funds, metrics, monthly_stats) into a single `get_dashboard_data` RPC function.
  - Reduces network overhead and improves Dashboard load time significantly.
  - **Database Script**: `sql_backup/202601152000_get_dashboard_data.sql`

- **Singleton Supabase Client**:
  - Implemented singleton pattern for browser Supabase client to reuse connection instead of creating new instances on every call.
  - Modified `utils/supabase/client.ts`.

- **Optimized Transaction Page Refresh Logic**:
  - Separated data fetching into `fetchStaticData()` (runs once on mount) and `fetchTransactions()` (runs on filter change or CRUD operations).
  - Static data (wallets, debts, funds, user) no longer reloads when adding/editing/deleting transactions.
  - Faster perceived performance after transaction operations.

### UX Improvements

- **Skeleton Loading**:
  - Replaced plain "Đang tải..." text with animated skeleton placeholders.
  - Added `components/ui/skeleton.tsx` with variants: `Skeleton`, `DashboardSkeleton`, `TransactionListSkeleton`.
  - Applied to Transaction History page for smooth loading experience.

### Technical Details
- Modified `app/page.tsx` - Refactored to use single RPC call.
- Modified `app/transactions/page.tsx` - Separated static data fetch from transactions fetch.
- Modified `utils/supabase/client.ts` - Added singleton pattern.
- Added `components/ui/skeleton.tsx` - New skeleton loading components.
- Added `sql_backup/202601152000_get_dashboard_data.sql` - New unified RPC function.

### Bug Fixes
- **Fixed Wallet Balance NaN Display**:
  - PostgreSQL `decimal` type returns as string in JSON response from RPC, causing `Intl.NumberFormat` to display "NaN".
  - Added `Number()` wrapper to all wallet balance references to ensure proper type conversion.
  - **Affected Files**: `add-transaction-dialog.tsx`, `create-debt-dialog.tsx`, `wallet-card.tsx`, `edit-wallet-dialog.tsx`.

- **Transfer Dialog Enhancement**:
  - Added wallet balance preview to "From Wallet" and "To Wallet" dropdowns in Transfer dialog.
  - Renamed "Chuyển Khoản" to "Chuyển Ví" for consistency.

## [1.2.3] - 2026-01-15

### UX Improvements - Input Formatting
- **Smart Currency Input**: 
  - Implemented `MoneyInput` component that auto-formats numbers with Vietnam Style separators (e.g., `1.000.000`) while typing.
  - Ensures raw integer values are sent to the backend for data integrity.
- **Mobile Optimization**: 
  - Enabled **Numeric Keyboard** on mobile devices when focusing on currency fields, eliminating the need to switch keyboard modes.
  - Applied to all financial input dialogs (Transaction, Wallet, Debt).

## [1.2.2] - 2026-01-15

### UX Improvements - Visual Feedback
- **Global Loading Screen**: 
  - Implemented a branded loading screen featuring the Bobo Logo with a gentle **pulse animation**.
  - Provides immediate visual feedback during initial app load and page transitions.
- **Interactive Button Loading**: 
  - All action buttons (Create, Save, Delete, Send) now display a **spinning loader icon** during processing.
  - Replaces static "Loading..." text with dynamic visual indicators, reducing perceived wait time.
  - Applied to all dialogs: Transaction, Wallet, Debt, and Feedback.

## [1.2.1] - 2026-01-15

### UX Improvements - Mobile Optimization
- **Disable Dialog Autofocus**: 
  - Disabled automatic focus functionality on all input dialogs to prevent the mobile keyboard from popping up unexpectedly and covering the screen content.
  - Affected components: `CreateDebtDialog`, `CreateWalletDialog`, `EditDebtDialog`, `EditWalletDialog`, `EditTransactionDialog`.
  - Improves visual clarity and control for users on small screens (390x844).

## [1.2.0] - 2026-01-15

### UI Unification - Global Design System
- **Unified Dialog Styling**:
  - Applied the primary brand color (`#598c58`) to all primary action buttons (Save, Add, Confirm, Send) across all dialogs.
  - Standardized dialog headers to be **centered** and large (`text-xl`) for better visual balance, especially on mobile.
  - Enhanced monetary input fields to be **bold** and larger (`text-lg font-bold`) for easier reading.
  - **Refined Edit Dialogs**: Removed "Cancel" buttons (use X icon). Moved "Delete" action to the bottom with a separator for safety and cleaner UI.
  - **Mobile Optimization**: Removed default `autoFocus` on inputs to prevent keyboard pop-up, improving initial view on mobile.
  - **FAB Redesign**: Implemented a "Segmented Group" tab system `[Expense] [Income] [Other]`. The "Other" tab reveals "Transfer" and "Debt Repayment" options, keeping the interface clean and focused. Active tabs now strictly follow the brand color (`#598c58`).
- **Affected Components**:
  - `AddTransactionDialog` (FAB)
  - `EditTransactionDialog`
  - `EditWalletDialog`
  - `EditDebtDialog`
  - `FeedbackDialog`
  - `CreateWalletDialog` (Previous v1.1.11)
  - `CreateDebtDialog` (Previous v1.1.11)

## [1.1.11] - 2026-01-15

### UI Improvements - FAB & Contextual Actions
- **Streamlined FAB (Unified Add Transaction)**:
  - Refactored the Floating Action Button to focus solely on daily transactions (Income, Expense, Transfer, Debt Repayment).
  - Removed "Create Wallet" and "Create New Debt" options from the FAB to reduce clutter.
- **New Contextual Actions**:
  - **Create Wallet**: Added a `+` button next to the "Ví tiền" (Wallets) section header on the Dashboard.
  - **Create Debt**: Added a `+` button next to the "Các khoản nợ" (Debts) section header on the Dashboard.
  - Improves usability by placing creation actions directly where users look for them.

### Technical Details
- Created `components/create-wallet-dialog.tsx`.
- Created `components/create-debt-dialog.tsx`.
- Refactored `components/add-transaction-dialog.tsx` to remove configuration logic.
- Updated `app/page.tsx` header to include "Contextual Actions".

## [1.1.10] - 2026-01-15

### UI Improvements - Debt Management
- **Integrated Debt Management**:
  - Removed separate "Manage Debts" page (`/debts`) to simplify navigation.
  - **Interactive Debt Cards**: Users can now click directly on a debt card in the Dashboard to edit or delete it.
  - **Edit Dialog**: Updated with a "Delete" button for quick removal of debts.
  - **Real-time Updates**: Dashboard immediately reflects changes after editing or deleting a debt.
  - Removed "Manage Debts" button from Dashboard footer.

### Technical Details
- Converted `components/debt-card.tsx` to Client Component.
- Updated `components/edit-debt-dialog.tsx` to include Delete functionality.
- Deleted `app/debts` directory and `components/debt-item.tsx`.

## [1.1.9] - 2026-01-15

### UI Improvements - Transaction History Page Redesign

- **Filter Layout Redesign**:
  - Reorganized filter component into clear vertical sections with visual separation
  - **Search** section at top with icon and label for better clarity
  - **NEW: Date Range Filter** - Added "from_date" and "to_date" filters using HTML5 date inputs for easy date selection
  - **Type & Wallet Filters** in a 2-column grid for compact layout
  - **Sort** section at bottom with clear labeling
  - Applied consistent styling: `rounded-2xl`, `shadow-sm`, brand color icons (`#598c58`)
  - Better mobile-optimized layout with proper spacing and padding

- **Transaction Item Improvements**:
  - **Simplified Interaction**: Removed 3-dot menu button - entire card is now clickable to edit
  - **Color-Coded Backgrounds**: Each transaction card has subtle background color based on type:
    - Income: Light green (`#598c5815`)
    - Expense: Light red (`#c25e5e15`)
    - Transfer/Debt: Light gray (`#7a869a15`)
  - **Enhanced Visual Feedback**: Added hover effect (shadow + scale) to indicate clickability
  - **Improved Layout**: Icon in white semi-transparent box, better text hierarchy with wallet name & date stacked
  - Cleaner, more modern card design matching app's overall aesthetic

- **Pagination Feature**:
  - Default display: **10 transactions** per page
  - **"Load More" button** to show additional 10 transactions at a time
  - Button shows remaining transaction count for transparency
  - Pagination resets when filters change
  - Improves performance for users with many transactions

- **FAB Button Integration**:
  - Added floating action button to transaction history page
  - Users can create new transactions without returning to dashboard
  - Consistent FAB placement across all app pages

- **Real-time Transaction Refresh** (NEW):
  - **Instant Updates**: New transactions appear immediately after creation without page reload
  - **Seamless UX**: Using state trigger pattern for efficient re-fetching
  - Applied to both Add and Edit transaction flows
  - Scalable solution that works across all pages

- **Delete Button in Edit Dialog** (NEW):
  - Added "Xóa giao dịch" button to edit transaction dialog
  - Red destructive styling with Trash icon for clear visual indication
  - Position: Left side of footer (separated from Save/Cancel actions)
  - Confirmation prompt prevents accidental deletion
  - Auto-refresh after deletion

- **Technical Changes**:
  - Converted `app/transactions/page.tsx` from Server Component to Client Component
  - Created `utils/supabase/client.ts` for client-side data fetching
  - Implemented client-side filtering and pagination logic
  - Date filter supports ISO date format with proper timezone handling
  - Added `refreshTrigger` state for efficient data refresh
  - Added `onSuccess` callback pattern to all transaction components
  - Wrapped page in Suspense boundary for proper `useSearchParams` handling

### Bug Fixes
- Fixed date filtering to include full end date (adds 1 day to `to_date` for inclusive range)
- Fixed Vercel deployment by adding Suspense boundary for `useSearchParams` hook

### Technical Details
- Modified `components/transaction-filters.tsx` - Complete redesign with date range filter
- Modified `components/transaction-item.tsx` - Removed dropdown menu, made card clickable, added background colors, added onSuccess callback
- Modified `components/edit-transaction-dialog.tsx` - Added delete button and onSuccess callback
- Modified `components/add-transaction-dialog.tsx` - Added onSuccess callback for refresh
- Modified `app/transactions/page.tsx` - Converted to client component with pagination, FAB, and refresh trigger
- Added `utils/supabase/client.ts` - Client-side Supabase utility
- Updated version indicator to `v1.1.9`

### Hotfix - Filter UI Improvements

- **Collapsible Filter Section**:
  - Filter section now starts collapsed to save screen space
  - Click header to expand/collapse filter options
  - Shows "Đang lọc" badge when filters are active
  - Cleaner, less cluttered initial view

- **Date Filter Redesign (iOS Compatibility)**:
  - **Replaced date inputs with preset dropdown** for better iOS Safari compatibility
  - Options: Hôm nay, Hôm qua, 7 ngày qua, Tuần này, Tháng này, Tháng trước, Toàn thời gian
  - Simpler, more intuitive UX for mobile users
  - Automatic date range calculation based on selected preset
  - Fixes all iOS date picker compatibility issues

- **Technical Changes**:
  - Added `handleDatePresetChange` function for preset logic
  - Removed date inputs and clear date functionality
  - Added `date_preset` URL parameter to track selected preset
  - Date ranges automatically calculated client-side based on preset selection


### UI Improvements - Login Page
- **Separate Login & Register Tabs**:
  - Implemented a toggle switch at the top of the form for distinct Login and Registration flows.
  - Improves clarity and prevents accidental clicks on mobile devices (390x844 optimized).
  - Uses tabs with clear active/inactive states.

- **Show/Hide Password**:
  - Added an "Eye" icon to the password input field.
  - Allows users to toggle password visibility for better usability.

- **Improved Error Notifications**:
  - Updated error messages to use distinct alert styling (Red for errors, Green for success) with icons.
  - Ensures messages are clearly visible and contextually color-coded.

### Bug Fixes
- **Enter Key Behavior**:
  - Fixed an issue where pressing "Enter" in the login form would trigger the Google Login button instead of submitting the form.
  - Isolated the Google Login button into a separate container to prioritize the main form submission.

### Technical Details
- Modified `app/login/page.tsx` to include state management for tabs and password visibility.
- Updated Dashboard footer version to `v1.1.8`.

## [1.1.7] - 2026-01-14

### UI Improvements - Dashboard Redesign

- **New Greeting Header**:
  - Replaced static header "💰 Tài sản của tôi" with a **time-based greeting** that changes throughout the day.
  - Greeting variations:
    - ☀️ "Chào buổi sáng!" (5:00 - 11:59)
    - 🌤️ "Chào buổi chiều!" (12:00 - 17:59)
    - 🌙 "Chào buổi tối!" (18:00 - 21:59)
    - 🌃 "Khuya rồi, nghỉ ngơi nhé!" (22:00 - 4:59)
  - Privacy Toggle and User Menu remain accessible on the right side.

- **Separated Net Worth Section**:
  - Net Worth is now displayed prominently in its own section immediately after the greeting.
  - Large, bold text with **brand color `#598c58`** for positive emphasis.
  - Supports Privacy Mode masking.

- **Unified Financial Progress Section**:
  - Replaced the previous 2-card layout (Safety + Freedom) with a **single, streamlined progress section**.
  - Displays **Chi tiêu tối thiểu** (Minimum Monthly Spend) and **Chi tiêu tiêu chuẩn** (Standard Monthly Spend) in a compact 2-column layout.
  - **Dynamic Progress Bar**: Shows progress toward the nearest milestone:
    - If not yet reached Safety Target → Shows % progress to **An toàn tài chính**.
    - If Safety Target reached → Shows % progress to **Độc lập tài chính**.
  - **Motivational Text**: "Còn [Amount] nữa để đạt [Target]" displays the remaining amount needed.

- **Monthly Stats Section Redesign**:
  - **Unified Color Palette**: Updated 3-column stats (Thu nhập/Chi tiêu/Còn lại) to use brand colors:
    - Income: `#598c58` (green)
    - Expense: `#c25e5e` (red)
    - Remaining: `#7a869a` (gray) or green if positive
  - **Filled Pie Chart**: Replaced donut chart with a **solid filled pie chart**.
    - Centered horizontally with **50% width** of the section.
    - Legends displayed in a **horizontal row below** the chart.
  - **New Spending Progress Comparison**:
    - **Time Progress Bar**: Shows % of month elapsed (e.g., day 14 of 30 = 47%).
    - **Spending Progress Bar**: Compares actual spending against target:
      - If user has debt → compared to **Minimum Spending**.
      - If no debt → compared to **Standard Spending**.
    - **Dynamic Color Logic**:
      - Spending < Time (by 10%+): Green (good pace)
      - Spending ≈ Time (±10%): Gray (on track)
      - Spending > Time (by 10%+): Red (warning)
    - **Contextual Explanation**: Text explains the comparison basis based on debt status.

- **Wallets Section Redesign**:
  - **Vietnamese Fund Names**: Renamed funds for better localization:
    - Daily Expenses → **Tiền mặt**
    - Emergency Fund → **Quỹ dự phòng khẩn cấp**
    - Sinking Fund → **Quỹ kế hoạch**
    - Investment Fund → **Quỹ đầu tư**
  - **Emergency Fund Status**: New feature showing months of spending coverage:
    - Calculates: `Total Balance / Minimum Monthly Spend`
    - Color-coded badge: Green (>6 months), Gray (3-6 months), Red (<3 months)
    - Displays as "~X.X tháng" badge next to fund name
  - **Unified Design**: Applied design system colors and icons to fund groups and wallet cards
  - **Section Title**: Changed "Thống Kê Tháng Này" → "Thống kê tháng này" (lowercase)

- **Debts Section Redesign**:
  - **Repayment Progress**: Each debt now shows a progress bar with % paid
  - **Progress Badge**: Displays "X% đã trả" with color-coded status:
    - < 30% paid: Red (still a lot to go)
    - 30-70%: Gray (in progress)
    - > 70%: Green (almost done)
  - **Amount Format**: "Còn nợ: X / Y" shows remaining vs total
  - **Empty State**: Friendly "🎉 Tuyệt vời! Bạn không có khoản nợ nào." message

- **Navigation Links Redesign**:
  - **Unified Style**: Cards use `rounded-2xl shadow-sm` to match other sections
  - **Vertical Layout**: Icon above text for cleaner look
  - **Color-coded**: "Lịch sử giao dịch" in green, "Quản lý nợ" in red

- **FAB Button Update**:
  - Changed from blue (`bg-blue-600`) to brand green (`#598c58`)
  - Added `hover:scale-105` effect for better interaction feedback

### Technical Details
- Added `components/greeting-header.tsx` - Client component with time-based greeting logic.
- Added `components/net-worth-section.tsx` - Simple component for Net Worth display.
- Added `components/financial-progress.tsx` - Combined progress section with dynamic milestone targeting.
- Added `components/debt-card.tsx` - Debt card with repayment progress bar.
- Rewrote `components/monthly-stats.tsx` - New design with filled pie chart and time vs spending progress.
- Rewrote `components/fund-group.tsx` - Vietnamese name mapping, Emergency Fund status calculation, unified styling.
- Rewrote `components/wallet-card.tsx` - Simplified design with unified colors.
- Modified `app/page.tsx` - Complete Dashboard layout overhaul with all new components.
- Added `sql_backup/202601142050_rename_funds_vietnamese.sql` - Script to rename funds in database.
- Deprecated usage of `components/financial-overview.tsx` in Dashboard (file retained for backward compatibility).
- Updated version indicator to `v1.1.7`.

### Color Palette Used
- **Positive (Growth/Safety)**: `#598c58`
- **Negative (Decline/Caution)**: `#c25e5e`
- **Neutral (Stability/Info)**: `#7a869a`

## [1.1.6] - 2026-01-14

### UI Improvements - Login Page Redesign
- **Brand Identity**:
  - Added **Bobo Logo** (64x64px) at the top of the login form for immediate brand recognition.
  - Applied **primary brand color `#598c58`** to main action buttons (Login, Google Sign-In) and links.
- **Improved User Experience**:
  - **Reordered login options**: Google Sign-In button is now prominently displayed at the top, as most users prefer this faster authentication method.
  - Added divider text "Hoặc đăng nhập bằng email" (Or sign in with email) to clearly separate login methods.
  - Updated **tagline** to "Quản lý tiền thông minh, đơn giản, an toàn. 🔒" (Smart, simple, secure money management) - shorter and value-focused.
- **Mobile Optimization**:
  - Adjusted padding and spacing for optimal viewing on small screens (390x844 and similar).
  - Increased button heights to 44px+ for better touch targets.

### Features - Demo Mode
- **"Try Before You Sign Up"**:
  - Added "Chưa muốn đăng ký? [Dùng thử ngay]" (Not ready to sign up? Try it now) link on login page.
  - Links to `/?demo=true` allowing new users to explore the app with sample data before committing to registration.
- **Full Demo Dashboard**:
  - Demo mode displays a complete dashboard with sample data: Net Worth (125M VND), 4 Fund Groups, 5 Wallets, 2 Debts, Monthly Statistics.
  - Yellow banner clearly indicates "Chế độ Demo - Dữ liệu mẫu" with a link to login/register.
  - **Privacy Mode automatically disabled** in Demo Mode so users can see all sample numbers clearly.
  - Navigation buttons (History, Manage Debts) are disabled in Demo Mode to prevent confusion.

### Technical Details
- Modified `app/login/page.tsx` with new layout, logo integration, and demo link.
- Copied `icon.png` to `/public/icon.png` for Next.js Image optimization.
- Updated `utils/supabase/middleware.ts` to allow `?demo=true` to bypass authentication.
- Added Demo Mode data and logic in `app/page.tsx` with sample metrics, wallets, funds, and debts.
- Added `components/ui/disable-privacy.tsx` - a helper component to auto-disable Privacy Mode on mount.

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

## [1.4.4] - 2026-01-19

### Feature - Login Page Language Toggle
> **Purpose**: Allow users to switch languages directly from the login screen immediately upon visiting the site.

- **Login Page Toggle**:
  - Added a language toggle switch (VN/EN) at the top right of the Login card.
  - Persistent selection: Language choice is saved to cookies immediately.
  - Interactive: Form labels (Login, Register, Email, Password) update instantly when toggled.

### Technical Details
- **Modified Files**:
  - `app/login/page.tsx`: Integrated `Switch` component and `useLanguage` hook.
  - `components/app-version.tsx`: Bumped version to `v1.4.4`.

> **Note**: This ensures a consistent language experience from the very first interaction with the app.
