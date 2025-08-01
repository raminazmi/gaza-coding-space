import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [react({
    babel: {
      plugins: ['@babel/plugin-transform-runtime']
    }
  }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  server: {
    proxy: {
      '/api': {
        target: 'https://gazacodingspace.mahmoudalbatran.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    // إضافة إعدادات لضمان عمل SPA بشكل صحيح
    historyApiFallback: true,
  },
  // إضافة إعدادات للبناء
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@public": path.resolve(__dirname, "./public"),
    },
  },
}));
