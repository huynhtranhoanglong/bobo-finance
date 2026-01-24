"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ============ EVENT TRACKING ACTIONS (v1.6.0) ============

// Tạo Event mới
export async function createEventAction(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("name") as string;
    const budget = formData.get("budget") ? Number(formData.get("budget")) : null;
    const start_date = formData.get("start_date") as string || null;
    const end_date = formData.get("end_date") as string || null;
    const visibility = (formData.get("visibility") as string) || "shared";

    const { data, error } = await supabase.rpc("create_event", {
        p_name: name,
        p_budget: budget,
        p_start_date: start_date,
        p_end_date: end_date,
        p_visibility: visibility
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/events");
    return { success: true, event_id: data };
}

// Lấy danh sách Events
export async function getEventsListAction() {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_events_list");

    if (error) return { error: error.message };
    return { data };
}

// Lấy chi tiết Event
export async function getEventDetailAction(eventId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_event_detail", {
        p_event_id: eventId
    });

    if (error) return { error: error.message };
    return { data };
}

// Cập nhật Event
export async function updateEventAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const budget = formData.get("budget") ? Number(formData.get("budget")) : null;
    const start_date = formData.get("start_date") as string || null;
    const end_date = formData.get("end_date") as string || null;

    const { error } = await supabase.rpc("update_event", {
        p_event_id: id,
        p_name: name,
        p_budget: budget,
        p_start_date: start_date,
        p_end_date: end_date
    });

    if (error) return { error: error.message };
    revalidatePath("/events");
    revalidatePath(`/events/${id}`);
    return { success: true };
}

// Hoàn thành Event
export async function completeEventAction(eventId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("complete_event", {
        p_event_id: eventId
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/events");
    return { success: true };
}

// Mở lại Event
export async function reopenEventAction(eventId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("reopen_event", {
        p_event_id: eventId
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/events");
    return { success: true };
}

// Xóa Event
export async function deleteEventAction(eventId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("delete_event", {
        p_event_id: eventId
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/events");
    return { success: true };
}

// Lấy Active Events (cho dropdown)
export async function getActiveEventsAction() {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_active_events");

    if (error) return { error: error.message };
    return { data };
}

// Lấy Events cho Dashboard
export async function getDashboardEventsAction() {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_dashboard_events");

    if (error) return { error: error.message };
    return { data };
}
