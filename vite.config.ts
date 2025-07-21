import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      '/broadcasting': {
        target: 'https://gazacodingspace.mahmoudalbatran.com',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [react({
    babel: {
      plugins: ['@babel/plugin-transform-runtime']
    }
  }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@public": path.resolve(__dirname, "./public"),
    },
  },
}));
