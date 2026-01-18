"use client";

import { UserNav } from "@/components/user-nav";
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { getTimeBasedGreeting } from "@/utils/timezone";

interface GreetingHeaderProps {
    userEmail?: string;
    userName?: string;
    hasFamily?: boolean; // v1.4.0: For private wallet menu
    showControls?: boolean;
}

export default function GreetingHeader({ userEmail, userName, hasFamily = false, showControls = true }: GreetingHeaderProps) {
    const { text, emoji } = getTimeBasedGreeting();

    return (
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
                {emoji} {text}{userName ? `, ${userName}!` : "!"}
            </h1>

            {showControls && (
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <PrivacyToggle />
                    {userEmail && <UserNav email={userEmail} hasFamily={hasFamily} />}
                </div>
            )}
        </div>
    );
}
