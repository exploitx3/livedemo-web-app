// Set up your root reducer here...

import { combineReducers } from 'redux';
import authReducer from './authReducer'
import workspacesReducer from './workspacesReducer'
import channelsReducer from './channelsReducer'
import walkthroughReducer from './walkthroughReducer'
import secureStorageReducer from './secureStorageReducer'
import storyDemoReducer from './storyDemoReducer'

const rootReducer = combineReducers({
  authReducer: authReducer,
  workspacesReducer: workspacesReducer,
  channelsReducer: channelsReducer,
  walkthroughReducer: walkthroughReducer,
  storyDemoReducer: storyDemoReducer,
  secureStorageReducer: secureStorageReducer,
});

export default rootReducer;
