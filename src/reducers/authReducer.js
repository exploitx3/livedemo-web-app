import { UPDATE_AUTH_DATA, REMOVE_AUTH_DATA } from '../constants/actionTypes'

import initialState from './initialState'

export default function authReducer(state = initialState.authReducer, action) {

  switch (action.type) {
    case UPDATE_AUTH_DATA:

      return {
        ...state,
        authData: action.authData
      }

    case REMOVE_AUTH_DATA:

      return {
        ...state,
        authData: {}
      }

    default:
      return state
  }
}
