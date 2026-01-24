"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/components/providers/language-provider";
import { COLORS } from "@/utils/colors";
import { formatCurrency } from "@/utils/format";
import { getDashboardEventsAction } from "@/app/actions";
import Link from "next/link";

interface DashboardEvent {
    id: string;
    name: string;
    budget: number | null;
    total_spent: number;
}

export default function EventsWidget() {
    const { t } = useTranslation();
    const [events, setEvents] = useState<DashboardEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const result = await getDashboardEventsAction();
            if (result.data) {
                setEvents(result.data);
            }
            setLoading(false);
        };
        fetchEvents();
    }, []);

    // Don't show widget if no active events
    if (loading || events.length === 0) {
        return null;
    }

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: COLORS.brand }} />
                    {t.LABEL_ACTIVE_EVENTS}
                </h3>
                <Link href="/events" className="text-xs flex items-center gap-1" style={{ color: COLORS.brand }}>
                    {t.LABEL_MANAGE} <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-2">
                {events.map((event) => {
                    const progress = event.budget ? (event.total_spent / event.budget) * 100 : 0;
                    const isOverBudget = event.budget && event.total_spent > event.budget;

                    return (
                        <Link href={`/events/${event.id}`} key={event.id}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-sm">{event.name}</span>
                                        <span
                                            className="font-bold text-sm"
                                            style={{ color: isOverBudget ? COLORS.expense : COLORS.brand }}
                                        >
                                            {formatCurrency(event.total_spent)}
                                        </span>
                                    </div>

                                    {event.budget && (
                                        <div className="mt-2">
                                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${Math.min(progress, 100)}%`,
                                                        backgroundColor: isOverBudget ? COLORS.expense : COLORS.brand
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>{progress.toFixed(0)}%</span>
                                                <span>{formatCurrency(event.budget)}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
