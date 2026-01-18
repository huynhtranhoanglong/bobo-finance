"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getInvitationInfoAction, acceptInvitationAction } from "@/app/actions"
import { Users, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { use } from "react"
import { COLOR_BRAND } from "@/utils/colors"
import { useTranslation } from "@/components/providers/language-provider"

interface InvitationInfo {
    id: string
    family_name: string
    invited_by_name: string
    email: string
    status: string
    expires_at: string
    is_expired: boolean
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { t } = useTranslation()
    const resolvedParams = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [invitation, setInvitation] = useState<InvitationInfo | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        async function fetchInvitation() {
            const result = await getInvitationInfoAction(resolvedParams.token)
            if (result.error) {
                setError(t.LABEL_INVITE_INVALID)
            } else if (!result.data) {
                setError(t.LABEL_INVITE_NOT_FOUND)
            } else {
                setInvitation(result.data)
            }
            setLoading(false)
        }
        fetchInvitation()
    }, [resolvedParams.token, t])

    async function handleAccept() {
        setActionLoading(true)
        const result = await acceptInvitationAction(resolvedParams.token)
        if (result.error) {
            setError(result.error)
        } else {
            setSuccess(true)
            setTimeout(() => router.push("/"), 2000)
        }
        setActionLoading(false)
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </main>
        )
    }

    // Error state
    if (error) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 shadow-sm border max-w-sm w-full text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-800 mb-2">{t.LABEL_ERROR}</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/login">
                        <Button variant="outline" className="w-full">
                            {t.LABEL_BACK_TO_LOGIN}
                        </Button>
                    </Link>
                </div>
            </main>
        )
    }

    // Success state
    if (success) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 shadow-sm border max-w-sm w-full text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-800 mb-2">{t.LABEL_WELCOME}</h1>
                    <p className="text-gray-600">{t.LABEL_JOINED_FAMILY}</p>
                    <p className="text-sm text-gray-400 mt-2">{t.LABEL_REDIRECTING}</p>
                </div>
            </main>
        )
    }

    // Invitation expired or already used
    if (invitation?.is_expired) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 shadow-sm border max-w-sm w-full text-center">
                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-800 mb-2">{t.LABEL_INVITE_EXPIRED}</h1>
                    <p className="text-gray-600 mb-6">
                        {invitation.status === 'accepted'
                            ? t.LABEL_INVITE_USED
                            : t.LABEL_INVITE_EXPIRED_MSG}
                    </p>
                    <Link href="/">
                        <Button variant="outline" className="w-full">
                            {t.LABEL_BACK_TO_HOME}
                        </Button>
                    </Link>
                </div>
            </main>
        )
    }

    // Valid invitation
    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border max-w-sm w-full text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                </div>

                <h1 className="text-xl font-bold text-gray-800 mb-2">
                    {t.LABEL_INVITE_TITLE}
                </h1>

                <div className="bg-gray-50 rounded-xl p-4 my-4">
                    <p className="text-2xl font-bold" style={{ color: COLOR_BRAND }}>
                        {invitation?.family_name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        {t.LABEL_INVITED_BY} {invitation?.invited_by_name}
                    </p>
                </div>

                <p className="text-gray-600 mb-6">
                    {t.LABEL_SHARE_DATA_NOTE}
                </p>

                <Button
                    onClick={handleAccept}
                    disabled={actionLoading}
                    className="w-full mb-3"
                    style={{ backgroundColor: COLOR_BRAND }}
                >
                    {actionLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.LABEL_JOINING}</>
                    ) : (
                        t.LABEL_JOIN_FAMILY
                    )}
                </Button>

                <Link href="/">
                    <Button variant="ghost" className="w-full text-gray-500">
                        {t.LABEL_LATER}
                    </Button>
                </Link>
            </div>
        </main>
    )
}
