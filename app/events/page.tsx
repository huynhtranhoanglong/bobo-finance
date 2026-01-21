import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EventsPageClient from "@/components/events-page-client";

export default async function EventsPage() {
    const supabase = await createClient();

    // Check user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // Check if user has family
    const familyResult = await supabase.rpc("get_user_family_id");
    const hasFamily = !!familyResult.data;

    return <EventsPageClient hasFamily={hasFamily} />;
}
