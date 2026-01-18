"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Bell } from "lucide-react";
import { acceptInvitationAction } from "@/app/actions";
import { markNotificationReadAction } from "@/app/actions/notifications";
import { useRouter } from "next/navigation";
import { COLOR_BRAND, COLOR_BRAND_HOVER } from "@/utils/colors";
import { LABEL_LOADING, LABEL_ACCEPT, LABEL_DECLINE } from "@/utils/labels";

interface NotificationItemProps {
    notification: any;
    onRead: () => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { id, type, title, content, data, is_read, created_at } = notification;

    const handleAccept = async () => {
        if (type !== 'family_invite' || !data.token) return;

        try {
            setLoading(true);
            const result = await acceptInvitationAction(data.token);
            if (result.error) {
                alert(result.error); // Simple alert for now
            } else {
                // Success
                await markNotificationReadAction(id);
                onRead();
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        // For now, decline just dismisses the notification (marks as read)
        // In future: Call decline API
        await markNotificationReadAction(id);
        onRead();
    };

    const timeAgo = new Date(created_at).toLocaleDateString('vi-VN', {
        day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className={`p-3 border-b last:border-0 hover:bg-gray-50 transition w-full ${!is_read ? 'bg-blue-50/50' : ''}`}>
            <div className="flex gap-3">
                <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <Bell size={16} />
                    </div>
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                        <p className={`text-sm ${!is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {title}
                        </p>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-snug">
                        {content}
                    </p>

                    {/* ACTIONS FOR FAMILY INVITE */}
                    {type === 'family_invite' && !is_read && (
                        <div className="flex gap-2 mt-2">
                            <Button
                                size="sm"
                                className="h-8 text-white"
                                style={{ backgroundColor: COLOR_BRAND }}
                                onClick={handleAccept}
                                disabled={loading}
                            >
                                {loading ? LABEL_LOADING : (
                                    <>
                                        <Check size={14} className="mr-1" /> {LABEL_ACCEPT}
                                    </>
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-gray-600 border-gray-200"
                                onClick={handleDecline}
                                disabled={loading}
                            >
                                <X size={14} className="mr-1" /> {LABEL_DECLINE}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
