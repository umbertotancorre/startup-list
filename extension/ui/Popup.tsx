import React, { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { STARTUP_LIST_URL } from "../lib/config";
import type { LinkedInData, Startup } from "../lib/types";
import { initializeDrag } from "./drag";

type ViewState = "loading" | "not-linkedin" | "error" | "exists" | "create";

const Popup: React.FC = () => {
  const [state, setState] = useState<ViewState>("loading");
  const [error, setError] = useState<string>("");
  const [startup, setStartup] = useState<Startup | null>(null);
  const [formData, setFormData] = useState<Partial<LinkedInData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStartupData();
    
    // Initialize drag functionality
    if (headerRef.current) {
      const cleanup = initializeDrag(headerRef.current);
      return cleanup;
    }
  }, []);

  const loadStartupData = async () => {
    try {
      setState("loading");
      setError("");

      console.log("[Popup] Starting to load startup data...");

      // Check if on LinkedIn company page
      if (!window.location.href.includes("linkedin.com/company/")) {
        console.log("[Popup] Not on LinkedIn company page");
        setState("not-linkedin");
        return;
      }

      console.log("[Popup] Requesting LinkedIn data from content script...");

      // Request LinkedIn data from content script via postMessage
      const response = await new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout waiting for LinkedIn data"));
        }, 5000);

        const messageHandler = (event: MessageEvent) => {
          if (event.source !== window) return;
          if (event.data.type === "LINKEDIN_DATA_RESPONSE") {
            console.log("[Popup] Received LinkedIn data:", event.data);
            clearTimeout(timeout);
            window.removeEventListener("message", messageHandler);
            resolve(event.data);
          }
        };

        window.addEventListener("message", messageHandler);
        window.postMessage({ type: "GET_LINKEDIN_DATA" }, "*");
      });

      if (!response.success) {
        setError(response.error || "Failed to extract LinkedIn data");
        setState("error");
        return;
      }

      const data = response.data as Partial<LinkedInData>;
      setFormData(data);

      console.log("[Popup] LinkedIn data extracted:", data);
      console.log("[Popup] Calling API to lookup startup...");

      // Lookup startup in database
      if (data.linkedin_url) {
        const result = await api.lookupStartup(data.linkedin_url);

        console.log("[Popup] API lookup result:", result);

        if ("error" in result) {
          console.error("[Popup] API error:", result.error);
          setError(result.error);
          setState("error");
          return;
        }

        if (result.exists && result.startup) {
          setStartup(result.startup);
          setIsSaved(result.startup.is_saved || false);
          setState("exists");
        } else {
          setState("create");
        }
      }
    } catch (err) {
      console.error("[Popup] Error loading startup data:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setState("error");
    }
  };

  const handleSaveStartup = async () => {
    if (!startup) return;

    setIsSubmitting(true);
    try {
      const result = await api.saveStartup(startup.id);

      if ("error" in result) {
        setError(result.error);
      } else {
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error saving startup:", err);
      setError("Failed to save startup");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateStartup = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const result = await api.createStartup(formData);

      if ("error" in result) {
        setError(result.error);
      } else {
        setStartup(result.startup);
        setState("exists");
      }
    } catch (err) {
      console.error("Error creating startup:", err);
      setError("Failed to create startup");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStartupPage = () => {
    if (startup?.id) {
      window.open(`${STARTUP_LIST_URL}/startup/${startup.id}`, "_blank");
    }
  };

  const openStartupList = () => {
    window.open(STARTUP_LIST_URL, "_blank");
  };

  return (
    <div className="popup-container">
      <div className="header" ref={headerRef}>
        <svg
          className="logo"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" rx="4" fill="#3B82F6" />
          <path
            d="M7 12L10 15L17 8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1 className="header-title">Startup List</h1>
        <button
          onClick={() => {
            const root = document.getElementById("sl-extension-root");
            if (root) root.style.display = "none";
          }}
          className="close-button"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="popup-body">
        <div className="popup-content">
          {state === "loading" && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Loading startup data...</p>
            </div>
          )}

          {state === "not-linkedin" && (
            <div className="not-linkedin-container">
              <p className="not-linkedin-text">
                This extension only works on LinkedIn company pages.
              </p>
              <p className="not-linkedin-text" style={{ marginTop: "12px" }}>
                Navigate to a LinkedIn company page to get started.
              </p>
              <button onClick={openStartupList} className="button button-primary" style={{ marginTop: "16px" }}>
                Open Startup List
              </button>
            </div>
          )}

          {state === "error" && (
            <div className="error-container">
              <p className="error-text">{error}</p>
              <button onClick={loadStartupData} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {state === "exists" && startup && (
            <div>
              {isSaved && (
                <div className="success-message">
                  <div className="success-title">✓ Saved!</div>
                  <div className="success-text">
                    This startup has been added to your list
                  </div>
                </div>
              )}

              <div className="startup-info">
                <h2 className="startup-name">{startup.name}</h2>
                {startup.tagline && (
                  <p className="startup-tagline">{startup.tagline}</p>
                )}
              </div>

              <div className="actions">
                {!isSaved ? (
                  <button
                    onClick={handleSaveStartup}
                    disabled={isSubmitting}
                    className="button button-primary"
                  >
                    {isSubmitting ? "Saving..." : "📌 Save to My List"}
                  </button>
                ) : (
                  <button disabled className="button button-success">
                    ✓ Saved
                  </button>
                )}
                <button onClick={openStartupPage} className="button button-secondary">
                  Open on Startup List
                </button>
              </div>
            </div>
          )}

          {state === "create" && (
            <div className="readonly-section">
              <p className="readonly-intro">
                This startup is not in our database yet. Add it now:
              </p>
              <div className="readonly-scroll">
                <div className="readonly-list">
                  <div className="readonly-field">
                    <span className="readonly-label">Name</span>
                    <span className="readonly-value">{formData.name || "—"}</span>
                  </div>
                  <div className="readonly-field">
                    <span className="readonly-label">Tagline</span>
                    <span className="readonly-value">{formData.tagline || "—"}</span>
                  </div>
                  <div className="readonly-field">
                    <span className="readonly-label">Description</span>
                    <span className="readonly-value">{formData.description || "—"}</span>
                  </div>
                  <div className="readonly-field">
                    <span className="readonly-label">Website</span>
                    <span className="readonly-value">{formData.website_url || "—"}</span>
                  </div>
                  <div className="readonly-field">
                    <span className="readonly-label">City</span>
                    <span className="readonly-value">{formData.city || "—"}</span>
                  </div>
                  <div className="readonly-field">
                    <span className="readonly-label">Country</span>
                    <span className="readonly-value">{formData.country || "—"}</span>
                  </div>
                  <div className="readonly-field">
                    <span className="readonly-label">Team Size</span>
                    <span className="readonly-value">{formData.team_size || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {state === "create" && (
        <div className="footer-header">
          <button
            onClick={handleCreateStartup}
            disabled={isSubmitting}
            className="button button-primary footer-action"
          >
            {isSubmitting ? "Adding..." : "Add to Startup List"}
          </button>
          {error && <p className="error-text footer-error">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Popup;

