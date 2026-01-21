# Calculation Logic Documentation - Bobo Finance

> This document describes all calculation logic in the Bobo Finance application, explained in plain language.
> 
> 📘 **This is the "Living Dictionary" of the application** - All logic changes should be updated here.

---

## Table of Contents

1. [Data Overview](#1-data-overview)
2. [Core Financial Calculations](#2-core-financial-calculations)
3. [Monthly Statistics](#3-monthly-statistics)
4. [Transaction Logic](#4-transaction-logic)
5. [Debt Management Logic](#5-debt-management-logic)
6. [Inter-Wallet Transfer Logic](#6-inter-wallet-transfer-logic)
7. [Family Logic](#7-family-logic)
8. [Event Tracking Logic](#8-event-tracking-logic)
9. [Secondary Display Indicators](#9-secondary-display-indicators)
10. [Technical Reference](#10-technical-reference)


---

## 1. Data Overview

### 1.1. User Context

When a user opens the application, the system determines context as follows:

- **Individual user (no family):** All data is queried based on the logged-in user's ID.
  
- **User belonging to a family:** All data is queried based on the family ID that the user has joined. This means the user will see aggregated data for the entire family, not just their own.

> **🔧 Backend:**
> - Helper function: `get_user_family_id()` → Returns `family_id` if user belongs to a family, otherwise returns `NULL`
> - SQL variables: `v_user_id := auth.uid()`, `v_family_id := get_user_family_id()`
> - Query logic: If `v_family_id IS NOT NULL` → query by `family_id`, otherwise query by `user_id`

### 1.2. Transaction Classification

The system classifies transactions into the following types:

| Type | Description | Wallet Effect |
|------|-------------|---------------|
| `income` | Income (salary, other income) | Add money |
| `expense` | Expenses | Subtract money |
| `transfer_out` | Outgoing transfer | Subtract money |
| `transfer_in` | Incoming transfer | Add money |
| `debt_repayment` | Debt payment | Subtract money |

> **🔧 Backend:**
> - PostgreSQL Enum: `transaction_type AS ENUM ('income', 'expense', 'transfer_in', 'transfer_out', 'debt_repayment')`
> - Column: `transactions.type`

### 1.3. Detailed Transaction Categories

**A. Income Categories:**

| Key (Database) | Display | Description |
|----------------|---------|-------------|
| `main_income` | 💰 Main Income | Salary, main business revenue, pension |
| `bonus` | 🎁 Bonus | Year-end bonus, 13th month salary, project bonus |
| `investment` | 📈 Investment & Side Job | Savings interest, stocks, freelance, online selling |
| `other_income` | 📦 Other | Gifts, lottery winnings, found money |

**B. Expense Categories:**

| Key (Database) | Display | Description | Counted in Chart |
|----------------|---------|-------------|------------------|
| `must_have` | ✅ Must Have | Mandatory spending (rent, utilities, food) | ✅ Yes |
| `nice_to_have` | 🟡 Nice to Have | Non-mandatory but quality-of-life spending (entertainment, travel) | ✅ Yes |
| `waste` | 🔴 Waste | Unnecessary spending (regretful purchases) | ✅ Yes |
| `other_expense` | 📦 Other | Special, neutral (currency exchange, balance adjustment) | ❌ No |

> **🔧 Backend:**
> - PostgreSQL Enum: `spending_category` (contains both income and expense categories)
> - Column: `transactions.category_level`
> - Config file: `utils/categories.ts` (centralized category management)

---

## 2. Core Financial Calculations

### 2.1. Total Assets

**Calculation:**
- Sum all current balances of all wallets owned by the user (or family).
- For families, only count wallets marked as "shared", not private wallets.

**Example:** You have 3 wallets: Cash (5M), TPBank (20M), Momo (2M). Total Assets = 27M.

> **🔧 Backend:**
> ```sql
> SELECT COALESCE(SUM(balance), 0) INTO v_total_assets 
> FROM wallets
> WHERE (
>     (v_family_id IS NOT NULL AND family_id = v_family_id AND visibility = 'shared') OR
>     (v_family_id IS NULL AND user_id = v_user_id)
> );
> ```
> - SQL Variable: `v_total_assets`
> - Column: `wallets.balance`, `wallets.visibility`
> - RPC: `get_dashboard_data()` → returns in `metrics.total_assets`

---

### 2.2. Total Payable Debts

**Calculation:**
- Sum all "remaining amount" of debts of type "payable".
- Only count debts not fully paid (remaining balance > 0).

**Example:** You have 2 debts: Laptop loan with 15M remaining, Credit card with 10M remaining. Total Payable Debts = 25M.

> **🔧 Backend:**
> ```sql
> SELECT COALESCE(SUM(remaining_amount), 0) INTO v_total_payable_debts
> FROM debts
> WHERE type = 'payable' AND remaining_amount > 0 AND (
>     (v_family_id IS NOT NULL AND family_id = v_family_id) OR
>     (v_family_id IS NULL AND user_id = v_user_id)
> );
> ```
> - SQL Variable: `v_total_payable_debts`
> - Column: `debts.remaining_amount`, `debts.type`
> - RPC: `get_dashboard_data()` → returns in `metrics.total_debts`

---

### 2.3. Total Receivable Debts

**Calculation:**
- Sum all "remaining to collect" of debts of type "receivable".
- Only count amounts not yet collected (remaining > 0).
- This is money others owe you, to be collected in the future.

**Example:** You lent a friend 3M, not yet repaid. Total Receivable Debts = 3M.

> **🔧 Backend:**
> ```sql
> SELECT COALESCE(SUM(remaining_amount), 0) INTO v_total_receivable_debts
> FROM debts
> WHERE type = 'receivable' AND remaining_amount > 0 AND (
>     (v_family_id IS NOT NULL AND family_id = v_family_id) OR
>     (v_family_id IS NULL AND user_id = v_user_id)
> );
> ```
> - SQL Variable: `v_total_receivable_debts`
> - Column: `debts.remaining_amount`, `debts.type`
> - RPC: `get_dashboard_data()` → returns in `metrics.total_receivable`

---

### 2.4. Net Worth

**Calculation:**
- Take Total Assets, subtract Total Payable Debts, then add Total Receivable Debts.

**Formula:**
```
Net Worth = Total Assets - Payable Debts + Receivable Debts
```

**Meaning:**
- This is your "true value" - the amount you actually own after subtracting all debts and including money others owe you.
- Money you've lent to others is counted as an asset because it will be collected in the future.
- If this number is negative, you owe more than your total value (including receivables).

**Example:** Total Assets 27M, Total Payable Debts 25M, Total Receivable Debts 3M → Net Worth = 27 - 25 + 3 = 5M.

> **🔧 Backend:**
> ```sql
> v_net_worth := v_total_assets - v_total_payable_debts + v_total_receivable_debts;
> ```
> - SQL Variable: `v_net_worth`
> - RPC: `get_dashboard_data()` → returns in `metrics.net_worth`
> - History: 
>   - v1.1.5: `Net Worth = Assets - Debts` (didn't include receivable)
>   - v1.3.12: Updated formula, added `total_receivable`

---

### 2.5. Minimum Monthly Spending

**Calculation:**
1. Get all expense transactions from the last 90 days.
2. Filter only transactions marked as "must_have".
3. Sum the amounts.
4. Divide by 3 (since 90 days = 3 months) to get monthly average.

**Formula:**
```
Min Monthly Spend = SUM(expense where category = 'must_have' in last 90 days) / 3
```

**Meaning:**
- This is the minimum amount you need to maintain your life each month.
- Used to calculate safe financial targets.

**Example:** In the last 90 days, you spent 24M on essentials → Minimum Monthly = 24 ÷ 3 = 8M/month.

> **🔧 Backend:**
> ```sql
> WITH metrics_agg AS (
>     SELECT 
>         SUM(CASE WHEN category_level = 'must_have' THEN amount ELSE 0 END) as must_have_sum
>     FROM transactions
>     WHERE type = 'expense'
>     AND date > (now() - interval '90 days')
>     AND (...user_context...)
> )
> SELECT COALESCE(must_have_sum, 0) / 3 INTO v_min_spend FROM metrics_agg;
> ```
> - SQL Variable: `v_min_spend`
> - Division by zero protection: `IF v_min_spend = 0 THEN v_min_spend := 1; END IF;`
> - RPC: `get_dashboard_data()` → returns in `metrics.min_monthly_spend`

---

### 2.6. Standard Monthly Spending

**Calculation:**
1. Get all expense transactions from the last 90 days.
2. Filter transactions that are "must_have" OR "nice_to_have".
3. Sum the amounts.
4. Divide by 3 to get monthly average.

**Formula:**
```
Std Monthly Spend = SUM(expense where category IN ('must_have', 'nice_to_have') in last 90 days) / 3
```

**Meaning:**
- This is the spending level to maintain your current quality of life (excluding waste).
- Used to calculate financial freedom targets.

**Example:** In the last 90 days, you spent 36M on essentials and nice-to-haves → Standard Monthly = 36 ÷ 3 = 12M/month.

> **🔧 Backend:**
> ```sql
> WITH metrics_agg AS (
>     SELECT 
>         SUM(CASE WHEN category_level IN ('must_have', 'nice_to_have') THEN amount ELSE 0 END) as std_sum
>     FROM transactions
>     WHERE type = 'expense'
>     AND date > (now() - interval '90 days')
>     AND (...user_context...)
> )
> SELECT COALESCE(std_sum, 0) / 3 INTO v_std_spend FROM metrics_agg;
> ```
> - SQL Variable: `v_std_spend`
> - Division by zero protection: `IF v_std_spend = 0 THEN v_std_spend := 1; END IF;`
> - RPC: `get_dashboard_data()` → returns in `metrics.std_monthly_spend`

---

### 2.7. Financial Safety Target

**Calculation:**
- Take Minimum Monthly Spending × 12 months × 25 years.

**Formula:**
```
Safety Target = Min Monthly Spend × 12 × 25
```

**Meaning:**
- This is the amount you need to live comfortably without working (at minimum level).
- The 25 years figure is based on the 4% investment rule: if you withdraw 4% annually from investments, the money lasts approximately 25 years.

**Example:** Minimum monthly 8M → Safety Target = 8 × 12 × 25 = 2.4 billion VND.

> **🔧 Backend:**
> ```sql
> v_safety_target := v_min_spend * 12 * 25;
> ```
> - SQL Variable: `v_safety_target`
> - RPC: `get_dashboard_data()` → returns in `metrics.safety_target`

---

### 2.8. Financial Freedom Target

**Calculation:**
- Take Standard Monthly Spending × 12 months × 25 years.

**Formula:**
```
Freedom Target = Std Monthly Spend × 12 × 25
```

**Meaning:**
- This is the amount you need to live comfortably with your current quality of life without working.
- Higher than Safety Target because it includes "nice to have" spending.

**Example:** Standard monthly 12M → Freedom Target = 12 × 12 × 25 = 3.6 billion VND.

> **🔧 Backend:**
> ```sql
> v_freedom_target := v_std_spend * 12 * 25;
> ```
> - SQL Variable: `v_freedom_target`
> - RPC: `get_dashboard_data()` → returns in `metrics.freedom_target`

---

### 2.9. Progress Toward Goals

**Formula:**
```
Safety Progress = (Net Worth / Safety Target) × 100
Freedom Progress = (Net Worth / Freedom Target) × 100
```

**Dashboard Display:**
- If Safety not yet achieved: Show progress bar toward Financial Safety.
- If Safety achieved but not Freedom: Show progress bar toward Financial Freedom.

> **🔧 Backend:**
> ```sql
> 'safety_progress', CASE WHEN v_safety_target > 0 THEN (v_net_worth / v_safety_target) * 100 ELSE 0 END,
> 'freedom_progress', CASE WHEN v_freedom_target > 0 THEN (v_net_worth / v_freedom_target) * 100 ELSE 0 END
> ```
> - RPC: `get_dashboard_data()` → returns in `metrics.safety_progress`, `metrics.freedom_progress`
> - Frontend: `components/financial-progress.tsx`

---

## 3. Monthly Statistics

### 3.1. Monthly Income

**Calculation:**
- Sum all amounts of "income" type transactions in the selected month.
- Month range is determined from day 1 to the last day of that month (in user's timezone).

> **🔧 Backend:**
> ```sql
> v_start_date := make_timestamptz(p_year, p_month, 1, 0, 0, 0, p_timezone);
> v_end_date := v_start_date + interval '1 month';
> 
> SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)
> INTO v_income
> FROM transactions
> WHERE date >= v_start_date AND date < v_end_date AND (...user_context...);
> ```
> - SQL Variable: `v_income`
> - RPC: `get_dashboard_data(p_month, p_year, p_timezone)` → returns in `monthly_stats.income`

---

### 3.2. Monthly Expenses

**Calculation:**
- Sum all amounts of "expense" type transactions in the selected month.
- Does not include inter-wallet transfers (as those are just moving money, not actual spending).

> **🔧 Backend:**
> ```sql
> SELECT COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
> INTO v_expense
> FROM transactions
> WHERE date >= v_start_date AND date < v_end_date AND (...user_context...);
> ```
> - SQL Variable: `v_expense`
> - RPC: `get_dashboard_data()` → returns in `monthly_stats.expense`

---

### 3.3. Remaining Balance

**Formula:**
```
Remaining = Monthly Income - Monthly Expenses
```

**Meaning:**
- Positive: You saved money this month.
- Negative: You spent more than you earned (possibly using savings or borrowing).

> **🔧 Backend:**
> ```sql
> 'remaining', v_income - v_expense
> ```
> - RPC: `get_dashboard_data()` → returns in `monthly_stats.remaining`

---

### 3.4. Spending Breakdown

The system breaks down this month's spending into 3 groups:

| Category | SQL Variable | Description |
|----------|--------------|-------------|
| `must_have` | `v_must_have` | Essential |
| `nice_to_have` | `v_nice_to_have` | Nice to have |
| `waste` | `v_waste` | Wasteful |

These numbers are displayed as a pie chart for easy visualization.

> **🔧 Backend:**
> ```sql
> SELECT 
>     COALESCE(SUM(CASE WHEN type = 'expense' AND category_level = 'must_have' THEN amount ELSE 0 END), 0),
>     COALESCE(SUM(CASE WHEN type = 'expense' AND category_level = 'nice_to_have' THEN amount ELSE 0 END), 0),
>     COALESCE(SUM(CASE WHEN type = 'expense' AND category_level = 'waste' THEN amount ELSE 0 END), 0)
> INTO v_must_have, v_nice_to_have, v_waste
> FROM transactions WHERE ...;
> ```
> - RPC: `get_dashboard_data()` → returns in `monthly_stats.breakdown`
> - Frontend: `components/monthly-stats.tsx` (Pie Chart)

---

### 3.5. Spending Progress Comparison

The system compares your spending rate against elapsed time in the month:

**Time Progress:**
```
Time Progress = (Current Day / Total Days in Month) × 100
```
Example: Day 15 of a 30-day month → Time Progress = 50%.

**Spending Progress:**
```
If has_debt: Spending Progress = (Actual Expense / Min Monthly Spend) × 100
Else:        Spending Progress = (Actual Expense / Std Monthly Spend) × 100
```

**Assessment (Frontend Logic):**

| Condition | Color | Meaning |
|-----------|-------|---------|
| Spending < Time - 10% | Green | Spending slowly, good! |
| Spending ≈ Time (±10%) | Gray | On track |
| Spending > Time + 10% | Red | Warning, spending faster than planned |

> **🔧 Backend:**
> - `has_debt`: `IF v_total_payable_debts > 0 THEN v_has_debt := true; END IF;`
> - RPC: `get_dashboard_data()` → returns `monthly_stats.has_debt`, `monthly_stats.min_spend`, `monthly_stats.std_spend`
> - Frontend: `components/monthly-stats.tsx`

---

## 4. Transaction Logic

### 4.1. Creating Income/Expense Transactions

When you record an income/expense:

1. System creates a new transaction record with corresponding type.
2. Selected wallet balance is updated.
3. If user belongs to a family, transaction is tagged with family ID so all members can see it.

> **🔧 Backend:**
> - RPC: `create_transaction_and_update_wallet(p_wallet_id, p_amount, p_type, p_category, p_note, p_date)`
> - Server Action: `addTransaction()` in `app/actions.ts`
> ```sql
> -- Auto-get family_id
> v_family_id := get_user_family_id();
> 
> -- Insert transaction
> INSERT INTO transactions (user_id, wallet_id, amount, type, category_level, note, date, family_id)
> VALUES (auth.uid(), p_wallet_id, p_amount, p_type, p_category, p_note, p_date, v_family_id);
> 
> -- Update wallet balance
> IF p_type IN ('expense', 'debt_repayment', 'transfer_out') THEN
>     UPDATE wallets SET balance = balance - p_amount WHERE id = p_wallet_id;
> ELSIF p_type IN ('income', 'transfer_in') THEN
>     UPDATE wallets SET balance = balance + p_amount WHERE id = p_wallet_id;
> END IF;
> ```

---

### 4.2. Editing Transactions

When you edit an existing transaction:

**Step 1 - Revert old balance:**
- If old transaction was expense/repayment/transfer_out: Add old amount back to old wallet.
- If old transaction was income/transfer_in: Subtract old amount from old wallet.

**Step 2 - Apply new balance:**
- If transaction is expense/repayment/transfer_out: Subtract new amount from new wallet.
- If transaction is income/transfer_in: Add new amount to new wallet.

**Step 3 - Update information:**
- Update amount, note, date, wallet, spending category with new values.

> **🔧 Backend:**
> - RPC: `update_transaction_v3(p_id, p_new_amount, p_new_note, p_new_date, p_new_wallet_id, p_new_category)`
> - Server Action: `updateTransactionAction()` in `app/actions.ts`
> - Flag: `SECURITY DEFINER` to bypass RLS and update other family members' wallets
> ```sql
> -- Revert OLD amount to OLD wallet
> IF v_type IN ('expense', 'debt_repayment', 'transfer_out') THEN
>     UPDATE wallets SET balance = balance + v_old_amount WHERE id = v_old_wallet_id;
> ELSIF v_type IN ('income', 'transfer_in') THEN
>     UPDATE wallets SET balance = balance - v_old_amount WHERE id = v_old_wallet_id;
> END IF;
> 
> -- Apply NEW amount to NEW wallet
> IF v_type IN ('expense', 'debt_repayment', 'transfer_out') THEN
>     UPDATE wallets SET balance = balance - p_new_amount WHERE id = p_new_wallet_id;
> ELSIF v_type IN ('income', 'transfer_in') THEN
>     UPDATE wallets SET balance = balance + p_new_amount WHERE id = p_new_wallet_id;
> END IF;
> ```

---

### 4.3. Deleting Transactions

When you delete a transaction:

**Revert balance:**
- If transaction was expense/repayment/transfer_out: Add amount back to wallet (since it was subtracted when created).
- If transaction was income/transfer_in: Subtract amount from wallet (since it was added when created).

**Handle related debt (if any):**
- If deleting debt repayment: Add paid amount back to debt's remaining balance.
- If deleting debt creation transaction: Reduce total debt and remaining amount.

**Finally:** Delete the transaction record.

> **🔧 Backend:**
> - RPC: `delete_transaction_v3(p_transaction_id)`
> - Server Action: `deleteTransactionAction()` in `app/actions.ts`
> - Flag: `SECURITY DEFINER` to bypass RLS
> ```sql
> -- Revert money to Wallet
> IF v_type IN ('expense', 'debt_repayment', 'transfer_out') THEN
>     UPDATE wallets SET balance = balance + v_amount WHERE id = v_wallet_id;
> ELSIF v_type IN ('income', 'transfer_in') THEN
>     UPDATE wallets SET balance = balance - v_amount WHERE id = v_wallet_id;
> END IF;
> 
> -- Handle Debt Reversion (if related_debt_id exists)
> IF v_related_debt_id IS NOT NULL THEN
>     IF v_type = 'debt_repayment' THEN
>         UPDATE debts SET remaining_amount = remaining_amount + v_amount WHERE id = v_related_debt_id;
>     ELSIF v_type IN ('income', 'expense') THEN
>         UPDATE debts SET total_amount = total_amount - v_amount, remaining_amount = remaining_amount - v_amount WHERE id = v_related_debt_id;
>     END IF;
> END IF;
> 
> -- Delete transaction
> DELETE FROM transactions WHERE id = p_transaction_id;
> ```

---

## 5. Debt Management Logic

### 5.1. Debt Classification

| Type | Description | Wallet Effect on Creation |
|------|-------------|---------------------------|
| `payable` | Money you owe others | Money in (Income) |
| `receivable` | Money others owe you | Money out (Expense) |

> **🔧 Backend:**
> - PostgreSQL Enum: `debt_type AS ENUM ('payable', 'receivable')`
> - Column: `debts.type`
> - Interest level: `debt_interest_level AS ENUM ('none', 'low', 'medium', 'high')`

---

### 5.2. Creating New Debt

There are 2 creation modes:

**"Just Record" Mode (Just Record = true):**
- Used to record a pre-existing debt.
- Only creates debt record with Total, Paid, and Remaining amounts.
- **No transaction created, no wallet balance affected.**

**Normal Mode (Just Record = false):**
- Used when you just borrowed money.
- Creates debt record AND corresponding transaction.
- Affects wallet per table in section 5.1.

> **🔧 Backend:**
> - RPC: `create_new_debt_v2(p_name, p_total_amount, p_paid_amount, p_type, p_interest, p_wallet_id, p_note, p_date, p_create_transaction)`
> - Server Action: `addTransaction()` with `type === "create_debt"`
> ```sql
> -- Calculate remaining amount
> v_remaining_amount := p_total_amount - p_paid_amount;
> IF v_remaining_amount < 0 THEN v_remaining_amount := 0; END IF;
> 
> -- Create debt
> INSERT INTO debts (user_id, name, total_amount, remaining_amount, type, interest_level, created_at, family_id)
> VALUES (auth.uid(), p_name, p_total_amount, v_remaining_amount, p_type, p_interest, p_date, v_family_id)
> RETURNING id INTO v_new_debt_id;
> 
> -- If create_transaction = true and remaining > 0
> IF p_create_transaction = true AND p_wallet_id IS NOT NULL AND v_remaining_amount > 0 THEN
>     IF p_type = 'payable' THEN
>         -- Borrow → Income
>         INSERT INTO transactions (..., type = 'income', ...);
>         UPDATE wallets SET balance = balance + v_remaining_amount WHERE id = p_wallet_id;
>     ELSIF p_type = 'receivable' THEN
>         -- Lend → Expense
>         INSERT INTO transactions (..., type = 'expense', ...);
>         UPDATE wallets SET balance = balance - v_remaining_amount WHERE id = p_wallet_id;
>     END IF;
> END IF;
> ```

---

### 5.3. Debt Repayment

When you pay a debt:

1. Create `debt_repayment` transaction.
2. Update wallet (subtract if payable, add if receivable).
3. Reduce `remaining_amount` of the debt.

> **🔧 Backend:**
> - RPC: `pay_debt(p_debt_id, p_wallet_id, p_amount)`
> - Server Action: `addTransaction()` with `type === "debt_repayment"`
> ```sql
> -- Create repayment transaction
> INSERT INTO transactions (..., type = 'debt_repayment', related_debt_id = p_debt_id, ...);
> 
> -- Update wallet
> IF v_debt_type = 'payable' THEN
>     UPDATE wallets SET balance = balance - p_amount WHERE id = p_wallet_id;
> ELSE
>     UPDATE wallets SET balance = balance + p_amount WHERE id = p_wallet_id;
> END IF;
> 
> -- Reduce remaining
> UPDATE debts SET remaining_amount = remaining_amount - p_amount WHERE id = p_debt_id;
> ```

---

### 5.4. Debt Repayment Progress

**Formula:**
```
Progress = ((Total Amount - Remaining Amount) / Total Amount) × 100
         = (Paid Amount / Total Amount) × 100
```

**Display (Frontend):**

| Progress | Color | Meaning |
|----------|-------|---------|
| < 30% | Red | Lots of debt remaining |
| 30% - 70% | Gray | Making progress |
| > 70% | Green | Almost paid off |

> **🔧 Frontend:** `components/debt-card.tsx`
> ```tsx
> const progress = ((total_amount - remaining_amount) / total_amount) * 100;
> ```

---

### 5.5. Debt List Sorting

The debt list on Dashboard is sorted by priority:

**Rules:**
1. **Payable before Receivable**
2. **Within Payable:** By interest rate (high → medium → low → none), then by smallest amount first (Snowball method)
3. **Within Receivable:** Largest amount first

> **🔧 Backend:**
> ```sql
> ORDER BY 
>     CASE WHEN d.type = 'payable' THEN 1 ELSE 2 END,
>     CASE WHEN d.type = 'payable' THEN 
>         CASE d.interest_level WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END
>     ELSE 0 END,
>     CASE WHEN d.type = 'payable' THEN d.remaining_amount ELSE NULL END ASC,
>     CASE WHEN d.type = 'receivable' THEN d.remaining_amount ELSE NULL END DESC
> ```

---

### 5.6. Editing Debts

**"Just Record" Mode (update_wallet = false):**
- Only updates information, no wallet effect.

**Update Wallet Mode (update_wallet = true):**
- Calculate difference: `diff = new_remaining - old_remaining`
- Create corresponding adjustment transaction

> **🔧 Backend:**
> - RPC: `update_debt_v2(p_id, p_new_name, p_new_total, p_new_paid, p_wallet_id, p_update_wallet, p_note)`
> - Server Action: `updateDebtAction()`
> ```sql
> v_diff := v_new_remaining - v_old_remaining;
> 
> IF v_diff <> 0 AND p_update_wallet = true THEN
>     -- Payable: diff > 0 = borrowed more (income), diff < 0 = paid back (expense)
>     -- Receivable: diff > 0 = lent more (expense), diff < 0 = collected (income)
>     ...
> END IF;
> ```

---

## 6. Inter-Wallet Transfer Logic

### 6.1. Executing Transfers

When you transfer money from Wallet A to Wallet B:

1. Create 2 transactions: `transfer_out` (Wallet A) and `transfer_in` (Wallet B)
2. Update balances: Wallet A subtract, Wallet B add
3. Both transactions have the same note for easy reconciliation

> **🔧 Backend:**
> - RPC: `transfer_funds(p_from_wallet_id, p_to_wallet_id, p_amount, p_note, p_date)`
> - Server Action: `addTransaction()` with `type === "transfer"`
> ```sql
> -- Subtract from source wallet
> UPDATE wallets SET balance = balance - p_amount WHERE id = p_from_wallet_id;
> 
> -- Add to destination wallet
> UPDATE wallets SET balance = balance + p_amount WHERE id = p_to_wallet_id;
> 
> -- Create 2 transactions
> INSERT INTO transactions (..., wallet_id = p_from_wallet_id, type = 'transfer_out', ...);
> INSERT INTO transactions (..., wallet_id = p_to_wallet_id, type = 'transfer_in', ...);
> ```

### 6.2. Effect on Statistics

- Transfer transactions are **NOT counted** as Income or Expense in monthly statistics.
- Because this is just internal money movement, total assets don't change.

---

## 7. Family Logic

### 7.1. Family Data Aggregation

When a user joins a family:

- All existing personal data (wallets, funds, debts, transactions) gets tagged with family ID.
- From then on, all Dashboard and Statistics queries fetch data for the entire family.
- Each wallet/debt displays owner name for distinction.

> **🔧 Backend:**
> - Tables with `family_id` column: `wallets`, `funds`, `debts`, `transactions`
> - Family RPCs: `create_family()`, `get_my_family()`, `invite_family_member()`, `accept_invitation()`, `leave_family()`, `remove_family_member()`
> - When creating new data, auto-tag `family_id := get_user_family_id()`

---

### 7.2. Shared vs Private Wallets

| Visibility | Who Sees | Counted in Family Total | Display Location |
|------------|----------|-------------------------|------------------|
| `shared` | All members | ✅ Yes | Main Dashboard |
| `private` | Owner only | ❌ No | `/private` page |

**UI Conditions:**
- "Private Wallet" toggle in create dialog: **Only shows when user belongs to a family**
- "Private Wallets" menu in user dropdown: **Only shows when user belongs to a family**
- Users without family: No shared/private distinction needed, all wallets are theirs alone

**Creating Private Wallet:**
1. Open "Create Wallet" dialog on Dashboard or `/private` page
2. Enable "Private Wallet" toggle
3. Wallet is created with `visibility = 'private'`

**Viewing Private Wallets:**
- Access `/private` page from user dropdown menu
- Or click lock icon next to avatar

> **🔧 Backend:**
> - Column: `wallets.visibility` (default `'shared'`)
> - Create RPC: `create_wallet_with_initial_balance(p_name, p_fund_id, p_initial_balance, p_visibility)`
> - Private view RPC: `get_private_dashboard_data()` - returns `{ total_balance, wallets, wallet_count }`
> - Dashboard query condition: `visibility = 'shared'` when querying for family
> - File: `202601181800_private_wallet_feature.sql`

---

### 7.3. Leaving Family

When a member leaves the family:

1. Remove member link from family.
2. Remove `family_id` from all personal data (wallets, funds, debts, transactions).
3. Data returns to individual state.

**If owner leaves:**
- Other members remain: Transfer ownership to earliest joined member.
- Last member: Delete family completely.

> **🔧 Backend:** RPC `leave_family()`

---

### 7.4. Funds in Family Sharing

**Current mechanism:**
- Each user on first login gets **4 default funds** (Daily, Emergency, Sinking, Investment).
- When joining a family, these funds get tagged with `family_id`.
- This leads to a 3-member family having 12 fund records (4 × 3 people) with duplicate names.

**Display handling:**
- When getting fund list for dropdown, use **`DISTINCT ON (name)`** to return only 1 fund per name.
- Ensures "Belongs to Fund" dropdown always shows exactly 4 non-duplicate items.

> **🔧 Backend:**
> ```sql
> SELECT DISTINCT ON (name) id, name FROM funds 
> WHERE family_id = v_family_id 
> ORDER BY name
> ```
> - RPC: `get_dashboard_data()` (v1.3.18)
> - File: `202601170830_fix_duplicate_funds.sql`

---

## 8. Event Tracking Logic

### 8.1. What is an Event?

An Event is a way to group related expenses together for tracking purposes. Examples:
- 🏖️ Travel to Danang
- 💼 Business trip to Hanoi
- 🎉 Birthday party
- 🏠 Home renovation

### 8.2. Event Properties

| Property | Required | Description |
|----------|----------|-------------|
| `name` | ✅ Yes | Event name |
| `budget` | ❌ Optional | Expected spending limit |
| `start_date` | ❌ Optional | When event starts |
| `end_date` | ❌ Optional | When event ends |
| `status` | Auto | `active` or `completed` |
| `visibility` | Auto | `shared` or `private` (family users only) |

### 8.3. How Event Tracking Works

1. **Create Event**: User creates an event with a name and optional budget.
2. **Tag Transactions**: When creating expense transactions, user can optionally tag them to an active event.
3. **View Report**: Event detail page shows total spent, breakdown by category, and list of transactions.
4. **Complete Event**: When done, user marks event as completed for archiving.

### 8.4. Important Rules

- **Transactions still count normally**: An expense tagged to an event is still counted in monthly statistics and affects wallet balance.
- **Events are separate tracking**: They simply group transactions for easier reporting.
- **Only expenses**: Only expense transactions can be tagged to events (not income, transfers, or debt repayments).
- **Private/Shared for family**: If user has a family, they can choose event visibility like wallets.

### 8.5. Calculations

**Total Spent:**
```sql
SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE event_id = ?
```

**Category Breakdown:**
```sql
SELECT 
    SUM(CASE WHEN category_level = 'must_have' THEN amount ELSE 0 END) as must_have,
    SUM(CASE WHEN category_level = 'nice_to_have' THEN amount ELSE 0 END) as nice_to_have,
    SUM(CASE WHEN category_level = 'waste' THEN amount ELSE 0 END) as waste,
    SUM(CASE WHEN category_level = 'other_expense' THEN amount ELSE 0 END) as other
FROM transactions WHERE event_id = ?
```

**Budget Progress:**
```
Progress % = (Total Spent / Budget) × 100
```

> **🔧 Backend:**
> - Table: `events` (id, user_id, family_id, name, budget, start_date, end_date, status, visibility)
> - Column: `transactions.event_id` (nullable FK)
> - RPC: `create_event`, `get_events_list`, `get_event_detail`, `update_event`, `complete_event`, `delete_event`
> - SQL File: `sql_backup/202601210900_event_tracking_feature.sql`

---

## 9. Secondary Display Indicators

### 8.1. Emergency Fund Months

**Formula:**
```
Emergency Months = Total Emergency Fund Balance / Min Monthly Spend
```

**Display:**

| Months | Color | Meaning |
|--------|-------|---------|
| < 3 | Red | Danger |
| 3 - 6 | Gray | Okay |
| > 6 | Green | Safe |

> **🔧 Frontend:** `components/fund-group.tsx` (for fund "Emergency Fund")

---

### 8.2. Time-Based Greetings

| Hour | Greeting | Emoji |
|------|----------|-------|
| 05:00 - 11:59 | `GREETING_TEXT_MORNING` | `GREETING_ICON_MORNING` |
| 12:00 - 17:59 | `GREETING_TEXT_AFTERNOON` | `GREETING_ICON_AFTERNOON` |
| 18:00 - 21:59 | `GREETING_TEXT_EVENING` | `GREETING_ICON_EVENING` |
| 22:00 - 04:59 | `GREETING_TEXT_NIGHT` | `GREETING_ICON_NIGHT` |

> **🔧 Frontend:** `utils/timezone.ts` → `getTimeBasedGreeting()`

---

### 8.3. Currency Formatting

All amounts are formatted according to locale:
- Vietnamese (vi): `1.000.000 ₫` (symbol after, dot separator)
- English (en): `₫1,000,000` (symbol before, comma separator)

> **🔧 Frontend:** `utils/format.ts` → `formatCurrency()`, `formatNumber()`, `parseFormattedNumber()`

---

### 8.4. Privacy Mode

When privacy mode is enabled:
- All amounts on Dashboard screen are replaced with `******`.
- Colors (green/red) are kept to indicate overall financial status without revealing specific numbers.

> **🔧 Frontend:** 
> - Context: `components/providers/privacy-provider.tsx`
> - Component: `components/ui/privacy-amount.tsx`, `components/ui/privacy-toggle.tsx`

---

## 9. Technical Reference

### 9.1. Database Tables

| Table | Description | Creation File |
|-------|-------------|---------------|
| `profiles` | User information | `Original Table Create.sql` |
| `funds` | Funds (Emergency, Daily, ...) | `Original Table Create.sql` |
| `wallets` | Wallets | `Original Table Create.sql` |
| `debts` | Debts | `Original Table Create.sql` |
| `transactions` | Transactions | `Original Table Create.sql` |
| `families` | Families | `202601161100_family_tables.sql` |
| `family_members` | Family members | `202601161100_family_tables.sql` |
| `family_invitations` | Family invitations | `202601161100_family_tables.sql` |
| `notifications` | Notifications | `202601161430_notification_hub.sql` |

### 9.2. Main RPC Functions

| Function | Description | File |
|----------|-------------|------|
| `get_dashboard_data(p_month, p_year, p_timezone)` | Get all Dashboard data | `202601170830_fix_duplicate_funds.sql` |
| `create_transaction_and_update_wallet(...)` | Create transaction + update wallet | `202601161230_update_rpc_family.sql` |
| `update_transaction_v3(...)` | Edit transaction | `202601161815_fix_delete_transaction_v3.sql` |
| `delete_transaction_v3(...)` | Delete transaction | `202601161815_fix_delete_transaction_v3.sql` |
| `create_new_debt_v2(...)` | Create new debt | `202601162230_hotfix_create_debt_family_id.sql` |
| `update_debt_v2(...)` | Edit debt | `202601160800_update_debt_v2.sql` |
| `pay_debt(...)` | Pay debt | `202601161230_update_rpc_family.sql` |
| `transfer_funds(...)` | Transfer between wallets | `202601161230_update_rpc_family.sql` |
| `create_wallet_with_initial_balance(...)` | Create new wallet | `202601162220_fix_create_wallet_family_id.sql` |
| `get_user_family_id()` | Helper to get family_id | `202601161630_optimize_performance_v1.3.8.sql` |

### 9.3. Server Actions (Frontend → Backend)

| Action | File | RPC Called |
|--------|------|------------|
| `addTransaction()` | `app/actions.ts` | Multiple RPCs by type |
| `updateTransactionAction()` | `app/actions.ts` | `update_transaction_v3` |
| `deleteTransactionAction()` | `app/actions.ts` | `delete_transaction_v3` |
| `createWalletAction()` | `app/actions.ts` | `create_wallet_with_initial_balance` |
| `updateWalletAction()` | `app/actions.ts` | `update_wallet_with_adjustment` |
| `deleteWalletAction()` | `app/actions.ts` | Direct delete |
| `updateDebtAction()` | `app/actions.ts` | `update_debt_v2` |
| `deleteDebtAction()` | `app/actions.ts` | `delete_debt` |

### 9.4. Timezone

- Since v1.3.13, all monthly calculations use **user's device timezone**.
- Timezone is saved in Cookie (name: `timezone`) when user opens app.
- If Cookie doesn't exist, defaults to Vietnam timezone (`Asia/Ho_Chi_Minh`).
- Utility: `utils/timezone.ts`

### 9.5. Error Prevention

| Issue | Solution |
|-------|----------|
| Division by zero | If `min_spend = 0` or `std_spend = 0`, auto-set to 1 |
| RLS Circular Dependency | Use `SECURITY DEFINER` for helper functions |
| Family context in RLS | Use `get_user_family_id()` as helper |
| Balance update in Family | Use `SECURITY DEFINER` for transaction v3 functions |

### 9.6. Configuration Constants

Since v1.3.15, all important "magic numbers" are centralized in `utils/constants.ts`:

| Constant | Value | Meaning | Used In |
|----------|-------|---------|---------|
| `SPENDING_CALCULATION_DAYS` | 90 | Days for average spending calculation | SQL: `get_dashboard_data` |
| `SPENDING_CALCULATION_MONTHS` | 3 | 90 days ÷ 30 days/month | SQL: `get_dashboard_data` |
| `MONTHS_IN_YEAR` | 12 | Months in a year | Financial target calculation |
| `RETIREMENT_YEARS` | 25 | 4% rule: withdraw 4%/year for 25 years | Safety/Freedom Target |
| `SPENDING_PROGRESS_THRESHOLD_PERCENT` | 10 | Spending warning threshold (±10%) | `monthly-stats.tsx` |
| `DEBT_PROGRESS_LOW` | 30 | Below 30%: lots of debt (red) | `debt-card.tsx` |
| `DEBT_PROGRESS_HIGH` | 70 | Above 70%: almost done (green) | `debt-card.tsx` |
| `EMERGENCY_FUND_DANGER_MONTHS` | 3 | Below 3 months: danger (red) | `fund-group.tsx` |
| `EMERGENCY_FUND_SAFE_MONTHS` | 6 | Above 6 months: safe (green) | `fund-group.tsx` |
| `GREETING_MORNING_START` | 5 | Morning starts at 05:00 | `timezone.ts` |
| `GREETING_AFTERNOON_START` | 12 | Afternoon starts at 12:00 | `timezone.ts` |
| `GREETING_EVENING_START` | 18 | Evening starts at 18:00 | `timezone.ts` |
| `GREETING_NIGHT_START` | 22 | Night starts at 22:00 | `timezone.ts` |
| `GREETING_TEXT_*` | (text) | Greeting text | `constants.ts` |
| `GREETING_ICON_*` | (icon) | Greeting icon | `constants.ts` |

> ⚠️ **Note**: Constants in SQL (`90`, `3`, `12`, `25`) remain as-is since PostgreSQL doesn't support "global constants". If changing, must update both SQL and `constants.ts`.

### 9.7. Multi-Language Support (i18n)

Since v1.4.1, the application supports switching between Vietnamese and English:

**Structure:**

| File | Description |
|------|-------------|
| `utils/i18n/vi.ts` | Vietnamese translations (~200 labels) |
| `utils/i18n/en.ts` | English translations (~200 labels) |
| `utils/i18n/index.ts` | Module exports and types |
| `components/providers/language-provider.tsx` | React Context and hooks |

**Usage in Components:**
```tsx
import { useTranslation } from "@/components/providers/language-provider";

function MyComponent() {
    const { t } = useTranslation();
    return <p>{t.LABEL_SAVE}</p>; // "Lưu" or "Save"
}
```

**Preference Storage:**
- Cookie name: `language`
- Values: `vi` or `en`
- Duration: 1 year

> **Note**: Legacy `utils/labels.ts` is retained for backward compatibility. Recommend using `useTranslation()` for new components.

---

*Last updated: 2026-01-20*
*Application version: v1.5.0*
