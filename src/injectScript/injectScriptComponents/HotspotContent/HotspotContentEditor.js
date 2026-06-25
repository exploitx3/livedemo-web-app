import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
// import { Rings } from 'react-loader-spinner'
import Rings from '../../injectScriptComponents/Rings/Rings.js'
import TooltipContentEditor from '../TooltipContent/TooltipContentEditor.js'

import shortUuid from 'short-uuid'

import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
import TippyModule from '@tippyjs/react'

// Ensure we get the actual component (handle both default and named exports)
const Tippy = TippyModule?.default || TippyModule

import {parseFragment} from 'parse5'

function deserializeToTextRecursive(parsedFragment, currentString) {
  let value = !!parsedFragment.value ? parsedFragment.value : ''
  if (!parsedFragment.childNodes) {
    currentString += value + '\n'

    return currentString
  }

  parsedFragment.childNodes.forEach(childNode => {
    let value = deserializeToTextRecursive(childNode, '')

    currentString += value
  })

  return currentString
}

const HOTSPOT_SIZE = 90

function Tip({ children, ...props }) {

  return <HT.Tippy {...props}>{children}</HT.Tippy>
}


const Hotspot = React.forwardRef(function (props, ref) {

  return <span id={'hotspot_inner'} onClick={props.onClick ? props.onClick : ()=>{}} ref={ref}>

      <Rings
        color={Colors.primaryColor}
        {...props}
      />
    </span>
})


function HotspotContentEditor({
                             view,
                             hotspotId,
                             isInEditor,
                             widthDimensionPercentage,
                             heightDimensionPercentage,
                             navWrapperRef,
                             currentStepIndex,
                             isOmniBarDisabled,
                             size,
                             onBack,
                            screenId,
                             onNext,
                             onSkip,
                             liveDemo,
                             themeBackgroundColor,
                             themeTextColor,
                             themeButtonBackgroundColor,
                             themeButtonTextColor,
                              showHeader,
                              showFooter,
                             onClick,
                             onSaveHotspot,
                          wrapperWidth,
                          wrapperHeight

                           }) {

  let [hasSetupDragging, setHasSetupDragging] = useState(false)

    /*
     @media (max-width: 1040px) {
        font-size: 14px;
      }

      @media (max-width: 540px) {
        font-size: 2.7vw;
      }


      @media (min-width: 1040px) {
        font-size: 1.1vw;
      }
     */


  // if(wrapperWidth <= 1040) {
  //     textFontSize = '14px'
  // } else if(wrapperWidth > 1040) {
  //     textFontSize = '1.1vw'
  // }
  // if(wrapperWidth < 540) {
  //   textFontSize = '2.7vw'
  // }
  //
  // if(isInEditor) {
  //     textFontSize = '14px'
  // }

  // if (reverseWidthPercentage !== 1) {
  //   textFontSize = 2.25 * reverseWidthPercentage
  // }
  //
  // if (reverseWidthPercentage && widthDimensionPercentage < 0.50) {
  //
  //   textFontSize *= 1.45
  //   hotspotSize *= 1.05
  // }


  let hotspotSize = HOTSPOT_SIZE

  let omniBarHeight = isOmniBarDisabled ? 0 : 40

  let showStepNumbers = (view && view.showStepNumbers) || (view && view.showStepNumbers) || false
  let tabInfoWidth = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerWidth) ? liveDemo.windowMeasures.innerWidth : (liveDemo.tabInfo ? liveDemo.tabInfo.width : 1366)
  let tabInfoHeight = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerHeight) ? liveDemo.windowMeasures.innerHeight : (liveDemo.tabInfo ? liveDemo.tabInfo.height : 664)

  let innerWidth = wrapperWidth ? wrapperWidth : window.innerWidth
  let innerHeight = wrapperHeight ? wrapperHeight : window.innerHeight

  let hotspotReversePercentageX = 1 + ((tabInfoWidth - innerWidth) / innerWidth)
  let hotspotReversePercentageY = 1 + (((tabInfoHeight) - (innerHeight - omniBarHeight)) / (innerHeight - omniBarHeight))

  let [isHotspotMoving, setIsHotspotMoving] = useState(false)

  // let hotspotPositionX = ((transition.frameX * 1) - hotspotSize / 2)
  // let hotspotPositionY = ((transition.frameY * 1) - hotspotSize / 2)

  let xPercentage = Math.min(tabInfoWidth, ((innerWidth) / tabInfoWidth))
  let yPercentage = Math.min(tabInfoHeight, ((innerHeight - omniBarHeight)) / tabInfoHeight)

  let hotspotPositionX = ((view.hotspot.frameX * xPercentage) - (hotspotSize / 2))
  let hotspotPositionY = ((view.hotspot.frameY * yPercentage) - (hotspotSize / 2))


  let hotspotPositionXTest = ((view.hotspot.frameX) - (hotspotSize / 2)) * xPercentage
  let hotspotPositionYTest = ((view.hotspot.frameY) - (hotspotSize / 2)) * yPercentage



  let reverseWidthPercentage = 1 + (1 - widthDimensionPercentage)

  let textFontSize = showStepNumbers && showFooter ? '16px' : '15px'

  // useEffect(() => {
  //
  //   if (navWrapperRef.current && isInEditor) {
  //
  //     setupDragging()
  //   }
  //
  // }, [navWrapperRef.current, isInEditor])

  useEffect(() => {
    let eventListenerFunctions = {}
    if (navWrapperRef.current && isInEditor && !hasSetupDragging) {
      // console.log('setup event listeners')
      eventListenerFunctions = setupDragging()
      setHasSetupDragging(true)
    }


    // return () => {
    //   console.log('clean event listeners')
    //   Object.entries(eventListenerFunctions).forEach(([key, value]) => {
    //     navWrapperRef.current.removeEventListener(key, value)
    //   })
    // }
  }, [navWrapperRef.current, isInEditor])

  function setTranslate(xPos, yPos, el) {
    el.style.transform = 'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)'
  }

  function setupDragging() {

      console.log('screenId in hotspotcontent')
      console.log(screenId)

    let clickElem = document.querySelector(`#hotspot_${hotspotId} svg`)
    let dragElem = document.querySelector(`#hotspot_${hotspotId}`)
    let container = navWrapperRef.current

    let isDragging = false
    let currentX
    let currentY
    let initialX = 0 //-10
    let initialY = 0 //70
    let xOffset = 0
    let yOffset = 0

    // Store document-level event handlers so we can remove them later
    let documentMouseMoveHandler = null
    let documentMouseUpHandler = null
    let documentTouchMoveHandler = null
    let documentTouchEndHandler = null

    let xMulti = 1 + 0.4229765013 //((1366 - window.innerWidth) / window.innerWidth) + 1
    let yMulti = 1 + 0.14457831325 // ((632 - window.innerHeight) / window.innerHeight) + 1

    container.addEventListener('touchstart', dragStart, false)
    container.addEventListener('mousedown', dragStart, false)

    function drag(e) {
      if (isDragging) {

        e.preventDefault()

        let containerRect = container.getBoundingClientRect()
        let currentMouseX, currentMouseY

        if (e.type === 'touchmove') {
          currentMouseX = e.touches[0].clientX - containerRect.left
          currentMouseY = e.touches[0].clientY - containerRect.top
        } else {
          currentMouseX = e.clientX - containerRect.left
          currentMouseY = e.clientY - containerRect.top
        }

        // Calculate new position maintaining the offset from where drag started
        xOffset = currentMouseX - initialX
        yOffset = currentMouseY - initialY

        setTranslate(xOffset, yOffset, dragElem)
      }
    }

    function dragStart(e) {

      if (e.target === clickElem || clickElem.contains(e.target)) {
        e.preventDefault() // Prevent text selection and default drag behavior

        isDragging = true
        setIsHotspotMoving(true)

        // Get the container's position
        let containerRect = container.getBoundingClientRect()

        // Get the element's current position relative to container
        let dragElemRect = dragElem.getBoundingClientRect()
        let currentElemX = dragElemRect.left - containerRect.left
        let currentElemY = dragElemRect.top - containerRect.top

        // Get mouse position relative to container
        let mouseX, mouseY
        if (e.type === 'touchstart') {
          mouseX = e.touches[0].clientX - containerRect.left
          mouseY = e.touches[0].clientY - containerRect.top
        } else {
          mouseX = e.clientX - containerRect.left
          mouseY = e.clientY - containerRect.top
        }


        // Calculate the offset from mouse to element center
        // This offset will be maintained during dragging
        initialX = mouseX - currentElemX
        initialY = mouseY - currentElemY

        // Set initial offsets to current element position
        xOffset = currentElemX
        yOffset = currentElemY

        // Attach document-level listeners to track mouse movement even outside container
        if (e.type === 'touchstart') {
          documentTouchMoveHandler = drag.bind(null)
          documentTouchEndHandler = dragEnd.bind(null)
          document.addEventListener('touchmove', documentTouchMoveHandler, false)
          document.addEventListener('touchend', documentTouchEndHandler, false)
        } else {
          documentMouseMoveHandler = drag.bind(null)
          documentMouseUpHandler = dragEnd.bind(null)
          document.addEventListener('mousemove', documentMouseMoveHandler, false)
          document.addEventListener('mouseup', documentMouseUpHandler, false)
        }
      }
    }

    function dragEnd(e) {
      if (isDragging) {
        e.preventDefault()
        isDragging = false
        setIsHotspotMoving(false)

        // Remove document-level listeners
        if (documentMouseMoveHandler) {
          document.removeEventListener('mousemove', documentMouseMoveHandler, false)
          documentMouseMoveHandler = null
        }
        if (documentMouseUpHandler) {
          document.removeEventListener('mouseup', documentMouseUpHandler, false)
          documentMouseUpHandler = null
        }
        if (documentTouchMoveHandler) {
          document.removeEventListener('touchmove', documentTouchMoveHandler, false)
          documentTouchMoveHandler = null
        }
        if (documentTouchEndHandler) {
          document.removeEventListener('touchend', documentTouchEndHandler, false)
          documentTouchEndHandler = null
        }

        // Calculate the element's center position (xOffset/yOffset are top-left corner)
        // Add half the hotspot size to get the center
        let elementCenterX = xOffset + (hotspotSize / 2)
        let elementCenterY = yOffset + (hotspotSize / 2)

        // Convert from current viewport coordinates to original tab coordinates
        let finalX = elementCenterX * hotspotReversePercentageX
        let finalY = elementCenterY * hotspotReversePercentageY

        onSaveHotspot(dragElem, finalX, finalY)
      }
    }

    return {
      touchstart: dragStart,
      touchend: dragEnd,
      touchmove: drag,
      mousedown: dragStart,
      mouseup: dragEnd,
      mousemove: drag
    }

  }


  let isContentEmpty = (view && (view.content === '<p></p>' || view.content === ''))
  let contentText = deserializeToTextRecursive(parseFragment(view.content), '')
  if (contentText) {
    contentText = contentText.trim()
    if (!contentText) {
      isContentEmpty = true
    }
  } else {
    isContentEmpty = true
  }

  return <HT.Hotspot
    key={hotspotId}
    id={`hotspot_${hotspotId}`}
    isInEditor={isInEditor}
    isMoving={isHotspotMoving}
    show={true}
    frameX={hotspotPositionX}
    frameY={hotspotPositionY}

  >

    <Tip
      zIndex={3}
      disabled={false}
      // disabled={!showTippy}
      delay={200}
      arrow={true}
      showOnCreate={false}
      animation={'shift-away'}
      offset={[0, -10]}
      popperOptions={{
        modifiers: [
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top', 'right', 'left', 'bottom'],
            },
          },
        ],
      }}
      themeBackgroundColor={themeBackgroundColor}
      interactive={true}
      interactiveBorder={2}
      placement={view.hotspot.placement}
            // placement={view.hotspot.placement ? 'auto' : 'top'}
            // trigger={ isContentEmpty ? 'manual' : 'mouseenter focus' }
            trigger={'manual'}
            visible={true}
      allowHTML={true}
      content={
        <TooltipContentEditor
          showStepNumbers={showStepNumbers}
          liveDemo={liveDemo}
          continuous={true}
          index={currentStepIndex.current}
          view={view}
          size={size}
          onBack={onBack}
          onNext={onNext}
          onSkip={onSkip}
          themeBackgroundColor={themeBackgroundColor}
          themeTextColor={themeTextColor}
          themeButtonBackgroundColor={themeButtonBackgroundColor}
          themeButtonTextColor={themeButtonTextColor}
          textFontSize={textFontSize}
          showHeader={showHeader}
          showFooter={showFooter}
          onClick={onClick}
        />

      }
    >
      <Hotspot
        color={themeBackgroundColor}
        height={hotspotSize}
        width={hotspotSize}
        onClick={onClick}
      />
    </Tip>

  </HT.Hotspot>
}

const HT = {
  Tippy: styled(Tippy)`

    && {
      background: ${({themeBackgroundColor}) => themeBackgroundColor} !important;
      color: white;
      font-size: 1.2rem;
      //padding: 10px 15px;
      max-width: 750px !important;
      border-radius: 6px;
      min-width: 220px;

    }

    //&& .tippy-content {
    //  max-width: 250px;
    //  width: max-content;
    //  padding: 0px;
    //}

    && .tippy-arrow::before {
      color: ${({themeBackgroundColor}) => themeBackgroundColor} !important;
    }
  `,
  HotspotTextWrapper: styled.span`
    //font-size: 6vmin;
    font-size: ${({ textFontSize }) => textFontSize}vmin;
    color: ${({themeTextColor}) => themeTextColor};
    height: 100%;
    font-weight: 550;
    font-family: ${Colors.fontFamily};

    //max-width: 250px;
    max-width: 29vw;
    width: max-content;
    overflow-wrap: break-word;



  `,
  Hotspot: styled.span`
    && {
      opacity: ${props => props.show ? '1' : '0'};
      //cursor: pointer;
      cursor: ${({ isInEditor }) => isInEditor ? 'move' : 'cursor'};
      transition: ${props => props.isMoving ? 'none' : '0.4s ease-in-out'};
      position: absolute;
      user-select: ${({ isInEditor }) => isInEditor ? 'none' : 'auto'};
      -webkit-user-select: ${({ isInEditor }) => isInEditor ? 'none' : 'auto'};
      -moz-user-select: ${({ isInEditor }) => isInEditor ? 'none' : 'auto'};
      -ms-user-select: ${({ isInEditor }) => isInEditor ? 'none' : 'auto'};

      top: 0;
      left: 0;
      transform: translate(${(props) => props.frameX}px, ${(props) => props.frameY}px);
      transform-origin: center;



      .tippy-box {
        -webkit-font-smoothing: antialiased !important;
        -webkit-backface-visibility: hidden !important;
        backface-visibility: hidden !important;
        transform: translate3d(0, 0, 0) !important;
    }
    
    }
  `,


}

export default HotspotContentEditor
