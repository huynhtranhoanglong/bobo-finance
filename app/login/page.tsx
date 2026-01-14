import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login, signup, loginWithGoogle } from "./actions"; // Import actions

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string };
}) {
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
                    <h1 className="text-2xl font-bold tracking-tight">Đăng nhập Bobo</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Quản lý tiền thông minh, đơn giản, an toàn. 🔒
                    </p>
                </div>

                <form className="space-y-4">
                    {/* Thông báo lỗi/thành công */}
                    {searchParams?.message && (
                        <div className={`p-3 text-sm rounded-md ${searchParams.message.includes("thành công") ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                            {searchParams.message === "Could not authenticate" ? "Sai tài khoản hoặc mật khẩu!" : searchParams.message}
                        </div>
                    )}

                    {/* Nút Google - Đưa lên đầu */}
                    <Button
                        formAction={loginWithGoogle}
                        formNoValidate
                        className="w-full flex items-center justify-center gap-2 h-12 text-base"
                        style={{ backgroundColor: '#598c58' }}
                    >
                        <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Đăng nhập bằng Google
                    </Button>

                    {/* Divider */}
                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Hoặc đăng nhập bằng email</span>
                        </div>
                    </div>

                    {/* Form Email/Password */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="email@example.com"
                            required
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="h-11"
                        />
                    </div>

                    <Button
                        formAction={login}
                        className="w-full h-11 hover:opacity-90"
                        style={{ backgroundColor: '#598c58' }}
                    >
                        Đăng nhập
                    </Button>
                    <Button formAction={signup} variant="outline" className="w-full h-11">
                        Đăng ký tài khoản mới
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