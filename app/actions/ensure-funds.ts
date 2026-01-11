"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Default Funds sẽ được tạo cho mỗi user mới
 * Đây là 4 quỹ cơ bản theo nguyên tắc quản lý tài chính cá nhân
 */
const DEFAULT_FUNDS = [
    { name: "Daily Expenses", type: "daily" },
    { name: "Emergency Fund", type: "emergency" },
    { name: "Sinking Fund", type: "sinking" },
    { name: "Investment Fund", type: "investment" },
];

/**
 * Đảm bảo user có đủ các funds mặc định
 * - Nếu user đã có ít nhất 1 fund -> Skip (không làm gì)
 * - Nếu user chưa có fund nào -> Tạo 4 funds mặc định
 */
export async function ensureDefaultFunds() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Kiểm tra xem user đã có funds chưa
    const { data: existingFunds } = await supabase
        .from("funds")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

    // Nếu đã có ít nhất 1 fund -> Skip
    if (existingFunds && existingFunds.length > 0) {
        return;
    }

    // Nếu chưa có fund nào -> Tạo 4 funds mặc định
    const fundsToInsert = DEFAULT_FUNDS.map(fund => ({
        user_id: user.id,
        name: fund.name,
        type: fund.type,
    }));

    await supabase.from("funds").insert(fundsToInsert);
}
