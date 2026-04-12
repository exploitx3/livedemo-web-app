import React, {useEffect, useRef, useState} from 'react'
import styled from 'styled-components'
import Colors from '../../constants/mainColors'
import {MdOutlineZoomIn, MdPause} from 'react-icons/md'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css' // optional
// import 'tippy.js/animations/shift-away.css'
import 'tippy.js/animations/scale.css'
import {followCursor} from 'tippy.js'
import axios from '../../utils/axiosInstance'
import * as ENV from '../../config'
import * as storyDemoActionsImport from '../../actions/storyDemoActions'

import ZoomSpan from './components/ZoomSpan/ZoomSpan'
import {connect} from 'react-redux'
import {bindActionCreators} from "redux";


const HANDLER_TYPES = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TRACKER: 'TRACKER',
}

function Tip({children, ...props}) {

  return <S.Tippy {...props}>{children}</S.Tippy>
}

const VideoEditor = (props) => {
  let {
    workspaceId,
    storyDemoId,
    currentScreen,
    omniBarHeight,
    setStoryDemo,
    updateZoomSpans,
    updateScreen,
    authData,
    innerHeight,
    innerWidth,
    storyDemoActions
  } = props

  // console.log('videoEditro currentScreen')
  // console.log(currentScreen)


  let [isPlaying, setIsPlaying] = useState(false)

  let [videoPercentageTime, setVideoPercentageTime] = useState(0)
  let [videoSpeed, setVideoSpeed] = useState(currentScreen && currentScreen.playbackRate ? currentScreen.playbackRate : 1)

  let leftHandleRef = useRef(null)
  let rightHandleRef = useRef(null)

  let leftHandleInitXPos = useRef(0)
  let [leftHandleInitXPosState, setLeftHandleInitXPosState] = useState(0)
  let rightHandleInitXPos = useRef(0)
  let [rightHandleInitXPosState, setRightHandleInitXPosState] = useState(0)

  let leftHandleXPos = useRef(0)
  let rightHandleXPos = useRef(0)


  let videoInternalRef = useRef(null)
  let [videoCurrentTime, setVideoCurrentTime] = useState(0)
  // let [videoDuration, setVideoDuration] = useState(currentScreen.asset.duration)
  let videoDurationRef = useRef(currentScreen && currentScreen.asset && currentScreen.asset.duration ? currentScreen.asset.duration : 0)
  let trackerRef = useRef(null)
  let internalTimelineRef = useRef(null)
  let internalTimelineLeftPosition = useRef(0)
  let internalTimelineRightPosition = useRef(0)
  let [trackerPosition, setTrackerPosition] = useState(0)

  let [videoStartTime, setVideoStartTime] = useState(currentScreen?.startTime ? currentScreen.startTime : 0)
  let [videoEndTime, setVideoEndTime] = useState(currentScreen?.endTime ? currentScreen.endTime : ((currentScreen?.asset?.duration) || 0))


  let _videoTimeChangeAttached = useRef(false)


  let [isTippyDisabled, setIsTippyDisabled] = useState(false)


  let [zoomSpans, _setZoomSpans] = useState((currentScreen && currentScreen.zoomSpans) ? currentScreen.zoomSpans : [])


  function setZoomSpans(newZoomSpans) {

    if (newZoomSpans) {

      updateZoomSpans(newZoomSpans, currentScreen._id)
    }

    _setZoomSpans(newZoomSpans)
  }


  let zoomSpanRefs = useRef({})

  function attachVideoTimeChangeHandler(video) {
    if (!_videoTimeChangeAttached.current) {
      video.addEventListener('timeupdate', onVideoTimeChange)
      video.addEventListener('ended', () => {
        setIsPlaying(false)
      })
    }

  }

  useEffect(() => {

    if(!videoInternalRef.current) {
      return
    }

    let width = internalTimelineRightPosition.current - internalTimelineLeftPosition.current - 4
    //
    // let timestampInSeconds = event.timeStamp / 10000
    // let timestampPercentage = timestampInSeconds / event.currentTarget.duration
    // let singleMarginSize = (event.currentTarget.duration / width)
    // let newMargin =  (width * timestampPercentage)

    // let timestampInSeconds = videoInternalRef.current.currentTime
    // let timePercentage = videoInternalRef.current.currentTime / videoInternalRef.current.duration
    // let newMargin = width * timePercentage

    let newMargin = width * videoPercentageTime
    trackerRef.current.style.marginLeft = newMargin + 'px'
  }, [videoPercentageTime])

  function onVideoTimeChange(event) {
    console.log(event)

    let width = internalTimelineRightPosition.current - internalTimelineLeftPosition.current - 4
    //
    // let timestampInSeconds = event.timeStamp / 10000
    // let timestampPercentage = timestampInSeconds / event.currentTarget.duration
    // let singleMarginSize = (event.currentTarget.duration / width)
    // let newMargin =  (width * timestampPercentage)

    let timestampInSeconds = videoInternalRef.current.currentTime
    let timePercentage = videoInternalRef.current.currentTime / videoInternalRef.current.duration
    setVideoPercentageTime(timePercentage)

    // let newMargin = width * timePercentage

    // console.log('timestampInSeconds')
    // console.log(timestampInSeconds)
    // console.log('newMargin')
    // console.log(newMargin)


    // trackerRef.current.style.marginLeft = newMargin + 'px'
  }

  function findVideoRef(frame, videoInternalRef, repeatCount) {

    function searchForVideo() {

      try {
        if (frame.videoRef) {

          console.log('videoRef found returning')
          videoInternalRef.current = frame.videoRef.current
          setVideoCurrentTime(frame.videoRef.current.currentTime)
          // setVideoDuration(frame.videoRef.current.duration)
          // videoDurationRef.current = frame.videoRef.current.duration

          attachVideoTimeChangeHandler(frame.videoRef.current)

          return true
        } else {

          return false
        }
      } catch (err) {

        return false
      }

    }

    if (repeatCount >= 20) {
      console.log('videoRef NOT found returning')
      return null
    } else {


      let result = searchForVideo()

      if (result) {
        return result
      } else {

        setTimeout(() => {

          return findVideoRef(frame, videoInternalRef, ++repeatCount)

        }, 1500)
      }


    }
  }

  useEffect(() => {


    findVideoRef(window, videoInternalRef, 0)


  }, [window])


  useEffect(() => {
    if (internalTimelineRef.current) {
      setupTimelinePositions()
    }
  }, [internalTimelineRef.current])

  useEffect(() => {

    if (leftHandleRef.current && rightHandleRef.current && internalTimelineRef.current) {

      let initTimelineCords = internalTimelineRef.current.getBoundingClientRect()

      leftHandleInitXPos.current = initTimelineCords.left
      rightHandleInitXPos.current = initTimelineCords.right
      leftHandleXPos.current = leftHandleRef.current.getBoundingClientRect().left
      rightHandleXPos.current = rightHandleRef.current.getBoundingClientRect().left

      setLeftHandleInitXPosState(leftHandleInitXPos.current)
      setRightHandleInitXPosState(rightHandleInitXPos.current)
    }

  }, [leftHandleInitXPos.current, rightHandleInitXPos.current])


  useEffect(() => {


    if (currentScreen && currentScreen.playbackRate) {

      setVideoSpeed(currentScreen.playbackRate)
    }

    if (currentScreen && currentScreen.zoomSpans) {

      _setZoomSpans(currentScreen.zoomSpans)
    } else {

      _setZoomSpans([])
    }

    if (currentScreen && currentScreen.asset && currentScreen.asset.duration) {
      // Reset tracker
      setVideoPercentageTime(0)

      videoDurationRef.current = currentScreen.asset.duration

      if (window) {
        findVideoRef(window, videoInternalRef, 0)
      }
    }

    if (currentScreen &&
      currentScreen.asset &&
      leftHandleRef.current &&
      rightHandleRef.current &&
      trackerRef.current &&
      internalTimelineRef.current) {
      let initTimelineCords = internalTimelineRef.current.getBoundingClientRect()

      console.log('videoStartTime')
      console.log(videoStartTime)
      let localStartTime = currentScreen?.startTime ? currentScreen.startTime : 0
      let localEndTime = currentScreen?.endTime ? currentScreen.endTime : ((currentScreen?.asset?.duration) || 0)


      setVideoStartTime(localStartTime)
      setVideoEndTime(localEndTime)

      // use already set-up value to avoid resetting to original screen state
      // this could be fixed if backend returns the screen and I update the state
      // if(videoStartTime) {
      //   setVideoStartTime(localStartTime)
      // }
      // if(videoEndTime) {
      //   setVideoEndTime(localEndTime)
      // }

      let duration = currentScreen.asset.duration


      let leftCordinates = leftHandleRef.current.getBoundingClientRect().left
      let rightCordinates = rightHandleRef.current.getBoundingClientRect().right
      let timelineWidth = rightCordinates - leftCordinates

      let initTimelineWidth = initTimelineCords.width

      let leftMargin = (localStartTime / duration) * initTimelineWidth

      let newMargin = Math.max(leftMargin, 0)
      // let newMargin = Math.max(leftMargin, -16)

      let newLeftPosition = initTimelineCords.left + newMargin

      if (newLeftPosition >= initTimelineCords.right - 36) {
        newLeftPosition = initTimelineCords.right - 36

        newMargin = newLeftPosition - initTimelineCords.left.current
      }
      // debugger
      leftHandleRef.current.style.marginLeft = newMargin + 'px'

      leftHandleXPos.current = initTimelineCords.left + newMargin

      // calculate new time after resize
      let newTrackerMargin = newMargin + 16
      // let newTime = videoDurationRef.current * (newTrackerMargin / width)


      // trackerRef.current.style.marginLeft = newTrackerMargin + 'px'
      // videoInternalRef.current.currentTime = newTime

      // setup right handler
      let newRightMargin = Math.max((Math.abs((localEndTime) - duration) / duration) * initTimelineWidth, 0) - 16

      let newRightPosition = rightHandleInitXPos.current - newRightMargin

      if (newRightPosition <= leftHandleXPos.current + 36) {
        newRightPosition = leftHandleXPos.current + 36

        newRightMargin = rightHandleInitXPos.current - newRightPosition
      }

      rightHandleXPos.current = newRightPosition

      rightHandleRef.current.style.marginRight = newRightMargin + 'px'
      setupTimelinePositions()

    }

  }, [currentScreen])

  useEffect(() => {

    function messageHandler(event) {
      if (event.data.type && event.data.type === 'zoomSpan_set') {



        console.log('zoomSpan_set')
        console.log('event.data')
        console.log(event.data)

        let updateZoomSpan = {
          'width': event.data.width,
          // 'height': event.data.height, // TODO: height not needed because using width I can calculate a square zoom
          'editorWidth': event.data.editorWidth,
          'editorHeight': event.data.editorHeight,
          'offsetX': event.data.offsetX,
          'offsetY': event.data.offsetY
        }


        storyDemoActions.updateZoomSpan(
          workspaceId,
          storyDemoId,
          event.data.screenId,
          event.data.id,
          updateZoomSpan.startTime,
          updateZoomSpan.duration,
          updateZoomSpan.width,
          updateZoomSpan.height,
          updateZoomSpan.editorWidth,
          updateZoomSpan.editorHeight,
          updateZoomSpan.offsetX,
          updateZoomSpan.offsetY,
          authData.token
        )
        // .then((updatedZoomSpanDoc) => {
        //
        //   let newScreen = {...currentScreen}
        //   if (newScreen && newScreen.zoomSpans.length) {
        //     newScreen.zoomSpans = newScreen.zoomSpans.map(span => {
        //       if (span._id === updatedZoomSpanDoc._id) {
        //         return updatedZoomSpanDoc
        //       } else {
        //         return span
        //       }
        //     })
        //
        //
        //     updateScreen(newScreen)
        //
        //     console.log('video zoomSpan updated')
        //     console.log(updatedZoomSpanDoc)
        //   }
        // })

      }
    }

    window.addEventListener('message', messageHandler)

    if (window) {
      findVideoRef(window, videoInternalRef, 0)
    }


    return () => {
      window.removeEventListener('message', messageHandler)
    }

  }, [])


  function onChangeVideoSpeed() {
    let newVideoSpeed = videoSpeed + 0.5
    if (newVideoSpeed > 3) {
      newVideoSpeed = 0.5
    }

    setVideoSpeed(newVideoSpeed)

    let updateObj = {
      playbackRate: newVideoSpeed
    }

    screenVideoTrackerChange(workspaceId, storyDemoId, currentScreen._id, updateObj, authData.token)
  }

  function resizeMove(type) {

    return function (e) {

      const el = type === HANDLER_TYPES.LEFT ? leftHandleRef.current : (type === HANDLER_TYPES.RIGHT ? rightHandleRef.current : trackerRef.current)
      let elCordinates = el.getBoundingClientRect()


      let newBoxWidth, newBoxHeight, offsetMarginX, offsetMarginY, offsetX, offsetY

      let newMargin = e.clientX - leftHandleInitXPos.current

      if (type === HANDLER_TYPES.LEFT) {


        let newMargin = Math.max(e.clientX - leftHandleInitXPos.current, -16)

        let newLeftPosition = leftHandleInitXPos.current + newMargin

        if (newLeftPosition >= rightHandleXPos.current - 36) {
          newLeftPosition = rightHandleXPos.current - 36

          newMargin = newLeftPosition - leftHandleInitXPos.current
        }

        el.style.marginLeft = newMargin + 'px'

        leftHandleXPos.current = leftHandleInitXPos.current + newMargin
        let width = internalTimelineRightPosition.current - internalTimelineLeftPosition.current - 4

        // calculate new time after resize
        let newTrackerMargin = newMargin
        let newTime = videoDurationRef.current * (newTrackerMargin / width)

        trackerRef.current.style.marginLeft = newTrackerMargin + 'px'
        videoInternalRef.current.currentTime = newTime

        setupTimelinePositions()

      } else if (type === HANDLER_TYPES.RIGHT) {

        let newMargin = Math.max(rightHandleInitXPos.current - e.clientX, -16)

        let newRightPosition = rightHandleInitXPos.current - newMargin

        if (newRightPosition <= leftHandleXPos.current + 36) {
          newRightPosition = leftHandleXPos.current + 36

          newMargin = rightHandleInitXPos.current - newRightPosition
        }

        rightHandleXPos.current = newRightPosition

        el.style.marginRight = newMargin + 'px'
        setupTimelinePositions()

      } else if (type === HANDLER_TYPES.TRACKER) {
        let newMargin = Math.max(e.clientX - internalTimelineLeftPosition.current, -0)

        let newTrackerPosition = internalTimelineLeftPosition.current + newMargin

        if (newTrackerPosition >= internalTimelineRightPosition.current - 4) {
          newTrackerPosition = internalTimelineRightPosition.current - 4

          newMargin = internalTimelineRightPosition.current - internalTimelineLeftPosition.current - 4
        }

        el.style.marginLeft = newMargin + 'px'

        setTrackerPosition(internalTimelineLeftPosition.current + newMargin)

        let width = internalTimelineRightPosition.current - internalTimelineLeftPosition.current - 4
        let oneMarginValue = videoInternalRef.current.duration / width

        let newTime = newMargin * oneMarginValue

        videoInternalRef.current.currentTime = newTime

      }
    }
  }

  function setupTimelinePositions() {
    let cordinates = internalTimelineRef.current.getBoundingClientRect()
    internalTimelineLeftPosition.current = cordinates.left
    internalTimelineRightPosition.current = cordinates.left + cordinates.width
  }

  function resizeAdd(type) {

    return function (e) {


      let resizeMoveFunction = resizeMove(type)
      window.document.addEventListener('mousemove', resizeMoveFunction)
      window.document.addEventListener('mouseup', resizeRemoveClosure(resizeMoveFunction, type))
    }
  }

  function resizeRemoveClosure(resizeMoveFunction, type) {
    return function onRemove(e) {


      window.document.removeEventListener('mousemove', resizeMoveFunction)
      window.document.removeEventListener('mouseup', onRemove)

      // skip story update if tracker was changed
      if (type === HANDLER_TYPES.TRACKER) {
        return
      }

      let leftHandleCordinates = leftHandleRef.current.getBoundingClientRect()
      let rightHandleCordinates = rightHandleRef.current.getBoundingClientRect()
      // let cordinates = trackerRef.current.getBoundingClientRect()
      let left = leftHandleCordinates.left
      let right = rightHandleCordinates.right - 16

      // let timelineWidth = rightHandleInitXPos.current - leftHandleInitXPos.current
      let timelineWidth = internalTimelineRef.current.getBoundingClientRect().width

      let startTime = ((left - leftHandleInitXPos.current) / timelineWidth) * videoDurationRef.current
      let endTime = ((right - leftHandleInitXPos.current) / timelineWidth) * videoDurationRef.current

      let updateObj = {
        startTime,
        endTime
      }

      setVideoStartTime(startTime)
      setVideoEndTime(endTime)
      screenVideoTrackerChange(workspaceId, storyDemoId, currentScreen._id, updateObj, authData.token)
    }
  }

  function onTimeLineClick(e) {

    let newMargin = e.clientX - internalTimelineLeftPosition.current

    let width = internalTimelineRightPosition.current - internalTimelineLeftPosition.current

    let newTime = videoDurationRef.current * (newMargin / width)

    console.log(newMargin)
    console.log(newTime)

    trackerRef.current.style.marginLeft = newMargin + 'px'
    videoInternalRef.current.currentTime = newTime
  }

  function createZoomSpan(workspaceId, storyDemoId, screenId, startTime, duration, width, height, editorWidth, editorHeight, offsetX, offsetY, authToken) {

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

  function deleteZoomSpan(workspaceId, storyDemoId, screenId, zoomSpanId, authToken) {

    return axios.delete(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/zoomSpans/${zoomSpanId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {

        return res.data
      })
  }

  function updateVideoZoomSpan(workspaceId, storyDemoId, screenId, zoomSpanId, newZoomSpan, authToken) {
    return axios.patch(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/zoomSpans/${zoomSpanId}`, {
      'startTime': newZoomSpan.startTime,
      'duration': newZoomSpan.duration,
      'width': newZoomSpan.width,
      'height': newZoomSpan.height,
      'editorWidth': newZoomSpan.editorWidth,
      'editorHeight': newZoomSpan.editorHeight,
      'offsetX': newZoomSpan.offsetX,
      'offsetY': newZoomSpan.offsetY
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {

        return res.data
      })
  }

  function updateStepZoomSpan(workspaceId, storyDemoId, screenId, stepId, zoomSpanId, newZoomSpan, authToken) {
    return axios.patch(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${stepId}/zoomSpans/${zoomSpanId}`, {
      'delay': newZoomSpan.delay,
      'duration': newZoomSpan.duration,
      'width': newZoomSpan.width,
      'height': newZoomSpan.height,
      'editorWidth': newZoomSpan.editorWidth,
      'editorHeight': newZoomSpan.editorHeight,
      'offsetX': newZoomSpan.offsetX,
      'offsetY': newZoomSpan.offsetY
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {

        return res.data
      })
  }

  function screenVideoTrackerChange(workspaceId, storyDemoId, screenId, updateObj, authToken) {

    return storyDemoActions.updateScreen(workspaceId, storyDemoId, screenId, updateObj.startTime, updateObj.endTime, updateObj.playbackRate, authToken)
  }

  let videoDurationExists = videoDurationRef.current !== 0

  return (
    <S.Wrapper>
      <S.VideoWrapper>
        {!isPlaying ? (
          <S.Button
            style={{marginRight: 5}}
            onClick={() => {

              setIsPlaying(true)

              if (!videoInternalRef.current.ended) {

                videoInternalRef.current.play()
              } else {
                videoInternalRef.current.currentTime = 0

                videoInternalRef.current.play()
              }
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_0_3)">
                <path
                  d="M4.69159 2.94011C4.39202 2.74947 4 2.96466 4 3.31975V8.68025C4 9.03534 4.39202 9.25053 4.69159 9.05989L8.90341 6.37965C9.18128 6.20282 9.18129 5.79718 8.90341 5.62035L4.69159 2.94011Z"
                  fill="black"/>
              </g>
              <defs>
                <clipPath id="clip0_0_3">
                  <rect width="12" height="12" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </S.Button>
        ) : (
          <S.PauseButton
            style={{marginRight: 5}}
            onClick={() => {
              videoInternalRef.current.pause()
              setIsPlaying(false)
            }}/>
        )}


        <S.TimelineWrapper>
          <S.ZoomContainer>
            {videoDurationExists && zoomSpans.map((span, index) => {

              let timelineWidth = internalTimelineRightPosition.current - internalTimelineLeftPosition.current

              let initialMarginLeft = timelineWidth * (span.startTime / videoDurationRef.current)
              let spanWidth = timelineWidth * (span.duration / videoDurationRef.current)

              return <ZoomSpan
                key={span._id}
                startTime={span.startTime}
                duration={span.duration}
                videoDuration={videoDurationRef.current}
                ref={(ref) => {
                  zoomSpanRefs.current[index] = ref

                }
                }
                deleteZoomSpan={() => {

                  deleteZoomSpan(workspaceId, storyDemoId, currentScreen._id, span._id, authData.token)
                    .then((data) => {
                      let newZoomSpans = JSON.parse(JSON.stringify(zoomSpans))
                      newZoomSpans = newZoomSpans.filter(iterSpan => iterSpan._id !== span._id)

                      setZoomSpans(newZoomSpans)

                      return data
                    })
                }
                }
                spanWidth={spanWidth}
                onTimeLineClick={onTimeLineClick}
                initialMarginLeft={initialMarginLeft}
                leftHandleTopInitXPos={leftHandleInitXPosState}
                rightHandleTopInitXPos={rightHandleInitXPosState}
                data={span}
                onChange={(newZoomSpan) => {

                  storyDemoActions.updateZoomSpan(
                    workspaceId,
                    storyDemoId,
                    currentScreen._id,
                    newZoomSpan._id,
                    newZoomSpan.startTime,
                    newZoomSpan.duration,
                    newZoomSpan.width,
                    newZoomSpan.height,
                    newZoomSpan.editorWidth,
                    newZoomSpan.editorHeight,
                    newZoomSpan.offsetX,
                    newZoomSpan.offsetY,
                    authData.token
                  )

                }}
                // style={{
                //   width: span.width,
                //   marginLeft: span.marginLeft
                // }}
              />
            })}

          </S.ZoomContainer>
          <Tip
            content={
              <S.AddZoomButton
                onClick={(e) => {

                  console.log(e)

                  setIsTippyDisabled(true)
                  setTimeout(() => {
                    setIsTippyDisabled(false)
                  }, 100)


                  let duration = 2.5

                  let timelineWidth = internalTimelineRightPosition.current - internalTimelineLeftPosition.current - 4

                  let spanWidth = timelineWidth * (duration / videoInternalRef.current.duration)

                  let rightTimePos = e.clientX + (duration / videoInternalRef.current.duration) * timelineWidth

                  if (rightTimePos >= internalTimelineRightPosition.current) {
                    let difference = rightTimePos - internalTimelineRightPosition.current + 16

                    duration -= videoInternalRef.current.duration * (difference / timelineWidth)
                    spanWidth = timelineWidth * (duration / videoInternalRef.current.duration)

                  }

                  let leftStartTimePos = (e.clientX - internalTimelineLeftPosition.current + 16)

                  let startTime = videoInternalRef.current.duration * (leftStartTimePos / timelineWidth)

                  if (e.clientX + spanWidth > internalTimelineRightPosition.current) {
                    spanWidth -= (e.clientX + spanWidth) - internalTimelineRightPosition.current
                  }


                  // TODO: pass a reference to ZoomSpan and check if you can add another zoom span

                  let newZoomSpan = {
                    duration: duration,
                    editorWidth: innerWidth,
                    editorHeight: innerHeight,
                    startTime,
                    width: 100,
                    height: 100,
                    offsetX: 0,
                    offsetY: 0,
                  }

                  let newZoomSpans = JSON.parse(JSON.stringify(zoomSpans))

                  if (newZoomSpans.every(span => {
                    let spanStartTime = span.startTime
                    let spanEndTime = span.startTime + span.duration

                    return (newZoomSpan.startTime < spanStartTime && newZoomSpan.startTime + newZoomSpan.duration < spanStartTime) ||
                      (newZoomSpan.startTime > spanEndTime && newZoomSpan.startTime + newZoomSpan.duration > spanEndTime)
                  })) {


                    return storyDemoActions.addZoomSpan(workspaceId, storyDemoId, currentScreen._id,
                      newZoomSpan.startTime,
                      newZoomSpan.duration,
                      newZoomSpan.width,
                      newZoomSpan.height,
                      newZoomSpan.editorWidth,
                      newZoomSpan.editorHeight,
                      newZoomSpan.offsetX,
                      newZoomSpan.offsetY,
                      authData.token
                    )
                      .then((zoomSpanDoc) => {

                        newZoomSpans.push(zoomSpanDoc)

                        setZoomSpans(newZoomSpans)

                        console.log(zoomSpanRefs)
                      })
                    // The new zoomSpan is not overlapping with any other span
                  }

                }
                }>
                <MdOutlineZoomIn/>
              </S.AddZoomButton>
            }
            hideOnClick={'toggle'}
            arrow={false}
            disabled={isTippyDisabled}
            placement={'bottom'}
            interactive={true}
            followCursor={'horizontal'}
            plugins={[followCursor]}
          >
            <S.Timeline>
              <S.TimelineStatic
                ref={internalTimelineRef}

                onClick={onTimeLineClick}
              />

              <S.LeftHandle
                ref={leftHandleRef}
                onMouseDown={resizeAdd(HANDLER_TYPES.LEFT)}
              >
                <S.HandleLine/>
              </S.LeftHandle>
              <S.TimilineTracker
                ref={trackerRef}
                onMouseDown={resizeAdd(HANDLER_TYPES.TRACKER)}
                // onMouseDown={resizeAdd(HANDLER_TYPES.TRACKER)}
              >
                <S.TrackerCursor>
                  <svg className="cursor-hd-icon" width="12" height="18" viewBox="0 0 12 18" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <mask id="path-1-inside-1_1578_341598" fill="white">
                      <path
                        d="M0 3C0 1.34314 1.34315 0 3 0H9C10.6569 0 12 1.34315 12 3V11.8287C12 12.7494 11.5772 13.6191 10.8531 14.1879L6 18L1.14686 14.1879C0.422795 13.6191 0 12.7494 0 11.8287V3Z"></path>
                    </mask>
                    <path className="icon-bg"
                          d="M0 3C0 1.34314 1.34315 0 3 0H9C10.6569 0 12 1.34315 12 3V11.8287C12 12.7494 11.5772 13.6191 10.8531 14.1879L6 18L1.14686 14.1879C0.422795 13.6191 0 12.7494 0 11.8287V3Z"></path>
                    <path className="icon-border"
                          d="M6 18L4.76457 19.5728L6 20.5432L7.23543 19.5728L6 18ZM1.14686 14.1879L-0.0885728 15.7607L1.14686 14.1879ZM10.8531 14.1879L12.0886 15.7607L10.8531 14.1879ZM3 2H9V-2H3V2ZM10 3V11.8287H14V3H10ZM2 11.8287V3H-2V11.8287H2ZM9.61771 12.6151L4.76457 16.4272L7.23543 19.5728L12.0886 15.7607L9.61771 12.6151ZM7.23543 16.4272L2.38228 12.6151L-0.0885728 15.7607L4.76457 19.5728L7.23543 16.4272ZM-2 11.8287C-2 13.3632 -1.29534 14.8128 -0.0885728 15.7607L2.38228 12.6151C2.14093 12.4255 2 12.1356 2 11.8287H-2ZM10 11.8287C10 12.1356 9.85907 12.4255 9.61771 12.6151L12.0886 15.7607C13.2953 14.8128 14 13.3632 14 11.8287H10ZM9 2C9.55228 2 10 2.44772 10 3H14C14 0.238577 11.7614 -2 9 -2V2ZM3 -2C0.238579 -2 -2 0.23857 -2 3H2C2 2.44771 2.44771 2 3 2V-2Z"
                          fill="#090C14" mask="url(#path-1-inside-1_1578_341598)"></path>
                  </svg>
                </S.TrackerCursor>
              </S.TimilineTracker>
              <S.InnerTimeline
                onClick={onTimeLineClick}
              >
                <S.TimelineFiller/>
              </S.InnerTimeline>
              <S.RightHandle
                ref={rightHandleRef}
                onMouseDown={resizeAdd(HANDLER_TYPES.RIGHT)}
              >
                <S.HandleLine/>
              </S.RightHandle>
            </S.Timeline>
          </Tip>
        </S.TimelineWrapper>

        <S.Button
          style={{marginLeft: 5}}
          onClick={onChangeVideoSpeed}
        >
          {videoSpeed}x
        </S.Button>
      </S.VideoWrapper>
    </S.Wrapper>

  )
}

const S = {
  Tippy: styled(Tippy)`
    background: #FFF !important;
    font-size: 1rem;
    border-radius: 6px;

    && .tippy-arrow::before {
      color: #333 !important;
    }

    && .tippy-content {
      padding: 0px;
    }
  `,
  Timeline: styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px;
    position: relative;

    margin: 0px 16px;

    border-radius: 9px;

    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */

  `,
  ZoomContainer: styled.div`
    width: 100%;
    height: 100%;
    display: block;
    padding: 0px;
    position: absolute;
    left: 0px;
    top: 0px;

    border-radius: 12px;

    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  `,
  ZoomSpan: styled.span`
    z-index: 2;
    height: 100%;
    background: rgba(17, 24, 39, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;

  `,
  TimelineStatic: styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px;
    position: absolute;
    left: 0px;
    top: 0px;

    cursor: pointer;
    border: 5px solid white;
    background: #F1F3FE;
    border-radius: 12px;

    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  `,
  TrackerCursor: styled.div`
    position: absolute;
    top: -19px;
  `,
  TimilineTracker: styled.div`
    position: absolute;
    left: 0;
    top: 0;
    will-change: margin-left;


    display: flex;
    justify-content: center;

    cursor: grab;
    transition: 0.1s ease;
    z-index: 3;
    height: 100%;
    width: 4px;
    background: #111827;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
  `,
  InnerTimeline: styled.span`
    flex-grow: 1;
    //height: 100%;
    height: 36px;

    position: relative;
    border: 2px solid ${Colors.primaryColor};
    padding: 5px;

    cursor: pointer;

    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  `,
  TimelineFiller: styled.span`
    width: 100%;
    height: 100%;
    display: block;
    position: relative;
    border-radius: 9px;

    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  `,
  LeftHandle: styled.span`
    position: relative;
    //left: 0;

    z-index: 3;

    margin-left: -16px;

    width: 16px;
    height: 36px;
    border-top-left-radius: 9px;
    border-bottom-left-radius: 9px;
    background: ${Colors.primaryColor};

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: grab;
  `,
  RightHandle: styled.span`
    position: relative;
    //right: 0;
    z-index: 3;
    width: 16px;
    height: 36px;
    border-top-right-radius: 9px;
    border-bottom-right-radius: 9px;
    background: ${Colors.primaryColor};

    margin-right: -16px;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: grab;
  `,
  HandleLine: styled.span`
    height: 16px;
    width: 2px;
    background: white;
    border-radius: 999px;
  `,
  Button: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 34px;
    border-radius: 8px;

    cursor: pointer;

    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */

    font-family: ${Colors.fontFamily};
    color: ${Colors.baseColors.fifthColor};

    font-weight: 550;
    font-size: 15px;

    && svg {
      width: 100%;
      height: 100%;
    }

    && svg g path {
      fill: ${Colors.baseColors.sixthColor};
    }

    &&:hover {
      background: #F1F3FE;
    }
  `,
  AddZoomButton: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 34px;
    border-radius: 8px;

    cursor: pointer;

    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */

    font-family: ${Colors.fontFamily};
    color: ${Colors.baseColors.fifthColor};

    font-weight: 550;
    font-size: 15px;

    && svg {
      width: 100%;
      height: 100%;
    }

    && svg g path {
      fill: ${Colors.baseColors.sixthColor};
    }

    &&:hover {
      background: #F1F3FE;
    }
  `,
  PauseButton: styled(MdPause)`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 34px;
    border-radius: 8px;

    cursor: pointer;

    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */

    font-family: ${Colors.fontFamily};
    color: ${Colors.baseColors.fifthColor};

    font-weight: 550;
    font-size: 15px;

    && svg {
      width: 100%;
      height: 100%;
    }

    && svg g path {
      fill: ${Colors.baseColors.sixthColor};
    }

    &&:hover {
      background: #F1F3FE;
    }
  `,
  Wrapper: styled.div`
    height: 41px;
    width: 75%;
    margin: 0 auto 50px;
    background: white;
    border-radius: 8px;

  `,
  VideoWrapper: styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
    border-radius: 8px;
    padding: 4px;

  `,
  TimelineWrapper: styled.div`
    position: relative;
    height: 100%;
    flex-grow: 1;
    display: flex;
    align-items: center;

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

export default connect(mapStateToProps, mapDispatchToProps)(VideoEditor)
