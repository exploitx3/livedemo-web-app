import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

function getScaleParent(iframeRef) {
  if (!(iframeRef && iframeRef.current && iframeRef.current.parentElement && iframeRef.current.parentElement.parentElement)) {
    return null
  }
  return iframeRef.current.parentElement.parentElement
}

/**
 * Scale recorded page size to fill the #main parent.
 * Always prefer parent rect over window — fullscreen still has OmniBar / chrome
 * above #main, so window.innerHeight overshoots and leaves a white gap.
 */
function computeScaleStyles(iframeSize, width, height, iframeRef, omniBarHeight) {
  if (!(width && height)) {
    return {}
  }

  let scaleX = (window.innerWidth / width) * 100
  let scaleY = ((window.innerHeight - (omniBarHeight || 0)) / height) * 100

  const parent = getScaleParent(iframeRef)
  if (parent) {
    const parentSize = parent.getBoundingClientRect()
    if (parentSize && parentSize.width && parentSize.height) {
      scaleX = (parentSize.width / width) * 100
      scaleY = (parentSize.height / height) * 100
    }
  }

  return {
    transformOrigin: 'top left',
    transform: `scale(${scaleX}%, ${scaleY}%)`,
  }
}

function IframeComponent({ screenId, iframeSrc, iframeRef, iframeSize, omniBarHeight, isFullScreen  }) {
  // Keep recorded dimensions for the iframe/rrweb mirror. Stretch via transform
  // to the parent — do NOT swap in window size on fullscreen (that made scaleY
  // < 100% once OmniBar shortened #main).
  const width = iframeSize && iframeSize.width ? iframeSize.width : 0
  const height = iframeSize && iframeSize.height ? iframeSize.height : 0

  let [scaleStyles, setScaleStyles] = useState(() => computeScaleStyles(iframeSize, width, height, iframeRef, omniBarHeight))

  useEffect(() => {
    function refreshLayout() {
      setScaleStyles(computeScaleStyles(iframeSize, width, height, iframeRef, omniBarHeight))
    }

    refreshLayout()
    window.addEventListener('resize', refreshLayout)
    return function () {
      window.removeEventListener('resize', refreshLayout)
    }
  }, [iframeRef, iframeSize, width, height, omniBarHeight, isFullScreen])

  useEffect(() => {

    if (iframeRef.current) {
      if(iframeSrc !== 'about:blank') {

        iframeRef.current.contentWindow.location.replace(iframeSrc)
      }
    }

  }, [iframeSrc])

  return <React.Fragment>
    <SI.IframeWrapper
      height={height}
      width={width}
      $fillParent={true}
    >
    <SI.Iframe
      src={'about:blank'}
      id={'story_iframe'}
      frameBorder={'0'}
      scrolling={'no'}
      style={{
        height: height,
        width: width,
        ...scaleStyles
      }}
      onLoad={function() {



        if (iframeSrc !== 'about:blank') {


          iframeRef.current.setAttribute('screenId', screenId)
        } else {

          iframeRef.current.removeAttribute('screenId')
        }
      }}
      ref={iframeRef}
    />
    <SI.RrwebRoot
      id={'story_rrweb_root'}
      className={'hidden'}
      style={{
        height: height,
        width: width,
        ...scaleStyles
      }}
    />
    </SI.IframeWrapper>
  </React.Fragment>
}

const SI = {
  IframeWrapper: styled.div.withConfig({
    shouldForwardProp: (prop) => !['height', 'width', '$fillParent'].includes(prop),
  })`
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    width: 100%;
    transform-origin: top left;

    ${({ $fillParent, height, width }) => {
      if ($fillParent) {
        // Always fill #main (editor, preview, fullscreen) — aspect-ratio
        // letterboxing left a white gap under page/rrweb content.
        return `
          height: 100%;
          padding-bottom: 0;
          bottom: 0;
          right: 0;
        `
      }

      const ratio = width > 0 ? (height / width) * 100 : 0
      return `
          height: 0;
          padding-bottom: ${ratio}%;
        `
    }}
  `,
  Iframe: styled.iframe` 
    position: absolute;
    top: 0;
    left: 0;
    visibility: visible;
  `,
  RrwebRoot: styled.div`
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    /* Do not set visibility here — .hidden from WalkthroughComponent must win */

    .replayer-wrapper {
      width: 100%;
      height: 100%;
    }

    .replayer-wrapper > iframe {
      border: 0;
    }

    .replayer-mouse,
    .replayer-mouse-tail {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
  `
}

export default IframeComponent
