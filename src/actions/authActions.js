import * as types from '../constants/actionTypes'
import axios from '../utils/axiosInstance'
import { chromeAppAuthenticate, chromeAppUnauthenticate } from '../utils/helperFunctions'
// import 'chrome-browser-object-polyfill'

function isIOS() {
  const browserInfo = navigator.userAgent.toLowerCase();

  if (browserInfo.match('iphone') || browserInfo.match('ipad')) {
    return true;
  }
  if (['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform)) {
    return true;
  }
  return false;
}

var chrome = chrome
let isInIOS = isIOS()
let chromeRuntimeExists = false

try {
  chromeRuntimeExists = isInIOS ? false : (chrome && chrome.runtime)
} catch (err) {
  console.log(err)
}

export function authWithEmailAndPassword(email, password, browserSessionId) {
  return function (dispatch) {
    return axios.post('/users/password-authenticate', {
      email: email,
      password: password,
      ...(browserSessionId ? { browserSessionId } : {})
    })
      .then(function (response) {


        dispatch({
          type: types.UPDATE_AUTH_DATA,
          authData: {
            ...response.data,
            emailVerified: response.data.emailVerified === true,
          }
        })

        return response.data
      })


  }
}

export function registerWithEmailAndPassword(email, password, fullName, browserSessionId) {
  return function (dispatch) {
    return axios.post('/users', {
      email: email,
      password: password,
      fullName: fullName,
      ...(browserSessionId ? { browserSessionId } : {})
    })
      .then(function (response) {


        dispatch({
          type: types.UPDATE_AUTH_DATA,
          authData: {
            ...response.data,
            emailVerified: response.data.emailVerified === true,
          }
        })

        return response.data
      })


  }
}

export function sendEmailVerificationCode(token) {
  return function () {
    return axios.post('/users/send-email-verify', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.data)
  }
}

export function checkEmailVerificationCode(code, token) {
  return function (dispatch, getState) {
    return axios.post('/users/check-email-verify', { code }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const currentAuthData = getState().authReducer.authData

        dispatch({
          type: types.UPDATE_AUTH_DATA,
          authData: {
            ...currentAuthData,
            emailVerified: true,
          }
        })

        return response.data
      })
  }
}

export function authWithToken(token) {
  return function (dispatch) {

    return axios.post('/users/token-authenticate', {
      token: token
    })
      .then(function (response) {

        if (response.data.email) {

          if (chromeRuntimeExists) {
            chromeAppAuthenticate(response.data)


          }
        }

        dispatch({
          type: types.UPDATE_AUTH_DATA,
          authData: {
            ...response.data,
            emailVerified: response.data.emailVerified === true,
          }
        })

        return response.data
      }).catch(e => {
        console.log(e)

        Promise.all([
          dispatch({
            type: types.REMOVE_AUTH_DATA,
          }),
          dispatch({
            type: types.RESET_CURRENT_SELECTED_WORKSPACES
          })
        ])
      })


  }
}

export function googleAuthenticate() {
  return function (dispatch) {

    return axios.post('/users/auth/google-link')
      .then(function (response) {


        return response.data.link
      }).catch(e => {
        console.log(e)

      })

  }
}

export function refreshToken(token) {
  return function (dispatch) {

    return axios.post('/users/refreshToken', {
      token: token
    })
      .then(function (response) {

        if (response.data.email) {

          if (chromeRuntimeExists) {

            chromeAppAuthenticate(response.data)

          }
        }
debugger

        dispatch({
          type: types.UPDATE_AUTH_DATA,
          authData: {
            ...response.data,
            emailVerified: response.data.emailVerified === true,
          }
        })


        return response.data


      }).catch(e => {
        console.log(e)

        Promise.all([
          dispatch({
            type: types.REMOVE_AUTH_DATA,
          }),
          dispatch({
            type: types.RESET_CURRENT_SELECTED_WORKSPACES
          })
        ])
      })


  }
}

export function demoAuthenticate(token) {
  return function (dispatch) {


    return axios.post('/users/demo-authenticate', {
      token: token
    })
      .then(function (response) {
        sessionStorage.setItem('useDemoClient', 'true');

        dispatch({
          type: types.UPDATE_AUTH_DATA,
          authData: {
            ...response.data,
            isDemo: true
          }
        })


        return response.data


      }).catch(e => {
        console.log(e)

        Promise.all([
          dispatch({
            type: types.REMOVE_AUTH_DATA,
          }),
          dispatch({
            type: types.RESET_CURRENT_SELECTED_WORKSPACES
          })
        ])
      })


  }
}

export function logout(token) {

  return function (dispatch) {

    sessionStorage.removeItem('useDemoClient');
    return axios.post('/users/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(function (response) {


        if (chromeRuntimeExists) {
          chromeAppUnauthenticate()


        }

        return Promise.all([
          dispatch({
            type: types.REMOVE_AUTH_DATA,
          }),
          dispatch({
            type: types.RESET_CURRENT_SELECTED_WORKSPACES
          }),
          dispatch({
            type: types.CLEAR_SECURE_STORAGE
          }),
          dispatch({
            type: types.CHROME_APP_UNAUTHORIZE
          })
        ])
          .then(() => {

            return response
          })



      })
      .catch(e => {

        Promise.all([
          dispatch({
            type: types.REMOVE_AUTH_DATA,
          }),
          dispatch({
            type: types.RESET_CURRENT_SELECTED_WORKSPACES
          }),
          dispatch({
            type: types.CHROME_APP_UNAUTHORIZE
          })
        ])

        console.log(e)
        throw new Error(e)


      })

  }
}
