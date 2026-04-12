import React, { useEffect, useState } from 'react'
import {createRoot} from 'react-dom/client'
// import {WalkthroughComponent} from '../../../livedemo-components/dist/index.js'
// import {WalkthroughComponent} from '@georgi.apostolov/livedemo-components.js'
import WalkthroughComponent from './WalkthroughComponent.js'
import elementPicker from './storyElementPicker.js'
import ENV from '../config.json'
import '@fontsource/lexend/latin.css'
import './custom.css'
import { resolveStoryDemoOuterBackground } from '../utils/storyDemoBackground'

/* eslint-disable import/default */
import styled from 'styled-components'

setDocumentDomain()

// document.domain = ENV.URL_COMMON_DOMAIN

window.elementPicker = elementPicker

function setDocumentDomain() {

    try {

        document.domain = ENV.URL_COMMON_DOMAIN
    } catch (e) {
        // console.log("couldn't set document.domain")
    }

}


function setupReact() {

    // setupSessionRecording()
    const IS = {
        OuterRoot: styled.div`
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #ececec;

            &&&&:fullscreen {
                background: none;
            }
        `,
        WallpaperLayer: styled.div`
            position: absolute;
            inset: 0;
            background-image: url(${({ $url }) => $url});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: ${({ $ready }) => ($ready ? 1 : 0)};
            transition: opacity 0.35s ease;
            ${({ $blur }) =>
                $blur > 0 ? `filter: blur(${$blur}px);` : ''}
        `,
        ContentLayer: styled.div`
            position: relative;
            z-index: 1;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: ${({ $paddingPx }) =>
                $paddingPx != null && Number.isFinite($paddingPx) ? `${$paddingPx}px` : '24px'};
            box-sizing: border-box;
        `,
        TopWrapper: styled.div`
            background: ${({ background }) => `${background}`};

            &&&&:fullscreen {
                background: none;
            }
        `
    }

    function WallpaperChrome({ wallpaperUrl, blur, paddingPx, children }) {
        const [bgReady, setBgReady] = useState(false)

        useEffect(() => {
            let cancelled = false
            const img = new Image()
            img.onload = () => {
                if (!cancelled) {
                    setBgReady(true)
                }
            }
            img.onerror = () => {
                if (!cancelled) {
                    setBgReady(true)
                }
            }
            img.src = wallpaperUrl
            return () => {
                cancelled = true
            }
        }, [wallpaperUrl])

        return (
            <IS.OuterRoot>
                <IS.WallpaperLayer $url={wallpaperUrl} $blur={blur} $ready={bgReady} />
                <IS.ContentLayer $paddingPx={paddingPx}>{children}</IS.ContentLayer>
            </IS.OuterRoot>
        )
    }

    function WrapperComponent({steps, transitions, workspaceId, storyId, storyDemo, firstScreenId}) {




        return (
            <React.Fragment>
                <WalkthroughComponent
                    storyId={storyId}
                    steps={window.config.STEPS}
                    storyDemo={window.config.storyDemo}
                    screens={window.config.SCREENS}
                    workspaceId={workspaceId}
                    firstScreenId={firstScreenId}
                    isEmbed={window.config.isEmbed}
                    isSessionRecordingDisabled={window.config.isSessionRecordingDisabled}
                    width={
                        window.config.storyDemo &&
                        window.config.storyDemo.windowMeasures &&
                        window.config.storyDemo.windowMeasures.innerWidth
                    }
                    height={
                        window.config.storyDemo &&
                        window.config.storyDemo.windowMeasures &&
                        window.config.storyDemo.windowMeasures.innerHeight
                    }
                />
            </React.Fragment>
        )
    }


    const screens = window.config.SCREENS
    if (screens.length === 0) {

        // console.log('No Screens found in Story')
        return
    }

    const workspaceId = window.config.workspaceId
    const storyId = window.config.storyId
    const storyDemo = window.config.storyDemo
    let firstStepIndex = window.config.currentStepIndex || 0
    let firstStepScreenId = window.config.STEPS[firstStepIndex].screenId


    const container = document.getElementById('reactInjectTourApp')

    const root = createRoot(container) // createRoot(container!) if you use TypeScript
    const outerBg = resolveStoryDemoOuterBackground(storyDemo)

    const walkthrough = (
        <WrapperComponent
            steps={window.config.STEPS}
            transitions={window.config.TRANSITIONS}
            workspaceId={workspaceId}
            storyId={storyId}
            storyDemo={storyDemo}
            firstScreenId={firstStepScreenId}
        />
    )

    root.render(
        outerBg.mode === 'wallpaper' ? (
            <WallpaperChrome
                wallpaperUrl={outerBg.wallpaperUrl}
                blur={outerBg.blur}
                paddingPx={outerBg.padding}
            >
                {walkthrough}
            </WallpaperChrome>
        ) : (
            <IS.TopWrapper
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding:
                        outerBg.padding != null && Number.isFinite(outerBg.padding)
                            ? `${outerBg.padding}px`
                            : '24px',
                    boxSizing: 'border-box'
                }}
                background={outerBg.css}
            >
                {walkthrough}
            </IS.TopWrapper>
        )
    )
}


if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => setupReact())
} else {
    setupReact()
}

function setup(screens, steps) {
    if (screens.length === 0) {

        // console.log('No Screens found in Story')
        return
    }

    let firstStepScreenId = steps[0].screenId
    let firstIframeContent = ''

    // addIframeElement()
    changeIframeScreen('#story-demo-iframe', window.config.workspaceId, window.config.storyId, firstStepScreenId)


}

function addIframeElement() {

    let iFrame = document.createElement('iframe')
    // iFrame.src = URL.createObjectURL(blobContent);
    iFrame.src = 'about:blank'
    iFrame.id = 'story-demo-iframe'
    iFrame.style = '    width: 100%;\n' +
        '    height: 100%;\n' +
        '    position: absolute;\n' +
        '    border: none;'

    // let iFrameDoc = iFrame.contentWindow && iFrame.contentWindow.document;
    // if (!iFrameDoc) {
    //   console.log("iFrame security.");
    //   return;
    // }


    let iframeContainer = document.createElement('div')
    iframeContainer.append(iFrame)

    document.getElementById('demoWrapper').append(iframeContainer)
}

function createIframe(iframeSelector, content) {
    const blobContent = new Blob([content], {type: 'text/html'})
    // iFrame.src = URL.createObjectURL(blobContent);

    let iFrame = document.querySelector(iframeSelector)
    // iFrame.src = "about:blank";
    iFrame.src = URL.createObjectURL(blobContent)

    iFrame.style = '    width: 100%;\n' +
        '    height: 100%;\n' +
        '    position: absolute;\n' +
        '    border: none;'

    let iFrameDoc = iFrame.contentWindow && iFrame.contentWindow.document
    if (!iFrameDoc) {
        // console.log('iFrame security.')
        return
    }
    // iFrameDoc.write(content);
    // iFrameDoc.close();
}

