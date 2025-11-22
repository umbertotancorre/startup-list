import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import fs from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-extension-files",
      closeBundle() {
        // Copy manifest.json
        fs.copyFileSync("manifest.json", "dist/manifest.json");
        
        // Copy background.js
        fs.copyFileSync("background.js", "dist/background.js");
        
        // Copy content/uiStyles.css
        if (!fs.existsSync("dist/content")) {
          fs.mkdirSync("dist/content", { recursive: true });
        }
        fs.copyFileSync("content/uiStyles.css", "dist/content/uiStyles.css");
        
        // Copy icons directory
        if (!fs.existsSync("dist/icons")) {
          fs.mkdirSync("dist/icons", { recursive: true });
        }
        fs.readdirSync("icons").forEach((file) => {
          fs.copyFileSync(`icons/${file}`, `dist/icons/${file}`);
        });

        console.log("✓ Extension files copied");
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        ui: resolve(__dirname, "ui/index.tsx"),
        "content/injectRoot": resolve(__dirname, "content/injectRoot.js"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "ui") {
            return "ui/index.js";
          }
          if (chunkInfo.name === "content/injectRoot") {
            return "content/injectRoot.js";
          }
          return "[name].js";
        },
        chunkFileNames: "chunks/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "ui/index.css";
          }
          return "assets/[name].[ext]";
        },
      },
    },
  },
});
