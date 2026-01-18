"use client"
import { useState } from "react"
import { LogOut, MessageSquare, Users, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/app/actions"
import { FeedbackDialog } from "@/components/feedback-dialog"
import Link from "next/link"
import { LABEL_ACCOUNT, LABEL_FAMILY, LABEL_FEEDBACK, LABEL_LOGOUT, LABEL_PRIVATE_DASHBOARD } from "@/utils/labels"

interface UserNavProps {
    email: string;
    hasFamily?: boolean; // v1.4.0: Để hiển thị menu ví riêng tư
}

export function UserNav({ email, hasFamily = false }: UserNavProps) {
    const [feedbackOpen, setFeedbackOpen] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200">
                        <span className="font-bold text-slate-700">{email?.charAt(0).toUpperCase()}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{LABEL_ACCOUNT}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/account">
                        <DropdownMenuItem className="cursor-pointer">
                            <Users className="mr-2 h-4 w-4" />
                            {LABEL_ACCOUNT}
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/family">
                        <DropdownMenuItem className="cursor-pointer">
                            <Users className="mr-2 h-4 w-4" />
                            {LABEL_FAMILY}
                        </DropdownMenuItem>
                    </Link>
                    {/* v1.4.0: Private Wallet - chỉ hiển thị khi có gia đình */}
                    {hasFamily && (
                        <Link href="/private">
                            <DropdownMenuItem className="cursor-pointer">
                                <Lock className="mr-2 h-4 w-4" />
                                {LABEL_PRIVATE_DASHBOARD}
                            </DropdownMenuItem>
                        </Link>
                    )}
                    <DropdownMenuItem
                        onClick={() => setFeedbackOpen(true)}
                        className="cursor-pointer"
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {LABEL_FEEDBACK}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async () => await signOutAction()} className="text-red-600 focus:text-red-600 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        {LABEL_LOGOUT}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Feedback Dialog */}
            <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
        </>
    )
}
