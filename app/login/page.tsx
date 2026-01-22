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
        <div className="w-full max-w-[420px] relative z-10">
            {/* Glassmorphism Container */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-8 sm:p-12 relative overflow-hidden transition-all duration-300 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]">

                {/* Decorative Background Elements (Subtle) */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10 opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-10 opacity-60 pointer-events-none" />

                {/* Language Toggle - Minimal Floating */}
                <button
                    type="button"
                    onClick={toggleLanguage}
                    className="absolute top-8 right-8 flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-white/50 px-2 py-1 rounded-full border border-transparent hover:border-slate-100"
                >
                    <Globe size={16} />
                    <span className="text-xs font-semibold tracking-wide">{language.toUpperCase()}</span>
                </button>

                {/* Header Section */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="relative group cursor-pointer">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                            <Image
                                src="/icon.png"
                                alt="Bobo Logo"
                                width={80}
                                height={80}
                                className="rounded-2xl relative transition-transform duration-300 group-hover:scale-105 shadow-sm"
                                priority
                            />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
                        {isLogin ? t.LABEL_LOGIN_TITLE : t.LABEL_REGISTER_TITLE}
                    </h1>
                    <p className="text-slate-500">
                        {t.LABEL_TAGLINE}
                    </p>
                </div>

                {/* Soft Tabs Switcher */}
                <div className="flex p-1.5 bg-slate-50/80 rounded-2xl mb-8 relative border border-slate-100/50">
                    <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer relative z-10 ${isLogin
                            ? "text-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-white"
                            : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        {t.LABEL_LOGIN}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer relative z-10 ${!isLogin
                            ? "text-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-white"
                            : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        {t.LABEL_REGISTER}
                    </button>
                </div>

                {/* Error/Success Message - Soft Alert */}
                {message && (
                    <div className={`flex items-start gap-3 p-4 text-sm rounded-2xl mb-6 shadow-sm border ${message.includes("thành công") || message.includes("Check your email")
                        ? "bg-emerald-50/80 text-emerald-700 border-emerald-100"
                        : "bg-rose-50/80 text-rose-700 border-rose-100"
                        } backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300`}>
                        {!message.includes("thành công") && !message.includes("Check") && (
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="font-medium">
                            {message === "Could not authenticate"
                                ? t.LABEL_WRONG_CREDENTIALS
                                : message.includes("Check") ? t.LABEL_CHECK_EMAIL : message}
                        </span>
                    </div>
                )}

                {/* Google Login - Soft Button */}
                <form className="mb-6">
                    <Button
                        formAction={loginWithGoogle}
                        formNoValidate
                        className="w-full h-14 bg-white hover:bg-slate-50 text-slate-600 font-semibold border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 rounded-2xl gap-3 cursor-pointer"
                        variant="ghost"
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

                {/* Soft Divider */}
                <div className="relative my-8 group">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-100 group-hover:border-slate-200 transition-colors" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                        <span className="bg-white/50 backdrop-blur-sm px-4 text-slate-400 font-medium">{t.LABEL_OR_EMAIL}</span>
                    </div>
                </div>

                {/* Email Form */}
                <form className="space-y-5">
                    <div className="space-y-2 group">
                        <Label htmlFor="email" className="text-sm font-semibold text-slate-600 ml-1 group-focus-within:text-emerald-600 transition-colors">
                            {t.LABEL_EMAIL}
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t.LABEL_EMAIL_EXAMPLE}
                            required
                            className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                        />
                    </div>
                    <div className="space-y-2 group">
                        <Label htmlFor="password" className="text-sm font-semibold text-slate-600 ml-1 group-focus-within:text-emerald-600 transition-colors">
                            {t.LABEL_PASSWORD}
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-slate-800 pr-12 placeholder:text-slate-400 focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <Button
                        formAction={isLogin ? login : signup}
                        className="w-full h-14 mt-4 text-[15px] font-bold tracking-wide rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer shadow-[0_10px_20px_-10px_rgba(89,140,88,0.4)] hover:shadow-[0_15px_30px_-10px_rgba(89,140,88,0.5)]"
                        style={{
                            backgroundColor: COLOR_BRAND,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = COLOR_BRAND_HOVER;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = COLOR_BRAND;
                        }}
                    >
                        {isLogin ? t.LABEL_LOGIN : t.LABEL_REGISTER}
                    </Button>
                </form>

                {/* Footer Demo Link */}
                <div className="text-center mt-8 pt-6 border-t border-slate-50">
                    <p className="text-sm text-slate-500">
                        {t.LABEL_TRY_DEMO}{" "}
                        <Link
                            href="/?demo=true"
                            className="font-bold hover:underline underline-offset-4 transition-all"
                            style={{ color: COLOR_BRAND }}
                        >
                            {t.LABEL_TRY_NOW}
                        </Link>
                    </p>
                </div>
            </div>

            {/* Copyright/Footer note */}
            <div className="text-center mt-8 opacity-40 hover:opacity-100 transition-opacity duration-500">
                <p className="text-xs text-slate-400 font-medium">© 2026 Bobo Finance. All rights reserved.</p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    const { t } = useTranslation();
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#FAFAFA] relative isolate overflow-hidden">
            {/* Background Ambient Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[100px] -z-10 animate-pulse-slow" style={{ animationDelay: '1s' }} />

            <Suspense fallback={<div className="text-center text-slate-400 font-medium animate-pulse">{t.LABEL_LOADING_PAGE}</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}