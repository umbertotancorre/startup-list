import { unstable_noStore as noStore } from "next/cache";

import { StartupCard } from "@/components/startup-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StartupRecord } from "@/lib/types";

type StartupsPayload = {
  startups: StartupRecord[];
  error: string | null;
};

async function getStartups(): Promise<StartupsPayload> {
  noStore();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("startups")
    .select(
      "id, slug, name, tagline, description, logo, website_url, linkedin_url, city, country, team_size, year_founded, funding_stage, sectors, business_model, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    console.error("Failed to fetch startups:", error);
    return {
      startups: [],
      error: "We couldn't load startups right now. Please try again in a moment.",
    };
  }

  return { startups: data ?? [], error: null };
}

export default async function Home() {
  const { startups, error } = await getStartups();

  return (
    <main className="mx-auto w-full max-w-[920px] px-6 pb-24 pt-24">
      <section className="mt-12">
        {error ? (
          <ErrorState message={error} />
        ) : startups.length === 0 ? (
          <EmptyState />
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-zinc-300 px-8 py-16 text-center">
      <p className="text-lg font-semibold text-zinc-900">
        No startups have been added yet.
      </p>
      <p className="text-sm text-zinc-500">
        Use the browser extension to capture your first company and it will appear here instantly.
      </p>
    </div>
  );
}

