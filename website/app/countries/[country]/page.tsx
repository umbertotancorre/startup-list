import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import { StartupCard } from "@/components/startup-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StartupRecord } from "@/lib/types";

type Props = {
  params: Promise<{ country: string }>;
};

async function getStartupsByCountry(countryParam: string): Promise<{
  startups: StartupRecord[];
  countryName: string;
  error: string | null;
}> {
  noStore();

  // Decode URL-encoded country name
  const decodedCountry = decodeURIComponent(countryParam);
  
  // Handle "UK" <-> "United Kingdom" conversion for database query
  // Database stores "United Kingdom", but URLs use "UK" for display
  const dbCountry = decodedCountry === "UK" || decodedCountry === "United Kingdom" 
    ? "United Kingdom" 
    : decodedCountry;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("startups")
    .select(
      "id, slug, name, tagline, description, logo, website_url, linkedin_url, city, country, team_size, year_founded, funding_stage, sectors, business_model, created_at",
    )
    .eq("country", dbCountry)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch startups by country:", error);
    return {
      startups: [],
      countryName: decodedCountry,
      error: "We couldn't load startups for this country right now. Please try again in a moment.",
    };
  }

  return {
    startups: data ?? [],
    countryName: decodedCountry,
    error: null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const decodedCountry = decodeURIComponent(country);
  const displayCountry = decodedCountry === "United Kingdom" ? "UK" : decodedCountry;

  return {
    title: `${displayCountry} - Startup List EU`,
    description: `Discover startups from ${displayCountry}`,
  };
}

export default async function CountryPage({ params }: Props) {
  const { country } = await params;
  const { startups, countryName, error } = await getStartupsByCountry(country);

  // If no startups found and no error, show 404
  if (!error && startups.length === 0) {
    notFound();
  }

  const displayCountry = countryName === "United Kingdom" ? "UK" : countryName;

  return (
    <main className="mx-auto w-full max-w-[920px] px-6 pb-24 pt-24">
      <div className="mb-8 flex items-baseline gap-3">
        <Link
          href="/countries"
          className="text-[44px] font-semibold tracking-[-0.9px] text-muted-foreground leading-[1.1] hover:text-foreground transition-colors"
        >
          Countries:
        </Link>
        <h1 className="text-[44px] font-semibold tracking-[-0.9px] text-foreground leading-[1.1]">
          {displayCountry}
        </h1>
        {!error && (
          <span className="text-[44px] font-semibold tracking-[-0.9px] text-muted-foreground leading-[1.1]">
            {startups.length}
          </span>
        )}
      </div>

      <section>
        {error ? (
          <ErrorState message={error} />
        ) : startups.length === 0 ? (
          <EmptyState countryName={displayCountry} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {startups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-red-200 bg-red-50/60 px-8 py-16 text-center">
      <p className="text-lg font-semibold text-red-900">{message}</p>
      <p className="text-sm text-red-700">
        Double-check your connection and refresh the page to try again.
      </p>
    </div>
  );
}

function EmptyState({ countryName }: { countryName: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-zinc-300 px-8 py-16 text-center">
      <p className="text-lg font-semibold text-foreground">
        No startups found in {countryName}.
      </p>
      <p className="text-sm text-zinc-500">
        Use the browser extension to capture companies and they will appear here.
      </p>
    </div>
  );
}

