/**
 * LinkedIn company page scraper
 * Extracts startup data from the DOM
 */

import { getCountryForCity } from "./cityCountryMap";

export function scrapeLinkedInCompanyPage() {
  const data = {
    linkedin_url: window.location.href.split("?")[0].replace(/\/+$/, ""),
  };

  try {
    // Extract company name
    const nameElement =
      document.querySelector("h1.org-top-card-summary__title") ||
      document.querySelector("h1.top-card-layout__title");
    if (nameElement) {
      data.name = nameElement.textContent?.trim() || "";
    }

    // Extract tagline/headline
    const taglineElement =
      document.querySelector(".org-top-card-summary__tagline") ||
      document.querySelector(".top-card-layout__headline");
    if (taglineElement) {
      data.tagline = taglineElement.textContent?.trim() || "";
    }

    // Extract description from the about section
    const descriptionElement = document.querySelector(
      ".break-words.white-space-pre-wrap.t-black--light"
    );
    if (descriptionElement) {
      data.description = descriptionElement.textContent?.trim() || "";
    }

    // Alternative description selector
    if (!data.description) {
      const altDescElement = document.querySelector(
        '[data-test-id="about-us__description"]'
      );
      if (altDescElement) {
        data.description = altDescElement.textContent?.trim() || "";
      }
    }

    // Extract website URL
    // Strategy 1: Look for primary action button with external link
    const primaryActions = Array.from(document.querySelectorAll(".org-top-card-primary-actions__action"));
    for (const action of primaryActions) {
      const link = action.getAttribute("href");
      if (link && !link.includes("linkedin.com") && link.startsWith("http")) {
        data.website_url = link;
        break;
      }
    }

    // Strategy 2: Look for "Website" link in the top card (often hidden in 'Contact info' modal or just below title)
    if (!data.website_url) {
        const topCardLinks = Array.from(document.querySelectorAll(".org-top-card-primary-actions__action, .org-top-card-summary__info-item a"));
        for (const link of topCardLinks) {
            const href = link.getAttribute("href");
            const text = link.textContent?.trim().toLowerCase() || "";
            if (href && href.startsWith("http") && !href.includes("linkedin.com") && (text.includes("website") || text.includes("visit") || text.includes("site"))) {
                 data.website_url = href;
                 break;
            }
        }
    }

    // Strategy 3: Look in the "About" or "Overview" section (dl/dt/dd structure)
    if (!data.website_url) {
      const definitions = Array.from(document.querySelectorAll("dl dt"));
      for (const dt of definitions) {
        if (dt.textContent?.toLowerCase().includes("website") || dt.textContent?.toLowerCase().includes("site web")) {
            const dd = dt.nextElementSibling;
            const link = dd?.querySelector("a");
            if (link) {
                const href = link.getAttribute("href");
                if (href) data.website_url = href;
            }
            break;
        }
      }
    }
    
    // Strategy 4: Generic search for external links with "website" text if specific structures fail
    if (!data.website_url) {
        const allLinks = Array.from(document.querySelectorAll('a[href^="http"]'));
        for (const link of allLinks) {
            const href = link.getAttribute("href");
            const text = link.textContent?.trim().toLowerCase() || "";
             if (
                href &&
                !href.includes("linkedin.com") &&
                !href.includes("facebook.com") &&
                !href.includes("twitter.com") &&
                !href.includes("instagram.com") &&
                !href.includes("google.com") && // Map links
                (text.includes("website") || text.includes("site web") || text === "visit website")
            ) {
                data.website_url = href;
                break;
            }
        }
    }


    // Extract location (city and country)
    // Strategy 1: Top card summary info list (often: "Technology, Information and Internet · City, State" or just "City")
    let locationText = "";
    const topCardInfoItems = Array.from(document.querySelectorAll(".org-top-card-summary-info-list__info-item"));
    
    // We iterate through all items to find the best location candidate
    for (const item of topCardInfoItems) {
        const text = item.textContent?.trim() || "";
        
        if (!text) continue;

        // Skip employee counts (e.g., "11-50 employees")
        if (/\d/.test(text) && (text.includes("employees") || text.includes("associés") || text.includes("employés"))) {
            continue;
        }
        
        // Skip follower counts (e.g., "1,234 followers")
        if (/\d/.test(text) && (text.includes("followers") || text.includes("abonnés"))) {
            continue;
        }

        // Skip likely industry if it contains common industry separators but no location indicators
        // But if it has a comma, it's a strong candidate for "City, Country"
        
        if (text.includes(",")) {
             locationText = text;
             break; // Comma usually means we found "City, Country", which is the best case
        } else {
             // If no comma, it might be a single word city/country (e.g. "Tallinn", "Estonia")
             // or it might be an industry (e.g. "Software Development")
             // We'll store it as a fallback candidate if we haven't found anything yet.
             // Usually location is the last text item in this list.
             locationText = text;
        }
    }
    
    // Strategy 2: "Headquarters" in About section (Primary source if available, overrides heuristic)
    const definitions = Array.from(document.querySelectorAll("dl dt"));
    for (const dt of definitions) {
       if (dt.textContent?.toLowerCase().includes("headquarters") || dt.textContent?.toLowerCase().includes("siège social")) {
           const dd = dt.nextElementSibling;
           if (dd) {
               const hq = dd.textContent?.trim();
               if (hq) locationText = hq; // Override with explicit HQ
           }
           break;
       }
    }

    if (locationText) {
      const parts = locationText.split(",").map((s) => s.trim());
      if (parts.length >= 2) {
        data.city = parts[0];
        data.country = parts[parts.length - 1]; 
      } else if (parts.length === 1) {
        data.city = parts[0];
      }

      if (data.city && !data.country) {
        const inferred = getCountryForCity(data.city);
        if (inferred) {
          data.country = inferred;
        }
      }
    }

    // Extract team size / employee count
    const employeeElements = Array.from(
      document.querySelectorAll(
        ".org-top-card-summary-info-list__info-item, .org-page-details__definition-text"
      )
    );

    for (const element of employeeElements) {
      const text = element.textContent?.trim() || "";
      const employeeMatch = text.match(
        /(\d+[-–]\d+|\d+\+?)\s*(employees?|associés?)/i
      );
      if (employeeMatch) {
        data.team_size = employeeMatch[1];
        break;
      }
    }

    // Alternative: check if "Company size" label exists
    const labels = Array.from(document.querySelectorAll("dt"));
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      if (
        label.textContent?.includes("Company size") ||
        label.textContent?.includes("Taille de l'entreprise")
      ) {
        const valueElement = label.nextElementSibling;
        if (valueElement) {
          const sizeText = valueElement.textContent?.trim() || "";
          const match = sizeText.match(/(\d+[-–]\d+|\d+\+?)/);
          if (match) {
            data.team_size = match[1];
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error("Error parsing LinkedIn page:", error);
  }

  return data;
}

