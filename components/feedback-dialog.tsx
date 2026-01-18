"use client"

import { useState } from "react"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { sendFeedbackAction } from "@/app/actions/send-feedback"
import { COLOR_BRAND } from "@/utils/colors"
import { useTranslation } from "@/components/providers/language-provider"

interface FeedbackDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
    const { t } = useTranslation()
    const [feedbackType, setFeedbackType] = useState<"feature" | "ui">("feature")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.append("feedbackType", feedbackType)

        const result = await sendFeedbackAction(formData)
        setLoading(false)

        if (result?.error) {
            alert(t.LABEL_ERROR_PREFIX + result.error)
        } else {
            setSuccess(true)
            // Auto close after 2 seconds
            setTimeout(() => {
                setSuccess(false)
                onOpenChange(false)
            }, 2000)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {t.LABEL_FEEDBACK_TITLE}
                    </DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <p className="text-lg font-medium text-green-600">{t.LABEL_FEEDBACK_THANKS}</p>
                        <p className="text-sm text-gray-500 mt-2">{t.LABEL_FEEDBACK_REVIEW}</p>
                    </div>
                ) : (
                    <form action={handleSubmit} className="grid gap-4 py-4">
                        {/* Tabs: Tính năng / Giao diện */}
                        <div className="flex gap-2 justify-center">
                            <Button
                                type="button"
                                variant={feedbackType === "feature" ? "default" : "outline"}
                                onClick={() => setFeedbackType("feature")}
                                className={feedbackType === "feature" ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                                {t.LABEL_FEEDBACK_FEATURE}
                            </Button>
                            <Button
                                type="button"
                                variant={feedbackType === "ui" ? "default" : "outline"}
                                onClick={() => setFeedbackType("ui")}
                                className={feedbackType === "ui" ? "bg-purple-600 hover:bg-purple-700" : ""}
                            >
                                {t.LABEL_FEEDBACK_UI}
                            </Button>
                        </div>

                        {/* Tiêu đề */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">{t.LABEL_FEEDBACK_SUBJECT}</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder={feedbackType === "feature" ? "VD: Thêm tính năng xuất Excel" : "VD: Màu sắc khó nhìn trên Dark Mode"}
                                required
                            />
                        </div>

                        {/* Nội dung */}
                        <div className="grid gap-2">
                            <Label htmlFor="content">{t.LABEL_FEEDBACK_CONTENT}</Label>
                            <textarea
                                id="content"
                                name="content"
                                rows={4}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Mô tả chi tiết ý kiến của bạn..."
                                required
                            />
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                            style={{ backgroundColor: COLOR_BRAND }}
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.LABEL_SENDING}</>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    {t.LABEL_SEND_FEEDBACK}
                                </>
                            )}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
