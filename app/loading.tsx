"use client";

import Image from "next/image";
import { COLOR_BRAND } from "@/utils/colors";
import { useTranslation } from "@/components/providers/language-provider";

export default function Loading() {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="relative flex flex-col items-center">
                <Image
                    src="/icon.png"
                    alt="Bobo Logo"
                    width={120}
                    height={120}
                    className="animate-pulse"
                    priority
                />
                <p className="mt-4 text-sm font-medium animate-pulse" style={{ color: COLOR_BRAND }}>{t.LABEL_LOADING_DATA}</p>
            </div>
        </div>
    );
}
