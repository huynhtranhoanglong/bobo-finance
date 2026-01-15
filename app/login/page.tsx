"use client";

import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login, signup, loginWithGoogle } from "./actions";
import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
    const searchParams = useSearchParams();
    const message = searchParams.get("message");
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    // Reset password visibility when switching tabs
    useEffect(() => {
        setShowPassword(false);
    }, [isLogin]);

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-sm space-y-6 p-6 sm:p-8 bg-white rounded-xl shadow-lg border">
                {/* Logo + Tiêu đề */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/icon.png"
                            alt="Bobo Logo"
                            width={64}
                            height={64}
                            className="rounded-2xl"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isLogin ? "Đăng nhập Bobo" : "Đăng ký tài khoản"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Quản lý tiền thông minh, đơn giản, an toàn. 🔒
                    </p>
                </div>

                {/* Tabs Toggle */}
                <div className="flex p-1 bg-gray-100 rounded-xl relative">
                    <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 z-10 ${isLogin ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Đăng nhập
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 z-10 ${!isLogin ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Đăng ký
                    </button>
                </div>

                {/* Thông báo lỗi/thành công */}
                {message && (
                    <div className={`flex items-start gap-2 p-3 text-sm rounded-lg border ${message.includes("thành công") || message.includes("Check your email")
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                        {!message.includes("thành công") && !message.includes("Check") && (
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span>
                            {message === "Could not authenticate"
                                ? "Sai tài khoản hoặc mật khẩu!"
                                : message.includes("Check") ? "Vui lòng kiểm tra email để xác nhận!" : message}
                        </span>
                    </div>
                )}

                {/* Google Login Form (Separate to avoid Enter key conflict) */}
                <form>
                    <Button
                        formAction={loginWithGoogle}
                        formNoValidate
                        className="w-full flex items-center justify-center gap-2 h-12 text-base bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                        variant="outline"
                    >
                        <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Đăng nhập bằng Google
                    </Button>
                </form>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Hoặc tiếp tục với email</span>
                    </div>
                </div>

                {/* Main Login/Register Form */}
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="email@example.com"
                            required
                            className="h-11 rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="h-11 rounded-xl pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <Button
                        formAction={isLogin ? login : signup}
                        className="w-full h-11 hover:opacity-90 rounded-xl"
                        style={{ backgroundColor: '#598c58' }}
                    >
                        {isLogin ? "Đăng nhập" : "Đăng ký"}
                    </Button>
                </form>

                {/* Link Demo Mode */}
                <div className="text-center pt-2 border-t">
                    <p className="text-sm text-gray-500">
                        Chưa muốn đăng ký?{" "}
                        <Link href="/?demo=true" className="font-medium hover:underline" style={{ color: '#598c58' }}>
                            Dùng thử ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}