/**
 * API Proxy - Routes API calls through content script to handle cookies properly
 */

let requestCounter = 0;

export async function proxyFetch(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const requestId = `api-${++requestCounter}-${Date.now()}`;
    const timeout = setTimeout(() => {
      reject(new Error("API request timeout"));
    }, 30000);

    const messageHandler = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (
        event.data.type === "API_RESPONSE" &&
        event.data.requestId === requestId
      ) {
        clearTimeout(timeout);
        window.removeEventListener("message", messageHandler);

        const {
          success,
          status,
          data,
          error: responseError,
        } = event.data;

        // Create a fake Response object
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
            return { error: responseError || "API request failed" };
          },
        } as Response);
      }
    };

    window.addEventListener("message", messageHandler);

    // Send request to content script
    window.postMessage(
      {
        type: "API_REQUEST",
        requestId,
        endpoint,
        method: options?.method || "GET",
        body: options?.body ? JSON.parse(options.body as string) : undefined,
      },
      "*"
    );
  });
}

