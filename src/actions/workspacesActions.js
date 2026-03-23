import * as types from '../constants/actionTypes'
import axios from '../utils/axiosInstance'

export function createWorkspace(token, newWorkspaceName) {

  return function (dispatch) {
    return new Promise(resolve => {
      resolve(
        axios.post('/workspaces',
          {
            name: newWorkspaceName
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(function (response) {
//
            dispatch({
              type: types.NEW_WORKSPACE_CREATED,
              workspaces: response.data.workspaces,
              workspace: response.data.newWorkspace
            })

            return response.data
          })
      )


    })
  }
}

export function updateAllWorkspacesForUser(token) {

  return function (dispatch) {
    return new Promise((resolve, reject) => {
        axios.get('/workspaces', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(function (response) {


            dispatch({
              type: types.UPDATE_ALL_WORKSPACES_DATA,
              workspaces: response.data
            })

            resolve(response.data)
          })
          .catch(err => {
            reject(err)
          })

    })


  }
}

export function resetCurrentSelectedWorkspace() {
  return function (dispatch) {

    return dispatch({
      type: types.RESET_CURRENT_SELECTED_WORKSPACES
    })
  }
}

export function updateCurrentSelectedWorkspace(token, workspaceId) {
  const startTime = performance.now()
  console.log('[Redux Action] updateCurrentSelectedWorkspace STARTED', {
    workspaceId,
    timestamp: new Date().toISOString()
  })

  return function (dispatch) {
    const getWorkspaceStart = performance.now()
    return axios.get(`/workspaces/${workspaceId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(function (response) {
        const getWorkspaceEnd = performance.now()
        console.log('[Redux Action] updateCurrentSelectedWorkspace - get workspace API call completed', {
          timeFromStart: `${(getWorkspaceEnd - startTime).toFixed(2)}ms`,
          duration: `${(getWorkspaceEnd - getWorkspaceStart).toFixed(2)}ms`
        })
        return response.data
      })
      .then((workspaceData) => {


        let resultWorkspaceData = {
          ...workspaceData,
        }

        const dispatchStart = performance.now()
        dispatch({
          type: types.UPDATE_CURRENT_SELECTED_WORKSPACE,
          workspace: resultWorkspaceData
        })
        const dispatchEnd = performance.now()
        const totalTime = dispatchEnd - startTime

        console.log('[Redux Action] updateCurrentSelectedWorkspace COMPLETED', {
          timeFromStart: `${totalTime.toFixed(2)}ms`,
          dispatchDuration: `${(dispatchEnd - dispatchStart).toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        })

        if (totalTime > 1000) {
          console.warn('[Redux Action] ⚠️ WARNING: updateCurrentSelectedWorkspace took longer than 1s!', {
            duration: `${totalTime.toFixed(2)}ms`
          })
        }

        return resultWorkspaceData

      })


  }
}

export function chromeAppAuthorize(){
  return function (dispatch) {
    dispatch({
      type: types.CHROME_APP_AUTHORIZE
    })
  }
}

export function chromeAppUnauthorize(){
  return function (dispatch) {
    dispatch({
      type: types.CHROME_APP_AUTHORIZE
    })
  }
}
