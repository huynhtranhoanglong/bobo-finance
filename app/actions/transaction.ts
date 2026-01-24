"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTransaction(formData: FormData) {
    const supabase = await createClient();

    const type = formData.get("type") as string;
    const amount = Number(formData.get("amount"));
    const note = formData.get("note") as string;
    const date = new Date().toISOString();

    let error;

    // CASE 1: TẠO KHOẢN NỢ MỚI (NEW v1.2.5!)
    if (type === "create_debt") {
        const name = formData.get("debt_name") as string;
        const debt_type = formData.get("debt_type") as string; // payable/receivable
        const interest = formData.get("interest_level") as string;
        const wallet_id = formData.get("wallet_id") as string; // Có thể rỗng nếu user không chọn ví

        // New params for Historical Debt
        const paid_amount = Number(formData.get("paid_amount") || 0);
        const just_record = formData.get("just_record") === "true"; // Parse boolean

        const result = await supabase.rpc("create_new_debt_v2", {
            p_name: name,
            p_total_amount: amount, // Đây là Tổng Nợ Gốc
            p_paid_amount: paid_amount,
            p_type: debt_type,
            p_interest: interest,
            p_wallet_id: wallet_id || null, // Null nếu just_record = true
            p_note: note,
            p_date: date,
            p_create_transaction: !just_record // Logic ngược lại: Just Record = True -> Create Trans = False
        });
        error = result.error;
    }

    // CASE 2: TRẢ NỢ CŨ
    else if (type === "debt_repayment") {
        const wallet_id = formData.get("wallet_id") as string;
        const debt_id = formData.get("debt_id") as string;

        const result = await supabase.rpc("pay_debt", {
            p_wallet_id: wallet_id,
            p_debt_id: debt_id,
            p_amount: amount,
            p_note: note,
            p_date: date,
        });
        error = result.error;
    }

    // CASE 3: CHUYỂN KHOẢN
    else if (type === "transfer") {
        const from_wallet_id = formData.get("wallet_id") as string;
        const to_wallet_id = formData.get("to_wallet_id") as string;

        if (from_wallet_id === to_wallet_id) return { error: "Cannot transfer to the same wallet!" };

        const result = await supabase.rpc("transfer_funds", {
            p_from_wallet_id: from_wallet_id,
            p_to_wallet_id: to_wallet_id,
            p_amount: amount,
            p_note: note,
            p_date: date,
        });
        error = result.error;
    }

    // CASE 4: THU / CHI
    else {
        const wallet_id = formData.get("wallet_id") as string;
        const category = formData.get("category") as string || null;
        const event_id_raw = formData.get("event_id") as string;
        const event_id = (event_id_raw && event_id_raw !== "none") ? event_id_raw : null;

        const result = await supabase.rpc("create_transaction_and_update_wallet", {
            p_wallet_id: wallet_id,
            p_amount: amount,
            p_type: type,
            p_category: category,
            p_note: note,
            p_date: date,
            p_event_id: event_id,
        });
        error = result.error;
    }

    if (error) {
        console.error("Lỗi:", error);
        return { error: error.message };
    }

    revalidatePath("/");
    return { success: true };
}

// HÀM MỚI: Xóa giao dịch (v1.3.11 - Fix Family Balance)
export async function deleteTransactionAction(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("delete_transaction_v3", { p_transaction_id: id });

    if (error) return { error: error.message };
    revalidatePath("/"); // Làm mới dữ liệu
    return { success: true };
}

// HÀM MỚI: Sửa giao dịch (v1.3.11 - Fix Family Balance, v1.6.1 - Event support)
export async function updateTransactionAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const amount = Number(formData.get("amount"));
    const note = formData.get("note") as string;
    const wallet_id = formData.get("wallet_id") as string;
    const date = formData.get("date") as string; // Lấy ngày từ form (đã format đúng ISO hoặc timestamp)
    const category = formData.get("category") as string || null;
    const event_id_raw = formData.get("event_id") as string;
    const event_id = (event_id_raw && event_id_raw !== "none") ? event_id_raw : null;

    // Gọi hàm RPC V3 mới
    const { error } = await supabase.rpc("update_transaction_v3", {
        p_id: id,
        p_new_amount: amount,
        p_new_note: note,
        p_new_date: date, // Truyền ngày mới
        p_new_wallet_id: wallet_id,
        p_new_category: category, // Truyền category mới
        p_new_event_id: event_id // Truyền event mới (v1.6.1)
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/events");
    return { success: true };
}
