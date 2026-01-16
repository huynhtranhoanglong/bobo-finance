"use client";

import { useState, useEffect } from "react";
import { UserNav } from "@/components/user-nav";
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { NotificationBell } from "@/components/notification-bell";

interface GreetingHeaderProps {
    userEmail?: string;
    showControls?: boolean;
}

export default function GreetingHeader({ userEmail, showControls = true }: GreetingHeaderProps) {
    const [greeting, setGreeting] = useState({ text: "Xin chào!", icon: "👋" });

    useEffect(() => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            setGreeting({ text: "Chào buổi sáng!", icon: "☀️" });
        } else if (hour >= 12 && hour < 18) {
            setGreeting({ text: "Chào buổi chiều!", icon: "🌤️" });
        } else if (hour >= 18 && hour < 22) {
            setGreeting({ text: "Chào buổi tối!", icon: "🌙" });
        } else {
            setGreeting({ text: "Khuya rồi, nghỉ ngơi nhé!", icon: "🌃" });
        }
    }, []);

    return (
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
                {greeting.icon} {greeting.text}
            </h1>

            {showControls && (
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <PrivacyToggle />
                    {userEmail && <UserNav email={userEmail} />}
                </div>
            )}
        </div>
    );
}
