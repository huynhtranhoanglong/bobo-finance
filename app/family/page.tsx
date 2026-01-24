"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    createFamilyAction,
    getMyFamilyAction,
    inviteMemberAction,
    leaveFamilyAction,
    removeMemberAction,
    cancelInvitationAction
} from "@/app/actions"
import {
    Users,
    UserPlus,
    LogOut,
    Trash2,
    Crown,
    Loader2,
    ArrowLeft,
    Mail,
    Clock,
    X
} from "lucide-react"
import Link from "next/link"
import { AppVersion } from "@/components/layout/app-version"
import { PageHeader } from "@/components/ui/page-header"
import { COLOR_BRAND } from "@/utils/colors"
import { useTranslation } from "@/components/providers/language-provider"

interface FamilyMember {
    user_id: string
    role: string
    joined_at: string
    email: string
    display_name: string
}

interface PendingInvitation {
    id: string
    email: string
    created_at: string
    expires_at: string
}

interface FamilyData {
    id: string
    name: string
    owner_id: string
    is_owner: boolean
    members: FamilyMember[]
    pending_invitations: PendingInvitation[] | null
}

export default function FamilyPage() {
    const { t } = useTranslation()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [familyData, setFamilyData] = useState<FamilyData | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

    // Fetch family data on mount
    useEffect(() => {
        fetchFamilyData()
    }, [])

    async function fetchFamilyData() {
        const result = await getMyFamilyAction()
        if (!result.error) {
            setFamilyData(result.data)
        }
        setLoading(false)
    }

    // Create family
    async function handleCreateFamily(formData: FormData) {
        setActionLoading(true)
        const result = await createFamilyAction(formData)
        if (result.error) {
            alert(t.LABEL_ERROR_PREFIX + result.error)
        } else {
            fetchFamilyData()
        }
        setActionLoading(false)
    }

    // Invite member
    async function handleInvite(formData: FormData) {
        setActionLoading(true)
        const result = await inviteMemberAction(formData)
        if (result.error) {
            alert(t.LABEL_ERROR_PREFIX + result.error)
        } else {
            alert(t.LABEL_INVITE_SENT)
            fetchFamilyData()
        }
        setActionLoading(false)
    }

    // Leave family
    async function handleLeave() {
        if (!confirm(t.LABEL_CONFIRM_LEAVE_FAMILY)) return

        setActionLoading(true)
        const result = await leaveFamilyAction()
        if (result.error) {
            alert(t.LABEL_ERROR_PREFIX + result.error)
        } else {
            router.push("/")
        }
        setActionLoading(false)
    }

    // Remove member
    async function handleRemove(userId: string, name: string) {
        if (!confirm(t.LABEL_CONFIRM_REMOVE_MEMBER.replace("{name}", name))) return

        setActionLoading(true)
        const result = await removeMemberAction(userId)
        if (result.error) {
            alert(t.LABEL_ERROR_PREFIX + result.error)
        } else {
            fetchFamilyData()
        }
        setActionLoading(false)
    }

    // Cancel invitation
    async function handleCancelInvitation(invitationId: string) {
        setActionLoading(true)
        const result = await cancelInvitationAction(invitationId)
        if (result.error) {
            alert(t.LABEL_ERROR_PREFIX + result.error)
        } else {
            fetchFamilyData()
        }
        setActionLoading(false)
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#FAFAFA] relative overflow-hidden flex flex-col pt-safe">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[80px] mix-blend-multiply opacity-70 animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[60px] mix-blend-multiply opacity-60 animate-delayed-float" />
            </div>

            <div className="max-w-lg mx-auto w-full p-4 md:p-8 pb-32 relative z-10">
                {/* Header */}
                <PageHeader
                    title={`👨‍👩‍👧 ${t.LABEL_FAMILY_PAGE_TITLE}`}
                    showBackButton={true}
                    sticky={false}
                    className="px-0"
                />

                {/* STATE 1: No Family */}
                {!familyData && (
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-white/40">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-slate-100/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/60 shadow-inner">
                                <Users size={40} className="text-slate-400" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">{t.LABEL_NO_FAMILY}</h2>
                            <p className="text-slate-500 mt-2 leading-relaxed">
                                {t.LABEL_NO_FAMILY_DESC}
                            </p>
                        </div>

                        <form action={handleCreateFamily} className="space-y-5">
                            <div>
                                <Label className="text-slate-600 font-medium ml-1 mb-1.5 block">{t.LABEL_FAMILY_NAME}</Label>
                                <Input
                                    name="name"
                                    placeholder={t.LABEL_FAMILY_NAME_PLACEHOLDER}
                                    required
                                    className="bg-white/50 border-white/60 focus:bg-white focus:border-emerald-200/50 rounded-xl h-12 transition-all shadow-sm"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-emerald-200/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                style={{ backgroundColor: COLOR_BRAND }}
                            >
                                {actionLoading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t.LABEL_CREATING}</>
                                ) : (
                                    <><UserPlus className="mr-2 h-5 w-5" /> {t.LABEL_CREATE_FAMILY}</>
                                )}
                            </Button>
                        </form>
                    </div>
                )}

                {/* STATE 2 & 3: Has Family */}
                {familyData && (
                    <div className="space-y-6">
                        {/* Family Info - Glass Card */}
                        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40 flex items-center gap-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-transparent pointer-events-none" />
                            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shadow-md border border-white/60 group-hover:scale-105 transition-transform duration-500">
                                <Users className="text-emerald-600" size={32} />
                            </div>
                            <div className="relative">
                                <h2 className="text-xl font-bold text-slate-800">{familyData.name}</h2>
                                <p className="text-slate-500 font-medium flex items-center gap-2">
                                    {familyData.members?.length || 0} {t.LABEL_MEMBERS}
                                    {familyData.is_owner && (
                                        <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs border border-amber-100">
                                            <Crown className="h-3 w-3" /> {t.LABEL_OWNER_BADGE}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Members List - Glass Card */}
                        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <Users size={18} className="text-slate-400" />
                                {t.LABEL_MEMBERS_TITLE}
                            </h3>
                            <div className="space-y-3">
                                {familyData.members?.map((member) => (
                                    <div key={member.user_id} className="flex items-center justify-between p-3 rounded-2xl bg-white/40 hover:bg-white/60 border border-transparent hover:border-white/50 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-white flex items-center justify-center text-slate-600 font-bold border border-white shadow-sm">
                                                {(member.display_name || member.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                                                    {member.display_name || member.email}
                                                    {member.role === 'owner' && (
                                                        <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-500">{member.email}</p>
                                            </div>
                                        </div>
                                        {/* Remove button */}
                                        {familyData.is_owner && member.role !== 'owner' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemove(member.user_id, member.display_name || member.email)}
                                                disabled={actionLoading}
                                                className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pending Invitations - Glass Card */}
                        {familyData.is_owner && familyData.pending_invitations && familyData.pending_invitations.length > 0 && (
                            <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <Clock size={18} className="text-amber-500" /> {t.LABEL_PENDING_INVITATIONS}
                                </h3>
                                <div className="space-y-2">
                                    {familyData.pending_invitations.map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100/50 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                    <Mail size={14} />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">{inv.email}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCancelInvitation(inv.id)}
                                                disabled={actionLoading}
                                                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50/50"
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Invite Form - Glass Card */}
                        {familyData.is_owner && (
                            <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <UserPlus size={18} className="text-emerald-600" />
                                    {t.LABEL_INVITE_NEW_MEMBER}
                                </h3>
                                <form action={handleInvite} className="flex gap-3">
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder={t.LABEL_INVITE_EMAIL_PLACEHOLDER}
                                        required
                                        className="flex-1 bg-white/50 border-white/60 focus:bg-white focus:border-emerald-200/50 rounded-xl h-11 shadow-sm"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={actionLoading}
                                        style={{ backgroundColor: COLOR_BRAND }}
                                        className="rounded-xl px-4 shadow-lg shadow-emerald-100"
                                    >
                                        {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus size={20} />}
                                    </Button>
                                </form>
                                <p className="text-xs text-slate-400 mt-3 pl-1">
                                    {t.LABEL_INVITE_NOTE}
                                </p>
                            </div>
                        )}

                        {/* Leave Button */}
                        <div className="pt-2 pb-8">
                            <Button
                                variant="outline"
                                onClick={handleLeave}
                                disabled={actionLoading}
                                className="w-full h-12 rounded-xl text-red-600 bg-white/40 border-red-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-sm"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                {t.LABEL_LEAVE_FAMILY}
                            </Button>
                            <p className="text-xs text-center text-slate-400 mt-3">
                                {familyData.is_owner
                                    ? t.LABEL_LEAVE_OWNER_NOTE
                                    : t.LABEL_LEAVE_MEMBER_NOTE}
                            </p>
                        </div>
                    </div>
                )}

                <AppVersion light={false} className="mt-8 opacity-60" />
            </div>
        </main>
    )
}
