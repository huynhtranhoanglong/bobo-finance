/**
 * Centralized UI Labels - Bobo Finance
 * v1.3.19
 *
 * File này chứa tất cả text hiển thị trên UI.
 * Mục đích: Chuẩn bị cho tính năng đa ngôn ngữ (i18n) và đảm bảo nhất quán.
 *
 * ⚠️ LƯU Ý: Khi thay đổi text, cần kiểm tra tất cả các nơi sử dụng.
 */

// === COMMON LABELS ===
export const LABEL_LOADING = "Đang xử lý...";
export const LABEL_SAVING = "Đang lưu...";
export const LABEL_DELETING = "Đang xoá...";
export const LABEL_SAVE = "Lưu";
export const LABEL_CANCEL = "Hủy";
export const LABEL_DELETE = "Xóa";
export const LABEL_CONFIRM = "Xác Nhận";
export const LABEL_OR = "Hoặc";
export const LABEL_ERROR_PREFIX = "Lỗi: ";
export const LABEL_SELECT = "Chọn";
export const LABEL_ALL = "Tất cả";
export const LABEL_NOTE = "Ghi chú";
export const LABEL_AMOUNT = "Số tiền";

// === TRANSACTION TYPES ===
export const LABEL_INCOME = "Thu Nhập";
export const LABEL_EXPENSE = "Chi Tiêu";
export const LABEL_TRANSFER = "Chuyển Ví";
export const LABEL_DEBT_REPAYMENT = "Trả Nợ";
export const LABEL_OTHER = "Khác";

// === TRANSACTION DIALOG ===
export const LABEL_ADD_TRANSACTION = "Thêm Giao Dịch";
export const LABEL_EDIT_TRANSACTION = "Chỉnh Sửa Giao Dịch";
export const LABEL_DELETE_TRANSACTION = "Xóa giao dịch";
export const LABEL_SELECT_WALLET = "Chọn ví";
export const LABEL_FROM_WALLET = "Từ ví";
export const LABEL_TO_WALLET = "Đến ví";
export const LABEL_WALLET = "Ví";
export const LABEL_TAKE_FROM_WALLET = "Lấy tiền từ Ví";

// === SPENDING CATEGORIES ===
export const LABEL_CATEGORY_LEVEL = "Mức độ";
export const LABEL_CATEGORY_MUST_HAVE = "🔴 Must Have";
export const LABEL_CATEGORY_NICE_TO_HAVE = "🟡 Nice to Have";
export const LABEL_CATEGORY_WASTE = "⚫ Waste";
export const LABEL_SELECT_CATEGORY = "Chọn mức độ";

// === INCOME SOURCES ===
export const LABEL_INCOME_SOURCE = "Nguồn thu";
export const LABEL_SALARY = "💵 Lương";
export const LABEL_OTHER_INCOME = "💎 Khác";
export const LABEL_SELECT_SOURCE = "Chọn nguồn";

// === WALLET LABELS ===
export const LABEL_WALLETS = "Ví tiền";
export const LABEL_CREATE_WALLET = "Tạo Ví Mới";
export const LABEL_EDIT_WALLET = "Chỉnh Sửa Ví";
export const LABEL_DELETE_WALLET = "Xóa Ví Này";
export const LABEL_WALLET_NAME = "Tên Ví";
export const LABEL_CURRENT_BALANCE = "Số dư hiện tại";
export const LABEL_INITIAL_BALANCE = "Số dư ban đầu";
export const LABEL_BELONGS_TO_FUND = "Thuộc Quỹ";
export const LABEL_SAVE_CHANGES = "Lưu Thay Đổi";
export const LABEL_NO_WALLETS = "Chưa có ví nào.";
export const LABEL_NO_WALLETS_IN_FUND = "Chưa có ví nào trong quỹ này.";
export const LABEL_BALANCE_ADJUSTMENT_NOTE = "*Hệ thống sẽ tự động tạo giao dịch điều chỉnh (Thu/Chi) nếu số dư thay đổi.";

// === DEBT LABELS ===
export const LABEL_DEBTS = "Các khoản nợ";
export const LABEL_CREATE_DEBT = "Tạo Khoản Nợ Mới";
export const LABEL_EDIT_DEBT = "Chỉnh Sửa Khoản Nợ";
export const LABEL_DELETE_DEBT = "Xóa Khoản Nợ";
export const LABEL_DEBT_NAME = "Tên khoản nợ";
export const LABEL_DEBT_AMOUNT = "Số tiền nợ";
export const LABEL_DEBT_TO_PAY = "Khoản nợ cần trả";
export const LABEL_SELECT_DEBT = "Chọn khoản nợ";
export const LABEL_NO_DEBTS = "Không có khoản nợ nào!";
export const LABEL_NO_DEBTS_CONGRATS = "🎉 Tuyệt vời! Bạn không có khoản nợ nào.";
export const LABEL_REMAINING_DEBT = "Còn nợ";

// === DEBT TYPES ===
export const LABEL_DEBT_PAYABLE = "Đi Vay";
export const LABEL_DEBT_RECEIVABLE = "Cho Vay";
export const LABEL_DEBT_PAYABLE_FULL = "Đi Vay (Nợ)";
export const LABEL_DEBT_PAYABLE_STATUS = "Nợ phải trả";
export const LABEL_DEBT_RECEIVABLE_STATUS = "Đang cho vay";

// === DEBT PROGRESS ===
export const LABEL_PAID_PERCENT = "đã trả";
export const LABEL_RECEIVED_PERCENT = "đã được trả";
export const LABEL_AMOUNT_PAID = "Số tiền đã trả";
export const LABEL_AMOUNT_RECEIVED = "Số tiền đã được trả";

// === DEBT RECORD MODE ===
export const LABEL_JUST_RECORD = "Chỉ ghi sổ nợ (Không tạo giao dịch ví)";
export const LABEL_JUST_RECORD_NOTE = "Chế độ ghi sổ: Không làm thay đổi số dư ví.";
export const LABEL_WALLET_SYNC_NOTE = "Hệ thống sẽ cộng phần CÒN LẠI vào ví (Dư nợ thực tế).";
export const LABEL_NEW_DEBT_NOTE = "Nhập 0 nếu là khoản nợ mới hoàn toàn.";
export const LABEL_WALLET_DISABLED = "Đang tắt chọn ví";

// === DEBT WALLET QUESTION ===
export const LABEL_WALLET_RECEIVE = "Tiền về ví nào?";
export const LABEL_WALLET_TAKE = "Lấy tiền từ ví nào?";

// === INTEREST LEVELS ===
export const LABEL_INTEREST_LEVEL = "Mức lãi suất";
export const LABEL_INTEREST_NONE = "Không lãi (Người thân)";
export const LABEL_INTEREST_LOW = "Lãi thấp";
export const LABEL_INTEREST_MEDIUM = "Lãi trung bình";
export const LABEL_INTEREST_HIGH = "Lãi cao (Thẻ tín dụng/Nóng)";

// === DASHBOARD SECTIONS ===
export const LABEL_MONTHLY_STATS = "📊 Thống kê tháng này";
export const LABEL_FINANCIAL_PROGRESS = "📈 Tiến độ tài chính";
export const LABEL_MONTHLY_INCOME = "Thu Nhập";
export const LABEL_MONTHLY_EXPENSE = "Chi Tiêu";
export const LABEL_MONTHLY_REMAINING = "Còn Lại";

// === SPENDING BREAKDOWN ===
export const LABEL_ESSENTIAL = "Thiết yếu";
export const LABEL_SECONDARY = "Thứ yếu";
export const LABEL_WASTEFUL = "Lãng phí";

// === PROGRESS LABELS ===
export const LABEL_TIME_PROGRESS = "⏱️ Tiến độ thời gian";
export const LABEL_SPENDING_PROGRESS = "💳 Tiến độ chi tiêu";
export const LABEL_HAS_DEBT_WARNING = "⚠️ Bạn đang có khoản nợ, nên giữ chi tiêu ở mức tối thiểu.";
export const LABEL_SPENDING_COMPARE = "💡 So sánh với mức chi tiêu tiêu chuẩn của bạn.";

// === FINANCIAL TARGETS ===
export const LABEL_MIN_MONTHLY_SPEND = "Chi tiêu tối thiểu";
export const LABEL_STD_MONTHLY_SPEND = "Chi tiêu tiêu chuẩn";
export const LABEL_PER_MONTH = "/tháng";
export const LABEL_TARGET = "🎯 Mục tiêu:";
export const LABEL_SAFETY_TARGET = "An toàn tài chính";
export const LABEL_FREEDOM_TARGET = "Độc lập tài chính";
export const LABEL_REMAINING_TO_TARGET = "Còn {amount} nữa để đạt {target}";

// === EMERGENCY FUND ===
export const LABEL_MONTHS = "tháng";
export const LABEL_APPROX_MONTHS = "~{n} tháng";

// === TRANSACTION HISTORY ===
export const LABEL_TRANSACTION_HISTORY = "Lịch sử giao dịch";
export const LABEL_FILTER_SEARCH = "Bộ lọc & Tìm kiếm";
export const LABEL_FILTERING = "Đang lọc";
export const LABEL_RESET_FILTER = "Mặc định (Xóa bộ lọc)";
export const LABEL_SEARCH_BY_NOTE = "Tìm kiếm theo ghi chú";
export const LABEL_SEARCH_PLACEHOLDER = "Nhập từ khóa...";

// === DATE PRESETS ===
export const LABEL_DATE_RANGE = "Khoảng thời gian";
export const LABEL_DATE_ALL_TIME = "Toàn thời gian";
export const LABEL_DATE_TODAY = "Hôm nay";
export const LABEL_DATE_YESTERDAY = "Hôm qua";
export const LABEL_DATE_LAST_7_DAYS = "7 ngày qua";
export const LABEL_DATE_THIS_WEEK = "Tuần này";
export const LABEL_DATE_THIS_MONTH = "Tháng này";
export const LABEL_DATE_LAST_MONTH = "Tháng trước";

// === FILTER OPTIONS ===
export const LABEL_TYPE = "Loại";
export const LABEL_SORT = "Sắp xếp";
export const LABEL_SORT_NEWEST = "Mới nhất";
export const LABEL_SORT_OLDEST = "Cũ nhất";
export const LABEL_SORT_AMOUNT_HIGH = "Số tiền lớn nhất";
export const LABEL_SORT_AMOUNT_LOW = "Số tiền nhỏ nhất";
export const LABEL_ALL_WALLETS = "Tất cả ví";
export const LABEL_TRANSFER_OUT = "Chuyển đi";
export const LABEL_TRANSFER_IN = "Nhận về";
export const LABEL_LOAD_MORE = "Tải thêm";

// === USER MENU ===
export const LABEL_ACCOUNT = "Tài khoản";
export const LABEL_FAMILY = "Gia đình";
export const LABEL_FEEDBACK = "Góp ý";
export const LABEL_LOGOUT = "Đăng xuất";

// === LOGIN PAGE ===
export const LABEL_LOGIN_TITLE = "Đăng nhập Bobo";
export const LABEL_REGISTER_TITLE = "Đăng ký tài khoản";
export const LABEL_LOGIN = "Đăng nhập";
export const LABEL_REGISTER = "Đăng ký";
export const LABEL_TAGLINE = "Quản lý tiền thông minh, đơn giản, an toàn. 🔒";
export const LABEL_GOOGLE_LOGIN = "Đăng nhập bằng Google";
export const LABEL_OR_EMAIL = "Hoặc tiếp tục với email";
export const LABEL_EMAIL = "Email";
export const LABEL_PASSWORD = "Mật khẩu";
export const LABEL_TRY_DEMO = "Chưa muốn đăng ký?";
export const LABEL_TRY_NOW = "Dùng thử ngay";
export const LABEL_WRONG_CREDENTIALS = "Sai tài khoản hoặc mật khẩu!";
export const LABEL_CHECK_EMAIL = "Vui lòng kiểm tra email để xác nhận!";
export const LABEL_LOADING_PAGE = "Đang tải...";

// === DEMO MODE ===
export const LABEL_DEMO_BANNER = "🎮 Chế độ Demo - Dữ liệu mẫu";
export const LABEL_DEMO_LOGIN_CTA = "Đăng nhập để sử dụng thật";

// === FAMILY ===
export const LABEL_MEMBERS = "thành viên";
export const LABEL_MANAGE = "Quản lý →";

// === NOTIFICATIONS ===
export const LABEL_NOTIFICATIONS = "Thông báo";
export const LABEL_NO_NOTIFICATIONS = "Không có thông báo mới";
export const LABEL_ACCEPT = "Chấp nhận";
export const LABEL_DECLINE = "Từ chối";

// === FEEDBACK ===
export const LABEL_FEEDBACK_TITLE = "Gửi Góp Ý";
export const LABEL_FEEDBACK_FEATURE = "🔧 Tính năng";
export const LABEL_FEEDBACK_UI = "🎨 Giao diện";
export const LABEL_FEEDBACK_SUBJECT = "Tiêu đề";
export const LABEL_FEEDBACK_CONTENT = "Nội dung góp ý";
export const LABEL_FEEDBACK_SEND = "Gửi Góp Ý";
export const LABEL_FEEDBACK_SUCCESS = "Cảm ơn bạn đã góp ý!";

// === CONFIRMATION DIALOGS ===
export const LABEL_DELETE_WALLET_CONFIRM = "CẢNH BÁO: Xóa ví này sẽ XÓA SẠCH toàn bộ giao dịch liên quan!\n\nHành động này không thể hoàn tác.\nBạn có chắc chắn muốn xóa?";
export const LABEL_DELETE_DEBT_CONFIRM = "Bạn có chắc chắn muốn xóa khoản nợ này?";
export const LABEL_DELETE_TRANSACTION_CONFIRM = "Bạn có chắc chắn muốn xóa giao dịch này?";
