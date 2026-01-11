"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// HÀM MỚI: Tạo ví mới (v1.0.4)
export async function createWalletAction(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("name") as string;
    const fund_id = formData.get("fund_id") as string;
    const initial_balance = Number(formData.get("initial_balance"));

    const { error } = await supabase.rpc("create_wallet_with_initial_balance", {
        p_name: name,
        p_fund_id: fund_id,
        p_initial_balance: initial_balance
    });

    if (error) return { error: error.message };
    revalidatePath("/");
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

export async function addTransaction(formData: FormData) {
    const supabase = await createClient();

    const type = formData.get("type") as string;
    const amount = Number(formData.get("amount"));
    const note = formData.get("note") as string;
    const date = new Date().toISOString();

    let error;

    // CASE 1: TẠO KHOẢN NỢ MỚI (NEW!)
    if (type === "create_debt") {
        const name = formData.get("debt_name") as string;
        const debt_type = formData.get("debt_type") as string; // payable/receivable
        const interest = formData.get("interest_level") as string;
        const wallet_id = formData.get("wallet_id") as string; // Có thể rỗng nếu user không chọn ví

        const result = await supabase.rpc("create_new_debt", {
            p_name: name,
            p_amount: amount,
            p_type: debt_type,
            p_interest: interest,
            p_wallet_id: wallet_id || null,
            p_note: note,
            p_date: date,
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

        if (from_wallet_id === to_wallet_id) return { error: "Không thể chuyển vào chính ví đó!" };

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

        const result = await supabase.rpc("create_transaction_and_update_wallet", {
            p_wallet_id: wallet_id,
            p_amount: amount,
            p_type: type,
            p_category: category,
            p_note: note,
            p_date: date,
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
// ... (các code cũ giữ nguyên)

// HÀM MỚI: Xóa giao dịch
export async function deleteTransactionAction(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("delete_transaction_v2", { p_transaction_id: id });

    if (error) return { error: error.message };
    revalidatePath("/"); // Làm mới dữ liệu
    return { success: true };
}

// HÀM MỚI: Xóa khoản nợ
export async function deleteDebtAction(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("delete_debt", { p_debt_id: id });

    if (error) return { error: error.message };
    revalidatePath("/");
    return { success: true };
}
// ... (code cũ giữ nguyên)

// HÀM MỚI: Sửa giao dịch (v1.0.2 - Update Transaction V2)
export async function updateTransactionAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const amount = Number(formData.get("amount"));
    const note = formData.get("note") as string;
    const wallet_id = formData.get("wallet_id") as string;
    const date = formData.get("date") as string; // Lấy ngày từ form (đã format đúng ISO hoặc timestamp)
    const category = formData.get("category") as string || null;

    // Gọi hàm RPC V2 mới
    const { error } = await supabase.rpc("update_transaction_v2", {
        p_id: id,
        p_new_amount: amount,
        p_new_note: note,
        p_new_date: date, // Truyền ngày mới
        p_new_wallet_id: wallet_id,
        p_new_category: category // Truyền category mới
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    return { success: true };
}

// HÀM MỚI: Sửa khoản nợ
export async function updateDebtAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const total = Number(formData.get("total_amount"));

    const { error } = await supabase.rpc("update_debt", {
        p_id: id,
        p_new_name: name,
        p_new_total: total
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    return { success: true };
}