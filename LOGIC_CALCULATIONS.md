# Tài liệu Logic Tính Toán - Bobo Finance

> Tài liệu này mô tả chi tiết tất cả các logic tính toán trong ứng dụng Bobo Finance, được diễn giải bằng lời văn dễ hiểu.

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

---

## 1. Tổng Quan Dữ Liệu

### 1.1. Ngữ Cảnh Người Dùng (User Context)

Khi người dùng mở ứng dụng, hệ thống sẽ xác định ngữ cảnh như sau:

- **Người dùng cá nhân (không có gia đình):** Tất cả dữ liệu được truy vấn dựa trên ID của người dùng đang đăng nhập.
  
- **Người dùng thuộc gia đình:** Tất cả dữ liệu được truy vấn dựa trên ID của gia đình mà người dùng đang tham gia. Điều này có nghĩa là người dùng sẽ thấy dữ liệu tổng hợp của cả gia đình, không chỉ riêng mình.

### 1.2. Phân Loại Giao Dịch

Hệ thống phân loại giao dịch thành các loại sau:

- **Thu nhập (income):** Tiền vào ví (lương, thu nhập khác)
- **Chi tiêu (expense):** Tiền ra khỏi ví
- **Chuyển khoản đi (transfer_out):** Tiền chuyển từ ví này sang ví khác (phần đi)
- **Chuyển khoản đến (transfer_in):** Tiền chuyển từ ví này sang ví khác (phần đến)
- **Trả nợ (debt_repayment):** Tiền dùng để trả một khoản nợ

### 1.3. Phân Loại Mức Độ Chi Tiêu

Mỗi khoản chi tiêu được phân loại theo mức độ cần thiết:

- **Thiết yếu (must_have):** Là các khoản chi bắt buộc, không thể thiếu trong cuộc sống (tiền nhà, điện nước, đi lại, ăn uống cơ bản...)
  
- **Tốt để có (nice_to_have):** Là các khoản chi không bắt buộc nhưng nâng cao chất lượng cuộc sống (giải trí, du lịch, đồ dùng nâng cấp...)
  
- **Lãng phí (waste):** Là các khoản chi không cần thiết, mua xong có thể hối hận

---

## 2. Tính Toán Tài Chính Cốt Lõi

### 2.1. Tổng Tài Sản (Total Assets)

**Cách tính:**
- Cộng tất cả số dư hiện tại của toàn bộ ví tiền mà người dùng (hoặc gia đình) sở hữu.
- Nếu là gia đình, chỉ tính các ví được đánh dấu là "chia sẻ" (shared), không tính ví riêng tư.

**Ví dụ:** Bạn có 3 ví: Tiền mặt (5 triệu), TPBank (20 triệu), Momo (2 triệu). Tổng tài sản = 27 triệu.

---

### 2.2. Tổng Nợ Phải Trả (Total Payable Debts)

**Cách tính:**
- Cộng tất cả số tiền "còn phải trả" của các khoản nợ thuộc loại "phải trả" (payable).
- Chỉ tính các khoản nợ chưa trả hết (số dư còn lại lớn hơn 0).

**Ví dụ:** Bạn có 2 khoản nợ: Vay mua laptop còn 15 triệu, Nợ thẻ tín dụng còn 10 triệu. Tổng nợ phải trả = 25 triệu.

---

### 2.3. Tổng Khoản Cho Vay (Total Receivable Debts)

**Cách tính:**
- Cộng tất cả số tiền "còn phải thu" của các khoản nợ thuộc loại "cho vay" (receivable).
- Chỉ tính các khoản chưa thu hết (số dư còn lại lớn hơn 0).
- Đây là tiền người khác đang nợ bạn, sẽ thu về trong tương lai.

**Ví dụ:** Bạn cho bạn bè vay 3 triệu, họ chưa trả. Tổng khoản cho vay = 3 triệu.

---

### 2.4. Tài Sản Ròng (Net Worth)

**Cách tính:**
- Lấy Tổng Tài Sản, trừ đi Tổng Nợ Phải Trả, sau đó cộng thêm Tổng Khoản Cho Vay.

**Ý nghĩa:**
- Đây là "giá trị thực" của bạn - số tiền bạn thực sự sở hữu sau khi trừ hết nợ và tính cả tiền người khác đang nợ bạn.
- Tiền bạn cho người khác vay được tính vào tài sản vì đó là tiền sẽ thu về trong tương lai.
- Nếu số này âm, nghĩa là bạn đang nợ nhiều hơn tổng giá trị bạn có (bao gồm cả khoản cho vay).

**Ví dụ:** Tổng tài sản 27 triệu, Tổng nợ phải trả 25 triệu, Tổng khoản cho vay 3 triệu → Tài sản ròng = 27 - 25 + 3 = 5 triệu.

---

### 2.5. Chi Tiêu Tối Thiểu Hàng Tháng (Minimum Monthly Spend)

**Cách tính:**
1. Lấy tất cả các giao dịch chi tiêu trong 90 ngày gần nhất.
2. Chỉ lọc những giao dịch được đánh dấu là "thiết yếu" (must_have).
3. Cộng tổng số tiền của các giao dịch này.
4. Chia cho 3 (vì 90 ngày = 3 tháng) để ra mức chi tiêu trung bình mỗi tháng.

**Ý nghĩa:**
- Đây là số tiền tối thiểu bạn cần để duy trì cuộc sống mỗi tháng.
- Được dùng để tính các mục tiêu tài chính an toàn.

**Ví dụ:** Trong 90 ngày qua, bạn chi 24 triệu cho các khoản thiết yếu → Chi tiêu tối thiểu = 24 ÷ 3 = 8 triệu/tháng.

---

### 2.6. Chi Tiêu Tiêu Chuẩn Hàng Tháng (Standard Monthly Spend)

**Cách tính:**
1. Lấy tất cả các giao dịch chi tiêu trong 90 ngày gần nhất.
2. Lọc những giao dịch là "thiết yếu" (must_have) HOẶC "tốt để có" (nice_to_have).
3. Cộng tổng số tiền.
4. Chia cho 3 để ra mức trung bình mỗi tháng.

**Ý nghĩa:**
- Đây là mức chi tiêu để duy trì chất lượng cuộc sống hiện tại (không tính lãng phí).
- Được dùng để tính mục tiêu tự do tài chính.

**Ví dụ:** Trong 90 ngày qua, bạn chi 36 triệu cho thiết yếu và tốt để có → Chi tiêu tiêu chuẩn = 36 ÷ 3 = 12 triệu/tháng.

---

### 2.7. Mục Tiêu An Toàn Tài Chính (Safety Target)

**Cách tính:**
- Lấy Chi Tiêu Tối Thiểu Hàng Tháng × 12 tháng × 25 năm.

**Ý nghĩa:**
- Đây là số tiền bạn cần có để sống thoải mái mà không cần làm việc nữa (ở mức tối thiểu).
- Con số 25 năm dựa trên quy tắc 4% trong đầu tư: nếu bạn rút 4% mỗi năm từ tài sản đầu tư, tiền sẽ tồn tại khoảng 25 năm.

**Ví dụ:** Chi tiêu tối thiểu 8 triệu/tháng → Mục tiêu an toàn = 8 × 12 × 25 = 2.4 tỷ đồng.

---

### 2.8. Mục Tiêu Tự Do Tài Chính (Freedom Target)

**Cách tính:**
- Lấy Chi Tiêu Tiêu Chuẩn Hàng Tháng × 12 tháng × 25 năm.

**Ý nghĩa:**
- Đây là số tiền bạn cần có để sống thoải mái với chất lượng cuộc sống hiện tại mà không cần làm việc.
- Cao hơn mục tiêu an toàn vì bao gồm cả các khoản chi "tốt để có".

**Ví dụ:** Chi tiêu tiêu chuẩn 12 triệu/tháng → Mục tiêu tự do = 12 × 12 × 25 = 3.6 tỷ đồng.

---

### 2.9. Tiến Độ Đạt Mục Tiêu (Progress)

**Tiến độ An toàn:**
- Lấy Tài Sản Ròng chia cho Mục Tiêu An Toàn, nhân 100 để ra phần trăm.

**Tiến độ Tự do:**
- Lấy Tài Sản Ròng chia cho Mục Tiêu Tự Do, nhân 100 để ra phần trăm.

**Hiển thị trên Dashboard:**
- Nếu chưa đạt mục tiêu An toàn: Hiển thị thanh tiến trình hướng tới An toàn tài chính.
- Nếu đã đạt An toàn nhưng chưa đạt Tự do: Hiển thị thanh tiến trình hướng tới Tự do tài chính.

---

## 3. Thống Kê Hàng Tháng

### 3.1. Thu Nhập Tháng Này (Monthly Income)

**Cách tính:**
- Cộng tất cả số tiền của các giao dịch loại "thu nhập" (income) trong tháng được chọn.
- Phạm vi tháng được xác định từ ngày 1 đến hết ngày cuối cùng của tháng đó (theo múi giờ Việt Nam).

---

### 3.2. Chi Tiêu Tháng Này (Monthly Expense)

**Cách tính:**
- Cộng tất cả số tiền của các giao dịch loại "chi tiêu" (expense) trong tháng được chọn.
- Không tính các khoản chuyển khoản giữa các ví (vì đó chỉ là di chuyển tiền, không phải chi tiêu thật).

---

### 3.3. Số Dư Còn Lại (Remaining)

**Cách tính:**
- Lấy Thu Nhập Tháng Này trừ đi Chi Tiêu Tháng Này.

**Ý nghĩa:**
- Số dương: Bạn tiết kiệm được tiền tháng này.
- Số âm: Bạn chi nhiều hơn thu (có thể đang dùng tiền tiết kiệm hoặc vay).

---

### 3.4. Phân Tích Chi Tiêu (Spending Breakdown)

Hệ thống tách chi tiêu tháng này thành 3 nhóm:

1. **Thiết yếu (Must Have):** Tổng các giao dịch chi tiêu có mức độ "must_have".
2. **Tốt để có (Nice to Have):** Tổng các giao dịch chi tiêu có mức độ "nice_to_have".
3. **Lãng phí (Waste):** Tổng các giao dịch chi tiêu có mức độ "waste".

Các con số này được hiển thị dưới dạng biểu đồ tròn để dễ hình dung tỷ lệ.

---

### 3.5. So Sánh Tiến Độ Chi Tiêu

Hệ thống so sánh tốc độ chi tiêu của bạn với thời gian đã trôi qua trong tháng:

**Tiến độ Thời gian:**
- Tính số ngày đã trôi qua trong tháng chia cho tổng số ngày của tháng, nhân 100.
- Ví dụ: Ngày 15 của tháng có 30 ngày → Tiến độ thời gian = 50%.

**Tiến độ Chi tiêu:**
- Nếu bạn có nợ: So sánh với Chi Tiêu Tối Thiểu (vì cần tiết kiệm để trả nợ).
- Nếu không có nợ: So sánh với Chi Tiêu Tiêu Chuẩn.
- Lấy Chi tiêu thực tế chia cho Mức chi tiêu mục tiêu, nhân 100.

**Đánh giá:**
- Chi tiêu < Thời gian (cách xa 10%+): Màu xanh - Bạn đang chi tiêu chậm, tốt!
- Chi tiêu ≈ Thời gian (trong khoảng ±10%): Màu xám - Đang ổn.
- Chi tiêu > Thời gian (vượt 10%+): Màu đỏ - Cảnh báo, đang chi nhanh hơn kế hoạch.

---

## 4. Logic Giao Dịch

### 4.1. Tạo Giao Dịch Thu Nhập

Khi bạn ghi nhận một khoản thu nhập:

1. Hệ thống tạo một dòng giao dịch mới với loại "income".
2. Số dư của ví được chọn sẽ được **cộng thêm** số tiền thu nhập.
3. Nếu người dùng thuộc gia đình, giao dịch được gắn ID gia đình để mọi thành viên đều thấy.

---

### 4.2. Tạo Giao Dịch Chi Tiêu

Khi bạn ghi nhận một khoản chi tiêu:

1. Hệ thống tạo một dòng giao dịch mới với loại "expense".
2. Số dư của ví được chọn sẽ bị **trừ đi** số tiền chi tiêu.
3. Giao dịch được gắn mức độ chi tiêu (must_have/nice_to_have/waste) để phục vụ thống kê.

---

### 4.3. Sửa Giao Dịch

Khi bạn sửa một giao dịch đã có (ví dụ: sửa số tiền, đổi ví, đổi ghi chú):

**Bước 1 - Hoàn lại số dư cũ:**
- Nếu giao dịch cũ là chi tiêu/trả nợ/chuyển đi: Cộng lại số tiền cũ vào ví cũ.
- Nếu giao dịch cũ là thu nhập/chuyển đến: Trừ số tiền cũ khỏi ví cũ.

**Bước 2 - Áp dụng số dư mới:**
- Nếu giao dịch là chi tiêu/trả nợ/chuyển đi: Trừ số tiền mới khỏi ví mới.
- Nếu giao dịch là thu nhập/chuyển đến: Cộng số tiền mới vào ví mới.

**Bước 3 - Cập nhật thông tin:**
- Cập nhật số tiền, ghi chú, ngày, ví, mức độ chi tiêu theo giá trị mới.

---

### 4.4. Xóa Giao Dịch

Khi bạn xóa một giao dịch:

**Hoàn lại số dư:**
- Nếu giao dịch là chi tiêu/trả nợ/chuyển đi: Cộng lại số tiền vào ví (vì lúc tạo đã trừ).
- Nếu giao dịch là thu nhập/chuyển đến: Trừ số tiền khỏi ví (vì lúc tạo đã cộng).

**Xử lý khoản nợ liên quan (nếu có):**
- Nếu xóa giao dịch trả nợ: Cộng lại số tiền đã trả vào "số dư còn lại" của khoản nợ (vì nợ chưa được trả).
- Nếu xóa giao dịch tạo nợ (lúc vay tiền): Giảm tổng nợ và số dư còn lại của khoản nợ đó.

**Cuối cùng:** Xóa dòng giao dịch khỏi hệ thống.

---

## 5. Logic Quản Lý Nợ

### 5.1. Phân Loại Nợ

Hệ thống phân biệt 2 loại nợ:

- **Nợ phải trả (Payable):** Tiền bạn nợ người khác, cần phải trả.
- **Nợ phải thu (Receivable):** Tiền người khác nợ bạn, bạn sẽ được nhận lại.

---

### 5.2. Tạo Khoản Nợ Mới

Có 2 chế độ tạo nợ:

**Chế độ "Chỉ Ghi Nhận" (Just Record):**
- Dùng khi bạn muốn ghi lại một khoản nợ đã tồn tại từ trước (không phải vừa vay).
- Hệ thống chỉ tạo bản ghi nợ với Tổng nợ, Số đã trả, và Số còn lại.
- Không tạo giao dịch, không ảnh hưởng số dư ví.
- Số còn lại = Tổng nợ - Số đã trả.

**Chế độ Thông Thường:**
- Dùng khi bạn vừa vay tiền (nợ mới phát sinh).
- Hệ thống tạo bản ghi nợ VÀ tạo giao dịch tương ứng.
- Nếu là "Nợ phải trả": Tạo giao dịch Thu nhập (vì tiền vào ví của bạn khi vay).
- Nếu là "Nợ phải thu": Tạo giao dịch Chi tiêu (vì tiền rời ví của bạn khi cho vay).
- Giao dịch được liên kết với khoản nợ để theo dõi.

---

### 5.3. Trả Nợ

Khi bạn trả một khoản nợ:

1. **Tạo giao dịch Trả nợ:** Loại "debt_repayment", số tiền bạn trả.
2. **Trừ tiền khỏi ví:** Số dư ví bị giảm đi số tiền trả.
3. **Giảm số dư nợ:** Số tiền "còn phải trả" của khoản nợ giảm đi số tiền bạn vừa trả.

---

### 5.4. Tính Tiến Độ Trả Nợ

**Cách tính:**
- Lấy số tiền đã trả (= Tổng nợ - Số còn lại) chia cho Tổng nợ, nhân 100.

**Hiển thị:**
- Dưới 30%: Màu đỏ (còn nhiều nợ).
- Từ 30% đến 70%: Màu xám (đang trả dần).
- Trên 70%: Màu xanh (sắp trả xong).

---

### 5.5. Sắp Xếp Danh Sách Nợ

Danh sách nợ trên Dashboard được sắp xếp theo thứ tự ưu tiên để giúp bạn biết nên trả khoản nào trước:

**Quy tắc sắp xếp:**

1. **Nợ phải trả luôn ở trên Nợ phải thu:** Vì nợ phải trả là nghĩa vụ của bạn.

2. **Trong các khoản Nợ phải trả:**
   - Ưu tiên theo mức lãi suất: Lãi cao → Lãi trung bình → Lãi thấp → Không lãi.
   - Trong cùng mức lãi: Ưu tiên khoản nợ nhỏ hơn (phương pháp Snowball - trả khoản nhỏ trước để có động lực).

3. **Trong các khoản Nợ phải thu:**
   - Ưu tiên khoản lớn hơn trước (để theo dõi).

---

### 5.6. Sửa Khoản Nợ

Khi sửa khoản nợ, có thể thay đổi Tên, Tổng nợ, Số đã trả.

**Chế độ "Chỉ Ghi Nhận":**
- Chỉ cập nhật thông tin, không ảnh hưởng ví.

**Chế độ Cập nhật Ví:**
- Hệ thống tính ra sự chênh lệch giữa Số còn lại mới và cũ.
- Nếu số còn lại giảm (trả thêm): Tạo giao dịch chi tiêu điều chỉnh.
- Nếu số còn lại tăng (hoàn tiền): Tạo giao dịch thu nhập điều chỉnh.

---

## 6. Logic Chuyển Khoản Giữa Các Ví

### 6.1. Thực Hiện Chuyển Khoản

Khi bạn chuyển tiền từ Ví A sang Ví B:

1. **Tạo 2 giao dịch:**
   - Giao dịch "Chuyển đi" (transfer_out) cho Ví A.
   - Giao dịch "Chuyển đến" (transfer_in) cho Ví B.
   
2. **Cập nhật số dư:**
   - Ví A bị trừ đi số tiền chuyển.
   - Ví B được cộng thêm số tiền chuyển.

3. **Ghi chú:** Cả 2 giao dịch đều có cùng ghi chú để dễ đối chiếu.

**Lưu ý:** Hệ thống không cho phép chuyển tiền vào chính ví đó (từ A sang A).

---

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

---

### 7.2. Ví Chia Sẻ vs Ví Riêng Tư

- **Ví chia sẻ (Shared):** Mọi thành viên trong gia đình đều thấy và được tính vào tổng tài sản chung.
- **Ví riêng tư (Private):** Chỉ chủ sở hữu thấy, không tính vào tổng tài sản gia đình.

Hiện tại, mặc định tất cả ví là "chia sẻ".

---

### 7.3. Rời Khỏi Gia Đình

Khi một thành viên rời khỏi gia đình:

1. Xóa liên kết thành viên khỏi gia đình.
2. Tất cả dữ liệu cá nhân của người đó (ví, quỹ, nợ, giao dịch) sẽ được gỡ bỏ ID gia đình.
3. Dữ liệu quay về trạng thái cá nhân, không còn hiển thị cho gia đình.

**Nếu chủ sở hữu rời đi:**
- Nếu còn thành viên khác: Quyền sở hữu được chuyển cho thành viên tham gia sớm nhất.
- Nếu là thành viên cuối cùng: Gia đình bị xóa hoàn toàn.

---

## 8. Các Chỉ Số Phụ Hiển Thị

### 8.1. Số Tháng Chi Tiêu Dự Phòng (Emergency Fund Months)

Hiển thị cho nhóm "Quỹ dự phòng khẩn cấp":

**Cách tính:**
- Lấy Tổng số dư của các ví trong quỹ dự phòng chia cho Chi Tiêu Tối Thiểu Hàng Tháng.

**Ý nghĩa:**
- Cho biết với số tiền dự phòng hiện tại, bạn có thể sống được bao nhiêu tháng nếu mất thu nhập.
- Khuyến nghị: Nên có ít nhất 6 tháng chi tiêu dự phòng.

**Hiển thị:**
- Dưới 3 tháng: Màu đỏ (nguy hiểm).
- Từ 3-6 tháng: Màu xám (tạm ổn).
- Trên 6 tháng: Màu xanh (an toàn).

---

### 8.2. Lời Chào Theo Thời Gian

Hệ thống hiển thị lời chào dựa trên giờ hiện tại:

- Từ 5 giờ sáng đến 11:59 trưa: "Chào buổi sáng!"
- Từ 12 giờ trưa đến 17:59 chiều: "Chào buổi chiều!"
- Từ 18 giờ đến 21:59 tối: "Chào buổi tối!"
- Từ 22 giờ đến 4:59 sáng: "Khuya rồi, nghỉ ngơi nhé!"

---

### 8.3. Định Dạng Tiền Tệ

Tất cả số tiền được định dạng theo chuẩn Việt Nam:
- Đơn vị: VNĐ (Việt Nam Đồng).
- Dấu phân cách hàng nghìn: dấu chấm (.)
- Ví dụ: 1.000.000 đ (một triệu đồng).

---

### 8.4. Chế Độ Bảo Mật (Privacy Mode)

Khi bật chế độ bảo mật:
- Tất cả số tiền trên màn hình Dashboard được thay bằng "******".
- Màu sắc (xanh/đỏ) vẫn được giữ để cho biết tình trạng tài chính tổng quan mà không lộ số cụ thể.
- Hữu ích khi dùng app ở nơi công cộng.

---

## Ghi Chú Kỹ Thuật

### Múi Giờ
- Tất cả tính toán theo tháng sử dụng múi giờ Việt Nam (Asia/Ho_Chi_Minh, UTC+7).
- Ngày bắt đầu tháng: 00:00:00 ngày 1.
- Ngày kết thúc tháng: 23:59:59 ngày cuối cùng.

### Phòng Tránh Chia Cho 0
- Nếu Chi Tiêu Tối Thiểu = 0, hệ thống tự động đặt thành 1 để tránh lỗi chia cho 0.
- Tương tự với Chi Tiêu Tiêu Chuẩn.

### Quyền Truy Cập (RLS)
- Mỗi người dùng chỉ thấy và sửa được dữ liệu của mình.
- Nếu thuộc gia đình, được xem dữ liệu chia sẻ của gia đình nhưng chỉ sửa/xóa được dữ liệu mình tạo.

---

*Tài liệu này được cập nhật lần cuối: 2026-01-16*
*Phiên bản ứng dụng: v1.3.12*
