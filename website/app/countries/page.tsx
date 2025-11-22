import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type CountryData = {
  country: string;
  count: number;
};

type CountriesPayload = {
  countries: CountryData[];
  error: string | null;
};

async function getCountries(): Promise<CountriesPayload> {
  noStore();

  const supabase = await createServerSupabaseClient();
  
  // Get all startups with countries
  const { data, error } = await supabase
    .from("startups")
    .select("country")
    .not("country", "is", null);

  if (error) {
    console.error("Failed to fetch countries:", error);
    return {
      countries: [],
      error: "We couldn't load countries right now. Please try again in a moment.",
    };
  }

  // Count startups per country
  const countryMap = new Map<string, number>();
  (data ?? []).forEach((startup) => {
    if (startup.country) {
      const count = countryMap.get(startup.country) || 0;
      countryMap.set(startup.country, count + 1);
    }
  });

  // Convert to array and sort by count (descending)
  const countries: CountryData[] = Array.from(countryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  return { countries, error: null };
}

export default async function CountriesPage() {
  const { countries, error } = await getCountries();

  return (
    <main className="mx-auto w-full max-w-[920px] px-6 pb-24 pt-24">
      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="text-[44px] font-semibold tracking-[-0.9px] text-foreground leading-[1.1]">
          Countries
        </h1>
      </div>

      <section>
        {error ? (
          <ErrorState message={error} />
        ) : countries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {countries.map((countryData) => {
              const displayCountry = countryData.country === "United Kingdom" ? "UK" : countryData.country;
              const countrySlug = encodeURIComponent(displayCountry);
              return (
                <Link
                  key={countryData.country}
                  href={`/countries/${countrySlug}`}
                  className="flex flex-col justify-between w-[280px] h-[244px] bg-(--color-card-background-default) p-8 rounded-2xl"
                >
                  <span className="text-2xl font-medium text-(--color-card-text)">
                    {displayCountry}
                  </span>
                  <span className="text-base text-(--color-card-text) mt-4">
                    {countryData.count} {countryData.count === 1 ? "startup" : "startups"}
                  </span>
                </Link>
              );
            })}
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-zinc-300 px-8 py-16 text-center">
      <p className="text-lg font-semibold text-foreground">
        No countries found.
      </p>
      <p className="text-sm text-zinc-500">
        Countries will appear here once startups are added to the database.
      </p>
    </div>
  );
}

