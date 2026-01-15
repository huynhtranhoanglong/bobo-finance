"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-gray-200",
                className
            )}
            {...props}
        />
    )
}

// Skeleton cho Dashboard Cards
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Net Worth Skeleton */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-40" />
            </div>

            {/* Financial Progress Skeleton */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
            </div>

            {/* Monthly Stats Skeleton */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border">
                <Skeleton className="h-5 w-40 mb-4" />
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                </div>
                <Skeleton className="h-16 rounded-xl" />
            </div>

            {/* Wallets Skeleton */}
            <div>
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-3">
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                </div>
            </div>
        </div>
    )
}

// Skeleton cho Transaction List
export function TransactionListSkeleton() {
    return (
        <div className="space-y-3 animate-in fade-in duration-300">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-24" />
                </div>
            ))}
        </div>
    )
}
