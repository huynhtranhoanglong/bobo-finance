"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/components/providers/language-provider";
import { COLORS } from "@/utils/colors";
import { formatCurrency } from "@/utils/format";
import Link from "next/link";
import CreateEventDialog from "@/components/create-event-dialog";
import { getEventsListAction } from "@/app/actions";
import { User } from "@supabase/supabase-js";
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { PageHeader } from "@/components/ui/page-header";
import { UserNav } from "@/components/user-nav";
import { NotificationBell } from "@/components/notification-bell";

interface Event {
    id: string;
    name: string;
    budget: number | null;
    start_date: string | null;
    end_date: string | null;
    status: "active" | "completed";
    visibility: "shared" | "private";
    total_spent: number;
    transaction_count: number;
}

interface EventsPageClientProps {
    hasFamily: boolean;
    user: User;
}

export default function EventsPageClient({ hasFamily, user }: EventsPageClientProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active");

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        const result = await getEventsListAction();
        if (result.data) {
            setEvents(result.data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const activeEvents = events.filter((e) => e.status === "active");
    const completedEvents = events.filter((e) => e.status === "completed");

    const EventCard = ({ event }: { event: Event }) => {
        const progress = event.budget ? (event.total_spent / event.budget) * 100 : 0;
        const isOverBudget = event.budget && event.total_spent > event.budget;

        return (
            <Link href={`/events/${event.id}`}>
                <div
                    className="mb-4 relative group transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md rounded-[1.5rem] border border-white/40 shadow-sm"
                        style={{
                            boxShadow: `0 8px 32px -8px ${event.status === 'active' ? COLORS.brand : COLORS.neutral}20`
                        }}
                    />

                    <div className="relative p-5">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner"
                                    style={{
                                        backgroundColor: event.status === 'active' ? `${COLORS.brand}15` : '#f1f5f9',
                                        color: event.status === 'active' ? COLORS.brand : '#64748b'
                                    }}
                                >
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{event.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        {event.transaction_count} {t.LABEL_TRANSACTION.toLowerCase()}
                                    </p>
                                </div>
                            </div>
                            {event.status === "completed" && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium flex items-center shadow-sm">
                                    <Check className="w-3 h-3 mr-1" />
                                    {t.LABEL_EVENT_STATUS_COMPLETED}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-between items-end mt-4">
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">{t.LABEL_TOTAL_SPENT}</p>
                                <p className="font-bold text-xl tracking-tight" style={{ color: isOverBudget ? COLORS.expense : COLORS.brand }}>
                                    {formatCurrency(event.total_spent)}
                                </p>
                            </div>
                            {event.budget && (
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">{t.LABEL_EVENT_BUDGET}</p>
                                    <p className="font-semibold text-slate-600">{formatCurrency(event.budget)}</p>
                                </div>
                            )}
                        </div>

                        {event.budget && (
                            <div className="mt-4">
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                                        style={{
                                            width: `${Math.min(progress, 100)}%`,
                                            backgroundColor: isOverBudget ? COLORS.expense : COLORS.brand
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-1.5">
                                    <p className="text-xs text-slate-400 font-medium">
                                        {progress.toFixed(0)}% {t.LABEL_USED}
                                    </p>
                                    <p className="text-xs font-medium" style={{ color: isOverBudget ? COLORS.expense : COLORS.brand }}>
                                        {isOverBudget ? t.LABEL_BUDGET_OVER : t.LABEL_BUDGET_REMAINING}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden flex flex-col pt-safe">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[80px] mix-blend-multiply opacity-70 animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[60px] mix-blend-multiply opacity-60 animate-delayed-float" />
            </div>

            <div className="max-w-2xl mx-auto w-full p-4 md:p-8 pb-32 relative z-10">
                {/* Header */}
                <PageHeader
                    title={t.LABEL_EVENTS}
                    user={user}
                    className="px-0 pt-0"
                    rightContent={
                        <div className="flex items-center gap-3">
                            <div className="rounded-full p-0.5 bg-white/40 backdrop-blur-sm border border-white/40 shadow-sm transition-all hover:bg-white/60">
                                <NotificationBell />
                            </div>
                            <div className="rounded-full p-0.5 bg-white/40 backdrop-blur-sm border border-white/40 shadow-sm transition-all hover:bg-white/60">
                                <PrivacyToggle />
                            </div>
                            <CreateEventDialog hasFamily={hasFamily} onSuccess={fetchEvents}>
                                <button
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md transition-all hover:scale-105 active:scale-95"
                                    style={{ backgroundColor: COLORS.brand }}
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </CreateEventDialog>
                        </div>
                    }
                />

                {/* Content */}
                <div>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : events.length === 0 ? (
                        <Card className="text-center py-16 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-[2rem]">
                            <CardContent>
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium text-lg">{t.LABEL_EVENT_EMPTY}</p>
                                <p className="text-slate-400 text-sm mt-1 mb-6">Create an event to start tracking expenses</p>
                                <CreateEventDialog hasFamily={hasFamily} onSuccess={fetchEvents}>
                                    <Button
                                        className="rounded-xl shadow-lg shadow-emerald-200/50"
                                        style={{ backgroundColor: COLORS.brand }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t.LABEL_CREATE_EVENT}
                                    </Button>
                                </CreateEventDialog>
                            </CardContent>
                        </Card>
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full mb-6 bg-slate-100/50 p-1 rounded-2xl border border-white/20">
                                <TabsTrigger
                                    value="active"
                                    className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
                                >
                                    {t.LABEL_ACTIVE_EVENTS} <span className="ml-1.5 text-xs opacity-70 bg-slate-200 px-1.5 rounded-full">{activeEvents.length}</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="completed"
                                    className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-700 transition-all"
                                >
                                    {t.LABEL_COMPLETED_EVENTS} <span className="ml-1.5 text-xs opacity-70 bg-slate-200 px-1.5 rounded-full">{completedEvents.length}</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="active" className="space-y-4 data-[state=inactive]:hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {activeEvents.length === 0 ? (
                                    <p className="text-center text-slate-400 py-12 italic">{t.LABEL_NO_ACTIVE_EVENTS}</p>
                                ) : (
                                    activeEvents.map((event) => <EventCard key={event.id} event={event} />)
                                )}
                            </TabsContent>

                            <TabsContent value="completed" className="space-y-4 data-[state=inactive]:hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {completedEvents.length === 0 ? (
                                    <p className="text-center text-slate-400 py-12 italic">{t.LABEL_EVENT_EMPTY}</p>
                                ) : (
                                    completedEvents.map((event) => <EventCard key={event.id} event={event} />)
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    );
}
