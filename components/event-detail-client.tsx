"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Edit, Trash2, Check, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/components/providers/language-provider";
import { COLORS } from "@/utils/colors";
import { formatCurrency } from "@/utils/format";
import { getEventDetailAction, deleteEventAction, completeEventAction, reopenEventAction } from "@/app/actions";
import EditEventDialog from "@/components/edit-event-dialog";

interface Transaction {
    id: string;
    amount: number;
    type: string;
    category_level: string;
    note: string;
    date: string;
    wallet_name: string;
}

interface EventBreakdown {
    must_have: number;
    nice_to_have: number;
    waste: number;
    other: number;
    total: number;
}

interface EventDetail {
    id: string;
    name: string;
    budget: number | null;
    start_date: string | null;
    end_date: string | null;
    status: "active" | "completed";
    visibility: string;
    is_owner: boolean;
    transactions: Transaction[];
    breakdown: EventBreakdown;
}

interface EventDetailClientProps {
    eventId: string;
}

export default function EventDetailClient({ eventId }: EventDetailClientProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchEvent = useCallback(async () => {
        setLoading(true);
        const result = await getEventDetailAction(eventId);
        if (result.data) {
            setEvent(result.data);
        } else {
            router.push("/events");
        }
        setLoading(false);
    }, [eventId, router]);

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    const handleDelete = async () => {
        if (!confirm(t.LABEL_DELETE_EVENT_CONFIRM)) return;
        setActionLoading(true);
        const result = await deleteEventAction(eventId);
        if (result.success) {
            router.push("/events");
        } else {
            alert(t.LABEL_ERROR_PREFIX + result.error);
        }
        setActionLoading(false);
    };

    const handleComplete = async () => {
        if (!confirm(t.LABEL_COMPLETE_EVENT_CONFIRM)) return;
        setActionLoading(true);
        await completeEventAction(eventId);
        fetchEvent();
        setActionLoading(false);
    };

    const handleReopen = async () => {
        setActionLoading(true);
        await reopenEventAction(eventId);
        fetchEvent();
        setActionLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLORS.brand }} />
            </div>
        );
    }

    if (!event) return null;

    const progress = event.budget ? (event.breakdown.total / event.budget) * 100 : 0;
    const isOverBudget = event.budget && event.breakdown.total > event.budget;
    const remaining = event.budget ? event.budget - event.breakdown.total : 0;

    const categoryColors = {
        must_have: COLORS.mustHave,
        nice_to_have: COLORS.niceToHave,
        waste: COLORS.waste,
        other: COLORS.neutral
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/events")}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold">{event.name}</h1>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${event.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                {event.status === "active" ? t.LABEL_EVENT_STATUS_ACTIVE : t.LABEL_EVENT_STATUS_COMPLETED}
                            </span>
                        </div>
                    </div>
                    {event.is_owner && (
                        <div className="flex gap-2">
                            <EditEventDialog event={event} onSuccess={fetchEvent}>
                                <Button variant="ghost" size="icon">
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </EditEventDialog>
                            <Button variant="ghost" size="icon" onClick={handleDelete} disabled={actionLoading}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-4 space-y-4">
                {/* Summary Card */}
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-500">{t.LABEL_TOTAL_SPENT}</p>
                            <p className="text-3xl font-bold" style={{ color: isOverBudget ? COLORS.expense : COLORS.brand }}>
                                {formatCurrency(event.breakdown.total)}
                            </p>
                        </div>

                        {event.budget && (
                            <>
                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(progress, 100)}%`,
                                            backgroundColor: isOverBudget ? COLORS.expense : COLORS.brand
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t.LABEL_EVENT_BUDGET}: {formatCurrency(event.budget)}</span>
                                    <span style={{ color: isOverBudget ? COLORS.expense : COLORS.brand }}>
                                        {isOverBudget ? t.LABEL_BUDGET_OVER : t.LABEL_BUDGET_REMAINING}: {formatCurrency(Math.abs(remaining))}
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Action Buttons */}
                        {event.is_owner && event.status === "active" && (
                            <Button
                                className="w-full mt-4"
                                style={{ backgroundColor: COLORS.brand }}
                                onClick={handleComplete}
                                disabled={actionLoading}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                {t.LABEL_COMPLETE_EVENT}
                            </Button>
                        )}

                        {event.is_owner && event.status === "completed" && (
                            <Button
                                className="w-full mt-4"
                                variant="outline"
                                onClick={handleReopen}
                                disabled={actionLoading}
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                {t.LABEL_REOPEN_EVENT}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Breakdown */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{t.LABEL_EVENT_BREAKDOWN}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {[
                            { key: "must_have", label: t.LABEL_CATEGORY_MUST_HAVE, value: event.breakdown.must_have },
                            { key: "nice_to_have", label: t.LABEL_CATEGORY_NICE_TO_HAVE, value: event.breakdown.nice_to_have },
                            { key: "waste", label: t.LABEL_CATEGORY_WASTE, value: event.breakdown.waste },
                            { key: "other", label: t.LABEL_CATEGORY_OTHER_EXPENSE, value: event.breakdown.other },
                        ].map((cat) => (
                            <div key={cat.key} className="flex justify-between items-center">
                                <span>{cat.label}</span>
                                <span className="font-medium" style={{ color: categoryColors[cat.key as keyof typeof categoryColors] }}>
                                    {formatCurrency(cat.value)}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Transactions List */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{t.LABEL_EVENT_TRANSACTIONS} ({event.transactions.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {event.transactions.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">{t.LABEL_EVENT_NO_TRANSACTIONS}</p>
                        ) : (
                            <div className="space-y-2">
                                {event.transactions.map((tx) => (
                                    <div key={tx.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                        <div>
                                            <p className="font-medium">{tx.note || t.LABEL_EXPENSE}</p>
                                            <p className="text-xs text-gray-500">{tx.wallet_name} • {new Date(tx.date).toLocaleDateString()}</p>
                                        </div>
                                        <span className="font-bold" style={{ color: COLORS.expense }}>
                                            -{formatCurrency(tx.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
