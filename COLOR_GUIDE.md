# Hướng Dẫn Hệ Thống Màu Sắc - Bobo Finance

> Tài liệu này ghi lại toàn bộ hệ thống màu sắc đang được sử dụng trong ứng dụng Bobo Finance.
> Mục đích: Làm chuẩn để đối chiếu, phát hiện hardcode và refactor UI nhất quán.

---

## 1. Bảng Màu Chính (Brand Palette)

Được định nghĩa tập trung tại `utils/colors.ts`. Đây là nguồn sự thật (SSOT) cho logic màu sắc trong code TypeScript.

| Tên biến | Mã màu | Mô tả | Sử dụng |
|---|---|---|---|
| `brand` | `#598c58` | 🟢 Xanh lá đậm | Màu thương hiệu chính, nút bấm, điểm nhấn |
| `positive` | `#598c58` | 🟢 Xanh lá đậm | Số dư dương, thu nhập, thành công (giống brand) |
| `negative` | `#c25e5e` | 🔴 Đỏ cam | Chi tiêu, nợ, số dư âm, cảnh báo lỗi |
| `neutral` | `#7a869a` | 🔘 Xám xanh | Text phụ, viền, placeholder |
| `brandHover` | `#4a7a49` | 🟢 Xanh lá tối | Trạng thái hover của nút bấm brand |

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

## 4. Kế Hoạch Refactor (Đề Xuất)

Để hệ thống màu sắc nhất quán và dễ bảo trì hơn, nên thực hiện các bước sau:

1.  **Mở rộng Tailwind Config**:
    Thêm các màu từ `utils/colors.ts` vào `theme.extend.colors` trong `tailwind.config.ts` (nếu có) hoặc cập nhật biến CSS trong `globals.css` để map với màu brand.
    ```css
    :root {
      --color-brand: 89 140 88; /* Chuyển đổi sang RGB hoặc OKLCH */
    }
    ```

2.  **Email Template (Không refactor)**:
    File `app/actions/send-feedback.ts` vẫn giữ hardcode vì:
    - Email HTML không thể import JavaScript modules
    - Các màu này là màu hệ thống (slate), không phải brand colors
    - Email template hiếm khi thay đổi

3.  **Kiểm soát việc thêm màu mới**:
    Quy định mọi màu sắc mới phải được thêm vào `utils/colors.ts` trước khi sử dụng.

