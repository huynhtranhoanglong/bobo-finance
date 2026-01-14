"use client";

import { useEffect } from "react";
import { usePrivacy } from "@/components/providers/privacy-provider";

/**
 * Component này tự động tắt Privacy Mode khi mount.
 * Dùng cho Demo Mode để người dùng thấy số liệu mẫu.
 */
export function DisablePrivacyOnMount() {
    const { isPrivacyMode, togglePrivacy } = usePrivacy();

    useEffect(() => {
        // Nếu đang bật Privacy Mode -> Tắt đi
        if (isPrivacyMode) {
            togglePrivacy();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy 1 lần khi mount

    return null; // Component này không render gì
}
