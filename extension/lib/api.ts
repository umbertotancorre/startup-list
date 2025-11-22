import { API_BASE_URL } from "./config";
import type {
  LookupResponse,
  CreateStartupResponse,
  SaveStartupResponse,
  ErrorResponse,
  LinkedInData,
} from "./types";

// Helper to make API requests via content script proxy
async function proxyFetch(url: string, options?: RequestInit): Promise<Response> {
  console.log("[API] Making proxied request to:", url);

  return new Promise((resolve, reject) => {
    const requestId = `api-${Date.now()}-${Math.random()}`;
    const timeout = setTimeout(() => {
      reject(new Error("API request timeout"));
    }, 30000);

    const messageHandler = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (
        event.data.type === "API_RESPONSE" &&
        event.data.requestId === requestId
      ) {
        console.log("[API] Received response:", event.data);
        clearTimeout(timeout);
        window.removeEventListener("message", messageHandler);

        const {
          success,
          status,
          data,
          error: responseError,
        } = event.data;

        resolve({
          ok: !!success,
          status:
            typeof status === "number"
              ? status
              : success
              ? 200
              : 500,
          json: async () => {
            if (data !== undefined) {
              return data;
            }
            return {
              error: responseError || "API request failed",
            };
          },
        } as Response);
      }
    };

    window.addEventListener("message", messageHandler);

    const body = options?.body ? JSON.parse(options.body as string) : undefined;
    
    console.log("[API] Sending API_REQUEST message:", {
      requestId,
      endpoint: url,
      method: options?.method || "GET",
      body,
    });

    window.postMessage(
      {
        type: "API_REQUEST",
        requestId,
        endpoint: url,
        method: options?.method || "GET",
        body,
      },
      "*"
    );
  });
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T | ErrorResponse> {
    try {
      console.log("[API] Fetching:", endpoint);
      
      const fullUrl = `${this.baseUrl}${endpoint}`;
      
      // Always use proxy fetch in injected context
      const response = await proxyFetch(fullUrl, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      const data = await response.json();

      console.log("[API] Response data:", data);

      if (!response.ok) {
        const errorMessage =
          data && typeof data === "object" && "error" in data
            ? (data as ErrorResponse).error
            : undefined;

        return { error: errorMessage || "An error occurred" } as ErrorResponse;
      }

      return data as T;
    } catch (error) {
      console.error("[API] Error:", error);
      return { error: "Network error. Please try again." } as ErrorResponse;
    }
  }

  async lookupStartup(
    linkedinUrl: string
  ): Promise<LookupResponse | ErrorResponse> {
    const encodedUrl = encodeURIComponent(linkedinUrl);
    return this.fetch<LookupResponse>(
      `/api/extension/startups/lookup?linkedin_url=${encodedUrl}`,
      {
        method: "GET",
      }
    );
  }

  async createStartup(
    data: Partial<LinkedInData>
  ): Promise<CreateStartupResponse | ErrorResponse> {
    return this.fetch<CreateStartupResponse>("/api/extension/startups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async saveStartup(
    startupId: string
  ): Promise<SaveStartupResponse | ErrorResponse> {
    return this.fetch<SaveStartupResponse>("/api/extension/saved-startups", {
      method: "POST",
      body: JSON.stringify({ startup_id: startupId }),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

