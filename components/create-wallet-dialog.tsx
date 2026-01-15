"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createWalletAction } from "@/app/actions"
import { useRouter } from "next/navigation"

export default function CreateWalletDialog({ funds }: { funds: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await createWalletAction(formData);
        setLoading(false);
        if (result?.error) {
            alert("Lỗi: " + result.error);
        } else {
            setOpen(false);
            router.refresh(); // Refresh dashboard
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full">
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tạo Ví Mới</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Tên Ví</Label>
                        <Input name="name" placeholder="Ví dụ: Hũ chi tiêu, Ví đầu tư..." required />
                    </div>

                    <div className="grid gap-2">
                        <Label>Thuộc Quỹ (Fund)</Label>
                        <Select name="fund_id" required>
                            <SelectTrigger><SelectValue placeholder="Chọn quỹ cha" /></SelectTrigger>
                            <SelectContent>
                                {funds?.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Số dư hiện tại</Label>
                        <Input name="initial_balance" type="number" placeholder="0" required className="font-bold text-lg" />
                        <p className="text-xs text-gray-500">
                            Hệ thống sẽ tự động tạo giao dịch số dư đầu kỳ.
                        </p>
                    </div>

                    <Button type="submit" disabled={loading} style={{ backgroundColor: '#598c58' }} className="w-full">
                        {loading ? "Đang tạo..." : "Tạo Ví"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
