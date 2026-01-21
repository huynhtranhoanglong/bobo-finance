"use client";

import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login, signup, loginWithGoogle } from "./actions";
import { useState, useEffect, Suspense } from "react";
import { Eye, EyeOff, AlertCircle, Globe } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { COLOR_BRAND, COLOR_BRAND_HOVER } from "@/utils/colors";
import { useTranslation, useLanguage } from "@/components/providers/language-provider";

function LoginForm() {
    const { t } = useTranslation();
    const { language, setLanguage } = useLanguage();
    const searchParams = useSearchParams();
    const message = searchParams.get("message");
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    // Reset password visibility when switching tabs
    useEffect(() => {
        setShowPassword(false);
    }, [isLogin]);

    const toggleLanguage = () => {
        setLanguage(language === "vi" ? "en" : "vi");
    };

    return (
        <div className="w-full max-w-[400px] px-6 py-10 sm:px-10 sm:py-12">
            {/* Language Toggle - Minimal */}
            <button
                type="button"
                onClick={toggleLanguage}
                className="absolute top-6 right-6 flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
                <Globe size={18} />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </button>

            {/* Logo + Title - Centered */}
            <div className="text-center mb-10">
                <div className="flex justify-center mb-5">
                    <Image
                        src="/icon.png"
                        alt="Bobo Logo"
                        width={72}
                        height={72}
                        className="rounded-2xl"
                        priority
                    />
                </div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                    {isLogin ? t.LABEL_LOGIN_TITLE : t.LABEL_REGISTER_TITLE}
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                    {t.LABEL_TAGLINE}
                </p>
            </div>

            {/* Tabs Toggle - Minimalist */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${isLogin
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    {t.LABEL_LOGIN}
                </button>
                <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${!isLogin
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    {t.LABEL_REGISTER}
                </button>
            </div>

            {/* Error/Success Message */}
            {message && (
                <div className={`flex items-start gap-2 p-3 text-sm rounded-xl mb-6 ${message.includes("thành công") || message.includes("Check your email")
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}>
                    {!message.includes("thành công") && !message.includes("Check") && (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>
                        {message === "Could not authenticate"
                            ? t.LABEL_WRONG_CREDENTIALS
                            : message.includes("Check") ? t.LABEL_CHECK_EMAIL : message}
                    </span>
                </div>
            )}

            {/* Google Login - Minimal */}
            <form className="mb-5">
                <Button
                    formAction={loginWithGoogle}
                    formNoValidate
                    className="w-full flex items-center justify-center gap-3 h-12 text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all duration-200 cursor-pointer"
                    variant="outline"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    {t.LABEL_GOOGLE_LOGIN}
                </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#FAFAFA] px-3 text-slate-400 font-medium">{t.LABEL_OR_EMAIL}</span>
                </div>
            </div>

            {/* Main Login/Register Form */}
            <form className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                        {t.LABEL_EMAIL}
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t.LABEL_EMAIL_EXAMPLE}
                        required
                        className="h-12 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-offset-0"
                        style={{
                            "--tw-ring-color": `${COLOR_BRAND}33`
                        } as React.CSSProperties}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                        {t.LABEL_PASSWORD}
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            className="h-12 rounded-xl border-slate-200 bg-white pr-11 placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-offset-0"
                            style={{
                                "--tw-ring-color": `${COLOR_BRAND}33`
                            } as React.CSSProperties}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <Button
                    formAction={isLogin ? login : signup}
                    className="w-full h-12 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
                    style={{
                        backgroundColor: COLOR_BRAND,
                        "--hover-bg": COLOR_BRAND_HOVER
                    } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLOR_BRAND_HOVER}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLOR_BRAND}
                >
                    {isLogin ? t.LABEL_LOGIN : t.LABEL_REGISTER}
                </Button>
            </form>

            {/* Demo Link - Subtle */}
            <div className="text-center mt-8 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                    {t.LABEL_TRY_DEMO}{" "}
                    <Link
                        href="/?demo=true"
                        className="font-medium hover:underline underline-offset-2 transition-colors"
                        style={{ color: COLOR_BRAND }}
                    >
                        {t.LABEL_TRY_NOW}
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    const { t } = useTranslation();
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#FAFAFA] relative">
            <Suspense fallback={<div className="text-center text-slate-500">{t.LABEL_LOADING_PAGE}</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}