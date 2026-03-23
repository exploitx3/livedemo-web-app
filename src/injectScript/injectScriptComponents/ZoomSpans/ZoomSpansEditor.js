import React, {useEffect, useRef, useState, Fragment} from 'react'
// import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'
import styled from 'styled-components'
import {topPostMessage} from '../../helpers.js'

import ZoomRegionEditor from './components/ZoomRegion/ZoomRegionEditor.js'
import ScreenTypes from "../../../constants/ScreenTypes.js";
import {connect} from "react-redux";
import * as storyDemoActionsImport from '../../../actions/storyDemoActions.js'
import {bindActionCreators} from "redux";

const MAIN_VIEWS = {
  IMAGES: 'IMAGES',
  VIDEO: 'VIDEO',
  IFRAME: 'IFRAME'
}

const HOTSPOT_SIZE = 90


function ZoomSpansEditor({
                     wrapperRef,
                     liveDemo,
                     omniBarHeight,
                     isInEditor,
                     scaleMain,
                     videoRef,
                     currentStep,
                     currentScreen,
                     innerWidth,
                     innerHeight,
                     authData,
                     storyDemoActions
                   }) {


  let [wrapperLeftPos, setWrapperLeftPos] = useState(0)
  let [wrapperTopPos, setWrapperTopPos] = useState(0)

  let scaleWidth = (innerHeight - omniBarHeight) / innerWidth
  let spanWidth = 335.275
  let spanHeight = spanWidth * scaleWidth

  let [showSingleZoomSpan, setShowSingleZoomSpan] = useState(false)

  let initialZoomSpans = (currentStep && currentStep.zoomSpans ? currentStep.zoomSpans.map(span => {

    let newSpan = {
      ...span,
      showed: false,
      triggered: false
    }
    return newSpan
  }) : [])

  if (currentStep && currentStep.zoomSpan) {
    initialZoomSpans.push({
      ...currentStep.zoomSpan,
      showed: true,
      triggered: false
    })
  }

  let isInEditorInternalRef = useRef(isInEditor)

  let spanElementRefs = useRef(initialZoomSpans.reduce((accum, iter) => {
    accum[iter._id] = React.createRef()
    return accum
  }, {}))

  let zoomSpansRef = useRef(initialZoomSpans)
  let [zoomSpans, _setZoomSpans] = useState(initialZoomSpans)

  function setZoomSpans(newZoomSpans) {


    zoomSpansRef.current = newZoomSpans
    _setZoomSpans(newZoomSpans)


    newZoomSpans.forEach(span => {
      if (!spanElementRefs.current[span._id]) {
        spanElementRefs.current[span._id] = React.createRef()
      }
    })

    calculateShowHideZoomSpans()
  }


  // state for selectRegions
  let tabInfoWidth = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerWidth) ? liveDemo.windowMeasures.innerWidth : (liveDemo.tabInfo ? liveDemo.tabInfo.width : 1366)
  let tabInfoHeight = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerHeight) ? liveDemo.windowMeasures.innerHeight : (liveDemo.tabInfo ? liveDemo.tabInfo.height : 664)

  function onChangeHandler(region) {
    // console.log('onChangeHandler called')
    
    let reversePercentageX = tabInfoWidth / innerWidth
    let reversePercentageY = (tabInfoHeight) / (innerHeight - omniBarHeight)

    if (!region.data) {
      region.data = {}
    }


    if (currentStep && currentStep.screenType === ScreenTypes.SCREEN_SCREENSHOT) {

      let delay = region.delay ?? 1
      let duration = region.duration ?? 1

      storyDemoActions.updateStepZoomSpan(liveDemo.workspaceId, liveDemo._id, currentStep.screenId, currentStep._id, region.data._id,
        delay, duration, region.width, region.height, innerWidth, innerHeight, region.x, region.y, authData.token)
        .then(() => {
          console.log('updateStepZoomSpan completed')
        })
    } else {

      topPostMessage({
        type: 'zoomSpan_set',
        id: region.data._id,
        screenType: currentStep.screenType,
        stepId: currentStep._id,
        offsetX: region.x,
        offsetY: region.y,
        width: region.width,
        height: region.height,
        data: region.data,
        editorWidth: innerWidth,
        editorHeight: innerHeight,
        screenId: currentStep.screenId
      })
    }

  }

  useEffect(() => {
    if (wrapperRef && wrapperRef.current && wrapperRef.current.getBoundingClientRect) {
      let wrapperPositions = wrapperRef.current.getBoundingClientRect()

      setWrapperLeftPos(wrapperPositions.left)
      setWrapperTopPos(wrapperPositions.top)
    }

  }, [wrapperRef, wrapperRef.current]);

  useEffect(() => {
    isInEditorInternalRef.current = isInEditor
  }, [isInEditor])

  useEffect(() => {
    if (currentStep && currentStep.zoomSpans) {
      let newZoomSpans = currentStep.zoomSpans.map(span => {

        if (!spanElementRefs.current[span._id]) {
          spanElementRefs.current[span._id] = React.createRef()
        }

        let newSpan = {
          ...span,
          showed: false,
          triggered: false
        }
        return newSpan
      })


      setZoomSpans(newZoomSpans)
    } else if (currentStep && currentStep.zoomSpan) {

      let newSpan = {
        ...currentStep.zoomSpan,
        showed: true,
        triggered: false
      }

      if (!spanElementRefs.current[newSpan._id]) {
        spanElementRefs.current[newSpan._id] = React.createRef()
      }
      setZoomSpans([
        newSpan
      ])

      console.log(`- newSpan - ${JSON.stringify(newSpan)}`)

    } else {
      setZoomSpans([])
    }

  }, [currentStep])


  useEffect(() => {
    if (videoRef.current) {
      attachVideoTimeChangeHandler(videoRef.current)
    }

  }, [videoRef.current])


  function calculateShowHideZoomSpans() {
    if (!videoRef || !videoRef.current) {
      return
    }

    let timestampInSeconds = videoRef.current.currentTime
    console.log('timestampInSeconds: ' + timestampInSeconds)

    zoomSpansRef.current.forEach((zoomSpan) => {

      if(!spanElementRefs.current[zoomSpan._id] || !spanElementRefs.current[zoomSpan._id].current) {
        return
      }

      if(currentStep.screenType !== ScreenTypes.SCREEN_VIDEO && currentStep.zoomSpan) {
        showZoomSpan(zoomSpan)
        return
      }

      if (
        !currentStep.zoomSpan &&
        timestampInSeconds >= zoomSpan.startTime &&
        timestampInSeconds <= zoomSpan.startTime + zoomSpan.duration
      ) {

        if (isInEditorInternalRef.current) {

          showZoomSpan(zoomSpan)
        } else {

          triggerScaleForZoomSpan(zoomSpan)
          zoomSpan.triggered = true
        }

      } else {

        hideZoomSpan(zoomSpan)
        rescaleZoomSpan(zoomSpan)
      }
    })

  }

  function attachVideoTimeChangeHandler(video) {
    video.addEventListener('timeupdate', onVideoTimeChange)
    video.addEventListener('ended', onVideoEnded)
  }

  function onVideoEnded() {
    zoomSpansRef.current.forEach((zoomSpan) => {
      rescaleZoomSpan(zoomSpan)
    })
  }

  function onVideoTimeChange(event) {
    calculateShowHideZoomSpans()
  }

  function showZoomSpan(zoomSpan) {
    if (zoomSpan && !zoomSpan.showed) {
      let boxRef = spanElementRefs.current[zoomSpan._id]

      boxRef.current.style.visibility = 'visible'
      zoomSpan.showed = true
    }
  }

  function hideZoomSpan(zoomSpan) {
    if (zoomSpan && zoomSpan.showed) {
      let boxRef = spanElementRefs.current[zoomSpan._id]

      boxRef.current.style.visibility = 'hidden'
      zoomSpan.showed = false


      scaleMain(1, 0, 0)
      zoomSpan.triggered = false
    }
  }

  function rescaleZoomSpan(zoomSpan) {
    if (zoomSpan && zoomSpan.triggered) {

      scaleMain(1, 0, 0)
      zoomSpan.triggered = false
    }
  }

  function triggerScaleForZoomSpan(zoomSpan) {
    if(!zoomSpan) {
      return
    }

    if (zoomSpan.triggered) {
      return
    }

    let boxRef = spanElementRefs.current[zoomSpan._id]
    let boxRefCordinates = boxRef.current.getBoundingClientRect()
    let scaleValue = innerWidth / boxRefCordinates.width
    let left = boxRefCordinates.left
    let top = boxRefCordinates.top - omniBarHeight

    scaleMain(scaleValue, left, top)

  }


  return (<ZS.RegionsWrapper>
      <Fragment>
        {zoomSpans.map((span, index) => {
          console.log('span')
          console.log(span)
          return <ZoomRegionEditor
            key={span._id}
            initBoxWidth={span.width}
            showed={span.showed}
            x={span.offsetX}
            y={span.offsetY}
            delay={span.delay}
            duration={span.duration}
            data={span}
            scaleWidth={scaleWidth}
            editorWidth={span.editorWidth}
            editorHeight={span.editorHeight}
            omniBarHeight={omniBarHeight}
            onChangeHandler={onChangeHandler}
            scaleMain={scaleMain}
            innerWidth={innerWidth}
            innerHeight={innerHeight}
            ref={spanElementRefs.current[span._id]}
            wrapperRef={wrapperRef}
            wrapperLeftPos={wrapperLeftPos}
            wrapperTopPos={wrapperTopPos}
            isScreenshot={currentStep && currentStep.screenType === ScreenTypes.SCREEN_SCREENSHOT}

          />
        })}
      </Fragment>
    </ZS.RegionsWrapper>
  )
}

const ZS = {
  RegionsWrapper: styled.div`
    && {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
        // width: ${({fullWidth}) => fullWidth}px;
        // height: ${({fullHeight}) => fullHeight}px;
      transform-origin: top left;
        // transform: scaleX(${(props) => `${props.scalePercentageWidth}`}) scaleY(${(props) => `${props.scalePercentageHeight}`});

    }

    && > div > div > div:nth-child(2) {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: -1;
    }
  `,

}


function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    storyDemoActions: bindActionCreators(storyDemoActionsImport, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ZoomSpansEditor)
