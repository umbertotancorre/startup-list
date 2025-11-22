import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with cookies
    const { url, anonKey } = getSupabaseEnv();
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

    // Parse request body
    const body = await request.json();
    const { startup_id } = body;

    if (!startup_id) {
      return NextResponse.json(
        { error: "startup_id is required" },
        { status: 400 }
      );
    }

    // Insert into saved_startups (upsert to handle duplicates)
    const { error: dbError } = await supabase
      .from("saved_startups")
      .upsert(
        {
          user_id: user.id,
          startup_id,
        },
        {
          onConflict: "user_id,startup_id",
          ignoreDuplicates: true,
        }
      );

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save startup" },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Save startup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

