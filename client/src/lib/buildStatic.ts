// Build configuration for static deployment
import { defineConfig } from 'vite';

// This file ensures the app builds as a pure static site
export const staticBuildConfig = {
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
};

export default staticBuildConfig;