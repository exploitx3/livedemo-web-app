import * as types from '../constants/actionTypes.js'
import axios from '../utils/axiosInstance.js'
import ENV from '../injectScript/config.json'
import {deriveRenderSteps} from '../utils/storyHelpers.js'


function getStoryDemoInternal(workspaceId, storyDemoId, authToken) {

  return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  })
    .then((res) => {
      return res.data
    })
}

export function getStoryDemo(workspaceId, storyDemoId, authToken) {


  return function (dispatch) {

    return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {

        let newStoryDemo = res.data

        let renderSteps = deriveRenderSteps(newStoryDemo)

        dispatch({
          type: types.UPDATE_STORY_DEMO,
          storyDemo: newStoryDemo,
        })

        dispatch({
          type: types.UPDATE_RENDER_STEPS,
          renderSteps: renderSteps,
        })

        return res.data


      })
  }
}

export function updateStoryDemo(newStoryDemo) {


  return function (dispatch) {
    return new Promise(resolve => {

      let renderSteps = deriveRenderSteps(newStoryDemo)

      dispatch({
        type: types.UPDATE_STORY_DEMO,
        storyDemo: newStoryDemo,
      })


      dispatch({
        type: types.UPDATE_RENDER_STEPS,
        renderSteps: renderSteps,
      })

      resolve()
    })

  }
}


export function reloadStoryDemo(workspaceId, storyDemoId, authToken) {
  return function (dispatch) {
    return getStoryDemoInternal(workspaceId, storyDemoId, authToken)
      .then((newStoryDemo) => {

        let renderSteps = deriveRenderSteps(newStoryDemo)

        dispatch({
          type: types.UPDATE_STORY_DEMO,
          storyDemo: newStoryDemo,
        })

        dispatch({
          type: types.UPDATE_RENDER_STEPS,
          renderSteps: renderSteps,
        })

        return newStoryDemo
      })
  }

}


export function addTransition(type, storyDemoId, screenId, workspaceId, authToken) {


  return function (dispatch) {

    let newNavObj = {
      pointer: {
        selector: ''
      },
      gotoType: 'screen',
      type: type,
      hotspot: {
        frameX: 200,
        frameY: 200
      },
      content: '<p>Click here</p>'

    }

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/transitions`, {
      ...newNavObj
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((res) => {
      let newTransition = res.data

      dispatch({
        type: types.ADD_TRANSITION,
        transition: newTransition,
        screenId: screenId
      })

      return newTransition
    })
  }
}

export function deleteTransition(workspaceId, storyDemoId, screenId, transitionId, authToken) {


  return function (dispatch) {


    return axios.delete(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/transitions/${transitionId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      .then(() => {

        dispatch({
          type: types.DELETE_TRANSITION,
          transitionId: transitionId,
          screenId: screenId
        })

        return transitionId
      })
  }
}

export function updateTransition(transitionObj, workspaceId, storyDemoId, screenId, transitionId, authToken) {


  return function (dispatch) {

    return axios.patch(
      `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/transitions/${transitionId}`,
      transitionObj,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      .then((res) => {
        return res.data
      })
      .then((updatedTransition) => {

        dispatch({
          type: types.UPDATE_TRANSITION,
          transition: updatedTransition,
          screenId: screenId
        })

        return updatedTransition
      })
  }
}


export function addStep(index, viewType, storyDemoId, screenId, workspaceId, authToken) {


  return function (dispatch) {

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps`, {
      index: index,
      view: {
        viewType: viewType
      }
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((res) => {
      let newStep = res.data

      dispatch({
        type: types.ADD_STEP,
        step: newStep,
        screenId: screenId
      })


      return newStep
    })
  }
}

export function deleteStep(stepId, storyDemoId, screenId, workspaceId, authToken) {


  return function (dispatch) {


    return axios.delete(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${stepId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then(() => {

      dispatch({
        type: types.DELETE_STEP,
        stepId: stepId,
        screenId: screenId
      })

      return stepId
    })
  }
}

export function deleteStepAudio(stepAudioId, stepId, storyDemoId, screenId, workspaceId, authToken) {

  return function (dispatch) {


    return axios.delete(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${stepId}/audios/${stepAudioId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then(() => {

      dispatch({
        type: types.DELETE_STEP_AUDIO,
        stepId: stepId,
        screenId: screenId
      })

      return stepId
    })
  }
}

export function updateStep(stepUpdateObj, storyDemoId, screenId, workspaceId, stepId, authToken) {


  let newStepObj = JSON.parse(JSON.stringify(stepUpdateObj))
  return function (dispatch) {

    return axios.patch(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${stepId}`, {
      ...newStepObj
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((res) => {
      let newStep = res.data
      dispatch({
        type: types.UPDATE_STEP,
        step: newStep,
        screenId: screenId
      })

      return newStep
    })
  }
}


export function addStepAudio(workspaceId, storyDemoId, screenId, stepId, authToken) {

  return function (dispatch) {

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${stepId}/audios`, {

    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        let audioDoc = res.data

        dispatch({
          type: types.ADD_STEP_AUDIO,
          audioDoc: audioDoc,
          screenId: screenId,
          stepId: stepId,
        })

        return res.data
      })
  }
}


export function addStepZoomSpan(workspaceId, storyDemoId, screenId, stepId, delay, duration, width, height, editorWidth, editorHeight, offsetX, offsetY, authToken) {

  return function (dispatch) {
    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${stepId}/zoomSpans`, {
      'delay': delay,
      'duration': duration,
      'width': width,
      'height': height,
      'editorWidth': editorWidth,
      'editorHeight': editorHeight,
      'offsetX': offsetX,
      'offsetY': offsetY
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        let newStep = res.data

        dispatch({
          type: types.ADD_STEP_ZOOM_SPAN,
          zoomSpan: res.data,
          storyDemoId: storyDemoId,
          screenId: screenId,
          stepId: stepId,
        })

        return res.data
      })
  }
}

export function updateStepZoomSpan(workspaceId, storyDemoId, screenId, stepId, zoomSpanId, delay, duration, width, height, editorWidth, editorHeight, offsetX, offsetY, authToken) {

  return function (dispatch) {
    return axios.patch(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${stepId}/zoomSpans/${zoomSpanId}`, {
      'delay': delay,
      'duration': duration,
      'width': width,
      'height': height,
      'editorWidth': editorWidth,
      'editorHeight': editorHeight,
      'offsetX': offsetX,
      'offsetY': offsetY
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        let newStep = res.data

        dispatch({
          type: types.UPDATE_STEP_ZOOM_SPAN,
          zoomSpan: {
            ...res.data,
            showed: true
          },
          storyDemoId: storyDemoId,
          screenId: screenId,
          stepId: stepId,
        })

        return res.data
      })
  }
}

export function deleteStepZoomSpan(workspaceId, storyDemoId, screenId, stepId, zoomSpanId, authToken) {

  return function (dispatch) {
    return axios.delete(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${stepId}/zoomSpans/${zoomSpanId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        let newStep = res.data

        dispatch({
          type: types.DELETE_STEP_ZOOM_SPAN,
          zoomSpanId: zoomSpanId,
          storyDemoId: storyDemoId,
          screenId: screenId,
          stepId: stepId,
        })

        return res.data
      })
  }
}

export function addZoomSpan(workspaceId, storyDemoId, screenId, startTime, duration, width, height, editorWidth, editorHeight, offsetX, offsetY, authToken) {

  return function (dispatch) {
    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/zoomSpans`, {
      'startTime': startTime,
      'duration': duration,
      'width': width,
      'height': height,
      'editorWidth': editorWidth,
      'editorHeight': editorHeight,
      'offsetX': offsetX,
      'offsetY': offsetY
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {

        return res.data
      })
  }
}

export function updateZoomSpan(workspaceId, storyDemoId, screenId, zoomSpanId, startTime, duration, width, height, editorWidth, editorHeight, offsetX, offsetY, authToken) {

  return function (dispatch) {
    return axios.patch(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/zoomSpans/${zoomSpanId}`, {
      'startTime': startTime,
      'duration': duration,
      'width': width,
      'height': height,
      'editorWidth': editorWidth,
      'editorHeight': editorHeight,
      'offsetX': offsetX,
      'offsetY': offsetY
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        let newStep = res.data

        dispatch({
          type: types.UPDATE_ZOOM_SPAN,
          zoomSpan: res.data,
          storyDemoId: storyDemoId,
          screenId: screenId,
        })

        return res.data
      })
  }
}

export function updateScreen(screenUpdateObj, workspaceId, storyDemoId, screenId, authToken) {

  return function (dispatch) {

    return axios.patch(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}`, {
      ...screenUpdateObj
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        let newStep = res.data

        dispatch({
          type: types.UPDATE_SCREEN,
          screen: res.data,
        })

        return res.data
      })
  }
}
