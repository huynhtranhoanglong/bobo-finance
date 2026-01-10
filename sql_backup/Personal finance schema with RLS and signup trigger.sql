-- 1. Thêm các giá trị mới vào danh sách lựa chọn (ENUM)
ALTER TYPE spending_category ADD VALUE 'salary';
ALTER TYPE spending_category ADD VALUE 'other_income';

-- Lưu ý: Sau bước này, cột category_level của bạn đã chấp nhận 2 giá trị trên.
-- Transfer vẫn nên để category là NULL (trống).