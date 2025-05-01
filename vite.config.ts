
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Force clear the output directory
    emptyOutDir: true,
    // Generate source maps for easier debugging
    sourcemap: true,
    // Explicitly configure CSS handling
    cssCodeSplit: true,
    // Ensure CSS is included in the build
    assetsInlineLimit: 0,
  },
  css: {
    // Force CSS modules to be processed properly
    modules: {
      localsConvention: 'camelCase',
    },
    // Enable source maps for CSS
    devSourcemap: true,
  }
}));
