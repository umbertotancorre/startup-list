import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StartupRecord } from "@/lib/types";
import { getInitials } from "@/lib/utils";

type UserProfileData = {
  firstName: string;
  avatarUrl: string | undefined;
  avatarFallback: string;
};

async function getUserProfileData(): Promise<UserProfileData> {
  noStore();

  const supabase = await createServerSupabaseClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      firstName: "Profile",
      avatarUrl: undefined,
      avatarFallback: "P",
    };
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
  const firstName =
    fullName.trim().split(" ").filter(Boolean)[0] ?? "Profile";

  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    user.user_metadata?.picture;

  const avatarFallback = firstName.slice(0, 1).toUpperCase() || "P";

  return {
    firstName,
    avatarUrl,
    avatarFallback,
  };
}

async function getSavedStartups(): Promise<StartupRecord[]> {
  noStore();

  const supabase = await createServerSupabaseClient();
  
  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  // Get saved startups for the user, ordered by most recent first
  const { data, error } = await supabase
    .from("saved_startups")
    .select(`
      startup_id,
      startups (
        id, slug, name, logo
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch saved startups:", error);
    return [];
  }

  // Extract startups from the join result
  const startups = (data ?? [])
    .map((item: any) => item.startups)
    .filter((startup: any) => startup !== null);

  return startups;
}

export default async function ProfilePage() {
  const { firstName, avatarUrl, avatarFallback } = await getUserProfileData();
  const savedStartups = await getSavedStartups();

  return (
    <main className="mx-auto w-full max-w-[920px] px-6 pb-24 pt-24">
      <div className="mb-8 flex flex-col gap-6">
        <Avatar className="h-[86px] w-[86px] rounded-full">
          <AvatarImage src={avatarUrl} alt={firstName} />
          <AvatarFallback className="text-2xl font-semibold uppercase text-zinc-600 bg-zinc-100 rounded-full">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-[44px] font-semibold tracking-[-0.9px] text-foreground leading-[1.1]">
          {firstName}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Link href="/saved">
          <div className="flex flex-col justify-between w-[280px] h-[244px] bg-(--color-card-background-default) p-8 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity">
            <div className="flex items-center justify-between w-full">
              <span className="text-2xl font-medium text-(--color-card-text)">
                Saved
              </span>
              <span className="text-2xl font-medium text-(--color-card-text)">
                {savedStartups.length}
              </span>
            </div>
            {savedStartups.length > 0 && (
              <div className="flex gap-2">
                {savedStartups.slice(0, 5).map((startup) => (
                  <div
                    key={startup.id}
                    className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold uppercase text-zinc-600 overflow-hidden shrink-0"
                  >
                    {startup.logo ? (
                      <>
                        <Image
                          src={startup.logo}
                          alt={`${startup.name} logo`}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)' }} />
                      </>
                    ) : (
                      getInitials(startup.name)
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Link>
      </div>
    </main>
  );
}

