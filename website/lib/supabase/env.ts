const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseEnv() {
  if (!SUPABASE_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to your environment variables.",
    );
  }

  if (!SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to your environment variables.",
    );
  }

  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}

