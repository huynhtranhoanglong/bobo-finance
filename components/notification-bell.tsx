"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getNotificationsAction } from "@/app/actions/notifications";
import { NotificationItem } from "@/components/notification-item";
import { COLOR_BRAND } from "@/utils/colors";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        const { data } = await getNotificationsAction();
        if (data) {
            setNotifications(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Refresh when opening
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            fetchNotifications();
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px] p-0 shadow-xl border-gray-100 rounded-xl overflow-hidden bg-white">
                <DropdownMenuLabel className="p-3 text-base font-semibold bg-gray-50/50 border-b flex justify-between items-center">
                    <span>Thông báo</span>
                    {unreadCount > 0 && (
                        <span style={{ backgroundColor: COLOR_BRAND }} className="text-white text-xs px-2 py-0.5 rounded-full">
                            {unreadCount} mới
                        </span>
                    )}
                </DropdownMenuLabel>

                <div className="max-h-[400px] overflow-y-auto">
                    {loading && notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            Đang tải...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                            <Bell className="h-8 w-8 opacity-20" />
                            <p>Không có thông báo mới</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onRead={fetchNotifications}
                            />
                        ))
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-2 border-t bg-gray-50/50 text-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-500 w-full hover:text-green-600"
                            onClick={() => { }} // TODO: Mark all read
                        >
                            Đánh dấu tất cả đã đọc
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
