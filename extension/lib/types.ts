export interface LinkedInData {
  name: string;
  tagline: string;
  description: string;
  website_url: string;
  linkedin_url: string;
  city: string;
  country: string;
  team_size: string;
}

export interface Startup {
  id: string;
  name: string;
  tagline: string | null;
  website_url: string | null;
  linkedin_url: string;
  country: string | null;
  city: string | null;
  team_size: string | null;
  is_saved?: boolean;
}

export interface LookupResponse {
  exists: boolean;
  startup?: Startup;
}

export interface CreateStartupResponse {
  startup: Startup;
}

export interface SaveStartupResponse {
  status: string;
}

export interface ErrorResponse {
  error: string;
}

