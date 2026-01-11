"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    // Lấy dữ liệu từ Form
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Gửi lên Supabase xác thực
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        // Nếu sai mật khẩu hoặc lỗi
        return redirect("/login?message=Could not authenticate");
    }

    // Nếu thành công -> Về trang chủ
    revalidatePath("/", "layout");
    redirect("/");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return redirect("/login?message=" + encodeURIComponent(error.message));
    }

    return redirect("/login?message=Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
}