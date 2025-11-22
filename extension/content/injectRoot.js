/**
 * Content script that injects the draggable popup UI into LinkedIn pages
 */

import { scrapeLinkedInCompanyPage } from "./linkedinScraper.js";

let isPopupVisible = false;
let rootDiv = null;
let uiScriptLoaded = false;

// Create and inject the root div for our React app
function createRootDiv() {
  if (rootDiv) return rootDiv;

  rootDiv = document.createElement("div");
  rootDiv.id = "sl-extension-root";
  
  // Get saved position from localStorage or use defaults
  const savedPosition = getSavedPosition();
  
  rootDiv.style.cssText = `
    position: fixed;
    right: ${savedPosition.right}px;
    top: ${savedPosition.top}px;
    z-index: 2147483647;
    display: none;
    width: 400px;
    max-height: 600px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  `;

  document.body.appendChild(rootDiv);
  return rootDiv;
}

// Load the React UI bundle
function loadUIScript() {
  if (uiScriptLoaded) return;

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("ui/index.js");
  script.type = "module";
  script.onload = () => {
    console.log("Startup List UI loaded");
    uiScriptLoaded = true;
  };
  script.onerror = (error) => {
    console.error("Failed to load Startup List UI:", error);
  };
  document.body.appendChild(script);

  // Also load the CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("ui/index.css");
  document.head.appendChild(link);
}

// Toggle popup visibility
function togglePopup() {
  if (!rootDiv) {
    createRootDiv();
    loadUIScript();
  }

  isPopupVisible = !isPopupVisible;
  rootDiv.style.display = isPopupVisible ? "block" : "none";

  // Trigger event for React app to know it's visible
  if (isPopupVisible) {
    window.dispatchEvent(new CustomEvent("sl-popup-opened"));
  }
}

// Get saved position from localStorage
function getSavedPosition() {
  try {
    const saved = localStorage.getItem("sl-popup-position");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to get saved position:", error);
  }
  return { right: 40, top: 120 };
}

// Save position to localStorage
export function savePosition(right, top) {
  try {
    localStorage.setItem("sl-popup-position", JSON.stringify({ right, top }));
  } catch (error) {
    console.error("Failed to save position:", error);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_POPUP") {
    togglePopup();
    sendResponse({ success: true });
    return true;
  }

  return true;
});

// Listen for messages from the injected React app (via window.postMessage)
window.addEventListener("message", async (event) => {
  // Only accept messages from the same origin
  if (event.source !== window) return;

  const message = event.data;

  // Handle LinkedIn data scraping
  if (message.type === "GET_LINKEDIN_DATA") {
    try {
      if (!window.location.href.includes("linkedin.com/company/")) {
        window.postMessage(
          {
            type: "LINKEDIN_DATA_RESPONSE",
            success: false,
            error: "Not a LinkedIn company page",
          },
          "*"
        );
        return;
      }

      const data = scrapeLinkedInCompanyPage();
      window.postMessage(
        {
          type: "LINKEDIN_DATA_RESPONSE",
          success: true,
          data,
        },
        "*"
      );
    } catch (error) {
      console.error("Content script error:", error);
      window.postMessage(
        {
          type: "LINKEDIN_DATA_RESPONSE",
          success: false,
          error: "Failed to parse LinkedIn page",
        },
        "*"
      );
    }
  }

  // Handle API requests (proxy through background script to avoid Mixed Content issues)
  if (message.type === "API_REQUEST") {
    console.log("[Content Script] Received API_REQUEST:", message);
    
    try {
      const { endpoint, method, body, requestId } = message;
      
      // Forward to background script
      chrome.runtime.sendMessage(
        {
          type: "PROXY_API_REQUEST",
          endpoint,
          method,
          body
        },
        (response) => {
          // Handle response from background script
          if (chrome.runtime.lastError) {
            console.error("[Content Script] Background error:", chrome.runtime.lastError);
            window.postMessage(
              {
                type: "API_RESPONSE",
                requestId,
                success: false,
                error: chrome.runtime.lastError.message,
              },
              "*"
            );
            return;
          }

          console.log("[Content Script] Background response:", response);

          window.postMessage(
            {
              type: "API_RESPONSE",
              requestId,
              success: response?.success || false,
              status: response?.status,
              data: response?.data,
              error: response?.error,
            },
            "*"
          );
        }
      );
    } catch (error) {
      console.error("[Content Script] API request error:", error);
      window.postMessage(
        {
          type: "API_RESPONSE",
          requestId: message.requestId,
          success: false,
          error: error.message || "Network error",
        },
        "*"
      );
    }
  }
});

// Signal that content script is loaded
console.log("Startup List extension: Content script loaded");

