# Tài liệu Logic Tính Toán - Bobo Finance

> Tài liệu này mô tả chi tiết tất cả các logic tính toán trong ứng dụng Bobo Finance, được diễn giải bằng lời văn dễ hiểu.
> 
> 📘 **Đây là "Từ Điển Sống" của ứng dụng** - Mọi thay đổi logic cần được cập nhật tại đây.

---

## Mục Lục

1. [Tổng Quan Dữ Liệu](#1-tổng-quan-dữ-liệu)
2. [Tính Toán Tài Chính Cốt Lõi](#2-tính-toán-tài-chính-cốt-lõi)
3. [Thống Kê Hàng Tháng](#3-thống-kê-hàng-tháng)
4. [Logic Giao Dịch](#4-logic-giao-dịch)
5. [Logic Quản Lý Nợ](#5-logic-quản-lý-nợ)
6. [Logic Chuyển Khoản Giữa Các Ví](#6-logic-chuyển-khoản-giữa-các-ví)
7. [Logic Gia Đình (Family)](#7-logic-gia-đình-family)
8. [Các Chỉ Số Phụ Hiển Thị](#8-các-chỉ-số-phụ-hiển-thị)
9. [Tham Chiếu Kỹ Thuật (Technical Reference)](#9-tham-chiếu-kỹ-thuật-technical-reference)

---

## 1. Tổng Quan Dữ Liệu

### 1.1. Ngữ Cảnh Người Dùng (User Context)

Khi người dùng mở ứng dụng, hệ thống sẽ xác định ngữ cảnh như sau:

- **Người dùng cá nhân (không có gia đình):** Tất cả dữ liệu được truy vấn dựa trên ID của người dùng đang đăng nhập.
  
- **Người dùng thuộc gia đình:** Tất cả dữ liệu được truy vấn dựa trên ID của gia đình mà người dùng đang tham gia. Điều này có nghĩa là người dùng sẽ thấy dữ liệu tổng hợp của cả gia đình, không chỉ riêng mình.

> **🔧 Backend:**
> - Hàm helper: `get_user_family_id()` → Trả về `family_id` nếu user thuộc gia đình, ngược lại trả về `NULL`
> - Biến SQL: `v_user_id := auth.uid()`, `v_family_id := get_user_family_id()`
> - Logic query: Nếu `v_family_id IS NOT NULL` → query theo `family_id`, ngược lại query theo `user_id`

### 1.2. Phân Loại Giao Dịch

Hệ thống phân loại giao dịch thành các loại sau:

| Loại (Type) | Mô tả | Ảnh hưởng Ví |
|-------------|-------|--------------|
| `income` | Thu nhập (lương, thu nhập khác) | Cộng tiền |
| `expense` | Chi tiêu | Trừ tiền |
| `transfer_out` | Chuyển khoản đi | Trừ tiền |
| `transfer_in` | Chuyển khoản đến | Cộng tiền |
| `debt_repayment` | Trả nợ | Trừ tiền |

> **🔧 Backend:**
> - Enum PostgreSQL: `transaction_type AS ENUM ('income', 'expense', 'transfer_in', 'transfer_out', 'debt_repayment')`
> - Cột: `transactions.type`

### 1.3. Phân Loại Chi Tiêu

Mỗi khoản chi tiêu được phân loại theo mức độ cần thiết:

| Key (Database) | Hiển thị | Mô tả | Ví dụ |
|----------------|----------|-------|-------|
| `must_have` | ✅ Thiết yếu | Bắt buộc phải chi | Tiền nhà, điện nước, ăn uống |
| `nice_to_have` | 🟡 Thứ yếu | Không bắt buộc nhưng nâng cao chất lượng sống | Giải trí, du lịch |
| `waste` | 🔴 Lãng phí | Không cần thiết | Mua xong hối hận |

> **🔧 Backend:**
> - Enum PostgreSQL: `spending_category AS ENUM ('must_have', 'nice_to_have', 'waste')`
> - Cột: `transactions.category_level`

---

## 2. Tính Toán Tài Chính Cốt Lõi

### 2.1. Tổng Tài Sản (Total Assets)

**Cách tính:**
- Cộng tất cả số dư hiện tại của toàn bộ ví tiền mà người dùng (hoặc gia đình) sở hữu.
- Nếu là gia đình, chỉ tính các ví được đánh dấu là "chia sẻ" (shared), không tính ví riêng tư.

**Ví dụ:** Bạn có 3 ví: Tiền mặt (5 triệu), TPBank (20 triệu), Momo (2 triệu). Tổng tài sản = 27 triệu.

> **🔧 Backend:**
> ```sql
> SELECT COALESCE(SUM(balance), 0) INTO v_total_assets 
> FROM wallets
> WHERE (
>     (v_family_id IS NOT NULL AND family_id = v_family_id AND visibility = 'shared') OR
>     (v_family_id IS NULL AND user_id = v_user_id)
> );
> ```
> - Biến SQL: `v_total_assets`
> - Cột: `wallets.balance`, `wallets.visibility`
> - RPC: `get_dashboard_data()` → trả về trong `metrics.total_assets`

---

### 2.2. Tổng Nợ Phải Trả (Total Payable Debts)

**Cách tính:**
- Cộng tất cả số tiền "còn phải trả" của các khoản nợ thuộc loại "phải trả" (payable).
- Chỉ tính các khoản nợ chưa trả hết (số dư còn lại lớn hơn 0).

**Ví dụ:** Bạn có 2 khoản nợ: Vay mua laptop còn 15 triệu, Nợ thẻ tín dụng còn 10 triệu. Tổng nợ phải trả = 25 triệu.

> **🔧 Backend:**
> ```sql
> SELECT COALESCE(SUM(remaining_amount), 0) INTO v_total_payable_debts
> FROM debts
> WHERE type = 'payable' AND remaining_amount > 0 AND (
>     (v_family_id IS NOT NULL AND family_id = v_family_id) OR
>     (v_family_id IS NULL AND user_id = v_user_id)
> );
> ```
> - Biến SQL: `v_total_payable_debts`
> - Cột: `debts.remaining_amount`, `debts.type`
> - RPC: `get_dashboard_data()` → trả về trong `metrics.total_debts`

---

### 2.3. Tổng Khoản Cho Vay (Total Receivable Debts)

**Cách tính:**
- Cộng tất cả số tiền "còn phải thu" của các khoản nợ thuộc loại "cho vay" (receivable).
- Chỉ tính các khoản chưa thu hết (số dư còn lại lớn hơn 0).
- Đây là tiền người khác đang nợ bạn, sẽ thu về trong tương lai.

**Ví dụ:** Bạn cho bạn bè vay 3 triệu, họ chưa trả. Tổng khoản cho vay = 3 triệu.

> **🔧 Backend:**
> ```sql
> SELECT COALESCE(SUM(remaining_amount), 0) INTO v_total_receivable_debts
> FROM debts
> WHERE type = 'receivable' AND remaining_amount > 0 AND (
>     (v_family_id IS NOT NULL AND family_id = v_family_id) OR
>     (v_family_id IS NULL AND user_id = v_user_id)
> );
> ```
> - Biến SQL: `v_total_receivable_debts`
> - Cột: `debts.remaining_amount`, `debts.type`
> - RPC: `get_dashboard_data()` → trả về trong `metrics.total_receivable`

---

### 2.4. Tài Sản Ròng (Net Worth)

**Cách tính:**
- Lấy Tổng Tài Sản, trừ đi Tổng Nợ Phải Trả, sau đó cộng thêm Tổng Khoản Cho Vay.

**Công thức:**
```
Net Worth = Total Assets - Payable Debts + Receivable Debts
```

**Ý nghĩa:**
- Đây là "giá trị thực" của bạn - số tiền bạn thực sự sở hữu sau khi trừ hết nợ và tính cả tiền người khác đang nợ bạn.
- Tiền bạn cho người khác vay được tính vào tài sản vì đó là tiền sẽ thu về trong tương lai.
- Nếu số này âm, nghĩa là bạn đang nợ nhiều hơn tổng giá trị bạn có (bao gồm cả khoản cho vay).

**Ví dụ:** Tổng tài sản 27 triệu, Tổng nợ phải trả 25 triệu, Tổng khoản cho vay 3 triệu → Tài sản ròng = 27 - 25 + 3 = 5 triệu.

> **🔧 Backend:**
> ```sql
> v_net_worth := v_total_assets - v_total_payable_debts + v_total_receivable_debts;
> ```
> - Biến SQL: `v_net_worth`
> - RPC: `get_dashboard_data()` → trả về trong `metrics.net_worth`
> - History: 
>   - v1.1.5: `Net Worth = Assets - Debts` (chưa tính receivable)
>   - v1.3.12: Cập nhật công thức mới, thêm `total_receivable`

---

### 2.5. Chi Tiêu Tối Thiểu Hàng Tháng (Minimum Monthly Spend)

**Cách tính:**
1. Lấy tất cả các giao dịch chi tiêu trong 90 ngày gần nhất.
2. Chỉ lọc những giao dịch được đánh dấu là "thiết yếu" (must_have).
3. Cộng tổng số tiền của các giao dịch này.
4. Chia cho 3 (vì 90 ngày = 3 tháng) để ra mức chi tiêu trung bình mỗi tháng.

**Công thức:**
```
Min Monthly Spend = SUM(expense where category = 'must_have' in last 90 days) / 3
```

**Ý nghĩa:**
- Đây là số tiền tối thiểu bạn cần để duy trì cuộc sống mỗi tháng.
- Được dùng để tính các mục tiêu tài chính an toàn.

**Ví dụ:** Trong 90 ngày qua, bạn chi 24 triệu cho các khoản thiết yếu → Chi tiêu tối thiểu = 24 ÷ 3 = 8 triệu/tháng.

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
> - Biến SQL: `v_min_spend`
> - Phòng chia cho 0: `IF v_min_spend = 0 THEN v_min_spend := 1; END IF;`
> - RPC: `get_dashboard_data()` → trả về trong `metrics.min_monthly_spend`

---

### 2.6. Chi Tiêu Tiêu Chuẩn Hàng Tháng (Standard Monthly Spend)

**Cách tính:**
1. Lấy tất cả các giao dịch chi tiêu trong 90 ngày gần nhất.
2. Lọc những giao dịch là "thiết yếu" (must_have) HOẶC "tốt để có" (nice_to_have).
3. Cộng tổng số tiền.
4. Chia cho 3 để ra mức trung bình mỗi tháng.

**Công thức:**
```
Std Monthly Spend = SUM(expense where category IN ('must_have', 'nice_to_have') in last 90 days) / 3
```

**Ý nghĩa:**
- Đây là mức chi tiêu để duy trì chất lượng cuộc sống hiện tại (không tính lãng phí).
- Được dùng để tính mục tiêu tự do tài chính.

**Ví dụ:** Trong 90 ngày qua, bạn chi 36 triệu cho thiết yếu và tốt để có → Chi tiêu tiêu chuẩn = 36 ÷ 3 = 12 triệu/tháng.

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
> - Biến SQL: `v_std_spend`
> - Phòng chia cho 0: `IF v_std_spend = 0 THEN v_std_spend := 1; END IF;`
> - RPC: `get_dashboard_data()` → trả về trong `metrics.std_monthly_spend`

---

### 2.7. Mục Tiêu An Toàn Tài Chính (Safety Target)

**Cách tính:**
- Lấy Chi Tiêu Tối Thiểu Hàng Tháng × 12 tháng × 25 năm.

**Công thức:**
```
Safety Target = Min Monthly Spend × 12 × 25
```

**Ý nghĩa:**
- Đây là số tiền bạn cần có để sống thoải mái mà không cần làm việc nữa (ở mức tối thiểu).
- Con số 25 năm dựa trên quy tắc 4% trong đầu tư: nếu bạn rút 4% mỗi năm từ tài sản đầu tư, tiền sẽ tồn tại khoảng 25 năm.

**Ví dụ:** Chi tiêu tối thiểu 8 triệu/tháng → Mục tiêu an toàn = 8 × 12 × 25 = 2.4 tỷ đồng.

> **🔧 Backend:**
> ```sql
> v_safety_target := v_min_spend * 12 * 25;
> ```
> - Biến SQL: `v_safety_target`
> - RPC: `get_dashboard_data()` → trả về trong `metrics.safety_target`

---

### 2.8. Mục Tiêu Tự Do Tài Chính (Freedom Target)

**Cách tính:**
- Lấy Chi Tiêu Tiêu Chuẩn Hàng Tháng × 12 tháng × 25 năm.

**Công thức:**
```
Freedom Target = Std Monthly Spend × 12 × 25
```

**Ý nghĩa:**
- Đây là số tiền bạn cần có để sống thoải mái với chất lượng cuộc sống hiện tại mà không cần làm việc.
- Cao hơn mục tiêu an toàn vì bao gồm cả các khoản chi "tốt để có".

**Ví dụ:** Chi tiêu tiêu chuẩn 12 triệu/tháng → Mục tiêu tự do = 12 × 12 × 25 = 3.6 tỷ đồng.

> **🔧 Backend:**
> ```sql
> v_freedom_target := v_std_spend * 12 * 25;
> ```
> - Biến SQL: `v_freedom_target`
> - RPC: `get_dashboard_data()` → trả về trong `metrics.freedom_target`

---

### 2.9. Tiến Độ Đạt Mục Tiêu (Progress)

**Công thức:**
```
Safety Progress = (Net Worth / Safety Target) × 100
Freedom Progress = (Net Worth / Freedom Target) × 100
```

**Hiển thị trên Dashboard:**
- Nếu chưa đạt mục tiêu An toàn: Hiển thị thanh tiến trình hướng tới An toàn tài chính.
- Nếu đã đạt An toàn nhưng chưa đạt Tự do: Hiển thị thanh tiến trình hướng tới Tự do tài chính.

> **🔧 Backend:**
> ```sql
> 'safety_progress', CASE WHEN v_safety_target > 0 THEN (v_net_worth / v_safety_target) * 100 ELSE 0 END,
> 'freedom_progress', CASE WHEN v_freedom_target > 0 THEN (v_net_worth / v_freedom_target) * 100 ELSE 0 END
> ```
> - RPC: `get_dashboard_data()` → trả về trong `metrics.safety_progress`, `metrics.freedom_progress`
> - Frontend: `components/financial-progress.tsx`

---

## 3. Thống Kê Hàng Tháng

### 3.1. Thu Nhập Tháng Này (Monthly Income)

**Cách tính:**
- Cộng tất cả số tiền của các giao dịch loại "thu nhập" (income) trong tháng được chọn.
- Phạm vi tháng được xác định từ ngày 1 đến hết ngày cuối cùng của tháng đó (theo múi giờ người dùng).

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
> - Biến SQL: `v_income`
> - RPC: `get_dashboard_data(p_month, p_year, p_timezone)` → trả về trong `monthly_stats.income`

---

### 3.2. Chi Tiêu Tháng Này (Monthly Expense)

**Cách tính:**
- Cộng tất cả số tiền của các giao dịch loại "chi tiêu" (expense) trong tháng được chọn.
- Không tính các khoản chuyển khoản giữa các ví (vì đó chỉ là di chuyển tiền, không phải chi tiêu thật).

> **🔧 Backend:**
> ```sql
> SELECT COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
> INTO v_expense
> FROM transactions
> WHERE date >= v_start_date AND date < v_end_date AND (...user_context...);
> ```
> - Biến SQL: `v_expense`
> - RPC: `get_dashboard_data()` → trả về trong `monthly_stats.expense`

---

### 3.3. Số Dư Còn Lại (Remaining)

**Công thức:**
```
Remaining = Monthly Income - Monthly Expense
```

**Ý nghĩa:**
- Số dương: Bạn tiết kiệm được tiền tháng này.
- Số âm: Bạn chi nhiều hơn thu (có thể đang dùng tiền tiết kiệm hoặc vay).

> **🔧 Backend:**
> ```sql
> 'remaining', v_income - v_expense
> ```
> - RPC: `get_dashboard_data()` → trả về trong `monthly_stats.remaining`

---

### 3.4. Phân Tích Chi Tiêu (Spending Breakdown)

Hệ thống tách chi tiêu tháng này thành 3 nhóm:

| Category | Biến SQL | Mô tả |
|----------|----------|-------|
| `must_have` | `v_must_have` | Thiết yếu |
| `nice_to_have` | `v_nice_to_have` | Tốt để có |
| `waste` | `v_waste` | Lãng phí |

Các con số này được hiển thị dưới dạng biểu đồ tròn để dễ hình dung tỷ lệ.

> **🔧 Backend:**
> ```sql
> SELECT 
>     COALESCE(SUM(CASE WHEN type = 'expense' AND category_level = 'must_have' THEN amount ELSE 0 END), 0),
>     COALESCE(SUM(CASE WHEN type = 'expense' AND category_level = 'nice_to_have' THEN amount ELSE 0 END), 0),
>     COALESCE(SUM(CASE WHEN type = 'expense' AND category_level = 'waste' THEN amount ELSE 0 END), 0)
> INTO v_must_have, v_nice_to_have, v_waste
> FROM transactions WHERE ...;
> ```
> - RPC: `get_dashboard_data()` → trả về trong `monthly_stats.breakdown`
> - Frontend: `components/monthly-stats.tsx` (Pie Chart)

---

### 3.5. So Sánh Tiến Độ Chi Tiêu

Hệ thống so sánh tốc độ chi tiêu của bạn với thời gian đã trôi qua trong tháng:

**Tiến độ Thời gian:**
```
Time Progress = (Current Day / Total Days in Month) × 100
```
Ví dụ: Ngày 15 của tháng có 30 ngày → Tiến độ thời gian = 50%.

**Tiến độ Chi tiêu:**
```
If has_debt: Spending Progress = (Actual Expense / Min Monthly Spend) × 100
Else:        Spending Progress = (Actual Expense / Std Monthly Spend) × 100
```

**Đánh giá (Frontend Logic):**

| Điều kiện | Màu | Ý nghĩa |
|-----------|-----|---------|
| Spending < Time - 10% | Xanh | Đang chi tiêu chậm, tốt! |
| Spending ≈ Time (±10%) | Xám | Đang ổn |
| Spending > Time + 10% | Đỏ | Cảnh báo, đang chi nhanh hơn kế hoạch |

> **🔧 Backend:**
> - `has_debt`: `IF v_total_payable_debts > 0 THEN v_has_debt := true; END IF;`
> - RPC: `get_dashboard_data()` → trả về `monthly_stats.has_debt`, `monthly_stats.min_spend`, `monthly_stats.std_spend`
> - Frontend: `components/monthly-stats.tsx`

---

## 4. Logic Giao Dịch

### 4.1. Tạo Giao Dịch Thu Nhập / Chi Tiêu

Khi bạn ghi nhận một khoản thu nhập/chi tiêu:

1. Hệ thống tạo một dòng giao dịch mới với loại tương ứng.
2. Số dư của ví được chọn sẽ được cập nhật.
3. Nếu người dùng thuộc gia đình, giao dịch được gắn ID gia đình để mọi thành viên đều thấy.

> **🔧 Backend:**
> - RPC: `create_transaction_and_update_wallet(p_wallet_id, p_amount, p_type, p_category, p_note, p_date)`
> - Server Action: `addTransaction()` trong `app/actions.ts`
> ```sql
> -- Tự động lấy family_id
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

### 4.2. Sửa Giao Dịch

Khi bạn sửa một giao dịch đã có:

**Bước 1 - Hoàn lại số dư cũ:**
- Nếu giao dịch cũ là chi tiêu/trả nợ/chuyển đi: Cộng lại số tiền cũ vào ví cũ.
- Nếu giao dịch cũ là thu nhập/chuyển đến: Trừ số tiền cũ khỏi ví cũ.

**Bước 2 - Áp dụng số dư mới:**
- Nếu giao dịch là chi tiêu/trả nợ/chuyển đi: Trừ số tiền mới khỏi ví mới.
- Nếu giao dịch là thu nhập/chuyển đến: Cộng số tiền mới vào ví mới.

**Bước 3 - Cập nhật thông tin:**
- Cập nhật số tiền, ghi chú, ngày, ví, mức độ chi tiêu theo giá trị mới.

> **🔧 Backend:**
> - RPC: `update_transaction_v3(p_id, p_new_amount, p_new_note, p_new_date, p_new_wallet_id, p_new_category)`
> - Server Action: `updateTransactionAction()` trong `app/actions.ts`
> - Flag: `SECURITY DEFINER` để bypass RLS và update ví của thành viên khác trong gia đình
> ```sql
> -- Hoàn lại tiền CŨ vào ví CŨ
> IF v_type IN ('expense', 'debt_repayment', 'transfer_out') THEN
>     UPDATE wallets SET balance = balance + v_old_amount WHERE id = v_old_wallet_id;
> ELSIF v_type IN ('income', 'transfer_in') THEN
>     UPDATE wallets SET balance = balance - v_old_amount WHERE id = v_old_wallet_id;
> END IF;
> 
> -- Trừ/Cộng tiền MỚI vào ví MỚI
> IF v_type IN ('expense', 'debt_repayment', 'transfer_out') THEN
>     UPDATE wallets SET balance = balance - p_new_amount WHERE id = p_new_wallet_id;
> ELSIF v_type IN ('income', 'transfer_in') THEN
>     UPDATE wallets SET balance = balance + p_new_amount WHERE id = p_new_wallet_id;
> END IF;
> ```

---

### 4.3. Xóa Giao Dịch

Khi bạn xóa một giao dịch:

**Hoàn lại số dư:**
- Nếu giao dịch là chi tiêu/trả nợ/chuyển đi: Cộng lại số tiền vào ví (vì lúc tạo đã trừ).
- Nếu giao dịch là thu nhập/chuyển đến: Trừ số tiền khỏi ví (vì lúc tạo đã cộng).

**Xử lý khoản nợ liên quan (nếu có):**
- Nếu xóa giao dịch trả nợ: Cộng lại số tiền đã trả vào "số dư còn lại" của khoản nợ.
- Nếu xóa giao dịch tạo nợ: Giảm tổng nợ và số dư còn lại của khoản nợ đó.

**Cuối cùng:** Xóa dòng giao dịch khỏi hệ thống.

> **🔧 Backend:**
> - RPC: `delete_transaction_v3(p_transaction_id)`
> - Server Action: `deleteTransactionAction()` trong `app/actions.ts`
> - Flag: `SECURITY DEFINER` để bypass RLS
> ```sql
> -- Hoàn tiền lại vào Ví
> IF v_type IN ('expense', 'debt_repayment', 'transfer_out') THEN
>     UPDATE wallets SET balance = balance + v_amount WHERE id = v_wallet_id;
> ELSIF v_type IN ('income', 'transfer_in') THEN
>     UPDATE wallets SET balance = balance - v_amount WHERE id = v_wallet_id;
> END IF;
> 
> -- Xử lý Hoàn Nợ (nếu có related_debt_id)
> IF v_related_debt_id IS NOT NULL THEN
>     IF v_type = 'debt_repayment' THEN
>         UPDATE debts SET remaining_amount = remaining_amount + v_amount WHERE id = v_related_debt_id;
>     ELSIF v_type IN ('income', 'expense') THEN
>         UPDATE debts SET total_amount = total_amount - v_amount, remaining_amount = remaining_amount - v_amount WHERE id = v_related_debt_id;
>     END IF;
> END IF;
> 
> -- Xóa giao dịch
> DELETE FROM transactions WHERE id = p_transaction_id;
> ```

---

## 5. Logic Quản Lý Nợ

### 5.1. Phân Loại Nợ

| Loại (Type) | Mô tả | Ảnh hưởng ví khi tạo |
|-------------|-------|---------------------|
| `payable` | Tiền bạn nợ người khác | Tiền vào (Income) |
| `receivable` | Tiền người khác nợ bạn | Tiền ra (Expense) |

> **🔧 Backend:**
> - Enum PostgreSQL: `debt_type AS ENUM ('payable', 'receivable')`
> - Cột: `debts.type`
> - Mức lãi suất: `debt_interest_level AS ENUM ('none', 'low', 'medium', 'high')`

---

### 5.2. Tạo Khoản Nợ Mới

Có 2 chế độ tạo nợ:

**Chế độ "Chỉ Ghi Nhận" (Just Record = true):**
- Dùng khi ghi lại một khoản nợ đã tồn tại từ trước.
- Chỉ tạo bản ghi nợ với Tổng nợ, Số đã trả, và Số còn lại.
- **Không tạo giao dịch, không ảnh hưởng số dư ví.**

**Chế độ Thông Thường (Just Record = false):**
- Dùng khi vừa vay tiền mới.
- Tạo bản ghi nợ VÀ tạo giao dịch tương ứng.
- Ảnh hưởng ví theo bảng ở mục 5.1.

> **🔧 Backend:**
> - RPC: `create_new_debt_v2(p_name, p_total_amount, p_paid_amount, p_type, p_interest, p_wallet_id, p_note, p_date, p_create_transaction)`
> - Server Action: `addTransaction()` với `type === "create_debt"`
> ```sql
> -- Tính số tiền còn lại
> v_remaining_amount := p_total_amount - p_paid_amount;
> IF v_remaining_amount < 0 THEN v_remaining_amount := 0; END IF;
> 
> -- Tạo khoản nợ
> INSERT INTO debts (user_id, name, total_amount, remaining_amount, type, interest_level, created_at, family_id)
> VALUES (auth.uid(), p_name, p_total_amount, v_remaining_amount, p_type, p_interest, p_date, v_family_id)
> RETURNING id INTO v_new_debt_id;
> 
> -- Nếu create_transaction = true và còn nợ > 0
> IF p_create_transaction = true AND p_wallet_id IS NOT NULL AND v_remaining_amount > 0 THEN
>     IF p_type = 'payable' THEN
>         -- Vay → Income
>         INSERT INTO transactions (..., type = 'income', ...);
>         UPDATE wallets SET balance = balance + v_remaining_amount WHERE id = p_wallet_id;
>     ELSIF p_type = 'receivable' THEN
>         -- Cho vay → Expense
>         INSERT INTO transactions (..., type = 'expense', ...);
>         UPDATE wallets SET balance = balance - v_remaining_amount WHERE id = p_wallet_id;
>     END IF;
> END IF;
> ```

---

### 5.3. Trả Nợ

Khi bạn trả một khoản nợ:

1. Tạo giao dịch `debt_repayment`.
2. Cập nhật ví (trừ tiền nếu payable, cộng tiền nếu receivable).
3. Giảm `remaining_amount` của khoản nợ.

> **🔧 Backend:**
> - RPC: `pay_debt(p_debt_id, p_wallet_id, p_amount)`
> - Server Action: `addTransaction()` với `type === "debt_repayment"`
> ```sql
> -- Tạo giao dịch trả nợ
> INSERT INTO transactions (..., type = 'debt_repayment', related_debt_id = p_debt_id, ...);
> 
> -- Cập nhật ví
> IF v_debt_type = 'payable' THEN
>     UPDATE wallets SET balance = balance - p_amount WHERE id = p_wallet_id;
> ELSE
>     UPDATE wallets SET balance = balance + p_amount WHERE id = p_wallet_id;
> END IF;
> 
> -- Giảm remaining
> UPDATE debts SET remaining_amount = remaining_amount - p_amount WHERE id = p_debt_id;
> ```

---

### 5.4. Tính Tiến Độ Trả Nợ

**Công thức:**
```
Progress = ((Total Amount - Remaining Amount) / Total Amount) × 100
         = (Paid Amount / Total Amount) × 100
```

**Hiển thị (Frontend):**

| Tiến độ | Màu | Ý nghĩa |
|---------|-----|---------|
| < 30% | Đỏ | Còn nhiều nợ |
| 30% - 70% | Xám | Đang trả dần |
| > 70% | Xanh | Sắp trả xong |

> **🔧 Frontend:** `components/debt-card.tsx`
> ```tsx
> const progress = ((total_amount - remaining_amount) / total_amount) * 100;
> ```

---

### 5.5. Sắp Xếp Danh Sách Nợ

Danh sách nợ trên Dashboard được sắp xếp theo thứ tự ưu tiên:

**Quy tắc:**
1. **Payable trước Receivable**
2. **Trong Payable:** Theo lãi suất (high → medium → low → none), rồi theo số tiền nhỏ trước (Snowball method)
3. **Trong Receivable:** Số tiền lớn trước

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

### 5.6. Sửa Khoản Nợ

**Chế độ "Chỉ Ghi Nhận" (update_wallet = false):**
- Chỉ cập nhật thông tin, không ảnh hưởng ví.

**Chế độ Cập nhật Ví (update_wallet = true):**
- Tính chênh lệch: `diff = new_remaining - old_remaining`
- Tạo giao dịch điều chỉnh tương ứng

> **🔧 Backend:**
> - RPC: `update_debt_v2(p_id, p_new_name, p_new_total, p_new_paid, p_wallet_id, p_update_wallet, p_note)`
> - Server Action: `updateDebtAction()`
> ```sql
> v_diff := v_new_remaining - v_old_remaining;
> 
> IF v_diff <> 0 AND p_update_wallet = true THEN
>     -- Payable: diff > 0 = vay thêm (income), diff < 0 = trả bớt (expense)
>     -- Receivable: diff > 0 = cho vay thêm (expense), diff < 0 = thu về (income)
>     ...
> END IF;
> ```

---

## 6. Logic Chuyển Khoản Giữa Các Ví

### 6.1. Thực Hiện Chuyển Khoản

Khi bạn chuyển tiền từ Ví A sang Ví B:

1. Tạo 2 giao dịch: `transfer_out` (Ví A) và `transfer_in` (Ví B)
2. Cập nhật số dư: Ví A trừ, Ví B cộng
3. Cả 2 giao dịch có cùng ghi chú để dễ đối chiếu

> **🔧 Backend:**
> - RPC: `transfer_funds(p_from_wallet_id, p_to_wallet_id, p_amount, p_note, p_date)`
> - Server Action: `addTransaction()` với `type === "transfer"`
> ```sql
> -- Trừ tiền ví nguồn
> UPDATE wallets SET balance = balance - p_amount WHERE id = p_from_wallet_id;
> 
> -- Cộng tiền ví đích
> UPDATE wallets SET balance = balance + p_amount WHERE id = p_to_wallet_id;
> 
> -- Tạo 2 giao dịch
> INSERT INTO transactions (..., wallet_id = p_from_wallet_id, type = 'transfer_out', ...);
> INSERT INTO transactions (..., wallet_id = p_to_wallet_id, type = 'transfer_in', ...);
> ```

### 6.2. Ý Nghĩa Trong Thống Kê

- Các giao dịch chuyển khoản **không được tính** vào Thu nhập hay Chi tiêu của tháng.
- Vì đây chỉ là di chuyển tiền nội bộ, tổng tài sản không thay đổi.

---

## 7. Logic Gia Đình (Family)

### 7.1. Tổng Hợp Dữ Liệu Gia Đình

Khi người dùng tham gia một gia đình:

- Tất cả dữ liệu cá nhân hiện có (ví, quỹ, nợ, giao dịch) sẽ được gắn thêm ID gia đình.
- Từ lúc này, mọi truy vấn Dashboard, Thống kê sẽ lấy dữ liệu của toàn bộ gia đình.
- Mỗi ví/nợ sẽ hiển thị thêm tên chủ sở hữu để phân biệt.

> **🔧 Backend:**
> - Các bảng có cột `family_id`: `wallets`, `funds`, `debts`, `transactions`
> - RPC Family: `create_family()`, `get_my_family()`, `invite_family_member()`, `accept_invitation()`, `leave_family()`, `remove_family_member()`
> - Khi tạo dữ liệu mới, tự động gắn `family_id := get_user_family_id()`

---

### 7.2. Ví Chia Sẻ vs Ví Riêng Tư

| Visibility | Ai thấy | Tính vào tổng gia đình |
|------------|---------|------------------------|
| `shared` | Tất cả thành viên | ✅ Có |
| `private` | Chỉ chủ sở hữu | ❌ Không |

> **🔧 Backend:**
> - Cột: `wallets.visibility` (mặc định `'shared'`)
> - Điều kiện query: `visibility = 'shared'` khi query cho gia đình

---

### 7.3. Rời Khỏi Gia Đình

Khi một thành viên rời khỏi gia đình:

1. Xóa liên kết thành viên khỏi gia đình.
2. Gỡ bỏ `family_id` của tất cả dữ liệu cá nhân (ví, quỹ, nợ, giao dịch).
3. Dữ liệu quay về trạng thái cá nhân.

**Nếu chủ sở hữu rời đi:**
- Còn thành viên khác: Chuyển quyền cho thành viên tham gia sớm nhất.
- Là thành viên cuối: Xóa gia đình hoàn toàn.

> **🔧 Backend:** RPC `leave_family()`

---

### 7.4. Quỹ (Funds) Trong Chia Sẻ Gia Đình

**Cơ chế hiện tại:**
- Mỗi user khi đăng nhập lần đầu được tạo **4 quỹ mặc định riêng** (Daily, Emergency, Sinking, Investment).
- Khi tham gia gia đình, các quỹ này được gắn `family_id`.
- Điều này dẫn đến việc gia đình 3 thành viên có 12 bản ghi quỹ (4 × 3 người) với tên trùng lặp.

**Xử lý hiển thị:**
- Khi lấy danh sách quỹ cho dropdown, sử dụng **`DISTINCT ON (name)`** để chỉ trả về 1 quỹ duy nhất cho mỗi tên.
- Đảm bảo dropdown "Thuộc Quỹ" luôn hiển thị đúng 4 mục không trùng lặp.

> **🔧 Backend:**
> ```sql
> SELECT DISTINCT ON (name) id, name FROM funds 
> WHERE family_id = v_family_id 
> ORDER BY name
> ```
> - RPC: `get_dashboard_data()` (v1.3.18)
> - File: `202601170830_fix_duplicate_funds.sql`

---

## 8. Các Chỉ Số Phụ Hiển Thị

### 8.1. Số Tháng Chi Tiêu Dự Phòng (Emergency Fund Months)

**Công thức:**
```
Emergency Months = Total Emergency Fund Balance / Min Monthly Spend
```

**Hiển thị:**

| Số tháng | Màu | Ý nghĩa |
|----------|-----|---------|
| < 3 | Đỏ | Nguy hiểm |
| 3 - 6 | Xám | Tạm ổn |
| > 6 | Xanh | An toàn |

> **🔧 Frontend:** `components/fund-group.tsx` (cho fund "Emergency Fund" hoặc "Quỹ dự phòng khẩn cấp")

---

### 8.2. Lời Chào Theo Thời Gian

| Giờ | Lời chào | Emoji |
|-----|----------|-------|
| 05:00 - 11:59 | `GREETING_TEXT_MORNING` | `GREETING_ICON_MORNING` |
| 12:00 - 17:59 | `GREETING_TEXT_AFTERNOON` | `GREETING_ICON_AFTERNOON` |
| 18:00 - 21:59 | `GREETING_TEXT_EVENING` | `GREETING_ICON_EVENING` |
| 22:00 - 04:59 | `GREETING_TEXT_NIGHT` | `GREETING_ICON_NIGHT` |

> **🔧 Frontend:** `utils/timezone.ts` → `getTimeBasedGreeting()`

---

### 8.3. Định Dạng Tiền Tệ

Tất cả số tiền được định dạng theo chuẩn Việt Nam:
- Đơn vị: VNĐ (Việt Nam Đồng)
- Dấu phân cách hàng nghìn: dấu chấm (`.`)
- Ví dụ: `1.000.000 đ` (một triệu đồng)

> **🔧 Frontend:** `utils/format.ts` → `formatCurrency()`, `formatNumber()`, `parseFormattedNumber()`

---

### 8.4. Chế Độ Bảo Mật (Privacy Mode)

Khi bật chế độ bảo mật:
- Tất cả số tiền trên màn hình Dashboard được thay bằng `******`.
- Màu sắc (xanh/đỏ) vẫn được giữ để cho biết tình trạng tài chính tổng quan mà không lộ số cụ thể.

> **🔧 Frontend:** 
> - Context: `components/providers/privacy-provider.tsx`
> - Component: `components/ui/privacy-amount.tsx`, `components/ui/privacy-toggle.tsx`

---

## 9. Tham Chiếu Kỹ Thuật (Technical Reference)

### 9.1. Bảng Cơ Sở Dữ Liệu

| Bảng | Mô tả | File tạo |
|------|-------|----------|
| `profiles` | Thông tin user | `Original Table Create.sql` |
| `funds` | Quỹ (Emergency, Daily, ...) | `Original Table Create.sql` |
| `wallets` | Ví tiền | `Original Table Create.sql` |
| `debts` | Khoản nợ | `Original Table Create.sql` |
| `transactions` | Giao dịch | `Original Table Create.sql` |
| `families` | Gia đình | `202601161100_family_tables.sql` |
| `family_members` | Thành viên gia đình | `202601161100_family_tables.sql` |
| `family_invitations` | Lời mời gia đình | `202601161100_family_tables.sql` |
| `notifications` | Thông báo | `202601161430_notification_hub.sql` |

### 9.2. RPC Functions Chính

| Function | Mô tả | File |
|----------|-------|------|
| `get_dashboard_data(p_month, p_year, p_timezone)` | Lấy toàn bộ dữ liệu Dashboard | `202601170830_fix_duplicate_funds.sql` |
| `create_transaction_and_update_wallet(...)` | Tạo giao dịch + cập nhật ví | `202601161230_update_rpc_family.sql` |
| `update_transaction_v3(...)` | Sửa giao dịch | `202601161815_fix_delete_transaction_v3.sql` |
| `delete_transaction_v3(...)` | Xóa giao dịch | `202601161815_fix_delete_transaction_v3.sql` |
| `create_new_debt_v2(...)` | Tạo khoản nợ mới | `202601162230_hotfix_create_debt_family_id.sql` |
| `update_debt_v2(...)` | Sửa khoản nợ | `202601160800_update_debt_v2.sql` |
| `pay_debt(...)` | Trả nợ | `202601161230_update_rpc_family.sql` |
| `transfer_funds(...)` | Chuyển khoản | `202601161230_update_rpc_family.sql` |
| `create_wallet_with_initial_balance(...)` | Tạo ví mới | `202601162220_fix_create_wallet_family_id.sql` |
| `get_user_family_id()` | Helper lấy family_id | `202601161630_optimize_performance_v1.3.8.sql` |

### 9.3. Server Actions (Frontend → Backend)

| Action | File | RPC gọi |
|--------|------|---------|
| `addTransaction()` | `app/actions.ts` | Nhiều RPC tùy loại |
| `updateTransactionAction()` | `app/actions.ts` | `update_transaction_v3` |
| `deleteTransactionAction()` | `app/actions.ts` | `delete_transaction_v3` |
| `createWalletAction()` | `app/actions.ts` | `create_wallet_with_initial_balance` |
| `updateWalletAction()` | `app/actions.ts` | `update_wallet_with_adjustment` |
| `deleteWalletAction()` | `app/actions.ts` | Direct delete |
| `updateDebtAction()` | `app/actions.ts` | `update_debt_v2` |
| `deleteDebtAction()` | `app/actions.ts` | `delete_debt` |

### 9.4. Múi Giờ

- Kể từ v1.3.13, tất cả tính toán theo tháng sử dụng **múi giờ của thiết bị người dùng**.
- Múi giờ được lưu trong Cookie (tên: `timezone`) khi người dùng mở app.
- Nếu Cookie chưa có, mặc định sử dụng múi giờ Việt Nam (`Asia/Ho_Chi_Minh`).
- Utility: `utils/timezone.ts`

### 9.5. Phòng Tránh Lỗi

| Vấn đề | Giải pháp |
|--------|-----------|
| Chia cho 0 | Nếu `min_spend = 0` hoặc `std_spend = 0`, tự động đặt = 1 |
| RLS Circular Dependency | Dùng `SECURITY DEFINER` cho helper functions |
| Family context trong RLS | Dùng `get_user_family_id()` làm helper |
| Balance update trong Family | Dùng `SECURITY DEFINER` cho transaction v3 functions |

### 9.6. Hằng Số Cấu Hình (Constants)

Kể từ v1.3.15, tất cả các "magic numbers" quan trọng được tập trung trong file `utils/constants.ts`:

| Hằng số | Giá trị | Ý nghĩa | Dùng trong |
|---------|---------|---------|------------|
| `SPENDING_CALCULATION_DAYS` | 90 | Số ngày để tính chi tiêu trung bình | SQL: `get_dashboard_data` |
| `SPENDING_CALCULATION_MONTHS` | 3 | 90 ngày ÷ 30 ngày/tháng | SQL: `get_dashboard_data` |
| `MONTHS_IN_YEAR` | 12 | Số tháng trong năm | Tính mục tiêu tài chính |
| `RETIREMENT_YEARS` | 25 | Quy tắc 4%: rút 4%/năm trong 25 năm | Tính Safety/Freedom Target |
| `SPENDING_PROGRESS_THRESHOLD_PERCENT` | 10 | Ngưỡng cảnh báo chi tiêu (±10%) | `monthly-stats.tsx` |
| `DEBT_PROGRESS_LOW` | 30 | Dưới 30%: còn nhiều nợ (đỏ) | `debt-card.tsx` |
| `DEBT_PROGRESS_HIGH` | 70 | Trên 70%: sắp xong (xanh) | `debt-card.tsx` |
| `EMERGENCY_FUND_DANGER_MONTHS` | 3 | Dưới 3 tháng: nguy hiểm (đỏ) | `fund-group.tsx` |
| `EMERGENCY_FUND_SAFE_MONTHS` | 6 | Trên 6 tháng: an toàn (xanh) | `fund-group.tsx` |
| `GREETING_MORNING_START` | 5 | Buổi sáng bắt đầu từ 05:00 | `timezone.ts` |
| `GREETING_AFTERNOON_START` | 12 | Buổi chiều bắt đầu từ 12:00 | `timezone.ts` |
| `GREETING_EVENING_START` | 18 | Buổi tối bắt đầu từ 18:00 | `timezone.ts` |
| `GREETING_NIGHT_START` | 22 | Khuya bắt đầu từ 22:00 | `timezone.ts` |
| `GREETING_TEXT_*` | (text) | Văn bản lời chào | `constants.ts` |
| `GREETING_ICON_*` | (icon) | Icon lời chào | `constants.ts` |

> ⚠️ **Lưu ý**: Các hằng số trong SQL (`90`, `3`, `12`, `25`) được giữ nguyên do PostgreSQL không hỗ trợ "global constants". Nếu cần thay đổi, phải sửa cả SQL và file `constants.ts`.

### 9.7. Nhãn UI (Labels) - i18n Preparation

Kể từ v1.3.19, tất cả text UI được tập trung trong file `utils/labels.ts` để chuẩn bị cho đa ngôn ngữ:

| Nhóm | Ví dụ | Số lượng |
|------|-------|----------|
| Common | `LABEL_LOADING`, `LABEL_SAVE`, `LABEL_CANCEL` | ~15 |
| Transactions | `LABEL_INCOME`, `LABEL_EXPENSE`, `LABEL_TRANSFER` | ~20 |
| Wallets | `LABEL_CREATE_WALLET`, `LABEL_WALLET_NAME` | ~15 |
| Debts | `LABEL_DEBT_PAYABLE`, `LABEL_DEBT_RECEIVABLE` | ~25 |
| Dashboard | `LABEL_MONTHLY_STATS`, `LABEL_FINANCIAL_PROGRESS` | ~20 |
| Filters | `LABEL_DATE_TODAY`, `LABEL_SORT_NEWEST` | ~20 |
| Login | `LABEL_LOGIN_TITLE`, `LABEL_PASSWORD` | ~15 |
| Notifications | `LABEL_NOTIFICATIONS`, `LABEL_ACCEPT` | ~10 |
| Feedback | `LABEL_FEEDBACK_TITLE`, `LABEL_SEND_FEEDBACK` | ~10 |
| Confirmations | `LABEL_DELETE_WALLET_CONFIRM` | ~5 |

**Naming Convention**: `LABEL_[CONTEXT]_[DESCRIPTION]`

Ví dụ:
- `LABEL_WALLET_NAME` → Label cho tên ví
- `LABEL_DELETE_WALLET_CONFIRM` → Message xác nhận xóa ví

**Components đã refactor**: 17 files (dialogs, dashboard, navigation, pages)

---

*Tài liệu này được cập nhật lần cuối: 2026-01-18*
*Phiên bản ứng dụng: v1.3.21*

