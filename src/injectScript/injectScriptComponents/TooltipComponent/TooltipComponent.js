import axios from 'axios'
import ENV from '../config.json'
import React, { useEffect, useRef, useState, forwardRef } from 'react'
import styled from 'styled-components'
import ReCAPTCHA from 'react-google-recaptcha'
import { Button } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import Colors from '../../../constants/mainColors.js'
import { createPopper } from '/home/exploitx/WebstormProjects/livedemo/story-api/node_modules/@popperjs/core/dist/umd/popper'
import { waitForElement } from '../../helpers.js'
import FormView from '../Form/FormView.js'
import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
import TippyModule, { useSingleton } from '@tippyjs/react'

// Ensure we get the actual component (handle both default and named exports)
const Tippy = TippyModule?.default || TippyModule
import './tippyStyles.css'

// Tippy is already wrapped with forwardRef, so we can use it directly
import tippy, {createSingleton} from 'tippy.js';

function Tip({ children, ...props }) {
  return <HT.Tippy {...props}>{children}</HT.Tippy>
}


function TooltipComponent(props) {
  const [source, target] = useSingleton()

  let {

    continuous,
    index,
    step,
    size,
    onBack,
    onNext,
    onSkip,
    storyDemo,
    themeColor,
    setShowTooltip,
    setShowStartButton,
    iframeSize,
    addTooltipAnchor,
    removeTooltipAnchor,
    clearTooltipAnchors,
    tooltipWrapperRef,
  } = props



  let width = iframeSize && iframeSize.width ? iframeSize.width : 1366
  let height = iframeSize && iframeSize.height ? iframeSize.height : 632

  let innerWidth = window.document.body.clientWidth
  let innerHeight = window.document.body.clientHeight


  let scalePercentage = innerWidth / width
  let scalePercentageWidth = (innerWidth) / width
  let scalePercentageHeight = (innerHeight) / height

  let tooltipCenterX = (width/2) - (450/2)
  let tooltipCenterY = (height/2) - (450/2)

  let additionalStyles = !(iframeSize && iframeSize.width) ? {} : {
    transformOrigin: 'top left',
    transform: `scale(${scalePercentage})`
  }



  let customHeader = (storyDemo.custom && storyDemo.custom.header) || {}
  let hideFooter = step.hideFooter
  let nextButtonText = step.view && step.view.nextButtonText
  let showStepNumbers = step.view && step.view.showStepNumbers === undefined ? true : !!(step.view && step.view.showStepNumbers)

  let nextButtonTextString = (nextButtonText ? nextButtonText : 'Next')
  let stepNumbersString = (showStepNumbers ? `(${index + 1}/${size})` : '')

  let wrapperRef = useRef(null)

  let [dragBounds, setDragBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 })
  let [dragDisabled, setDragDisabled] = useState(true)

  let [isArrowShown, setIsArrowShown] = useState(false)

  let [pointerInfo, setPointerInfo] = useState(null)
  let [popperInstance, setPopperInstance] = useState(null)

  // let [targetElement, setTargetElement] = useState(null)
  // let [placement, setPlacement] = useState('auto')

  let tippyInstance = useRef(null)
  let tippyInstances = useRef([])

  const singleton = createSingleton(tippyInstances.current, {
    moveTransition: 'transform 0.2s ease-out',
    overrides: ['zIndex', 'interactive', 'sticky', 'popperOptions'],

  });

  let tippySingleton = useRef(singleton)

  useEffect(() => {

    if (step.view && step.view.viewType === 'Pointer') {
      // document.querySelector(step.view.selector).style['z-index'] = "99999999";
      let targetSelector = step.view.selector



      waitForElement(targetSelector, 300, 20)
        .then((targetElement) => {

          let anchorElement = targetElement
          if(step.view && step.view.selectorLocation) {
           anchorElement = addTooltipAnchor(step._id, step.view.selectorLocation)
          }

          targetElement.scrollIntoView({behavior: "auto", block: "end", inline: "nearest"})



          let selector = step.view.selector
          let placement = step.view.placement || 'auto'

          setPointerInfo({
            enabled: true,
            targetElement: anchorElement,
            placement
          })
        })
    } else {
      setIsArrowShown(false)
    }
  }, [step])

  const scaleModifier = {
    name: 'scaleModifier',
    enabled: true,
    phase: 'beforeWrite',
    fn({ state }) {
      // state.rects.reference.x = state.rects.reference.x * 0.6
      // state.rects.reference.y = state.rects.reference.y * 0.6
      // state.elements.popper.style.transform = state.elements.popper.style.transform + ' scale(0.6)'

      // wrapperRef.current.style.transform = wrapperRef.current.style.transform + ` scale(${innerWidth / width})`

      // state.rects.popper.width = state.rects.popper.width * 0.6
      // state.rects.popper.height = state.rects.popper.height * 0.6

      // state.styles.popper.transform = state.styles.popper.transform + ` scale(${scalePercentageWidth.toFixed(2)}5) translateZ(0) perspective(1px)`
      state.styles.popper.backfaceVisibility = "hidden"
      // -webkit-font-smoothing: subpixel-antialiased;`


      if(state.placement === 'left') {
        state.styles.popper.transformOrigin = 'right center'
      }

      if(state.placement === 'right') {
        state.styles.popper.transformOrigin = 'left center'
      }

      if(state.placement === 'bottom') {
        state.styles.popper.transformOrigin = 'top center'
      }


      if(state.placement === 'top') {
        state.styles.popper.transformOrigin = 'bottom center'
      }

      // console.log(state)
    },
  }

  const scaleModifierWrite = {
    name: 'scaleModifierWrite',
    enabled: true,
    phase: 'beforeMain',
    fn({ state }) {

      state.rects.reference.x = state.rects.reference.x * scalePercentageWidth
      state.rects.reference.y = (state.rects.reference.y * scalePercentageHeight) + 40



      // TODO: position the arrow

      // if(state.placement === 'left') {
      //   // state.styles.popper.transform = state.styles.popper.transform + ` scale(${scalePercentage})`
      //
      // }

      // state.rects.reference.x = state.rects.reference.x * 0.599250936329588
      // state.rects.reference.y = (state.rects.reference.y * 0.6091549295774648) + 40

      // state.rects.popper.x = state.rects.popper.x * 0.599250936329588
      // state.rects.popper.y = (state.rects.popper.y * 0.6091549295774648) + 40

      // console.log(scalePercentage !== 1 ? "scalePercentage active" : 'scalePercentage not ')

      // state.rects.reference.x = state.rects.reference.x * scalePercentageWidth
      // state.rects.reference.y = (state.rects.reference.y * scalePercentageHeight) + (60 * scalePercentageHeight)


      // if(state.placement === 'left') {
      //
      //   state.rects.reference.x += -20
      // }
      //
      // if(state.placement === 'right') {
      //
      //   state.rects.reference.x += 20
      // }

      // if(scalePercentage === 1){
      //
      //   state.rects.reference.y += 60
      // } else {
      //
      //   state.rects.reference.y += 40
      // }



      // state.rects.popper.width = state.rects.popper.width * 0.6
      // state.rects.popper.height = state.rects.popper.height * 0.6

      // let origWidth = state.rects.popper.width
      // let widthDifference = origWidth - (origWidth * scalePercentage)
      //
      // let origHeight = state.rects.popper.height
      // let heightDifference = origHeight - (origHeight * scalePercentage)
      //
      // let myRegexp = new RegExp('^(translate|translate3d)\\((?<x>[\\d\\.\\-]+)([\\w\\W]+?),[ ]?(?<y>[\\d\\.\\-]+)([\\w\\W]+)$', 'g')
      // let tranformParsed = myRegexp.exec(state.styles.popper.transform)
      //
      //
      // let iframeRect = window.document.querySelector('#story_iframe').getBoundingClientRect()
      //
      //
      // let heightDiffIframe =  (window.innerHeight - iframeRect.height) - 40
      //
      // let additionalPaddingTop = 0
      // let additionalPaddingLeft = 0
      //
      // if (state.placement === 'bottom') {
      //   if (heightDifference) {
      //     additionalPaddingTop = widthDifference * 0.30
      //   }
      // } else if (state.placement === 'left' || state.placement === 'right') {
      //
      //   if (heightDifference) {
      //     additionalPaddingTop = heightDifference * 0.65
      //   }
      //
      //   if (widthDifference && state.placement === 'left') {
      //     additionalPaddingLeft = widthDifference * 0.25
      //   }
      //
      //   if (widthDifference && state.placement === 'right') {
      //     additionalPaddingLeft = widthDifference * 0.25 * -1
      //   }
      // }
      //
      //
      // if (!tranformParsed || tranformParsed.length < 3) {
      //   return
      // }
      //
      // let transformX = ((parseInt(tranformParsed[2]) + 0))
      // let transformY = ((parseInt(tranformParsed[4]) + heightDiffIframe))
      //
      // let newTransform = `${tranformParsed[1]}(${transformX}px, ${transformY}${tranformParsed[5]}`
      //
      // state.styles.popper.transform = newTransform

      // state.styles.popper.transform = newTransform + ` scale(${scalePercentage})`

      // state.styles.popper.transform = state.styles.popper.transform + ` scale(${scalePercentage})`



      //
      // let iframe = window.document.querySelector('#story_iframe')
      //
      // const offsetTop = iframe.offsetTop;
      // const offsetLeft = iframe.offsetLeft;
      // console.log(data.offsets.popper.top, offsetTop);
      // console.log(data.offsets.popper.left, offsetLeft);
      // console.log(data.offsets.popper);
      //
      // state.modifiersData.popperOffsets.y += offsetTop;
      // state.modifiersData.popperOffsets.x += offsetLeft;



      // console.log(state)
    },
  }


  function generateGetBoundingClientRect(x = 0, y = 0) {
    return () => ({
      width: 0,
      height: 0,
      top: y,
      right: x,
      bottom: y,
      left: x,
    })
  }


  useEffect(() => {
    if(pointerInfo && pointerInfo.enabled && wrapperRef.current) {


      let arrowElem = document.getElementById('arrow')
      let targetElement = pointerInfo.targetElement
      let targetRect = targetElement.getBoundingClientRect()

      const virtualElement = {
        getBoundingClientRect: generateGetBoundingClientRect(targetRect.x, targetRect.y),
      }

      if (popperInstance) {
        popperInstance.destroy()
      }



        if(tippyInstance.current) {
          tippyInstance.current.destroy()
        }

        let instance = tippy(pointerInfo.targetElement, {
          content: wrapperRef.current,
          zIndex: 5,
          disabled: false,
          delay: 200,
          arrow: true,
          appendTo: tooltipWrapperRef.current,
          interactiveBorder: 0,
          hideOnClick: false,
          trigger: 'manual',
          showOnCreate: true,
          animation: 'shift-away',
          sticky: true,
          interactive: true,
          offset: [0, 10],
          popperOptions: {
            strategy: 'fixed',

            modifiers: [
              {
                name: 'flip',
                options: {
                  fallbackPlacements: ['top', 'right', 'left', 'bottom'],
                },
              },
            ],
          },
        })

        tippyInstance.current = instance

      // tippyInstances.current.push(instance)
      //
      // if(tippySingleton && tippySingleton.current) {
      //
      //   tippySingleton.current.setInstances(tippyInstances.current);
      //   tippySingleton.current.showNext()
      //
      // } else {
      //
      //
      // }





      // let popperInstanceInternal = createPopper(pointerInfo.targetElement, wrapperRef.current, {
      //   placement: pointerInfo.placement,
      //
      //   modifiers: [
      //     {
      //       name: 'flip',
      //       enabled: true,
      //     },
      //     // scaleModifierWrite,
      //     // {
      //     //   name: 'offset',
      //     //   enabled: true,
      //     //   fn: ({state}) => {
      //     //     // console.log(data.offsets.reference.top);
      //     //     let iframe = window.document.querySelector('#story_iframe')
      //     //
      //     //     const offsetTop = iframe.offsetTop;
      //     //     const offsetLeft = iframe.offsetLeft;
      //     //     // console.log(data.offsets.popper.top, offsetTop);
      //     //     // console.log(data.offsets.popper.left, offsetLeft);
      //     //     // console.log(data.offsets.popper);
      //     //
      //     //     state.modifiersData.popperOffsets.y += offsetTop;
      //     //     state.modifiersData.popperOffsets.x += offsetLeft;
      //     //
      //     //   }
      //     // },
      //     {
      //       name: 'offset',
      //       options: {
      //         offset: [0, 20],
      //       }
      //     },
      //     {
      //       name: 'arrow',
      //       options: {
      //         element: arrowElem,
      //         padding: 5, // 5px from the edges of the popper
      //       }
      //     },
      //     // preventOverflow,
      //     // scaleModifierWrite,
      //     // scaleModifier
      //
      //
      //   ]
      // })

      // popperInstanceInternal.update()

      setIsArrowShown(true)
      // setPopperInstance(popperInstanceInternal)




    }


  }, [pointerInfo, wrapperRef.current])

  function sendFormData(formId, fieldsObj) {
    let formBody = Object.values(fieldsObj).reduce((accum, fieldObj) => {
      accum[fieldObj.name] = fieldObj.value

      return accum
    }, {})

    return axios.post(`${ENV.STORIES_API}/leads/forms/${formId}`,
      formBody
    ).then((res) => {

      return res.data
    })
  }

  let showForm = !!(step.view && step.view.viewType === 'Form' && step.view && step.view.formId && step.view.formId._id) || !!(step.popups && step.popups.formId)
  let [fieldsObj, updateFieldsObj] = useState({})

  let initFormStepData = step.view && step.view.formId
  let initFormScreenData = step.popups && step.popups.formId

  let formDataInternal = initFormStepData ? initFormStepData : initFormScreenData
  let [isLoading, setIsLoading] = useState(false)

  let recaptchaRef = useRef(null)

  let onNextHandlerClosure = (formData, fieldsObj, recaptchaRef) => function (...args) {


    let promise = Promise.resolve()
    if (showForm) {
      promise = promise.then(() => {

        console.log(Object.entries(fieldsObj))
        setIsLoading(true)

        return recaptchaRef.current.executeAsync()
          .then(captchaToken => {
            recaptchaRef.current.reset()

            fieldsObj['captchaToken'] = {
              name: 'captchaToken',
              value: captchaToken
            }


            return sendFormData(formData._id, fieldsObj)

          })


      })
    }

    promise = promise.then(() => {
        setIsLoading(false)


        return onNext(...args)
      })
      .catch(() => {

        setIsLoading(false)
      })

    return promise
  }


  function onDragStart(event, uiData) {
    const { clientWidth, clientHeight } = window.document.getElementById('main');

    // let mainElem = document.getElementById('main')

    console.log(uiData)
    let mainElem = document.getElementById('main')

    const targetRect = wrapperRef.current.getBoundingClientRect();
    // const targetRect = mainElem.getBoundingClientRect();
    setDragBounds({
        left: -targetRect.left + uiData.x,
        right: clientWidth - (targetRect.right - uiData.x),
        top: -targetRect.top + uiData.y,
        bottom: clientHeight - (targetRect.bottom - uiData.y)
      })


  }

  let mainElem = document.getElementById('main')

  return <React.Fragment>
    {/*{pointerInfo && pointerInfo.targetElement ? (*/}
    {/*  <Tip*/}
    {/*    zIndex={5}*/}
    {/*    disabled={false}*/}
    {/*    // disabled={!showTippy}*/}
    {/*    delay={200}*/}
    {/*    arrow={true}*/}
    {/*    showOnCreate={true}*/}
    {/*    animation={'shift-away'}*/}
    {/*    offset={[0, -10]}*/}
    {/*    popperOptions={{*/}
    {/*      modifiers: [*/}
    {/*        {*/}
    {/*          name: 'flip',*/}
    {/*          options: {*/}
    {/*            fallbackPlacements: ['top', 'right', 'left', 'bottom'],*/}
    {/*          },*/}
    {/*        },*/}
    {/*      ],*/}
    {/*    }}*/}
    {/*    interactive={true}*/}
    {/*    placement={'auto'}*/}
    {/*    content={*/}
    {/*      <HT.HotspotTextWrapper textFontSize={14} className={'tippy_wrapper_pointerInfo'}>*/}
    {/*        {'test text'}*/}
    {/*      </HT.HotspotTextWrapper>*/}
    {/*    }*/}
    {/*    appendTo={pointerInfo.targetElement}*/}
    {/*  >*/}
    {/*  </Tip>*/}

    {/*) : ''}*/}

    <TC.Wrapper
      id={'tooltip'}
      ref={wrapperRef}
      isMoving={!dragDisabled}
      themeColor={themeColor}
      scalePercentage={scalePercentage}
      visible={tippyInstance && tippyInstance.current}
      // additionalStyles={additionalStyles}

    >
      <TC.WrapperInner
        additionalStyles={additionalStyles}
      >

        <TC.HeaderWrapper
          isMovable={scalePercentage === 1}
          isActive={customHeader.isActive}
          onMouseOver={() => {
            // if (dragDisabled && step.view.viewType !== 'Pointer') {
            if (dragDisabled) {
            // if (dragDisabled && scalePercentage === 1) {
              setDragDisabled(false)
            }
          }}
          onMouseOut={() => {
            setDragDisabled(true)
          }}
        >
          {!customHeader.isActive ? '' : (
            <React.Fragment>
              <TC.ProfileImage src={customHeader.imageUrl === '' ? NoProfileImage : customHeader.imageUrl}/>
              <TC.ProfileText><TC.ProfileName
                themeColor={themeColor}>{customHeader.personName}</TC.ProfileName>{customHeader.text}
              </TC.ProfileText>
            </React.Fragment>
          )}
          <TC.CloseIcon onClick={() => {
            setShowTooltip(false)
            setShowStartButton(true)
          }}/>
        </TC.HeaderWrapper>


        <TC.ContentWrapper>
          <React.Fragment>
            {(showForm && formDataInternal._id) ?
              <React.Fragment>
                {isLoading ? (<TC.SpinnerWrapper><Spinner/></TC.SpinnerWrapper>) : (
                  <React.Fragment>
                    <FormView formData={formDataInternal}
                              onNextHandler={onNextHandlerClosure(formDataInternal, fieldsObj, recaptchaRef)}
                              updateFieldsObj={updateFieldsObj}/>
                    {/*<TC.CaptchaNotice>This site is protected by reCAPTCHA and the Google*/}

                    {/*  <a href="https://policies.google.com/privacy">Privacy Policy</a> and*/}
                    {/*  <a href="https://policies.google.com/terms">Terms of Service</a> apply.*/}
                    {/*</TC.CaptchaNotice>*/}
                  </React.Fragment>
                )}
                <TC.CaptchaWrapper>
                  <TC.ReCAPTCHA
                    ref={recaptchaRef}
                    badge={'inline'}
                    sitekey={ENV.CAPTCHA_SITE_KEY}
                    size="invisible"
                  />
                </TC.CaptchaWrapper>


              </React.Fragment>
              : step.view && step.view.content ? (<TC.TooltipContent
                dangerouslySetInnerHTML={{ __html: `<span>${step.view.content}</span>` }}></TC.TooltipContent>) : ''
              }
          </React.Fragment>
        </TC.ContentWrapper>


        <TC.TooltipFooter>
          {hideFooter ? '' : (
            <React.Fragment>
              <TC.LeftButtonsWrapper>

                {/*<TC.SkipButton onClick={onSkip}>*/}
                {/*  <TC.FormattedMessage id="close">*/}
                {/*    Skip*/}
                {/*  </TC.FormattedMessage>*/}
                {/*</TC.SkipButton>*/}

              </TC.LeftButtonsWrapper>
              <TC.RightButtonsWrapper>
                {index > 0 && (
                  <TC.BackButton
                    $themeColor={themeColor}

                    onClick={onBack}>
                    <TC.FormattedMessage id="back">
                      Back
                    </TC.FormattedMessage>
                  </TC.BackButton>
                )}
                {continuous && (
                  <TC.NextButton
                    $themeColor={themeColor}
                    onClick={onNextHandlerClosure(formDataInternal, fieldsObj, recaptchaRef)}>
                    <TC.FormattedMessage id="next">
                      {nextButtonTextString} {stepNumbersString}
                    </TC.FormattedMessage>
                  </TC.NextButton>
                )}
              </TC.RightButtonsWrapper>
            </React.Fragment>
          )}

        </TC.TooltipFooter>
      </TC.WrapperInner>
      {/*<TC.Arrow isArrowShown={isArrowShown} id={'arrow'} data-popper-arrow></TC.Arrow>*/}
    </TC.Wrapper>

  </React.Fragment>

}

function getBoxShadow(themeColor) {
  return `${themeColor}66 -5px 5px, ${themeColor}4D  -10px 10px, ${themeColor}33 -15px 15px, ${themeColor}1A -20px 20px, ${themeColor}0D -25px 25px;`
}


const HT = {
  Tippy: styled(Tippy)`


    && {
      background: ${Colors.primaryColor} !important;
      color: white;
      font-size: 1.2rem;
      padding: 10px 15px;
      max-width: 450px !important;
      border-radius: 6px;
    }



    && .tippy-arrow::before {
      color: ${Colors.primaryColor} !important;
    }
  `,
  HotspotTextWrapper: styled.span`
    //font-size: 6vmin;
    font-size: ${({ textFontSize }) => textFontSize}vmin;
    color: white;
    width: 100%;
    height: 100%;
    white-space: nowrap;
    font-weight: 550;
    font-family: ${Colors.fontFamily};

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
      transform-origin: top left;
    }
  `,


}

const TC = {
  Arrow: styled.div`
    display: ${({isArrowShown}) => isArrowShown ? 'block' : 'none'} !important;
    position: absolute;
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
    height: auto;
  `,
  IntermidateDragger: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;


    //max-width: 100%;
    //width: 400px;
    padding: 50px;

    //border: 1px solid black;

    transition: ${({isMoving}) => isMoving ? 'none' : '0.4s all ease-in-out'};

        // Center
    z-index: 3;

    position: fixed;
    //left: calc(50%);
    //top: calc(-250%);

    // left: ${(props) => `calc(100% + ${425 * props.scalePercentage}px)`};
    // top: ${(props) => `calc(-250% - ${200 * props.scalePercentage}px)`};

    // left: ${(props) => `calc(50%)`};
    // top: ${(props) => `calc(50%)`};

    // transform: ${(props) => props.scalePercentage ? `scale(${props.scalePercentage})` : ''};

  `,
  DraggerWrapper: styled.div`
    transition: ${({ isMoving }) => isMoving ? 'none' : '0.4s all ease-in-out'};
    // transform: ${(props) => props.scalePercentage ? `scale(${props.scalePercentage})` : ''};
    //transform-origin: top left;


  `,
  WrapperInner: styled.div`

    transform-origin: center;

    // transform: ${(props) => props.additionalStyles ? props.additionalStyles.transform : 'translate(-50%, -50%)'};

  `,
  Wrapper: styled.div`
    //width: 100%;
    //height: auto;
    transition: ${({isMoving}) => isMoving ? 'none' : '0.4s all ease-in-out'};
    transform-origin: center;

    display: ${({visible}) => visible ? 'block' : 'none'}

    //top: 0px;
    //left: 0px;
    //transform: translate(50%, 50%) scale(${({scalePercentage}) => scalePercentage});

    width: 30vw;
    max-width: 35vw;
    min-width: 20vw;
    height: auto;

    background: #f8f8f8;
    border-radius: 5px;
    box-sizing: border-box;
    color: rgb(51, 51, 51);
    font-size: 1.5vw;
    //position: relative;
    border: 1px solid black;

    #arrow,
    #arrow::before {
      position: absolute;
      width: 18px;
      height: 18px;
      background: ${Colors.primaryColor};
    }

    #arrow {
      visibility: hidden;
    }

    #arrow::before {
      visibility: visible;
      content: '';
      transform: rotate(45deg);
    }

    &&[data-popper-placement^='top'] > #arrow {
      bottom: -9px;
    }

    &&[data-popper-placement^='bottom'] > #arrow {
      top: -9px;
      background: linear-gradient(45deg, rgba(2,0,36,0) 50%, ${Colors.primaryColor} 51%, ${Colors.primaryColor} 100%);
    }

    &&[data-popper-placement^='left'] > #arrow {
      right: -9px;
      background: linear-gradient(45deg, rgba(2,0,36,0) 50%, ${Colors.primaryColor} 51%, ${Colors.primaryColor} 100%);
    }

    &&[data-popper-placement^='right'] > #arrow {
      left: -9px;
      background: linear-gradient(45deg, ${Colors.primaryColor} 50%, rgba(2,0,36,0) 51%, rgba(2,0,36,0) 100%);
    }


    &&[data-popper-placement^='top'] > #arrow:before {
      background: linear-gradient(135deg, rgba(2,0,36,0) 50%, ${Colors.primaryColor} 51%, ${Colors.primaryColor} 100%);
    }

    &&[data-popper-placement^='bottom'] > #arrow:before {
      background: linear-gradient(-45deg, rgba(2,0,36,0) 50%, ${Colors.primaryColor} 51%, ${Colors.primaryColor} 100%);
    }

    &&[data-popper-placement^='left'] > #arrow:before {
      background: linear-gradient(45deg, rgba(2,0,36,0) 50%, ${Colors.primaryColor} 51%, ${Colors.primaryColor} 100%);
    }

    &&[data-popper-placement^='right'] > #arrow:before {
      background: linear-gradient(45deg, ${Colors.primaryColor} 50%, rgba(2,0,36,0) 51%, rgba(2,0,36,0) 100%);
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
      fill: #282c34;
    }
  `,
  ProfileImageWrapper: styled.span`
    width: 48px;
    height: 48px;
    border: 1px solid #1070ff;
    border-radius: 50%;

    position: relative;
  `,
  ProfileImage: styled.img`

    width: 48px;
    height: 48px;
    border: 1px solid #1070ff;
    border-radius: 50%;

  `,
  ProfileName: styled.p`
    color: ${props => props.themeColor};
    display: inline-block;
    margin: 0px;
    font-size: 1em;
    font-family: monospace;
    //color: rgb(104, 104, 104);
    font-weight: 550;

  `,
  ProfileText: styled.p`
    margin: 0px 0px 0px 16px;
    font-size: 1em;
    font-family: monospace;
    font-weight: 550;
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

    padding: 15px 25px;
  `,
  SkipButton: styled.button`
    background-color: transparent;
    border: 0px;
    border-radius: 0px;
    color: ${Colors.primaryText};
    cursor: pointer;
    font-size: 1em;
    line-height: 1;
    padding: 8px;
    appearance: none;
    margin-left: auto;
    margin-right: 5px;

  `,
  BackButton: styled.button`
    background-color: transparent;
    border: 0px;
    border-radius: 0px;
    color: ${(props) => props.$themeColor};
    cursor: pointer;
    font-size: 1em;
    line-height: 1;
    padding: 8px;
    appearance: none;
    margin-left: auto;
    margin-right: 5px;

  `,
  TooltipButton: styled(Button)`

  `,
  NextButton: styled.button`
    background-color: ${(props) => props.$themeColor};
    border: 0px;
    border-radius: 4px;
    color: rgb(255, 255, 255);
    cursor: pointer;
    font-size: 1em;
    line-height: 1;
    padding: 8px;
    appearance: none;
    margin-right: 15px;
  `,
  FormattedMessage: styled.p`
    margin: 0px;
  `,
  TooltipTitle: styled.p`
    margin: 0px;
    font-size: 0.85em;
  `,

  TooltipContent: styled.span`
    //font-family: 'Gagalin', sans-serif;
    //font-size: 1.5em;

    line-height: 1.4;
    text-align: center;
    padding: 10px; 10px;
  `
}

export default TooltipComponent
