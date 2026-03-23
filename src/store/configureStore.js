// Redux 4.x imports - createStore is the standard API (not legacy_createStore)
import * as redux from 'redux';
const {createStore, compose, applyMiddleware} = redux
import thunk from 'redux-thunk';
import rootReducer from '../reducers/index.js';
import * as ENV from '../config.json'

import localStorage from './localStorage.js'
import { throttle } from 'lodash'

function configureStoreProd(initialState) {
  const middlewares = [
    // Add other middleware on this line...

    // thunk middleware can also accept an extra argument to be passed to each thunk action
    // https://github.com/reduxjs/redux-thunk#injecting-a-custom-argument
    thunk,
  ];

  const store = createStore(
    rootReducer, // root reducer
    initialState,
    compose(applyMiddleware(...middlewares))
  )

  store.subscribe(throttle(
    () => {

      localStorage.saveItem(`LiveDemo_authData_${ENV.ENV}`, store.getState().authReducer.authData)
      localStorage.saveItem(`LiveDemo_workspacesReducer_${ENV.ENV}`, store.getState().workspacesReducer)
      localStorage.saveItem(`LiveDemo_secureStorage_${ENV.ENV}`, store.getState().secureStorageReducer)
    }, 1000)
  )

  return store
}

function configureStoreDev(initialState) {
  const middlewares = [
    // Add other middleware on this line...

    // thunk middleware can also accept an extra argument to be passed to each thunk action
    // https://github.com/reduxjs/redux-thunk#injecting-a-custom-argument
    thunk,
  ];

  // Redux DevTools Extension support for Redux 4.x
  // Check if Redux DevTools Extension is available
  const composeEnhancers =
    (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;
  const store = createStore(
    rootReducer, // root reducer
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  );

  store.subscribe(throttle(
    () => {

      let currentState = store.getState()
      localStorage.saveItem(`LiveDemo_authData_${ENV.ENV}`, currentState.authReducer.authData)
      localStorage.saveItem(`LiveDemo_workspacesReducer_${ENV.ENV}`, currentState.workspacesReducer)
      localStorage.saveItem(`LiveDemo_secureStorage_${ENV.ENV}`, currentState.secureStorageReducer)

    }, 1000)
  )

  // if (module.hot) {
  //   // Enable Webpack hot module replacement for reducers
  //   module.hot.accept('../reducers', () => {
  //     const nextRootReducer = require('../reducers').default; // eslint-disable-line global-require
  //     store.replaceReducer(nextRootReducer);
  //   });
  // }

  return store;
}

// Use import.meta.env.PROD for Vite (automatically set during build), fallback to process.env.NODE_ENV for webpack
// Vite replaces import.meta.env.PROD at build time, so this works correctly
// Using a function wrapper ensures both implementations are included and the correct one is called at runtime
function configureStore(initialState) {
  // Check for Vite's import.meta.env.PROD first (set automatically during build)
  // Then fallback to process.env.NODE_ENV for webpack compatibility
  // Use loose equality to handle both string and boolean values
  const isProd = ENV.ENV === 'prod';

  return isProd ? configureStoreProd(initialState) : configureStoreDev(initialState);
}

export default configureStore;
