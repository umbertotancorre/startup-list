import { unstable_noStore as noStore } from "next/cache";

import { StartupCard } from "@/components/startup-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StartupRecord } from "@/lib/types";

type SavedStartupsPayload = {
  startups: StartupRecord[];
  error: string | null;
};

async function getSavedStartups(): Promise<SavedStartupsPayload> {
  noStore();

  const supabase = await createServerSupabaseClient();
  
  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      startups: [],
      error: "You must be logged in to view saved startups.",
    };
  }

  // Get saved startups for the user
  const { data, error } = await supabase
    .from("saved_startups")
    .select(`
      startup_id,
      startups (
        id, slug, name, tagline, description, logo, website_url, linkedin_url, 
        city, country, team_size, year_founded, funding_stage, sectors, 
        business_model, created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch saved startups:", error);
    return {
      startups: [],
      error: "We couldn't load your saved startups right now. Please try again in a moment.",
    };
  }

  // Extract startups from the join result
  const startups = (data ?? [])
    .map((item: any) => item.startups)
    .filter((startup: any) => startup !== null);

  return { startups, error: null };
}

export default async function SavedPage() {
  const { startups, error } = await getSavedStartups();

  return (
    <main className="mx-auto w-full max-w-[920px] px-6 pb-24 pt-24">
      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="text-[44px] font-semibold tracking-[-0.9px] text-foreground leading-[1.1]">
          Saved
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
      <p className="text-lg font-semibold text-foreground">
        No saved startups yet.
      </p>
      <p className="text-sm text-zinc-500">
        Use the browser extension to save companies and they will appear here.
      </p>
    </div>
  );
}

