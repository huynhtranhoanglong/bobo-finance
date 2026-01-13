"use server";

import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";

export async function sendFeedbackAction(formData: FormData) {
    try {
        // Initialize Resend inside function to ensure env vars are available at runtime (Vercel Serverless fix)
        const resend = new Resend(process.env.RESEND_API_KEY);

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const feedbackType = formData.get("feedbackType") as string;
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const userEmail = user?.email || "Không xác định";

        // Validate
        if (!title || !content) {
            return { error: "Vui lòng điền đầy đủ thông tin" };
        }

        // Send email via Resend
        const { error } = await resend.emails.send({
            from: "Bobo Finance <onboarding@resend.dev>",
            to: "huynhtranhoanglong@gmail.com",
            subject: `[Góp ý ${feedbackType === "feature" ? "Tính năng" : "Giao diện"}] ${title}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1e293b;">💬 Góp Ý Mới Từ Bobo Finance</h2>
                    <hr style="border: 1px solid #e2e8f0;" />
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; width: 120px;">Loại góp ý:</td>
                            <td style="padding: 8px 0; font-weight: bold;">
                                ${feedbackType === "feature" ? "🔧 Tính năng" : "🎨 Giao diện"}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;">Người gửi:</td>
                            <td style="padding: 8px 0;">${userEmail}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;">Tiêu đề:</td>
                            <td style="padding: 8px 0; font-weight: bold;">${title}</td>
                        </tr>
                    </table>
                    
                    <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px;">
                        <p style="margin: 0; color: #64748b; font-size: 12px;">Nội dung:</p>
                        <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${content}</p>
                    </div>
                    
                    <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
                        Email này được gửi tự động từ Bobo Finance Feedback Hub.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error("[sendFeedback] Resend error:", error);
            return { error: "Không thể gửi email. Vui lòng thử lại sau." };
        }

        return { success: true };
    } catch (error) {
        console.error("[sendFeedback] Error:", error);
        return { error: "Đã xảy ra lỗi. Vui lòng thử lại." };
    }
}
