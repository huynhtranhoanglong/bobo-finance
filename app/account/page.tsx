"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getProfileAction, updateProfileAction, signOutAction } from "@/app/actions"
import { ArrowLeft, Loader2, Save, User, LogOut, Mail, Globe, Check } from "lucide-react"
import Link from "next/link"
import { AppVersion } from "@/components/app-version"
import { COLOR_BRAND } from "@/utils/colors"
import { useTranslation, useLanguage } from "@/components/providers/language-provider"
import { Language } from "@/utils/i18n"

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
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </main>
        )
    }

    if (!profile) return null;

    const initials = (profile.display_name || profile.email || "U").charAt(0).toUpperCase();

    return (
        <main className="min-h-screen bg-gray-50 p-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 max-w-lg mx-auto">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-xl transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">👤 {t.LABEL_ACCOUNT_PAGE_TITLE}</h1>
            </div>

            <div className="max-w-lg mx-auto space-y-4">

                {/* Avatar Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-3xl font-bold mb-4 border-4 border-white shadow-sm">
                        {initials}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{profile.display_name || profile.email}</h2>
                    <p className="text-gray-500">{profile.email}</p>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <User size={18} /> {t.LABEL_PERSONAL_INFO}
                    </h3>

                    <form action={handleUpdate} className="space-y-4">
                        <div>
                            <Label htmlFor="display_name" className="text-gray-600">{t.LABEL_DISPLAY_NAME}</Label>
                            <Input
                                id="display_name"
                                name="display_name"
                                defaultValue={profile.display_name}
                                placeholder={t.LABEL_DISPLAY_NAME_PLACEHOLDER}
                                required
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-400 mt-1">{t.LABEL_DISPLAY_NAME_NOTE}</p>
                        </div>

                        <div>
                            <Label className="text-gray-600">{t.LABEL_EMAIL}</Label>
                            <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded-md border text-gray-500">
                                <Mail size={16} />
                                <span className="text-sm">{profile.email}</span>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {message.text}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={saving}
                            className="w-full"
                            style={{ backgroundColor: COLOR_BRAND }}
                        >
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {saving ? t.LABEL_SAVING : t.LABEL_SAVE_CHANGES}
                        </Button>
                    </form>
                </div>

                {/* Language Settings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Globe size={18} /> {t.LABEL_LANGUAGE_SETTINGS}
                    </h3>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleLanguageChange('vi')}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${language === 'vi'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇻🇳</span>
                                <span className="font-medium">{t.LABEL_LANGUAGE_VIETNAMESE}</span>
                            </div>
                            {language === 'vi' && <Check size={20} style={{ color: COLOR_BRAND }} />}
                        </button>

                        <button
                            onClick={() => handleLanguageChange('en')}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${language === 'en'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇬🇧</span>
                                <span className="font-medium">{t.LABEL_LANGUAGE_ENGLISH}</span>
                            </div>
                            {language === 'en' && <Check size={20} style={{ color: COLOR_BRAND }} />}
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 mt-3">{t.LABEL_LANGUAGE_NOTE}</p>
                </div>

                {/* Logout Section */}
                <div className="mt-8">
                    <form action={signOutAction}>
                        <Button
                            variant="outline"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            type="submit"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            {t.LABEL_LOGOUT}
                        </Button>
                    </form>
                    <AppVersion />
                </div>
            </div >
        </main >
    )
}
