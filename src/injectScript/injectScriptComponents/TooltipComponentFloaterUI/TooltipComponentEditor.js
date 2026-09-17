import axios from 'axios'
import ENV from '../../../config.json'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import ReCAPTCHA from 'react-google-recaptcha'
import { Button } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import Colors from '../../../constants/mainColors.js'
import StepViewTypes from '../../../constants/StepViewTypes.js'
import ScreenPopupTypes from '../../../constants/ScreenPopupTypes.js'
import { waitForElement, topPostMessage } from '../../helpers.js'
import POINTER_TARGET_MODES from '../../../constants/pointerTargetModes.js'
import { autoPlacement, computePosition, offset } from '@floating-ui/dom'
import '@fontsource/lexend/latin.css'
import TooltipContentEditor from '../TooltipContent/TooltipContentEditor.js'

function useFullscreenPortalRoot() {
  const [portalRoot, setPortalRoot] = useState(() => document.fullscreenElement || document.body)

  useEffect(() => {
    const sync = () => setPortalRoot(document.fullscreenElement || document.body)
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    document.addEventListener('mozfullscreenchange', sync)
    document.addEventListener('MSFullscreenChange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
      document.removeEventListener('mozfullscreenchange', sync)
      document.removeEventListener('MSFullscreenChange', sync)
    }
  }, [])

  return portalRoot
}

function TooltipComponentEditor(props) {
  let {
    tooltipRef,
    tooltipWrapperRef,
    tooltipX,
    tooltipY,
    setTooltipX,
    setTooltipY,
    setIsTooltipDragging,
    continuous,
    index,
    step,
    size,
    onBack,
    onNext,
    onSkip,
    liveDemo,
    themeBackgroundColor,
    themeTextColor,
    themeButtonBackgroundColor,
    themeButtonTextColor,
    showTooltipArrow = true,
    themeOverlayBackgroundColor,
    setShowStartButton,
    iframeSize,
    forceUpdateVar,
    pointerInfo,
    widthDimensionPercentage,
    setPointerInfo,
    changeStep,
      wrapperWidth,
      wrapperHeight,
    isInEditor,
    scaleValuesRef,
    isScaled,
    isOmniBarDisabled,
    liveDemoRef,
    screenId,
    prevStep,
  } = props

  let innerWidth = wrapperWidth
  let innerHeight = wrapperHeight

  let omniBarHeight = isOmniBarDisabled ? 0 : 40
  let tabInfoWidth = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerWidth)
    ? liveDemo.windowMeasures.innerWidth
    : (liveDemo && liveDemo.tabInfo ? liveDemo.tabInfo.width : 1366)
  let tabInfoHeight = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerHeight)
    ? liveDemo.windowMeasures.innerHeight
    : (liveDemo && liveDemo.tabInfo ? liveDemo.tabInfo.height : 664)

  let xPercentage = Math.min(tabInfoWidth, innerWidth / tabInfoWidth)
  let yPercentage = Math.min(tabInfoHeight, innerHeight / tabInfoHeight)
  let reverseX = 1 + ((tabInfoWidth - innerWidth) / innerWidth)
  let reverseY = 1 + ((tabInfoHeight - innerHeight) / innerHeight)

  let isNoneMode = step.view.pointer?.targetMode === POINTER_TARGET_MODES.NONE
  const [noneModePortalContainer, setNoneModePortalContainer] = useState(null)
  let useContainerPosition = isNoneMode && !!noneModePortalContainer

  useEffect(() => {
    if (isNoneMode && tooltipWrapperRef?.current) {
      setNoneModePortalContainer(tooltipWrapperRef.current)
    } else {
      setNoneModePortalContainer(null)
    }
  }, [isNoneMode, tooltipWrapperRef, forceUpdateVar, innerWidth, innerHeight])

  function clampTooltipPosition(x, y, elemWidth, elemHeight) {
    let maxW = innerWidth
    let maxH = innerHeight
    if (tooltipWrapperRef?.current) {
      maxW = tooltipWrapperRef.current.clientWidth || innerWidth
      maxH = tooltipWrapperRef.current.clientHeight || innerHeight
    }
    return {
      x: Math.max(0, Math.min(x, Math.max(0, maxW - elemWidth))),
      y: Math.max(0, Math.min(y, Math.max(0, maxH - elemHeight))),
    }
  }

  function tabToContainerPosition(tabX, tabY) {
    return {
      x: tabX * xPercentage,
      y: tabY * yPercentage,
    }
  }

  let continuingPointer = !!(prevStep && prevStep.view && prevStep.view.viewType === StepViewTypes.POINTER)
  let [isVisible, setIsVisible] = useState(continuingPointer)
  const isVisibleRef = useRef(continuingPointer)
  const portalRoot = useFullscreenPortalRoot()

  let showFooter = step && step.view && step.view.showFooter

  let width = iframeSize && iframeSize.width ? iframeSize.width : '100%'
  let height = iframeSize && iframeSize.height ? iframeSize.height : '100%'


  let scalePercentage = innerWidth / width

  let additionalStyles = !(iframeSize && iframeSize.width) ? {} : {
    transformOrigin: 'top left',
    transform: `scale(${scalePercentage})`
  }


  let hideFooter = step.hideFooter
  let nextButtonText = step.view.nextButtonText
  let showStepNumbers = step.view.showStepNumbers === undefined ? true : !!step.view.showStepNumbers

  // Match HotspotContent: fixed px sizes stay crisp (vw + CSS transform = soft text)
  let textFontSize = showStepNumbers && showFooter ? '16px' : '15px'

  let nextButtonTextString = (nextButtonText ? nextButtonText : 'Next')
  let stepNumbersString = (showStepNumbers ? `(${index + 1}/${size})` : '')

  let wrapperRef = useRef(null)

  let [dragBounds, setDragBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 })
  let [dragDisabled, setDragDisabled] = useState(true)

  let [isMoving, setIsMoving] = useState(!continuingPointer)
  const [displayX, setDisplayX] = useState(tooltipX)
  const [displayY, setDisplayY] = useState(tooltipY)
  const [liveView, setLiveView] = useState(step.view)
  const [liveIndex, setLiveIndex] = useState(index)
  const moveGenRef = useRef(0)

  function isPointerView(s) {
    return !!(s && s.view && s.view.viewType === StepViewTypes.POINTER)
  }

  function moveDelayMs() {
    if (!isVisibleRef.current || !isPointerView(prevStep)) return 0
    if (prevStep.screenId && step.screenId && String(prevStep.screenId) !== String(step.screenId)) {
      return 120
    }
    return 50
  }

  function placeArrow(placement) {
    const arrowElem = arrowRef.current
    if (!arrowElem || !wrapperRef.current || !showTooltipArrow) {
      setIsArrowShown(false)
      return
    }
    const side = (placement || 'bottom').split('-')[0]
    const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[side]
    wrapperRef.current.setAttribute('data-popper-placement', staticSide)
    arrowElem.style.left = ''
    arrowElem.style.top = ''
    arrowElem.style.right = ''
    arrowElem.style.bottom = ''
    arrowElem.style.margin = ''
    arrowElem.style.visibility = 'visible'
    setIsArrowShown(true)
  }

  function applyPositionSmooth(x, y) {
    if (!isVisibleRef.current) {
      setIsMoving(true)
    } else {
      setIsMoving(false)
    }
    setDisplayX(x)
    setDisplayY(y)
    setTooltipX(x)
    setTooltipY(y)
    setLiveView(step.view)
    setLiveIndex(index)
    isVisibleRef.current = true
    setIsVisible(true)
    requestAnimationFrame(() => setIsMoving(false))
  }

  useEffect(() => {
    if (!isPointerView(prevStep)) {
      setLiveView(step.view)
      setLiveIndex(index)
      return
    }
    isVisibleRef.current = true
    setIsVisible(true)
    setIsMoving(false)
  }, [step && step._id])

  useEffect(() => {
    if (isMoving) {
      setDisplayX(tooltipX)
      setDisplayY(tooltipY)
    }
  }, [tooltipX, tooltipY, isMoving])

  let isDragging = useRef(null)

  let [isArrowShown, setIsArrowShown] = useState(false)

  let [popperInstance, setPopperInstance] = useState(null)

  let arrowRef = useRef(null)

  let vwSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  }


  // let [targetElement, setTargetElement] = useState(null)
  // let [placement, setPlacement] = useState('auto')

  useEffect(() => {
    tooltipRef.current = wrapperRef.current
  }, [wrapperRef])


  useEffect(() => {
    if (!isNoneMode) {
      return
    }

    setIsArrowShown(false)
    const gen = ++moveGenRef.current
    const timer = setTimeout(() => {
      if (gen !== moveGenRef.current) return

      function applyPosition() {
        if (gen !== moveGenRef.current) return
        let tabX = step.view.pointer.tooltipX ?? 200
        let tabY = step.view.pointer.tooltipY ?? 200
        let { x, y } = tabToContainerPosition(tabX, tabY)
        let elemW = wrapperRef.current?.offsetWidth || 0
        let elemH = wrapperRef.current?.offsetHeight || 0
        if (elemW && elemH) {
          ;({ x, y } = clampTooltipPosition(x, y, elemW, elemH))
        }
        applyPositionSmooth(x, y)
        if (!elemW || !elemH) {
          requestAnimationFrame(applyPosition)
        }
      }

      applyPosition()
    }, moveDelayMs())
    return () => clearTimeout(timer)
  }, [step && step._id, isNoneMode, innerWidth, innerHeight])


  useEffect(() => {
    if (!isNoneMode || !isInEditor || !noneModePortalContainer || !wrapperRef.current) {
      return
    }

    let container = noneModePortalContainer
    let dragElem = wrapperRef.current
    let isDragging = false
    let initialX = 0
    let initialY = 0
    let xOffset = 0
    let yOffset = 0
    let documentMouseMoveHandler = null
    let documentMouseUpHandler = null
    let documentTouchMoveHandler = null
    let documentTouchEndHandler = null

    function drag(e) {
      if (!isDragging) {
        return
      }
      e.preventDefault()

      let containerRect = container.getBoundingClientRect()
      let currentMouseX
      let currentMouseY

      if (e.type === 'touchmove') {
        currentMouseX = e.touches[0].clientX - containerRect.left
        currentMouseY = e.touches[0].clientY - containerRect.top
      } else {
        currentMouseX = e.clientX - containerRect.left
        currentMouseY = e.clientY - containerRect.top
      }

      xOffset = currentMouseX - initialX
      yOffset = currentMouseY - initialY

      let elemW = dragElem.offsetWidth
      let elemH = dragElem.offsetHeight
      ;({ x: xOffset, y: yOffset } = clampTooltipPosition(xOffset, yOffset, elemW, elemH))

      setTooltipX(xOffset)
      setTooltipY(yOffset)
    }

    function dragStart(e) {
      e.preventDefault()
      e.stopPropagation()
      isDragging = true
      setIsMoving(true)

      let containerRect = container.getBoundingClientRect()
      let dragElemRect = dragElem.getBoundingClientRect()
      let currentElemX = dragElemRect.left - containerRect.left
      let currentElemY = dragElemRect.top - containerRect.top

      let mouseX
      let mouseY
      if (e.type === 'touchstart') {
        mouseX = e.touches[0].clientX - containerRect.left
        mouseY = e.touches[0].clientY - containerRect.top
      } else {
        mouseX = e.clientX - containerRect.left
        mouseY = e.clientY - containerRect.top
      }

      initialX = mouseX - currentElemX
      initialY = mouseY - currentElemY
      xOffset = currentElemX
      yOffset = currentElemY

      if (e.type === 'touchstart') {
        documentTouchMoveHandler = drag
        documentTouchEndHandler = dragEnd
        document.addEventListener('touchmove', documentTouchMoveHandler, false)
        document.addEventListener('touchend', documentTouchEndHandler, false)
      } else {
        documentMouseMoveHandler = drag
        documentMouseUpHandler = dragEnd
        document.addEventListener('mousemove', documentMouseMoveHandler, false)
        document.addEventListener('mouseup', documentMouseUpHandler, false)
      }
    }

    function dragEnd(e) {
      if (!isDragging) {
        return
      }
      e.preventDefault()
      isDragging = false
      setIsMoving(false)

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

      let saveX = xOffset * reverseX
      let saveY = yOffset * reverseY

      topPostMessage({
        type: 'pointer_tooltip_set',
        stepId: step._id,
        screenId: screenId,
        tooltipX: saveX,
        tooltipY: saveY,
      })

      if (liveDemoRef?.current) {
        let liveDemoInternal = liveDemoRef.current
        let newStoryDemo = {...liveDemoInternal}
        newStoryDemo.screens = newStoryDemo.screens.map((scr) => {
          if (scr._id !== screenId) {
            return scr
          }
          return {
            ...scr,
            steps: scr.steps.map((s) => {
              if (s._id !== step._id) {
                return s
              }
              return {
                ...s,
                view: {
                  ...s.view,
                  pointer: {
                    ...(s.view.pointer || {}),
                    tooltipX: saveX,
                    tooltipY: saveY,
                  },
                },
              }
            }),
          }
        })
        liveDemoRef.current = newStoryDemo
      }
    }

    dragElem.addEventListener('touchstart', dragStart, false)
    dragElem.addEventListener('mousedown', dragStart, false)

    return () => {
      dragElem.removeEventListener('touchstart', dragStart, false)
      dragElem.removeEventListener('mousedown', dragStart, false)
      if (documentMouseMoveHandler) {
        document.removeEventListener('mousemove', documentMouseMoveHandler, false)
      }
      if (documentMouseUpHandler) {
        document.removeEventListener('mouseup', documentMouseUpHandler, false)
      }
      if (documentTouchMoveHandler) {
        document.removeEventListener('touchmove', documentTouchMoveHandler, false)
      }
      if (documentTouchEndHandler) {
        document.removeEventListener('touchend', documentTouchEndHandler, false)
      }
    }
  }, [isNoneMode, isInEditor, noneModePortalContainer, step._id, screenId, innerWidth, innerHeight])


  useEffect(() => {

    if (step.view.viewType === StepViewTypes.POINTER) {
      // Editor: never scroll the captured page when pointer type/placement changes.
      if (isInEditor || isNoneMode) {
        return
      }

      let targetSelector = step.view.pointer.selector

      if(targetSelector) {
        waitForElement(targetSelector, 300, 20)
          .then((targetElement) => {

            let anchorElement = targetElement
            if(step.view && step.view.pointer && step.view.pointer.selectorLocation) {
              // anchorElement = addTooltipAnchor(step._id, step.view.pointer.selectorLocation)
            }

            targetElement.scrollIntoView({behavior: "auto", block: "end", inline: "nearest"})



            let selector = step.view.pointer.selector
            let placement = step.view.pointer.placement || 'auto'
            //
            // setPointerInfo({
            //   enabled: true,
            //   targetElement: anchorElement,
            //   placement
            // })
          })
      }


    }
    else if (step.view.viewType === StepViewTypes.POPUP) {


      let tooltipSize = wrapperRef.current.getBoundingClientRect()
      let vwSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      }

      setTooltipX((vwSize.width/2) - (tooltipSize.width/2))
      setTooltipY((vwSize.height/2) - (tooltipSize.height/2))

      // Object.assign(wrapperRef.current.style, {
      //   transform: `translate(${(vwSize.width/2) - (tooltipSize.width/2)}px, ${(vwSize.height/2) - (tooltipSize.height/2)}px)`
      // })

      setIsArrowShown(false)
    } else {
      setIsArrowShown(false)
    }
  }, [step, forceUpdateVar])

  useEffect(() => {
    if (isNoneMode) {
      return
    }

    if(pointerInfo && pointerInfo.enabled && wrapperRef.current && arrowRef.current) {
      const gen = ++moveGenRef.current
      const timer = setTimeout(() => {
        if (gen !== moveGenRef.current) return
        if (!pointerInfo.targetElement || !pointerInfo.targetElement.isConnected || !wrapperRef.current) {
          return
        }

        let middleware = []

        if(pointerInfo.placement === 'auto') {
          middleware.push(autoPlacement({ alignment: 'center' }))
        }

        middleware = middleware.concat([offset(10)])

        setLiveView(step.view)
        setLiveIndex(index)

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (gen !== moveGenRef.current || !wrapperRef.current) return
            if (!pointerInfo.targetElement || !pointerInfo.targetElement.isConnected) return

            computePosition(pointerInfo.targetElement, wrapperRef.current, {
              placement: pointerInfo.placement === 'auto' ? undefined : pointerInfo.placement,
              strategy: 'fixed',
              middleware: middleware
            })
              .then((({x, y, placement}) => {
                if (gen !== moveGenRef.current) return
                if (x < 0 && y < 0) return
                applyPositionSmooth(x, y)
                placeArrow(placement)
              }))
          })
        })
      }, moveDelayMs())

      return () => clearTimeout(timer)

    } else if(pointerInfo && wrapperRef.current && arrowRef.current){

      if(step.view.viewType === StepViewTypes.POPUP) {

        setIsArrowShown(false)
        setIsVisible(true)
      }
    }


  }, [pointerInfo && pointerInfo.targetElement, step && step._id, portalRoot, showTooltipArrow])

  function sendFormData(formId, fieldsObj) {
    let formBody = Object.values(fieldsObj).reduce((accum, fieldObj) => {
      accum[fieldObj.name] = fieldObj.value

      return accum
    }, {})

    return axios.post(`${ENV.STORIES_API}/leads/forms/${formId}`,
      formBody
    ).then((res) => {

      return res.data
    })
  }

  let showForm = !!(
    step.view.viewType === StepViewTypes.POPUP &&
    step.view.popup.type === ScreenPopupTypes.FORM &&
    step.view.popup.formId &&
    step.view.popup.formId._id
  )
  let [fieldsObj, updateFieldsObj] = useState({})
  let [isLoading, setIsLoading] = useState(false)

  let recaptchaRef = useRef(null)

  let onNextHandlerClosure = (fieldsObj, recaptchaRef) => function (...args) {


    let promise = Promise.resolve()
    if (showForm) {
      promise = promise.then(() => {

        console.log(Object.entries(fieldsObj))
        setIsLoading(true)

        return recaptchaRef.current.executeAsync()
          .then(captchaToken => {
            recaptchaRef.current.reset()

            fieldsObj['captchaToken'] = {
              name: 'captchaToken',
              value: captchaToken
            }


            return sendFormData(step.view.popup.formId._id, fieldsObj)
          })


      })
    }

    promise = promise.then(() => {
        setIsLoading(false)

        return onNext(...args)
      })
      .catch(() => {

        setIsLoading(false)
      })

    return promise
  }

  function onDragStart(event, uiData) {
    const { clientWidth, clientHeight } = window.document.documentElement;

    // let mainElem = document.getElementById('main')

    // const targetRect = mainElem.getBoundingClientRect();
    const targetRect = wrapperRef.current.getBoundingClientRect();
    setDragBounds({
        left: -targetRect.left + uiData.x,
        right: clientWidth - (targetRect.right - uiData.x),
        top: -targetRect.top + uiData.y,
        bottom: clientHeight - (targetRect.bottom - uiData.y)
      })


  }

  return createPortal(
    <TC.Wrapper
    id={'tooltip'}
    ref={wrapperRef}
    isMoving={isMoving}
    themeBackgroundColor={themeBackgroundColor}
    themeTextColor={themeTextColor}
    tooltipX={displayX}
    tooltipY={displayY}
    visible={isVisible}
    arrowColor={themeBackgroundColor}
    $isDraggable={isNoneMode && isInEditor}
    $useContainerPosition={useContainerPosition}
    onClick={(e) => {
      e.stopPropagation()
    }}

    // draggable={true}
    // onDrag={function (event) {
    //
    //
    //   setTooltipX(event.clientX - event.currentTarget.clientWidth)
    //   setTooltipY(event.clientY - event.currentTarget.clientHeight)
    // }}
          // additionalStyles={additionalStyles}

        >
    <TooltipContentEditor
      liveDemo={liveDemo}
      continuous={true}
      index={liveIndex}
      view={liveView}
      size={size}
      onBack={onBack}
      onNext={isInEditor ? () => {} : onNext}
      onSkip={onSkip}
      isInEditor={isInEditor}
      themeBackgroundColor={themeBackgroundColor}
      themeTextColor={themeTextColor}
      themeButtonBackgroundColor={themeButtonBackgroundColor}
      themeButtonTextColor={themeButtonTextColor}
      themeOverlayBackgroundColor={themeOverlayBackgroundColor}
      textFontSize={textFontSize}
      showFooter={showFooter}
      showStepNumbers={showStepNumbers}
      // headerOnMouseDown={() => {
      //   if (step.view.viewType !== 'Pointer') {
      //     setIsTooltipDragging(true)
      //   }
      // }
      // }
      onClick={() => {
        // Editor tooltip is for editing — never advance the walkthrough.
        // Same guard as HotspotStepEditor; otherwise drag/click leaves the screen.
      }}
    />
          <TC.Arrow ref={arrowRef} isArrowShown={isArrowShown} id={'arrow'} data-popper-arrow></TC.Arrow>
        </TC.Wrapper>,
    useContainerPosition ? noneModePortalContainer : portalRoot
  )



}

function getBoxShadow(themeColor) {
  return `${themeColor}66 -5px 5px, ${themeColor}4D  -10px 10px, ${themeColor}33 -15px 15px, ${themeColor}1A -20px 20px, ${themeColor}0D -25px 25px;`
}

const TC = {
  Arrow: styled.div`
    display: block;
    visibility: ${({isArrowShown}) => isArrowShown ? 'visible' : 'hidden'} !important;

    &&::before {
        visibility: ${({isArrowShown}) => isArrowShown ? 'visible' : 'hidden'} !important;
    }

    //display: none;
  `,
  CaptchaWrapper: styled.div`
    width: 100%;
    height: 65px;
    position: relative;
  `,
  ReCAPTCHA: styled(ReCAPTCHA)`
    .grecaptcha-badge {
      position: absolute;
      top: 10px;
      left: 30px;
      transform: scale(0.9);
    }

  `,
  CaptchaNotice: styled.p`
    font-size: 0.8em;
  `,
  ContentWrapper: styled.div`
    width: 100%;
    overflow-y: auto;
    // max-height: 200px;
    display: block;
    font-size: 15px;



    &&::-webkit-scrollbar-track {
      //-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
      background-color: #F9F9F9;
    }

    &&::-webkit-scrollbar {
      width: 5px;
      background-color: #F9F9F9;
    }

    &&::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: ${Colors.primaryColor};
    }


  `,
  IntermidateDragger: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    //
    //top: 50%;
    //left: 50%;

    max-width: 100%;
    width: 400px;
    padding: 50px;

    //border: 1px solid black;
    //transition: 0.4s all ease-out;
    // transition: ${({isMoving}) => isMoving ? 'none' : '0.4s all ease-out'};

        // Center
    z-index: 3;

    position: fixed;
    // left: ${(props) => `calc(50% - ${225 * props.scalePercentage}px)`};
    // top: ${(props) => `calc(50% - ${200 * props.scalePercentage}px)`};
    // left: ${(props) => `calc(50%)`};
    // top: ${(props) => `calc(50%)`};

    // transform: ${(props) => props.scalePercentage ? `scale(${props.scalePercentage})` : ''};

  `,
  DraggerWrapper: styled.div`
    transition: ${({ isMoving }) => isMoving ? 'none' : '0.4s all ease-in-out'};
    // transform: ${(props) => props.scalePercentage ? `scale(${props.scalePercentage})`: ''};
    //transform-origin: top left;


  `,
  WrapperInner: styled.div`

    //transform-origin: top left;

    // transform: ${(props) => props.additionalStyles ? props.additionalStyles.transform : 'translate(-50%, -50%)'};

  `,
  Wrapper: styled.div.withConfig({
    shouldForwardProp: (prop) => !['tooltipX', 'tooltipY', 'visible', 'themeBackgroundColor', 'themeTextColor', 'arrowColor', 'isMoving', '$isDraggable', '$useContainerPosition'].includes(prop),
  })`
    //width: 100%;
    //height: auto;
    transition: ${({ isMoving }) => (isMoving ? 'none' : 'transform 0.4s ease-in-out')};

    position: ${({ $useContainerPosition }) => $useContainerPosition ? 'absolute' : 'fixed'};
    top: 0;
    left: 0;
    z-index: 999999;
    pointer-events: ${({ $isDraggable }) => $isDraggable ? 'auto !important' : 'auto'};
    cursor: ${({ $isDraggable }) => $isDraggable ? 'move' : 'auto'};
    user-select: ${({ $isDraggable }) => $isDraggable ? 'none' : 'auto'};

    transform-origin: top left;
    transform: translate3d(${({tooltipX}) => Math.round(tooltipX)}px, ${({tooltipY}) => Math.round(tooltipY)}px, 0);

    font-size: 15px;
    font-family: var(--ld-demo-font, ${Colors.fontFamilyApple});

    visibility: ${({visible}) => visible ? 'visible' : 'hidden'};

    -webkit-font-smoothing: antialiased !important;
    -moz-osx-font-smoothing: grayscale;
    -webkit-backface-visibility: hidden !important;
    backface-visibility: hidden !important;

    //width: 450px;
    width: max-content;
    //width: 29vw;
    height: auto;

    background: ${({themeBackgroundColor}) => themeBackgroundColor};
    //background: #2734c5;
    //background: #f8f8f8;
    border-radius: 5px;
    overflow: visible;
    box-sizing: border-box;
    color: ${({themeTextColor}) => themeTextColor};
    //position: relative;
    border: 1px solid ${({themeBackgroundColor}) => themeBackgroundColor};

    #arrow {
      position: absolute;
      width: 18px;
      height: 18px;
      visibility: hidden;
      margin: 0;
    }

    &&[data-popper-placement^='right'] > #arrow {
      right: -4px;
      top: 50%;
      margin-top: -9px;
      left: auto;
      bottom: auto;
    }

    &&[data-popper-placement^='left'] > #arrow {
      left: -4px;
      top: 50%;
      margin-top: -9px;
      right: auto;
      bottom: auto;
    }

    &&[data-popper-placement^='bottom'] > #arrow {
      bottom: -4px;
      left: 50%;
      margin-left: -9px;
      top: auto;
      right: auto;
    }

    &&[data-popper-placement^='top'] > #arrow {
      top: -4px;
      left: 50%;
      margin-left: -9px;
      bottom: auto;
      right: auto;
    }

    #arrow::before {
      position: absolute;
      width: 18px;
      height: 18px;
      background: ${({themeBackgroundColor}) => themeBackgroundColor};
      // background: ${Colors.primaryColor};
    }

    #arrow::before {
      visibility: visible;
      content: '';
      transform: rotate(45deg);
    }



    &&[data-popper-placement^='bottom'] > #arrow:before {
      background: linear-gradient(135deg, rgba(2,0,36,0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
    }

    &&[data-popper-placement^='top'] > #arrow:before {
      background: linear-gradient(-45deg, rgba(2,0,36,0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
    }

    &&[data-popper-placement^='right'] > #arrow:before {
      background: linear-gradient(45deg, rgba(2,0,36,0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
    }

    &&[data-popper-placement^='left'] > #arrow:before {
      background: linear-gradient(45deg, ${({arrowColor}) => arrowColor} 50%, rgba(2,0,36,0) 51%, rgba(2,0,36,0) 100%);
    }


    //
    // &&:hover {
    //  box-shadow: 0px 0px 0px 1px ${props => props.themeColor};
    // }
  `,
  HeaderWrapper: styled.div`
    cursor: ${({isMovable}) => isMovable ? 'move' : 'auto'};

    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: ${(props) => props.isActive ? '85px' : '34px'};
    padding: 20px;
    position: relative;
    //border-bottom: 1px solid #d3d3d3;


  `,
  SpinnerWrapper: styled.div`
    height: 200px;
  `,
  CloseIcon: styled(CloseOutlined)`
    position: absolute;
    right: 15px;
    top: 15px;
    cursor: pointer;

    && svg {
      transition: 0.3s ease-in-out;
      fill: #a1a1a1;
    }

    &&:hover svg {
      fill: #f9f9f9;
    }
  `,
  ProfileImageWrapper: styled.span`
    width: 48px;
    height: 48px;
    border: 1px solid ${({themeBackgroundColor}) => themeBackgroundColor};
    border-radius: 50%;

    position: relative;
  `,
  ProfileImage: styled.img`


    width: 4.4vw;
    height: 4.4vw;
    //border: 1px solid #1070ff;
    border-radius: 50%;

    box-shadow: rgb(255 255 255) 0px 0px 0px 3px;
    border: 3px solid #fff;
    outline: 2px solid #1070ff;

  `,
  ProfileName: styled.p`
    color: ${({themeTextColor}) => themeTextColor};
    display: inline-block;
    margin: 0px;
    //font-size: 1em;
    font-family: monospace;
    //color: rgb(104, 104, 104);
    font-weight: 550;
    font-size: 0.85rem;

    @media (max-width: 1040px) {
      font-size: 12px;
    }

    @media (max-width: 540px) {
      font-size: 14px;
    }


    @media (min-width: 1040px) {
      font-size: 1.1vw;
    }

  `,
  ProfileText: styled.p`
    margin: 0px 0px 0px 16px;

    font-family: monospace;
    font-weight: 550;
    font-size: 0.75rem;

    @media (max-width: 1040px) {
      font-size: 12px;
    }

    @media (max-width: 540px) {
      font-size: 14px;
    }


    @media (min-width: 1040px) {
      font-size: 1.1vw;
    }
  `,

  LeftButtonsWrapper: styled.span`

  `,
  RightButtonsWrapper: styled.span`

  `,
  TooltipFooter: styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-top: 15px;

    padding: 5px 15px 15px 15px;
  `,
  SkipButton: styled.button`
    background-color: transparent;
    border: 0px;
    border-radius: 0px;
    color: ${({themeTextColor}) => themeTextColor};
    cursor: pointer;
    font-size: 1.2vw;
    line-height: 1;
    padding: 8px;
    appearance: none;
    margin-left: auto;
    margin-right: 5px;
    //font-weight: 600;

    @media (max-width: 640px) {
      display: none;
    }

  `,
  BackButton: styled.button`
    background-color: transparent;
    border: 0px;
    border-radius: 0px;
    color: ${(props) => props.themeTextColor};
    //color: #f9f9f9;

    cursor: pointer;
    font-size: 1.2vw;
    line-height: 1;
    padding: 8px;
    appearance: none;
    margin-left: auto;
    margin-right: 5px;
    font-weight: 600;


  `,
  TooltipButton: styled(Button)`

  `,
  NextButton: styled.button`
    background-color: ${(props) => props.themeButtonBackgroundColor};
    border: 0px;
    border-radius: 4px;
    //color: rgb(255, 255, 255);
    color: ${({themeButtonTextColor}) => themeButtonTextColor};

    cursor: pointer;
    font-size: 1.2vw;
    line-height: 1;
    padding: 8px;
    appearance: none;
    //margin-right: 15px;
    font-weight: 600;

  `,
  FormattedMessage: styled.p`
    margin: 0px;
  `,
  TooltipTitle: styled.p`
    margin: 0px;
    font-size: 0.85em;
  `,

  TooltipContent: styled.span`
    //font-family: 'Gagalin', sans-serif;
    //font-size: 1.5em;

    color: ${({themeTextColor}) => themeTextColor};
    line-height: 1.4;
    text-align: center;

    margin-top: 15px;

    && ul,
    && ol {
      padding-left: 15px;
    }
  `
}


export default TooltipComponentEditor
