import {
  ADD_STEP,
  ADD_STEP_ZOOM_SPAN,
  ADD_TRANSITION,
  DELETE_STEP,
  DELETE_STEP_ZOOM_SPAN,
  DELETE_TRANSITION,
  UPDATE_RENDER_STEPS,
  UPDATE_STEP,
  UPDATE_STEP_ZOOM_SPAN,
  UPDATE_STORY_DEMO,
  UPDATE_SCREEN,
  UPDATE_TRANSITION,
  UPDATE_ZOOM_SPAN,
  DELETE_STEP_AUDIO,
  ADD_STEP_AUDIO
} from '../constants/actionTypes'

import initialState from './initialState'

export default function storyDemoReducer(state = initialState.storyDemoReducer, action) {
  let newState = JSON.parse(JSON.stringify(state))

  switch (action.type) {

    case ADD_STEP:
      let newStep = action.step
      let addStepScreenId = action.screenId

      newState.currentStoryDemo.screens = newState.currentStoryDemo.screens.map(screen => {

        if (screen._id === addStepScreenId) {
          screen.steps.push(newStep)
        }

        return screen
      })

      return {
        ...newState,
      }
    case DELETE_STEP:
      let deleteStepId = action.stepId
      let deleteStepScreenId = action.screenId

      newState.currentStoryDemo.screens = newState.currentStoryDemo.screens.map(screen => {

        if (screen._id === deleteStepScreenId) {
          screen.steps = screen.steps.filter(step => step._id !== deleteStepId)
        }

        return screen
      })

      return {
        ...newState,
      }
    case UPDATE_STEP:

      let updateStep = JSON.parse(JSON.stringify(action.step))
      let updateStepScreenId = action.screenId

      newState.currentStoryDemo.screens = JSON.parse(JSON.stringify(newState.currentStoryDemo)).screens.map(screen => {

        if (screen._id === updateStepScreenId) {
          screen.steps = screen.steps.map(step => {
            if (step._id === updateStep._id) {

              return {
                ...step,
                action: updateStep.action,
                view: updateStep.view,
                autoPlayConfig: updateStep.autoPlayConfig
              }
            } else {

              return step
            }
          })
        }

        return screen
      })

      return {
        ...newState,
      }
    case UPDATE_SCREEN:
      let newScreen = JSON.parse(JSON.stringify(action.screen))

      newState.currentStoryDemo.screens = newState.currentStoryDemo.screens.map(screen => {

        // I am updating the screen by single properties to skip updating zoomSpans which have
        // additional fields attached from the front-end to show or hide them
        if (screen._id === newScreen._id) {
          return {...screen,
            startTime: newScreen.startTime,
            endTime: newScreen.endTime,
            duration: newScreen.duration,
            playbackRate: newScreen.playbackRate,
            name: newScreen.name
          }
        }

        return screen
      })

      return {
        ...newState,
      }
    case ADD_TRANSITION:
      let newTransition = action.transition
      let addTransitionScreenId = action.screenId

      newState.currentStoryDemo.screens = newState.currentStoryDemo.screens.map(screen => {

        if (screen._id === addTransitionScreenId) {
          screen.customTransitions.push(newTransition)
        }

        return screen
      })

      return {
        ...newState,
      }
    case DELETE_TRANSITION:
      let transitionId = action.transitionId
      let deleteScreenId = action.screenId

      newState.currentStoryDemo.screens = newState.currentStoryDemo.screens.map(screen => {

        if (screen._id === deleteScreenId) {
          screen.customTransitions = screen.customTransitions.filter(transition => transition._id !== transitionId)
        }

        return screen
      })

      return {
        ...newState,
      }
    case UPDATE_TRANSITION:

      let updatedTransition = action.transition
      newState.currentStoryDemo.screens = JSON.parse(JSON.stringify(newState.currentStoryDemo.screens)).map(screen => {
        screen.customTransitions = JSON.parse(JSON.stringify(screen.customTransitions)).map(transition => {
          if (transition._id === updatedTransition._id) {
            return updatedTransition
          } else {

            return transition
          }
        })

        return screen
      })

      return {
        ...newState,
      }
    case UPDATE_STORY_DEMO:

      return {
        ...newState,
        currentStoryDemo: {
          ...action.storyDemo,
          screens: JSON.parse(JSON.stringify(action.storyDemo.screens))
        }
      }
    case UPDATE_RENDER_STEPS:

      return {
        ...newState,
        renderSteps: JSON.parse(JSON.stringify(action.renderSteps))
      }
    case ADD_STEP_ZOOM_SPAN:
      let addStepZoomSpan = JSON.parse(JSON.stringify(action.zoomSpan))

      newState.currentStoryDemo.screens = JSON.parse(JSON.stringify(newState.currentStoryDemo)).screens.map(screen => {

        if (screen._id === action.screenId) {
          screen.steps = screen.steps.map(step => {
            if (step._id === action.stepId) {

              return {
                ...step,
                zoomSpan: addStepZoomSpan
              }
            } else {

              return step
            }
          })
        }

        return screen
      })

      return {
        ...newState,
      }
    case DELETE_STEP_ZOOM_SPAN:

      newState.currentStoryDemo.screens = JSON.parse(JSON.stringify(newState.currentStoryDemo)).screens.map(screen => {

        if (screen._id === action.screenId) {
          screen.steps = screen.steps.map(step => {
            if (step._id === action.stepId) {

              return {
                ...step,
                zoomSpan: null
              }
            } else {

              return step
            }
          })
        }

        return screen
      })

      return {
        ...newState,
      }
    case UPDATE_STEP_ZOOM_SPAN:
      let updateStepZoomSpan = JSON.parse(JSON.stringify(action.zoomSpan))

      newState.currentStoryDemo.screens = JSON.parse(JSON.stringify(newState.currentStoryDemo)).screens.map(screen => {

        if (screen._id === action.screenId) {
          screen.steps = screen.steps.map(step => {
            if (step._id === action.stepId) {

              return {
                ...step,
                zoomSpan: updateStepZoomSpan
              }
            } else {

              return step
            }
          })
        }

        return screen
      })

      return {
        ...newState,
      }
    case UPDATE_ZOOM_SPAN:
      let updateVideoZoomSpan = JSON.parse(JSON.stringify(action.zoomSpan))

      newState.currentStoryDemo.screens = JSON.parse(JSON.stringify(newState.currentStoryDemo)).screens.map(screen => {

        if (screen._id === action.screenId) {


          let newZoomSpans = JSON.parse(JSON.stringify(screen.zoomSpans))
          newZoomSpans = newZoomSpans.map(iterSpan => {

            if (iterSpan._id === action.zoomSpan._id) {

              return updateVideoZoomSpan
            } else {

              return iterSpan
            }
          })

          return {
            ...screen,
            zoomSpans: newZoomSpans
          }
        } else {

          return screen
        }
      })

      return {
        ...newState,
      }
    case DELETE_STEP_AUDIO:

      newState.currentStoryDemo.screens = JSON.parse(JSON.stringify(newState.currentStoryDemo)).screens.map(screen => {

        if (screen._id === action.screenId) {
          screen.steps = screen.steps.map(step => {
            if (step._id === action.stepId) {

              return {
                ...step,
                stepAudioId: null
              }
            } else {

              return step
            }
          })
        }

        return screen
      })

      return {
        ...newState,
      }
    case ADD_STEP_AUDIO:
      let audioDoc = JSON.parse(JSON.stringify(action.audioDoc))

      newState.currentStoryDemo.screens = JSON.parse(JSON.stringify(newState.currentStoryDemo)).screens.map(screen => {
        if (screen._id === action.screenId) {
          screen.steps = screen.steps.map(step => {
            if (step._id === action.stepId) {

              return {
                ...step,
                stepAudioId: audioDoc
              }
            } else {

              return step
            }
          })
        }

        return screen
      })

      return {
        ...newState,
      }

    default:
      return newState
  }
}
