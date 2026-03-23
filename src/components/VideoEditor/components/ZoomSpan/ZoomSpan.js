import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Colors from '../../../../constants/mainColors'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css' // optional
// import 'tippy.js/animations/shift-away.css'
import 'tippy.js/animations/scale.css'
import {followCursor} from 'tippy.js'
import { MdPause, MdOutlineZoomIn, MdDelete } from 'react-icons/md'

const HANDLER_TYPES = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  MOVE_HANDLE: 'MOVE_HANDLE'
}

function Tip({ children, ...props }) {

  return <S.Tippy {...props}>{children}</S.Tippy>
}

const ZoomSpan = (props) => {
  const {
    data,
    startTime,
    duration,
    videoDuration,
    clientX,
    spanWidth: width,
    initialMarginLeft,
    leftHandleTopInitXPos,
    rightHandleTopInitXPos,
    deleteZoomSpan,
    onChange,
    onTimeLineClick
  } = props



  let leftHandleRef = useRef(null)
  let rightHandleRef = useRef(null)

  // let leftHandleTopInitXPos = useRef(0)
  // let rightHandleTopInitXPos = useRef(0)

  let leftHandleXPos = useRef(0)
  let rightHandleXPos = useRef(0)

  let internalSpanlineLeftPosition = useRef(0)
  let internalSpanlineRightPosition = useRef(0)

  let internalSpanlineRef = useRef(null)

  let moveOffsetX = useRef(0)



  useEffect(() => {

    if (leftHandleRef.current && rightHandleRef.current) {

      leftHandleXPos.current = leftHandleRef.current.getBoundingClientRect().left
      rightHandleXPos.current = rightHandleRef.current.getBoundingClientRect().left
    }

  }, [leftHandleTopInitXPos, rightHandleTopInitXPos])

  function setupTimelinePositions() {
    let cordinates = internalSpanlineRef.current.getBoundingClientRect()
    internalSpanlineLeftPosition.current = cordinates.left
    internalSpanlineRightPosition.current = cordinates.left + cordinates.width
  }

  function resizeMove(type) {

    return function (e) {


      const el = type === HANDLER_TYPES.LEFT ? internalSpanlineRef.current : (type === HANDLER_TYPES.RIGHT ? internalSpanlineRef.current : internalSpanlineRef.current)
      let elCordinates = el.getBoundingClientRect()


      let newBoxWidth, newBoxHeight, offsetMarginX, offsetMarginY, offsetX, offsetY

      let newMargin = e.clientX - leftHandleTopInitXPos

      if (type === HANDLER_TYPES.LEFT) {

        let newMargin = Math.max(e.clientX - leftHandleTopInitXPos, -16)

        let newLeftPosition = leftHandleTopInitXPos + newMargin

        if (newLeftPosition <= leftHandleTopInitXPos) {
          newLeftPosition = leftHandleTopInitXPos

          // newMargin = newLeftPosition - leftHandleTopInitXPos
          newMargin = 48
        }

        if(newLeftPosition >= rightHandleTopInitXPos - 16) {

          newMargin = rightHandleTopInitXPos - leftHandleTopInitXPos - 16
        }

        let marginDifference = parseFloat(el.style.marginLeft.slice(0, -2)) - newMargin

        el.style.marginLeft = newMargin + 'px'
        el.style.width = parseFloat(el.style.width.slice(0, -2)) + marginDifference + 'px'


        leftHandleXPos.current = leftHandleTopInitXPos + newMargin
        setupTimelinePositions()

        // calculate new time after resize
        let newTrackerMargin = newMargin + 16

        // trackerRef.current.style.marginLeft = newTrackerMargin + 'px'
        // videoInternalRef.current.currentTime = newTime

      }
      else if (type === HANDLER_TYPES.RIGHT) {



        let marginDifference = e.clientX - leftHandleXPos.current //parseFloat(el.style.marginLeft.slice(0, -2)) - newMargin
        let newRightPosition = leftHandleXPos.current + marginDifference

        if (newRightPosition >= rightHandleTopInitXPos) {
          let difference = newRightPosition - rightHandleTopInitXPos

          marginDifference = marginDifference - difference - 48
        }


        // rightHandleXPos.current = newRightPosition


        // el.style.marginLeft = newMargin + 'px'
        el.style.width = marginDifference + 'px'
        // el.style.width = parseFloat(el.style.width.slice(0, -2)) + marginDifference + 'px'

        // el.style.marginRight = newMargin + 'px'
        setupTimelinePositions()

      }
      else if (type === HANDLER_TYPES.MOVE_HANDLE) {

        let cordinates = internalSpanlineRef.current.getBoundingClientRect()

        // let newOffsetX = e.clientX - leftSpanPositionX
        // let offsetY = e.clientY - internalSpanlineRef.current.getBoundingClientRect().top

        // let moveDifference = moveOffsetX.current !== 0 ? newOffsetX - moveOffsetX.current : 0

        let newMargin = Math.min(Math.max((e.clientX - moveOffsetX.current) - leftHandleTopInitXPos, 32), rightHandleTopInitXPos - leftHandleTopInitXPos - cordinates.width - 16)

        // moveOffsetX.current = newOffsetX

        //
        // let marginDifference = e.clientX - leftHandleXPos.current //parseFloat(el.style.marginLeft.slice(0, -2)) - newMargin
        // let newRightPosition = leftHandleXPos.current + marginDifference
        //
        // if (newRightPosition >= rightHandleTopInitXPos) {
        //   let difference = newRightPosition - rightHandleTopInitXPos
        //
        //   marginDifference = marginDifference - difference - 16
        // }
        //

        // rightHandleXPos.current = newRightPosition


        el.style.marginLeft = newMargin + 'px'
        // el.style.width = marginDifference + 'px'
        // el.style.width = parseFloat(el.style.width.slice(0, -2)) + marginDifference + 'px'

        // el.style.marginRight = newMargin + 'px'
        setupTimelinePositions()



      }
    }
  }

  function resizeAdd(type) {

    return function (e) {

      let leftSpanPositionX = internalSpanlineRef.current.getBoundingClientRect().left

      moveOffsetX.current = e.clientX - leftSpanPositionX

      let resizeMoveFunction = resizeMove(type)
      window.document.addEventListener('mousemove', resizeMoveFunction)
      window.document.addEventListener('mouseup', resizeRemoveClosure(resizeMoveFunction))
    }
  }

  function resizeRemoveClosure(resizeMoveFunction) {
    return function onRemove(e) {



      let fullWidth = rightHandleTopInitXPos - leftHandleTopInitXPos - 16
      let cordinates = internalSpanlineRef.current.getBoundingClientRect()


      let leftMargin = parseFloat(internalSpanlineRef.current.style.marginLeft.slice(0, -2))


      let newZoomSpan = {...data}
      let newStartTime = videoDuration * (leftMargin / fullWidth)
      let newDuration = videoDuration * (cordinates.width / fullWidth)

      newZoomSpan.startTime = newStartTime
      newZoomSpan.duration = newDuration

      onChange(newZoomSpan)


      window.document.removeEventListener('mousemove', resizeMoveFunction)
      window.document.removeEventListener('mouseup', onRemove)
    }
  }

  return (
    <Tip
      content={
          <S.DeleteZoomButton onClick={() => {
            deleteZoomSpan()
          }}>
            <MdDelete />
          </S.DeleteZoomButton>
      }
      hideOnClick={'toggle'}
      arrow={false}
      zIndex={99999}
      // disabled={false}
      placement={'bottom'}
      interactive={true}
      followCursor={'horizontal'}
      plugins={[followCursor]}
    >
    <S.ZoomSpanWrapper
      ref={internalSpanlineRef}
      style={{
        marginLeft: initialMarginLeft,
        width: width
      }}
    >
      <S.LeftHandle
        ref={leftHandleRef}
        onMouseDown={resizeAdd(HANDLER_TYPES.LEFT)}
      >
        <S.HandleLine/>
      </S.LeftHandle>

        <S.Filler
          onMouseDown={onTimeLineClick}
          // onMouseDown={resizeAdd(HANDLER_TYPES.MOVE_HANDLE)}
        >
          <S.ZoomIcon>
            <MdOutlineZoomIn />
          </S.ZoomIcon>
          <S.MoveIcon
            onMouseDown={(e) => {
              e.stopPropagation()
              resizeAdd(HANDLER_TYPES.MOVE_HANDLE)(e)
            }}
          >
            <svg width="12" height="13" viewBox="0 0 12 13" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 0H2V2H0V0ZM5 0H7V2H5V0ZM10 0H12V2H10V0ZM0 5H2V7H0V5ZM5 5H7V7H5V5ZM10 5H12V7H10V5ZM0 10H2V12H0V10ZM5 10H7V12H5V10ZM10 10H12V12H10V10Z"
                fill="black"/>
            </svg>
          </S.MoveIcon>
        </S.Filler>

      <S.RightHandle
        ref={rightHandleRef}
        onMouseDown={resizeAdd(HANDLER_TYPES.RIGHT)}
      >
        <S.HandleLine/>
      </S.RightHandle>
    </S.ZoomSpanWrapper>
</Tip>


)
}

const S = {
  TipWrapper: styled.div`
    display: flex;
    //justify-content: center;
    align-items: center;
    height: 105%;
  `,
  DeleteZoomButtonWrapper: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 34px;
    margin-top: -5px;
  `,
  DeleteZoomButton: styled.div`
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
      width: 70%;
      height: 70%;
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
  ZoomSpanWrapper: styled.span`
    z-index: 2;
    height: 100%;
    border-radius: 12px;
    display: flex;
    align-items: center;
    position: absolute;
    padding: 1px 0px;


  `,
  HandleLine: styled.span`
    height: 16px;
    width: 2px;
    background: white;
    border-radius: 999px;
  `,
  LeftHandle: styled.span`
    position: relative;
    //left: 0;

    z-index: 3;
    min-width: 16px;
    margin-left: -16px;

    cursor: grab;
    width: 16px;
    height: 36px;
    border-top-left-radius: 9px;
    border-bottom-left-radius: 9px;
    background: ${Colors.primaryColor};

    display: flex;
    align-items: center;
    justify-content: center;

  `,

  Filler: styled.div`
    height: 32px;
    background: #DDD;
    flex-grow: 1;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

  `,
  ZoomIcon: styled.div`
    height: 100%;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${Colors.primaryColor};
    }


  `,
  MoveIcon: styled.div`
    width: 15px;
    height: 15px;
    margin: 8px;
    cursor: grab;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${Colors.primaryColor};
    }


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

    min-width: 16px;
    margin-right: -16px;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: grab;
  `
}

export default ZoomSpan
