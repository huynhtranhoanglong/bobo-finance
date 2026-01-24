"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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
