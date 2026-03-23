import React, {useEffect, useState} from 'react'
// import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'
import styled from 'styled-components'
import { ReloadOutlined, LockFilled, ForwardOutlined } from '@ant-design/icons'
import Colors from '../../../constants/mainColors.js'
import Tippy from '@tippyjs/react'
import { topPostMessage } from '../../helpers.js'

import RegionLite from '../RegionLite/RegionLite.js'

const MAIN_VIEWS = {
  IMAGES: 'IMAGES',
  VIDEO: 'VIDEO',
  IFRAME: 'IFRAME'
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


function Regions({
                   currentStepIndex,
                   stepRegions,
                   transitionRegions,
                   setStepRegions,
                   setTransitionRegions,
                   liveDemo,
                   omniBarHeight,
                   setStepPointerInfo,
                   setTransitionPointerInfo,
                   isInEditor,
                   fullWidth,
                   fullHeight,
                   scalePercentageWidth,
                   scalePercentageHeight,
                   addTooltipAnchor,
                   removeTooltipAnchor,
                   tooltipElemAnchorsWrapperRef,
                   forceUpdate,
                   wrapperRef,
    innerWidth,
    innerHeight
                 }) {


  // console.log("regions rendered")

  let [wrapperLeftPos, setWrapperLeftPos] = useState(0)
  let [wrapperTopPos, setWrapperTopPos] = useState(0)


  let [regionUpdateCounter, setRegionUpdateCounter] = useState(1)


  // state for selectRegions
  let tabInfoWidth = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerWidth) ? liveDemo.windowMeasures.innerWidth : (liveDemo.tabInfo ? liveDemo.tabInfo.width : innerWidth)
  let tabInfoHeight = (liveDemo && liveDemo.windowMeasures && liveDemo.windowMeasures.innerHeight) ? liveDemo.windowMeasures.innerHeight : (liveDemo.tabInfo ? liveDemo.tabInfo.height : innerHeight)


  let scalePercentageX = Math.min(tabInfoWidth, innerWidth) / tabInfoWidth
  let scalePercentageY = Math.min(tabInfoHeight, innerHeight) / (tabInfoHeight - omniBarHeight)

  let reversePercentageX = tabInfoWidth / innerWidth
  let reversePercentageY = (tabInfoHeight - omniBarHeight) / innerHeight


  let [tooltipElemAnchors, setTooltipElemAnchors] = useState([])

  useEffect(() => {
    if (wrapperRef && wrapperRef.current && wrapperRef.current.getBoundingClientRect) {
      let wrapperPositions = wrapperRef.current.getBoundingClientRect()

      setWrapperLeftPos(wrapperPositions.left)
      setWrapperTopPos(wrapperPositions.top)
    }

  }, [wrapperRef, wrapperRef.current]);

  function onChangeHandler(region) {
    // console.log('onChangeHandler called')
    let reversePercentageX = tabInfoWidth / innerWidth
    let reversePercentageY = (tabInfoHeight) / (innerHeight - omniBarHeight)

    if (!region.data) {
      region.data = {}
    }

    region.data.pixelData = {
      x: region.x * reversePercentageX,
      y: region.y * reversePercentageY,
      width: region.width * reversePercentageX,
      height: region.height * reversePercentageY,
    }

    // region.data.regionStyle = {
    //   backgroundColor: 'rgba(16, 112, 255, 0.33)'
    // }

      topPostMessage({
        type: 'region_set',
        regionType: region.data.type,
        id: region.data.type === 'step' ? region.data.stepId : region.data.transitionId,
        screenId: region.data.screenId,
        pixelData: region.data.pixelData
      })

      removeTooltipAnchor(region.data.id)

      let selectorLocation = {
        positionX: region.x,
        positionY: region.y,
        width: region.width,
        height: region.height,
      }

     console.log('selectorLocation')
     console.log(JSON.stringify(selectorLocation, null, 2))

      addTooltipAnchor(region.data.id, region.data.type, selectorLocation)

      let targetElement = document.getElementById(region.data.id)

      if (region.data.type === 'step') {

        let pointerInfo = {
          enabled: true,
          targetElement: targetElement,
          placement: region.data.placement
        }

        setStepPointerInfo(pointerInfo)
      } else {

        let pointerInfo = {
          transitionId: region.data.transitionId,
          enabled: true,
          targetElement: targetElement,
          placement: region.data.placement
        }

        setTransitionPointerInfo(pointerInfo)
      }

    if(region.data.type === 'step') {

      let newStepRegions = stepRegions.map(iterRegion => {
        return iterRegion.data.id === region.data.id ? region : iterRegion
      })

      setStepRegions(newStepRegions)
    } else {

      let newTransitionRegions = transitionRegions.map(iterRegion => {
        return iterRegion.data.id === region.data.id ? region : iterRegion
      })

      setTransitionRegions(newTransitionRegions)
    }

  }


  let stepIndexValue = currentStepIndex && currentStepIndex.current !== undefined && currentStepIndex.current + 1


  return (<WS.RegionsWrapper

    >
      {isInEditor ? (
        <React.Fragment>
          {stepRegions.map((region) => {

            return <RegionLite
              key={region.data.id}
              boxHeight={region.height}
              boxWidth={region.width}
              wrapperLeftPos={wrapperLeftPos}
              wrapperTopPos={wrapperTopPos}
              x={region.x}
              y={region.y}
              data={region.data}
              omniBarHeight={omniBarHeight}
              onChangeHandler={onChangeHandler}
            />
          })}
          {transitionRegions.map((region) => {

            return <RegionLite
                key={region.data.id}
                boxHeight={region.height}
                boxWidth={region.width}
                wrapperLeftPos={wrapperLeftPos}
                wrapperTopPos={wrapperTopPos}
                x={region.x}
                y={region.y}
                data={region.data}
                omniBarHeight={omniBarHeight}
                onChangeHandler={onChangeHandler}
              />
          })}

        </React.Fragment>
      ) : ('')}

    </WS.RegionsWrapper>
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
    width: 100%;
    height: 100%;
    //height: calc(100% - 65px);

    overflow: hidden;
    && .hidden {
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
     transform-origin: top left;
     transform: scaleX(${(props) => `calc(${props.scalePercentageWidth})`}) scaleY(${(props) => `calc(${props.scalePercentageWidth})`});
  `,

  StepsWrapper: styled.div`
     // width: ${({ fullWidth }) => fullWidth}px;
     // height: ${({ fullHeight }) => fullHeight}px;
     position: absolute;
     left: 0;
     top: 0;
     //transform-origin: center;

     // padding-bottom: ${(props) => ((props.fullHeight) / props.fullWidth) * 100}%; /* 16:9 */

     //transform-origin: top left;
     z-index: 3;
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
    transition: 0.3s ease-in-out;




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
    //height: ${({ innerHeight }) => innerHeight}px;
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



    // padding-bottom: ${({ innerWidth, innerHeight }) => (innerHeight)}%;
  `,
  Main: styled.div`
    width: 100%;
    height: ${({ isOmniBarDisabled }) => `calc(100% - ${isOmniBarDisabled ? '0px' : '40px'})`};
    //height: 100%;
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




  `,
  RegionsWrapper: styled.div`
    && {
       position: absolute;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       // width: ${({ fullWidth }) => fullWidth}px;
       // height: ${({ fullHeight }) => fullHeight}px;
       // transform-origin: top left;
       // transform: scaleX(${(props) => `${props.scalePercentageWidth}`}) scaleY(${(props) => `${props.scalePercentageHeight}`});

    }

    && > div > div > div:nth-child(2) {
      width: 100%;
      height: 100%;
      position: relative;
      z-index:-1;
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
      opacity: ${props => props.show ? '1' : '0'};
      //cursor: pointer;
      cursor: ${({ isInEditor }) => isInEditor ? 'move' : 'cursor'};
      transition: ${props => props.isMoving ? 'none' : '0.4s ease-in-out'};
      position: absolute;

      top: 0;
      left: 0;
      transform: translate(${(props) => props.frameX}px, ${(props) => props.frameY}px);
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
    z-index: ${({ showHotspot }) => showHotspot ? '3' : '-1'};

    position: absolute;
    top: 0;
    left: 0;
  `,
  ImagesWrapper: styled.div`
    max-width: 100%;
    height: 100%;

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

    flex-direction: row;
    align-items: center;
    //justify-content: space-between;
  `,
  OmniBar_Container: styled.span`
    width: 20%;
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
    width: 15%;
  `,
  OmniBar__urlWrapperInner: styled.span`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;

    flex-grow: 1;
    max-width: 90%;
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
    margin-bottom: 0px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  `,
  UrlReload: styled(ReloadOutlined)`
    width: 16px;
    height: 16px;
    margin-left: 10px;
    margin-right: 10px;

    && svg {
      width: 100%;
      height: 100%;
      fill: #9ca3af;
    }

    cursor: pointer;

    &&:hover svg {
      fill: #333;
    }
  `,
  UrlLock: styled(LockFilled)`
    width: 14px;
    height: 14px;
    margin-left: 10px;
    margin-right: 10px;

    && svg {
      fill: #9ca3af;

      width: 100%;
      height: 100%;
    }
  `,

  OmniBar__Buttons: styled.span`
    display: flex;
    flex-direction: row;

    align-items: center;
    justify-content: space-between;
    width: 65px;
    height: 100%;
  `,
  ConfettiWrapper: styled.span`
     z-index: 3;
  `,
  WatermarkWrapper: styled.div`
    position: fixed;
    //width: 25%; //240px;
    //height: 16%; //75px;
    height: 5vw;
    width: 5vw;

    max-width: 240px;
    max-height: 75px;
    z-index: 3;
    opacity: 0.75;
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
      transition: 0.4s ease-in-out;
    }

    &&:hover {
      width: 18vw;
      height: 5.5vw;
    }

    &&:hover .watermark-icon-inner-layer {
      fill: ${Colors.primaryColor};
    }

    &&:hover .Watermark__Text {
      color: #111;

      width: 12vw;
      height: 100%;
      line-height: 5.5vw;
    }


    &&:hover {
      border: 2px solid #111;
      //box-shadow: rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
      opacity: 1;
      background: #f9f9f9;

    }
  `,
  WatermarkButton: styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 100%;

  `,
  Watermark__Icon: styled.svg`
    height: 4.8vw;
    width: 4.8vw;
    //max-width: 46px;
    //min-width: 46px;
    //max-height: 46px;
    //min-height: 46px;
    position: relative;
    padding: 0px;
    border-radius: 4px;

  `,
  Watermark__Text: styled.div`
    font-family: ${Colors.fontFamily};
    font-size: 2vw;
    color: #999;
    overflow: hidden;
    text-overflow: clip;

    width: 0px;
    transition: 0.4s ease-in-out;
    line-height: 55px;

    @media (max-width: 650px) {
      font-size: 1em;
    }

  `,
  TabsWrapper: styled.div`
    position: fixed;
    bottom: 0;
    z-index: 2;
    width: 100%;
    height: 4vw;
    transition: 0.3s ease-in-out;
    opacity: 0.8;

    &&:hover {
      height: 17vw;
      opacity: 1;

    }
  `,
  TabsInner: styled.div`
    background-image: linear-gradient(to bottom,#ffffff00,rgba(17,24,39,.1),#1E1F44);
    height: 17vw;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: end;
  `,
  Tabs__TabWrapper: styled.div`
    width: 70%;
    height: 4vw;

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
    height: 17vw;
    display: flex;
    align-items: center;

    &&:hover > span {
        height: 0.8vw;
    }
  `,
  Tabs__TabInner: styled.span`
    border-radius: 4px;
    width: 100%;
    background: rgba(249,249,249,0.76);
    height: 0.45vw;

    transition: 0.2s ease-in-out;



    &&.viewed {
      background: ${({ backgroundColor }) => backgroundColor};
    }
  `,
  SpeedUpIcon: styled(ForwardOutlined)`
    position: absolute;
    width: 25em;
    height: 50em;
    z-index: 5;
    display: none;
    opacity: 0.7;
    transition: 1s ease-in-out;

    &&.show {
      display: block;
      opacity: 1;
    }

    && svg {
      width: 100%;
      height: 100%;
    }
  `,

}

export default Regions
