import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel'
import viteCommonjs from 'vite-plugin-commonjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  root: path.resolve(__dirname, 'src/injectScript'),
  publicDir: path.resolve(__dirname, 'src/injectScript/assets'),
  build: {
    outDir: path.resolve(__dirname, 'src/injectScript/dist'),
    emptyOutDir: true, // Clear the dist directory on each build
    sourcemap: false,
    minify: 'esbuild', // Minify for production
    rollupOptions: {
      input: path.resolve(__dirname, 'src/injectScript/injectScript.js'),
      output: {
        entryFileNames: 'injectScript.bundle.js',
        format: 'iife', // IIFE format for browser script
        name: 'injectScript',
        inlineDynamicImports: true, // Bundle everything into a single file
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      // Match vite.config.js alias for antd v6 ES modules
      'antd/lib': 'antd/es',
      'antd/reset': path.resolve(__dirname, 'node_modules/antd/dist/reset.css'),
      // React-confetti alias
      'react-confetti': path.resolve(__dirname, 'node_modules/react-confetti/dist/react-confetti.cjs'),
      // Fix use-sync-external-store CommonJS export issue
      // Point directly to the CJS file that has the named export (production version)
      'use-sync-external-store/with-selector.js': path.resolve(__dirname, 'node_modules/use-sync-external-store/cjs/use-sync-external-store-with-selector.production.js'),
    },
  },
  plugins: [
    babel(),
    viteCommonjs({
      filter(id) {
        // Explicitly include use-sync-external-store and scheduler files for CommonJS transformation
        // This must be checked first to ensure it's processed
        if (id.includes('use-sync-external-store') || id.includes('scheduler')) {
          return true
        }

        if (
          id.includes('core-js') ||
          id.includes('node_modules/react') ||
          id.includes('node_modules/async-validator') ||
          id.includes('connected-react-router') ||
          id.includes('styled-components') ||
          id.includes('prop-types') ||
          id.includes('lodash') ||
          id.includes('enquire.js') ||
          id.includes('hls') ||
          id.includes('react-redux')
        ) {
          return false
        }

        if (
          id.includes('livedemo-components') ||
          id.includes('src/') ||
          id.includes('node_modules/')
        ) {
          return true
        }
      },
      // Explicitly include use-sync-external-store and scheduler in the include list
      include: [
        '**/use-sync-external-store/**/*.js',
        '**/use-sync-external-store-with-selector*.js',
        '**/scheduler/**/*.js',
        'node_modules/use-sync-external-store/**',
        'node_modules/react-redux/**',
        'node_modules/scheduler/**'
      ],
    }),
    react({
      include: ['**/*.{js,jsx,tsx,ts,mjs}'],
      babel: {
        babelConfig: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
          ],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-syntax-dynamic-import',
          ],
        },
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: [path.resolve(__dirname, 'src')],
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'use-sync-external-store/with-selector'],
    force: true,
  },
})

