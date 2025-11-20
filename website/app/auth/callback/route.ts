import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home page after successful auth
  return NextResponse.redirect(new URL("/", request.url));
}

