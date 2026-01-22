"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { UserNav } from "@/components/user-nav";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    backUrl?: string;
    user?: User | null;
    className?: string;
    rightContent?: React.ReactNode;
}

export function PageHeader({
    title,
    backUrl = "/",
    user,
    className,
    rightContent
}: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between mb-8 px-4 pt-8 relative z-10", className)}>
            <div className="flex items-center gap-4">
                <Link
                    href={backUrl}
                    className="p-2.5 bg-white/50 hover:bg-white rounded-full transition-all text-slate-500 hover:text-slate-800 shadow-sm border border-transparent hover:border-slate-100 flex items-center justify-center"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
                {rightContent ? (
                    rightContent
                ) : (
                    <>
                        <div className="bg-white/50 backdrop-blur-sm rounded-full p-0.5 border border-white/40 shadow-sm">
                            <PrivacyToggle />
                        </div>
                        {user && <UserNav email={user.email || 'User'} />}
                    </>
                )}
            </div>
        </div>
    );
}
