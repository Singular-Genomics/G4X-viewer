import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'buffer/': 'buffer/'
    }
  },
  optimizeDeps: {
    include: ['it-tar', 'it-pipe', 'buffer']
  },
  define: {
    'process.env.APP_VERSION': JSON.stringify(pkg.version)
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom'],

          // MUI components
          'vendor-mui': [
            '@mui/material',
            '@mui/icons-material',
            '@mui/x-data-grid',
            '@emotion/react',
            '@emotion/styled'
          ],

          // Plotly charting library
          'vendor-plotly': ['plotly.js', 'react-plotly.js'],

          // Deck.gl visualization
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

          // Viv image viewer
          'vendor-viv': ['@hms-dbmi/viv'],

          // Utilities
          'vendor-utils': ['zustand', 'lodash', 'jszip', 'protobufjs']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true
  }
});
