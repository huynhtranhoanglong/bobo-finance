"use client";

import { UserNav } from "@/components/user-nav";
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { useTranslation } from "@/components/providers/language-provider";

interface GreetingHeaderProps {
    userEmail?: string;
    userName?: string;
    hasFamily?: boolean;
    hasPrivateWallets?: boolean; // v1.4.0: For conditional private wallet menu
    showControls?: boolean;
}

export default function GreetingHeader({
    userEmail,
    userName,
    hasFamily = false,
    hasPrivateWallets = false,
    showControls = true
}: GreetingHeaderProps) {
    const { t } = useTranslation();

    // Get greeting based on time of day
    const hour = new Date().getHours();
    let greetingKey: 'GREETING_MORNING' | 'GREETING_AFTERNOON' | 'GREETING_EVENING' | 'GREETING_NIGHT';
    let emoji: string;

    if (hour >= 5 && hour < 12) {
        greetingKey = 'GREETING_MORNING';
        emoji = "☀️";
    } else if (hour >= 12 && hour < 18) {
        greetingKey = 'GREETING_AFTERNOON';
        emoji = "🌤️";
    } else if (hour >= 18 && hour < 22) {
        greetingKey = 'GREETING_EVENING';
        emoji = "🌙";
    } else {
        greetingKey = 'GREETING_NIGHT';
        emoji = "🌃";
    }

    return (
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
                {emoji} {t[greetingKey]}{userName ? `, ${userName}!` : "!"}
            </h1>

            {showControls && (
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <PrivacyToggle />
                    {userEmail && <UserNav email={userEmail} hasFamily={hasFamily} hasPrivateWallets={hasPrivateWallets} />}
                </div>
            )}
        </div>
    );
}
