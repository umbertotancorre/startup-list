export type StartupRecord = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo: string | null;
  website_url: string | null;
  linkedin_url: string;
  city: string | null;
  country: string | null;
  team_size: string | null;
  year_founded: number | null;
  funding_stage: string | null;
  sectors: string[] | null;
  business_model: string[] | null;
  created_at: string;
};

