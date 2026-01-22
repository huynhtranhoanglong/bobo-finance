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
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
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
        <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden flex flex-col pt-safe">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[80px] mix-blend-multiply opacity-70 animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-pink-100/40 rounded-full blur-[60px] mix-blend-multiply opacity-60 animate-delayed-float" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-50 transition-all duration-300">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm" />
                <div className="max-w-md mx-auto px-4 py-4 relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/events")}
                            className="bg-white/50 hover:bg-white/80 rounded-xl w-10 h-10 text-slate-600"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold text-slate-800 leading-tight">{event.name}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${event.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                    {event.status === "active" ? t.LABEL_EVENT_STATUS_ACTIVE : t.LABEL_EVENT_STATUS_COMPLETED}
                                </span>
                            </div>
                        </div>
                    </div>
                    {event.is_owner && (
                        <div className="flex gap-2">
                            <EditEventDialog event={event} onSuccess={fetchEvent}>
                                <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-xl text-slate-500">
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </EditEventDialog>
                            <Button variant="ghost" size="icon" onClick={handleDelete} disabled={actionLoading} className="hover:bg-red-50 rounded-xl text-red-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 max-w-md mx-auto w-full px-4 py-6 relative z-10 space-y-6">
                {/* Summary Card */}
                <Card className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-[2rem] overflow-hidden">
                    <CardContent className="p-6 relative">
                        {/* Ambient glow for total */}
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-[40px] opacity-20 pointer-events-none"
                            style={{ backgroundColor: isOverBudget ? COLORS.expense : COLORS.brand }}
                        />

                        <div className="text-center mb-6 relative z-10">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">{t.LABEL_TOTAL_SPENT}</p>
                            <p className="text-4xl font-bold tracking-tight transform transition-all duration-300 hover:scale-105" style={{ color: isOverBudget ? COLORS.expense : COLORS.brand }}>
                                {formatCurrency(event.breakdown.total)}
                            </p>
                        </div>

                        {event.budget && (
                            <div className="relative z-10">
                                <div className="w-full h-3 bg-slate-100/80 rounded-full overflow-hidden mb-3 shadow-inner">
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                                        style={{
                                            width: `${Math.min(progress, 100)}%`,
                                            backgroundColor: isOverBudget ? COLORS.expense : COLORS.brand
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs font-medium">
                                    <span className="text-slate-400">{t.LABEL_EVENT_BUDGET}: <span className="text-slate-600">{formatCurrency(event.budget)}</span></span>
                                    <span style={{ color: isOverBudget ? COLORS.expense : COLORS.brand }}>
                                        {isOverBudget ? t.LABEL_BUDGET_OVER : t.LABEL_BUDGET_REMAINING}: {formatCurrency(Math.abs(remaining))}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {event.is_owner && event.status === "active" && (
                            <Button
                                className="w-full mt-6 rounded-xl shadow-lg shadow-emerald-200/50 hover:shadow-emerald-200/70 transition-all font-medium"
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
                                className="w-full mt-6 rounded-xl border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all"
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
                <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-[1.5rem]">
                    <CardHeader className="pb-2 pt-5 px-6">
                        <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t.LABEL_EVENT_BREAKDOWN}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 px-6 pb-6">
                        {[
                            { key: "must_have", label: t.LABEL_CATEGORY_MUST_HAVE, value: event.breakdown.must_have },
                            { key: "nice_to_have", label: t.LABEL_CATEGORY_NICE_TO_HAVE, value: event.breakdown.nice_to_have },
                            { key: "waste", label: t.LABEL_CATEGORY_WASTE, value: event.breakdown.waste },
                            { key: "other", label: t.LABEL_CATEGORY_OTHER_EXPENSE, value: event.breakdown.other },
                        ].map((cat) => (
                            <div key={cat.key} className="flex justify-between items-center group">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[cat.key as keyof typeof categoryColors] }} />
                                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{cat.label}</span>
                                </div>
                                <span className="font-semibold text-sm" style={{ color: categoryColors[cat.key as keyof typeof categoryColors] }}>
                                    {formatCurrency(cat.value)}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Transactions List */}
                <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-[1.5rem]">
                    <CardHeader className="pb-2 pt-5 px-6">
                        <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                            {t.LABEL_EVENT_TRANSACTIONS} <span className="ml-1 text-slate-400 font-normal normal-case">({event.transactions.length})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 pb-2">
                        {event.transactions.length === 0 ? (
                            <p className="text-center text-slate-400 py-6 text-sm italic">{t.LABEL_EVENT_NO_TRANSACTIONS}</p>
                        ) : (
                            <div className="space-y-1">
                                {event.transactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex justify-between items-center p-3 hover:bg-white/60 rounded-xl transition-colors group"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{tx.note || t.LABEL_EXPENSE}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{tx.wallet_name} • {new Date(tx.date).toLocaleDateString()}</p>
                                        </div>
                                        <span className="font-bold text-slate-700" style={{ color: COLORS.expense }}>
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
