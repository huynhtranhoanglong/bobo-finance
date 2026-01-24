"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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
