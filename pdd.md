# Tài Liệu Định Nghĩa Sản Phẩm (PDD) - Bobo Finance
**Phiên bản:** v1.0.0  
**Ngày cập nhật:** 11/01/2026

Đây là tài liệu chi tiết mô tả toàn bộ dự án Bobo Finance ở phiên bản 1.0.0, bao gồm kiến trúc kỹ thuật, cơ sở dữ liệu, luồng nghiệp vụ và cấu trúc code. Tài liệu này dùng để lưu trữ và bàn giao ngữ cảnh cho AI hoặc Developer khác.

---

## 1. Tổng Quan Dự Án
**Bobo Finance** là ứng dụng Quản lý Tài chính Cá nhân (Personal Finance Tracker) tập trung vào sự đơn giản, trực quan và tính toán tự động các chỉ số sức khỏe tài chính.

*   **Mục tiêu chính:** Giúp người dùng theo dõi dòng tiền (Cashflow), quản lý nợ (Debt) và tiến độ đạt tự do tài chính (Financial Freedom).
*   **Đối tượng sử dụng:** Cá nhân muốn quản lý chi tiêu chặt chẽ.

## 2. Công Nghệ Sử Dụng (Tech Stack)
*   **Web Framework:** [Next.js 16](https://nextjs.org/) (App Router).
*   **Ngôn ngữ:** TypeScript / React 19.
*   **Styling:** Tailwind CSS v4, Lucide React (Icons), Radix UI (Headless UI Components).
*   **Backend / Database:** [Supabase](https://supabase.com/).
    *   Auth: Supabase Auth.
    *   Database: PostgreSQL.
    *   API: Server Actions gọi trực tiếp vào Database hoặc qua RPC Functions.

---

## 3. Kiến Trúc Cơ Sở Dữ Liệu (Database Schema)

### 3.1. Các Bảng Chính (Tables)

#### `wallets` (Ví tiền)
Lưu trữ các nguồn tiền (Tiền mặt, Ngân hàng...).
*   `id` (uuid): Khóa chính.
*   `user_id` (uuid): Liên kết user.
*   `name` (text): Tên ví (VD: "Ví tiền mặt", "TPBank").
*   `balance` (numeric): Số dư hiện tại.
*   `fund_id` (uuid): (Optional) Liên kết với quỹ (thiết lập ngân sách).
*   `created_at`: Ngày tạo.

#### `debts` (Khoản nợ)
Quản lý các khoản đi vay hoặc cho vay.
*   `id` (uuid): Khóa chính.
*   `user_id` (uuid): Liên kết user.
*   `name` (text): Tên khoản nợ (VD: "Vay tiền mẹ", "Cho Tuấn vay").
*   `total_amount` (numeric): Tổng số tiền nợ gốc ban đầu.
*   `remaining_amount` (numeric): Số tiền còn nợ/còn phải thu.
*   `type` (enum `debt_type`):
    *   `payable`: Mình nợ người khác (Đi vay).
    *   `receivable`: Người khác nợ mình (Cho vay).
*   `interest_level` (text): Mức lãi suất (tham khảo).

#### `transactions` (Giao dịch)
Lưu lịch sử dòng tiền.
*   `id` (uuid): Khóa chính.
*   `wallet_id` (uuid): Ví thực hiện giao dịch.
*   `related_debt_id` (uuid): (Optional) Nếu là giao dịch liên quan đến nợ (tạo nợ/trả nợ).
*   `amount` (numeric): Số tiền.
*   `type` (enum `transaction_type`):
    *   `income`: Thu nhập.
    *   `expense`: Chi tiêu.
    *   `transfer_out`: Chuyển tiền đi (trừ ví nguồn).
    *   `transfer_in`: Nhận tiền chuyển đến (cộng ví đích).
    *   `debt_repayment`: Trả nợ.
*   `category_level` (enum `spending_category`):
    *   `must_have`: Chi tiêu thiết yếu.
    *   `nice_to_have`: Chi tiêu hưởng thụ.
    *   `wasted`: Lãng phí.
    *   `invest`: Đầu tư.
    *   `salary`, `other_income`: Nguồn thu.
*   `note` (text): Ghi chú.
*   `date` (timestamptz): Thời gian giao dịch.

### 3.2. Database Logic (PostgreSQL Functions / RPC)
Dự án sử dụng các Stored Procedures (RPC) để đảm bảo tính toàn vẹn dữ liệu (Transaction ACID).

1.  **`create_transaction_and_update_wallet`**:
    *   Input: `wallet_id`, `amount`, `type`, `...`
    *   Logic: Insert vào `transactions` -> Cập nhật `balance` trong `wallets` (Cộng/Trừ tùy type).
2.  **`create_new_debt`**:
    *   Logic: Tạo record trong `debts`. Nếu chọn ví, tự động tạo giao dịch `income` (nếu đi vay) hoặc `expense` (nếu cho vay) và cập nhật số dư ví tương ứng.
3.  **`pay_debt`**:
    *   Logic: Trừ tiền ví (`wallets`) -> Trừ dư nợ (`debts.remaining_amount`) -> Ghi log transaction `debt_repayment`.
4.  **`transfer_funds`**:
    *   Logic: Trừ tiền ví A (`transfer_out`) -> Cộng tiền ví B (`transfer_in`).
5.  **`delete_transaction` / `delete_debt`**:
    *   Logic: Khi xóa giao dịch -> Tự động hoàn tiền (Revert) lại ví và dư nợ về trạng thái cũ.
6.  **`get_financial_metrics`**:
    *   Logic: Tính toán Net Worth, tiến độ An toàn tài chính (Chi tiêu tối thiểu * 12 * 25), tiến độ Tự do tài chính (Chi tiêu tiêu chuẩn * 12 * 25).

---

## 4. Cấu Trúc Frontend (Source Code Stucture)
Cấu trúc thư mục theo Next.js App Router:

```
bobo-finance/
├── app/
│   ├── layout.tsx       # Root Layout (Font, Metadata)
│   ├── page.tsx         # Dashboard chính (Xem tổng quan, danh sách ví, nợ)
│   ├── actions.ts       # Server Actions (Hàm gọi RPC từ Client)
│   ├── debts/           # Trang quản lý Nợ (/debts)
│   ├── transactions/    # Trang lịch sử Giao dịch (/transactions)
│   └── login/           # Trag đăng nhập (Supabase Auth)
├── components/
│   ├── ui/              # Các component cơ bản (Button, Input, Dialog...) - Shadecn
│   ├── financial-overview.tsx  # Card hiển thị chỉ số tài chính (An toàn/Tự do)
│   ├── transaction-item.tsx    # Dòng hiển thị 1 giao dịch (kèm logic Xóa/Sửa)
│   ├── debt-item.tsx           # Dòng hiển thị 1 khoản nợ
│   ├── add-transaction-dialog.tsx  # Form thêm giao dịch (Tab: Thu/Chi, Chuyển, Nợ)
│   ├── edit-transaction-dialog.tsx # Form sửa giao dịch
│   └── ...
├── lib/
│   └── utils.ts         # Utility functions (cn for Tailwind class merge)
├── utils/
│   └── supabase/        # Cấu hình Supabase Client (Server/Client/Middleware)
├── sql_backup/          # Lưu trữ các script SQL để backup/tham khảo logic DB
└── public/              # Static assets
```

## 5. Các Tính Năng Chi Tiết & Logic Nghiệp Vụ

### 5.1. Dashboard (Trang chủ)
*   **Financial Overview:**
    *   Hiển thị **Tổng tài sản (Net Worth)** = Tổng số dư các ví.
    *   Card **An toàn tài chính**: Dựa trên chi tiêu `must_have` trung bình 3 tháng gần nhất.
    *   Card **Tự do tài chính**: Dựa trên tổng chi tiêu (`must_have` + `nice_to_have`).
*   **Danh sách Ví:** Hiển thị tên và số dư hiện tại.
*   **Danh sách Nợ:** Hiển thị các khoản nợ `payable` còn dư nợ > 0.

### 5.2. Thao tác Giao dịch (`AddTransactionDialog`)
Hỗ trợ 4 loại thao tác chính thông qua Tabs:
1.  **Thu/Chi (Expense/Income):** Nhập số tiền, chọn ví, chọn danh mục -> Cập nhật ví ngay lập tức.
2.  **Chuyển khoản (Transfer):** Chọn ví Nguồn -> ví Đích. Hệ thống tạo 2 giao dịch (`transfer_out` và `transfer_in`) để cân bằng tiền.
3.  **Ghi Nợ (Debt):**
    *   Tạo khoản nợ mới.
    *   Nếu chọn ví: Số tiền vay sẽ được cộng vào ví (nếu đi vay) hoặc trừ khỏi ví (nếu cho vay).
4.  **Trả Nợ (Repayment):** Chọn khoản nợ cần trả -> Chọn ví để trả -> Giảm tiền ví và giảm nợ gốc.

### 5.3. Chỉnh Sửa & Xóa
*   **Xóa Giao dịch:** Hoàn tác lại số dư ví và dư nợ như chưa từng xảy ra giao dịch.
*   **Sửa Giao dịch:**
    *   Hiện tại cho phép sửa: Số tiền, Ví, Ghi chú.
    *   Khi sửa: Hệ thống hoàn tiền cũ -> Trừ tiền mới (Logic Revert & Apply).

## 6. Biến Môi Trường (.env.local)
Dự án cần các biến sau để chạy:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 7. Ghi Chú Bảo Trì
*   Khi muốn thay đổi logic tính toán tiền tệ: Hãy tìm trong `sql_backup/` để xem logic gốc, sau đó cập nhật đè hàm RPC trong Database bằng lệnh SQL mới.
*   Toàn bộ logic tiền tệ phức tạp đều được đẩy xuống Database (RPC) để tránh sai sót client-side.

---
**Kết thúc tài liệu.**
