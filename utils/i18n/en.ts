/**
 * English Translations - Bobo Finance
 * v1.6.0
 */

import type { TranslationKeys } from "./vi";

export const en: Record<TranslationKeys, string> = {
    // === COMMON LABELS ===
    LABEL_LOADING: "Loading...",
    LABEL_LOADING_DATA: "Loading data...",
    LABEL_LOADING_PAGE: "Loading page...",
    LABEL_SAVING: "Saving...",
    LABEL_DELETING: "Deleting...",
    LABEL_SAVE: "Save",
    LABEL_CANCEL: "Cancel",
    LABEL_DELETE: "Delete",
    LABEL_CONFIRM: "Confirm",
    LABEL_OR: "Or",
    LABEL_ERROR_PREFIX: "Error: ",
    LABEL_SELECT: "Select",
    LABEL_ALL: "All",
    LABEL_NOTE: "Note",
    LABEL_AMOUNT: "Amount",

    // === TRANSACTION TYPES ===
    LABEL_INCOME: "Income",
    LABEL_EXPENSE: "Expense",
    LABEL_TRANSFER: "Transfer",
    LABEL_DEBT_REPAYMENT: "Debt Repayment",
    LABEL_OTHER: "Other",

    // === TRANSACTION DIALOG ===
    LABEL_ADD_TRANSACTION: "Add Transaction",
    LABEL_EDIT_TRANSACTION: "Edit Transaction",
    LABEL_DELETE_TRANSACTION: "Delete Transaction",
    LABEL_SELECT_WALLET: "Select Wallet",
    LABEL_FROM_WALLET: "From Wallet",
    LABEL_TO_WALLET: "To Wallet",
    LABEL_WALLET: "Wallet",
    LABEL_TAKE_FROM_WALLET: "Take from Wallet",

    // === SPENDING CATEGORIES ===
    LABEL_CATEGORY_LEVEL: "Category",
    LABEL_CATEGORY_MUST_HAVE: "✅ Must have",
    LABEL_CATEGORY_NICE_TO_HAVE: "🟡 Nice to have",
    LABEL_CATEGORY_WASTE: "🔴 Waste",
    LABEL_CATEGORY_OTHER_EXPENSE: "📦 Other",
    LABEL_SELECT_CATEGORY: "Select Category",

    // === INCOME SOURCES ===
    LABEL_INCOME_SOURCE: "Income Source",
    LABEL_INCOME_MAIN: "💰 Main Income",
    LABEL_INCOME_BONUS: "🎁 Bonus",
    LABEL_INCOME_INVESTMENT: "📈 Investment & Side Job",
    LABEL_INCOME_OTHER: "📦 Other",
    LABEL_SELECT_SOURCE: "Select Source",

    // === WALLET LABELS ===
    LABEL_WALLETS: "Wallets",
    LABEL_SECTION_WALLETS: "Wallets",
    LABEL_CREATE_WALLET: "Create Wallet",
    LABEL_EDIT_WALLET: "Edit Wallet",
    LABEL_DELETE_WALLET: "Delete Wallet",
    LABEL_WALLET_NAME: "Wallet Name",
    LABEL_CURRENT_BALANCE: "Current Balance",
    LABEL_INITIAL_BALANCE: "Initial Balance",
    LABEL_BELONGS_TO_FUND: "Belongs to Fund",
    LABEL_SAVE_CHANGES: "Save Changes",
    LABEL_NO_WALLETS: "No wallets yet.",
    LABEL_NO_WALLETS_IN_FUND: "No wallets in this fund yet.",
    LABEL_BALANCE_ADJUSTMENT_NOTE: "*System will auto-create an adjustment transaction if balance changes.",

    // === DEBT LABELS ===
    LABEL_DEBTS: "Debts",
    LABEL_SECTION_DEBTS: "Debts",
    LABEL_CREATE_DEBT: "Create New Debt",
    LABEL_EDIT_DEBT: "Edit Debt",
    LABEL_DELETE_DEBT: "Delete Debt",
    LABEL_DEBT_NAME: "Debt Name",
    LABEL_DEBT_AMOUNT: "Debt Amount",
    LABEL_DEBT_TO_PAY: "Debt to Pay",
    LABEL_SELECT_DEBT: "Select Debt",
    LABEL_NO_DEBTS: "No debts!",
    LABEL_NO_DEBTS_CONGRATS: "Great! You have no debts.",
    LABEL_REMAINING_DEBT: "Remaining",

    // === DEBT TYPES ===
    LABEL_DEBT_PAYABLE: "I Owe",
    LABEL_DEBT_RECEIVABLE: "Owed to Me",
    LABEL_DEBT_PAYABLE_FULL: "I Owe (Debt)",
    LABEL_DEBT_PAYABLE_STATUS: "Payable",
    LABEL_DEBT_RECEIVABLE_STATUS: "Receivable",

    // === DEBT PROGRESS ===
    LABEL_PAID_PERCENT: "paid",
    LABEL_RECEIVED_PERCENT: "received",
    LABEL_AMOUNT_PAID: "Amount Paid",
    LABEL_AMOUNT_RECEIVED: "Amount Received",

    // === DEBT RECORD MODE ===
    LABEL_JUST_RECORD: "Record only (No wallet transaction)",
    LABEL_JUST_RECORD_NOTE: "Record mode: Wallet balance won't change.",
    LABEL_WALLET_SYNC_NOTE: "System will add REMAINING amount to wallet.",
    LABEL_NEW_DEBT_NOTE: "Enter 0 if this is a brand new debt.",
    LABEL_WALLET_DISABLED: "Wallet selection disabled",

    // === DEBT WALLET QUESTION ===
    LABEL_WALLET_RECEIVE: "Money goes to which wallet?",
    LABEL_WALLET_TAKE: "Take money from which wallet?",

    // === INTEREST LEVELS ===
    LABEL_INTEREST_LEVEL: "Interest Level",
    LABEL_INTEREST_NONE: "No Interest (Family/Friends)",
    LABEL_INTEREST_LOW: "Low Interest",
    LABEL_INTEREST_MEDIUM: "Medium Interest",
    LABEL_INTEREST_HIGH: "High Interest (Credit Card)",

    // === DASHBOARD SECTIONS ===
    LABEL_MONTHLY_STATS: "📊 This Month's Stats",
    LABEL_FINANCIAL_PROGRESS: "📈 Financial Progress",
    LABEL_MONTHLY_INCOME: "Income",
    LABEL_MONTHLY_EXPENSE: "Expense",
    LABEL_MONTHLY_REMAINING: "Remaining",

    // === SPENDING BREAKDOWN ===
    LABEL_ESSENTIAL: "Must have",
    LABEL_SECONDARY: "Nice to have",
    LABEL_WASTEFUL: "Waste",

    // === PROGRESS LABELS ===
    LABEL_TIME_PROGRESS: "⏱️ Time Progress",
    LABEL_SPENDING_PROGRESS: "💳 Spending Progress",
    LABEL_HAS_DEBT_WARNING: "⚠️ You have debt. Keep spending at minimum.",
    LABEL_SPENDING_COMPARE: "💡 Compared to your standard spending.",

    // === FINANCIAL TARGETS ===
    LABEL_MIN_MONTHLY_SPEND: "Minimum Spending",
    LABEL_STD_MONTHLY_SPEND: "Standard Spending",
    LABEL_PER_MONTH: "/month",
    LABEL_TARGET: "🎯 Target:",
    LABEL_SAFETY_TARGET: "Financial Safety",
    LABEL_FREEDOM_TARGET: "Financial Freedom",
    LABEL_REMAINING_TO_TARGET: "{amount} more to reach {target}",

    // === EMERGENCY FUND ===
    LABEL_MONTHS: "months",
    LABEL_APPROX_MONTHS: "~{n} months",

    // === TRANSACTION HISTORY ===
    LABEL_TRANSACTION_HISTORY: "Transaction History",
    LABEL_FILTER_SEARCH: "Filter & Search",
    LABEL_FILTERING: "Filtering",
    LABEL_RESET_FILTER: "Reset Filters",
    LABEL_SEARCH_BY_NOTE: "Search by note",
    LABEL_SEARCH_PLACEHOLDER: "Enter keyword...",
    LABEL_TAP_TO_FILTER: "Tap to filter & search",

    // === DATE PRESETS ===
    LABEL_DATE_RANGE: "Date Range",
    LABEL_DATE_ALL_TIME: "All Time",
    LABEL_DATE_TODAY: "Today",
    LABEL_DATE_YESTERDAY: "Yesterday",
    LABEL_DATE_LAST_7_DAYS: "Last 7 Days",
    LABEL_DATE_THIS_WEEK: "This Week",
    LABEL_DATE_THIS_MONTH: "This Month",
    LABEL_DATE_LAST_MONTH: "Last Month",

    // === FILTER OPTIONS ===
    LABEL_TYPE: "Type",
    LABEL_SORT: "Sort",
    LABEL_SORT_NEWEST: "Newest",
    LABEL_SORT_OLDEST: "Oldest",
    LABEL_SORT_AMOUNT_HIGH: "Highest Amount",
    LABEL_SORT_AMOUNT_LOW: "Lowest Amount",
    LABEL_ALL_WALLETS: "All Wallets",
    LABEL_ALL_EVENTS: "All Events",
    LABEL_TRANSFER_OUT: "Transfer Out",
    LABEL_TRANSFER_IN: "Transfer In",
    LABEL_LOAD_MORE: "Load More",

    // === USER MENU ===
    LABEL_ACCOUNT: "Account",
    LABEL_FAMILY: "Family",
    LABEL_FEEDBACK: "Feedback",
    LABEL_LOGOUT: "Log Out",
    LABEL_LANGUAGE: "Language",

    // === LOGIN PAGE ===
    LABEL_LOGIN_TITLE: "Login to Bobo",
    LABEL_REGISTER_TITLE: "Create Account",
    LABEL_LOGIN: "Login",
    LABEL_REGISTER: "Register",
    LABEL_TAGLINE: "Smart, simple, secure money management. 🔒",
    LABEL_GOOGLE_LOGIN: "Sign in with Google",
    LABEL_OR_EMAIL: "Or continue with email",
    LABEL_EMAIL: "Email",
    LABEL_PASSWORD: "Password",
    LABEL_TRY_DEMO: "Not ready to sign up?",
    LABEL_TRY_NOW: "Try Demo",
    LABEL_WRONG_CREDENTIALS: "Invalid email or password!",
    LABEL_CHECK_EMAIL: "Please check your email to confirm!",

    // === DEMO MODE ===
    LABEL_DEMO_BANNER: "🎮 Demo Mode - Sample Data",
    LABEL_DEMO_LOGIN_CTA: "Login to use for real",

    // === FAMILY ===
    LABEL_MEMBERS: "members",
    LABEL_MANAGE: "Manage →",

    // === NOTIFICATIONS ===
    LABEL_NOTIFICATIONS: "Notifications",
    LABEL_NO_NOTIFICATIONS: "No new notifications",
    LABEL_ACCEPT: "Accept",
    LABEL_DECLINE: "Decline",

    // === FEEDBACK ===
    LABEL_FEEDBACK_TITLE: "Send Feedback",
    LABEL_FEEDBACK_FEATURE: "🔧 Feature",
    LABEL_FEEDBACK_UI: "🎨 Interface",
    LABEL_FEEDBACK_SUBJECT: "Subject",
    LABEL_FEEDBACK_CONTENT: "Feedback Content",
    LABEL_FEEDBACK_SEND: "Send Feedback",
    LABEL_FEEDBACK_SUCCESS: "Thank you for your feedback!",

    // === CONFIRMATION DIALOGS ===
    LABEL_DELETE_WALLET_CONFIRM: "WARNING: Deleting this wallet will DELETE ALL related transactions!\n\nThis action cannot be undone.\nAre you sure?",
    LABEL_DELETE_DEBT_CONFIRM: "WARNING: Deleting debt \"{name}\" will remove ALL repayment history and refund money to wallet. Are you sure?",
    LABEL_DELETE_TRANSACTION_CONFIRM: "Are you sure you want to delete this transaction? Money will be refunded to wallet.",

    // === NEW LABELS (Phase 3 additions) ===
    LABEL_CATEGORY: "Category",
    LABEL_DATE_TIME: "Date & Time",
    LABEL_CREATING: "Creating...",
    LABEL_SENDING: "Sending...",
    LABEL_WALLET_NAME_PLACEHOLDER: "e.g., Spending Jar, Investment...",
    LABEL_SELECT_PARENT_FUND: "Select Parent Fund",
    LABEL_INITIAL_BALANCE_NOTE: "System will auto-create opening balance transaction.",
    LABEL_TOTAL_DEBT_AMOUNT: "Total Debt Amount",
    LABEL_CURRENT_REMAINING: "Current Remaining Balance",
    LABEL_JUST_RECORD_EDIT: "Record only (Don't recalculate wallet)",
    LABEL_WALLET_UPDATE_DIFF: "Select wallet to update difference",
    LABEL_WALLET_DIFF_NOTE: "If remaining changes, difference will be auto-added/subtracted from this wallet.",
    LABEL_FEEDBACK_THANKS: "Thank you for your feedback!",
    LABEL_FEEDBACK_REVIEW: "We will review your feedback.",
    LABEL_SEND_FEEDBACK: "Send Feedback",
    LABEL_NEW: "new",
    LABEL_MARK_ALL_READ: "Mark all as read",

    // === TRANSACTIONS PAGE ===
    LABEL_NO_TRANSACTIONS: "No transactions found.",
    LABEL_LOAD_MORE_TRANSACTIONS: "Load More",
    LABEL_TRANSACTIONS_MORE: "more transactions",

    // === FAMILY PAGE ===
    LABEL_FAMILY_PAGE_TITLE: "Family",
    LABEL_NO_FAMILY: "You don't have a family yet",
    LABEL_NO_FAMILY_DESC: "Create a family to manage finances together",
    LABEL_FAMILY_NAME: "Family Name",
    LABEL_FAMILY_NAME_PLACEHOLDER: "e.g., The Smiths",
    LABEL_CREATE_FAMILY: "Create Family",
    LABEL_MEMBERS_TITLE: "Members",
    LABEL_OWNER_BADGE: "You are the owner",
    LABEL_PENDING_INVITATIONS: "Pending",
    LABEL_INVITE_NEW_MEMBER: "Invite New Member",
    LABEL_INVITE_EMAIL_PLACEHOLDER: "Email of person to invite",
    LABEL_INVITE_NOTE: "Invitee needs to login with the same email and click the invite link.",
    LABEL_LEAVE_FAMILY: "Leave Family",
    LABEL_LEAVE_OWNER_NOTE: "If you leave, ownership will transfer to next member.",
    LABEL_LEAVE_MEMBER_NOTE: "Your data will return to personal mode.",
    LABEL_CONFIRM_LEAVE_FAMILY: "Are you sure you want to leave? Your data will become personal.",
    LABEL_CONFIRM_REMOVE_MEMBER: "Are you sure you want to remove {name} from family?",
    LABEL_INVITE_SENT: "Invitation sent!",

    // === ACCOUNT PAGE ===
    LABEL_ACCOUNT_PAGE_TITLE: "Account",
    LABEL_PERSONAL_INFO: "Personal Information",
    LABEL_DISPLAY_NAME: "Display Name",
    LABEL_DISPLAY_NAME_PLACEHOLDER: "Enter your display name",
    LABEL_DISPLAY_NAME_NOTE: "This name will show in Family and greetings.",
    LABEL_UPDATE_SUCCESS: "Updated successfully!",

    // === PRIVATE WALLET (v1.4.0) ===
    LABEL_WALLET_VISIBILITY: "Wallet Type",
    LABEL_WALLET_SHARED: "Shared with Family",
    LABEL_WALLET_PRIVATE: "Private Wallet",
    LABEL_WALLET_PRIVATE_NOTE: "Private wallet is only visible to you, not counted in family assets.",
    LABEL_PRIVATE_DASHBOARD: "Private Wallets",
    LABEL_PRIVATE_DASHBOARD_TITLE: "My Private Wallets",
    LABEL_PRIVATE_DASHBOARD_EMPTY: "You don't have any private wallets.",
    LABEL_PRIVATE_DASHBOARD_NOTE: "Wallets here are only visible to you and not counted in family assets.",
    LABEL_TOTAL_PRIVATE_BALANCE: "Total Private Balance",
    LABEL_CREATE_PRIVATE_WALLET: "Create Private Wallet",

    // === FUND NAMES ===
    FUND_DAILY_EXPENSES: "Daily Expenses",
    FUND_EMERGENCY: "Emergency Fund",
    FUND_SINKING: "Sinking Fund",
    FUND_INVESTMENT: "Investment Fund",

    // === INVITE PAGE ===
    LABEL_INVITE_TITLE: "Family Invitation",
    LABEL_INVITE_EXPIRED: "Invitation Expired",
    LABEL_INVITE_USED: "This invitation has already been used.",
    LABEL_INVITE_EXPIRED_MSG: "This invitation has expired.",
    LABEL_INVITE_INVALID: "Invalid or expired invitation.",
    LABEL_INVITE_NOT_FOUND: "Invitation not found.",
    LABEL_BACK_TO_LOGIN: "Back to Login",
    LABEL_BACK_TO_HOME: "Back to Home",
    LABEL_WELCOME: "Welcome!",
    LABEL_JOINED_FAMILY: "You have successfully joined the family.",
    LABEL_REDIRECTING: "Redirecting...",
    LABEL_JOIN_FAMILY: "Join Family",
    LABEL_JOINING: "Joining...",
    LABEL_LATER: "Later",
    LABEL_INVITED_BY: "Invited by",
    LABEL_SHARE_DATA_NOTE: "You will share financial data with family members.",

    // === TRANSACTION ITEM ===
    LABEL_TRANSACTION: "Transaction",
    LABEL_DELETED_WALLET: "Deleted Wallet",
    LABEL_PRIVATE_WALLETS_COUNT: "private wallets",

    // === ERROR ===
    LABEL_ERROR: "Error",

    // === DEMO MODE (extended) ===
    LABEL_DEBT_MANAGEMENT: "Debt Management",

    // === GREETINGS ===
    GREETING_MORNING: "Good morning",
    GREETING_AFTERNOON: "Good afternoon",
    GREETING_EVENING: "Good evening",
    GREETING_NIGHT: "It's late, get some rest",

    // === NET WORTH ===
    LABEL_NET_WORTH: "Net Worth",

    // === PRIVACY TOGGLE ===
    LABEL_SHOW_BALANCE: "Show balance",
    LABEL_HIDE_BALANCE: "Hide balance (Private)",

    // === LANGUAGE SETTINGS ===
    LABEL_LANGUAGE_SETTINGS: "Language Settings",
    LABEL_LANGUAGE_VIETNAMESE: "Vietnamese",
    LABEL_LANGUAGE_ENGLISH: "English",
    LABEL_LANGUAGE_NOTE: "Change the display language of the application.",

    // === MISSING LABELS (v1.4.6) ===
    LABEL_FEEDBACK_SUBJECT_PLACEHOLDER: "Ex: Add Excel export...",
    LABEL_FEEDBACK_CONTENT_PLACEHOLDER: "Describe your feedback in detail...",
    ERROR_SAME_WALLET_TRANSFER: "Cannot transfer to the same wallet.",
    NOTE_DEBT_ADJUSTMENT: "Adjustment when editing debt",

    // === PLACEHOLDERS (v1.4.9) ===
    LABEL_DEBT_NAME_PLACEHOLDER: "e.g., Home loan, Lent to friend...",
    LABEL_ENTER_NOTE: "Enter note...",
    LABEL_EMAIL_EXAMPLE: "email@example.com",

    // === TOOLTIP EXPLANATIONS (v1.5.1) ===
    TOOLTIP_NET_WORTH: "Formula: Total Assets − Payable Debts + Receivable Debts. This is your true wealth.",
    TOOLTIP_MIN_MONTHLY_SPEND: "Average \"Must-have\" spending over the last 90 days. This is the minimum to maintain your life.",
    TOOLTIP_STD_MONTHLY_SPEND: "Average \"Must-have + Nice-to-have\" spending over 90 days. This maintains your current quality of life.",
    TOOLTIP_SAFETY_TARGET: "Target = Min Spending × 12 months × 25 years. Based on 4% rule: withdraw 4%/year, money lasts ~25 years.",
    TOOLTIP_FREEDOM_TARGET: "Target = Std Spending × 12 months × 25 years. When reached, you can live comfortably without working.",
    TOOLTIP_SPENDING_PROGRESS: "Compares spending rate vs time elapsed in month. Green = slow (good), Red = fast (warning).",
    TOOLTIP_EXPENSE_CATEGORIES: "3 groups: Must-have (essential), Nice-to-have (quality of life), Waste (unnecessary).",
    TOOLTIP_EMERGENCY_MONTHS: "Emergency Fund ÷ Min Spending. Recommended: 3-6 months. Below 3 months is dangerous.",
    TOOLTIP_DEBT_PRIORITY: "Priority: High interest first, then smallest amount (Snowball method). Reduces interest and builds momentum.",
    /** v1.5.2 Tooltips */
    TOOLTIP_INCOME: "Total income recorded this month (Salary, Bonus, Investment, etc.).",
    TOOLTIP_EXPENSE: "Total actual spending this month. DOES NOT include transfers between your own wallets.",
    TOOLTIP_WALLETS: "Total money you currently have. Grouped by Funds (Jars) for better purpose management.",

    // === EVENT TRACKING (v1.6.0) ===
    LABEL_EVENTS: "Events",
    LABEL_EVENT: "Event",
    LABEL_CREATE_EVENT: "Create Event",
    LABEL_EDIT_EVENT: "Edit Event",
    LABEL_DELETE_EVENT: "Delete Event",
    LABEL_EVENT_NAME: "Event Name",
    LABEL_EVENT_NAME_PLACEHOLDER: "e.g., Trip to Paris, Birthday Party...",
    LABEL_EVENT_BUDGET: "Budget",
    LABEL_EVENT_BUDGET_OPTIONAL: "(Optional)",
    LABEL_EVENT_START_DATE: "Start Date",
    LABEL_EVENT_END_DATE: "End Date",
    LABEL_EVENT_STATUS_ACTIVE: "Active",
    LABEL_EVENT_STATUS_COMPLETED: "Completed",
    LABEL_COMPLETE_EVENT: "Complete Event",
    LABEL_REOPEN_EVENT: "Reopen Event",
    LABEL_NO_BUDGET: "No Limit",
    LABEL_TOTAL_SPENT: "Spent",
    LABEL_BELONGS_TO_EVENT: "Belongs to Event",
    LABEL_NO_ACTIVE_EVENTS: "No active events",
    LABEL_ACTIVE_EVENTS: "Active",
    LABEL_COMPLETED_EVENTS: "Completed",
    LABEL_EVENT_TRANSACTIONS: "Event Transactions",
    LABEL_EVENT_BREAKDOWN: "Spending Breakdown",
    LABEL_EVENT_EMPTY: "No events yet.",
    LABEL_EVENT_NO_TRANSACTIONS: "No transactions in this event yet.",
    LABEL_DELETE_EVENT_CONFIRM: "Delete this event? Transactions will be kept.",
    LABEL_COMPLETE_EVENT_CONFIRM: "Mark this event as completed?",
    LABEL_BUDGET_REMAINING: "Remaining",
    LABEL_BUDGET_OVER: "Over Budget",
    LABEL_SELECT_EVENT: "Select Event",
    LABEL_NO_EVENT: "No Event",
    TOOLTIP_EVENT: "Tag a transaction to an event to track spending separately (trips, work, parties...)",
} as const;
