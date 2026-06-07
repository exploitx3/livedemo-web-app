/* eslint-disable import/default */

window.global ||= window;

import React from 'react'
import * as reactClient from 'react-dom/client'
const {createRoot} = reactClient

import configureStore from './store/configureStore.js'
import Root from './components/Root.js'
import './favicon.ico' // Tell webpack to load favicon.ico

import './static/fonts/fonts.scss'
import './static/base.scss'
import '@fontsource/roboto-mono';

import "@fontsource/lexend/latin.css"


let hasInitialized = false
// Wait for DOM to be ready before initializing
function initApp() {
  // Check if we're in production (works for both Vite and webpack)

  if (hasInitialized) {
    return
  }

  hasInitialized = true

  const store = configureStore()

  const container = document.getElementById('app')
  if (!container) {
    throw new Error('Root element with id "app" not found')
  }


  const root = createRoot(container)

  root.render(
    <Root store={store} />
  )
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}

// if (module.hot) {
//   module.hot.accept('./components/Root', () => {
//     const NewRoot = require('./components/Root').default
//     render(
//         <NewRoot store={store}/>,
//       document.getElementById('app')
//     )
//   })
// }
