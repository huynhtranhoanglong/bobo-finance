"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
        p_note: "Điều chỉnh khi chỉnh sửa nợ"
    });

    if (error) return { error: error.message };
    // revalidatePath("/");
    return { success: true };
}

// HÀM MỚI: Đăng xuất (v1.0.9)
export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

// ============ FAMILY ACTIONS (v1.3.2) ============

// Lấy thông tin gia đình hiện tại
export async function getMyFamilyAction() {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_my_family");

    if (error) return { error: error.message };
    return { data };
}

// Tạo gia đình mới
export async function createFamilyAction(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("name") as string;

    const { data, error } = await supabase.rpc("create_family", {
        p_name: name
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/family");
    return { success: true, family_id: data };
}

// Mời thành viên qua email
export async function inviteMemberAction(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get("email") as string;

    const { data, error } = await supabase.rpc("invite_family_member", {
        p_email: email
    });

    if (error) return { error: error.message };
    revalidatePath("/family");
    return { success: true, invitation_id: data };
}

// Lấy thông tin lời mời (public - không cần auth)
export async function getInvitationInfoAction(token: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_invitation_info", {
        p_token: token
    });

    if (error) return { error: error.message };
    return { data };
}

// Chấp nhận lời mời
export async function acceptInvitationAction(token: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("accept_invitation", {
        p_token: token
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/family");
    return { success: true, family_id: data };
}

// Rời gia đình
export async function leaveFamilyAction() {
    const supabase = await createClient();
    const { error } = await supabase.rpc("leave_family");

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/family");
    return { success: true };
}

// Xóa thành viên (owner only)
export async function removeMemberAction(userId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("remove_family_member", {
        p_user_id: userId
    });

    if (error) return { error: error.message };
    revalidatePath("/family");
    return { success: true };
}

// Hủy lời mời (owner only)
export async function cancelInvitationAction(invitationId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("cancel_invitation", {
        p_invitation_id: invitationId
    });

    if (error) return { error: error.message };
    revalidatePath("/family");
    return { success: true };
}

// Đổi tên gia đình (owner only)
export async function updateFamilyNameAction(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("name") as string;

    const { error } = await supabase.rpc("update_family_name", {
        p_name: name
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/family");
    return { success: true };
}

// ============ ACCOUNT ACTIONS (v1.3.6) ============

// Lấy thông tin Profile
export async function getProfileAction() {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_my_profile");

    if (error) return { error: error.message };
    return { data };
}

// Cập nhật Profile
export async function updateProfileAction(formData: FormData) {
    const supabase = await createClient();
    const display_name = formData.get("display_name") as string;
    // Avatar URL tạm thời chưa có upload, có thể mở rộng sau

    const { error } = await supabase.rpc("update_profile", {
        p_display_name: display_name,
        p_avatar_url: null
    });

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/account");
    revalidatePath("/family"); // Update tên ở màn hình family nữa
    return { success: true };
}