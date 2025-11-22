import React from "react";
import ReactDOM from "react-dom/client";
import Popup from "./Popup";
import "./styles.css";

// Wait for the DOM to be ready and for our root element to exist
function mountApp() {
  const rootElement = document.getElementById("sl-extension-root");
  
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <Popup />
      </React.StrictMode>
    );
    console.log("Startup List React app mounted");
  } else {
    console.error("Could not find sl-extension-root element");
  }
}

// Listen for the popup opened event
window.addEventListener("sl-popup-opened", () => {
  // Small delay to ensure root div is ready
  setTimeout(mountApp, 10);
});

// Also try to mount immediately if root exists
if (document.getElementById("sl-extension-root")) {
  mountApp();
}

