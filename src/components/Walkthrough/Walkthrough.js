import React from 'react'
import { connect } from 'react-redux'
import Joyride from 'react-joyride'

import { getCallbackHandler, getSteps } from './steps'
import { getCallbackHandlerMobile, getStepsMobile } from './mobileSteps'

import { changeStep, endWalkthrough, changeProp } from '../../actions/walkthroughActions'
import { bindActionCreators } from 'redux'
import mainColors from '../../constants/mainColors'

export const Walkthrough = ({menuCollapsed, collapseMenu, isMobile, walkthrough, actions }) => {



  const steps = isMobile ?  getStepsMobile(walkthrough.pathname) : getSteps(walkthrough.pathname)
  const callback = isMobile ? getCallbackHandlerMobile(walkthrough.pathname, actions, menuCollapsed, collapseMenu) : getCallbackHandler(walkthrough.pathname, actions)
  return (
    <Joyride
      steps={steps}
      run={walkthrough.run}
      stepIndex={walkthrough.stepIndex}
      continuous={true}
      scrollToFirstStep={false}
      disableOverlay={walkthrough.propObj.disableOverlay !== undefined ? walkthrough.propObj.disableOverlay : false}
      disableScrolling={walkthrough.propObj.disableScrolling !== undefined ? walkthrough.propObj.disableScrolling : true}

      scrollOffset={0}
      showProgress={true}
      showSkipButton={true}
      callback={callback}
      spotlightClicks={walkthrough.propObj.spotlightClicks !== undefined ? walkthrough.propObj.spotlightClicks : true}
      floaterProps={{
        styles: {
          wrapper: {
            zIndex: 1000,
          },
        },
      }}
      styles={{
        options: {
          arrowColor: mainColors.primaryColor,
          backgroundColor: 'white',
          // overlayColor: 'rgba(79, 26, 0, 0.4)',
          primaryColor: mainColors.primaryColor,
          // textColor: '#004a14',
          zIndex: 1000,
        }
      }}
    />
  )
}

const mapStateToProps = state => {

  return {
    walkthrough: state.walkthroughReducer,
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
      endWalkthrough: endWalkthrough,
      changeStep: changeStep,
      changeProp: changeProp
    }
    , dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Walkthrough)
