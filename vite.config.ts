import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ["rg-server"],
  },
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler']
      }
    })
  ],
  resolve: {
    alias: {
      'buffer/': 'buffer/'
    }
  },
  define: {
    'process.env.APP_VERSION': JSON.stringify(pkg.version)
  },
  optimizeDeps: {
    include: ['it-tar', 'it-pipe', 'buffer']
  },
  worker: {
    format: "es",
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-mui': [
            '@mui/material',
            '@mui/icons-material',
            '@mui/x-data-grid',
            '@emotion/react',
            '@emotion/styled'
          ],
          'vendor-plotly': ['plotly.js', 'react-plotly.js'],
          'vendor-deck': [
            '@deck.gl/core',
            '@deck.gl/layers',
            '@deck.gl/react',
            '@deck.gl/extensions',
            '@deck.gl/geo-layers',
            '@deck.gl/mesh-layers',
            '@deck.gl/widgets',
            '@deck.gl-community/editable-layers',
            '@deck.gl-community/layers'
          ],
          'vendor-viv': ['@hms-dbmi/viv'],
          'vendor-utils': ['zustand', 'lodash', 'jszip']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true
  }
});
