import * as types from '../constants/actionTypes'
import axios from '../utils/axiosInstance'
import toastr from 'toastr'

export function getMessagesForChannel(channelId, isIm, timestamp, limit, sortByDate) {

  return function (dispatch) {
    const channelsPath = isIm ? 'imchannels' : 'channels'

    return axios.get(`/${channelsPath}/${channelId}/messages`, {
        params: {
          limit,
          timestamp,
          sortByDate
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(function (response) {


        return dispatch({
          type: types.GET_MESSAGES_FOR_CURRENT_CHANNEL,
          workspaces: response.data
        })
      })

  }
}

export function resetCurrentSelectedChannel() {
  const startTime = performance.now()
  console.log('[Redux Action] resetCurrentSelectedChannel STARTED', {
    timestamp: new Date().toISOString()
  })

  return function(dispatch) {
    const dispatchStart = performance.now()
    const result = dispatch({
      type: types.RESET_CURRENT_SELECTED_CHANNEL
    })
    const dispatchEnd = performance.now()
    const totalTime = dispatchEnd - startTime

    console.log('[Redux Action] resetCurrentSelectedChannel COMPLETED', {
      timeFromStart: `${totalTime.toFixed(2)}ms`,
      dispatchDuration: `${(dispatchEnd - dispatchStart).toFixed(2)}ms`,
      timestamp: new Date().toISOString()
    })

    return result
  }
}

export function updateCurrentSelectedChannel(token, channelId, isIm) {
  const startTime = performance.now()
  console.log('[Redux Action] updateCurrentSelectedChannel STARTED', {
    channelId,
    isIm,
    timestamp: new Date().toISOString()
  })

  return function (dispatch) {
    let channelsPath = isIm ? 'imchannels' : 'channels'

    const getChannelStart = performance.now()
    return axios.get(`/${channelsPath}/${channelId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        const getChannelEnd = performance.now()
        console.log('[Redux Action] updateCurrentSelectedChannel - get channel API call completed', {
          timeFromStart: `${(getChannelEnd - startTime).toFixed(2)}ms`,
          duration: `${(getChannelEnd - getChannelStart).toFixed(2)}ms`
        })
        return {
          channel: response.data,
        }
      })
      .then(function (channelData) {
        const getMessagesStart = performance.now()
        return axios.get(`/${channelsPath}/${channelId}/messages`, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: {
              limit: 15,
              sortByDate: 1,
              direction: 'backward',
              inclusive: 'true',
              isIm: channelData.channel.isIm,
              workspaceId: channelData.channel.workspaceId
            }
          })
          .then((channelsResponse) => {
            const getMessagesEnd = performance.now()
            console.log('[Redux Action] updateCurrentSelectedChannel - get messages API call completed', {
              timeFromStart: `${(getMessagesEnd - startTime).toFixed(2)}ms`,
              duration: `${(getMessagesEnd - getMessagesStart).toFixed(2)}ms`
            })
            return {
              channel: channelData.channel,
              messages: channelsResponse.data.messages,
              hasMore: channelsResponse.data.hasMore || false
            }
          })
      })
      .then((channelData) => {
        const dispatchStart = performance.now()
        const result = dispatch({
          type: types.UPDATE_CURRENT_SELECTED_CHANNEL,
          channel: {
            ...channelData.channel,
            messages: channelData.messages,
            hasMore: channelData.hasMore
          }
        })
        const dispatchEnd = performance.now()
        const totalTime = dispatchEnd - startTime

        console.log('[Redux Action] updateCurrentSelectedChannel COMPLETED', {
          timeFromStart: `${totalTime.toFixed(2)}ms`,
          dispatchDuration: `${(dispatchEnd - dispatchStart).toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        })

        if (totalTime > 1000) {
          console.warn('[Redux Action] ⚠️ WARNING: updateCurrentSelectedChannel took longer than 1s!', {
            duration: `${totalTime.toFixed(2)}ms`
          })
        }

        return result
      })

  }
}


