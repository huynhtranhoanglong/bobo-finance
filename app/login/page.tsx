import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "./actions"; // Import hàm logic vừa viết

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
                        Nhập tài khoản Admin bạn đã tạo trong Database
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

                    {/* Hiển thị lỗi nếu có */}
                    {searchParams?.message && (
                        <div className="p-3 bg-red-100 text-red-600 text-sm rounded-md">
                            Sai tài khoản hoặc mật khẩu!
                        </div>
                    )}

                    {/* formAction sẽ gọi hàm login ở server */}
                    <Button formAction={login} className="w-full">
                        Đăng nhập
                    </Button>
                </form>
            </div>
        </div>
    );
}