"use client";

import { useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/components/providers/language-provider";
import { COLORS } from "@/utils/colors";
import { updateEventAction } from "@/app/actions";
import { MoneyInput } from "@/components/ui/money-input";

interface Event {
    id: string;
    name: string;
    budget: number | null;
    start_date: string | null;
    end_date: string | null;
}

interface EditEventDialogProps {
    children: ReactNode;
    event: Event;
    onSuccess?: () => void;
}

export default function EditEventDialog({ children, event, onSuccess }: EditEventDialogProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [key, setKey] = useState(0); // To reset form

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setKey(prev => prev + 1);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const name = formData.get("name") as string;
        if (!name?.trim()) return;

        setLoading(true);
        formData.set("id", event.id);

        const result = await updateEventAction(formData);

        if (result.success) {
            setOpen(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } else {
            alert(t.LABEL_ERROR_PREFIX + result.error);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">{t.LABEL_EDIT_EVENT}</DialogTitle>
                </DialogHeader>

                <form key={key} onSubmit={handleSubmit} className="space-y-4">
                    {/* Event Name */}
                    <div>
                        <Label>{t.LABEL_EVENT_NAME}</Label>
                        <Input
                            name="name"
                            defaultValue={event.name}
                            placeholder={t.LABEL_EVENT_NAME_PLACEHOLDER}
                            required
                        />
                    </div>

                    {/* Budget (Optional) */}
                    <div>
                        <Label>
                            {t.LABEL_EVENT_BUDGET} <span className="text-gray-400 text-sm">{t.LABEL_EVENT_BUDGET_OPTIONAL}</span>
                        </Label>
                        <MoneyInput name="budget" initialValue={event.budget ?? undefined} />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>{t.LABEL_EVENT_START_DATE}</Label>
                            <Input
                                name="start_date"
                                type="date"
                                defaultValue={event.start_date || ""}
                            />
                        </div>
                        <div>
                            <Label>{t.LABEL_EVENT_END_DATE}</Label>
                            <Input
                                name="end_date"
                                type="date"
                                defaultValue={event.end_date || ""}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        style={{ backgroundColor: COLORS.brand }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t.LABEL_SAVING}
                            </>
                        ) : (
                            t.LABEL_SAVE_CHANGES
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
