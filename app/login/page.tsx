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
            <div className="w-full max-w-sm space-y-8 p-8 bg-white rounded-xl shadow-lg border">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Đăng nhập Bobo</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Vui lòng đăng nhập để tiếp tục. <br />
                        Dữ liệu tài chính của bạn được mã hóa và bảo mật tuyệt đối.
                    </p>
                </div>

                <form className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="admin@bobo.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                        />
                    </div>

                    {searchParams?.message && (
                        <div className={`p-3 text-sm rounded-md mb-4 ${searchParams.message.includes("thành công") ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                            {searchParams.message === "Could not authenticate" ? "Sai tài khoản hoặc mật khẩu!" : searchParams.message}
                        </div>
                    )}

                    {/* formAction sẽ gọi hàm login ở server */}
                    <Button formAction={login} className="w-full mb-2">
                        Đăng nhập
                    </Button>
                    <Button formAction={signup} variant="outline" className="w-full">
                        Đăng ký tài khoản mới
                    </Button>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Hoặc</span>
                        </div>
                    </div>

                    <Button formAction={loginWithGoogle} variant="outline" className="w-full flex items-center justify-center gap-2">
                        <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Đăng nhập bằng Google
                    </Button>
                </form>
            </div>
        </div>
    );
}