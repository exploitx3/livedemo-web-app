import React, { useEffect, useRef, useState } from 'react'
// import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'
import styled from 'styled-components'
import { topPostMessage } from '../../helpers.js'

import ZoomRegion from './components/ZoomRegion/ZoomRegion.js'
import ScreenTypes from "../../../constants/ScreenTypes.js"

const MAIN_VIEWS = {
    IMAGES: 'IMAGES',
    VIDEO: 'VIDEO',
    IFRAME: 'IFRAME'
}

const HOTSPOT_SIZE = 90


function ZoomSpans({
    liveDemo,
    omniBarHeight,
    isInEditor,
    scaleMain,
    videoRef,
    currentStep,
    wrapperRef,
    mainRef,
    innerWidth,
    innerHeight,
    isScaled,
    isScaledRef,
    scaleInProgressRef,
    isFullScreen,
}) {


    let [internalCurrentStep, setInternalCurrentStep] = useState(currentStep)

    let innerWidthRef = useRef(innerWidth)
    let innerHeightRef = useRef(innerHeight)

    let currentStepRef = useRef(currentStep)
    let hasAttachedVideoListener = useRef(false)

    let timersRef = useRef([])

    let initialZoomSpans = (currentStep && currentStep.zoomSpans ? currentStep.zoomSpans.map(span => {

        let newSpan = {
            ...span,
            showed: false,
            triggered: false,
            clicked: false,
            stepId: currentStep._id
        }
        return newSpan
    }) : [])

    if (currentStep.zoomSpan) {
        initialZoomSpans.push({
            ...currentStep.zoomSpan,
            showed: false,
            triggered: false,
            clicked: false,
            stepId: currentStep._id
        })
    }

    let isInEditorInternalRef = useRef(isInEditor)

    let spanElementRefs = useRef(initialZoomSpans.reduce((accum, iter) => {
        accum[iter._id] = { span: iter, current: null }
        return accum
    }, {}))

    // Zoom implementation
    let zoomSpansRef = useRef(initialZoomSpans)
    let [zoomSpans, _setZoomSpans] = useState(initialZoomSpans)
    let userHasClickedRef = useRef(null)

    function setZoomSpans(newZoomSpans) {

        zoomSpansRef.current = newZoomSpans
        _setZoomSpans(newZoomSpans)
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


        topPostMessage({
            type: 'zoomSpan_set',
            id: region.data._id,
            offsetX: region.x,
            offsetY: region.y,
            width: region.width,
            height: region.height,
            data: region.data,
            editorWidth: innerWidth,
            screenId: currentStep.screenId
        })
    }

    useEffect(() => {

        return () => {
            // On change of step - zoomOut
            timersRef.current.forEach(timer => {

                // console.log(`timer deleted - ${timer}`)
                clearTimeout(timer)
            })

            // if (scaleInProgressRef.current) {
            //     return
            // }

            zoomSpansRef.current.forEach((zoomSpan) => {
                hideZoomSpan(zoomSpan)
                rescaleZoomSpan(zoomSpan)
            })
        }
    }, [])

    // useEffect(() => {
    //
    //     if (
    //         internalCurrentStep._id !== currentStep._id
    //     ) {
    //    debugger
    //         setInternalCurrentStep(currentStep)
    //
    //         // Reset zoom if next screen is different and if next step has a zoomSpan
    //         if(
    //             internalCurrentStep.screenId !== currentStep.screenId ||
    //             !!currentStep.zoomSpan
    //         ){
    //             scaleMain(1, 0, 0)
    //         }
    //     }
    //
    // }, [currentStep]);

    useEffect(() => {
        innerWidthRef.current = innerWidth
    }, [innerWidth])

    useEffect(() => {
        innerHeightRef.current = innerHeight
    }, [innerHeight])

    useEffect(() => {
        isInEditorInternalRef.current = isInEditor
    }, [isInEditor])

    // Setup for single zoomSpan
    useEffect(() => {
        userHasClickedRef.current = null

        //Clear previous screenshot zoom timers
        timersRef.current.forEach(timer => {

            // console.log(`timer deleted - ${timer}`)
            clearTimeout(timer)
        })

        // duration === 0 never auto-rescales; clear flags only so the next
        // zoom can hand off smoothly (scaleMain measures from identity)
        zoomSpansRef.current.forEach((zoomSpan) => {
            zoomSpan.triggered = false
            zoomSpan.showed = false
        })

        if (currentStep && currentStep.zoomSpans) {
            let newZoomSpans = currentStep.zoomSpans.map(span => {

                let newSpan = {
                    ...span,
                    showed: false,
                    triggered: false,
                    clicked: false,
                    stepId: currentStep._id
                }

                if (!spanElementRefs.current[span._id]) {
                    spanElementRefs.current[span._id] = { span: newSpan, current: null }
                }

                return newSpan
            })


            setZoomSpans(newZoomSpans)
        } else if (currentStep.zoomSpan) {

            let newSpan = {
                ...currentStep.zoomSpan,
                showed: false,
                triggered: false,
                clicked: false,
                ran: false,
                stepId: currentStep._id
            }

            if (!spanElementRefs.current[newSpan._id]) {
                spanElementRefs.current[newSpan._id] = { span: newSpan, current: null }
            } else {
                spanElementRefs.current[newSpan._id].span.ran = false
            }

            setZoomSpans([
                newSpan
            ])

            // This checks if zoomSpan is a screenshot zoomSpan
            let zoomSpan = zoomSpansRef.current.find(span => span._id === newSpan._id)
            let spanRefElement = spanElementRefs.current[zoomSpan._id].current

            let shouldTrigger = true
            if (spanElementRefs.current[zoomSpan._id] && spanRefElement && zoomSpan.ran) {
                shouldTrigger = false
            }

            if (zoomSpan.delay !== undefined && shouldTrigger && !zoomSpan.ran && currentStep.zoomSpan) {
                let zoomScrenshotTimer = setTimeout(() => {
                    if (currentStepRef.current && zoomSpan.stepId === currentStepRef.current._id) {

                        triggerScaleForZoomSpan(zoomSpan)
                        zoomSpan.triggered = true
                        zoomSpan.showed = true
                        zoomSpan.ran = true

                        if (zoomSpan.duration === 0) {
                            return
                        } else {


                            let clearTimer = setTimeout(() => {
                                // if (scaleInProgressRef.current) {
                                //     return
                                // }

                                if (currentStepRef.current && zoomSpan.stepId === currentStepRef.current._id) {
                                    rescaleZoomSpan(zoomSpan)
                                }
                                zoomSpan.triggered = false
                            }, zoomSpan.duration * 1000)


                            timersRef.current.push(clearTimer)
                        }
                    }
                }, zoomSpan.delay * 1000)

                // console.log(`timer set - ${zoomScrenshotTimer}`)
                timersRef.current.push(zoomScrenshotTimer)
            }


        } else {
            setZoomSpans([])
        }

        currentStepRef.current = currentStep


    }, [currentStep])

    useEffect(() => {

        let condition = currentStep.screenType === ScreenTypes.SCREEN_VIDEO && !!videoRef.current && !hasAttachedVideoListener.current
        if (condition) {
            attachVideoTimeChangeHandler(videoRef.current)
            hasAttachedVideoListener.current = true
        } else if (!!videoRef.current && hasAttachedVideoListener.current) {
            dettachVideoTimeChangeHandler(videoRef.current)
            hasAttachedVideoListener.current = false
        }

        return () => {
            if (hasAttachedVideoListener.current) {
                dettachVideoTimeChangeHandler(videoRef.current)
                hasAttachedVideoListener.current = false
            }
        }
    }, [currentStep, videoRef.current, innerWidth, isFullScreen])

    function attachVideoTimeChangeHandler(video) {

        video.addEventListener('timeupdate', onVideoTimeChange)
        video.addEventListener('ended', onVideoEnded)
    }

    function dettachVideoTimeChangeHandler(video) {
        video.removeEventListener('timeupdate', onVideoTimeChange)
        video.removeEventListener('ended', onVideoEnded)
    }

    function onVideoEnded() {
        zoomSpansRef.current.forEach((zoomSpan) => {
            rescaleZoomSpan(zoomSpan)
        })
    }

    function onVideoTimeChange(event) {
        let timestampInSeconds = videoRef.current.currentTime

        // console.log(`timestampInSeconds: ${timestampInSeconds}`)
        // console.log(`currentStep.endTime: ${currentStepRef.current.endTime}`)
        if (currentStepRef.current && currentStepRef.current.endTime && timestampInSeconds >= currentStepRef.current.endTime) {
            onVideoEnded()
            // console.log(`timestampInSeconds ended: ${timestampInSeconds}`)

        } else {

            // If user has clicked then disable automatic zoomIn and zoomOut
            if (!!userHasClickedRef.current || (currentStepRef.current && currentStepRef.current.screenType !== 'Screen_Video')) {
                return
            }

            zoomSpansRef.current.forEach((zoomSpan) => {

                // Clicked is used if a zoomSpan has been zoomed-out prematurely to no re-trigger it immediately
                if (zoomSpan.clicked) {
                    return
                }

                if (currentStepRef.current && zoomSpan.stepId !== currentStepRef.current._id) {
                    return
                }


                if (timestampInSeconds >= zoomSpan.startTime &&
                    timestampInSeconds <= zoomSpan.startTime + zoomSpan.duration
                    && !zoomSpan.triggered
                ) {

                    if (isInEditorInternalRef.current) {

                        showZoomSpan(zoomSpan)
                    } else {

                        triggerScaleForZoomSpan(zoomSpan)
                    }

                } else if (
                    !(
                        timestampInSeconds >= zoomSpan.startTime &&
                        timestampInSeconds <= zoomSpan.startTime + zoomSpan.duration
                    ) &&
                    zoomSpan.triggered
                ) {
                    rescaleZoomSpan(zoomSpan)
                }
            })
        }
    }

    function showZoomSpan(zoomSpan) {
        if (!zoomSpan.showed) {
            let boxRef = spanElementRefs.current[zoomSpan._id]

            boxRef.current.style.opacity = 1
            zoomSpan.showed = true
        }
    }

    function hideZoomSpan(zoomSpan) {
        if (zoomSpan.showed) {
            let boxRef = spanElementRefs.current[zoomSpan._id]

            boxRef.current.style.opacity = 0
            zoomSpan.showed = false

            scaleMain(1, 0, 0)
            zoomSpan.triggered = false
        }
    }

    function rescaleZoomSpan(zoomSpan) {
        if (zoomSpan.triggered) {
            console.log(JSON.stringify(zoomSpan, null, 2))
            scaleMain(1, 0, 0)
            zoomSpan.triggered = false
        }
    }

    function triggerScaleForZoomSpan(zoomSpan) {

        // scaleInProgressRef.current = true
        // Find the zoomSpan Object
        // let zoomSpanFromRef = zoomSpansRef.current.find(span => span._id === zoomSpan._id)
        // if (zoomSpanFromRef && zoomSpanFromRef.triggered) {
        //     return
        // }

        let boxRef = spanElementRefs.current[zoomSpan._id]
        if (!boxRef || !boxRef.current) {
            return
        }

        let localInnerWidth = innerWidthRef.current
        let localInnerHeight = innerHeightRef.current

        let browserScaleValueW = (localInnerWidth / zoomSpan.editorWidth)
        let browserScaleValueH = (localInnerHeight / zoomSpan.editorHeight)
        let boxWidth = browserScaleValueW * zoomSpan.width
        let boxHeight = browserScaleValueH * zoomSpan.height
        let scaleValueX = localInnerWidth / boxWidth
        let scaleValueY = localInnerHeight / boxHeight
        let left = zoomSpan.offsetX * browserScaleValueW
        let top = Math.min(Math.max((zoomSpan.offsetY * browserScaleValueH), 0), localInnerHeight)


        // boxRef.current.addEventListener('onclick', () => {
        //     rescaleZoomSpan(zoomSpan)
        // })
        console.log(`triggerScaleForZoomSpan: innerWidth=${localInnerWidth}, scaleValueX=${scaleValueX}, scaleValueY=${scaleValueY}, left=${left},top=${top}`)

        scaleMain(scaleValueX, left, top)
        zoomSpan.triggered = true

        // setTimeout(() => {
        //     scaleInProgressRef.current = false
        // }, 1200)
    }

    function onRenderSpanElement(zoomSpan, ref) {
        let spanRefElement = spanElementRefs.current[zoomSpan._id].current

        let shouldTrigger = true
        if (spanElementRefs.current[zoomSpan._id] && spanRefElement && zoomSpan.ran) {
            shouldTrigger = false
        } else {
            spanElementRefs.current[zoomSpan._id] = { span: zoomSpan, current: ref }
        }

    }

    return (<ZS.RegionsWrapper
        isScaled={isScaled}
        onClick={(event) => {


        }}
    >
        <React.Fragment>
            {zoomSpans.map((span, index) => {
                console.log('span')
                console.log(span)

                let zoomSpanFromRef = zoomSpansRef.current.find(iterSpan => iterSpan._id === span._id)


                if (!span.width) {
                    console.log('non')
                }

                let scaleWidth = innerHeight / innerWidth

                return <ZoomRegion
                    id={span._id}
                    key={span._id}
                    initBoxWidth={span.width}
                    initBoxHeight={span.height}
                    showed={span.showed && isInEditor}
                    x={span.offsetX}
                    y={span.offsetY}
                    data={span}
                    mainRef={mainRef}
                    isScaled={isScaled}
                    isTriggered={zoomSpanFromRef && zoomSpanFromRef.triggered}
                    scaleWidth={scaleWidth}
                    editorWidth={span.editorWidth}
                    editorHeight={span.editorHeight}
                    omniBarHeight={omniBarHeight}
                    onChangeHandler={onChangeHandler}
                    scaleMain={scaleMain}
                    innerWidth={innerWidth}
                    innerHeight={innerHeight}
                    onClick={() => {
                        let shouldScale = isScaledRef.current === false


                        // if is Screenshot
                        if (currentStep.zoomSpan && shouldScale) {

                            triggerScaleForZoomSpan(span)
                        } else if (currentStep.zoomSpan && !shouldScale) {

                            rescaleZoomSpan(span)
                            rescaleZoomSpan(span)
                        }

                        // if is Video
                        if (!currentStep.zoomSpan) {

                            span.clicked = true
                            if (shouldScale) {

                                // If user has initiated a zoom manually, the auto-zoom is disabled
                                userHasClickedRef.current = true
                                triggerScaleForZoomSpan(span)
                            } else {

                                rescaleZoomSpan(span)
                            }
                        }
                    }}
                    onPreview={() => {

                        let localInnerWidth = innerWidthRef.current
                        let localInnerHeight = innerHeightRef.current

                        let browserScaleValueW = (localInnerWidth / zoomSpan.editorWidth)
                        let browserScaleValueH = (localInnerHeight / zoomSpan.editorHeight)
                        let boxWidth = browserScaleValueW * zoomSpan.width
                        let boxHeight = browserScaleValueH * zoomSpan.height
                        let scaleValueX = localInnerWidth / boxWidth
                        let scaleValueY = localInnerHeight / boxHeight
                        let left = zoomSpan.offsetX * browserScaleValueW
                        let top = Math.min(Math.max((zoomSpan.offsetY * browserScaleValueH), 0), localInnerHeight)

                        scaleMain(scaleValueX, left, top)

                        setTimeout(() => {
                            scaleMain(1, 0, 0)
                        }, 2000)
                    }}
                    ref={(ref) => {

                        let spanRef = spanElementRefs.current[span._id].span
                        spanElementRefs.current[span._id].current = ref


                        // onRenderSpanElement(spanRef, ref)
                    }}
                />
            })
            }

        </React.Fragment>

    </ZS.RegionsWrapper>
    )
}

const ZS = {
    RegionsWrapper: styled.div`
        && {
        z-index: 1;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
                // width: ${({ fullWidth }) => fullWidth}px;
                // height: ${({ fullHeight }) => fullHeight}px;
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

export default ZoomSpans
