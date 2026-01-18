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
import { AppVersion } from "@/components/app-version"
import { COLOR_BRAND } from "@/utils/colors"
import {
    LABEL_ERROR_PREFIX, LABEL_FAMILY_PAGE_TITLE, LABEL_NO_FAMILY, LABEL_NO_FAMILY_DESC,
    LABEL_FAMILY_NAME, LABEL_FAMILY_NAME_PLACEHOLDER, LABEL_CREATE_FAMILY, LABEL_CREATING,
    LABEL_MEMBERS, LABEL_MEMBERS_TITLE, LABEL_OWNER_BADGE, LABEL_PENDING_INVITATIONS,
    LABEL_INVITE_NEW_MEMBER, LABEL_INVITE_EMAIL_PLACEHOLDER, LABEL_INVITE_NOTE,
    LABEL_LEAVE_FAMILY, LABEL_LEAVE_OWNER_NOTE, LABEL_LEAVE_MEMBER_NOTE,
    LABEL_CONFIRM_LEAVE_FAMILY, LABEL_INVITE_SENT
} from "@/utils/labels"

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
            alert(LABEL_ERROR_PREFIX + result.error)
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
            alert(LABEL_ERROR_PREFIX + result.error)
        } else {
            alert(LABEL_INVITE_SENT)
            fetchFamilyData()
        }
        setActionLoading(false)
    }

    // Leave family
    async function handleLeave() {
        if (!confirm(LABEL_CONFIRM_LEAVE_FAMILY)) return

        setActionLoading(true)
        const result = await leaveFamilyAction()
        if (result.error) {
            alert(LABEL_ERROR_PREFIX + result.error)
        } else {
            router.push("/")
        }
        setActionLoading(false)
    }

    // Remove member
    async function handleRemove(userId: string, name: string) {
        if (!confirm(`Bạn có chắc muốn xóa ${name} khỏi gia đình?`)) return

        setActionLoading(true)
        const result = await removeMemberAction(userId)
        if (result.error) {
            alert(LABEL_ERROR_PREFIX + result.error)
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
            alert(LABEL_ERROR_PREFIX + result.error)
        } else {
            fetchFamilyData()
        }
        setActionLoading(false)
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-xl transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">👨‍👩‍👧 {LABEL_FAMILY_PAGE_TITLE}</h1>
            </div>

            {/* STATE 1: No Family */}
            {!familyData && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <div className="text-center mb-6">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-lg font-semibold text-gray-800">{LABEL_NO_FAMILY}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {LABEL_NO_FAMILY_DESC}
                        </p>
                    </div>

                    <form action={handleCreateFamily} className="space-y-4">
                        <div>
                            <Label>{LABEL_FAMILY_NAME}</Label>
                            <Input
                                name="name"
                                placeholder={LABEL_FAMILY_NAME_PLACEHOLDER}
                                required
                                className="mt-1"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full"
                            style={{ backgroundColor: COLOR_BRAND }}
                        >
                            {actionLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {LABEL_CREATING}</>
                            ) : (
                                <><UserPlus className="mr-2 h-4 w-4" /> {LABEL_CREATE_FAMILY}</>
                            )}
                        </Button>
                    </form>
                </div>
            )}

            {/* STATE 2 & 3: Has Family */}
            {familyData && (
                <>
                    {/* Family Info */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Users className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{familyData.name}</h2>
                                <p className="text-sm text-gray-500">
                                    {familyData.members?.length || 0} {LABEL_MEMBERS}
                                    {familyData.is_owner && (
                                        <span className="ml-2 text-amber-600 font-medium">
                                            <Crown className="inline h-3 w-3" /> {LABEL_OWNER_BADGE}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">
                        <h3 className="font-semibold text-gray-700 mb-3">{LABEL_MEMBERS_TITLE}</h3>
                        <div className="space-y-3">
                            {familyData.members?.map((member) => (
                                <div key={member.user_id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                                            {(member.display_name || member.email).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {member.display_name || member.email}
                                                {member.role === 'owner' && (
                                                    <Crown className="inline ml-1 h-4 w-4 text-amber-500" />
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500">{member.email}</p>
                                        </div>
                                    </div>
                                    {/* Remove button (owner can remove others) */}
                                    {familyData.is_owner && member.role !== 'owner' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemove(member.user_id, member.display_name || member.email)}
                                            disabled={actionLoading}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Invitations (Owner only) */}
                    {familyData.is_owner && familyData.pending_invitations && familyData.pending_invitations.length > 0 && (
                        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">
                            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Clock size={16} /> {LABEL_PENDING_INVITATIONS}
                            </h3>
                            <div className="space-y-2">
                                {familyData.pending_invitations.map((inv) => (
                                    <div key={inv.id} className="flex items-center justify-between py-2 px-3 bg-amber-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-amber-600" />
                                            <span className="text-sm text-gray-700">{inv.email}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCancelInvitation(inv.id)}
                                            disabled={actionLoading}
                                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                        >
                                            <X size={14} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Invite Form (Owner only) */}
                    {familyData.is_owner && (
                        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">
                            <h3 className="font-semibold text-gray-700 mb-3">{LABEL_INVITE_NEW_MEMBER}</h3>
                            <form action={handleInvite} className="flex gap-2">
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder={LABEL_INVITE_EMAIL_PLACEHOLDER}
                                    required
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    disabled={actionLoading}
                                    style={{ backgroundColor: COLOR_BRAND }}
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus size={18} />}
                                </Button>
                            </form>
                            <p className="text-xs text-gray-500 mt-2">
                                {LABEL_INVITE_NOTE}
                            </p>
                        </div>
                    )}

                    {/* Leave Button */}
                    <div className="mt-6">
                        <Button
                            variant="outline"
                            onClick={handleLeave}
                            disabled={actionLoading}
                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            {LABEL_LEAVE_FAMILY}
                        </Button>
                        <p className="text-xs text-center text-gray-500 mt-2">
                            {familyData.is_owner
                                ? LABEL_LEAVE_OWNER_NOTE
                                : LABEL_LEAVE_MEMBER_NOTE}
                        </p>
                    </div>
                </>
            )}

            <AppVersion />
        </main>
    )
}
