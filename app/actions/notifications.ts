"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getNotificationsAction() {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_my_notifications");

    if (error) {
        console.error("Error fetching notifications:", error);
        return { data: [] };
    }

    return { data };
}

export async function markNotificationReadAction(notificationId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("mark_notification_read", {
        p_notification_id: notificationId
    });

    if (error) {
        console.error("Error marking notification read:", error);
        return { error: error.message };
    }

    revalidatePath("/");
    return { success: true };
}
