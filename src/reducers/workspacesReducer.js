import {
  CHROME_APP_AUTHORIZE,
  CHROME_APP_UNAUTHORIZE,
  NEW_WORKSPACE_CREATED,
  RESET_CURRENT_SELECTED_WORKSPACES,
  UPDATE_ALL_WORKSPACES_DATA,
  UPDATE_CURRENT_SELECTED_WORKSPACE
} from '../constants/actionTypes'

import initialState from './initialState'

export default function workspacesReducer(state = initialState.workspacesReducer, action) {

  switch (action.type) {
    case NEW_WORKSPACE_CREATED:


      return {
        ...state,
        workspaces: action.workspaces,
        currentSelectedWorkspace: action.workspace
      }
    case UPDATE_ALL_WORKSPACES_DATA:


      return {
        ...state,
        workspaces: action.workspaces
      }

    case UPDATE_CURRENT_SELECTED_WORKSPACE:

      return {
        ...state,
        currentSelectedWorkspace: action.workspace
      }

    case RESET_CURRENT_SELECTED_WORKSPACES:

      return {
        ...state,
        workspaces: [],
        currentSelectedWorkspace: {},
      }

    case CHROME_APP_AUTHORIZE:

      return {
        ...state,
        isChromeAppAuthorized: true,
      }

    case CHROME_APP_UNAUTHORIZE:

      return {
        ...state,
        isChromeAppAuthorized: false,
      }

    default:
      return state
  }
}
