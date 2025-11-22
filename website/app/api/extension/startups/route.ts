import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { generateSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const {
      name,
      tagline,
      description,
      logo,
      website_url,
      linkedin_url,
      city,
      country,
      team_size,
      year_founded,
      funding_stage,
      sectors,
      business_model,
    } = body;

    // Validate required fields
    if (!name || !linkedin_url) {
      return NextResponse.json(
        { error: "name and linkedin_url are required" },
        { status: 400 }
      );
    }

    // Normalize LinkedIn URL
    const normalizedLinkedinUrl = linkedin_url.split("?")[0].replace(/\/+$/, "");

    const normalizedYearFounded =
      typeof year_founded === "number" && Number.isFinite(year_founded)
        ? year_founded
        : typeof year_founded === "string" && year_founded.trim()
        ? Number.parseInt(year_founded.trim(), 10) || null
        : null;

    const sanitizeArrayField = (value: unknown): string[] | null => {
      if (!Array.isArray(value)) {
        return null;
      }

      const cleaned = value
        .map((item) => {
          if (typeof item === "string") {
            return item.trim();
          }
          if (typeof item === "number") {
            return `${item}`;
          }
          return "";
        })
        .filter((item) => item.length > 0);

      return cleaned.length > 0 ? cleaned : null;
    };

    const sanitizedSectors = sanitizeArrayField(sectors);
    const sanitizedBusinessModels = sanitizeArrayField(business_model);

    // Generate slug from name
    const slug = generateSlug(name);

    // Insert startup into database
    const { data: startup, error: dbError } = await adminSupabase
      .from("startups")
      .insert({
        name,
        slug,
        tagline: tagline || null,
        description: description || null,
        logo: typeof logo === "string" && logo.trim() ? logo.trim() : null,
        website_url: website_url || null,
        linkedin_url: normalizedLinkedinUrl,
        city: city || null,
        country: country || null,
        team_size: team_size || null,
        year_founded: normalizedYearFounded,
        funding_stage:
          typeof funding_stage === "string" ? funding_stage.trim() || null : null,
        sectors: sanitizedSectors,
        business_model: sanitizedBusinessModels,
      })
      .select("id, slug, name, tagline, website_url, linkedin_url, country, city, team_size")
      .single();

    if (dbError) {
      console.error("Database error:", dbError);

      // Check for duplicate LinkedIn URL
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "A startup with this LinkedIn URL already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error:
            dbError.message ||
            dbError.hint ||
            dbError.details ||
            "Failed to create startup",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ startup }, { status: 201 });
  } catch (error) {
    console.error("Create startup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

