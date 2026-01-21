import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EventDetailClient from "@/components/event-detail-client";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
    const supabase = await createClient();
    const { id } = await params;

    // Check user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    return <EventDetailClient eventId={id} />;
}
