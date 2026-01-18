"use client"

import { useTranslation } from "@/components/providers/language-provider"

// This component provides translated labels as props for Server Components
// Server Components cannot use hooks, so this is a clean way to bridge the gap

interface DashboardLabelsProps {
    children: (labels: {
        LABEL_SECTION_WALLETS: string
        LABEL_SECTION_DEBTS: string
        LABEL_NO_WALLETS: string
        LABEL_NO_DEBTS_CONGRATS: string
        LABEL_TRANSACTION_HISTORY: string
        LABEL_MEMBERS: string
        LABEL_MANAGE: string
        LABEL_DEMO_BANNER: string
        LABEL_DEMO_LOGIN_CTA: string
        LABEL_DEBT_MANAGEMENT: string
    }) => React.ReactNode
}

export function DashboardLabels({ children }: DashboardLabelsProps) {
    const { t } = useTranslation()
    return <>{children({
        LABEL_SECTION_WALLETS: t.LABEL_SECTION_WALLETS,
        LABEL_SECTION_DEBTS: t.LABEL_SECTION_DEBTS,
        LABEL_NO_WALLETS: t.LABEL_NO_WALLETS,
        LABEL_NO_DEBTS_CONGRATS: t.LABEL_NO_DEBTS_CONGRATS,
        LABEL_TRANSACTION_HISTORY: t.LABEL_TRANSACTION_HISTORY,
        LABEL_MEMBERS: t.LABEL_MEMBERS,
        LABEL_MANAGE: t.LABEL_MANAGE,
        LABEL_DEMO_BANNER: t.LABEL_DEMO_BANNER,
        LABEL_DEMO_LOGIN_CTA: t.LABEL_DEMO_LOGIN_CTA,
        LABEL_DEBT_MANAGEMENT: t.LABEL_DEBT_MANAGEMENT,
    })}</>
}

interface PrivateLabelsProps {
    children: (labels: {
        LABEL_PRIVATE_DASHBOARD_TITLE: string
        LABEL_PRIVATE_DASHBOARD_EMPTY: string
        LABEL_PRIVATE_DASHBOARD_NOTE: string
        LABEL_TOTAL_PRIVATE_BALANCE: string
        LABEL_CREATE_PRIVATE_WALLET: string
        LABEL_SECTION_WALLETS: string
        LABEL_PRIVATE_WALLETS_COUNT: string
    }) => React.ReactNode
}

export function PrivateLabels({ children }: PrivateLabelsProps) {
    const { t } = useTranslation()
    return <>{children({
        LABEL_PRIVATE_DASHBOARD_TITLE: t.LABEL_PRIVATE_DASHBOARD_TITLE,
        LABEL_PRIVATE_DASHBOARD_EMPTY: t.LABEL_PRIVATE_DASHBOARD_EMPTY,
        LABEL_PRIVATE_DASHBOARD_NOTE: t.LABEL_PRIVATE_DASHBOARD_NOTE,
        LABEL_TOTAL_PRIVATE_BALANCE: t.LABEL_TOTAL_PRIVATE_BALANCE,
        LABEL_CREATE_PRIVATE_WALLET: t.LABEL_CREATE_PRIVATE_WALLET,
        LABEL_SECTION_WALLETS: t.LABEL_SECTION_WALLETS,
        LABEL_PRIVATE_WALLETS_COUNT: t.LABEL_PRIVATE_WALLETS_COUNT,
    })}</>
}
