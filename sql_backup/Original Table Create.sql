-- 1. Tạo các ENUM (Danh sách lựa chọn cố định)
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer_in', 'transfer_out', 'debt_repayment');
CREATE TYPE spending_category AS ENUM ('must_have', 'nice_to_have', 'waste');
CREATE TYPE debt_type AS ENUM ('payable', 'receivable'); -- payable: mình nợ, receivable: người khác nợ mình
CREATE TYPE debt_interest_level AS ENUM ('none', 'low', 'medium', 'high');

-- 2. Bảng PROFILES (Thông tin người dùng mở rộng)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  currency TEXT DEFAULT 'VND',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng FUNDS (Quỹ lớn: Emergency, Investment, etc.)
CREATE TABLE funds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- Ví dụ: 'emergency', 'daily', 'investment'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng WALLETS (Ví con thuộc Quỹ: Techcombank, Tiền mặt...)
CREATE TABLE wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_id UUID REFERENCES funds(id) ON DELETE CASCADE NOT NULL, -- Xóa Fund thì xóa luôn Wallet
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- Thêm user_id để dễ query security
  name TEXT NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng DEBTS (Quản lý nợ)
CREATE TABLE debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  type debt_type NOT NULL,
  interest_level debt_interest_level DEFAULT 'none',
  category spending_category DEFAULT 'must_have', -- Mục đích vay
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bảng TRANSACTIONS (Giao dịch)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- Quan trọng để phân quyền
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type transaction_type NOT NULL,
  category_level spending_category, -- Có thể null nếu là transfer
  note TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  related_debt_id UUID REFERENCES debts(id) ON DELETE SET NULL, -- Link tới khoản nợ nếu có
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BẬT BẢO MẬT (ROW LEVEL SECURITY - RLS)
-- Chỉ cho phép người dùng xem/sửa/xóa dữ liệu của chính họ
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Tạo Policy mẫu (Policy: Người dùng chỉ được thấy dòng có user_id = id của họ)
CREATE POLICY "Users can view own data" ON funds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON funds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON funds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON funds FOR DELETE USING (auth.uid() = user_id);

-- (Lặp lại logic trên cho các bảng khác - để ngắn gọn tôi viết đại diện cho Funds,
-- thực tế Supabase Dashboard cho phép tạo nhanh các policy này bằng UI click chuột)
-- Để đơn giản bước đầu, tôi sẽ viết lệnh tạo nhanh policy cho tất cả các bảng:

create policy "Enable access for owners" on profiles for all using (auth.uid() = id);
create policy "Enable access for owners" on wallets for all using (auth.uid() = user_id);
create policy "Enable access for owners" on debts for all using (auth.uid() = user_id);
create policy "Enable access for owners" on transactions for all using (auth.uid() = user_id);

-- 8. TRIGGER TỰ ĐỘNG TẠO PROFILE KHI ĐĂNG KÝ
-- Khi user đăng ký qua Supabase Auth, tự động thêm 1 dòng vào bảng profiles
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();