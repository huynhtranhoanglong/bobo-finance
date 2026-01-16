/**
 * Centralized Constants - Bobo Finance
 * v1.3.15
 * 
 * File này chứa tất cả các hằng số quan trọng được sử dụng trong logic tính toán.
 * Mục đích: Tránh "magic numbers" rải rác, dễ bảo trì và thay đổi.
 * 
 * ⚠️ LƯU Ý: Nếu thay đổi các giá trị này, cần:
 *    1. Hiểu rõ ảnh hưởng đến logic nghiệp vụ
 *    2. Cập nhật tương ứng trong SQL (nếu cần)
 *    3. Cập nhật file LOGIC_CALCULATIONS.md
 */

// === FINANCIAL CALCULATION CONSTANTS ===
// Dùng để tính chi tiêu trung bình (xem LOGIC_CALCULATIONS.md mục 2.5, 2.6)

/** Số ngày để tính chi tiêu trung bình (90 ngày = 3 tháng gần nhất) */
export const SPENDING_CALCULATION_DAYS = 90;

/** Số tháng tương ứng (90 ngày ÷ 30 ngày/tháng) */
export const SPENDING_CALCULATION_MONTHS = 3;

/** Số tháng trong năm */
export const MONTHS_IN_YEAR = 12;

/** 
 * Số năm nghỉ hưu dự kiến - dựa trên Quy tắc 4%
 * Ý nghĩa: Nếu bạn rút 4% mỗi năm từ tài sản đầu tư, tiền sẽ tồn tại khoảng 25 năm
 * (xem LOGIC_CALCULATIONS.md mục 2.7, 2.8)
 */
export const RETIREMENT_YEARS = 25;


// === SPENDING PROGRESS THRESHOLDS ===
// Dùng để so sánh tiến độ chi tiêu vs tiến độ thời gian (xem mục 3.5)

/** 
 * Ngưỡng % chênh lệch để xác định màu cảnh báo
 * - Nếu chi tiêu < thời gian - 10%: Xanh (tốt)
 * - Nếu chi tiêu trong khoảng ±10%: Xám (bình thường)
 * - Nếu chi tiêu > thời gian + 10%: Đỏ (cảnh báo)
 */
export const SPENDING_PROGRESS_THRESHOLD_PERCENT = 10;


// === DEBT PROGRESS THRESHOLDS ===
// Dùng để xác định màu hiển thị tiến độ trả nợ (xem mục 5.4)

/** Ngưỡng thấp (< 30%): Màu đỏ - còn nhiều nợ */
export const DEBT_PROGRESS_LOW = 30;

/** Ngưỡng cao (> 70%): Màu xanh - sắp trả xong */
export const DEBT_PROGRESS_HIGH = 70;


// === EMERGENCY FUND THRESHOLDS ===
// Dùng để đánh giá mức độ an toàn của quỹ dự phòng khẩn cấp (xem mục 8.1)

/** Dưới 3 tháng chi tiêu: Đỏ - nguy hiểm */
export const EMERGENCY_FUND_DANGER_MONTHS = 3;

/** Trên 6 tháng chi tiêu: Xanh - an toàn */
export const EMERGENCY_FUND_SAFE_MONTHS = 6;


// === GREETING TIME RANGES ===
// Dùng để hiển thị lời chào theo thời gian trong ngày (xem mục 8.2)

/** Buổi sáng bắt đầu từ 5:00 */
export const GREETING_MORNING_START = 5;

/** Buổi chiều bắt đầu từ 12:00 */
export const GREETING_AFTERNOON_START = 12;

/** Buổi tối bắt đầu từ 18:00 */
export const GREETING_EVENING_START = 18;

/** Khuya bắt đầu từ 22:00 */
export const GREETING_NIGHT_START = 22;
