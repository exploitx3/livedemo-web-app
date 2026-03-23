import {defineConfig, transformWithEsbuild} from 'vite'
import react from '@vitejs/plugin-react'
import { createHtmlPlugin } from 'vite-plugin-html'
import path from 'path'

export default defineConfig({
  root: 'src',
  publicDir: 'public',

  /* =========================
     BUILD CONFIG
  ========================= */
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari14'],

    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // Ensure dynamic imports (React.lazy) create separate chunks even if components are statically imported elsewhere
        // This prevents lazy loading failures when components are imported both statically and dynamically
        manualChunks: undefined, // Let Vite handle automatic chunking
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          const ext = name.split('.').pop()

          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i.test(name)) {
            return 'assets/media/[name]-[hash][extname]'
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) {
            return 'assets/img/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          if (ext === 'css') {
            return 'assets/css/[name]-[hash][extname]'
          }

          return 'assets/[name]-[hash][extname]'
        },
      },
    },

    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },
  },

  /* =========================
     OPTIMIZE DEPS
     ✅ Configure esbuild for dependency pre-bundling to handle JSX in .js files
  ========================= */
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },

  /* =========================
     REACT PLUGIN CONFIG
     ✅ Fixes JSX in .js files
  ========================= */
  plugins: [
    {
      name: 'jsx-in-js',
      enforce: 'pre',
      async transform(code, id) {
        if (
          id.endsWith('.js') &&
          !id.includes('node_modules') &&
          /<\w/.test(code) // rough JSX detection
        ) {
          try {
            const result = await transformWithEsbuild(code, id, {
              loader: 'jsx',
              jsx: 'automatic', // React 18 automatic runtime
            })
            return result
          } catch (err) {
            console.error('Failed to transform JSX in .js:', id)
            throw err
          }
        }
        return null
      },
    },

    react({
      include: [/\.js$/, /\.jsx$/, /\.ts$/, /\.tsx$/], // Important: include .js files
      babel: {
        presets: [
          [
            '@babel/preset-react',
            {
              runtime: 'automatic', // Use React 18 automatic JSX runtime
              development: false,
            },
          ],
        ],
      },
    }),

    createHtmlPlugin({
      template: 'index.html',
      inject: { data: { ENV: 'prod' } },
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: false,
        collapseBooleanAttributes: true,
        removeScriptTypeAttributes: true,
      },
    }),
  ],

  /* =========================
     CSS
  ========================= */
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        compress: true,
      },
    },
  },

  /* =========================
     MODULE RESOLUTION
  ========================= */
  resolve: {
    alias: {
      'antd/lib': 'antd/es',
      'antd/reset': path.resolve(__dirname, 'node_modules/antd/dist/reset.css'),
    },
    dedupe: ['react', 'react-dom'],
  },

  /* =========================
     DEV SERVER
  ========================= */
  server: {
    http: {},
  },
})
