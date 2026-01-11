import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login, signup } from "./actions"; // Import hàm logic vừa viết

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
                </form>
            </div>
        </div>
    );
}