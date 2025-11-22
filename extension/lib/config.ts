const PRODUCTION_URL = "https://startup-list.eu";
const DEVELOPMENT_URL = "http://localhost:3000";

const mode =
  typeof import.meta !== "undefined" && import.meta.env?.MODE
    ? import.meta.env.MODE
    : "production";

const resolveBaseUrl = (
  override?: string | undefined
): string => {
  if (override) {
    return override.replace(/\/$/, "");
  }

  return (mode === "development" ? DEVELOPMENT_URL : PRODUCTION_URL).replace(
    /\/$/,
    ""
  );
};

export const API_BASE_URL = resolveBaseUrl(
  typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE_URL : undefined
);

export const STARTUP_LIST_URL = resolveBaseUrl(
  typeof import.meta !== "undefined" ? import.meta.env?.VITE_APP_BASE_URL : undefined
);

