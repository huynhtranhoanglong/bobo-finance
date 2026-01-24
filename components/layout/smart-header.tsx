"use client";

import { useState, useEffect } from "react";
import { NotificationBell } from "@/components/layout/notification-bell";
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { cn } from "@/lib/utils";

interface SmartHeaderProps {
    title?: string;
    rightContent?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
    sticky?: boolean;
}

export function SmartHeader({
    title,
    rightContent,
    className,
    children,
    sticky = false
}: SmartHeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                sticky ? "fixed" : "absolute",
                "top-0 left-0 right-0 z-30 px-6 py-4 transition-all duration-300 ease-in-out",
                isScrolled && sticky
                    ? "bg-white/70 backdrop-blur-xl shadow-md border-b border-white/20"
                    : "bg-transparent",
                className
            )}
        >
            <div className="max-w-2xl mx-auto flex items-center justify-between">
                {/* Left Content */}
                <div className="flex-1">
                    {children ? children : (
                        title && (
                            <h1 className={cn(
                                "text-xl font-bold transition-all duration-300",
                                isScrolled ? "text-slate-800" : "text-slate-900"
                            )}>
                                {title}
                            </h1>
                        )
                    )}
                </div>

                {/* Right Content */}
                <div className="flex items-center gap-3">
                    {rightContent ? (
                        rightContent
                    ) : (
                        <>
                            <div className={cn(
                                "rounded-full p-0.5 transition-all duration-300",
                                isScrolled ? "bg-white/50 backdrop-blur-sm border border-slate-200/50" : "bg-white/40 backdrop-blur-sm border border-white/40 shadow-sm"
                            )}>
                                <NotificationBell />
                            </div>
                            <div className={cn(
                                "rounded-full p-0.5 transition-all duration-300",
                                isScrolled ? "bg-white/50 backdrop-blur-sm border border-slate-200/50" : "bg-white/40 backdrop-blur-sm border border-white/40 shadow-sm"
                            )}>
                                <PrivacyToggle />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
