import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import postcssCustomProperties from "postcss-custom-properties";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  server: {
    // host:"0.0.0.0",
    port: 5173,
  },
  plugins: [react(), svgr()],
  css: {
    postcss: {
      plugins: [
        postcssImport(),
        postcssCustomProperties({ preserve: false }),
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
