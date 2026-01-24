"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// HÀM MỚI: Xóa khoản nợ
export async function deleteDebtAction(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("delete_debt", { p_debt_id: id });

    if (error) return { error: error.message };
    revalidatePath("/");
    return { success: true };
}

// HÀM MỚI: Sửa khoản nợ (v1.2.5 - Enhanced)
export async function updateDebtAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const total = Number(formData.get("total_amount"));

    // New Params
    const paid = Number(formData.get("paid_amount") || 0);
    const just_record = formData.get("just_record") === "true";
    const wallet_id = formData.get("wallet_id") as string;

    const { error } = await supabase.rpc("update_debt_v2", {
        p_id: id,
        p_new_name: name,
        p_new_total: total,
        p_new_paid: paid,
        p_wallet_id: wallet_id || null, // Null nếu just_record = true hoặc ko chọn
        p_update_wallet: !just_record, // Ngược lại với Just Record
        p_note: (formData.get("adjustment_note") as string) || "Debt adjustment"
    });

    if (error) return { error: error.message };
    // revalidatePath("/");
    return { success: true };
}
