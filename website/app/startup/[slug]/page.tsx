import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StartupRecord } from "@/lib/types";
import { getInitials } from "@/lib/utils";

async function getStartup(slug: string): Promise<StartupRecord | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("startups")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Failed to fetch startup:", error);
    return null;
  }

  return data;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const startup = await getStartup(slug);

  if (!startup) {
    return {
      title: "Startup Not Found",
    };
  }

  return {
    title: `${startup.name} - Startup List EU`,
    description: startup.tagline || startup.description || `Details about ${startup.name}`,
  };
}

export default async function StartupPage({ params }: Props) {
  const { slug } = await params;
  const startup = await getStartup(slug);

  if (!startup) {
    notFound();
  }

  const displayCountry = startup.country === "United Kingdom" ? "UK" : startup.country;
  const location = [startup.city, displayCountry].filter(Boolean).join(", ");

  return (
    <main className="mx-auto w-full max-w-[920px] px-6 pb-24 pt-20">
      <div className="flex flex-col items-start gap-6">
        <div className="relative flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-[18px] bg-zinc-100 text-2xl font-semibold uppercase text-zinc-600 overflow-hidden">
          {startup.logo ? (
            <>
              <Image
                src={startup.logo}
                alt={`${startup.name} logo`}
                width={86}
                height={86}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 rounded-[18px]" style={{ boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)' }} />
            </>
          ) : (
            getInitials(startup.name)
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[44px] font-semibold leading-[1.1] tracking-[-0.9px] text-foreground">
            {startup.name}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="flex flex-col justify-between w-[280px] h-[244px] bg-(--color-card-background-default) p-8 rounded-2xl">
          <span className="text-base text-(--color-card-text)">Location</span>
          <span className="text-2xl font-medium text-(--color-card-text)">
            {location || "Unknown"}
          </span>
        </div>
        <div className="flex flex-col justify-between w-[280px] h-[244px] bg-(--color-card-background-default) p-8 rounded-2xl">
          <span className="text-base text-(--color-card-text)">Team size</span>
          <span className="text-2xl font-medium text-(--color-card-text)">
            {startup.team_size || "Unknown"}
          </span>
        </div>
        <div className="flex flex-col justify-between w-[280px] h-[244px] bg-(--color-card-background-default) p-8 rounded-2xl">
          <span className="text-base text-(--color-card-text)">Founded</span>
          <span className="text-2xl font-medium text-(--color-card-text)">
            {startup.year_founded || "Unknown"}
          </span>
        </div>
        <div className="flex flex-col justify-between w-[280px] h-[244px] bg-(--color-card-background-default) p-8 rounded-2xl">
          <span className="text-base text-(--color-card-text)">Stage</span>
          <span className="text-2xl font-medium text-(--color-card-text)">
            {startup.funding_stage || "Unknown"}
          </span>
        </div>

        {startup.sectors && startup.sectors.length > 0 && (
          <div className="flex flex-col justify-between w-[280px] h-[244px] bg-(--color-card-background-default) p-8 rounded-2xl">
            <span className="text-base text-(--color-card-text)">Sectors</span>
            <span className="text-2xl font-medium text-(--color-card-text)">
              {startup.sectors.join(", ")}
            </span>
          </div>
        )}

        {startup.business_model && startup.business_model.length > 0 && (
          <div className="flex flex-col justify-between w-[280px] h-[244px] bg-(--color-card-background-default) p-8 rounded-2xl">
            <span className="text-base text-(--color-card-text)">Business model</span>
            <span className="text-2xl font-medium text-(--color-card-text)">
              {startup.business_model.join(", ")}
            </span>
          </div>
        )}
      </div>
    </main>
  );
}

