import React, { createRef, useEffect, useMemo, useRef, useState } from 'react'
// import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'
import styled from 'styled-components'
import { CaretRightOutlined, ForwardOutlined, LockFilled, ReloadOutlined } from '@ant-design/icons'
import Colors from '../constants/mainColors.js'
import ScreenTransitionTypes from '../constants/ScreenTransitionTypes.js'
import Confetti from 'react-confetti'
import axios from 'axios'
import ENV from './config.json'
import Spinner from './injectScriptComponents/Spinner/Spinner.js'
import TooltipComponent from './injectScriptComponents/TooltipComponentFloaterUI/TooltipComponent.js'
import TooltipComponentEditor from './injectScriptComponents/TooltipComponentFloaterUI/TooltipComponentEditor.js'
import EditText from './injectScriptComponents/EditText/EditText.js'
import HotspotTransition from './injectScriptComponents/HotspotTransition/HotspotTransition.js'
import PointerTransition from './injectScriptComponents/PointerTransition/PointerTransition.js'
import HotspotStep from './injectScriptComponents/HotspotStep/HotspotStep.js'
import HotspotStepEditor from './injectScriptComponents/HotspotStep/HotspotStepEditor.js'
import Regions from './injectScriptComponents/Regions/Regions.js'
import RegionsEditor from './injectScriptComponents/Regions/RegionsEditor.js'
import ZoomSpans from './injectScriptComponents/ZoomSpans/ZoomSpans.js'
import Hls from 'hls.js'
import TippyModule from '@tippyjs/react'
import 'antd/reset'
import * as storyHelpers from '../utils/storyHelpers.js'

import {
  deriveRenderSteps,
  getIframeLoadedScreenId,
  getScreenIndex,
  getStepAndScreenByStepIndex,
  setupSessionRecording,
  waitForElementInTop
} from './helpers.js'
import IframeComponent from './injectScriptComponents/IframeComponent/IframeComponent.js'
// import {useStateWithCallbackLazy} from 'use-state-with-callback'
import PopupComponenet from "./injectScriptComponents/PopupComponent/PopupComponent.js";
import RoundAudioPlayer from './injectScriptComponents/RoundAudioPlayer/RoundAudioPlayer.js'
import RoundAudioPlayerEditor from "./injectScriptComponents/RoundAudioPlayerEditor/RoundAudioPlayerEditor.js";
import AutoPlayToggle from "./injectScriptComponents/AutoPlayToggle/AutoPlayToggle.js";
import Cursor from "./injectScriptComponents/Cursor/Cursor.js";
import VideoCursor from './injectScriptComponents/VideoCursor/VideoCursor.js'
import DebugCursor from './injectScriptComponents/DebugCursor/DebugCursor.js'
import ScreenTypes from '../constants/ScreenTypes.js'
import StoryTypes from '../constants/StoryTypes.js'

import CloseIcon from './assets/icons/closeIcon.svg'
import MinimizeIcon from './assets/icons/minimizeIcon.svg'
import MaximizeIcon from './assets/icons/maximizeIcon.svg'
import './custom.css'
import StepAutoPlayTypes from "../constants/StepAutoPlayTypes.js";
import ZoomSpansEditor from './injectScriptComponents/ZoomSpans/ZoomSpansEditor.js'

// const { Option } = Select // Removed - deprecated in Ant Design v6, use items prop instead
// const AutoCompleteOption = AutoComplete.Option // Removed - deprecated in Ant Design v6, use options prop instead
import AddAudio from "./injectScriptComponents/AddAudio/AddAudio.js";

// Ensure we get the actual component (handle both default and named exports)
const Tippy = TippyModule?.default || TippyModule


/** Set to `true` to show the ScreenStudio-style debug cursor (mouse-driven; does not use Cursor.js). */
const ENABLE_DEBUG_CURSOR = false

const MAIN_VIEWS = {
  IMAGES: 'IMAGES',
  VIDEO: 'VIDEO',
  IFRAME: 'IFRAME'
}

const STEP_VIEWS = {
  HOTSPOT: 'hotspot',
  POINTER: 'pointer',
  POPUP: 'popup'
}

const ANCHOR_TYPES = {
  TRANSITION: 'transition',
  STEP: 'step'
}

const REGION_TYPES = {
  step: 'step',
  transition: 'transition'
}

const HOTSPOT_SIZE = 90


let checkForElement = function (selector) {
  return new Promise((resolve, reject) => {

    let int = null

    int = setInterval(() => {

      let elem = window.frames[0].document.querySelector(selector)
      if (elem) {
        clearInterval(int)
        resolve(elem)
      }

    }, 2000)

    setTimeout(() => {
      clearInterval(int)
      reject('nothing found')
    }, 10000)

  })
}

let getInitialSelector = function (steps) {
  let selector = steps.find(s => s.view.selector !== 0).view.selector

  return selector
}

function extractHotspotTransitions(screen) {

  let newHotspotTransitions = JSON.parse(JSON.stringify(screen.customTransitions)).filter(transition => transition.type === ScreenTransitionTypes.HOTSPOT)
    .map(transition => {
      transition.screenId = screen._id
      return transition
    })

  return newHotspotTransitions
}

function extractPointerTransitions(screen) {

  let newPointerTransitions = JSON.parse(JSON.stringify(screen.customTransitions)).filter(transition => transition.type === ScreenTransitionTypes.POINTER)
    .map(transition => {
      transition.screenId = screen._id
      return transition
    })

  return newPointerTransitions
}


function WalkthroughComponent({
  steps,
  storyDemo,
  firstScreenId,
  workspaceId,
  storyId,
  isEmbed,
  isSessionRecordingDisabled,
  isEditor = false,
  width = window.innerWidth,
  height = window.innerHeight,
  config,

  authData = {},
  reloadStoryDemo = () => {
  }
}) {

  // console.log('storyDemo')
  // console.log(storyDemo)

  let originalMainRefRect = useRef({})

  let isInfullScreenMode = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen; // This will return true or false depending on if it's full screen or not.


  let storyConfig = config ? config : window.config

  // Memoize initial dimensions to prevent unnecessary recalculations
  const initialWidth = useMemo(() => width ? width : window.innerWidth, [width])
  const initialHeight = useMemo(() => height ? height : window.innerHeight, [height])

  let [innerWidthState, setInnerWidthState] = useState(initialWidth)
  let [innerHeightState, setInnerHeightState] = useState(initialHeight)

  // Memoize the dimensions to prevent unnecessary re-renders
  const memoizedInnerWidth = useMemo(() => innerWidthState, [innerWidthState])
  const memoizedInnerHeight = useMemo(() => innerHeightState, [innerHeightState])

  // Use memoized dimensions for calculations
  let innerWidth = memoizedInnerWidth
  let innerHeight = memoizedInnerHeight

  // let innerWidth = width ? width : window.innerWidth
  // let innerHeight = height ? height : window.innerHeight

  // let innerWidth = width && !isInfullScreenMode ? width : window.innerWidth
  // let innerHeight = height && !isInfullScreenMode ? height : window.innerHeight

  let [amountOfInitialPosts, setAmountOfInitialPosts] = useState(0)

  let [stepsState, setStepsState] = useState(steps)
  let stepsInternalRef = useRef(steps)

  function setStepsInternal(newSteps) {
    setStepsState(newSteps)
    stepsInternalRef.current = newSteps

    let initialPosts = 0
    let foundNotPost = false
    newSteps.forEach((step, index) => {
      if (!foundNotPost && step.view && step.view.viewType === STEP_VIEWS.POPUP) {
        initialPosts += 1
      } else {
        foundNotPost = true
      }
    })

    setAmountOfInitialPosts(initialPosts)
  }

  let wrapperRef = useRef(null)
  let onWrapperRefSetup = function (ref) {
    if (ref) {

      console.log(`set inner values - ${ref.offsetWidth} x ${ref.offsetHeight}`)

      setInnerWidthState(ref.offsetWidth)
      setInnerHeightState(ref.offsetHeight)
      wrapperRef.current = ref

      wrapperRefRect.current = wrapperRef.current.getBoundingClientRect()

    }
  }
  let stepsWrapperRef = useRef(null)

  let [isInEditor, _setIsInEditor] = useState(isEditor)
  let isInEditorRef = useRef(isEditor)
  let setIsInEditor = (value) => {
    isInEditorRef.current = value
    _setIsInEditor(value)
  }

  let [storyDemoState, setStoryDemoState] = useState(storyDemo)
  let storyDemoInternalRef = useRef(storyDemo)
  let setStoryDemoInternal = (demo) => {

    // console.log('setStoryDemoInternal')
    // console.log(demo)
    if (demo) {

      let newSteps = deriveRenderSteps(demo)

      setStepsInternal(newSteps)

      let currentStep = newSteps[currentStepIndexRef.current]

      // To handle Delete Screen
      if (!currentStep) {
        let newIndexLast = newSteps.length - 1
        currentStep = newSteps[newIndexLast]
        currentStepIndexRef.current = newIndexLast

        let screenFromDemo = demo.screens.find(scr => scr._id === currentStep.screenId)

        currentScreenIdRef.current = screenFromDemo._id
        currentScreenRef.current = screenFromDemo

        storyDemoInternalRef.current = demo
        setStoryDemoState(demo)

        // forceUpdate()

        processStep(currentStepIndexRef, videoRef, storyDemoInternalRef, newSteps)
      }

      let screenFromDemo = demo.screens.find(scr => scr._id === currentStep.screenId)

      currentScreenIdRef.current = screenFromDemo._id
      currentScreenRef.current = screenFromDemo

      if (screenFromDemo) {

        storyConfig.TRANSITIONS[screenFromDemo._id] = screenFromDemo.customTransitions

        let newHotspotTransitions = extractHotspotTransitions(screenFromDemo)

        setHotspotTransitions(newHotspotTransitions)

        let newPointerTransitions = extractPointerTransitions(screenFromDemo)

        setPointerTransitions(newPointerTransitions)

        let shouldShowRegions = calculateShouldShowRegions(currentStep, currentScreenRef)
        setShowRegions(shouldShowRegions)

        setupTransitionRegions(newPointerTransitions.concat(newHotspotTransitions), screenFromDemo._id)
        setupPointerTransitions(newPointerTransitions)


        let stepFromDemo = screenFromDemo.steps && screenFromDemo.steps.find(stepIter => stepIter._id === currentStep._id)

        if (stepFromDemo) {
          // setup stepAudio if exists
          if (stepFromDemo.stepAudioId && stepFromDemo.stepAudioId._id) {
            setStepAudio(stepFromDemo.stepAudioId)
          } else {
            setStepAudio(null)
          }
          stepsInternalRef.current[currentStepIndexState] = stepFromDemo

          setupStepRegions(stepFromDemo, screenFromDemo._id)
          setStepIsOverlayEnabled(stepFromDemo.view && stepFromDemo.view.popup && stepFromDemo.view.popup.showOverlay || false)
        }


      }


      storyDemoInternalRef.current = demo
      setStoryDemoState(demo)
    }
  }

  useEffect(() => {

    setStoryDemoInternal(storyDemo)

  }, [storyDemo])

  let fullWidth = (storyDemoInternalRef.current.windowMeasures && storyDemoInternalRef.current.windowMeasures.innerWidth) || storyDemoInternalRef.current.tabInfo.width
  let fullHeight = (storyDemoInternalRef.current.windowMeasures && storyDemoInternalRef.current.windowMeasures.innerHeight) || storyDemoInternalRef.current.tabInfo.height

  let [videoRatioWidth, setVideoRatioWidth] = useState(window.innerWidth)
  let [videoRatioHeight, setVideoRatioHeight] = useState(window.innerHeight)

  let [iframeSrc, setIframeSrc] = useState('about:blank')
  let [iframeSize, setIframeSize] = useState({ width: 0, height: 0 })
  let iframeRef = useRef(null)
  let mainRef = useRef(null)


  let mainRefRect = useRef(null)
  let wrapperRefRect = useRef(null)
  let videoRefRect = useRef(null)

  let [iframeScreenId, setIframeScreenId] = useState(firstScreenId)

  const [showTooltip, setShowTooltip] = useState(false)
  const [showTransitions, setShowTransitions] = useState(false)

  let [showSpinner, setShowSpinner] = useState(false)
  let [stepBlobs, setStepBlobs] = useState({})

  const themeStepBackgroundColor = (storyDemoInternalRef.current.custom && storyDemoInternalRef.current.custom.theme && storyDemoInternalRef.current.custom.theme.stepBackgroundColor) || Colors.primaryColor
  const themeTextColor = (storyDemoInternalRef.current.custom && storyDemoInternalRef.current.custom.theme && storyDemoInternalRef.current.custom.theme.textColor) || '#FFFFFF'
  const themeButtonBackgroundColor = (storyDemoInternalRef.current.custom && storyDemoInternalRef.current.custom.theme && storyDemoInternalRef.current.custom.theme.buttonBackgroundColor) || Colors.primaryColor
  const themeButtonTextColor = (storyDemoInternalRef.current.custom && storyDemoInternalRef.current.custom.theme && storyDemoInternalRef.current.custom.theme.buttonTextColor) || '#FFFFFF'
  const themeWatermarkConfigIsActive = (storyDemoInternalRef.current.custom &&
    storyDemoInternalRef.current.custom.theme &&
    storyDemoInternalRef.current.custom.theme.watermarkConfig &&
    storyDemoInternalRef.current.custom.theme.watermarkConfig.isActive) || false
  const themeWatermarkConfigText = (storyDemoInternalRef.current.custom &&
    storyDemoInternalRef.current.custom.theme &&
    storyDemoInternalRef.current.custom.theme.watermarkConfig &&
    storyDemoInternalRef.current.custom.theme.watermarkConfig.text) || 'LiveDemo'
  const themeWatermarkConfigImageUrl = (storyDemoInternalRef.current.custom &&
    storyDemoInternalRef.current.custom.theme &&
    storyDemoInternalRef.current.custom.theme.watermarkConfig &&
    storyDemoInternalRef.current.custom.theme.watermarkConfig.imageUrl) || ''
  const themeWatermarkConfigUrl = (storyDemoInternalRef.current.custom &&
    storyDemoInternalRef.current.custom.theme &&
    storyDemoInternalRef.current.custom.theme.watermarkConfig &&
    storyDemoInternalRef.current.custom.theme.watermarkConfig.url) || 'https://livedemo.ai'

  const confettiOnLastStep = (storyDemoInternalRef.current.custom && storyDemoInternalRef.current.custom.misc && storyDemoInternalRef.current.custom.misc.confettiOnLastStep) || false
  const isOmniBarDisabled = (storyDemoInternalRef.current.custom && storyDemoInternalRef.current.custom.misc && storyDemoInternalRef.current.custom.misc.isOmniBarDisabled) || false
  const isLiveDemoWatermarkEnabled = (storyDemoInternalRef.current.custom && storyDemoInternalRef.current.custom.misc && storyDemoInternalRef.current.custom.misc.isLiveDemoWatermarkEnabled) || false
  const isTabsEnabled = (storyDemoInternalRef.current.custom && storyDemoInternalRef.current.custom.misc && storyDemoInternalRef.current.custom.misc.isTabsEnabled) || false

  const urlParams = new URLSearchParams(window.location.search);
  const autoPlayParam = urlParams.get('autoplay');
  const autoPlayDelayParam = urlParams.get('autoplayDelay');
  const [isAutoPlayActive, _setIsAutoPlayActive] = useState(autoPlayParam === 'true')
  const isAutoPlayActiveRef = useRef(autoPlayParam === 'true')
  const currentAutoPlayTimerRef = useRef(null)

  const DEFAULT_AUTOPLAY_DELAY = 2 * 1000
  let AutoPlayDelay = DEFAULT_AUTOPLAY_DELAY

  try {
    AutoPlayDelay = parseFloat(autoPlayDelayParam) * 1000
  } catch (e) {
    AutoPlayDelay = DEFAULT_AUTOPLAY_DELAY
    console.log("couldn't parse autoplayDelay param")
  }
  if (!!AutoPlayDelay === false) {
    AutoPlayDelay = DEFAULT_AUTOPLAY_DELAY
  }

  function setIsAutoPlayActive(newValue) {
    _setIsAutoPlayActive(newValue)
    isAutoPlayActiveRef.current = newValue

    if (newValue) {

      setTimeout(() => {
        onNext()
      }, AutoPlayDelay)
    }
  }

  const autoPlayTimerRef = useRef(null)

  const isAudioEnabled = true

  let omniBarHeight = isOmniBarDisabled ? 0 : 40

  let scalePercentageWidth = innerWidth / fullWidth
  let scalePercentageHeight = Math.min(1, (innerHeight - omniBarHeight) / fullHeight)


  // if(window.innerHeight < height) {
  //     width = (window.innerHeight - omniBarHeight) * (width / (height - omniBarHeight))
  //     height = window.innerHeight - omniBarHeight
  // }

  // if (window.innerWidth < width) {
  //     height = window.innerWidth * ((height - omniBarHeight) / width)
  //     width = window.innerWidth
  // }
  //
  // innerWidth = width
  // innerHeight = height
  //
  // let scalePercentageWidth = innerWidth / fullWidth
  // let scalePercentageHeight = Math.min(1, (innerHeight - omniBarHeight) / fullHeight)

  let [isFullScreen, setIsFullScreen] = useState(false)

  let navWrapperRef = useRef(null)
  let videoSourceRef = useRef(null)

  let eventsRef = useRef([])

  let stepTooltipRef = useRef(null)

  let isTooltipDragging = useRef(null)
  let setIsTooltipDragging = function (isDragging) {
    isTooltipDragging.current = isDragging
  }

  let tooltipDefaultWidth = 400
  let tooltipDefaultHeight = 200

  let vwSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  let [stepTooltipX, setStepTooltipX] = useState((vwSize.width / 2) - (tooltipDefaultWidth))
  let [stepTooltipY, setStepTooltipY] = useState((vwSize.height / 2) - (tooltipDefaultHeight))


  const [updateStateVar, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  let screenshotScreens = stepsInternalRef.current.filter(step => step.screenType === 'Screen_Screenshot')

  screenshotScreens = [
    ...new Map(
      screenshotScreens.map(item =>
        [item['screenId'], item]
      )
    ).values()
  ]

  // console.log('screenshotScreens')
  // console.log(screenshotScreens)

  let videoRef = useRef(null)
  window.videoRef = videoRef

  const currentStepIndexRef = useRef(storyConfig.currentStepIndex || 0)

  function setCurrentStepIndexRef(value) {
    // console.log('setCurrentStepIndexRef')
    // console.log(value)

    currentStepIndexRef.current = value
  }

  const [currentStepIndexState, setCurrentStepIndexState] = useState(storyConfig.currentStepIndex || 0)

  const previousStepIndexRef = useRef(-1)

  let [step, _setStep] = useState(steps[currentStepIndexState])
  let stepRef = useRef(steps[currentStepIndexState])
  let [prevStep, _setPrevStep] = useState(currentStepIndexState > 0 ? steps[currentStepIndexState - 1] : null)
  let prevStepRef = useRef(currentStepIndexState > 0 ? steps[currentStepIndexState - 1] : null)

  function setStep(newStep) {
    // Save the current step as previous BEFORE updating
    const oldStep = stepRef.current

    prevStepRef.current = oldStep
    _setPrevStep(oldStep)

    stepRef.current = newStep
    _setStep(newStep)
  }

  // console.log('step set')
  let currentScreenIdRef = useRef(iframeScreenId)

  let currentScreenDoc = storyDemoInternalRef.current.screens.find(scr => scr._id === currentScreenIdRef.current)
  let currentScreenRef = useRef(currentScreenDoc)
  currentScreenRef.current = currentScreenDoc

  let [stepPointerInfo, setStepPointerInfo] = useState(null)

  let shouldShowRegions = calculateShouldShowRegions(step, currentScreenRef)
  let [showRegions, setShowRegions] = useState(shouldShowRegions)

  let [stepIsOverlayEnabled, setStepIsOverlayEnabled] = useState(false)


  // state for selectRegions
  // Same denominators as fullWidth/fullHeight: viewport CSS px (windowMeasures), not chrome.tabs size.
  let tabInfoWidth =
    (storyDemoInternalRef.current.windowMeasures && storyDemoInternalRef.current.windowMeasures.innerWidth) ||
    (storyDemoInternalRef.current.tabInfo && storyDemoInternalRef.current.tabInfo.width) ||
    1366
  let tabInfoHeight =
    (storyDemoInternalRef.current.windowMeasures && storyDemoInternalRef.current.windowMeasures.innerHeight) ||
    (storyDemoInternalRef.current.tabInfo && storyDemoInternalRef.current.tabInfo.height) ||
    664

  let [editorShowRegions, setEditorShowRegions] = useState(true)

  const shownImageId = useRef('')


  const transitions = currentScreenRef.current.customTransitions ? currentScreenRef.current.customTransitions : []

  const [hotspotTransitions, setHotspotTransitions] = useState(extractHotspotTransitions(currentScreenRef.current))
  const [pointerTransitions, setPointerTransitions] = useState(extractPointerTransitions(currentScreenRef.current))

  function clearTransitions() {

    setHotspotTransitions([])
    setPointerTransitions([])
  }

  let transitionTooltipRefs = useRef(pointerTransitions
    .map(tans => {
      return createRef()
    })
  )

  // let [transitionPointerInfos, setTransitionPointerInfos] = useState(pointerTransitions.reduce((accum, transition) => {
  //   if(transition.type === ScreenTransitionTypes.POINTER) {
  //     accum[transition._id] = {}
  //   }
  //   return accum
  // }, {}))

  let [transitionPointerInfos, setTransitionPointerInfos] = useState([])


  let originalWidth = (storyDemoInternalRef.current.windowMeasures && storyDemoInternalRef.current.windowMeasures.innerWidth) || storyDemoInternalRef.current.tabInfo.width
  let originalHeight = (storyDemoInternalRef.current.windowMeasures && storyDemoInternalRef.current.windowMeasures.innerHeight) || storyDemoInternalRef.current.tabInfo.height

  let widthDimensionPercentage = innerWidth / originalWidth
  let heightDimensionPercentage = innerHeight / originalHeight

  let tooltipElemAnchorsWrapperRef = useRef(null)
  let [tooltipElemAnchors, setTooltipElemAnchors] = useState({})

  const [showSpeedupIcon, setShowSpeedupIcon] = useState(false)
  const [showPauseIcon, setShowPauseIcon] = useState(false)

  const [stepRegions, setStepRegionsInternal] = useState([])
  const stepRegionsRef = useRef([])


  const [stepAudio, setStepAudio] = useState(null)

  const audioHasPlayedRef = useRef(false)
  const [audioHasPlayed, _setAudioHasPlayed] = useState(false)

  function setAudioHasPlayed(audioHasPlayedValue) {
    audioHasPlayedRef.current = audioHasPlayedValue
    _setAudioHasPlayed(audioHasPlayedValue)
  }

  const audioHasStartedRef = useRef(false)
  const [audioHasStarted, _setAudioHasStarted] = useState(false)

  function setAudioHasStarted(audioHasStartedValue) {
    audioHasStartedRef.current = audioHasStartedValue
    _setAudioHasStarted(audioHasStartedValue)
  }

  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  function setStepRegions(newRegions) {
    stepRegionsRef.current = newRegions
    setStepRegionsInternal(newRegions)
  }

  const [transitionRegions, setTransitionRegionsInternal] = useState([])
  const transitionRegionsRef = useRef([])

  function setTransitionRegions(newRegions) {
    // console.log('setTransitionRegions')
    // console.log(newRegions)
    transitionRegionsRef.current = newRegions
    setTransitionRegionsInternal(newRegions)
  }

  const scaleInProgressRef = useRef(false)

  const [voices, setVoices] = useState([])

  const [isScaled, _setIsScaled] = useState(false)
  const isScaledRef = useRef(isScaled)

  function setIsScaled(newIsScaled) {
    isScaledRef.current = newIsScaled
    _setIsScaled(newIsScaled)
  }

  const scaleValuesRef = useRef({
    newLeft: 0,
    newTop: 0,
    scaleValueX: 1
  })


  // let animationClassStop = 'cursor-click-animate-stop'
  let cursorAnimationClass = 'cursor-click-animate'
  const autoCursorRef = useRef(null);
  const autoCursorStateRef = useRef({
    isActive: false
  });

  function clearAutoCursor(currentStep) {
    if (!autoCursorRef.current) {
      return
    }

    let cursorElement = autoCursorRef.current

    if (!(currentStep && currentStep.view) || currentStep.view.viewType !== STEP_VIEWS.HOTSPOT) {
      cursorElement.classList.remove(cursorAnimationClass);
    }
  }

  function moveAutoCursor(posX, posY) {

    if (!autoCursorRef.current) {
      return
    }

    let cursorElement = autoCursorRef.current


    cursorElement.style.left = `${posX}px`;
    cursorElement.style.top = `${posY}px`;


    let innerTimer
    setTimeout(() => {

      cursorElement.classList.add(cursorAnimationClass);
    }, 0.4 * 1000)

  }


  useEffect(() => {

    if (videoRef.current) {
      // Restart video if it has a video and it zooms out or in

      videoRef.current.currentTime = 0

      setTimeout(() => {

        // Scale video on fullscreen on and off
        const currentStep = steps[currentStepIndexRef.current]

        let videoMuxAsset = currentStep.asset
        // if(!videoMuxAsset){
        //     return
        // }

        let ratioArr = videoMuxAsset.aspect_ratio.split(':')

        setVideoRatioWidth(parseInt(ratioArr[0]))
        setVideoRatioHeight(parseInt(ratioArr[1]))

        scaleVideo(isEmbed, videoMuxAsset, videoRef)
      }, 450)

    }

  }, [isFullScreen])

  useEffect(() => {
    if (mainRef.current) {

      mainRefRect.current = mainRef.current.getBoundingClientRect()

      originalMainRefRect.current = mainRef.current.getBoundingClientRect()
    }
  }, [mainRef, mainRef.current, window.innerHeight, window.innerWidth]);
  useEffect(() => {

    storyConfig.run = showTooltip
  }, [showTooltip])

  useEffect(() => {

    setStepsInternal(steps)
    setStep(steps[currentStepIndexState])

  }, [steps])

  // Handle left and right arrow clicks to change step
  useEffect(() => {

    function handle(event) {

      // Skip step navigation when a text editor component is focused
      const activeEl = document.activeElement
      const tag = activeEl && activeEl.tagName
      const isTextInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (activeEl && activeEl.isContentEditable)

      // Also check if focus is inside an iframe with a text editor active
      let isIframeTextInput = false
      if (tag === 'IFRAME') {
        try {
          const iframeActiveEl = activeEl.contentDocument && activeEl.contentDocument.activeElement
          isIframeTextInput = !!(iframeActiveEl && (
            iframeActiveEl.tagName === 'INPUT' ||
            iframeActiveEl.tagName === 'TEXTAREA' ||
            iframeActiveEl.isContentEditable
          ))
        } catch (e) {
          // Cross-origin iframe — skip safely
        }
      }

      if (isTextInput || isIframeTextInput) return

      if (event.keyCode === 37) {
        // Left arrow key pressed
        onBack()
      } else if (event.keyCode === 39) {
        // Right arrow key pressed
        onNext()
      }
    }

    document.addEventListener('keydown', handle);

    return function () {
      document.removeEventListener('keydown', handle)
    }
  }, [])


  useEffect(() => {

    storyConfig.stepBlobs = stepBlobs
  }, [stepBlobs])

  useEffect(() => {

    let screen = storyDemoInternalRef.current.screens.find(scr => scr._id === iframeScreenId)

    if (screen.width) {

      setIframeSize({
        width: screen.width,
        height: screen.height
      })
    }

    currentScreenRef.current = screen


  }, [iframeScreenId])

  useEffect(() => {


    if (isAutoPlayActive) {

      setTimeout(() => {
        onNext()
      }, AutoPlayDelay)
    }

  }, [isAutoPlayActive])

  useEffect(() => {
    setInnerWidthState(window.innerWidth)
    setInnerHeightState(window.innerHeight)

    setupStepRegions(step, currentScreenRef.current._id)
    setupTransitionRegions(currentScreenRef.current.customTransitions, currentScreenRef.current._id)

  }, [window.innerHeight, window.innerWidth])

  useEffect(() => {

    if (isEditor) {

      storyHelpers.getVoices(workspaceId, authData.token)
        .then(voices => {
          setVoices(voices)
        })
    }

    if (isEmbed && !isInEditorRef.current && navigator.doNotTrack !== '1') {
      setupSessionRecording(eventsRef, currentStepIndexRef)
      console.log('setupSessionRecording setup')
    }

    if (navigator.doNotTrack === '1') {
      console.log('doNotTrack enabled - no session recording')
    }

    // Handle fullscreen errors
    function handleError(event) {
      console.error('an error occurred changing into fullscreen');
      // console.log(event);
      setIsFullScreen(false)
    }

    document.addEventListener('fullscreenerror', handleError);
    // Handle exiting fullscreen to refresh view
    document.addEventListener('fullscreenchange', exitHandler, false);
    document.addEventListener('mozfullscreenchange', exitHandler, false);
    document.addEventListener('MSFullscreenChange', exitHandler, false);
    document.addEventListener('webkitfullscreenchange', exitHandler, false);

    function exitHandler() {
      if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        setIsFullScreen(false)

        scaleMain(1, 0, 0)
        //
        // let videoMuxAsset = currentStep.asset
        // let ratioArr = videoMuxAsset.aspect_ratio.split(':')
        //
        //
        // setVideoRatioWidth(parseInt(ratioArr[0]))
        // setVideoRatioHeight(parseInt(ratioArr[1]))


        // setVideoRatioWidth(window.innerWidth)
        // setVideoRatioHeight(window.innerHeight)
        //
        // scaleVideo(isEmbed, videoMuxAsset, videoRef)
      }
    }


    waitForElementInTop('#story_video', 300, 20)
      .then((flixVideoElement) => {

        videoRef.current = flixVideoElement

        videoRefRect.current = videoRef.current.getBoundingClientRect()

        return processStep(currentStepIndexRef, videoRef, storyDemoInternalRef, stepsInternalRef.current)
      })
      .then(() => {


        let stepsWithUniqueScreens = []
        stepsInternalRef.current.forEach(step => {

          if (!stepsWithUniqueScreens.find(uniqueStep => uniqueStep.screenId === step.screenId) && step.screenId !== iframeScreenId) {
            stepsWithUniqueScreens.push(step)
          }

        })

        return Promise.all(stepsWithUniqueScreens.map(step => {
          return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyId}/screens/${step.screenId}/preview`)
            .then(res => {

              if (!res.data.content) {

                return { screenId: step.screenId }
              } else {

                const blobContent = new Blob([res.data.content], { type: 'text/html' })
                let blobUrl = URL.createObjectURL(blobContent)

                return { screenId: step.screenId, blobUrl }

              }

            })
        }))
      })
      .then(blobsArray => {
        let stepBlobsOjb = blobsArray.reduce((accum, elem) => {

          if (elem.blobUrl) {

            accum[elem.screenId] = elem.blobUrl
          }

          return accum
        }, {})


        setStepBlobs({ ...storyConfig.stepBlobs, ...stepBlobsOjb })
      })


    // event listeners
    window.addEventListener('popstate', function (event) {


      if (event.state && event.state.stepNumber) {


        let newStepIndex = event.state.stepNumber - 1
        let { step, screen } = getStepAndScreenByStepIndex(newStepIndex, storyDemoInternalRef.current)
        let screenId = getIframeLoadedScreenId(iframeRef)
        let isTourActive = storyConfig.run

        if (screen._id !== screenId) {


          // changeIframeScreen(window.config.workspaceId, window.config.storyId, screen._id, getIframeLoadedScreenId)
          //   .then(() => {


          // let isReverse = currentStepIndex.current - newStepIndex === 0 ? false : !(currentStepIndex.current - newStepIndex)
          // currentStepIndex.current = newStepIndex
          // processStep(newStepIndex, videoRef, storyDemoInternal.current, steps, isReverse)
          changeStep(newStepIndex, stepsInternalRef.current)


          // })
        } else {

          // let isReverse = currentStepIndex.current - newStepIndex === 0 ? false : !(currentStepIndex.current - newStepIndex)
          // currentStepIndex.current = newStepIndex
          // processStep(newStepIndex, videoRef, storyDemoInternal.current, steps, isReverse)
          changeStep(newStepIndex, stepsInternalRef.current)
        }


      }

    })

    window.addEventListener('message', function (event) {

      // console.log(event)

      if (event.data && event.data.type === 'initEditor') {
        // console.log('initEditor set')
        setIsInEditor(true)
        forceUpdate()
      }


      if (event.data && event.data.type === 'add_step') {

        let newStepData = event.data.stepData

        newStepData.screenId = event.data.screenId

        newStepData.type = event.data.screenType
        newStepData.screenWidth = event.data.screenWidth
        newStepData.screenHeight = event.data.screenHeight

        let prevStepData = event.data.prevStepData
        // let newChangeStepIndex = currentStepIndexRef.current


        let newDemo = JSON.parse(JSON.stringify(storyDemoInternalRef.current))


        let finalStepsAdded = deriveRenderSteps(newDemo)

        let newChangeStepIndex = Math.max(Math.min(event.data.newIndex - 1, finalStepsAdded.length - 1), 0)

        // setStoryDemoInternal(newDemo)
        // setStepsInternal(finalStepsAdded)
        // setupStepRegions(step, currentScreenRef.current._id)

        changeStep(newChangeStepIndex, finalStepsAdded)


      }

      if (event.data && event.data.type === 'delete_step') {


        let delStepData = event.data.stepData
        let newChangeStepIndex = currentStepIndexRef.current - 1

        let newSteps = [...stepsInternalRef.current].reduce((iter, step, currentIndex) => {
          if (step._id !== delStepData._id) {

            iter.push(step)
          } else {
            newChangeStepIndex = currentIndex - 1
          }

          return iter
        }, [])

        setStepsInternal(newSteps)
        changeStep(newChangeStepIndex, newSteps)
      }


      if (event.data && event.data.type === 'changeStep') {

        let stepNumber = event.data.stepNumber

        let stepIndex = stepNumber - 1
        let promiseChain = Promise.resolve()


        let { step, screen } = getStepAndScreenByStepIndex(stepIndex, storyDemoInternalRef.current)
        if (step) {

          if (!isInEditor) {
            window.history.pushState({ stepNumber }, '', `?step=${stepNumber}`)
          }

          let currentScreenId = getIframeLoadedScreenId(iframeRef)

          // if (screen._id !== currentScreenId) {
          //
          //   promiseChain = changeIframeScreen(window.config.workspaceId, window.config.storyId, screen._id, getIframeLoadedScreenId)
          // }

          promiseChain.then(() => {


            // let isReverse = currentStepIndex.current - stepNumber === 0 ? false : !(currentStepIndex.current - stepNumber)
            // currentStepIndex.current = stepNumber
            // processStep(stepNumber, videoRef, storyDemoInternal.current, steps, isReverse)
            changeStep(stepIndex, stepsInternalRef.current)


          })
        } else {


        }


      }

      if (event.data && event.data.type === 'editor_show_regions') {

        setEditorShowRegions(event.data.editorShowRegions)


      }


      if (event.data && event.data.type === 'update_storyDemo') {
        // console.log('update_storyDemo')
        // console.log(event.data.storyDemo)

        let newStoryDemo = event.data.storyDemo

        setStoryDemoInternal(newStoryDemo)
      }

    })

    // Initial setup
    setupTransitionRegions(storyConfig.TRANSITIONS[iframeScreenId], iframeScreenId)
    setupPointerTransitions(pointerTransitions)


    setupStepRegions(step, iframeScreenId)

    return () => {
      document.removeEventListener('fullscreenerror', handleError);

      document.removeEventListener('fullscreenchange', exitHandler, false);
      document.removeEventListener('mozfullscreenchange', exitHandler, false);
      document.removeEventListener('MSFullscreenChange', exitHandler, false);
      document.removeEventListener('webkitfullscreenchange', exitHandler, false);
    }
  }, [])

  // Removed - step is now updated synchronously in processStep to avoid extra renders
  // useEffect(() => {
  //     setStep(stepsInternalRef.current[currentStepIndexState])
  // }, [currentStepIndexState])

  useEffect(() => {

    setStoryDemoInternal(storyDemo)

  }, [storyDemo])

  function addTooltipAnchor(anchorId, type, selectorLocation) {

    console.log('addTooltipAnchor')
    console.log(anchorId)
    console.log(type)
    console.log(selectorLocation)

    let anchorElem = document.createElement('div')
    anchorElem.setAttribute('id', anchorId)
    anchorElem.className = type + '-anchor'

    let elementStyle = `position: absolute; left: 0; top: 0; transform-origin: top left; ` +
      `transform: translateX(${selectorLocation.positionX}px) translateY(${selectorLocation.positionY}px); ` +
      `width: ${selectorLocation.width}px; height: ${selectorLocation.height}px; ` +
      (!isInEditorRef.current ? 'cursor: pointer; z-index: 3; ' : '')


    anchorElem.style = elementStyle

    // if(!isInEditor.current) {
    //   anchorElem.addEventListener('click', () => {
    //     changeStep(currentStepIndex.current + 1, stepsInternal.current)
    //   })
    // }

    tooltipElemAnchorsWrapperRef.current.appendChild(anchorElem)


    let newAnchors = { ...tooltipElemAnchors }
    newAnchors[anchorId] = selectorLocation

    setTooltipElemAnchors(newAnchors)

    return anchorElem
  }

  function removeTooltipAnchor(anchorId) {
    // parentNode.appendChild(childNode);

    let anchorElem = document.getElementById(anchorId)
    if (anchorElem) {
      anchorElem.remove()
    }

    let newAnchors = { ...tooltipElemAnchors }
    delete newAnchors[anchorId]

    setTooltipElemAnchors(newAnchors)
  }

  function clearTooltipAnchors(type) {

    // parentNode.appendChild(childNode);
    let parent = tooltipElemAnchorsWrapperRef.current
    if (!parent) {
      return
    }

    let elements = parent.querySelectorAll(`.${type}-anchor`)

    if (elements) {
      let newTooltipElemAnchors = { ...tooltipElemAnchors }

      elements.forEach(elem => {
        parent.removeChild(elem)

        if (newTooltipElemAnchors[elem.id]) {
          delete newTooltipElemAnchors[elem.id]
        }
      })

      setTooltipElemAnchors(newTooltipElemAnchors)
    }

    // while (parent.firstChild) {
    //   parent.removeChild(parent.firstChild);
    // }

  }


  function scaleVideo(isEmbed, videoAsset, videoRef) {

    if (!mainRefRect.current) {
      console.error('mainRefRect.current not found')
      return
    }

    let mainWrapper = document.getElementById('main')
    let mainWrapperRect = mainRefRect.current

    let videoWrapper = document.getElementById('story_video_wrapper')
    let videoWrapperRect = videoRefRect.current

    let videoTrack = videoAsset.tracks.filter(trk => trk.type === 'video')[0]
    let maxWidth = videoTrack.max_width
    let maxHeight = videoTrack.max_height

    // let innerWidth = isEmbed ? mainWrapperRect.width : window.innerWidth
    // let innerHeight = isEmbed ? mainWrapperRect.height : window.innerHeight

    let innerWidth = mainWrapperRect.width
    let innerHeight = mainWrapperRect.height

    innerWidth = innerWidth - 1
    innerHeight = innerHeight - 1

    let scaleX = innerWidth / maxWidth
    let scaleY = (innerHeight) / maxHeight
    // let scaleY = (innerHeight - omniBarHeight) / maxHeight

    // console.log('scaleX')
    // console.log(scaleX)
    // console.log('scaleY')
    // console.log(scaleY)

    videoWrapper.style.width = `${maxWidth}px`
    videoWrapper.style.height = `${maxHeight}px`
    videoWrapper.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`


    // Add poster
    let thumbnailImage = `https://image.mux.com/${videoAsset.playback_ids[0].id}/thumbnail.png?time=0.1`
    videoRef.current.poster = thumbnailImage
    videoRef.current.style.background = `url("${thumbnailImage}")`
    videoRef.current.style.backgroundSize = `cover`
  }

  function clearStepsAndTransitions() {
    clearTransitions()
    setShowTooltip(false)
    setShowTransitions(false)
    setStepRegions([])
    setTransitionRegions([])
    setStepIsOverlayEnabled(false)

  }

  async function processStep(currentStepIndex, videoRef, storyDocRef, steps, isReverse) {


    let storyDoc = storyDocRef.current

    const currentStep = steps[currentStepIndex.current]
    let prevStep = steps[previousStepIndexRef.current]

    if (!currentStep) {
      let newValue = Math.max(Math.min(currentStepIndex.current, steps.length - 1), 0)
      currentStepIndex.current = newValue

      return
    }

    // step audio
    console.log('step audio')
    console.log('currentStep.stepAudioId')
    console.log(currentStep.stepAudioId)
    if (currentStep.stepAudioId && currentStep.stepAudioId._id) {
      setStepAudio(currentStep.stepAudioId)
    } else {
      setStepAudio(null)
    }

    const video = videoRef.current
    const isLastStep = currentStepIndex.current === steps.length - 1

    const stepFirstTransition = currentStep && currentStep.customTransitions && currentStep.customTransitions[0]
    let screen = storyDoc.screens.find(scr => scr._id === currentStep.screenId)
    let prevScreen = prevStep && storyDoc.screens.find(scr => scr._id === prevStep.screenId)
    const screenFirstTransition = screen && screen.customTransitions && screen.customTransitions[0]


    // Execute before change step
    console.time('p')
    console.timeLog('p')
    await beforeChangeStep(currentStepIndex.current, currentStep, steps, screen, prevScreen)

    // Middle operations based on screen type
    console.log('middlePromise')

    if (currentStep.screenType === 'Screen_Page') {

      // if (!(prevStep && currentStep.screenId === prevStep.screenId)) {

      if (screenFirstTransition) {

        setHotspotTransitions(extractHotspotTransitions(screen))
        setPointerTransitions(extractPointerTransitions(screen))
      } else {
        clearTransitions()
      }
      // }


      if (currentStepIndex.current === 0 || (prevStep && currentStep.screenId !== prevStep.screenId)) {
        await changeIframeScreen(workspaceId, storyId, currentStep.screenId, getIframeLoadedScreenId)
      } else if (!stepBlobs[currentStep.screenId]) {
        await changeIframeScreen(workspaceId, storyId, currentStep.screenId, getIframeLoadedScreenId)
      }

      makeVisible(MAIN_VIEWS.IFRAME, {})
      // React 18 automatically batches state updates, so no need for unstable_batchedUpdates
      if (!showTooltip) {
        setShowTooltip(true)
      }
      setShowTransitions(true)

      console.timeLog('p')
      console.timeEnd('p')

    }
    if (currentStep.screenType === 'Screen_Video' && videoSourceRef.current) {

      let shouldShowRegions = calculateShouldShowRegions(step, currentScreenRef)
      setShowRegions(shouldShowRegions)

      if (isScaledRef.current === true) {
        // if is currently scaled sleep for
      }

      // React 18 automatically batches state updates, so no need for unstable_batchedUpdates
      setShowTooltip(false)
      setShowTransitions(false)
      clearTransitions()

      setupStepRegions(currentStep, screen._id)
      setupTransitionRegions(screen.customTransitions, screen._id)


      // Handle safari blinking
      // if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      //   video.preload = 'auto'
      // }

      let videoMuxAsset = currentStep.asset

      let startTime = currentStep.startTime && currentStep.startTime > 0 ? currentStep.startTime : (isInEditor ? 0 : 0.1)
      let endTime = currentStep.endTime ? currentStep.endTime : videoMuxAsset.duration
      // Handle safari blinking adding #t=0.1 to video url
      let streamUrl = `https://stream.mux.com/${videoMuxAsset.playback_ids[0].id}.m3u8#t=${startTime}`
      let streamUrlMp4 = `https://stream.mux.com/${videoMuxAsset.playback_ids[0].id}/high.mp4#t=${startTime}`
      // https://stream.mux.com/{PLAYBACK_ID}/{high, medium, or low}.mp4

      let ratioArr = videoMuxAsset.aspect_ratio.split(':')

      // React 18 automatically batches state updates, so no need for unstable_batchedUpdates
      setVideoRatioWidth(parseInt(ratioArr[0]))
      setVideoRatioHeight(parseInt(ratioArr[1]))

      scaleVideo(isEmbed, videoMuxAsset, videoRef)

      let hls = new Hls({
        maxBufferLength: 5,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        startLevel: 4,
        autoStartLoad: false,
      })
      hls.attachMedia(video)
      hls.loadSource(streamUrl)

      video.setAttribute('data-video-mp4', streamUrlMp4)
      videoSourceRef.current.src = streamUrlMp4


      let startPosition = startTime ? startTime : 0
      video.playsInline = true
      video.currentTime = startPosition
      hls.startLoad(startPosition)


      let madeVisible = false
      video.onloadeddata = function (e) {
        // if (shownImageId.current !== '') {
        //   video.play()

        if (!isInEditorRef.current) {
          video.play()
        }

        video.playbackRate = currentStep.playbackRate ? currentStep.playbackRate : 1.2
        // console.log('video playbackRate = ' + currentStep.playbackRate)


        makeVisible(MAIN_VIEWS.VIDEO, {})

        // let lastImage = document.getElementById(shownImageId.current)
        // showElem(video)
        //
        // hideElem(lastImage)
        // }


      }


      // hls.on(Hls.Events.MANIFEST_LOADED, () => {
      //   makeVisible(MAIN_VIEWS.VIDEO, {})
      // })

      let savedCurrentStepIndex = currentStepIndex.current

      async function checkIfAudioHasPlayedForVideo(callCount = 0) {
        if (callCount > 30) {
          return
        }

        await delay(500)

        if (audioHasPlayedRef.current) {
          await delay(500)
          return
        } else {
          await checkIfAudioHasPlayedForVideo(++callCount)
        }
      }

      async function onEnded() {

        let isStillOnSamePage = savedCurrentStepIndex === currentStepIndex.current

        if (isStillOnSamePage) {
          currentStepIndex.current += 1
          if (currentStepIndex.current < steps.length) {


            // On video finish check if audio has finished only if there was any audio playing during the video
            if (!isInEditorRef.current) {
              if (audioHasStartedRef.current) {
                await checkIfAudioHasPlayedForVideo()
                await changeStep(currentStepIndex.current, stepsInternalRef.current)
              } else {
                await changeStep(currentStepIndex.current, stepsInternalRef.current)
              }

            }
          }
        }
      }

      if (!isInEditorRef.current) {

        video.ontimeupdate = (e) => {
          // console.log(event)


          let timestampInSeconds = video.currentTime

          // console.log('timestampInSeconds')
          // console.log(timestampInSeconds)

          if (video.currentTime >= endTime) {
            video.pause()
            onEnded()
          }
        }
      }


      video.onended = function () {
        onEnded()
      }

      video.load()


      // makeVisible(MAIN_VIEWS.VIDEO, {})
      // console.log('after make visible')


      //   if(!isInEditorRef.current && rrweb) {
      //     try {
      //
      //       rrweb.record.addCustomEvent('play-video', {
      //         streamUrlMp4: streamUrlMp4,
      //         streamUrl: streamUrl
      //       })
      //     } catch(err) {
      //
      //       console.log(err)
      //     }
      //   }

      console.timeLog('p')
      console.timeEnd('p')

    }
    if (currentStep.screenType === 'Screen_Screenshot') {

      if (screen.customTransitions) {


        setHotspotTransitions(extractHotspotTransitions(screen))
        setPointerTransitions(extractPointerTransitions(screen))
      } else {

        setShowTransitions(false)
        clearTransitions()
      }


      video.ontimeupdate = () => {
      }

      let imageToShow = document.getElementById(currentStep.screenId)

      let lastImage = document.getElementById(shownImageId.current)


      makeVisible(MAIN_VIEWS.IMAGES, {
        imageId: currentStep.screenId,
        shownImageId: shownImageId.current
      })
      shownImageId.current = currentStep.screenId


      // React 18 automatically batches state updates, so no need for unstable_batchedUpdates
      setShowTooltip(true)
      setShowTransitions(true)

      setupStepRegions(currentStep, screen._id)
      setupTransitionRegions(screen.customTransitions, screen._id)
      setupPointerTransitions(screen.customTransitions)

      // on last step
      if (currentStepIndexRef.current === stepsInternalRef.current.length - 1) {
        setTimeout(() => {
          window.config.hasEnded = true
        }, 4000)
      } else {
        window.config.hasEnded = false
      }

      console.timeLog('p')
      console.timeEnd('p')

    }


    // Final state updates - React 18 automatically batches all state updates
    setStepIsOverlayEnabled(currentStep && currentStep.view && currentStep.view.popup && currentStep.view.popup.showOverlay)

    if (prevScreen && screen._id !== prevScreen._id) {
      // console.log('screenChanged')

      if (screen.type !== "Screen_Video") {
        onChangeScreen(currentStep, screen._id)
      } else {
        clearStepsAndTransitions()
      }
    } else {
      setShowTooltip(true)
      setShowTransitions(true)

      setupStepRegions(currentStep, screen._id)

      let shouldShowRegions = calculateShouldShowRegions(currentStep, { current: screen })
      setShowRegions(shouldShowRegions)
      setupTransitionRegions(screen.customTransitions, screen._id)
      setupPointerTransitions(screen.customTransitions)

      // setupTransitionRegions(window.config.TRANSITIONS[screen._id], screen._id)
      // setupPointerTransitions(window.config.TRANSITIONS[screen._id])
    }

    setCurrentStepIndexState(currentStepIndex.current)
    setStep(stepsInternalRef.current[currentStepIndex.current])

    // After change step
    await afterChangeStep(previousStepIndexRef.current, currentStep, steps, screen, prevScreen)
  }

  function setupPointerStep(step) {

    let clickElement = window.document.getElementById(step._id)

    if (clickElement) {


      clickElement.addEventListener('click', function () {
        let newScreenIndex = currentStepIndexRef.current + 1

        changeStep(newScreenIndex, stepsInternalRef.current)
      })
    }
  }

  function setupPointerTransitions(screenTransitions = []) {
    let pointerTransitions = screenTransitions.filter(transition => transition.type === ScreenTransitionTypes.POINTER)
    if (!pointerTransitions) {
      return
    }

    for (let i = 0; i < pointerTransitions.length; i++) {
      let transition = pointerTransitions[i]


      let clickElement = window.document.getElementById(transition._id)

      // highlightElement(transition.selector, iframeRef.current.contentWindow.document, themeStepBackgroundColor)


      if (clickElement) {

        if (transition.gotoType === 'website') {

          clickElement.addEventListener('click', function () {
            let website = transition.gotoWebsite
            if (!website.startsWith('http')) {
              website = 'https://' + website
            }

            window.open(website, '_blank')
          })
        } else if (transition.gotoType === 'screen') {

          clickElement.addEventListener('click', function () {
            let newScreenId = transition.gotoScreen._id
            let screenIndex = getScreenIndex(newScreenId, storyDemoInternalRef.current)


            changeStep(screenIndex, stepsInternalRef.current)
          })
        } else if (transition.gotoType === 'next') {
          clickElement.addEventListener('click', function () {
            let screenIndex = currentStepIndexRef.current + 1

            changeStep(screenIndex, stepsInternalRef.current)
          })
        }

      }


    }
  }


  function changeIframeScreen(workspaceId, storyId, screenId, getIframeLoadedScreenId) {

    // console.log('changeIframeScreen ' + screenId)
    setIframeScreenId(screenId)

    let blobUrl = storyConfig.stepBlobs[screenId]
    if (blobUrl) {

      setIframeSrc(blobUrl)

      return new Promise((resolve, reject) => {

        let timeoutInterval = setTimeout(() => {
          clearInterval(timer)

          reject('Timeout expired waiting to load iframe')
        }, 60000)

        let timer = setInterval(() => {
          let loadedScreen = getIframeLoadedScreenId(iframeRef)
          // console.log('check iframeLoadedScreenId  ' + loadedScreen)

          if (loadedScreen === screenId) {

            clearInterval(timeoutInterval)
            clearInterval(timer)

            resolve()
          }

        }, 500)
      })

    } else {
      setShowSpinner(true)

      return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyId}/screens/${screenId}/preview`)
        .then(res => {
          let screenData = res.data

          const blobContent = new Blob([screenData.content], { type: 'text/html' })

          let blobUrl = URL.createObjectURL(blobContent)
          setIframeSrc(blobUrl)

          let newStepBlobs = storyConfig.stepBlobs ? { ...storyConfig.stepBlobs } : { ...stepBlobs }
          newStepBlobs[screenData.screenDoc._id] = blobUrl
          storyConfig.stepBlobs = newStepBlobs

          setStepBlobs(newStepBlobs)


          return new Promise((resolve, reject) => {

            let timeoutInterval = setTimeout(() => {
              clearInterval(timer)

              setShowSpinner(false)

              reject('Timeout expired waiting to load iframe')


            }, 60000)

            let timer = setInterval(() => {
              let loadedScreen = getIframeLoadedScreenId(iframeRef)
              // console.log('check iframeLoadedScreenId  ' + loadedScreen)
              if (loadedScreen === screenId) {


                setupTransitionRegions(screenData.screenDoc.customTrasitions, screenId)

                setupPointerTransitions(screenData.screenDoc.customTrasitions)

                clearInterval(timeoutInterval)
                clearInterval(timer)

                setShowSpinner(false)
                resolve(res.data)
              }

            }, 1000)


          })


        })
    }


  }

  function makeVisible(view, options, callback) {


    let iframeElem = document.getElementById('story_iframe')
    let videoElem = document.getElementById('story_video_wrapper')
    let imagesElem = document.getElementById('story_images')

    if (view === MAIN_VIEWS.IFRAME) {
      iframeElem.classList.add('zIndex2')
      videoElem.classList.remove('zIndex2')
      imagesElem.classList.remove('zIndex2')

      iframeElem.classList.remove('hidden')
      videoElem.classList.add('hidden')
      imagesElem.classList.add('hidden')


    } else if (view === MAIN_VIEWS.IMAGES) {
      let imageId = ''
      let shownImageId = ''
      if (options) {
        imageId = options.imageId
        shownImageId = options.shownImageId
      }

      if (imageId !== '') {
        let shownImageElem = document.getElementById(shownImageId)
        let imageElem = document.getElementById(imageId)

        if (imageElem) {
          imageElem.classList.add('zIndex2')
        }

        if (shownImageElem && imageId !== shownImageId) {
          shownImageElem.classList.remove('zIndex2')
        }

      }

      imagesElem.classList.add('zIndex2')
      videoElem.classList.remove('zIndex2')
      iframeElem.classList.remove('zIndex2')


      imagesElem.classList.remove('hidden')
      videoElem.classList.add('hidden')
      iframeElem.classList.add('hidden')


    } else if (view === MAIN_VIEWS.VIDEO) {

      videoElem.classList.add('zIndex2')
      iframeElem.classList.remove('zIndex2')
      imagesElem.classList.remove('zIndex2')

      videoElem.classList.remove('hidden')
      iframeElem.classList.add('hidden')
      imagesElem.classList.add('hidden')
    }
  }


  function getStepRegions(step, scalePercentageX, scalePercentageY, screenId) {

    let stepRegions = []
    if (step && step.view && step.view.viewType === 'pointer' && step.view.pointer && step.view.pointer.selectorLocation) {

      stepRegions = [{
        x: (step.view.pointer.selectorLocation.positionX) * scalePercentageX,
        y: (step.view.pointer.selectorLocation.positionY) * scalePercentageY,
        width: (step.view.pointer.selectorLocation.width) * scalePercentageX,
        height: (step.view.pointer.selectorLocation.height) * scalePercentageY,
        new: false,
        data: {
          index: 0,
          regionStyle: { backgroundColor: 'rgba(16, 112, 255, 0.33)' },
          pixelData: {
            x: step.view.pointer.selectorLocation.positionX,
            y: step.view.pointer.selectorLocation.positionY,
            width: step.view.pointer.selectorLocation.width,
            height: step.view.pointer.selectorLocation.height
          },
          type: REGION_TYPES.step,
          stepId: step._id,
          id: step._id,
          placement: step.view.pointer.placement,
          screenId: screenId
        },
        isChanging: false
      }]


    }

    return stepRegions
  }

  function getTransitionRegions(transitions, scalePercentageX, scalePercentageY, screenId) {
    let transitionRegions = []

    for (let i = 0; i < transitions.length; i++) {
      let transition = transitions[i]

      if (transition && transition.type === 'pointer' && transition.pointer && transition.pointer.selectorLocation) {

        transitionRegions.push({
          x: (transition.pointer.selectorLocation.positionX * scalePercentageX),
          y: (transition.pointer.selectorLocation.positionY * scalePercentageY),
          width: (transition.pointer.selectorLocation.width * scalePercentageX),
          height: (transition.pointer.selectorLocation.height * scalePercentageY),
          new: false,
          data: {
            index: 0,
            regionStyle: { backgroundColor: 'rgba(16, 112, 255, 0.33)' },
            pixelData: {
              x: transition.pointer.selectorLocation.positionX,
              y: transition.pointer.selectorLocation.positionY,
              width: transition.pointer.selectorLocation.width,
              height: transition.pointer.selectorLocation.height
            },
            type: REGION_TYPES.transition,
            id: transition._id,
            transitionId: transition._id,
            placement: transition.pointer.placement,
            screenId: screenId,
          },
          isChanging: false
        })
      }
    }

    return transitionRegions
  }


  function setupTransitionRegions(transitions = [], screenId) {
    // let mainWrapper = document.getElementById('main')
    let mainWrapperRect = originalMainRefRect.current

    // let innerWidth = isEmbed ? mainWrapperRect.width : window.innerWidth
    // let innerHeight = isEmbed ? mainWrapperRect.height : window.innerHeight

    let innerWidth = mainWrapperRect.width
    let innerHeight = mainWrapperRect.height

    let scalePercentageX = Math.min(tabInfoWidth, (innerWidth / tabInfoWidth))
    let scalePercentageY = Math.min(tabInfoHeight, ((innerHeight) / tabInfoHeight))


    let transitionRegions = getTransitionRegions(transitions, scalePercentageX, scalePercentageY, screenId)


    clearTooltipAnchors(ANCHOR_TYPES.TRANSITION)
    let transitionPointerInfos = []
    for (let i = 0; i < transitionRegions.length; i++) {
      let region = transitionRegions[i]

      let selectorLocation = {
        positionX: region.data.pixelData.x * scalePercentageX,
        positionY: region.data.pixelData.y * scalePercentageY,
        width: region.data.pixelData.width * scalePercentageX,
        height: region.data.pixelData.height * scalePercentageY,
      }


      let type = region.data.type

      let targetElement

      addTooltipAnchor(region.data.transitionId, region.data.type, selectorLocation)

      targetElement = document.getElementById(region.data.transitionId)

      transitionPointerInfos.push({
        transitionId: region.data.transitionId,
        enabled: true,
        targetElement: targetElement,
        placement: region.data.placement
      })
    }


    setTransitionPointerInfos(transitionPointerInfos)

    setTransitionRegions(transitionRegions)
  }

  function setupStepRegions(step, screenId) {
    if (!step.view || step.view.viewType !== STEP_VIEWS.POINTER) {
      setStepRegions([])

      // Reset pointerInfo for the step so that when the next step is Post it will be centered
      setStepPointerInfo(null)

      clearTooltipAnchors(ANCHOR_TYPES.STEP)

      return
    }

    let mainWrapper = document.getElementById('main')
    if (!mainWrapper) {
      return
    }

    let mainWrapperRect = originalMainRefRect.current


    let innerWidth = mainWrapperRect.width
    let innerHeight = mainWrapperRect.height

    let scalePercentageX = Math.min(tabInfoWidth, (innerWidth / tabInfoWidth))
    let scalePercentageY = Math.min(tabInfoHeight, ((innerHeight) / tabInfoHeight))

    // console.log('scalePercentageX')
    // console.log(scalePercentageX)
    // console.log('scalePercentageY')
    // console.log(scalePercentageY)

    let stepRegions = getStepRegions(step, scalePercentageX, scalePercentageY, screenId)


    clearTooltipAnchors(ANCHOR_TYPES.STEP)
    let stepPointerInfos = []
    for (let i = 0; i < stepRegions.length; i++) {
      let region = stepRegions[i]

      let selectorLocation = {
        positionX: region.data.pixelData.x * scalePercentageX,
        positionY: region.data.pixelData.y * scalePercentageY,
        width: region.data.pixelData.width * scalePercentageX,
        height: region.data.pixelData.height * scalePercentageY,
      }


      let type = region.data.type

      let targetElement
      addTooltipAnchor(region.data.stepId, region.data.type, selectorLocation)

      targetElement = document.getElementById(region.data.stepId)

      stepPointerInfos.push({
        enabled: true,
        targetElement: targetElement,
        placement: region.data.placement
      })

    }

    if (step.view && step.view.viewType === ScreenTransitionTypes.POINTER) {
      setupPointerStep(step)
    }

    setStepPointerInfo(stepPointerInfos[0])

    setStepRegions(stepRegions)
  }


  function calculateShouldShowRegions(step, currentScreenRef) {
    let hasCustomTransitionPointers = currentScreenRef.current && currentScreenRef.current.customTransitions &&
      currentScreenRef.current.customTransitions.some(transition => transition.type === ScreenTransitionTypes.POINTER)

    let shouldShowRegions = (step && step.view && step.view.viewType === 'pointer') || hasCustomTransitionPointers

    return shouldShowRegions
  }

  function onChangeScreen(step, screenId) {
    let currentScreen = storyDemoInternalRef.current.screens.find(scr => scr._id === step.screenId)

    let pointerTransitions = currentScreen.customTransitions.filter(transition => transition.type === ScreenTransitionTypes.POINTER)
    setPointerTransitions(pointerTransitions)

    let hotspotTransitions = currentScreen.customTransitions.filter(transition => transition.type === ScreenTransitionTypes.HOTSPOT)
    setHotspotTransitions(hotspotTransitions)

    setupStepRegions(step, screenId)

    let shouldShowRegions = calculateShouldShowRegions(step, { current: currentScreen })
    setShowRegions(shouldShowRegions)
    setupTransitionRegions(currentScreen.customTransitions, screenId)
    setupPointerTransitions(currentScreen.customTransitions)

  }

  async function beforeChangeStep(newStepIndex, step, steps, screen, prevScreen) {
    // targetElement.style.animation = 'pulse 2s infinite'

    console.log('beforeChangeStep')

    let newStep = steps[newStepIndex]

    clearAutoCursor(newStep)

    // Scale main if changing screens or no zoom span
    if (step.screenId !== newStep.screenId || !newStep.zoomSpan) {
      scaleMain(1, 0, 0)
    }

    // Update refs
    let stepFromRef = stepsInternalRef.current[newStepIndex]
    currentScreenRef.current = screen
    // setupStepRegions(stepFromRef, currentScreenRef.current._id)
    previousStepIndexRef.current = newStepIndex
  }

  // Helper function to wait for a delay
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Helper function to check if audio has played
  async function checkAudioHasPlayed(currentAutoPlayTimerRef, callCount = 0) {
    if (callCount > 30) {
      return
    }

    await delay(500)

    if (audioHasPlayedRef.current) {
      currentAutoPlayTimerRef.current = clearInterval(currentAutoPlayTimerRef.current)
      await delay(2500)
      return
    } else {
      await checkAudioHasPlayed(currentAutoPlayTimerRef, ++callCount)
    }
  }

  async function afterChangeStep(newStepIndex, stepParam, steps, screen, prevScreen) {
    console.log('afterChangeStep')
    setAudioHasStarted(false)

    let step = steps[newStepIndex]

    //AutoPlay
    if (currentAutoPlayTimerRef.current) {
      clearTimeout(currentAutoPlayTimerRef.current)
      currentAutoPlayTimerRef.current = null
    }

    if (!isAutoPlayActiveRef.current) {
      // If autoplay is not active, only proceed if we're not at the last step
      if (currentStepIndexRef.current === steps.length - 1) {
        return
      }
      // Check if step has autoplay config enabled
      if (!(step.autoPlayConfig && step.autoPlayConfig.enabled)) {
        return
      }
    }

    // Calculate Step AutoPlayConfig delay
    let delayResult = AutoPlayDelay

    if (step.autoPlayConfig.type === StepAutoPlayTypes.manual) {
      delayResult = step.autoPlayConfig.delay * 1000
    } else if (step.autoPlayConfig.type === StepAutoPlayTypes.auto) {
      // Wait until audio playing finishes
      try {
        if (step.stepAudioId) {
          await checkAudioHasPlayed(currentAutoPlayTimerRef)
        } else {
          // TODO: autoPlay with type Auto, when there is no audio should calculate delay based on amount of text
          let countedWords = countWords(step.view.content)
          let multiplier = 1.1
          if (countedWords < 7) {
            delayResult = 3 * 1000
          } else {
            delayResult = countedWords * multiplier * 1000
          }
          console.log('countWords - ' + countedWords)
          console.log('delayResult - ' + delayResult)

          await new Promise((resolve, reject) => {
            currentAutoPlayTimerRef.current = setTimeout(async () => {
              try {
                console.log(`afterChangeStep - autoplay auto based on text triggered - countedWords ${countedWords} ` + delayResult)
                console.log(new Date().toString())
                await onNext()
                resolve()
              } catch (error) {
                reject(error)
              }
            }, delayResult)
          })
        }
      } catch (err) {
        console.error('Error in auto autoplay:', err)
      }

      console.log('afterChangeStep - auto type autoplay triggered ' + delayResult)
      console.log(new Date().toString())
      await onNext()
    }

    if (step.autoPlayConfig.type !== StepAutoPlayTypes.auto && (step.autoPlayConfig.enabled || isAutoPlayActiveRef.current)) {
      await new Promise((resolve, reject) => {
        currentAutoPlayTimerRef.current = setTimeout(async () => {
          try {
            console.log('afterChangeStep - autoplay triggered ' + delayResult)
            console.log(new Date().toString())
            await onNext()
            resolve()
          } catch (error) {
            reject(error)
          }
        }, delayResult)
      })
    }
  }

  function countWords(str) {
    // Trim leading/trailing whitespace
    const trimmedStr = str.trim();

    // If the string is empty after trimming, there are no words
    if (trimmedStr === "") {
      return 0;
    }

    // Split the string by one or more whitespace characters
    const words = trimmedStr.split(/\s+/);

    // Return the number of elements in the resulting array
    return words.length;
  }

  function changeStep(newStepIndex, steps) {
    if (newStepIndex >= steps.length) {
      newStepIndex = steps.length - 1
    }

    newStepIndex = Math.max(Math.min(newStepIndex, steps.length - 1), 0)


    let stepNumber = newStepIndex + 1

    if (!isInEditor) {
      window.history.pushState({ stepNumber }, '', `?step=${stepNumber}`)
    }


    // let isReverse = currentStepIndex.current - newStepIndex === 0 ? false : (currentStepIndex.current > newStepIndex)
    let previousStepIndex = currentStepIndexRef.current


    setCurrentStepIndexRef(newStepIndex)


    // console.log(storyDemoInternal.current)

    let topWindow = window
    if (window.top) {
      topWindow = window.top
    }


    topWindow.postMessage({
      type: 'step_index_changed',
      state: { stepNumber: stepNumber }
    }, '*')

    return processStep(currentStepIndexRef, videoRef, storyDemoInternalRef, steps)
  }

  function getTransitionsView(storyDemoState, hotspotTransitions, pointerTransitions, step, innerWidth, innerHeight, scaleValuesRef, isScaled) {

    // console.log('step')
    // console.log(step)

    return <React.Fragment>
      {hotspotTransitions.map((transition) => {

        return <HotspotTransition
          setHotspotTransitions={setHotspotTransitions}
          hotspotTransitions={hotspotTransitions}

          key={transition._id}

          transition={transition}
          currentStepIndex={currentStepIndexRef}
          screenId={step.screenId}
          screen={storyDemoInternalRef.current.screens.find(scr => scr._id === step.screenId)}
          isInEditor={isInEditor}
          navWrapperRef={navWrapperRef}
          widthDimensionPercentage={widthDimensionPercentage}
          heightDimensionPercentage={heightDimensionPercentage}

          liveDemo={storyDemoState}
          liveDemoRef={storyDemoInternalRef}
          setLiveDemo={setStoryDemoInternal}
          isOmniBarDisabled={isOmniBarDisabled}
          changeStep={(newStepIndex) => {
            changeStep(newStepIndex, stepsInternalRef.current)
          }}
          scaleValuesRef={scaleValuesRef}
          isScaled={isScaled}

          size={stepsInternalRef.current.length}
          step={step}
          onBack={onBack}
          onNext={onNext}
          onSkip={onSkip}
          themeBackgroundColor={themeStepBackgroundColor}
          themeTextColor={themeTextColor}
          themeButtonBackgroundColor={themeButtonBackgroundColor}
          themeButtonTextColor={themeButtonTextColor}

          wrapperWidth={innerWidth}
          wrapperHeight={innerHeight}
        />
      })}
      {pointerTransitions.map((transition, index) => {

        return <PointerTransition
          key={transition._id}
          transition={transition}
          currentStepIndex={currentStepIndexRef}
          screenId={step.screenId}
          screen={storyDemoInternalRef.current.screens.find(scr => scr._id === step.screenId)}
          isInEditor={isInEditor}
          navWrapperRef={navWrapperRef}
          widthDimensionPercentage={widthDimensionPercentage}
          heightDimensionPercentage={heightDimensionPercentage}

          liveDemo={storyDemoState}
          liveDemoRef={storyDemoInternalRef}
          setLiveDemo={setStoryDemoInternal}
          isOmniBarDisabled={isOmniBarDisabled}
          changeStep={(newStepIndex) => {
            changeStep(newStepIndex, stepsInternalRef.current)
          }}


          size={stepsInternalRef.current.length}

          step={step}
          onBack={onBack}
          onNext={onNext}
          onSkip={onSkip}
          themeBackgroundColor={themeStepBackgroundColor}
          themeTextColor={themeTextColor}
          themeButtonBackgroundColor={themeButtonBackgroundColor}
          themeButtonTextColor={themeButtonTextColor}

          pointerInfo={transitionPointerInfos[index] ? transitionPointerInfos[index] : {}}
          tooltipRef={transitionTooltipRefs.current[index]}

          wrapperWidth={innerWidth}
          wrapperHeight={innerHeight}
        />
      })}


    </React.Fragment>
  }

  function getStepView(storyDemoState, step, prevStep, innerWidth, innerHeight, scaleValuesRef, isScaled, isOverlayEnabled, isInEditor) {
    console.log(`getStepView ${innerWidth} x ${innerHeight}`)

    if (!(step && step.view)) {
      return ''
    }

    if (prevStep && prevStep._id === step._id) {
      prevStep = null
    }


    if (step.view.viewType === STEP_VIEWS.HOTSPOT) {
      let HotspotStepComponent = isInEditor ? HotspotStepEditor : HotspotStep

      return <HotspotStepComponent
        key={step._id}

        step={step}
        prevStep={prevStep}
        currentStepIndex={currentStepIndexRef}
        currentStepIndexCount={(currentStepIndexRef.current - amountOfInitialPosts)}
        screenId={step.screenId}
        screen={storyDemoInternalRef.current.screens.find(scr => scr._id === step.screenId)}
        isInEditor={isInEditor}
        navWrapperRef={stepsWrapperRef}
        widthDimensionPercentage={widthDimensionPercentage}
        heightDimensionPercentage={heightDimensionPercentage}
        wrapperWidth={innerWidth}
        wrapperHeight={innerHeight}
        liveDemo={storyDemoState}
        liveDemoRef={storyDemoInternalRef}
        setLiveDemo={setStoryDemoInternal}
        isOmniBarDisabled={isOmniBarDisabled}
        changeStep={(newStepIndex) => {
          changeStep(newStepIndex, stepsInternalRef.current)
        }}
        isScaled={isScaled}
        scaleValuesRef={scaleValuesRef}

        size={(stepsInternalRef.current.length - amountOfInitialPosts)}
        onBack={onBack}
        onNext={onNext}
        onSkip={onSkip}
        themeBackgroundColor={themeStepBackgroundColor}
        themeTextColor={themeTextColor}
        themeButtonBackgroundColor={themeButtonBackgroundColor}
        themeButtonTextColor={themeButtonTextColor}
        moveAutoCursor={moveAutoCursor}
        clearAutoCursor={clearAutoCursor}
        audioHasPlayed={audioHasPlayed}
        audioHasStarted={audioHasStarted}
      />
    } else if (step.view.viewType === STEP_VIEWS.POINTER) {

      let TooltipComponentConditional = isInEditor ? TooltipComponentEditor : TooltipComponent

      return <TooltipComponentConditional
        tooltipRef={stepTooltipRef}
        tooltipX={stepTooltipX}
        tooltipY={stepTooltipY}
        setTooltipX={setStepTooltipX}
        setTooltipY={setStepTooltipY}
        setIsTooltipDragging={setIsTooltipDragging}
        continuous={true}
        index={currentStepIndexState}
        step={step}
        screen={storyDemoInternalRef.current.screens.find(scr => scr._id === step.screenId)}

        widthDimensionPercentage={widthDimensionPercentage}
        heightDimensionPercentage={heightDimensionPercentage}

        changeStep={(newStepIndex) => {
          changeStep(newStepIndex, stepsInternalRef.current)
        }}

        size={stepsInternalRef.current.length}
        iframeSize={iframeSize}
        onBack={onBack}
        onNext={onNext}
        onSkip={onSkip}
        liveDemo={storyDemoState}
        liveDemoRef={storyDemoInternalRef}

        themeBackgroundColor={themeStepBackgroundColor}
        themeTextColor={themeTextColor}
        themeButtonBackgroundColor={themeButtonBackgroundColor}
        themeButtonTextColor={themeButtonTextColor}
        tooltipWrapperRef={stepsWrapperRef}
        forceUpdateVar={updateStateVar}

        pointerInfo={stepPointerInfo ? stepPointerInfo : {}}
        setStepPointerInfo={setStepPointerInfo}

        wrapperWidth={innerWidth}
        wrapperHeight={innerHeight}
        isInEditor={isInEditor}
      />
    } else if (step.view.viewType === STEP_VIEWS.POPUP) {


      return <PopupComponenet
        wrapperWidth={innerWidth}
        wrapperHeight={innerHeight}
        isInEditor={isInEditor}
        step={step}
        stepIndex={currentStepIndexRef.current}
        isOverlayEnabled={isOverlayEnabled}
        themeBackgroundColor={themeStepBackgroundColor}
        themeTextColor={themeTextColor}
        themeButtonBackgroundColor={themeButtonBackgroundColor}
        themeButtonTextColor={themeButtonTextColor}

        liveDemo={storyDemoState}
        size={stepsInternalRef.current.length}
        onNext={() => {
          onNext()
        }}
        onBack={() => {
          onBack()
        }}
        changeToScreen={(screenId) => {

          let screenIndex = getScreenIndex(screenId, storyDemoInternalRef.current)

          changeStep(screenIndex, stepsInternalRef.current)
        }}
      />
    } else {

      return ''
    }

  }

  function onBack() {
    let newValue = currentStepIndexRef.current - 1

    changeStep(newValue, stepsInternalRef.current)
  }

  function onNext() {
    let newValue = currentStepIndexRef.current + 1

    return changeStep(newValue, stepsInternalRef.current)
  }

  function onSkip() {
    setShowTooltip(false)
    setShowTransitions(false)
  }

  function onFullScreenButtonClick() {
    if (isInEditorRef.current) {
      return
    }

    let wrapperElemParent = wrapperRef.current.parentElement.parentElement
    if (!wrapperElemParent) {
      return
    }

    if (wrapperElemParent.requestFullscreen) {
      wrapperElemParent.requestFullscreen();
    } else if (wrapperElemParent.webkitRequestFullscreen) { /* Safari */
      wrapperElemParent.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      wrapperElemParent.msRequestFullscreen();
    }

    setIsFullScreen(true)

    setTimeout(() => {
      forceUpdate()
      scaleMain(1, 0, 0)

    }, 250)
  }

  function scaleMain(scaleValueX, left, top) {
    if (!mainRef.current || !mainRefRect.current || !wrapperRefRect.current) {
      console.log('scaleMain - mainRef, mainRefRect, or wrapperRefRect not set yet')
      return
    }

    top = Math.min(top, wrapperRefRect.current.height)
    left = Math.min(left, wrapperRefRect.current.width)


    let mainRefRectScaledCalcLeft = mainRefRect.current.left - wrapperRefRect.current.left
    // Exclude omniBar height from top calculation - scaleMain should not account for omniBar
    let mainRefRectScaledCalcTop = (mainRefRect.current.top - wrapperRefRect.current.top) - omniBarHeight

    let newLeft = (left !== 0 ? left - mainRefRectScaledCalcLeft : 0) * scaleValueX * -1
    let newTop = (top !== 0 ? top - (mainRefRectScaledCalcTop) : 0) * scaleValueX * -1

    // Make sure that main element never goes out of the wrapper
    // let wrapperMainDifference = wrapperRefRect.bottom - mainRefRect.


    let initialLeft = (left !== 0 ? left - mainRefRectScaledCalcLeft : 0) * scaleValueX * -1
    let modLeft = -initialLeft + (wrapperRefRect.current.width - ((wrapperRefRect.current.width * scaleValueX) - initialLeft))
    // Make sure the left never goes out of bounds of the wrapper
    newLeft = Math.max(
      initialLeft,
      modLeft
    )

    // Apply similar constraint for top to prevent going out of bounds vertically
    let initialTop = (top !== 0 ? top - (mainRefRectScaledCalcTop) : 0) * scaleValueX * -1
    // Calculate the maximum allowed top value to prevent going out of bounds at the top
    // The top bound ensures the element's top edge doesn't go above the wrapper's top (position 0)
    // When scaled, we need to ensure: mainRefRectScaledCalcTop + newTop/scaleValueX >= 0
    // Solving for newTop: newTop >= -mainRefRectScaledCalcTop * scaleValueX
    let topBound = -mainRefRectScaledCalcTop * scaleValueX
    // Make sure the top never goes out of bounds of the wrapper (use Math.min to prevent going above top)
    newTop = Math.min(
      initialTop,
      topBound
    )


    let oldStyle = mainRef.current.style.transform
    let newStyle = `translate3d(${newLeft}px, ${newTop}px, 0px) scale(${scaleValueX})`

    mainRef.current.style.transform = newStyle

    scaleValuesRef.current = {
      newLeft,
      newTop,
      scaleValueX
    }

    setIsScaled(scaleValueX !== 1)


    let reverseScaleValueX = 1 / scaleValueX
    let reverseNewLeft = (-1 * newLeft) / (scaleValueX * scaleValueX)
    let reverseNewTop = (-1 * newTop) / (scaleValueX * scaleValueX)

    //Scale down the StepsWrapper
    // if(stepsWrapperRef.current) {
    //     let newStepsWrapperTransform = `translate3d(${reverseNewLeft}px, ${reverseNewTop}px, 0) scale(${reverseScaleValueX})`
    //     stepsWrapperRef.current.style.transform = newStepsWrapperTransform
    // }

  }

  let stepIndexValue = currentStepIndexRef && currentStepIndexRef.current !== undefined && currentStepIndexRef.current + 1

  let showAudio = (isAudioEnabled && stepAudio)

  // console.log('showRegions')
  // console.log(showRegions)
  // console.log('editorShowRegions')
  // console.log(editorShowRegions)

  // console.log('showTooltip')
  // console.log(showTooltip)


  // console.log('hotspotTransitions')
  // console.log(hotspotTransitions)

  function speedUpOnClick(video) {

    setShowSpeedupIcon(true)
    setTimeout(() => {
      setShowSpeedupIcon(false)
    }, 1000)

    if (video.playbackRate < 5.5) {
      video.playbackRate = 5.5
    } else {

      video.playbackRate = video.playbackRate * 2
    }
  }

  function pauseOnClick(video) {
    setShowPauseIcon(true)
    setTimeout(() => {
      setShowPauseIcon(false)
    }, 1000)

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  let showLiveDemoWatermark = isLiveDemoWatermarkEnabled && themeWatermarkConfigImageUrl === ''

  // let renderCursorCondition = isAutoPlayActive || (step.autoPlayConfig && step.autoPlayConfig.enabled &&
  //     (!step.stepAudioId || (step.stepAudioId && audioHasPlayed) ))
  let renderCursorCondition = isAutoPlayActive || (step.autoPlayConfig && step.autoPlayConfig.enabled)


  const ZoomSpansComponent = isInEditor ? ZoomSpansEditor : ZoomSpans
  const RegionsComponent = isInEditor ? RegionsEditor : Regions

  const videoCursorScreen = storyDemoInternalRef.current.screens.find((s) => s._id === step.screenId)
  const videoCursorPositions = videoCursorScreen && videoCursorScreen.cursorPositions
  const showVideoCursor =
    storyDemoInternalRef.current.type === StoryTypes.desktop &&
    step.screenType === ScreenTypes.SCREEN_VIDEO &&
    Array.isArray(videoCursorPositions) &&
    videoCursorPositions.length > 0 &&
    typeof videoCursorPositions[0].frameX === 'number'

  return (<WS.Wrapper
    ref={onWrapperRefSetup}
    width={width ? width + 'px' : '100%'}
    height={height ? height + 'px' : '100%'}
    onMouseUp={() => {
      setIsTooltipDragging(false)
    }}
    onMouseMove={function (event) {

      // let cords = event.currentTarget.getBoundingClientRect()
      if (isTooltipDragging.current && stepTooltipRef.current) {
        // let newX = event.clientX
        let newX = event.clientX - (stepTooltipRef.current.clientWidth / 2)
        // let newY = event.clientY
        let newY = event.clientY - (stepTooltipRef.current.clientHeight / 2)


        setStepTooltipX(newX)
        setStepTooltipY(newY)
      }
    }}
    // style={{...additionalStyles}}
    className="joyride-wrapper">

    {renderCursorCondition ? (
      <Cursor ref={autoCursorRef} />) : ('')}

    {ENABLE_DEBUG_CURSOR ? <DebugCursor /> : null}

    {!isOmniBarDisabled ? (<WS.OmniBar $width={width}>
      <WS.OmniBar_Container className={'OmniBar__leftSide'}>
        <WS.OmniBar__Buttons>
          <WS.ButtonIcon className={'OmniBar__exitBtn'} onClick={() => {
            document.exitFullscreen()
            setIsFullScreen(false)

            setTimeout(() => {
              forceUpdate()
            }, 250)
          }}>
            <img src={CloseIcon} />
          </WS.ButtonIcon>
          <WS.ButtonIcon className={'OmniBar__minimizeBtn'} onClick={() => {
            document.exitFullscreen()
            setIsFullScreen(false)
            setTimeout(() => {

              // setTimeout(() => {
              //   setupTransitionRegions(currentScreenRef.current.customTransitions, currentScreenRef.current._id)
              //
              //   setupPointerTransitions(currentScreenRef.current.customTransitions)
              //
              //   setupStepRegions(step, currentScreenRef.current._id)
              // }, 250)

              forceUpdate()
            }, 250)

          }}>
            <img src={MinimizeIcon} />
          </WS.ButtonIcon>
          <WS.ButtonIcon className={'OmniBar__maximizeBtn'} style={{ cursor: 'pointer' }}
            onClick={onFullScreenButtonClick}>
            <img src={MaximizeIcon} />
          </WS.ButtonIcon>
        </WS.OmniBar__Buttons>
      </WS.OmniBar_Container>

      <WS.OmniBar__urlWrapper className={'OmniBar__url'}>
        <WS.OmniBar__urlWrapperLeft className={'UrlWrapper__leftSide'}>
        </WS.OmniBar__urlWrapperLeft>
        <WS.OmniBar__urlWrapperInner className={'UrlWrapper__urlWrapper'}>
          <WS.UrlLock className={'UrlWrapper__lockIcon'} />
          <WS.UrlName
            className={'UrlWrapper__urlName'}>{storyDemoInternalRef.current.name || ''}</WS.UrlName>
        </WS.OmniBar__urlWrapperInner>

        <WS.OmniBar__urlWrapperRight className={'UrlWrapper__rightSide'}>
          <WS.UrlReload
            onClick={() => {

              changeStep(0, stepsInternalRef.current)
              // currentStepIndex.current = 0
              // processStep(currentStepIndex, videoRef, flixDoc)
            }}
          />
        </WS.OmniBar__urlWrapperRight>
      </WS.OmniBar__urlWrapper>

      <WS.OmniBar_Container className={'OmniBar__rightSide'}>

        <WS.OmniBar__LineSpace>
          {isInEditor ? '' : (
            <AutoPlayToggle isAutoPlayActive={isAutoPlayActive}
              setIsAutoPlayActive={setIsAutoPlayActive} />
          )}
          {!isInEditor ? '' : (
            <WS.OmniBar__StepIndicator>
              Step {stepIndexValue}
            </WS.OmniBar__StepIndicator>
          )}
        </WS.OmniBar__LineSpace>
      </WS.OmniBar_Container>


    </WS.OmniBar>
    ) : ''}
    <WS.Main id={'main'}
      $isOmniBarDisabled={isOmniBarDisabled}
      ref={mainRef}
      isScaled={isScaled}
      onClick={() => {
        // console.log('isScaled test')
        // if (isScaled) {
        //     scaleMain(1, 0, 0)
        // }
      }}

    >
      <EditText screenId={iframeScreenId} iframeRef={iframeRef} />


      {showSpinner && (
        <WC.LoaderWrapper>
          <Spinner />
        </WC.LoaderWrapper>)
      }


      <WS.VideoWrapper
        id={'story_video_wrapper'}
        className={'hidden'}
        innerWidth={videoRatioWidth}
        innerHeight={videoRatioHeight}
      >
        {/*<WS.SpeedUpIcon className={showSpeedupIcon ? 'show' : ''} type={"forward"}/>*/}
        <WS.PauseIcon className={showPauseIcon ? 'show' : ''} />
        <WS.Video
          id={'story_video'}
          preload={'none'}
          playsInline={true}
          disablePictureInPicture
          controlsList="nodownload"
          onClick={() => {
            let video = videoRef.current
            if (video) {

              pauseOnClick(video)


              // video.currentTime = video.duration
            }
            // console.log("video skipped")
          }}
          muted={'true'}
          innerWidth={innerWidth}
          innerHeight={innerHeight}
          ratioPercentage={(fullHeight / fullWidth) / (videoRatioHeight / videoRatioWidth)}
          ratioPercentageX={(fullWidth / fullHeight) / (videoRatioWidth / videoRatioHeight)}
          ratioPercentageY={(fullHeight / fullWidth) / (videoRatioHeight / videoRatioWidth)}
        // isRatioDifferent={(videoRatioHeight/videoRatioWidth !== fullHeight/fullWidth)}
        // style={{
        //   aspectRatio: storyDemoInternal.current.tabInfo.width / storyDemoInternal.current.tabInfo.height
        // }}

        >
          <source ref={videoSourceRef} src={''} type={'video/mp4'}></source>
        </WS.Video>
      </WS.VideoWrapper>
      {showVideoCursor ? (
        <VideoCursor
          cursorPositions={videoCursorPositions}
          videoRef={videoRef}
          mainRef={mainRef}
          tabInfoWidth={tabInfoWidth}
          tabInfoHeight={tabInfoHeight}
          active={showVideoCursor}
        />
      ) : null}
      <WS.ImagesWrapper
        id={'story_images'}
        className={'hidden'}
      >
        {screenshotScreens.map(screen => {
          let url = screen.imageUrl

          return <WS.ImageContainer
            key={screen.screenId}
            id={screen.screenId}
          >
            <WS.Image src={url}
            />
          </WS.ImageContainer>
        })}
      </WS.ImagesWrapper>


      {showTooltip ? (
        <WS.StepsWrapper
          id={'tooltip-wrapper'}
          ref={stepsWrapperRef}
          data-zoom-ignore="true"
          fullWidth={fullWidth}
          fullHeight={fullHeight}
          scalePercentageWidth={scalePercentageWidth}
          scalePercentageHeight={scalePercentageHeight}
          isOverlayEnabled={stepIsOverlayEnabled}
          overlayBackgroundColor={(step && step.view && step.view.popup && step.view.popup.overlayBackgroundColor) || 'rgba(0,0,0,0.65)'}
          isPopup={step && step.view && step.view.viewType === STEP_VIEWS.POPUP}
        >

          {getStepView(storyDemoState, step, prevStep, memoizedInnerWidth, memoizedInnerHeight, scaleValuesRef, isScaled, stepIsOverlayEnabled, isInEditor)}

        </WS.StepsWrapper>
      ) : ''}
      {showTransitions ? (
        <WS.NavigationWrapper
          // style={{ ...additionalStyles }}
          ref={navWrapperRef}
          className={'nav-wrapper'}
          $showHotspot={true}>
          {getTransitionsView(storyDemoState, hotspotTransitions, pointerTransitions, stepRef.current, memoizedInnerWidth, memoizedInnerHeight, scaleValuesRef, isScaled)}

        </WS.NavigationWrapper>
      ) : ''}
      <IframeComponent
        className={'hidden'}
        screenId={iframeScreenId}
        iframeSrc={iframeSrc}
        iframeRef={iframeRef}
        iframeSize={iframeSize}
        isFullScreen={isFullScreen}
        omniBarHeight={omniBarHeight}
      />
      {confettiOnLastStep && (currentStepIndexRef.current === stepsInternalRef.current.length - 1) ? (
        <Confetti

          recycle={false}
          width={window.innerWidth}
          height={window.innerHeight}
          // confettiSource={{
          //   w: 10,
          //   h: 10,
          //   x: window.innerWidth / 2,
          //   y: window.innerHeight / 2,
          // }}
          tweenDuration={5000}
          numberOfPieces={500}
          gravity={0.15}
          run={true}
        />
      ) : ''}
      {showLiveDemoWatermark ? (<WS.WatermarkWrapper
        $isInEditor={isInEditor}
        onClick={() => {
          window.open("https://livedemo.ai", '_blank')
        }}>
        <WS.WatermarkButton>
          <WS.Watermark__Icon $isInEditor={isInEditor} className={'Watermark__Icon'} width="94"
            height="106"
            viewBox="0 0 94 106" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className={"watermark-icon-inner-layer"}
              d="M0.5 6.85552C0.5 3.52841 3.43103 0.963143 6.72881 1.40402L76.0839 10.6761C85.7686 11.9708 93 20.2333 93 30.0041V82.0433C93 89.997 86.9798 96.6599 79.0668 97.4639L6.55596 104.831C3.31524 105.161 0.5 102.617 0.5 99.3595V6.85552Z"
              fill={"#f9f9f9"} stroke="#999" />
            <path
              d="M31 35.6795C31 31.0607 36 28.1739 40 30.4833L70 47.8039C74 50.1133 74 55.8868 70 58.1962L40 75.5167C36 77.8261 31 74.9393 31 70.3205L31 35.6795Z"
              fill="white" />
            <path
              d="M31 35.6795C31 31.0607 36 28.1739 40 30.4833L70 47.8039C74 50.1133 74 55.8868 70 58.1962L40 75.5167C36 77.8261 31 74.9393 31 70.3205L31 35.6795Z"
              stroke={Colors.primaryColor} stroke-width="3" />
            <path
              d="M31 35.6795C31 31.0607 36 28.1739 40 30.4833L70 47.8039C74 50.1133 74 55.8868 70 58.1962L40 75.5167C36 77.8261 31 74.9393 31 70.3205L31 35.6795Z"
              stroke="white" stroke-opacity="0.15" stroke-width="3" />
          </WS.Watermark__Icon>
          <WS.Watermark__Text $isInEditor={isInEditor}
            className={'Watermark__Text'}>LiveDemo</WS.Watermark__Text>
        </WS.WatermarkButton>
      </WS.WatermarkWrapper>
      ) : (
        <WS.WatermarkWrapper
          $isInEditor={isInEditor}
          onClick={() => {
            window.open(themeWatermarkConfigUrl, '_blank')
          }}>
          <WS.WatermarkButton>

            <WS.Watermark__Text $isInEditor={isInEditor}
              className={'Watermark__Text'}>{themeWatermarkConfigText}</WS.Watermark__Text>
            {themeWatermarkConfigImageUrl === '' ? (
              <WS.Watermark__Icon $isInEditor={isInEditor} className={'Watermark__Icon'} width="94"
                height="106"
                viewBox="0 0 94 106" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className={"watermark-icon-inner-layer"}
                  d="M0.5 6.85552C0.5 3.52841 3.43103 0.963143 6.72881 1.40402L76.0839 10.6761C85.7686 11.9708 93 20.2333 93 30.0041V82.0433C93 89.997 86.9798 96.6599 79.0668 97.4639L6.55596 104.831C3.31524 105.161 0.5 102.617 0.5 99.3595V6.85552Z"
                  fill={"#f9f9f9"} stroke="#999" />
                <path
                  d="M31 35.6795C31 31.0607 36 28.1739 40 30.4833L70 47.8039C74 50.1133 74 55.8868 70 58.1962L40 75.5167C36 77.8261 31 74.9393 31 70.3205L31 35.6795Z"
                  fill="white" />
                <path
                  d="M31 35.6795C31 31.0607 36 28.1739 40 30.4833L70 47.8039C74 50.1133 74 55.8868 70 58.1962L40 75.5167C36 77.8261 31 74.9393 31 70.3205L31 35.6795Z"
                  stroke={Colors.primaryColor} stroke-width="3" />
                <path
                  d="M31 35.6795C31 31.0607 36 28.1739 40 30.4833L70 47.8039C74 50.1133 74 55.8868 70 58.1962L40 75.5167C36 77.8261 31 74.9393 31 70.3205L31 35.6795Z"
                  stroke="white" stroke-opacity="0.15" stroke-width="3" />
              </WS.Watermark__Icon>) : (
              <WS.Watermark__Image $isInEditor={isInEditor} src={themeWatermarkConfigImageUrl}
                className={'Watermark__Icon'} />)}
          </WS.WatermarkButton>
        </WS.WatermarkWrapper>
      )}
      {isAudioEnabled && stepAudio ? (
        <WS.AudioWrapper>

          {isInEditor ? (
            <RoundAudioPlayerEditor
              key={stepAudio && stepAudio.audioUrl}
              stepAudio={stepAudio}
              setStepAudio={(newStepAudio) => {
                let updatedStep = JSON.parse(JSON.stringify(stepsInternalRef.current[currentStepIndexState]))
                updatedStep.stepAudioId = newStepAudio

                stepsInternalRef.current[currentStepIndexState] = updatedStep
                setStepAudio(newStepAudio)
              }}
              voices={voices}
              reloadStoryDemo={reloadStoryDemo}
              isInEditor={isInEditor}
              authData={authData}
              workspaceId={workspaceId}
              storyDemoId={storyDemoInternalRef.current && storyDemoInternalRef.current._id}
              screenId={step.screenId}
              step={stepsInternalRef.current[currentStepIndexState]}
              currentStepIndexState={currentStepIndexState}
            />
          ) : (
            <RoundAudioPlayer
              stepAudio={stepAudio}
              isAudioPlaying={isAudioPlaying}
              setIsAudioPlaying={setIsAudioPlaying}
              autoPlay={true}
              setAudioHasPlayed={setAudioHasPlayed}
              setAudioHasStarted={setAudioHasStarted}
            />
          )
          }
        </WS.AudioWrapper>
      ) : <WS.AudioWrapper>
        {isInEditor ? <AddAudio
          workspaceId={workspaceId}
          storyDemoId={storyDemoInternalRef.current && storyDemoInternalRef.current._id}
          screenId={step && step.screenId}
          step={stepRef.current}
          reloadStoryDemo={reloadStoryDemo}
        /> : ''}
      </WS.AudioWrapper>}

      {isTabsEnabled ? (
        <WS.TabsWrapper
          $isOverlayEnabled={stepIsOverlayEnabled}

          onClick={() => {
          }}>
          <WS.TabsInner>
            <WS.Tabs__TabWrapper>
              {stepsInternalRef.current.map((step, index) => {
                let isViewed = index <= currentStepIndexRef.current

                return (
                  <WS.Tabs__Tab
                    onClick={() => {
                      changeStep(index, stepsInternalRef.current)
                    }}>
                    <WS.Tabs__TabInner
                      className={isViewed ? 'viewed' : ''}
                      $backgroundColor={themeStepBackgroundColor}
                    />
                  </WS.Tabs__Tab>
                )
              })}
            </WS.Tabs__TabWrapper>
          </WS.TabsInner>
        </WS.TabsWrapper>
      ) : ''}

      <WS.TooltipElemAnchorsWrapper ref={tooltipElemAnchorsWrapperRef} id={'tooltip-element-visualizer'}
        fullWidth={fullWidth}
        fullHeight={fullHeight}
        innerWidth={innerWidth}
        innerHeight={innerHeight}
        scalePercentageWidth={scalePercentageWidth}
        scalePercentageHeight={scalePercentageHeight}
      >

      </WS.TooltipElemAnchorsWrapper>
      {showRegions && editorShowRegions ? (
        <RegionsComponent
          stepRegions={stepRegions}
          transitionRegions={transitionRegions}
          setStepRegions={setStepRegions}
          setTransitionRegions={setTransitionRegions}
          currentStepIndex={(currentStepIndexRef - amountOfInitialPosts)}
          omniBarHeight={omniBarHeight}
          wrapperRef={wrapperRef}
          liveDemo={storyDemoState}
          setStepPointerInfo={setStepPointerInfo}
          setTransitionPointerInfo={(newPointerInfo) => {
            let newTransitionPointerInfos = [...transitionPointerInfos].map((pInfo) => {

              if (pInfo.transitionId === newPointerInfo.transitionId) {
                return newPointerInfo
              }

              return pInfo
            })

            setTransitionPointerInfos(newTransitionPointerInfos)
          }}
          isInEditor={isInEditor}
          fullWidth={fullWidth}
          fullHeight={fullHeight}
          scalePercentageWidth={scalePercentageWidth}
          scalePercentageHeight={scalePercentageHeight}
          addTooltipAnchor={addTooltipAnchor}
          removeTooltipAnchor={removeTooltipAnchor}
          tooltipElemAnchorsWrapperRef={tooltipElemAnchorsWrapperRef}
          forceUpdate={forceUpdate}
          innerHeight={innerHeight}
          innerWidth={innerWidth}

        />
      ) : ''}
      {/*<RegionLite></RegionLite>*/}
      <ZoomSpansComponent
        wrapperRef={wrapperRef}
        mainRef={mainRef}
        stepRegions={stepRegions}
        transitionRegions={transitionRegions}
        setStepRegions={setStepRegions}
        setTransitionRegions={setTransitionRegions}
        currentStepIndex={currentStepIndexRef}
        omniBarHeight={omniBarHeight}
        liveDemo={storyDemoState}
        setStepPointerInfo={setStepPointerInfo}
        setTransitionPointerInfo={(newPointerInfo) => {
          let newTransitionPointerInfos = [...transitionPointerInfos].map((pInfo) => {

            if (pInfo.transitionId === newPointerInfo.transitionId) {
              return newPointerInfo
            }

            return pInfo
          })

          setTransitionPointerInfos(newTransitionPointerInfos)
        }}
        fullWidth={fullWidth}
        fullHeight={fullHeight}
        scalePercentageWidth={scalePercentageWidth}
        scalePercentageHeight={scalePercentageHeight}
        addTooltipAnchor={addTooltipAnchor}
        removeTooltipAnchor={removeTooltipAnchor}
        tooltipElemAnchorsWrapperRef={tooltipElemAnchorsWrapperRef}
        forceUpdate={forceUpdate}
        isFullScreen={isFullScreen}
        isInEditor={isInEditor}
        scaleMain={scaleMain}
        videoRef={videoRef}
        currentStep={stepsInternalRef.current[currentStepIndexState]}
        currentScreen={currentScreenDoc}
        innerWidth={innerWidth}
        innerHeight={innerHeight}
        isScaled={isScaled}
        isScaledRef={isScaledRef}

        scaleInProgressRef={scaleInProgressRef}
      />
    </WS.Main>


  </WS.Wrapper>
  )
}

const WC = {
  LoaderWrapper: styled.div`
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 9999999999999;
    background: #111;
  `
}

const WS = {

  Wrapper: styled.div`

    //cursor: none;
  
    overflow: hidden;

    width: ${({ width }) => width};
    height: ${({ height }) => height};
    max-width: 100%;
    max-height: 100%;

    border-radius: 20px;
    box-shadow: 0 0 0 1px rgb(17 24 39 / 16%);
  }

  //height: calc(100% - 65px);

  overflow: hidden

  ;


  && .hidden {
    //display: none;
    visibility: hidden;

    //display: none;
  }

  && .zIndex1 {
    z-index: 1;
  }

  && .zIndex2 {
    z-index: 2;
  }

  && .zIndex3 {
    z-index: 3;
  }
  `,
  TooltipElemAnchorsWrapper: styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
      // width: ${({ fullWidth }) => fullWidth}px;
      // height: ${({ fullHeight }) => fullHeight}px;
    transform-origin: top left;
      // transform: scaleX(${(props) => `${props.scalePercentageWidth}`}) scaleY(${(props) => `${props.scalePercentageHeight}`});
  `,
  OverlayComponent: styled.div`
    width: 100%;
    height: 100%;

    position: absolute;
    top: 0;
    left: 0;


    backdrop-filter: blur(8px);
    background: ${({overlayBackgroundColor}) => overlayBackgroundColor};
    z-index:  4 !important;
  `,
  StepsWrapper: styled.div`
      // width: ${({ fullWidth }) => fullWidth}px;
      // height: ${({ fullHeight }) => fullHeight}px;

    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    

    && {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 998;
    }

    ${({ isOverlayEnabled, overlayBackgroundColor, isPopup }) => {


      if (isOverlayEnabled) {

        return `
          width: 100%;
          height: 100%;

         `
      }

      if (isPopup) {
        return `
          width: 100%;
          height: 100%;
         `
      }
    }} //transform-origin: center;

        // padding-bottom: ${(props) => ((props.fullHeight) / props.fullWidth) * 100}%; /* 16:9 */

      //transform-origin: top left;
  `,
  StepsInnerWrapper: styled.div`
    //transform-origin: top left;
      // width: ${({ fullWidth }) => fullWidth}px;
      // height: ${({ fullHeight }) => fullHeight}px;
      // transform: scaleX(${(props) => `calc(${props.scalePercentageWidth})`}) scaleY(${(props) => `calc(${props.scalePercentageWidth})`});
  `,
  StartButtonWrapper: styled.div`
    position: fixed;
    width: 100%;
    height: 75px;
    z-index: 2;

    bottom: 30px;
    left: 0px;
    display: flex;
    flex-direction: row;
    align-items: center;


  `,
  StartButton: styled.div`
    width: 155px;
    height: 60px;
    position: relative;
    padding: 0px;
    margin: 0px 0px 0px 40px;

    display: flex;
    flex-direction: row;
    /* background: #1070ff; */
    border-radius: 6px;
    align-items: center;


    &&:hover .StartButton__Text {
      display: block;
    }

  `,
  StartButtonText: styled.p`
    color: ${Colors.primaryColor};
    display: none;
    margin: 0px 0px 0px 5px;
    line-height: 60px;
    font-size: 18px;
  `,
  StartButtonIcon: styled.img`
    //width: 100%;
    //height: 100%;

    width: 60px;
    height: 60px;
    position: relative;
    padding: 0px;
    border-radius: 4px;

    cursor: pointer;
    transition: 1s ease-in-out;


    &&:hover {
      transform: scale(1.2);
    }


  `,
  ButtonIcon: styled.span`
    width: 16px;
    height: 16px;

    && img {
      width: 100%;
      height: 100%;
    }
  `,
  Video: styled.video`
    width: 100%;
    height: 100%;
    //transform-origin: top;
    position: absolute;
    left: 0px;
    top: 0px;


    //object-fit: fill;

    max-width: 100%;

    //min-width: 100%;
    //min-height: 100%;

    &&::-webkit-media-controls-panel {
      display: none;
    }

      //transform: scaleX(${({ ratioPercentageX }) => ratioPercentageX}) scaleY(${({ ratioPercentageY }) => ratioPercentageY});
  `,
  VideoWrapper: styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    transform-origin: top left;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;


      // padding-bottom: ${({ innerWidth, innerHeight }) => ((innerHeight / innerWidth) * 100)}%;
  `,
  Main: styled.div`
    width: 100%;
    height: ${({ $isOmniBarDisabled }) => `calc(100% - ${$isOmniBarDisabled ? '0px' : '40px'})`};
    // height: 100%;
    //height: 82.3%;
    //margin-top: -5%;
    position: relative;

    && .hidden {
      //display: none;
      visibility: hidden;
    }

    && .zIndex {
      z-index: 2;
    }


    overflow: hidden;


    transition-property: transform;
    transition-duration: 1100ms;
    transform: translate3d(0px, 0px, 0px) scale(1);
    transform-origin: 0px 0px;
    will-change: transform;

  `,
  RegionsWrapper: styled.div`


    && > div > div > div:nth-child(2) {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: -1;
    }
  `,
  Tippy: styled(Tippy)`


    && {
      background: ${Colors.primaryColor} !important;
      color: white;
      font-size: 1.2rem;
      padding: 10px 15px;
      max-width: 250px;
      border-radius: 6px;
    }

    && .tippy-arrow::before {
      color: ${Colors.primaryColor} !important;
    }
  `,
  Hotspot: styled.span`
    && {
      opacity: ${props => props.$show ? '1' : '0'};
      //cursor: pointer;
      cursor: ${({ $isInEditor }) => $isInEditor ? 'move' : 'cursor'};
      transition: ${props => props.$isMoving ? 'none' : '0.4s ease-in-out'};
      position: absolute;

      top: 0;
      left: 0;
      transform: translate(${(props) => props.$frameX}px, ${(props) => props.$frameY}px);
    }
  `,
  HotspotTextWrapper: styled.span`

    color: white;
    width: 100%;
    height: 100%;

  `,
  NavigationWrapper: styled.div`
    //width: 100%;
    //height: 100%;
    z-index: ${({ $showHotspot }) => $showHotspot ? '3' : '-1'};

    position: fixed;
    top: 0;
    left: 0;
  `,
  ImagesWrapper: styled.div`
    max-width: 100%;
    height: 100%;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    overflow: hidden;
    width: 100%;

    //position: relative;
    position: absolute;
    top: 0;
    left: 0;
  `,
  ImageContainer: styled.span`
    position: absolute;
    top: 0;
    left: 0;
    //position: relative;
    width: 100%;
    height: 100%;

  `,
  Image: styled.img`
    width: 100%;
    height: 100%;
    background: white;

    //position: absolute;
    //top: 0;
    //left: 0;
  `,
  OmniBar: styled.div`
    background: #f3f4f6;
    width: 100%;
    height: 40px;
    display: flex;
    padding: 0px 15px 0px 15px;
    position: relative;
    flex-direction: row;
    align-items: center;
    z-index: 999;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    //justify-content: space-between;


    ${({ $width }) => {
      if ($width < 150) {
        return `
                    padding: 0px 5px 0px 5px;
                    && .OmniBar__leftSide {
                        width: 20%;
                    }
                    && .OmniBar__rightSide {
                        width: 0%;
                        display: none;
                    }
                    && .OmniBar__url {
                        width: 80%
                    }

                    && .UrlWrapper__lockIcon {
                        display: none;
                    }

                    && .UrlWrapper__urlName {
                        margin: 2px;
                    }
                `

      }

      if ($width < 305) {
        return `
                padding: 0px 5px 0px 5px;

                && .OmniBar__leftSide {
                    width: 15%;
                }
                && .OmniBar__rightSide {
                    width: 25%;
                }

                && .OmniBar__url {
                    width: 60%;
                }
            `

      }
    }} @media (
    max-width: 420px) {
    && span.OmniBar__leftSide {
      min-width: 25%;
    }

    && span.OmniBar__url {
      min-width: 70%;
    }

    && span.OmniBar__rightSide {
      width: 0px;
      display: none
    }
  }


    @media (max-width: 390px) {
      && .OmniBar__exitBtn,
      && .OmniBar__minimizeBtn {
        display: none
      }

      && .OmniBar__maximizeBtn {
        margin: 0 auto;
      }

      && span.OmniBar__leftSide {
        min-width: 15%;
      }

      && span.OmniBar__url {
        min-width: 85%;
      }

    }

  `

  ,
  OmniBar_Container: styled.span`
    width: 20%;

    &&.rightSide {
      @media (max-width: 400px) {
        width: 0px;
      }
    }

    &&.leftSide {
      @media (max-width: 400px) {
        width: 33vw;
      }
    }
  `,
  OmniBar__LineSpace: styled.span`


  `,
  OmniBar__StepIndicator: styled.p`
    margin: 0px;
    padding-left: 15px;
    color: ${Colors.primaryColor};
    font-weight: 550;
  `,
  OmniBar__urlWrapperLeft: styled.span`
    width: 15%;
  `,

  OmniBar__urlWrapperRight: styled.span`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    width: 45px;
  `,
  OmniBar__urlWrapperInner: styled.span`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;

    flex-grow: 1;
    max-width: 65%;


    @media (max-width: 400px) {
      width: 75%;
    }
  `,
  OmniBar__urlWrapper: styled.span`
    height: 30px;
    width: 60%;
    background-color: #e5e7eb;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;

    //@media (max-width: 500px) {
    //  width: 70%;
    //}

    border-radius: 8px;

  `,
  UrlName: styled.p`
    margin: 0px;
    font-size: 0.8em;
    color: rgba(0, 0, 0, 0.65);
    font-family: ${Colors.fontFamilyApple};
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  `,
  UrlReload: styled(ReloadOutlined)`
    width: ${({ $width = 16 }) => $width}px;
    height: ${({ $height = 16 }) => $height}px;
    margin-left: 10px;
    margin-right: 10px;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${({ $fill = '#9ca3af' }) => $fill};
    }

    cursor: pointer;

    &&:hover svg {
      fill: #333;
    }
  `,
  UrlLock: styled(LockFilled)`
    width: ${({ $width = 14 }) => $width}px;
    height: ${({ $height = 14 }) => $height}px;
    margin-left: 10px;
    margin-right: 10px;

    && svg {
      fill: ${({ $fill = '#9ca3af' }) => $fill};
      width: 100%;
      height: 100%;
    }
  `,

  OmniBar__Buttons: styled.span`


    display: flex;
    flex-direction: row;

    align-items: center;
    justify-content: space-between;
    max-width: 65px;
    height: 100%;
  `,
  WatermarkWrapper: styled.div`
    position: fixed;
    //width: 25%; //240px;
    //height: 16%; //75px;
    height: fit-content;
    width: fit-content;
      // height: ${({ isInEditor }) => isInEditor ? '3vw' : '5vw'};
      //width: ${({ isInEditor }) => isInEditor ? '3vw' : '5vw'};

    max-width: 240px;
    max-height: 75px;
    z-index: 4;
    //opacity: 0.75;
    //background: #f9f9f9;
    background: transparent;
    //border: 2px solid #999;
    border-radius: 6px;

    bottom: 35px;
    right: 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;

    transition: 0.4s ease-in-out;


    && .watermark-icon-inner-layer {
      transition: all 0.4s ease-in-out;
    }

    && .Watermark__Icon {
      transition: all 0.4s ease-in-out;
    }

    &&:hover {

      width: fit-content;
      height: fit-content;
        // height: ${({ isInEditor }) => isInEditor ? '3vw' : '5.5vw'};
        // width: ${({ isInEditor }) => isInEditor ? '10vw' : '18vw'};
    }

    &&:hover .watermark-icon-inner-layer {
      fill: ${Colors.primaryColor};
    }

    &&:hover .Watermark__Text {

      width: fit-content;
      padding: 8px;

        // height: ${({ isInEditor }) => isInEditor ? '100%' : '100%'};
        // width: ${({ isInEditor }) => isInEditor ? '8vw' : '12vw'};
        // line-height: ${({ isInEditor }) => isInEditor ? '3vw' : '5.5vw'};
      //width: 12vw;
      //height: 100%;
      //line-height: 5.5vw;
    }

    &&:hover .Watermark__Icon {
      //margin-left: 5px;
      opacity: 1;
    }

    //&&:hover .Watermark__Text {
    //    margin-left: 5px;
    //}


    &&:hover {
      //border: 2px solid #111;
      //box-shadow: rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
      opacity: 1;

      //background: #fff;
      border-radius: 8px;
    }
  `,
  ConfettiWrapper: styled.span`
    z-index: 3;
  `,
  WatermarkButton: styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 100%;

  `,
  Watermark__Icon: styled('svg')`
    //height: 4.8vw;
    //width: 4.8vw;

    opacity: 0.75;
    height: ${({ $isInEditor }) => $isInEditor ? '3vw' : '4.8vw'};
    width: ${({ $isInEditor }) => $isInEditor ? '3vw' : '4.8vw'};

    //max-width: 46px;
    //min-width: 46px;
    //max-height: 46px;
    //min-height: 46px;
    position: relative;
    padding: 0px;
    border-radius: 4px;


  `,
  Watermark__Image: styled.img`

    opacity: 0.75;
    height: ${({ $isInEditor }) => $isInEditor ? '3vw' : '4.8vw'};
    width: ${({ $isInEditor }) => $isInEditor ? '3vw' : '4.8vw'};

    position: relative;
    padding: 0px;
    border-radius: 4px;


  `,
  Watermark__Text: styled.div`
    font-family: ${Colors.fontFamily};
    //font-size: 2vw;
    font-size: ${({ $isInEditor }) => $isInEditor ? '1.2vw' : '1.2vw'};
    width: 0px;
    padding: 0px;
    box-sizing: border-box;
    opacity: 1;

    overflow: hidden;
    text-overflow: clip;

    transition: 0.4s ease-in-out;
    transition-property: padding-left, padding-right;

    background: #1f2936;
    border-radius: 8px;
    color: #f9f9f9;
    height: fit-content;
  }

  @media (max-width: 650px) {
    font-size: 1em;
  }

  `,
  TabsWrapper: styled.div`
    position: fixed;
    bottom: 0;
    z-index: 3;
    width: 100%;
    height: 4vw;

    @media (max-height: 350px) {
      height: 2vw;
    }

    transition: 0.3s ease-in-out;
    opacity: 0.8;

    ${({ $isOverlayEnabled }) => {
      if ($isOverlayEnabled) {
        return `
          z-index: 4 !important;
        `
      } else {
        return ''
      }
    }}
    &&:hover {
      height: 9vw;
      opacity: 1;

    }
  `,
  TabsInner: styled.div`
    background-image: linear-gradient(rgba(255, 255, 255, 0), rgba(17, 24, 39, 0.1) 15%, rgb(30, 31, 68));

    //background-image: linear-gradient(to bottom,#ffffff00,rgba(17,24,39,.1),#1E1F44);
    height: 9vw;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: end;
  `,
  Tabs__TabWrapper: styled.div`
    width: 70%;
    height: 4vw;

    @media (max-height: 350px) {
      height: 2vw;
    }

    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  `,
  Tabs__Tab: styled.div`
    margin-left: 5px;

    &&:first-child {
      margin: 0px
    }

    cursor: pointer;

    flex-grow: 1;
    height: 9vw;
    display: flex;
    align-items: center;

    &&:hover > span {
      height: 0.8vw;
    }
  `,
  Tabs__TabInner: styled.span`
    border-radius: 4px;
    width: 100%;
    background: rgba(249, 249, 249, 0.76);
    height: 0.45vw;

    transition: 0.2s ease-in-out;


    &&.viewed {
      background: ${({ $backgroundColor }) => $backgroundColor};
    }
  `,
  PauseIcon: styled(CaretRightOutlined)`
    position: absolute;
    width: ${({ $width = '25em' }) => $width};
    height: ${({ $height = '50em' }) => $height};
    z-index: 5;
    display: none;
    //display: block;
    opacity: 0;
    transition: 0.3s ease-in;

    &&.show {
      opacity: 1;
      display: block;
    }

    && svg {
      width: 100%;
      height: 100%;
    }
  `,
  SpeedUpIcon: styled(ForwardOutlined)`
    position: absolute;
    width: ${({ $width = '25em' }) => $width};
    height: ${({ $height = '50em' }) => $height};
    z-index: 5;
    display: none;
    opacity: ${({ $opacity = 0.7 }) => $opacity};
    transition: 0.3s ease-in;

    &&.show {
      display: block;
      opacity: 1;
    }

    && svg {
      width: 100%;
      height: 100%;
    }
  `,
  AudioWrapper: styled.div`
    position: absolute;
    z-index: 4;
    top: 20px;
    right: 20px;

  `,

}

export default WalkthroughComponent
