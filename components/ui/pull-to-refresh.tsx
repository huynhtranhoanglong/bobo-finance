"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_BRAND } from "@/utils/colors";

interface PullToRefreshProps {
    children: React.ReactNode;
    onRefresh?: () => Promise<void>;
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
    const router = useRouter();
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [pulling, setPulling] = useState(false);
    const [loading, setLoading] = useState(false);

    // Threshold to trigger refresh (pixels)
    const PULL_THRESHOLD = 120;
    // Maximum pull distance capable visually
    const MAX_PULL = 180;

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            // Only enable pull if at the very top of the page
            if (window.scrollY === 0) {
                setStartY(e.touches[0].clientY);
                setPulling(true);
            } else {
                setPulling(false);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!pulling || loading) return;

            const y = e.touches[0].clientY;
            const diff = y - startY;

            // Only allow pulling down, and apply resistance (damping)
            if (diff > 0) {
                // Prevent default only if we are vertically pulling to avoid scrolling up behavior
                if (window.scrollY === 0 && diff < MAX_PULL) {
                    // e.preventDefault(); // Note: Often better not to preventDefault globally to not break scroll
                }

                // Logarithmic resistance
                const dampenedDiff = Math.min(diff * 0.5, MAX_PULL);
                setCurrentY(dampenedDiff);
            }
        };

        const handleTouchEnd = async () => {
            if (!pulling || loading) return;

            if (currentY > PULL_THRESHOLD - 40) { // Trigger a bit earlier than max
                setLoading(true);
                setCurrentY(60); // Snap to loading position

                try {
                    if (onRefresh) {
                        await onRefresh();
                    } else {
                        // Default behavior: Router refresh
                        // We use a small timeout to ensure the animation is visible
                        await new Promise(resolve => setTimeout(resolve, 800));
                        router.refresh();
                    }
                } finally {
                    // Reset after a short delay
                    setTimeout(() => {
                        setLoading(false);
                        setCurrentY(0);
                    }, 300); // 300ms fade out
                }
            } else {
                // Snap back if threshold not met
                setCurrentY(0);
            }
            setPulling(false);
        };

        // Add passive: false to allow preventDefault if needed, but here we keep it simple
        // Attaching to window to catch pulls anywhere
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [pulling, loading, startY, currentY, router, onRefresh]);

    // Transform style
    const style = {
        transform: `translateY(${currentY}px)`,
        transition: pulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    return (
        <div className="min-h-screen relative touch-pan-y">
            {/* Loading Indicator */}
            <div
                className={cn(
                    "fixed top-0 left-0 right-0 flex justify-center pt-4 pointer-events-none z-50 transition-opacity duration-300",
                    (currentY > 0 || loading) ? "opacity-100" : "opacity-0"
                )}
                style={{ height: `${Math.max(currentY, 60)}px` }}
            >
                <div className={cn(
                    "bg-white rounded-full p-2 shadow-md border border-gray-100 flex items-center justify-center h-10 w-10",
                    loading && "animate-in fade-in zoom-in duration-300"
                )}>
                    <Loader2
                        className={cn(
                            "h-6 w-6",
                            loading ? "animate-spin" : ""
                        )}
                        style={{
                            color: COLOR_BRAND,
                            transform: loading ? '' : `rotate(${currentY * 2}deg)`
                        }}
                    />
                </div>
            </div>

            {/* Content Wrapper */}
            <div style={style} className="will-change-transform">
                {children}
            </div>
        </div>
    );
}
