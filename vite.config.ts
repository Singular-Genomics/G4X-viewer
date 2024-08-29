import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["it-tar", "it-pipe"],
  },
  define: {
    "process.env.APP_VERSION": JSON.stringify(pkg.version),
  },
});
