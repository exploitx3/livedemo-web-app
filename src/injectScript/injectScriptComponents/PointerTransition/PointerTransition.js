import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import ReCAPTCHA from 'react-google-recaptcha'
import { Button } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import Colors from '../../../constants/mainColors.js'
import { arrow, autoPlacement, computePosition, offset } from '@floating-ui/dom'
import '@fontsource/lexend/latin.css'
import TooltipContent from '../TooltipContent/TooltipContentEditor.js'

const HOTSPOT_SIZE = 90

function PointerTransition(props) {
  let {
    tooltipRef,
    pointerInfo,
    index,
    transition,
    size,
    onBack,
    onNext,
    onSkip,
    liveDemo,
    themeBackgroundColor,
    themeTextColor,
    themeButtonBackgroundColor,
    themeButtonTextColor,
    iframeSize,
    forceUpdateVar,
    widthDimensionPercentage,
    changeStep,
    wrapperWidth,
    wrapperHeight,
    isInEditor
  } = props


  let [isVisible, setIsVisible] = useState(false)

  let showHeader = transition && transition.showHeader
  let showFooter = transition && transition.showFooter


  let innerWidth = wrapperWidth ? wrapperWidth : window.innerWidth
  let innerHeight = wrapperHeight ? wrapperHeight : window.innerHeight

  let [hasSetupDragging, setHasSetupDragging] = useState(false)

  let textFontSize = '2vw' // + (2.70 * (1 - widthDimensionPercentage))
  let hotspotSize = HOTSPOT_SIZE

  let reverseWidthPercentage = 1 + (1 - widthDimensionPercentage)

  if(wrapperWidth <= 1040) {
    textFontSize = '14px'
  } else if(wrapperWidth > 1040) {
    textFontSize = '1.1vw'
  }
  if(wrapperWidth < 540) {
    textFontSize = '2.7vw'
  }

  if(isInEditor) {
    textFontSize = '14px'
  }



  let customHeader = (liveDemo.custom && liveDemo.custom.header) || {}
  let hideFooter = transition.hideFooter
  let nextButtonText = transition.nextButtonText
  let showStepNumbers = transition.showStepNumbers === undefined ? true : !!transition.showStepNumbers

  let nextButtonTextString = (nextButtonText ? nextButtonText : 'Next')
  let stepNumbersString = (showStepNumbers ? `(${index + 1}/${size})` : '')

  let wrapperRef = useRef(null)

  let [dragBounds, setDragBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 })
  let [dragDisabled, setDragDisabled] = useState(true)

  let [isMoving, setIsMoving] = useState(true)

  let isDragging = useRef(null)

  let [isArrowShown, setIsArrowShown] = useState(false)

  let [popperInstance, setPopperInstance] = useState(null)

  let arrowRef = useRef(null)


  let tooltipDefaultWidth = 400
  let tooltipDefaultHeight = 200

  let vwSize = {
    width: innerWidth,
    height: innerHeight,
  }

  let [tooltipX, setTooltipX] = useState((vwSize.width / 2) - (tooltipDefaultWidth))
  let [tooltipY, setTooltipY] = useState((vwSize.height / 2) - (tooltipDefaultHeight))


  // let [targetElement, setTargetElement] = useState(null)
  // let [placement, setPlacement] = useState('auto')

  useEffect(() => {
    if(tooltipRef) {
      tooltipRef.current = wrapperRef.current
    }
  }, [wrapperRef, tooltipRef])


  useEffect(() => {
    if(pointerInfo && pointerInfo.enabled && wrapperRef.current && arrowRef.current) {



      let arrowElem = document.getElementById('arrow_' + transition._id)
      const arrowLen = 8 //arrowElem.offsetWidth;

      // Get half the arrow box's hypotenuse length
      const floatingOffset = Math.sqrt(2 * arrowLen ** 2) / 2;


      let updatePosition = function() {


        let middleware = []


        if(pointerInfo.placement === 'auto') {
          middleware.push(autoPlacement())
        }

        middleware = middleware.concat([
          offset(10),
          arrow({
            element: arrowRef.current,
          })
        ])



        computePosition(pointerInfo.targetElement, wrapperRef.current, {
          placement: pointerInfo.placement,
          strategy: 'absolute',
          middleware: middleware
        })
          .then((({x, y, middlewareData, placement}) => {

            if(x < 0 && y < 0) {
              return
            }

            setTooltipX(x)
            setTooltipY(y)

            const side = placement.split("-")[0];


            const staticSide = {
              top: "bottom",
              right: "left",
              bottom: "top",
              left: "right"
            }[side]


            if (middlewareData.arrow) {
              const { x, y } = middlewareData.arrow;

              wrapperRef.current.setAttribute('data-popper-placement', staticSide)

              Object.assign(arrowElem.style, {
                // display: 'block',
                left: x != null ? `${x}px` : "",
                top: y != null ? `${y}px` : "",
                // Ensure the static side gets unset when
                // flipping to other placements' axes.
                right: "",
                bottom: "",
                [staticSide]: `${-arrowLen / 2}px`,
                // transform: "rotate(45deg)",
              });
            }


            setIsVisible(true)
            setIsArrowShown(true)

          }))

      }

      updatePosition()
    }


  }, [pointerInfo, pointerInfo.targetElement, wrapperRef.current, arrowRef.current])

  let [isLoading, setIsLoading] = useState(false)


  return  <TC.Wrapper
    id={'tooltip_pointer_transition_' + transition._id}
    ref={wrapperRef}
    isMoving={isMoving}
    themeBackgroundColor={themeBackgroundColor}
    themeTextColor={themeTextColor}
    tooltipX={tooltipX}
    tooltipY={tooltipY}
    arrowColor={themeBackgroundColor}
    visible={isVisible}
  >
    <TooltipContent
      liveDemo={liveDemo}
      continuous={true}
      index={index}
      view={transition}
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
      headerOnMouseDown={() => {}}
      onClick={() => {

        let newIndex = index + 1
        changeStep(newIndex)

      }}
    />
    <TC.Arrow ref={arrowRef} isArrowShown={isArrowShown} className={'arrow'} id={'arrow_' + transition._id} data-popper-arrow></TC.Arrow>
  </TC.Wrapper>



}

function getBoxShadow(themeColor) {
  return `${themeColor}66 -5px 5px, ${themeColor}4D  -10px 10px, ${themeColor}33 -15px 15px, ${themeColor}1A -20px 20px, ${themeColor}0D -25px 25px;`
}

const TC = {
  Arrow: styled.div`
    visibility: ${({isArrowShown}) => isArrowShown ? 'visible' : 'hidden'} !important;

    &&:before {
      visibility: ${({isArrowShown}) => isArrowShown ? 'visible' : 'hidden'} !important;
    }

  `,
  CaptchaWrapper: styled.div`
    width: 100%;
    height: 65px;
    position: relative;
  `,
  ReCAPTCHA: styled(ReCAPTCHA)`
    .grecaptcha-badge {
      position: absolute;
      top: 10px;
      left: 30px;
      transform: scale(0.9);
    }

  `,
  CaptchaNotice: styled.p`
    font-size: 0.8em;
  `,
  ContentWrapper: styled.div`
    width: 100%;
    overflow-y: auto;
    max-height: 200px;
    display: block;
    font-size: 1.4vw;

    @media (max-width: 640px) {
      font-size: 2.5vw;
    }

    &&::-webkit-scrollbar-track {
      //-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
      background-color: #F9F9F9;
    }

    &&::-webkit-scrollbar {
      width: 5px;
      background-color: #F9F9F9;
    }

    &&::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: ${Colors.primaryColor};
    }


  `,
  IntermidateDragger: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    //
    //top: 50%;
    //left: 50%;

    max-width: 100%;
    width: 400px;
    padding: 50px;

    //border: 1px solid black;
    //transition: 0.4s all ease-out;
    // transition: ${({isMoving}) => isMoving ? 'none' : '0.4s all ease-out'};

        // Center
    z-index: 3;

    position: fixed;
    // left: ${(props) => `calc(50% - ${225 * props.scalePercentage}px)`};
    // top: ${(props) => `calc(50% - ${200 * props.scalePercentage}px)`};
    // left: ${(props) => `calc(50%)`};
    // top: ${(props) => `calc(50%)`};

    // transform: ${(props) => props.scalePercentage ? `scale(${props.scalePercentage})` : ''};

  `,
  DraggerWrapper: styled.div`
    transition: ${({ isMoving }) => isMoving ? 'none' : '0.4s all ease-in-out'};
    // transform: ${(props) => props.scalePercentage ? `scale(${props.scalePercentage})`: ''};
    //transform-origin: top left;


  `,
  WrapperInner: styled.div`

    //transform-origin: top left;

    // transform: ${(props) => props.additionalStyles ? props.additionalStyles.transform : 'translate(-50%, -50%)'};

  `,
  Wrapper: styled.div`
    //width: 100%;
    //height: auto;
    // transition: ${({isMoving}) => isMoving ? 'none' : '0.5s all ease-out'};
    transition: 0.5s all ease-out;
    position: absolute;
    transform-origin: top left;
    transform: translateX(${({tooltipX}) => tooltipX}px) translateY(${({tooltipY}) => tooltipY}px);

    font-size: 1.5vw;
    font-family: ${Colors.fontFamilyApple};

    visibility: ${({visible}) => visible ? 'visible' : 'hidden'};

    //
    //
    //top: 50%;
    //left: 50%;

    //width: 450px;
    width: max-content;
    //width: 29vw;
    height: auto;

    background: ${({themeBackgroundColor}) => themeBackgroundColor};
    //background: #2734c5;
    //background: #f8f8f8;
    border-radius: 5px;
    box-sizing: border-box;
    color: ${({themeTextColor}) => themeTextColor};
    //position: relative;
    border: 1px solid ${({themeBackgroundColor}) => themeBackgroundColor};

    .arrow,
    .arrow::before {
      position: absolute;
      width: 18px;
      height: 18px;
      // background: ${Colors.primaryColor};
    }

    .arrow {
      visibility: hidden;
    }

    .arrow::before {
      visibility: visible;
      content: '';
      transform: rotate(45deg);
      background: ${({themeBackgroundColor}) => themeBackgroundColor};

    }

    &&[data-popper-placement^='top'] > .arrow {
      //bottom: -9px;
    }

    &&[data-popper-placement^='bottom'] > .arrow {
      //top: -9px;
      background: linear-gradient(45deg, rgba(2,0,36,0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
    }

    &&[data-popper-placement^='left'] > .arrow {
      //right: -9px;
      background: linear-gradient(45deg, rgba(2,0,36,0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
    }

    &&[data-popper-placement^='right'] > .arrow {
      //left: -9px;
      background: linear-gradient(45deg, ${({arrowColor}) => arrowColor} 50%, rgba(2,0,36,0) 51%, rgba(2,0,36,0) 100%);
    }


    &&[data-popper-placement^='bottom'] > .arrow:before {
      background: linear-gradient(135deg, rgba(2,0,36,0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
    }

    &&[data-popper-placement^='top'] > .arrow:before {
      background: linear-gradient(-45deg, rgba(2,0,36,0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
    }

    &&[data-popper-placement^='right'] > .arrow:before {
      background: linear-gradient(45deg, rgba(2,0,36,0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
    }

    &&[data-popper-placement^='left'] > .arrow:before {
      background: linear-gradient(45deg, ${({arrowColor}) => arrowColor} 50%, rgba(2,0,36,0) 51%, rgba(2,0,36,0) 100%);
    }


    //
    // &&:hover {
    //  box-shadow: 0px 0px 0px 1px ${props => props.themeColor};
    // }
  `,
  HeaderWrapper: styled.div`
    cursor: ${({isMovable}) => isMovable ? 'move' : 'auto'};

    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: ${(props) => props.isActive ? '85px' : '34px'};
    padding: 20px;
    position: relative;
    //border-bottom: 1px solid #d3d3d3;


  `,
  SpinnerWrapper: styled.div`
    height: 200px;
  `,
  CloseIcon: styled(CloseOutlined)`
    position: absolute;
    right: 15px;
    top: 15px;
    cursor: pointer;

    && svg {
      transition: 0.3s ease-in-out;
      fill: #a1a1a1;
    }

    &&:hover svg {
      fill: #f9f9f9;
    }
  `,
  ProfileImageWrapper: styled.span`
    width: 48px;
    height: 48px;
    border: 1px solid ${({themeBackgroundColor}) => themeBackgroundColor};
    border-radius: 50%;

    position: relative;
  `,
  ProfileImage: styled.img`


    width: 4.4vw;
    height: 4.4vw;
    //border: 1px solid #1070ff;
    border-radius: 50%;

    box-shadow: rgb(255 255 255) 0px 0px 0px 3px;
    border: 3px solid #fff;
    outline: 2px solid #1070ff;

    @media (max-width: 640px) {
      width: 5.5vw;
      height: 5.5vw;
    }

  `,
  ProfileName: styled.p`
    color: ${({themeTextColor}) => themeTextColor};
    display: inline-block;
    margin: 0px;
    //font-size: 1em;
    font-family: monospace;
    //color: rgb(104, 104, 104);
    font-weight: 550;
    font-size: 0.85rem;


    @media (max-width: 640px) {
      font-size: 0.65rem;
    }

  `,
  ProfileText: styled.p`
    margin: 0px 0px 0px 16px;

    font-family: monospace;
    font-weight: 550;
    font-size: 0.75rem;


    @media (max-width: 640px) {
      font-size: 0.55rem;
    }
  `,

  LeftButtonsWrapper: styled.span`

  `,
  RightButtonsWrapper: styled.span`

  `,
  TooltipFooter: styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-top: 15px;

    padding: 5px 15px 15px 15px;
  `,
  SkipButton: styled.button`
    background-color: transparent;
    border: 0px;
    border-radius: 0px;
    color: ${({themeTextColor}) => themeTextColor};
    cursor: pointer;
    font-size: 1.2vw;
    line-height: 1;
    padding: 8px;
    appearance: none;
    margin-left: auto;
    margin-right: 5px;
    //font-weight: 600;

    @media (max-width: 640px) {
      display: none;
    }

  `,
  BackButton: styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'themeTextColor',
  })`
    background-color: transparent;
    border: 0px;
    border-radius: 0px;
    color: ${(props) => props.themeTextColor};
    //color: #f9f9f9;

    cursor: pointer;
    font-size: 1.2vw;
    line-height: 1;
    padding: 8px;
    appearance: none;
    margin-left: auto;
    margin-right: 5px;
    font-weight: 600;

    @media (max-width: 640px) {
      font-size: 1.4vw;
    }

  `,
  TooltipButton: styled(Button)`

  `,
  NextButton: styled.button.withConfig({
    shouldForwardProp: (prop) => !['themeButtonBackgroundColor', 'themeButtonTextColor'].includes(prop),
  })`
    background-color: ${(props) => props.themeButtonBackgroundColor};
    border: 0px;
    border-radius: 4px;
    //color: rgb(255, 255, 255);
    color: ${({themeButtonTextColor}) => themeButtonTextColor};

    cursor: pointer;
    font-size: 1.2vw;
    line-height: 1;
    padding: 8px;
    appearance: none;
    //margin-right: 15px;
    font-weight: 600;

    @media (max-width: 640px) {
      font-size: 1.4vw;
    }
  `,
  FormattedMessage: styled.p`
    margin: 0px;
  `,
  TooltipTitle: styled.p`
    margin: 0px;
    font-size: 0.85em;
  `,

  TooltipContent: styled.span.withConfig({
    shouldForwardProp: (prop) => prop !== 'themeTextColor',
  })`
    //font-family: 'Gagalin', sans-serif;
    //font-size: 1.5em;

    color: ${({themeTextColor}) => themeTextColor};
    line-height: 1.4;
    text-align: center;

    margin-top: 15px;

    && ul,
    && ol {
      padding-left: 15px;
    }
  `
}


export default PointerTransition
