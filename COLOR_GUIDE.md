# Hướng Dẫn Hệ Thống Màu Sắc - Bobo Finance

> Tài liệu này ghi lại toàn bộ hệ thống màu sắc đang được sử dụng trong ứng dụng Bobo Finance.
> Mục đích: Làm chuẩn để đối chiếu, phát hiện hardcode và refactor UI nhất quán.

---

## 1. Bảng Màu Chính (Brand Palette) - v1.5.0

Được định nghĩa tập trung tại `utils/colors.ts`. Đây là nguồn sự thật (SSOT) cho logic màu sắc trong code TypeScript.

### 1.1. Màu Thương Hiệu
| Tên biến | Mã màu | Mô tả | Sử dụng |
|---|---|---|---|
| `brand` | `#598c58` | 🟢 Sage Green | Màu thương hiệu chính, nút bấm, điểm nhấn |
| `brandHover` | `#4a7a49` | 🟢 Sage Green tối | Trạng thái hover của nút bấm brand |
| `neutral` | `#64748b` | 🔘 Slate 500 | Text phụ, viền, placeholder |

### 1.2. Màu Loại Giao Dịch (MỚI v1.5.0)
| Tên biến | Mã màu | Mô tả | Sử dụng |
|---|---|---|---|
| `income` | `#10b981` | 🟢 Emerald 500 | Thu nhập, số dư dương |
| `expense` | `#f43f5e` | 🔴 Rose 500 | Chi tiêu, số dư âm |
| `transfer` | `#3b82f6` | 🔵 Blue 500 | Chuyển khoản giữa các ví |

### 1.3. Màu Mức Độ Chi Tiêu (MỚI v1.5.0)
| Tên biến | Mã màu | Mô tả | Sử dụng |
|---|---|---|---|
| `mustHave` | `#598c58` | 🟢 Brand | Chi tiêu thiết yếu |
| `niceToHave` | `#f59e0b` | 🟡 Amber 500 | Chi tiêu thứ yếu |
| `waste` | `#e11d48` | 🔴 Rose 600 | Chi tiêu lãng phí |

---

## 2. Hệ Thống Theme (Tailwind CSS Variables)

Được định nghĩa tại `app/globals.css` và sử dụng trong Tailwind classes. Hỗ trợ Dark Mode.

### 2.1. Màu Nền & Cơ Bản

| Tên biến CSS | Light Mode (oklch) | Dark Mode (oklch) | Mô tả |
|---|---|---|---|
| `--background` | `1 0 0` (Trắng) | `0.145 0 0` (Đen) | Màu nền chính của trang |
| `--foreground` | `0.145 0 0` (Đen) | `0.985 0 0` (Trắng) | Màu chữ chính |
| `--card` | `1 0 0` | `0.205 0 0` | Nền của các thẻ (Card) |
| `--popover` | `1 0 0` | `0.205 0 0` | Nền của popup, dialog |
| `--primary` | `0.205 0 0` (Đen) | `0.922 0 0` (Trắng) | Màu chính cho các thành phần UI |
| `--muted` | `0.97 0 0` | `0.269 0 0` | Màu nền phụ, bị làm mờ |
| `--border` | `0.922 0 0` | `1 0 0 / 10%` | Viền của các thành phần |

### 2.2. Biểu Đồ (Charts)

| Tên biến | Giá trị (Light) | Mô tả |
|---|---|---|
| `--chart-1` | `0.646 0.222 41.116` | 🟠 Cam đậm |
| `--chart-2` | `0.6 0.118 184.704` | 🔵 Xanh biển |
| `--chart-3` | `0.398 0.07 227.392` | 🔵 Xanh đậm |
| `--chart-4` | `0.828 0.189 84.429` | 🟡 Vàng |
| `--chart-5` | `0.769 0.188 70.08` | 🟠 Cam |

---

## 3. Các Điểm Hard Code Cần Refactor

Dưới đây là danh sách các file đang sử dụng mã màu trực tiếp thay vì dùng biến từ `utils/colors.ts` hoặc Tailwind class.

### 3.1. File `app/actions/send-feedback.ts`
Đây là template email HTML gửi qua Resend, nên style phải viết inline. Tuy nhiên, các mã màu này đang không khớp với bảng màu chung.

| Dòng | Mã màu | Đề xuất thay thế | Ghi chú |
|---|---|---|---|
| Style h2 | `#1e293b` | `COLORS.brand` (`#598c58`) | Tiêu đề email nên dùng màu brand |
| Style hr | `#e2e8f0` | `COLORS.neutral` (nhạt hơn) | Viền phân cách |
| Style td | `#64748b` | `COLORS.neutral` (`#7a869a`) | Màu chữ label |
| Style div | `#f8fafc` | Nền nhạt của brand | Nền khung nội dung |
| Style p | `#94a3b8` | `COLORS.neutral` | Màu chữ footer |

### 3.2. File `components/ui/switch.tsx` ✅ ĐÃ REFACTOR (v1.4.12)
Component Switch của Radix UI đã được cập nhật để sử dụng biến từ `utils/colors.ts`.

| Trước | Sau |
|---|---|
| `data-[state=checked]:bg-[#598c58]` | `style={{ "--switch-checked": COLORS.brand }}` + `bg-[var(--switch-checked)]` |

---

## 4. Đề xuất của AI về việc thay đổi màu sắc cho ứng dụng Bobo
Tài liệu Hệ thống Màu sắc - Bobo Finance (v1.0)

Tài liệu này định nghĩa hệ thống màu sắc (Color System) cho ứng dụng Bobo Finance, được tối ưu hóa cho Tailwind CSS.

🎨 Triết lý thiết kế: Sage Green (#598c58) làm chủ đạo, tạo cảm giác điềm đạm, an toàn và chuyên nghiệp trong quản lý tài chính.

1. Màu Chủ Đạo (Primary Color - Sage Green)

Được phát triển từ mã màu gốc #598c58. Dùng cho các thành phần nhận diện thương hiệu.

Cấp độ

Mã Hex

Tên Tailwind

Ứng dụng

Primary 50

#f4f7f4

bg-primary-50

Nền nhẹ cho Card hoặc Hover state

Primary 100

#e6ede6

bg-primary-100

Nền icon, Badge nhạt

Primary 500

#6da16c

bg-primary-500

Trạng thái Hover của Button

Primary 600

#598c58

bg-primary-600

Màu chính (Primary Button, Active Tab)

Primary 900

#324d31

text-primary-900

Chữ tiêu đề đậm (Heading)

2. Màu Trạng Thái Tài Chính (Semantic Colors)

Dùng để phân loại nhanh các luồng tiền theo [Mục 1.2 của Logic Tài Liệu].

2.1. Phân loại Giao dịch

Thu nhập (Income): #10b981 (emerald-500) - Tượng trưng cho sự tăng trưởng.

Chi tiêu (Expense): #f43f5e (rose-500) - Tượng trưng cho sự thâm hụt.

Chuyển khoản (Transfer): #3b82f6 (blue-500) - Tượng trưng cho sự luân chuyển (Trung tính).

2.2. Mức độ chi tiêu (Category Level)

Phân loại theo tâm lý người dùng [Mục 1.3 của Logic Tài Liệu]:

Thiết yếu (Must-have): Dùng màu primary-600 - Cảm giác bắt buộc, vững chãi.

Thứ yếu (Nice-to-have): #f59e0b (amber-500) - Cần cân nhắc.

Lãng phí (Waste): #e11d48 (rose-600) - Cảnh báo tiêu cực.

3. Màu Trung Tính & Nền (Neutral Colors)

Sử dụng hệ màu Slate (Xám xanh) để giao diện trông hiện đại và không bị mỏi mắt.

Thành phần

Mã Hex

Tên Tailwind

Ghi chú

Background

#f8fafc

bg-slate-50

Nền toàn ứng dụng

Surface

#ffffff

bg-white

Nền của các thẻ (Cards), Modal

Border

#e2e8f0

border-slate-200

Đường kẻ phân cách, viền input

Text Main

#1e293b

text-slate-800

Chữ nội dung chính

Text Muted

#64748b

text-slate-500

Ghi chú phụ, ngày tháng

4. Cấu hình Tailwind CSS (Technical Config)


5. Quy tắc hiển thị UI (UI Guidelines)

5.1. Chế độ Bảo mật (Privacy Mode)

Khi [Privacy Mode] bật:

Giữ nguyên màu text-income hoặc text-expense.

Thay đổi nội dung chữ thành ****** để bảo mật số dư mà vẫn giữ được "vibe" tài chính.

5.2. Trạng thái Nợ (Debt Status)

Dựa trên [Mục 5.4 & 5.5 của Logic Tài Liệu]:

Nợ lãi suất cao: Ưu tiên dùng màu waste (#e11d48) để tạo sự thúc giục.

Sắp trả xong (>70%): Chuyển sang màu primary-600 (Xanh) để khích lệ người dùng.

5.3. Mục tiêu Tài chính (Progress Bar)

Thanh tiến độ: Sử dụng gradient từ primary-100 đến primary-600 để thể hiện sự tích lũy tài sản ròng (Net Worth).

Cập nhật lần cuối: 2026-01-20