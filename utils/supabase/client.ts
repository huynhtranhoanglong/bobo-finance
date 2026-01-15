import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern: lưu instance để tái sử dụng
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
    if (!clientInstance) {
        clientInstance = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }
    return clientInstance;
}
