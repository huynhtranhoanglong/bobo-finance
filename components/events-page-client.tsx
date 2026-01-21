"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/components/providers/language-provider";
import { COLORS } from "@/utils/colors";
import { formatCurrency } from "@/utils/format";
import Link from "next/link";
import CreateEventDialog from "@/components/create-event-dialog";
import { getEventsListAction } from "@/app/actions";

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
}

export default function EventsPageClient({ hasFamily }: EventsPageClientProps) {
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
                <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" style={{ color: COLORS.brand }} />
                                <h3 className="font-semibold">{event.name}</h3>
                            </div>
                            {event.status === "completed" && (
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                    <Check className="w-3 h-3 inline mr-1" />
                                    {t.LABEL_EVENT_STATUS_COMPLETED}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-3">
                            <div>
                                <p className="text-sm text-gray-500">{t.LABEL_TOTAL_SPENT}</p>
                                <p className="font-bold" style={{ color: isOverBudget ? COLORS.expense : COLORS.brand }}>
                                    {formatCurrency(event.total_spent)}
                                </p>
                            </div>
                            {event.budget && (
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">{t.LABEL_EVENT_BUDGET}</p>
                                    <p className="font-medium">{formatCurrency(event.budget)}</p>
                                </div>
                            )}
                        </div>

                        {event.budget && (
                            <div className="mt-3">
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(progress, 100)}%`,
                                            backgroundColor: isOverBudget ? COLORS.expense : COLORS.brand
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-right">
                                    {progress.toFixed(0)}%
                                </p>
                            </div>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                            {event.transaction_count} {t.LABEL_TRANSACTION.toLowerCase()}
                        </p>
                    </CardContent>
                </Card>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-xl font-bold">{t.LABEL_EVENTS}</h1>
                    </div>
                    <CreateEventDialog hasFamily={hasFamily} onSuccess={fetchEvents}>
                        <Button size="sm" style={{ backgroundColor: COLORS.brand }}>
                            <Plus className="w-4 h-4 mr-1" />
                            {t.LABEL_CREATE_EVENT}
                        </Button>
                    </CreateEventDialog>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto px-4 py-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLORS.brand }} />
                    </div>
                ) : events.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">{t.LABEL_EVENT_EMPTY}</p>
                            <CreateEventDialog hasFamily={hasFamily} onSuccess={fetchEvents}>
                                <Button className="mt-4" style={{ backgroundColor: COLORS.brand }}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t.LABEL_CREATE_EVENT}
                                </Button>
                            </CreateEventDialog>
                        </CardContent>
                    </Card>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full mb-4">
                            <TabsTrigger value="active" className="flex-1">
                                {t.LABEL_ACTIVE_EVENTS} ({activeEvents.length})
                            </TabsTrigger>
                            <TabsTrigger value="completed" className="flex-1">
                                {t.LABEL_COMPLETED_EVENTS} ({completedEvents.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="active">
                            {activeEvents.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">{t.LABEL_NO_ACTIVE_EVENTS}</p>
                            ) : (
                                activeEvents.map((event) => <EventCard key={event.id} event={event} />)
                            )}
                        </TabsContent>

                        <TabsContent value="completed">
                            {completedEvents.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">{t.LABEL_EVENT_EMPTY}</p>
                            ) : (
                                completedEvents.map((event) => <EventCard key={event.id} event={event} />)
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}
