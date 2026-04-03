import ScreenTypes from '../constants/ScreenTypes.js'

import axios from './axiosInstance.js'
import * as ENVmodule from '../config.json'
const ENV = ENVmodule.default ?? ENVmodule

export function deriveRenderSteps(storyDemo) {

  let newSteps = storyDemo.screens.length === 0 ? [] : storyDemo.screens
    .sort((firstScreen, secondScreen) => firstScreen.index - secondScreen.index)
    .reduce((accum, screen) => {

      let screenSteps = []

      if (screen.type === ScreenTypes.SCREEN_PAGE) {
        screenSteps = screen.steps.map(step => {
          step.screenId = screen._id
          step.screenType = screen.type
          step.screenWidth = screen.width
          step.screenHeight = screen.height


          return step
        })

        if (!screenSteps.length) {
          screenSteps.push({
            screenId: screen._id,
            screenWidth: screen.width,
            screenHeight: screen.height,
            screenType: screen.type
          })
        }

      } else if (screen.type === ScreenTypes.SCREEN_SCREENSHOT) {

        let screenshotSteps = !screen.steps ? [] : screen.steps.map(step => {
          step.screenId = screen._id
          step.screenType = screen.type
          step.screenWidth = screen.width
          step.screenHeight = screen.height
          step.imageUrl = screen.imageUrl

          return step
        })

        if (screenshotSteps.length) {

          screenshotSteps.forEach(stepObj => {

            screenSteps.push(stepObj)
          })
        } else {

          screenSteps.push({
            screenId: screen._id,
            imageUrl: screen.imageUrl,
            screenType: screen.type
          })
        }


      } else if (screen.type === ScreenTypes.SCREEN_VIDEO) {

        let videoSteps = !screen.steps ? [] : screen.steps.map(step => {
          step.screenId = screen._id
          step.screenType = screen.type
          step.asset = screen.asset
          step.playbackRate = screen.playbackRate
          step.zoomSpans = screen.zoomSpans

          return step
        })

        videoSteps.forEach(stepObj => {

          screenSteps.push(stepObj)
        })

      } else {

        screenSteps.push({
          _id: 1,
          screenId: screen._id,
          type: screen.type,
          zoomSpans: screen.zoomSpans ? screen.zoomSpans : []
        })
      }


      accum = accum.concat([...screenSteps])

      return accum
    }, [])

  newSteps = newSteps.map((step, index) => {
    step.index = index
    return step
  })

  return newSteps
}

export function getVoices(workspaceId, authToken) {

  return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/voices`, {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  })
    .then((res) => {
      let voices = res.data.voices

      return voices
    })
}


export function getLinks(workspaceId, storyDemoId, authToken) {


  return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/links`, {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  })
    .then((res) => {
      let links = res.data

      return links
    })
}

export function updateLink(linkId, updateObj, workspaceId, storyDemoId, authToken) {


  return axios.patch(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/links/${linkId}`, {
    ...updateObj,
  },{
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  })
    .then((res) => {
      let links = res.data

      return links
    })
}

export function createLink(name, workspaceId, storyDemoId, authToken) {


  return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/links`, {
    name,
  },{
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  })
    .then((res) => {
      let link = res.data

      return link
    })
}

export function deleteLink(linkId, workspaceId, storyDemoId, authToken) {


  return axios.delete(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/links/${linkId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  })
    .then((res) => {
      let storyDemo = res.data

      return storyDemo
    })
}
