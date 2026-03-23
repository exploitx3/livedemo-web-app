import { UPDATE_CURRENT_SELECTED_CHANNEL, GET_MESSAGES_FOR_CURRENT_CHANNEL, RESET_CURRENT_SELECTED_CHANNEL } from '../constants/actionTypes'

import initialState from './initialState'

export default function channelsReducer(state = initialState.channelsReducer, action) {

  switch (action.type) {
    case UPDATE_CURRENT_SELECTED_CHANNEL:


      return {
        ...state,
        currentSelectedChannel: action.channel
      }

    case RESET_CURRENT_SELECTED_CHANNEL:

      return {
        ...state,
        currentSelectedChannel: {}
      }

    case GET_MESSAGES_FOR_CURRENT_CHANNEL:
      let newMessages = state.messages.concat(action.messages)
      return {
        ...state,
        currentSelectedChannel: {
          ...state.currentSelectedChannel,
          messages: newMessages }
      }

    default:
      return state
  }
}
