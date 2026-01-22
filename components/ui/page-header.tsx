"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

import { SmartHeader } from "@/components/smart-header";

interface PageHeaderProps {
    title: string;
    backUrl?: string;
    showBackButton?: boolean;
    user?: User | null;
    className?: string;
    rightContent?: React.ReactNode;
}

export function PageHeader({
    title,
    backUrl = "/",
    showBackButton = true,
    className,
    rightContent
}: PageHeaderProps) {
    return (
        <div className={cn("mb-20", className)}> {/* Spacer for fixed header */}
            <SmartHeader rightContent={rightContent}>
                <div className="flex items-center gap-3">
                    {showBackButton && (
                        <Link
                            href={backUrl}
                            className="p-2 bg-white/40 hover:bg-white/80 backdrop-blur-md rounded-full transition-all text-slate-600 hover:text-slate-900 shadow-sm border border-white/40 flex items-center justify-center group"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                    )}
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
                </div>
            </SmartHeader>
        </div>
    );
}
