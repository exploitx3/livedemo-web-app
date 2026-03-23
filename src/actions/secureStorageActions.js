import * as types from '../constants/actionTypes'
import axios from '../utils/axiosInstance'

export function getWorkspaceEncryptionKey(workspaceId, token) {

  return function (dispatch) {
    return axios.post('/workspaces/getWorkspaceEncryptionKey', {
        workspaceId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(function (response) {


        dispatch({
          type: types.ADD_PRIVATE_KEY,
          workspaceId: workspaceId,
          workspaceEncryptionKey: response.data
        })

        return response.data
      })
  }
}

export function addDecryptedWorkspaceEncryptionKey(workspaceId, keyData) {

  return function (dispatch) {


    return dispatch({
      type: types.ADD_DECRYPTED_PRIVATE_KEY,
      workspaceId: workspaceId,
      workspaceEncryptionKey: keyData
    })
  }
}

export function removeWorkspaceEncryptionKey(workspaceId, token) {

  return function (dispatch) {

    return dispatch({
      type: types.REMOVE_PRIVATE_KEY,
      workspaceId: workspaceId,
    })


  }
}

export function removeDecryptedWorkspaceEncryptionKey(workspaceId) {

  return function (dispatch) {

    return dispatch({
      type: types.REMOVE_DECRYPTED_PRIVATE_KEY,
      workspaceId: workspaceId,
    })


  }
}

export function clearSecureStorage() {

  return function (dispatch) {

    return dispatch({
      type: types.CLEAR_SECURE_STORAGE
    })


  }
}


