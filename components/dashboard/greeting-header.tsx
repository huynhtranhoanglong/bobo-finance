import { SmartHeader } from "@/components/layout/smart-header";
import { useTranslation } from "@/components/providers/language-provider";

interface GreetingHeaderProps {
    userEmail?: string;
    userName?: string;
    hasFamily?: boolean;
    hasPrivateWallets?: boolean;
    showControls?: boolean;
}

export default function GreetingHeader({
    userName,
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

    if (!showControls) {
        return (
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {emoji} {t[greetingKey]}{userName ? `, ${userName}!` : "!"}
                </h1>
            </div>
        )
    }

    return (
        <div className="mb-20"> {/* Spacer for fixed header */}
            <SmartHeader>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                    {emoji} {t[greetingKey]}{userName ? `, ${userName}!` : "!"}
                </h1>
            </SmartHeader>
        </div>
    );
}
