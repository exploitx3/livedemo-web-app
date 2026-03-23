import * as types from '../constants/actionTypes'

export function runWalkthrough(pathname) {
  return function(dispatch) {

    return dispatch({
      type: types.RUN_WALKTHROUGH,
      pathname: pathname
    })
  }
}

export function endWalkthrough() {
  return function(dispatch) {

    return dispatch({
      type: types.END_WALKTHROUGH
    })
  }
}

export function changeStep(pathname, stepIndex) {
  
  return function(dispatch) {

    return dispatch({
      type: types.CHANGE_STEP,
      pathname: pathname,
      stepIndex: stepIndex
    })
  }
}

/**
 * Takes an object as parameter
 *
 * @param propObj
 * @return {function(*): *}
 */
export function changeProp(propObj) {
  
  return function(dispatch) {

    return dispatch({
      type: types.CHANGE_PROP_OBJECT,
      propObj: propObj
    })
  }
}
