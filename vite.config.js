// vite.config.js
import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Base URL — use "/" for local dev, change to "/your-subfolder/" if deploying to a subdirectory
  base: "/",

  server: {
    port: 3000,
    open: true,   // auto-opens browser on `npm run dev`
  },

  build: {
    outDir:   "dist",
    sourcemap: true,
  },
});
