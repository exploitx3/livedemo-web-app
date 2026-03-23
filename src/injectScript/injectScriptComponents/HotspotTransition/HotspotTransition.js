import React, {useState, forwardRef} from 'react'
import Colors from '../../../constants/mainColors.js'
// import { Rings } from 'react-loader-spinner'
import Rings from '../../injectScriptComponents/Rings/Rings.js'

import HotspotContent from '../HotspotContent/HotspotContentEditor.js'
import styled from 'styled-components'

import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
import TippyModule from '@tippyjs/react'

// Ensure we get the actual component (handle both default and named exports)
const Tippy = TippyModule?.default || TippyModule

const HOTSPOT_SIZE = 90

function Tip({children, themeBackgroundColor, ...props}) {

    return <HT.Tippy {...props} $themeBackgroundColor={themeBackgroundColor}>{children}</HT.Tippy>
}


const Hotspot = React.forwardRef(function (props, ref) {

    return <span id={'hotspot_inner'} onClick={props.onClick ? props.onClick : () => {
    }} ref={ref}>

      <Rings
          color={Colors.primaryColor}
          {...props}
      />
    </span>
})


function HotspotTransition({
                               screenId,
                               screen,
                               transition,
                               isInEditor,
                               widthDimensionPercentage,
                               heightDimensionPercentage,
                               navWrapperRef,
                               currentStepIndex,
                               liveDemo,
                               liveDemoRef,
                               setLiveDemo,
                               changeStep,
                               setHotspotTransitions,
                               isOmniBarDisabled,
                               hotspotTransitions,

                               size,
                               step,
                               onBack,
                               onNext,
                               onSkip,
                               themeBackgroundColor,
                               themeTextColor,
                               themeButtonBackgroundColor,
                               themeButtonTextColor,
                               wrapperWidth,
                               wrapperHeight,
                               scaleValuesRef
                           }) {
    // console.log(' transition screenId')
    // console.log(screenId)

    let innerWidth = wrapperWidth ? wrapperWidth : window.innerWidth
    let innerHeight = wrapperHeight ? wrapperHeight : window.innerHeight

    let [hasSetupDragging, setHasSetupDragging] = useState(false)

    let textFontSize = '2vw' // + (2.70 * (1 - widthDimensionPercentage))
    let hotspotSize = HOTSPOT_SIZE

    let reverseWidthPercentage = 1 + (1 - widthDimensionPercentage)

    if (wrapperWidth <= 1040) {
        textFontSize = '14px'
    } else if (wrapperWidth > 1040) {
        textFontSize = '1.1vw'
    }
    if (wrapperWidth < 540) {
        textFontSize = '2.7vw'
    }

    if (isInEditor) {
        textFontSize = '14px'
    }

    let omniBarHeight = isOmniBarDisabled ? 0 : 40

    let tabInfoWidth = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerWidth) ? liveDemo.windowMeasures.innerWidth : (liveDemo.tabInfo ? liveDemo.tabInfo.width : 1366)
    let tabInfoHeight = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerHeight) ? liveDemo.windowMeasures.innerHeight : (liveDemo.tabInfo ? liveDemo.tabInfo.height : 664)

    let hotspotReversePercentageX = 1 + ((tabInfoWidth - innerWidth) / innerWidth)
    let hotspotReversePercentageY = 1 + (((tabInfoHeight) - (innerHeight - omniBarHeight)) / (innerHeight - omniBarHeight))

    let [isHotspotMoving, setIsHotspotMoving] = useState(false)

    // let hotspotPositionX = ((transition.frameX * 1) - hotspotSize / 2)
    // let hotspotPositionY = ((transition.frameY * 1) - hotspotSize / 2)

    let xPercentage = innerWidth / tabInfoWidth
    let yPercentage = (innerHeight - omniBarHeight) / tabInfoHeight

    function setTranslate(xPos, yPos, el) {
        el.style.transform = 'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)'
    }

    function onSaveHotspot(element, xVal, yVal, screenId) {

        const transform = element.style.transform
        const re = /translate3d\((?<x>.*?)px, (?<y>.*?)px, (?<z>.*?)px/
        const results = re.exec(transform)
        // console.log(results.groups.x, results.groups.y, results.groups.z)

        // let newFrameX = (parseFloat(results.groups.x)) * hotspotReversePercentageX
        // let newFrameY = (parseFloat(results.groups.y)) * hotspotReversePercentageY


        topPostMesage({
            type: 'hotspot_set',
            transitionId: transition._id,
            screenId: screenId,
            frameX: xVal,
            frameY: yVal
        })

        // console.log('newFrameX: ' + xVal)
        // console.log('newFrameY: ' + yVal)

        let newTransition = {...transition}
        newTransition.hotspot.frameX = xVal
        newTransition.hotspot.frameY = yVal

        let newHotspotTransitions = hotspotTransitions.map(iterTransition => {
            if (iterTransition._id === newTransition._id) {
                return newTransition
            }

            return iterTransition
        })


        setHotspotTransitions(newHotspotTransitions)
    }

    function topPostMesage(messageObj) {

        // console.log("topPostMessage")
        // console.log(messageObj)

        let topWindow = window
        if (window.top) {
            topWindow = window.top
        }


        topWindow.postMessage(messageObj, '*')
    }

    function getScreenIndex(screenId, storyDemo) {
        let stepString = "Step "
        let calculatedStepIndex = 0

        let screenIndex = null
        storyDemo.screens.forEach((screen, index) => {
            if (screen._id === screenId) {
                screenIndex = index
            }
        })


        if (screenIndex !== null) {
            let totalStepsBefore = storyDemo.screens.slice(0, screenIndex).reduce((accum, scr) => {
                return accum + ((scr.steps && scr.steps.length) || 1)
            }, 0)

            calculatedStepIndex += totalStepsBefore
        }

        return calculatedStepIndex
    }

    let showHeader = transition && transition.view && transition.view.showHeader
    let showFooter = transition && transition.view && transition.view.showFooter


    return <HotspotContent
        view={transition}
        hotspotId={transition._id}


        screenId={screenId}
        screen={screen}
        isInEditor={isInEditor}
        widthDimensionPercentage={widthDimensionPercentage}
        heightDimensionPercentage={heightDimensionPercentage}
        navWrapperRef={navWrapperRef}
        currentStepIndex={currentStepIndex}

        liveDemo={liveDemo}
        setLiveDemo={setLiveDemo}

        changeStep={changeStep}

        isOmniBarDisabled={isOmniBarDisabled}
        showHeader={showHeader}
        showFooter={showFooter}
        size={size}
        onBack={onBack}
        onNext={onNext}
        onSkip={onSkip}
        themeBackgroundColor={themeBackgroundColor}
        themeTextColor={themeTextColor}
        themeButtonBackgroundColor={themeButtonBackgroundColor}
        themeButtonTextColor={themeButtonTextColor}
        scaleValuesRef={scaleValuesRef}
        onClick={() => {
            if (isInEditor) {
                return
            }

            let newTransitions = hotspotTransitions.filter(iterTransition => iterTransition._id !== transition._id)
            setHotspotTransitions(newTransitions)


            if (transition.gotoType === 'website') {

                let website = transition.gotoWebsite
                if (!website.startsWith('http')) {
                    website = 'https://' + website
                }
                window.open(website, '_blank')

            } else if (transition.gotoType === 'screen') {

                let newIndex = getScreenIndex(transition.gotoScreen._id, liveDemo)
                changeStep(newIndex)

            } else if (transition.gotoType === 'next') {

                let newIndex = currentStepIndex.current + 1
                changeStep(newIndex)
            }

        }}
        onSaveHotspot={(element, xVal, yVal,) => {

            onSaveHotspot(element, xVal, yVal, transition.screenId)
        }}

        wrapperWidth={wrapperWidth}
        wrapperHeight={wrapperHeight}
    />
}

const HT = {
    Tippy: styled(Tippy).withConfig({
        shouldForwardProp: (prop) => prop !== '$themeBackgroundColor',
    })`


        && {
            background: ${({$themeBackgroundColor}) => $themeBackgroundColor} !important;
            color: white;
            font-size: 1.2rem;
            //padding: 10px 15px;
            max-width: 750px !important;
            border-radius: 6px;
            min-width: 220px;

        }

        && .tippy-content {
            max-width: 250px;
            width: max-content;
            padding: 0px;
        }

        && .tippy-arrow::before {
            color: ${({$themeBackgroundColor}) => $themeBackgroundColor} !important;
        }
    `,
    HotspotTextWrapper: styled.span.withConfig({
        shouldForwardProp: (prop) => !['textFontSize', 'themeTextColor'].includes(prop),
    })`
        //font-size: 6vmin;
        font-size: ${({textFontSize}) => textFontSize}vmin;
        color: ${({themeTextColor}) => themeTextColor};
        height: 100%;
        font-weight: 550;
        font-family: ${Colors.fontFamily};

        //max-width: 250px;
        max-width: 29vw;
        width: max-content;
        overflow-wrap: break-word;



    `,
    Hotspot: styled.span.withConfig({
        shouldForwardProp: (prop) => !['show', 'isInEditor', 'isMoving', 'frameX', 'frameY'].includes(prop),
    })`
        && {
            opacity: ${props => props.show ? '1' : '0'};
            //cursor: pointer;
            cursor: ${({isInEditor}) => isInEditor ? 'move' : 'cursor'};
            transition: ${props => props.isMoving ? 'none' : '0.4s ease-in-out'};
            position: absolute;

            top: 0;
            left: 0;
            transform: translate(${(props) => props.frameX}px, ${(props) => props.frameY}px);
            transform-origin: top left;
        }
    `,


}

export default HotspotTransition
