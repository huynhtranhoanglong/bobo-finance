"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getProfileAction, updateProfileAction, signOutAction } from "@/app/actions"
import { ArrowLeft, Loader2, Save, User, LogOut, Mail, Globe, Check, Users, Lock, MessageSquare } from "lucide-react"
import Link from "next/link"
import { AppVersion } from "@/components/app-version"
import { PageHeader } from "@/components/ui/page-header"
import { COLOR_BRAND } from "@/utils/colors"
import { useTranslation, useLanguage } from "@/components/providers/language-provider"
import { Language } from "@/utils/i18n"
import { FeedbackDialog } from "@/components/feedback-dialog"

interface Profile {
    id: string
    email: string
    display_name: string
    avatar_url: string | null
    created_at: string
}

export default function AccountPage() {
    const { t } = useTranslation()
    const { language, setLanguage } = useLanguage()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    async function fetchProfile() {
        const result = await getProfileAction()
        if (result.data) {
            setProfile(result.data)
        }
        setLoading(false)
    }

    async function handleUpdate(formData: FormData) {
        setSaving(true)
        setMessage(null)

        const result = await updateProfileAction(formData)

        if (result.error) {
            setMessage({ type: 'error', text: t.LABEL_ERROR_PREFIX + result.error })
        } else {
            setMessage({ type: 'success', text: t.LABEL_UPDATE_SUCCESS })
            fetchProfile() // Refresh data
        }
        setSaving(false)
    }

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang)
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </main>
        )
    }

    if (!profile) return null;

    const initials = (profile.display_name || profile.email || "U").charAt(0).toUpperCase();

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
                    title={`👤 ${t.LABEL_ACCOUNT_PAGE_TITLE}`}
                    showBackButton={false}
                    className="px-0"
                />

                <div className="space-y-6">

                    {/* Avatar Section - Glass Card */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-white/40 flex flex-col items-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-200/50 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
                            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center text-emerald-700 text-4xl font-bold mb-4 border-[6px] border-white/80 shadow-lg shadow-emerald-100/50">
                                {initials}
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 relative">{profile.display_name || profile.email}</h2>
                        <p className="text-slate-500 font-medium relative">{profile.email}</p>
                    </div>

                    {/* Edit Form - Glass Card */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40">
                        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2.5">
                            <div className="p-2 bg-emerald-100/50 rounded-xl text-emerald-600">
                                <User size={20} />
                            </div>
                            {t.LABEL_PERSONAL_INFO}
                        </h3>

                        <form action={handleUpdate} className="space-y-5">
                            <div>
                                <Label htmlFor="display_name" className="text-slate-600 font-medium ml-1 mb-1.5 block">{t.LABEL_DISPLAY_NAME}</Label>
                                <Input
                                    id="display_name"
                                    name="display_name"
                                    defaultValue={profile.display_name}
                                    placeholder={t.LABEL_DISPLAY_NAME_PLACEHOLDER}
                                    required
                                    className="bg-white/50 border-white/60 focus:bg-white focus:border-emerald-200/50 rounded-xl h-12 transition-all shadow-sm"
                                />
                                <p className="text-xs text-slate-400 mt-2 ml-1">{t.LABEL_DISPLAY_NAME_NOTE}</p>
                            </div>

                            <div>
                                <Label className="text-slate-600 font-medium ml-1 mb-1.5 block">{t.LABEL_EMAIL}</Label>
                                <div className="flex items-center gap-3 p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 text-slate-500">
                                    <Mail size={18} />
                                    <span className="text-sm font-medium">{profile.email}</span>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                    {message.type === 'success' ? <Check size={16} /> : null}
                                    {message.text}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-emerald-200/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                style={{ backgroundColor: COLOR_BRAND }}
                            >
                                {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                {saving ? t.LABEL_SAVING : t.LABEL_SAVE_CHANGES}
                            </Button>
                        </form>
                    </div>

                    {/* Menu Shortcuts - Glass Card (List) */}
                    <div className="space-y-3">
                        <Link href="/family" className="flex items-center justify-between p-4 bg-white/60 hover:bg-white/90 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100/80 transition-colors shadow-sm">
                                    <Users size={22} />
                                </div>
                                <span className="font-semibold text-slate-700">{t.LABEL_FAMILY}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                                <ArrowLeft size={16} className="rotate-180" />
                            </div>
                        </Link>

                        <Link href="/private" className="flex items-center justify-between p-4 bg-white/60 hover:bg-white/90 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100/80 transition-colors shadow-sm">
                                    <Lock size={22} />
                                </div>
                                <span className="font-semibold text-slate-700">{t.LABEL_PRIVATE_DASHBOARD}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-300 group-hover:text-purple-500 group-hover:bg-purple-50 transition-all">
                                <ArrowLeft size={16} className="rotate-180" />
                            </div>
                        </Link>

                        <button
                            onClick={() => setIsFeedbackOpen(true)}
                            className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-white/90 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-100/80 transition-colors shadow-sm">
                                    <MessageSquare size={22} />
                                </div>
                                <span className="font-semibold text-slate-700">{t.LABEL_FEEDBACK}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-300 group-hover:text-orange-500 group-hover:bg-orange-50 transition-all">
                                <ArrowLeft size={16} className="rotate-180" />
                            </div>
                        </button>

                        <FeedbackDialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
                    </div>

                    {/* Language Settings - Glass Card */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40">
                        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2.5">
                            <div className="p-2 bg-indigo-100/50 rounded-xl text-indigo-600">
                                <Globe size={20} />
                            </div>
                            {t.LABEL_LANGUAGE_SETTINGS}
                        </h3>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleLanguageChange('vi')}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${language === 'vi'
                                    ? 'bg-emerald-50/80 border-emerald-200 shadow-sm'
                                    : 'bg-white/40 border-slate-100 hover:bg-white hover:border-emerald-100'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl drop-shadow-sm">🇻🇳</span>
                                    <span className={`font-semibold ${language === 'vi' ? 'text-emerald-800' : 'text-slate-600'}`}>{t.LABEL_LANGUAGE_VIETNAMESE}</span>
                                </div>
                                {language === 'vi' && (
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={() => handleLanguageChange('en')}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${language === 'en'
                                    ? 'bg-emerald-50/80 border-emerald-200 shadow-sm'
                                    : 'bg-white/40 border-slate-100 hover:bg-white hover:border-emerald-100'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl drop-shadow-sm">🇬🇧</span>
                                    <span className={`font-semibold ${language === 'en' ? 'text-emerald-800' : 'text-slate-600'}`}>{t.LABEL_LANGUAGE_ENGLISH}</span>
                                </div>
                                {language === 'en' && (
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-slate-400 mt-4 text-center font-medium opacity-80">{t.LABEL_LANGUAGE_NOTE}</p>
                    </div>

                    {/* Logout Section */}
                    <div className="pt-4 pb-8">
                        <form action={signOutAction}>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl text-red-600 bg-white/40 border-red-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-sm"
                                type="submit"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                {t.LABEL_LOGOUT}
                            </Button>
                        </form>
                        <AppVersion light={false} className="mt-6 opacity-60" />
                    </div>
                </div>
            </div >
        </main >
    )
}
