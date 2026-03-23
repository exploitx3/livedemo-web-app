import React, { useEffect, useRef, useState, forwardRef } from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
// import { Rings } from 'react-loader-spinner'
import Rings from '../../injectScriptComponents/Rings/Rings.js'
import TooltipContent from '../TooltipContent/TooltipContent.js'

import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
import TippyModule from '@tippyjs/react'

// Ensure we get the actual component (handle both default and named exports)
const Tippy = TippyModule?.default || TippyModule

import { parseFragment } from 'parse5'

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

function Tip({ children, themeBackgroundColor, ...props }) {
    return <HT.Tippy {...props} $themeBackgroundColor={themeBackgroundColor}>{children}</HT.Tippy>
}


const Hotspot = React.forwardRef(function (props, ref) {

    return <span id={'hotspot_inner'} className={'cursor-pointer'} onClick={props.onClick ? props.onClick : () => {
    }} ref={ref}>

        <Rings
            color={Colors.primaryColor}
            {...props}
        />
    </span>
})


function HotspotContent({
    view,
    hotspotId,
    isInEditor,
    widthDimensionPercentage,
    heightDimensionPercentage,
    navWrapperRef,
    currentStepIndexCount,
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
    wrapperHeight,


    isScaled,
    scaleValuesRef,

    prevHotspotX,
    prevHotspotY

}) {


    // console.log('HotspotContent - rendered')
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

    let textFontSize = '2vw' // + (2.70 * (1 - widthDimensionPercentage))
    let hotspotSize = HOTSPOT_SIZE

    let reverseWidthPercentage = 1 + (1 - widthDimensionPercentage)

    textFontSize = '14px'

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

    let omniBarHeight = isOmniBarDisabled ? 0 : 40

    let tabInfoWidth = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerWidth) ? liveDemo.windowMeasures.innerWidth : (liveDemo.tabInfo ? liveDemo.tabInfo.width : 1366)
    let tabInfoHeight = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerHeight) ? liveDemo.windowMeasures.innerHeight : (liveDemo.tabInfo ? liveDemo.tabInfo.height : 664)

    let innerWidth = wrapperWidth ? wrapperWidth : window.innerWidth
    let innerHeight = wrapperHeight ? wrapperHeight : window.innerHeight

    let hotspotReversePercentageX = 1 + ((tabInfoWidth - innerWidth) / innerWidth)
    let hotspotReversePercentageY = 1 + (((tabInfoHeight) - (innerHeight - omniBarHeight)) / (innerHeight - omniBarHeight))

    let [isHotspotMoving, setIsHotspotMoving] = useState(false)

    // let hotspotPositionX = ((transition.frameX * 1) - hotspotSize / 2)
    // let hotspotPositionY = ((transition.frameY * 1) - hotspotSize / 2)
    let reverseScale = !isScaled ? 1 : 1 / scaleValuesRef.current.scaleValueX


    let xOriginalPercentage = Math.min(tabInfoWidth, ((innerWidth) / tabInfoWidth))
    let yOriginalPercentage = Math.min(tabInfoHeight, ((innerHeight - omniBarHeight) / tabInfoHeight))


    let xPercentage = Math.min(tabInfoWidth, ((innerWidth) / tabInfoWidth))
    let yPercentage = Math.min(tabInfoHeight, ((innerHeight - omniBarHeight)) / tabInfoHeight)


    // let hotspotPositionX =  (((view.hotspot.frameX * (2 - liveDemo.windowMeasures.devicePixelRatio)) * xPercentage) - (hotspotSize / 2))  //+ (!isScaled ? 0 : scaleValuesRef.current.newLeft)
    // let hotspotPositionY = (((view.hotspot.frameY * (2 - liveDemo.windowMeasures.devicePixelRatio)) * yPercentage) - (hotspotSize / 2)) //+ (!isScaled ? 0 : scaleValuesRef.current.newTop)

    let hotspotPositionX = ((view.hotspot.frameX * xPercentage) - (hotspotSize / 2))  //+ (!isScaled ? 0 : scaleValuesRef.current.newLeft)
    let hotspotPositionY = ((view.hotspot.frameY * yPercentage) - (hotspotSize / 2)) //+ (!isScaled ? 0 : scaleValuesRef.current.newTop)

    // let hotspotPositionX = ((view.hotspot.frameX * xPercentage) - (hotspotSize / 2))  //+ (!isScaled ? 0 : scaleValuesRef.current.newLeft)
    // let hotspotPositionY = ((view.hotspot.frameY * yPercentage) - (hotspotSize / 2)) //+ (!isScaled ? 0 : scaleValuesRef.current.newTop)

    let newHotspotSize = hotspotSize * scaleValuesRef.current.scaleValueX


    let originalX
    let originalY

    if (isScaled) {
        hotspotSize = hotspotSize //* reverseScale
        // hotspotSize = hotspotSize * scaleValuesRef.current.scaleValueX


        // xPercentage = Math.min(tabInfoWidth, ((innerWidth * (!isScaled ? 1 : scaleValuesRef.current.scaleValueX)) / tabInfoWidth))
        // yPercentage = Math.min(tabInfoHeight, (((innerHeight - omniBarHeight) * (!isScaled ? 1 : scaleValuesRef.current.scaleValueX))) / tabInfoHeight)

        originalX = ((view.hotspot.frameX * xPercentage) - (hotspotSize / 2))  //+ (!isScaled ? 0 : scaleValuesRef.current.newLeft)
        originalY = ((view.hotspot.frameY * yPercentage) - (hotspotSize / 2)) //+ (!isScaled ? 0 : scaleValuesRef.current.newTop)

        hotspotPositionX = originalX
        hotspotPositionY = originalY
        // hotspotPositionX = ((originalX) * xPercentage) //- (hotspotSize / 2))  //+ (!isScaled ? 0 : scaleValuesRef.current.newLeft)
        // hotspotPositionY = ((originalY) * yPercentage) //- (hotspotSize / 2)) //+ (!isScaled ? 0 : scaleValuesRef.current.newTop)
    }

    console.log(`reverse Scale - ${reverseScale}`)
    console.log(`newHotspotSize- ${newHotspotSize}`)

    // hotspotPositionX = originalX
    // hotspotPositionY = originalY

    console.log(`scaleValues - ${JSON.stringify(scaleValuesRef.current, null, 2)}`)
    console.log(`Original Hotspot X - ${originalX}, Y - ${originalY} - Size: ${innerWidth} x ${innerHeight} - xScale - ${xOriginalPercentage}, yScale - ${yOriginalPercentage}, OmniBarHeight - ${omniBarHeight}`)
    console.log(`Hotspot X - ${hotspotPositionX}, Y - ${hotspotPositionY} - Size: ${innerWidth} x ${innerHeight} - xScale - ${xPercentage}, yScale - ${yPercentage}, OmniBarHeight - ${omniBarHeight}`)

    let hotspotPositionXTest = ((view.hotspot.frameX) - (hotspotSize / 2)) * xPercentage
    let hotspotPositionYTest = ((view.hotspot.frameY) - (hotspotSize / 2)) * yPercentage

    let prevPositionX = ((prevHotspotX * xPercentage) - (hotspotSize / 2))
    let prevPositionY = ((prevHotspotY * yPercentage) - (hotspotSize / 2))

    if (prevPositionX === -45 || prevPositionY === -45) {
        prevPositionX = wrapperWidth / 2
        prevPositionY = wrapperHeight / 2
    }

    let [finalPositionX, setFinalPositionX] = useState(prevPositionX)
    let [finalPositionY, setFinalPositionY] = useState(prevPositionY)
    const isAnimatingRef = useRef(false)
    const [tooltipVisible, setTooltipVisible] = useState(false)
    const tippyInstanceRef = useRef(null)

    // Handle animation from previous hotspot position
    useEffect(() => {
        if ((prevHotspotX !== null && prevHotspotX !== undefined) && (prevHotspotY !== null && prevHotspotY !== undefined) && !isInEditor) {
            // Calculate the scaled previous position using the same logic as current position
            let prevPositionX = ((prevHotspotX * xPercentage) - (hotspotSize / 2))
            let prevPositionY = ((prevHotspotY * yPercentage) - (hotspotSize / 2))

            // Start at previous position and hide tooltip during animation
            isAnimatingRef.current = true
            setTooltipVisible(false)
            setFinalPositionX(prevPositionX)
            setFinalPositionY(prevPositionY)

            // Trigger animation to new position after a brief delay
            const animationTimer = setTimeout(() => {
                setFinalPositionX(hotspotPositionX)
                setFinalPositionY(hotspotPositionY)
            }, 50)

            // Show tooltip after animation completes (50ms delay + 400ms transition)
            const tooltipTimer = setTimeout(() => {
                isAnimatingRef.current = false
                setTooltipVisible(true)
            }, 650)

            return () => {
                clearTimeout(animationTimer)
                clearTimeout(tooltipTimer)
            }
        } else {
            // No previous position, just use current position
            isAnimatingRef.current = false
            setFinalPositionX(hotspotPositionX)
            setFinalPositionY(hotspotPositionY)

            setTimeout(() => {
                const tippyInstance = tippyInstanceRef.current
                if (tippyInstance && tippyInstance.popperInstance) {
                    tippyInstance.popperInstance.update()
                }
                setTooltipVisible(true)

            }, 400)

        }
    }, [hotspotId, prevHotspotX, prevHotspotY, wrapperHeight, wrapperWidth])

    // Recalculate flip position when tooltipVisible changes
    useEffect(() => {
        debugger
        if (tooltipVisible && tippyInstanceRef.current) {
            // Force Tippy to recalculate position
            const tippyInstance = tippyInstanceRef.current
            if (tippyInstance && tippyInstance.popperInstance) {
                tippyInstance.popperInstance.update()
            }
        }
    }, [tooltipVisible])

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

        console.log('setupDragging- screenId in hotspotcontent')
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
                    currentX = e.touches[0].layerX - initialX
                    currentY = e.touches[0].layerY - initialY
                } else {
                    currentX = e.layerX - initialX
                    currentY = e.layerY - initialY
                }

                xOffset = currentX - (hotspotSize / 2)
                yOffset = currentY - (hotspotSize / 2)


                setTranslate(xOffset, yOffset, dragElem)
            }
        }

        function dragStart(e) {

            // if (e.type === 'touchstart') {
            //   initialX = e.touches[0].clientX - xOffset
            //   initialY = e.touches[0].clientY - yOffset
            // } else {
            //   initialX = e.clientX - xOffset
            //   initialY = e.clientY - yOffset
            // }


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
                let saveX = e.layerX * hotspotReversePercentageX
                let saveY = (e.layerY) * hotspotReversePercentageY

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
        show={!!finalPositionX}
        frameX={finalPositionX}
        frameY={finalPositionY}
        shouldAnimate={isAnimatingRef.current}
        scale={reverseScale}
        wrapperWidth={wrapperWidth}
        wrapperHeight={wrapperHeight}
    >

        <Tip
            zIndex={3}
            disabled={false}
            // disabled={!showTippy}
            delay={200}
            arrow={true}
            // showOnCreate={isContentEmpty ? false : !tooltipVisible ? false : true}
            showOnCreate={false}
            animation={'shift-away'}
            offset={[0, -10]}
            onCreate={(instance) => {
                tippyInstanceRef.current = instance
            }}
            onShow={(instance) => {
                // Force position recalculation when shown
                if (instance && instance.popperInstance) {
                    instance.popperInstance.update()
                }
            }}
            popperOptions={{
                modifiers: [
                    {
                        name: 'flip',
                        options: {
                            fallbackPlacements: ['top', 'bottom', 'right', 'left'],
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
            visible={tooltipVisible}
            // visible={tooltipVisible}
            allowHTML={true}
            content={
                <TooltipContent
                    liveDemo={liveDemo}
                    continuous={true}
                    index={currentStepIndexCount}
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

        //&& .tippy-content {
        //  max-width: 250px;
        //  width: max-content;
        //  padding: 0px;
        //}

        && .tippy-arrow::before {
            color: ${({ $themeBackgroundColor }) => $themeBackgroundColor} !important;
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
        shouldForwardProp: (prop) => !['show', 'isInEditor', 'isMoving', 'shouldAnimate', 'frameX', 'frameY', 'scale', 'wrapperWidth', 'wrapperHeight'].includes(prop),
    })`
        && {
            opacity: ${props => props.show ? '1' : '0'};
            //cursor: pointer;
            cursor: ${({ isInEditor }) => isInEditor ? 'move' : 'pointer'};
            transition: ${props => {
            if (props.isMoving || !props.shouldAnimate) return 'none';
            return '0.4s ease-in-out';
        }};
            position: absolute;

            top: 0;
            left: 0;
            transform: translate(${(props) => props.frameX}px, ${(props) => props.frameY}px) scale(${(props) => props.scale});
            transform-origin: center;
            //transform-origin: 0px 0px;

            // .tippy-box {
                //     transform: scale(${(props) => `${props.scale}`});        
            // }
        }
    `,


}

export default HotspotContent
