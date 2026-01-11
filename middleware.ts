import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
    const response = await updateSession(request);

    // Nếu user chưa đăng nhập và không ở trang login -> Redirect về login
    // Lưu ý: updateSession trả về response có set cookie, ta cần check user từ supabase client trong đó
    // Tuy nhiên đơn giản nhất là check header x-middleware-request-cookie hoặc dùng logic trong updateSession trả về redirect
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};