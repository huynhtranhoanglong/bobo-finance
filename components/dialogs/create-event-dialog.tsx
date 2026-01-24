"use client";

import { useState, ReactNode } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/components/providers/language-provider";
import { COLORS } from "@/utils/colors";
import { createEventAction } from "@/app/actions";
import { MoneyInput } from "@/components/ui/money-input";

interface CreateEventDialogProps {
    children: ReactNode;
    hasFamily: boolean;
    onSuccess?: () => void;
}

export default function CreateEventDialog({ children, hasFamily, onSuccess }: CreateEventDialogProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const name = formData.get("name") as string;
        if (!name?.trim()) return;

        setLoading(true);
        formData.set("visibility", isPrivate ? "private" : "shared");

        const result = await createEventAction(formData);

        if (result.success) {
            setOpen(false);
            (e.target as HTMLFormElement).reset();
            setIsPrivate(false);
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
                    <DialogTitle className="text-center text-xl">{t.LABEL_CREATE_EVENT}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Event Name */}
                    <div>
                        <Label>{t.LABEL_EVENT_NAME}</Label>
                        <Input
                            name="name"
                            placeholder={t.LABEL_EVENT_NAME_PLACEHOLDER}
                            required
                        />
                    </div>

                    {/* Budget (Optional) */}
                    <div>
                        <Label>
                            {t.LABEL_EVENT_BUDGET} <span className="text-gray-400 text-sm">{t.LABEL_EVENT_BUDGET_OPTIONAL}</span>
                        </Label>
                        <MoneyInput name="budget" />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>{t.LABEL_EVENT_START_DATE}</Label>
                            <Input
                                name="start_date"
                                type="date"
                            />
                        </div>
                        <div>
                            <Label>{t.LABEL_EVENT_END_DATE}</Label>
                            <Input
                                name="end_date"
                                type="date"
                            />
                        </div>
                    </div>

                    {/* Private Toggle (only for family users) */}
                    {hasFamily && (
                        <div className="flex items-center justify-between py-2 border-t pt-4">
                            <div>
                                <Label>{t.LABEL_WALLET_PRIVATE}</Label>
                                <p className="text-xs text-gray-500">{t.LABEL_WALLET_PRIVATE_NOTE}</p>
                            </div>
                            <Switch
                                checked={isPrivate}
                                onCheckedChange={setIsPrivate}
                            />
                        </div>
                    )}

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
                                {t.LABEL_CREATING}
                            </>
                        ) : (
                            t.LABEL_CREATE_EVENT
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
