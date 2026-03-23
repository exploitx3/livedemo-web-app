import {
  ADD_DECRYPTED_PRIVATE_KEY,
  ADD_PRIVATE_KEY,
  CLEAR_SECURE_STORAGE,
  REMOVE_DECRYPTED_PRIVATE_KEY,
  REMOVE_PRIVATE_KEY
} from '../constants/actionTypes'
import localStorage from '../store/localStorage'
import initialState, { defaultSecureStorage } from './initialState'

export default function secureStorageReducer(state = initialState.secureStorageReducer, action) {

  switch (action.type) {
    case ADD_PRIVATE_KEY:


      return {
        ...state,
        privateKeys: {
          ...state.privateKeys,
          [action.workspaceId]: action.workspaceEncryptionKey
        }
      }

    case ADD_DECRYPTED_PRIVATE_KEY:


      return {
        ...state,
        decryptedKeys: {
          ...state.decryptedKeys,
          [action.workspaceId]: action.workspaceEncryptionKey
        }
      }

    case REMOVE_PRIVATE_KEY:
      let newPrivateKeysObj = { ...state.privateKeys }
      delete newPrivateKeysObj[action.workspaceId]

      return {
        ...state,
        privateKeys: newPrivateKeysObj
      }

    case REMOVE_DECRYPTED_PRIVATE_KEY:
      let newDecryptedPrivateKeysObj = { ...state.privateKeys }
      delete newDecryptedPrivateKeysObj[action.workspaceId]

      return {
        ...state,
        decryptedKeys: newDecryptedPrivateKeysObj
      }

    case CLEAR_SECURE_STORAGE:
      
      localStorage.removeItem('secureStorage')
      localStorage.removeItem('authData')
      return defaultSecureStorage

    default:
      return state
  }
}
