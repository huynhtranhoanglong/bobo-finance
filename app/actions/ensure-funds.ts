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
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log("[ensureDefaultFunds] No user found, skipping");
            return;
        }

        console.log("[ensureDefaultFunds] Checking funds for user:", user.id);

        // Kiểm tra xem user đã có funds chưa
        const { data: existingFunds, error: selectError } = await supabase
            .from("funds")
            .select("id")
            .eq("user_id", user.id)
            .limit(1);

        if (selectError) {
            console.error("[ensureDefaultFunds] Error checking funds:", selectError);
            return;
        }

        // Nếu đã có ít nhất 1 fund -> Skip
        if (existingFunds && existingFunds.length > 0) {
            console.log("[ensureDefaultFunds] User already has funds, skipping");
            return;
        }

        console.log("[ensureDefaultFunds] User has no funds, creating defaults...");

        // Nếu chưa có fund nào -> Tạo 4 funds mặc định
        const fundsToInsert = DEFAULT_FUNDS.map(fund => ({
            user_id: user.id,
            name: fund.name,
            type: fund.type,
        }));

        const { error: insertError } = await supabase.from("funds").insert(fundsToInsert);

        if (insertError) {
            console.error("[ensureDefaultFunds] Error inserting funds:", insertError);
            return;
        }

        console.log("[ensureDefaultFunds] Successfully created 4 default funds!");
    } catch (error) {
        console.error("[ensureDefaultFunds] Unexpected error:", error);
    }
}

