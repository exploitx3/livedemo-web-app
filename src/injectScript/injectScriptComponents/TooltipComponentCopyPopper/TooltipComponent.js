import axios from 'axios'
import ENV from '../config.json'
import React, { useEffect, useRef, useState } from 'react'
import NoProfileImage from '../../../../assets/noProfilePicture2.svg'
import Spinner from '../../../injectScriptComponents/components/Spinner/Spinner.js'
import styled from 'styled-components'
import ReCAPTCHA from 'react-google-recaptcha'
import { Button } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import Colors from '../../../constants/mainColors.js'
import FormView from '../Form/FormView.js'
import { createPopper } from '@popperjs/core'
import { waitForElement } from '../../helpers.js'
import Draggable from 'react-draggable'

function TooltipComponent(props) {
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
    iframeSize
  } = props



  let width = iframeSize && iframeSize.width ? iframeSize.width : '100%'
  let height = iframeSize && iframeSize.height ? iframeSize.height : '100%'

  let innerWidth = window.innerWidth
  let innerHeight = window.innerHeight

  let scalePercentage = innerWidth / width

  let additionalStyles = !(iframeSize && iframeSize.width) ? {} : {
    transformOrigin: 'top left',
    transform: `scale(${scalePercentage})`
  }


  let customHeader = (storyDemo.custom && storyDemo.custom.header) || {}
  let hideFooter = step.hideFooter
  let nextButtonText = step.view.nextButtonText
  let showStepNumbers = step.view.showStepNumbers === undefined ? true : !!step.view.showStepNumbers

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



  useEffect(() => {

    if (step.view.viewType === 'Pointer') {
      // document.querySelector(step.view.selector).style['z-index'] = "99999999";
      let targetSelector = step.view.selector

      waitForElement(targetSelector, 300, 20)
        .then((targetElement) => {

          targetElement.scrollIntoView({behavior: "auto", block: "end", inline: "nearest"})


          let selector = step.view.selector
          let placement = step.view.placement || 'auto'

          setPointerInfo({
            enabled: true,
            targetElement: targetElement,
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
    phase: 'beforeRead',
    fn({ state }) {
      // state.rects.reference.x = state.rects.reference.x * 0.6
      // state.rects.reference.y = state.rects.reference.y * 0.6
      // state.elements.popper.style.transform = state.elements.popper.style.transform + ' scale(0.6)'

      // wrapperRef.current.style.transform = wrapperRef.current.style.transform + ` scale(${innerWidth / width})`

      // state.rects.popper.width = state.rects.popper.width * 0.6
      // state.rects.popper.height = state.rects.popper.height * 0.6
      // console.log(state)
    },
  }

  const scaleModifierWrite = {
    name: 'scaleModifierWrite',
    enabled: true,
    phase: 'beforeWrite',
    fn({ state }) {
      // state.rects.reference.x = state.rects.reference.x * 0.6
      // state.rects.reference.y = state.rects.reference.y * 0.6


      // state.rects.popper.width = state.rects.popper.width * 0.6
      // state.rects.popper.height = state.rects.popper.height * 0.6

      let origWidth = state.rects.popper.width
      let widthDifference = origWidth - (origWidth * scalePercentage)

      let origHeight = state.rects.popper.height
      let heightDifference = origHeight - (origHeight * scalePercentage)

      let myRegexp = new RegExp('^translate\\((?<x>[\\d\\-]+)([\\w\\W]+),[ ]?(?<y>[\\d\\-]+)([\\w\\W]+)$', 'g')
      let tranformParsed = myRegexp.exec(state.styles.popper.transform)

      let transformX = ((parseInt(tranformParsed[1])))
      let transformY = ((parseInt(tranformParsed[3])))

      let newTransform = `translate(${transformX}px, ${transformY}px)`

      // state.styles.popper.transform = newTransform
      state.styles.popper.transform = newTransform + ` scale(${scalePercentage})`

      // console.log(state)
    },
  }


  useEffect(() => {
    if(pointerInfo && pointerInfo.enabled && wrapperRef.current) {

      let arrowElem = document.getElementById('arrow')
      let popperInstance = createPopper(pointerInfo.targetElement, wrapperRef.current, {
        placement: pointerInfo.placement,
        modifiers: [
          {
            name: 'flip',
            enabled: true,
          },
          // scaleModifier,
          {
            name: 'offset',
            options: {
              // offset: [0, pointerInfo.targetElement.clientHeight + 20],
              offset: [0, 60],
            },
          },
          {
            name: 'arrow',
            options: {
              element: arrowElem,
              padding: 5, // 5px from the edges of the popper
            }
          }


        ]
      })

      popperInstance.update()

      setIsArrowShown(true)
      setPopperInstance(popperInstance)

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

  let showForm = !!(step.view.viewType === 'Form' && step.view.formId && step.view.formId._id)
  let [fieldsObj, updateFieldsObj] = useState({})
  let [isLoading, setIsLoading] = useState(false)

  let recaptchaRef = useRef(null)

  let onNextHandlerClosure = (fieldsObj, recaptchaRef) => function (...args) {


    let promise = Promise.resolve()
    if (showForm) {
      promise = promise.then(() => {

        // console.log(Object.entries(fieldsObj))
        setIsLoading(true)

        return recaptchaRef.current.executeAsync()
          .then(captchaToken => {
            recaptchaRef.current.reset()

            fieldsObj['captchaToken'] = {
              name: 'captchaToken',
              value: captchaToken
            }


            return sendFormData(step.view.formId._id, fieldsObj)
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
    const { clientWidth, clientHeight } = window.document.documentElement;

    // let mainElem = document.getElementById('main')

    // const targetRect = mainElem.getBoundingClientRect();
    const targetRect = wrapperRef.current.getBoundingClientRect();
    setDragBounds({
        left: -targetRect.left + uiData.x,
        right: clientWidth - (targetRect.right - uiData.x),
        top: -targetRect.top + uiData.y,
        bottom: clientHeight - (targetRect.bottom - uiData.y)
      })


  }

  return  <Draggable
    disabled={dragDisabled}
    bounds={dragBounds}
    onStart={(event, uiData) => onDragStart(event, uiData)}
  >
    <TC.IntermidateDragger
      scalePercentage={scalePercentage}
      isMoving={!dragDisabled}

    >
      <TC.DraggerWrapper
        isMoving={!dragDisabled}
        scalePercentage={scalePercentage}
      >
        <TC.Wrapper
          id={'tooltip'}
          ref={wrapperRef}
          isMoving={!dragDisabled}
          themeColor={themeColor}
          // additionalStyles={additionalStyles}

        >
          <TC.WrapperInner
            // additionalStyles={additionalStyles}
          >

            <TC.HeaderWrapper
              isMovable={step.view.viewType !== 'Pointer'}
              isActive={customHeader.isActive}
              onMouseOver={() => {
                if (dragDisabled && step.view.viewType !== 'Pointer') {
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
              }} type="close"/>
            </TC.HeaderWrapper>


            <TC.ContentWrapper>
              <React.Fragment>
                {showForm ?
                  <React.Fragment>
                    {isLoading ? (<TC.SpinnerWrapper><Spinner/></TC.SpinnerWrapper>) : (
                      <React.Fragment>
                        <FormView formData={step.view.formId}
                                  onNextHandler={onNextHandlerClosure(fieldsObj, recaptchaRef)}
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
                  : (
                    <TC.TooltipContent
                      dangerouslySetInnerHTML={{ __html: `<span>${step.view.content}</span>` }}></TC.TooltipContent>
                  )}
              </React.Fragment>
            </TC.ContentWrapper>


            <TC.TooltipFooter>
              {hideFooter ? '' : (
                <React.Fragment>
                  <TC.LeftButtonsWrapper>

                    <TC.SkipButton onClick={onSkip}>
                      <TC.FormattedMessage id="close">
                        Skip
                      </TC.FormattedMessage>
                    </TC.SkipButton>

                  </TC.LeftButtonsWrapper>
                  <TC.RightButtonsWrapper>
                    {index > 0 && (
                      <TC.BackButton
                        themeColor={themeColor}

                        onClick={onBack}>
                        <TC.FormattedMessage id="back">
                          Back
                        </TC.FormattedMessage>
                      </TC.BackButton>
                    )}
                    {continuous && (
                      <TC.NextButton
                        themeColor={themeColor}
                        onClick={onNextHandlerClosure(fieldsObj, recaptchaRef)}>
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
          <TC.Arrow isArrowShown={isArrowShown} id={'arrow'} data-popper-arrow></TC.Arrow>
        </TC.Wrapper>
      </TC.DraggerWrapper>

    </TC.IntermidateDragger>

  </Draggable>


}

function getBoxShadow(themeColor) {
  return `${themeColor}66 -5px 5px, ${themeColor}4D  -10px 10px, ${themeColor}33 -15px 15px, ${themeColor}1A -20px 20px, ${themeColor}0D -25px 25px;`
}

const TC = {
  Arrow: styled.div`
    display: ${({isArrowShown}) => isArrowShown ? 'block' : 'none'} !important;
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
    //
    //top: 50%;
    //left: 50%;

    max-width: 100%;
    width: 400px;
    padding: 50px;

    //border: 1px solid black;

    transition: ${({isMoving}) => isMoving ? 'none' : '0.4s all ease-in-out'};

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
    transition: ${({isMoving}) => isMoving ? 'none' : '0.4s all ease-in-out'};


    //
    //
    //top: 50%;
    //left: 50%;

    width: 450px;
    height: auto;

    background: #f8f8f8;
    border-radius: 5px;
    box-sizing: border-box;
    color: rgb(51, 51, 51);
    font-size: 16px;
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
    font-size: 14.5px;
    font-family: monospace;
    //color: rgb(104, 104, 104);
    font-weight: 550;

    @media (max-width: 1040px) {
      font-size: 12px;
    }

    @media (max-width: 540px) {
      font-size: 2.4vw;
    }


    @media (min-width: 1040px) {
      font-size: 1.1vw;
    }

  `,
  ProfileText: styled.p`
    margin: 0px 0px 0px 16px;
    font-size: 14px;
    font-family: monospace;
    font-weight: 550;

    @media (max-width: 1040px) {
      font-size: 12px;
    }

    @media (max-width: 540px) {
      font-size: 2.4vw;
    }


    @media (min-width: 1040px) {
      font-size: 1.1vw;
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

    padding: 15px 25px;
  `,
  SkipButton: styled.button`
    background-color: transparent;
    border: 0px;
    border-radius: 0px;
    color: ${Colors.primaryText};
    cursor: pointer;
    font-size: 14px;
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
    color: ${(props) => props.themeColor};
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 8px;
    appearance: none;
    margin-left: auto;
    margin-right: 5px;

  `,
  TooltipButton: styled(Button)`

  `,
  NextButton: styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'themeColor',
  })`
    background-color: ${(props) => props.themeColor};
    border: 0px;
    border-radius: 4px;
    color: rgb(255, 255, 255);
    cursor: pointer;
    font-size: 16px;
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
    font-size: 1.2em;
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
