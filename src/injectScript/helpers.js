import validator from 'validator'
import axios from 'axios'
import { record as rrwebRecord } from 'rrweb'
import ENV from './config.json'
import ScreenTypes from '../constants/ScreenTypes.js'
import { createSessionRecordingFlattenEmit } from './sessionRecordingFlatten.js'

export function getDemoDocument() {
    return window.__livedemoActiveReplayer
        ? window.__livedemoActiveReplayer.iframe.contentDocument
        : document.getElementById('story_iframe').contentDocument
}

export function waitForElement(query, refreshRate, limit) {
    return new Promise((resolve, reject) => {

        let counter = 0

        let looper = setInterval(() => {

            let elem = getDemoDocument().querySelector(query)
            if (elem) {

                clearInterval(looper)
                resolve(elem)
            }

            if (counter >= limit) {
                reject(new Error('limit reached - still cannot find element'))
            }
            counter += 1

        }, refreshRate)

    })
}

export function waitForElementInTop(query, refreshRate, limit) {
    return new Promise((resolve, reject) => {

        let counter = 0

        let looper = setInterval(() => {
            let elem = window.document.querySelector(query)
            if (elem) {

                clearInterval(looper)
                resolve(elem)
            }

            if (counter >= limit) {
                reject(new Error('limit reached - still cannot find element'))
            }
            counter += 1

        }, refreshRate)

    })
}

export function validateField(fieldName, value) {
    if (fieldName === 'email') {
        return validator.isEmail(value || '')
    }

    if (fieldName === 'name') {
        let str = value || ''
        return (str.length > 3 && str.length < 255)
    }

    // company / website / custom / selector / checkbox: no client validation for now
    return true
}

/** Returns { message, invalidNames } if form cannot submit; null if ready. */
export function getFormSubmitIssue(formData, fieldsObj) {
    let fields = (formData && formData.fields) || []
    let invalidNames = []
    let firstMessage = null

    fields.forEach((field) => {
        if (!field || !field.name) return

        let entry = fieldsObj && fieldsObj[field.name]
        let value = entry ? entry.value : undefined
        let label = field.label || field.name
        let isCheckbox = field.type === 'checkbox'
        let isEmpty = isCheckbox
            ? !(value === true || value === 'true')
            : value === undefined || value === null || String(value).length === 0

        // name/email always required — custom format validation depends on a value
        let isRequired = !!field.required
            || field.name === 'name'
            || field.name === 'email'

        if (isRequired && isEmpty) {
            invalidNames.push(field.name)
            if (!firstMessage) {
                firstMessage = isCheckbox
                    ? `Please check "${label}" to continue.`
                    : `Please fill in "${label}" to continue.`
            }
            return
        }

        if (!isEmpty && !validateField(field.name, value)) {
            invalidNames.push(field.name)
            if (!firstMessage) {
                if (field.name === 'email') {
                    firstMessage = 'Please enter a valid email address.'
                } else if (field.name === 'name') {
                    firstMessage = 'Name must be between 4 and 255 characters.'
                } else {
                    firstMessage = `Please check "${label}".`
                }
            }
        }
    })

    if (!firstMessage) return null

    return {
        message: invalidNames.length > 1
            ? `${firstMessage} (${invalidNames.length} fields need attention)`
            : firstMessage,
        invalidNames,
    }
}


export function getStepAndScreenByStepIndex(stepIndex, storyDemo) {
    let allSteps = storyDemo.screens.reduce((accum, screen) => {

        if (screen.steps && screen.steps.length) {

            accum = accum.concat(screen.steps.map(step => {
                step.screenId = screen._id

                return step
            }))
        } else {

            accum = accum.concat([{
                screenId: screen._id
            }])
        }


        return accum
    }, [])

    let step = allSteps[stepIndex]

    if (!step) {
        return {
            step: null,
            screen: null
        }
    }

    let screen = storyDemo.screens.find(screen => screen._id === step.screenId)

    return {step, screen}
}

export function topPostMessage(messageObj) {

    // console.log("topPostMessage")
    // console.log(messageObj)

    let topWindow = window
    if (window.top) {
        topWindow = window.top
    }


    topWindow.postMessage(messageObj, '*')
}

let checkoutSessionRecordingTimer = null

/**
 * Debounced checkout while session recording is active.
 * Important: do NOT spam takeFullSnapshot on every step — repeated checkouts
 * reset the mirror to empty iframe shells and wipe flattened demo content.
 */
export function checkoutSessionRecording(delayMs = 400) {
    if (checkoutSessionRecordingTimer) {
        clearTimeout(checkoutSessionRecordingTimer)
    }
    checkoutSessionRecordingTimer = setTimeout(() => {
        checkoutSessionRecordingTimer = null
        try {
            if (typeof rrwebRecord.takeFullSnapshot === 'function') {
                rrwebRecord.takeFullSnapshot(true)
            }
        } catch (e) {
            // record() not started yet — ignore
        }
    }, delayMs)
}

export function setupSessionRecording(eventsRef, currentStepIndexRef) {

    const workspaceId = window.config.workspaceId
    const storyId = window.config.storyId


    let stepsCount = window.config.STEPS && window.config.STEPS.length
    let sessionObj = {}
    if (stepsCount) {
        sessionObj.stepsCount = stepsCount
    }

    axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyId}/sessions`, sessionObj, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((res) => {
            let sessionId = res.data._id

            window.config.sessionId = sessionId

            // Flatten nested #story_iframe / Replayer iframes in the emit
            // stream so Analytics never has to rebuild nested iframe documents.
            let stopFn
            const emitFlat = createSessionRecordingFlattenEmit((event) => {
                if (eventsRef.current.length > 1000) {
                    // stop after buffer grows too large
                    if (stopFn) {
                        stopFn()
                    }
                }

                event.stepIndex = (currentStepIndexRef && currentStepIndexRef.current) || 0
                eventsRef.current.push(event)
            })

            stopFn = rrwebRecord({
                emit: emitFlat,
                // Keep pointer traffic sparse so iframe-attach mutations are not
                // drowned before the periodic save / Analytics fetch.
                sampling: {
                    mousemove: 150,
                    mouseInteraction: true,
                    scroll: 100,
                    input: 'last',
                },
                inlineStylesheet: true,
            })

            // this function will send events to the backend and reset the events array
            function save() {
                // console.log(eventsRef.current)

                if (eventsRef.current && eventsRef.current.length !== 0) {
                    axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyId}/sessions/${sessionId}/events`, {
                        events: eventsRef.current
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                }


                eventsRef.current = []

            }

// save events every 10 seconds
            setInterval(save, 3.5 * 1000)

        })


}

export function highlightElement(selector, document, themeColor) {
    let element = document.querySelector(selector)
    // element.setAttribute('style', `    box-shadow: ${themeColor}66 -5px 5px, ${themeColor}4D  -10px 10px, ${themeColor}33 -15px 15px, ${themeColor}1A -20px 20px, ${themeColor}0D -25px 25px;`)
    element.style.animation = 'pulse 2s infinite'

}


export function removeHighlightOnElement(selector, document) {
    let element = document.querySelector(selector)
    if (element) {
        element.setAttribute('style', ``)
        element.style.animation = ``
    }
}


export function getIframeLoadedScreenId(iframe) {
    if (iframe && iframe.current) {
        return iframe.current.getAttribute('screenId')
    }

    return null
}

export function getScreenIndex(screenId, storyDemo) {
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


export function deriveRenderSteps(storyDemo) {

    let newSteps = storyDemo.screens
        .sort((firstScreen, secondScreen) => firstScreen.index - secondScreen.index)
        .reduce((accum, screen) => {

            let screenSteps = []

            if (screen.type === ScreenTypes.SCREEN_PAGE) {
                screenSteps = screen.steps.map(step => {
                    step.screenId = screen._id
                    step.screenType = screen.type
                    step.screenWidth = screen.width
                    step.screenHeight = screen.height
                    if (screen.recordingRole) {
                        step.recordingRole = screen.recordingRole
                        step.baseScreenId = screen.baseScreenId
                        step.fromTimeMs = screen.fromTimeMs
                        step.toTimeMs = screen.toTimeMs
                    }


                    return step
                })

                if (!screenSteps.length) {
                    screenSteps.push({
                        screenId: screen._id,
                        screenWidth: screen.width,
                        screenHeight: screen.height,
                        screenType: screen.type,
                        ...(screen.recordingRole ? {
                            recordingRole: screen.recordingRole,
                            baseScreenId: screen.baseScreenId,
                            fromTimeMs: screen.fromTimeMs,
                            toTimeMs: screen.toTimeMs,
                        } : {})
                    })
                }

            } else if (screen.type === ScreenTypes.SCREEN_SCREENSHOT) {

                let screenshotSteps = !screen.steps ? [] : screen.steps.map(step => {
                    step.screenId = screen._id
                    step.screenType = screen.type
                    step.screenWidth = screen.width
                    step.screenHeight = screen.height
                    step.imageUrl = screen.imageUrl

                    return step
                })

                if (screenshotSteps.length) {

                    screenshotSteps.forEach(stepObj => {

                        screenSteps.push(stepObj)
                    })
                } else {

                    screenSteps.push({
                        screenId: screen._id,
                        imageUrl: screen.imageUrl,
                        screenType: screen.type
                    })
                }


            } else if (screen.type === ScreenTypes.SCREEN_VIDEO) {

                let videoSteps = !screen.steps ? [] : screen.steps.map(step => {
                    step.screenId = screen._id
                    step.screenType = screen.type
                    step.asset = screen.asset
                    step.playbackRate = screen.playbackRate
                    step.startTime = screen.startTime
                    step.endTime = screen.endTime
                    step.duration = screen.duration
                    step.zoomSpans = screen.zoomSpans
                    step.cursorPositions = screen.cursorPositions

                    return step
                })

                videoSteps.forEach(stepObj => {

                    screenSteps.push(stepObj)
                })

            } else {

                screenSteps.push({
                    _id: 1,
                    screenId: screen._id,
                    type: screen.type,
                    zoomSpans: screen.zoomSpans ? screen.zoomSpans : []
                })
            }


            accum = accum.concat([...screenSteps])

            return accum
        }, [])

    newSteps = newSteps.map((step, index) => {
        step.index = index
        return step
    })

    return newSteps
}

export function AudioRecorderFactory() {

    let audioRecorderObject = {
        /** Stores the recorded audio as Blob objects of audio data as the recording continues*/
        audioBlobs: [],/*of type Blob[]*/
        /** Stores the reference of the MediaRecorder instance that handles the MediaStream when recording starts*/
        mediaRecorder: null, /*of type MediaRecorder*/
        /** Stores the reference to the stream currently capturing the audio*/
        streamBeingCaptured: null, /*of type MediaStream*/
    }

    function start() {
        //Feature Detection
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            //Feature is not supported in browser
            //return a custom error
            return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser.'));
        } else {
            //Feature is supported in browser

            return navigator.mediaDevices.getUserMedia({audio: true})
                .then(stream => {

                    audioRecorderObject.streamBeingCaptured = stream;

                    audioRecorderObject.mediaRecorder = new MediaRecorder(stream);

                    audioRecorderObject.audioBlobs = [];

                    audioRecorderObject.mediaRecorder.addEventListener("dataavailable", event => {
                        audioRecorderObject.audioBlobs.push(event.data);
                    });

                    audioRecorderObject.mediaRecorder.start();
                });
        }
    }

    /** Stop the started audio recording
     * @returns {Promise} - returns a promise that resolves to the audio as a blob file
     */
    function stop() {
        return new Promise(resolve => {
            let mimeType = audioRecorderObject.mediaRecorder.mimeType;

            audioRecorderObject.mediaRecorder.addEventListener("stop", () => {
                let audioBlob = new Blob(audioRecorderObject.audioBlobs, {type: mimeType});

                resolve(audioBlob);
            });

            cancel();
        });
    }


    /** Stop all the t  racks on the active stream in order to stop the stream and remove
     * the red flashing dot showing in the tab
     */
    function stopStream() {
        //stopping the capturing request by stopping all the tracks on the active stream
        audioRecorderObject.streamBeingCaptured.getTracks()
            .forEach(track => track.stop());
    }

    /** Reset all the recording properties including the media recorder and stream being captured*/
    function resetRecordingProperties() {
        audioRecorderObject.mediaRecorder = null;
        audioRecorderObject.streamBeingCaptured = null;
    }


    /** Cancel audio recording*/
    function cancel() {
        audioRecorderObject.mediaRecorder.stop();

        stopStream();

        resetRecordingProperties();
    }

    return {
        ...audioRecorderObject,
        start,
        stop,
        stopStream,
        resetRecordingProperties,
        cancel
    }
}
