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
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-select'],
          'chart-vendor': ['recharts'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'tanstack-vendor': ['@tanstack/react-query'],
          // Feature chunks
          'auth': ['./src/pages/Auth.tsx', './src/hooks/useAuth.tsx'],
          'analytics': ['./src/pages/Analytics.tsx', './src/components/AnalyticsChart.tsx'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
