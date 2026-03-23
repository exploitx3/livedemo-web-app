import React, { useEffect, useState, forwardRef } from 'react'
import Colors from '../../../constants/mainColors.js'
// import { Rings } from 'react-loader-spinner'
import Rings from '../../injectScriptComponents/Rings/Rings.js'
import HotspotContent from '../HotspotContent/HotspotContent.js'
import styled from 'styled-components'

import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
import TippyModule from '@tippyjs/react'

// Ensure we get the actual component (handle both default and named exports)
const Tippy = TippyModule?.default || TippyModule

const HOTSPOT_SIZE = 90

function Tip({ children, themeBackgroundColor, ...props }) {
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


function HotspotStep({
    prevStep,
    screenId,
    screen,
    step,
    isInEditor,
    widthDimensionPercentage,
    heightDimensionPercentage,
    navWrapperRef,
    currentStepIndex,
    currentStepIndexCount,
    liveDemo,
    liveDemoRef,
    setLiveDemo,
    changeStep,
    setTransitions,
    isOmniBarDisabled,
    isScaled,
    scaleValuesRef,

    size,
    onBack,
    onNext,
    onSkip,
    themeBackgroundColor,
    themeTextColor,
    themeButtonBackgroundColor,
    themeButtonTextColor,
    wrapperWidth,
    wrapperHeight,
    moveAutoCursor,
    clearAutoCursor,
    audioHasPlayed

}) {
    // console.log(' step screenId')
    // console.log(screenId)


    let innerWidth = wrapperWidth ? wrapperWidth : window.innerWidth
    let innerHeight = wrapperHeight ? wrapperHeight : window.innerHeight

    let [hasSetupDragging, setHasSetupDragging] = useState(false)

    let textFontSize = 2 // + (2.70 * (1 - widthDimensionPercentage))
    let hotspotSize = HOTSPOT_SIZE

    let reverseWidthPercentage = 1 + (1 - widthDimensionPercentage)

    if (reverseWidthPercentage !== 1) {
        textFontSize = 2.25 * reverseWidthPercentage
    }

    if (reverseWidthPercentage && widthDimensionPercentage < 0.50) {

        textFontSize *= 1.45
        hotspotSize *= 1.05
    }

    let omniBarHeight = isOmniBarDisabled ? 0 : 40

    let tabInfoWidth = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerWidth) ? liveDemo.windowMeasures.innerWidth : (liveDemo.tabInfo ? liveDemo.tabInfo.width : 1366)
    let tabInfoHeight = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerHeight) ? liveDemo.windowMeasures.innerHeight : (liveDemo.tabInfo ? liveDemo.tabInfo.height : 664)

    let hotspotReversePercentageX = 1 + ((tabInfoWidth - innerWidth) / innerWidth)
    let hotspotReversePercentageY = 1 + (((tabInfoHeight) - (innerHeight - omniBarHeight)) / (innerHeight - omniBarHeight))

    let [isHotspotMoving, setIsHotspotMoving] = useState(false)

    // let hotspotPositionX = ((transition.frameX * 1) - hotspotSize / 2)
    // let hotspotPositionY = ((transition.frameY * 1) - hotspotSize / 2)

    // let xPercentage = innerWidth / tabInfoWidth
    // let yPercentage = (innerHeight - omniBarHeight) / tabInfoHeight
    //
    // let hotspotPositionX = ((step.view.hotspot.frameX * xPercentage) - (hotspotSize / 2))
    // let hotspotPositionY = ((step.view.hotspot.frameY * yPercentage) - (hotspotSize / 2))
    //
    //
    // let hotspotPositionXTest = ((step.view.hotspot.frameX) - (hotspotSize / 2)) * xPercentage
    // let hotspotPositionYTest = ((step.view.hotspot.frameY) - (hotspotSize / 2)) * yPercentage

    let isAutoPlayEnabled = true

    useEffect(() => {
        var timer
        if (isAutoPlayEnabled) {

            timer = setTimeout(() => {

                const rect = document.getElementById(`hotspot_${step._id}`).getBoundingClientRect();
                let moveX = rect.x
                let moveY = rect.y


                moveAutoCursor(moveX + 33, moveY + 40)

            }, 1.1 * 1000)
        }

        return function () {
            if (timer) {
                clearTimeout(timer)
                clearAutoCursor(step)
            }
        }

    }, [isScaled, audioHasPlayed]);


    function setTranslate(xPos, yPos, el) {
        el.style.transform = 'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)'
    }

    function setupDragging(step) {

        let clickElem = document.querySelector(`#hotspot_${step._id} svg`)
        let dragElem = document.querySelector(`#hotspot_${step._id}`)
        let container = navWrapperRef.current

        let isDragging = false
        let currentX
        let currentY
        let initialX = 0 //-10
        let initialY = 0 //70
        let xOffset = 0
        let yOffset = 0


        let xMulti = 1 + 0.4229765013 //((1366 - window.innerWidth) / window.innerWidth) + 1
        let yMulti = 1 + 0.14457831325 // ((632 - window.innerHeight) / window.innerHeight) + 1

        container.addEventListener('touchstart', dragStart, false)
        container.addEventListener('touchend', dragEnd, false)
        container.addEventListener('touchmove', drag, false)

        container.addEventListener('mousedown', dragStart, false)
        container.addEventListener('mouseup', dragEnd, false)
        container.addEventListener('mousemove', drag, false)

        function drag(e) {
            if (isDragging) {

                e.preventDefault()

                if (e.type === 'touchmove') {
                    currentX = e.touches[0].clientX - initialX
                    currentY = e.touches[0].clientY - initialY
                } else {
                    currentX = e.clientX - initialX
                    currentY = e.clientY - initialY
                }

                xOffset = currentX - (hotspotSize / 2)
                yOffset = currentY - (hotspotSize / 2) - omniBarHeight


                setTranslate(xOffset, yOffset, dragElem)
            }
        }

        function dragStart(e) {

            if (e.target === clickElem || clickElem.contains(e.target)) {

                // if (dragDisabled) {
                isDragging = true
                setIsHotspotMoving(true)
                // setDragDisabled(false)
                // }

            } else {
                // console.log(e.target)
            }
        }

        function dragEnd(e) {
            if (isDragging) {
                isDragging = false
                setIsHotspotMoving(false)

                // console.log(e)
                let saveX = e.clientX * hotspotReversePercentageX
                let saveY = (e.clientY - omniBarHeight) * hotspotReversePercentageY

                // console.log(saveX)
                // console.log(saveY)

                onSaveHotspot(dragElem, saveX, saveY)
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


    function onSaveHotspot(element, xVal, yVal) {

        let liveDemoInternal = liveDemoRef.current


        const transform = element.style.transform
        const re = /translate3d\((?<x>.*?)px, (?<y>.*?)px, (?<z>.*?)px/
        const results = re.exec(transform)
        // console.log(results.groups.x, results.groups.y, results.groups.z)

        // let newFrameX = (parseFloat(results.groups.x)) * hotspotReversePercentageX
        // let newFrameY = (parseFloat(results.groups.y)) * hotspotReversePercentageY


        topPostMesage({
            type: 'hotspot_set',
            stepId: step._id,
            screenId: screenId,
            frameX: xVal,
            frameY: yVal
        })

        // console.log('newFrameX: ' + xVal)
        // console.log('newFrameY: ' + yVal)

        let newStep = { ...step }
        newStep.view.hotspot.frameX = xVal
        newStep.view.hotspot.frameY = yVal


        let newScreen = { ...liveDemoInternal.screens.find(scr => scr._id === screenId) }

        newScreen.steps = newScreen.steps.map(step => {
            if (step._id === newStep._id) {

                return { ...step, ...newStep }
            } else {

                return step
            }
        })

        let newLiveDemo = { ...liveDemoInternal }
        newLiveDemo.screens = newLiveDemo.screens.map((scr) => {
            if (scr._id === newScreen._id) {
                return newScreen
            }

            return scr
        })


        // console.log('step hotspot on save')
        // console.log(newLiveDemo)
        // setLiveDemo(newLiveDemo)

        // console.log('save hotspotPositionX: ' + hotspotPositionX)
        // console.log('save hotspotPositionY: ' + hotspotPositionY)


    }

    function topPostMesage(messageObj) {

        console.log("topPostMessage")
        // console.log(messageObj)

        let topWindow = window
        if (window.top) {
            topWindow = window.top
        }


        topWindow.postMessage(messageObj, '*')
    }

    function getScreenIndex(screenId, liveDemo) {
        let stepString = "Step "
        let calculatedStepIndex = 0

        let screenIndex = null
        liveDemo.screens.forEach((screen, index) => {
            if (screen._id === screenId) {
                screenIndex = index
            }
        })


        if (screenIndex !== null) {
            let totalStepsBefore = liveDemo.screens.slice(0, screenIndex).reduce((accum, scr) => {
                return accum + ((scr.steps && scr.steps.length) || 1)
            }, 0)

            calculatedStepIndex += totalStepsBefore
        }

        return calculatedStepIndex
    }

    let showHeader = step && step.view && step.view.showHeader
    let showFooter = step && step.view && step.view.showFooter

    // Check if prevStep was a hotspot and extract coordinates
    let prevHotspotX = null
    let prevHotspotY = null
    console.log('step index', step?.index)
    console.log('prevStep index', prevStep?.index)
    if (prevStep && prevStep.view && prevStep.view.viewType === 'hotspot' && prevStep.view.hotspot) {
        prevHotspotX = prevStep.view.hotspot.frameX
        prevHotspotY = prevStep.view.hotspot.frameY
    }

    return <HotspotContent
        view={step.view}
        hotspotId={step._id}

        screenId={screenId}
        screen={screen}
        isInEditor={isInEditor}
        widthDimensionPercentage={widthDimensionPercentage}
        heightDimensionPercentage={heightDimensionPercentage}
        navWrapperRef={navWrapperRef}
        currentStepIndexCount={currentStepIndexCount}
        currentStepIndex={currentStepIndex}

        liveDemo={liveDemo}
        setLiveDemo={setLiveDemo}

        changeStep={changeStep}

        setTransitions={setTransitions}


        isScaled={isScaled}
        scaleValuesRef={scaleValuesRef}

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

        wrapperWidth={wrapperWidth}
        wrapperHeight={wrapperHeight}

        prevHotspotX={prevHotspotX}
        prevHotspotY={prevHotspotY}

        onClick={() => {
            if (isInEditor) {
                return
            }


            let newIndex = currentStepIndex.current + 1
            changeStep(newIndex)

        }}
        onSaveHotspot={onSaveHotspot}
    />
}

const HT = {
    Tippy: styled(Tippy).withConfig({
        shouldForwardProp: (prop) => prop !== '$themeBackgroundColor',
    })`


        && {
            background: ${({ $themeBackgroundColor }) => $themeBackgroundColor} !important;
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
            color: ${({ themeBackgroundColor }) => themeBackgroundColor} !important;
        }
    `,
    HotspotTextWrapper: styled.span.withConfig({
        shouldForwardProp: (prop) => !['textFontSize', 'themeTextColor'].includes(prop),
    })`
        //font-size: 6vmin;
        font-size: ${({ textFontSize }) => textFontSize}vmin;
        color: ${({ themeTextColor }) => themeTextColor};
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
            cursor: ${({ isInEditor }) => isInEditor ? 'move' : 'cursor'};
            transition: ${props => props.isMoving ? 'none' : '0.4s ease-in-out'};
            position: absolute;

            top: 0;
            left: 0;
            transform: translate(${(props) => props.frameX}px, ${(props) => props.frameY}px);
            transform-origin: top left;
        }
    `,


}

export default HotspotStep
