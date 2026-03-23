// This file configures a web server for testing the production build
// on your local machine.

import browserSync from 'browser-sync';
import historyApiFallback from 'connect-history-api-fallback';
import {chalkProcessing} from './chalkConfig';
import config from '../webpack.config.prod';
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpack from 'webpack'

const bundler = webpack(config);

/* eslint-disable no-console */

console.log(chalkProcessing('Opening production build...'));

// Run Browsersync
browserSync({
  port: 4000,
  ui: {
    port: 4001
  },
  server: {
    baseDir: 'dist'
  },

  files: [
    'src/*.html'
  ],

  middleware: [
    historyApiFallback(),

    webpackDevMiddleware(bundler, {
      // Dev middleware can't access config, so we provide publicPath
      publicPath: config.output.publicPath,

      // These settings suppress noisy webpack output so only errors are displayed to the console.
      noInfo: true,
      quiet: false,
      stats: {
        assets: false,
        colors: true,
        version: false,
        hash: false,
        timings: false,
        chunks: false,
        chunkModules: false
      },

      // for other settings see
      // https://webpack.js.org/guides/development/#using-webpack-dev-middleware
    }),
    function (req, res, next) {
      res.setHeader('frame-ancestors', "'self'")

      next(req, res)
    },

  ]
});
