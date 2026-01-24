"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// HÀM MỚI: Đăng xuất (v1.0.9)
export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
