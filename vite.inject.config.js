import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel'
import viteCommonjs from 'vite-plugin-commonjs'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  root: path.resolve(__dirname, 'src/injectScript'),
  publicDir: path.resolve(__dirname, 'src/injectScript/assets'),
  build: {
    outDir: path.resolve(__dirname, 'src/injectScript/dist'),
    emptyOutDir: true, // Clear the dist directory on each build
    sourcemap: true,
    minify: false, // For development, set to 'esbuild' for production
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
      include: [/node_modules/], // Ensure node_modules are processed
    },
  },
  server: {
    port: 8080, // Different port from main vite server
    cors: true,
    fs: {
      allow: ['..'], // Allow serving files from parent directories
    },
    // Serve files from root so /injectScript.bundle.js is accessible
    base: '/',
  },
  plugins: [
    {
      name: 'serve-bundle-from-dist',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Serve injectScript.bundle.js from dist folder
          if (req.url === '/injectScript.bundle.js') {
            const bundlePath = path.resolve(__dirname, 'src/injectScript/dist/injectScript.bundle.js')
            if (fs.existsSync(bundlePath)) {
              const content = fs.readFileSync(bundlePath)
              res.setHeader('Content-Type', 'application/javascript')
              res.end(content)
              return
            }
          }
          next()
        })
      },
    },
    babel(),
    viteCommonjs({
      filter(id) {
        // Explicitly include use-sync-external-store and scheduler files for CommonJS transformation
        // This must be checked first to ensure it's processed
        if(id.includes('react-redux') || id.includes('use-sync-external-store') || id.includes('scheduler')) {
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
          id.includes('hls')
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
  resolve: {
    alias: {
      // Match vite.config.js alias for antd v6 ES modules
      'antd/lib': 'antd/es',
      'antd/reset': path.resolve(__dirname, 'node_modules/antd/dist/reset.css'),
      // React-confetti alias
      'react-confetti': path.resolve(__dirname, 'node_modules/react-confetti/dist/react-confetti.cjs'),
      // Fix use-sync-external-store CommonJS export issue
      // Point directly to the CJS file that has the named export (development version)
      'use-sync-external-store/with-selector.js': path.resolve(__dirname, 'node_modules/use-sync-external-store/cjs/use-sync-external-store-with-selector.development.js'),
    },
  },
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

