
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Add a race condition to prevent the app from hanging if Supabase is down/blocked
    const {
        data: { user },
    } = await Promise.race([
        supabase.auth.getUser(),
        new Promise<{ data: { user: null }, error: any }>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 3000)
        ).catch(() => ({ data: { user: null }, error: null }))
    ]);

    // Project-specific logic: protect /dashboard
    if (
        !user &&
        request.nextUrl.pathname.startsWith("/dashboard")
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Create bank_status table later; ensuring no session issues with public data fetching
    // But for now, simple redirect logic.

    return supabaseResponse;
}
