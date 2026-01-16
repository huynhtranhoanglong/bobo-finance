/**
 * Centralized Color Palette - Bobo Finance
 * v1.3.16
 * 
 * File này chứa tất cả màu sắc được sử dụng trong ứng dụng.
 * Mục đích: Đảm bảo tính nhất quán và dễ dàng thay đổi brand color.
 * 
 * ⚠️ LƯU Ý: Nếu thay đổi màu ở đây, tất cả components sẽ tự động cập nhật!
 */

// === PRIMARY BRAND COLORS ===
export const COLORS = {
    /** 
     * Màu thương hiệu chính - Xanh lá
     * Dùng cho: buttons, links, highlights, positive values 
     */
    brand: '#598c58',

    /** 
     * Màu tích cực - Xanh lá (giống brand)
     * Dùng cho: thu nhập, tài sản dương, hoàn thành, thành công 
     */
    positive: '#598c58',

    /** 
     * Màu tiêu cực - Đỏ cam
     * Dùng cho: chi tiêu, nợ, cảnh báo, lỗi 
     */
    negative: '#c25e5e',

    /** 
     * Màu trung tính - Xám xanh
     * Dùng cho: text phụ, borders, placeholder, info 
     */
    neutral: '#7a869a',

    /**
     * Màu hover cho brand (tối hơn một chút)
     */
    brandHover: '#4a7a49',
} as const;

/**
 * Helper function để tạo màu với opacity
 * @param color - Mã màu HEX (vd: '#598c58')
 * @param opacity - Độ trong suốt từ 0 đến 1 (vd: 0.15 = 15%)
 * @returns Chuỗi rgba (vd: 'rgba(89, 140, 88, 0.15)')
 */
export function withOpacity(color: string, opacity: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// === SHORTCUT ALIASES ===
// Để tương thích ngược với code hiện tại và viết code ngắn gọn hơn
// Type annotation 'string' để tránh literal type conflicts khi reassign

/** Màu tích cực (xanh) */
export const COLOR_POSITIVE: string = COLORS.positive;

/** Màu tiêu cực (đỏ) */
export const COLOR_NEGATIVE: string = COLORS.negative;

/** Màu trung tính (xám) */
export const COLOR_NEUTRAL: string = COLORS.neutral;

/** Màu thương hiệu */
export const COLOR_BRAND: string = COLORS.brand;

/** Màu hover cho brand */
export const COLOR_BRAND_HOVER: string = COLORS.brandHover;
