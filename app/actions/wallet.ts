"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// HÀM MỚI: Tạo ví mới (v1.4.0 - Added visibility support)
export async function createWalletAction(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("name") as string;
    const fund_id = formData.get("fund_id") as string;
    const initial_balance = Number(formData.get("initial_balance"));
    const visibility = (formData.get("visibility") as string) || "shared";

    const { error } = await supabase.rpc("create_wallet_with_initial_balance", {
        p_name: name,
        p_fund_id: fund_id,
        p_initial_balance: initial_balance,
        p_visibility: visibility
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/private");
    return { success: true };
}

// HÀM MỚI: Cập nhật ví (v1.0.5 - Có điều chỉnh số dư)
export async function updateWalletAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const fund_id = formData.get("fund_id") as string;
    const new_balance = Number(formData.get("balance"));

    const { error } = await supabase.rpc("update_wallet_with_adjustment", {
        p_wallet_id: id,
        p_name: name,
        p_fund_id: fund_id,
        p_new_balance: new_balance
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    return { success: true };
}

// HÀM MỚI: Xóa ví (v1.0.5)
export async function deleteWalletAction(wallet_id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("wallets")
        .delete()
        .eq("id", wallet_id);

    if (error) return { error: error.message };
    revalidatePath("/");
    return { success: true };
}

// ============ PRIVATE WALLET ACTIONS (v1.4.0) ============

// Lấy dữ liệu dashboard ví riêng tư
export async function getPrivateDashboardAction() {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_private_dashboard_data");

    if (error) return { error: error.message };
    return { data };
}
