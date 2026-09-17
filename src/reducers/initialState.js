import localStorage from '../store/localStorage'
import * as ENV from '../config.json'

export const defaultSecureStorage = {
    privateKeys: {}, //{ <wrkspId>: <keyData>, ...}
    decryptedKeys: {} //{ <wrkspId>: <keyData>, ...}
  }

export default {
  authReducer: {
    authData: localStorage.loadItem(`LiveDemo_authData_${ENV.ENV}`) || {}
  },
  secureStorageReducer: localStorage.loadItem(`LiveDemo_secureStorage_${ENV.ENV}`) || defaultSecureStorage,
  workspacesReducer: localStorage.loadItem(`LiveDemo_workspacesReducer_${ENV.ENV}`) || {
    workspaces: null,
    currentSelectedWorkspace: {},
    isChromeAppAuthorized: false
  },
  channelsReducer: {
    currentSelectedChannel: {}
  },
  walkthroughReducer: {
    run: false,
    pathname: '',
    stepIndex: 0,
    propObj: {}
  },
  storyDemoReducer: {
    currentStoryDemo: {
      screens: []
    },
    renderSteps: [],
    // Version history lives server-side (StoryRevision collection); the browser
    // only ever holds these counts, never the revision payloads.
    historyStatus: {
      canUndo: false,
      canRedo: false,
      undoCount: 0,
      redoCount: 0
    }
  }
}
