import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

function IframeComponent({ screenId, iframeSrc, iframeRef, iframeSize, omniBarHeight, isFullScreen  }) {
  // let [iframeSrc, setIframeSrc] = useState('about:blank')

  let width = iframeSize && iframeSize.width  ? iframeSize.width : 0
  let height = iframeSize && iframeSize.height ? iframeSize.height : 0

  if(isFullScreen) {
    width = window.innerWidth
    height = window.innerHeight
  }

  let innerWidth = window.innerWidth
  let innerHeight = window.innerHeight

  let ratio = height / width

  let scalePercentageWidth = (innerWidth / width) * 100
  let scalePercentageHeight = ((innerHeight - omniBarHeight) / height) * 100

  let additionalStyles = !(iframeSize  && iframeSize.width) ? {} : {
    transformOrigin: 'top left',
    transform: `scale(${scalePercentageWidth}%, ${scalePercentageHeight}%)`
  }

  let [additionalStylesComputed, setAdditionalStylesComputed] = useState(additionalStyles)

  useEffect(() => {
    if(iframeRef.current) {
      let parentSize = iframeRef.current.parentElement.parentElement.getBoundingClientRect()

      if(parentSize && parentSize.width) {
        setAdditionalStylesComputed(!(iframeSize  && iframeSize.width) ? additionalStyles : {
          transformOrigin: 'top left',
          // width: parentSize.width,
          // height: parentSize.height,
          // transform: `scale(${(width / parentSize.width ) * 100}%, ${(height / parentSize.height) * 100}%)`,
          transform: `scale(${(parentSize.width / width ) * 100}%, ${(parentSize.height / height) * 100}%)`,
        })
      }

    }

  }, [iframeRef, iframeRef.current])

  useEffect(() => {

    if (iframeRef.current) {
      if(iframeSrc !== 'about:blank') {

        iframeRef.current.contentWindow.location.replace(iframeSrc)
      }
      // iframeRef.current.contentWindow.location.replace('http:////research.stlouisfed.org/fred2/graph/graph-landing.php?g=GEt')


    }

  }, [iframeSrc])

  return <React.Fragment>
    <SI.IframeWrapper
      height={height}
      width={width}
    >
    <SI.Iframe
      src={'about:blank'}
      id={'story_iframe'}
      frameBorder={'0'}
      scrolling={'no'}
      style={{
        height: height,
        width: width,
        ...additionalStyles
        // position: 'absolute',
        // border: 'none'
      }}
      onLoad={function() {



        if (iframeSrc !== 'about:blank') {


          // iframeRef.current.addEventListener('load', function() {
          //   iframeRef.current.style.height = iframeRef.current.contentDocument.body.scrollHeight / 2 + 'px';
          //   iframeRef.current.style.width = iframeRef.current.contentDocument.body.scrollWidth / 2 + 'px';

            // iframeRef.current.style.height = iframeRef.current.contentDocument.body.scrollHeight + 'px';
            // iframeRef.current.style.width = iframeRef.current.contentDocument.body.scrollWidth + 'px';
          // });


          iframeRef.current.setAttribute('screenId', screenId)
        } else {

          iframeRef.current.removeAttribute('screenId')
        }
      }}
      ref={iframeRef}
    />
    </SI.IframeWrapper>
  </React.Fragment>
}

const SI = {
  IframeWrapper: styled.div.withConfig({
    shouldForwardProp: (prop) => !['height', 'width'].includes(prop),
  })`
    position: absolute;
    top: 0;
    left: 0;
    
    
    overflow: hidden;
    //width: 600px;
    //height: 390px;
    padding-bottom: ${(props) => ((props.height) / props.width) * 100}%; /* 16:9 */
    //padding-top: 25px;
    height: 0;
    width: 100%;
    
    transform-origin: top left;
    //transform: scale(1.700293, 1.475);
    
    
    //padding-bottom: ${() => 6/13 * 100}%; 
    //padding-bottom: 56.25%; /* 16:9, for an aspect ratio of 1:1 change to this value to 100% */ 
  `,
  Iframe: styled.iframe` 
    position: absolute;
    top: 0;
    left: 0;
    visibility: visible;
    //right: 0;
    //bottom: 0;
    //height: 100%;
    //width: 100%;
    
    //transform: translate(-215px, -84px) scale(0.7);
    
    
    //transform: scale(0.5)
    
    //zoom: 0.50; 
    //-moz-transform: scale(0.50);
    //-moz-transform-origin: 0 0;
    //transform: scale(0.50);
    //
    //width: 1000px;
    //height: 650px;
  `
}

export default IframeComponent
