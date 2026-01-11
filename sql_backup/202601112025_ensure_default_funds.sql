-- SQL Reference: Ensure Default Funds (v1.1.1)
-- Date: 2026-01-11
-- Note: Được implement bằng Server Action (TypeScript) thay vì Database Function
--       File này chỉ để tham khảo logic

-- DEFAULT FUNDS (4 quỹ mặc định):
-- 1. Daily Expenses  (type: daily)     - Chi tiêu hàng ngày
-- 2. Emergency Fund  (type: emergency) - Quỹ dự phòng khẩn cấp
-- 3. Sinking Fund    (type: sinking)   - Quỹ tiết kiệm mục tiêu
-- 4. Investment Fund (type: investment)- Quỹ đầu tư

-- Logic (implemented in app/actions/ensure-funds.ts):
-- 1. Lấy user hiện tại từ session
-- 2. Kiểm tra xem user đã có funds chưa (SELECT * FROM funds WHERE user_id = $1 LIMIT 1)
-- 3. Nếu đã có ít nhất 1 fund -> Skip
-- 4. Nếu chưa có fund nào -> Insert 4 default funds

-- Ví dụ insert (reference only):
/*
INSERT INTO funds (user_id, name, type) VALUES 
  (auth.uid(), 'Daily Expenses', 'daily'),
  (auth.uid(), 'Emergency Fund', 'emergency'),
  (auth.uid(), 'Sinking Fund', 'sinking'),
  (auth.uid(), 'Investment Fund', 'investment');
*/
