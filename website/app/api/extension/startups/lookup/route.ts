import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with cookies
    const { url, anonKey } = getSupabaseEnv();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
      return NextResponse.json(
        { error: "Server misconfiguration. Contact support." },
        { status: 500 }
      );
    }

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // No need to set cookies in API route
        },
      },
    });

    const adminSupabase = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must log in to Startup List first" },
        { status: 401 }
      );
    }

    // Get linkedin_url from query params
    const searchParams = request.nextUrl.searchParams;
    const linkedinUrl = searchParams.get("linkedin_url");

    if (!linkedinUrl) {
      return NextResponse.json(
        { error: "linkedin_url is required" },
        { status: 400 }
      );
    }

    // Normalize LinkedIn URL (remove trailing slashes, query params)
    const normalizedUrl = linkedinUrl.split("?")[0].replace(/\/+$/, "");

    // Search for startup by LinkedIn URL
    const { data: startup, error: dbError } = await adminSupabase
      .from("startups")
      .select("id, name, tagline, website_url, linkedin_url, country, city, team_size")
      .eq("linkedin_url", normalizedUrl)
      .maybeSingle();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    if (startup) {
      // Check if user has already saved this startup
      const { data: savedStartup } = await supabase
        .from("saved_startups")
        .select("id")
        .eq("user_id", user.id)
        .eq("startup_id", startup.id)
        .maybeSingle();

      return NextResponse.json({
        exists: true,
        startup: {
          ...startup,
          is_saved: !!savedStartup,
        },
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

