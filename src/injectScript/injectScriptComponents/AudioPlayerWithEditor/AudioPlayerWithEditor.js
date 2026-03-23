import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
import { MdOutlineZoomIn, MdPause } from 'react-icons/md'
import axios from '../../../utils/axiosInstance.js'
import ENV from '../../config.json'
import getBlobDuration from 'get-blob-duration'

const HANDLER_TYPES = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TRACKER: 'TRACKER',
}

const AudioPlayerWithEditor = (props) => {
  let {
    audioBlob
  } = props


  let [audioBlobUrl, setAudioBlobUrl] = useState(audioBlob ? URL.createObjectURL(audioBlob): '')

  let [isPlaying, setIsPlaying] = useState(false)


  let audioInternalRef = useRef(null)
  let audioDurationRef = useRef(0)
  let trackerRef = useRef(null)

  let leftHandleRef = useRef(null)
  let rightHandleRef = useRef(null)

  let leftHandleInitXPos = useRef(0)
  let [leftHandleInitXPosState, setLeftHandleInitXPosState] = useState(0)
  let rightHandleInitXPos = useRef(0)
  let [rightHandleInitXPosState, setRightHandleInitXPosState] = useState(0)

  let leftHandleXPos = useRef(0)
  let rightHandleXPos = useRef(0)



  let internalTimelineRef = useRef(null)
  let internalTimelineLeftPosition = useRef(0)
  let internalTimelineRightPosition = useRef(0)
  let [trackerPosition, setTrackerPosition] = useState(0)

  let _videoTimeChangeAttached = useRef(false)



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


  // useEffect(() => {
  //
  //
  // }, [audioUrl])

  useEffect(() => {
    if(audioInternalRef.current) {
      attachVideoTimeChangeHandler(audioInternalRef.current)
    }
  }, [audioInternalRef, audioInternalRef.current])

  useEffect(() => {

    if(audioBlob) {
      // trackerRef.current.style.marginLeft = 0 + 'px'
      trackerRef.current.style.transform = `translateX(0px)`

      getBlobDuration(audioBlob)
        .then(duration => {
          audioDurationRef.current = duration
        })

      setAudioBlobUrl(URL.createObjectURL(audioBlob))
      setIsPlaying(false)

    }
  }, [audioBlob]);

  function attachVideoTimeChangeHandler(video) {
    if (!_videoTimeChangeAttached.current) {
      _videoTimeChangeAttached.current = true
      video.addEventListener('timeupdate', onVideoTimeChange)
      video.addEventListener('ended', () => {
        setIsPlaying(false)
      })
    }
  }

  function onVideoTimeChange(event) {

    let width = internalTimelineRightPosition.current - internalTimelineLeftPosition.current - 4

    // let timestampInSeconds = event.timeStamp / 10000
    // let timestampPercentage = timestampInSeconds / event.currentTarget.duration
    // let singleMarginSize = (event.currentTarget.duration / width)
    // let newMargin =  (width * timestampPercentage)

    let timestampInSeconds = audioInternalRef.current.currentTime
    let timePercentage = audioInternalRef.current.currentTime / audioInternalRef.current.duration
    let newMargin = width * timePercentage

    // Make it stop at the rightHandle
    let rightHandleMargin = rightHandleXPos.current - leftHandleInitXPos.current
    if(newMargin >= rightHandleMargin){

      newMargin = rightHandleMargin

      audioInternalRef.current.pause()

      let newTime = audioDurationRef.current * (newMargin / width)
      audioInternalRef.current.currentTime = newTime

      setIsPlaying(false)
    }

    // trackerRef.current.style.marginLeft = newMargin + 'px'
    trackerRef.current.style.transform = 'translateX(' + newMargin + 'px)'
  }



  useEffect(() => {
    if (internalTimelineRef.current) {
      setupTimelinePositions()
    }
  }, [internalTimelineRef.current])



  function resizeMove(type) {

    return function (e) {

      const el = type === HANDLER_TYPES.LEFT ? leftHandleRef.current : (type === HANDLER_TYPES.RIGHT ? rightHandleRef.current : trackerRef.current)
      let elCordinates = el.getBoundingClientRect()


      if (type === HANDLER_TYPES.LEFT) {


        let newMargin = Math.max(e.clientX - leftHandleInitXPos.current, 0)

        let newLeftPosition = leftHandleInitXPos.current + newMargin

        if (newLeftPosition >= rightHandleXPos.current - 36) {
          newLeftPosition = rightHandleXPos.current - 36

          newMargin = newLeftPosition - leftHandleInitXPos.current
        }

        el.style.transform = `translateX(${newMargin}px)`

        leftHandleXPos.current = leftHandleInitXPos.current + newMargin
        let width = internalTimelineRightPosition.current - internalTimelineLeftPosition.current - 4

        // calculate new time after resize
        let newTrackerMargin = newMargin
        let newTime = audioDurationRef.current * (newTrackerMargin / width)

        // trackerRef.current.style.marginLeft = newTrackerMargin + 'px'
        trackerRef.current.style.transform = `translateX(${newTrackerMargin}px)`
        audioInternalRef.current.currentTime = newTime

        setupTimelinePositions()

      } else if (type === HANDLER_TYPES.RIGHT) {

        let newMargin = Math.max(rightHandleInitXPos.current - e.clientX, 0)

        let newRightPosition = rightHandleInitXPos.current - newMargin

        if (newRightPosition <= leftHandleXPos.current + 36) {
          newRightPosition = leftHandleXPos.current + 36

          newMargin = rightHandleInitXPos.current - newRightPosition
        }

        rightHandleXPos.current = newRightPosition

        el.style.transform = `translateX(-${newMargin}px)`
        // el.style.marginRight = newMargin + 'px'

        setupTimelinePositions()

      } else if (type === HANDLER_TYPES.TRACKER) {
        let newMargin = Math.max(e.clientX - internalTimelineLeftPosition.current, -0)

        let newTrackerPosition = internalTimelineLeftPosition.current + newMargin

        if (newTrackerPosition >= internalTimelineRightPosition.current - 4) {
          newTrackerPosition = internalTimelineRightPosition.current - 4

          newMargin = internalTimelineRightPosition.current - internalTimelineLeftPosition.current - 4
        }

        el.style.transform = `translateX(${newMargin}px)`
        // el.style.marginLeft = newMargin + 'px'

        setTrackerPosition(internalTimelineLeftPosition.current + newMargin)

        let width = internalTimelineRightPosition.current - internalTimelineLeftPosition.current - 4
        let oneMarginValue = audioInternalRef.current.duration / width
        let newTime = newMargin * oneMarginValue

        audioInternalRef.current.currentTime = newTime

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
      if(type === HANDLER_TYPES.TRACKER) {
        return
      }

      let leftHandleCordinates = leftHandleRef.current.getBoundingClientRect()
      let rightHandleCordinates = rightHandleRef.current.getBoundingClientRect()
      // let cordinates = trackerRef.current.getBoundingClientRect()
      let left = leftHandleCordinates.left
      let right = rightHandleCordinates.right - 16

      // let timelineWidth = rightHandleInitXPos.current - leftHandleInitXPos.current
      let timelineWidth = internalTimelineRef.current.getBoundingClientRect().width

      let startTime = ((left - leftHandleInitXPos.current) / timelineWidth) * audioDurationRef.current
      let endTime = ((right - leftHandleInitXPos.current) / timelineWidth) * audioDurationRef.current

      let updateObj = {
        startTime,
        endTime
      }
    }
  }

  function onTimeLineClick(e) {

    let newMargin = e.clientX - internalTimelineLeftPosition.current

    let width = internalTimelineRightPosition.current - internalTimelineLeftPosition.current

    let newTime = audioDurationRef.current * (newMargin / width)

    console.log(newMargin)
    console.log(newTime)

    trackerRef.current.style.transform = `translateX(${newMargin}px)`
    audioInternalRef.current.currentTime = newTime
  }


  return (
    <S.Wrapper>
      <S.VideoWrapper>
        {!isPlaying ? (
          <S.Button
            style={{ marginRight: 5 }}
            onClick={() => {

              setIsPlaying(true)

              if (!audioInternalRef.current.ended) {

                audioInternalRef.current.play()
              } else {
                let width = internalTimelineRightPosition.current - internalTimelineLeftPosition.current - 4
                let newMargin = leftHandleXPos.current - leftHandleInitXPos.current

                trackerRef.current.style.transform = `translateX(${newMargin}px)`

                let newTime = audioDurationRef.current * (newMargin / width)
                audioInternalRef.current.currentTime = newTime

                audioInternalRef.current.play()
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
            style={{ marginRight: 5 }}
            onClick={() => {
              audioInternalRef.current.pause()
              setIsPlaying(false)
            }}/>
        )}


        <S.TimelineWrapper>
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
            >
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
          <audio preload={'auto'} ref={audioInternalRef} src={audioBlobUrl}></audio>
        </S.TimelineWrapper>


      </S.VideoWrapper>
    </S.Wrapper>

  )
}

const S = {

  Timeline: styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px;
    position: relative;

    margin: 0px 6px;

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
    background: rgba(17,24,39,0.2);
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

    //cursor: pointer;
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
    will-change: transform;
    border-radius: 6px;
    z-index: 4;
    display: flex;
    justify-content: center;

    //cursor: grab;
    transition: 0.2s ease;
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
    //border: 2px solid ${Colors.primaryColor};
    padding: 5px;

    //cursor: pointer;

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
    color: ${Colors.fifthColor};

    font-weight: 550;
    font-size: 15px;

    && svg {
      width: 100%;
      height: 100%;
    }

    && svg g path {
      fill: ${Colors.sixthColor};
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
    color: ${Colors.fifthColor};

    font-weight: 550;
    font-size: 15px;

    && svg {
      width: 100%;
      height: 100%;
    }

    && svg g path {
      fill: ${Colors.sixthColor};
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
    color: ${Colors.fifthColor};

    font-weight: 550;
    font-size: 15px;

    && svg {
      width: 100%;
      height: 100%;
    }

    && svg g path {
      fill: ${Colors.sixthColor};
    }

    &&:hover {
      background: #F1F3FE;
    }
`,
  Wrapper: styled.div`
    height: 41px;
    width: 100%;
    background: white;
`,
  VideoWrapper: styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
    border-radius: 8px;
    padding: 4px 16px 4px 4px;

  `,
  TimelineWrapper: styled.div`
    position: relative;
    height: 100%;
    flex-grow: 1;
    display: flex;
    align-items: center;

  `,

}
export default AudioPlayerWithEditor
