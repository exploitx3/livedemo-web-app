
import { RUN_WALKTHROUGH, END_WALKTHROUGH, CHANGE_STEP, CHANGE_PROP_OBJECT } from '../constants/actionTypes'

import initialState from './initialState'


export default function walkthroughReducer(state = initialState.walkthroughReducer, action) {
  
  switch (action.type) {
    case RUN_WALKTHROUGH:


      return {
        ...state,
        run: true,
        pathname: action.pathname
      }
    case CHANGE_STEP:

      
      return {
        ...state,
        run: true,
        pathname: action.pathname,
        stepIndex: action.stepIndex
      }

    case CHANGE_PROP_OBJECT:
      return {
        ...state,
        run: false,
        propObj: action.propObj,
      }


    case END_WALKTHROUGH:
      return {
        ...state,
        run: false,
        stepIndex: 0,
        propObj: initialState.walkthroughReducer.propObj,
      }


    default:
      return state
  }
}
