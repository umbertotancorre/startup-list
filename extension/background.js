// Background script for Startup List extension
// Handles extension icon clicks and sends message to content script

chrome.runtime.onInstalled.addListener(() => {
  console.log("Startup List extension installed");
});

// When user clicks extension icon, toggle the popup in the active tab
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_POPUP" });
    } catch (error) {
      console.error("Failed to send message to tab:", error);
    }
  }
});

// Handle API requests from content script to avoid Mixed Content issues
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PROXY_API_REQUEST") {
    const { endpoint, method, body } = message;

    console.log("[Background] Proxying request to:", endpoint);

    const options = {
      method: method || "GET",
      credentials: "include", // Send cookies!
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    fetch(endpoint, options)
      .then(async (response) => {
        let data = null;

        try {
          data = await response.json();
        } catch (err) {
          console.warn("[Background] Failed to parse JSON:", err);
        }

        console.log("[Background] Request completed:", {
          status: response.status,
          ok: response.ok,
        });

        sendResponse({
          success: response.ok,
          status: response.status,
          data,
          error: !response.ok
            ? data?.error || response.statusText || "Request failed"
            : undefined,
        });
      })
      .catch((error) => {
        console.error("[Background] Request failed:", error);
        sendResponse({
          success: false,
          status: 0,
          error: error.message || "Network error",
        });
      });

    return true; // Keep channel open for async response
  }
});

