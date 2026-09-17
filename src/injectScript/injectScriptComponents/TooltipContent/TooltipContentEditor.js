import axios from 'axios'
import ENV from '../../config.json'
import React, { useEffect, useRef, useState, Fragment } from 'react'
import Spinner from '../../injectScriptComponents/Spinner/Spinner.js'
import styled, { css, keyframes } from 'styled-components'
import { getStoryTheme } from '../../helpers.js'
import { isHoverGlowEnabled } from '../../themeHoverGlow.js'
import FooterButtons, { getFooterButtons } from '../../../constants/FooterButtons.js'
import ReCAPTCHA from 'react-google-recaptcha'
import Button from 'antd/es/button/index.js'
// Note: antd v6 uses CSS-in-JS, so style imports are not needed
// import 'antd/es/button/style'
import { CloseOutlined } from '@ant-design/icons'
import Colors from '../../../constants/mainColors.js'
import STEP_VIEW_TYPES from '../../../constants/StepViewTypes.js'
import POPUP_VIEW_TYPES from '../../../constants/PopupViewTypes.js'
import FormView from '../Form/FormView.js'
import '@fontsource/lexend/latin.css'

function TooltipContentEditor(props) {
  let {
    continuous,
    index,
    view,
    size,
    onBack,
    onNext,
    onSkip,
    themeBackgroundColor,
    themeTextColor,
    themeButtonBackgroundColor,
    themeButtonTextColor,
    themeOverlayBackgroundColor,
    liveDemo,
    textFontSize,
    iframeSize,
    addTooltipAnchor,
    forceUpdateVar,
    showFooter,
    showStepNumbers,
    onClick,
    isInEditor,
  } = props


  let hideFooter = true //step && step.hideFooter
  let nextButtonText = (view && view.nextButtonText) || 'Next'
  // let showStepNumbers = (view && view.showStepNumbers) || (view && view.showStepNumbers)

  let nextButtonTextString = (nextButtonText ? nextButtonText : 'Next')
  let stepNumbersString = (showStepNumbers ? `(${index + 1}/${size})` : '')

  let [isArrowShown, setIsArrowShown] = useState(false)

  let [pointerInfo, setPointerInfo] = useState(null)
  let [popperInstance, setPopperInstance] = useState(null)

  let arrowRef = useRef(null)


  function sendFormData(formId, fieldsObj) {
    let formBody = Object.values(fieldsObj).reduce((accum, fieldObj) => {
      accum[fieldObj.name] = fieldObj.value

      return accum
    }, {})

      return axios.post(`${ENV.STORIES_API || ENV.STORY_API}/leads/forms/${formId}`,
      formBody
      , {
        headers: {
          "livedemoSessionId": window.config.sessionId ? window.config.sessionId : ''
        }
      }
    ).then((res) => {

      return res.data
    })
  }

  // let showForm = false
  let showForm = !!(view && view.popup && view.popup.type === 'form' && view.popup.formId && view.popup.formId._id)
  let [fieldsObj, updateFieldsObj] = useState({})
  let [isLoading, setIsLoading] = useState(false)

  let recaptchaRef = useRef(null)

  let onNextHandlerClosure = (fieldsObj, recaptchaRef) => function (...args) {
    if (isInEditor) return


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


            return sendFormData((view && view.popup.formId &&  view.popup.formId._id), fieldsObj)
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



  let theme = getStoryTheme(liveDemo)
  let hoverGlow = isHoverGlowEnabled(theme)
  let useNextArrow = getFooterButtons(theme) === FooterButtons.nextArrow

  return <TC.WrapperInner
          $hoverGlow={hoverGlow}
          onClick={
            !showFooter &&
            view &&
            (view.viewType !== STEP_VIEW_TYPES.POPUP ||
              (view.viewType === STEP_VIEW_TYPES.POPUP && view.popup && view.popup.type !== POPUP_VIEW_TYPES.FORM)
            ) ? onClick : () => {}}
      >
      {hoverGlow ? (
        <TC.HoverGlow data-hover-glow aria-hidden="true" $color={themeBackgroundColor} />
      ) : null}

      <TC.EmptyHeader $addPadding={showForm}>
      </TC.EmptyHeader>



      <TC.ContentWrapper $scrollbarColor={themeOverlayBackgroundColor}>
        <Fragment>
          {showForm ?
            <Fragment>
              {isLoading ? (<TC.SpinnerWrapper><Spinner/></TC.SpinnerWrapper>) : (
                <TC.FormContainer>
                  <FormView
                    style={{}}
                    formData={view && view.popup && view.popup.formId}
                    onNextHandler={onNextHandlerClosure(fieldsObj, recaptchaRef)}
                    updateFieldsObj={updateFieldsObj}
                  />
                  {/*<TC.CaptchaNotice>This site is protected by reCAPTCHA and the Google*/}

                  {/*  <a href="https://policies.google.com/privacy">Privacy Policy</a> and*/}
                  {/*  <a href="https://policies.google.com/terms">Terms of Service</a> apply.*/}
                  {/*</TC.CaptchaNotice>*/}
                </TC.FormContainer>
              )}
              <TC.CaptchaWrapper>
                <TC.ReCAPTCHA
                  ref={recaptchaRef}
                  badge={'inline'}
                  sitekey={ENV.CAPTCHA_SITE_KEY || ''}
                  size="invisible"
                />
              </TC.CaptchaWrapper>


            </Fragment>
            : (
              <TC.TooltipContent
                $themeTextColor={themeTextColor}
                $textFontSize={textFontSize}
                dangerouslySetInnerHTML={{ __html: `<span>${(view && view.content) || (view && view.content)}</span>` }}></TC.TooltipContent>
            )}
        </Fragment>
      </TC.ContentWrapper>

      {showFooter ? (
      useNextArrow ? (
        <TC.TooltipFooter $nextArrow>
          {continuous && (
            <TC.NextArrow
              type="button"
              aria-label="Next step"
              onClick={onNextHandlerClosure(fieldsObj, recaptchaRef)}
            >
              <TC.NextArrowTrack>
                <TC.NextArrowSlide>
                  <svg viewBox="0 0 24 24" fill="none" width="1.125em" height="1.125em">
                    <path d="M19 12H5M14 17l5-5M14 7l5 5" stroke="currentColor" strokeWidth="0.125rem" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </TC.NextArrowSlide>
                <TC.NextArrowSlide $hidden aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                    <path d="M4.5 4.566c0-1.562 1.71-2.52 3.043-1.706l12.164 7.433c1.277.78 1.277 2.634 0 3.414L7.543 21.14c-1.333.815-3.043-.144-3.043-1.706V4.566Z" />
                  </svg>
                </TC.NextArrowSlide>
              </TC.NextArrowTrack>
            </TC.NextArrow>
          )}
        </TC.TooltipFooter>
      ) : (
      <TC.TooltipFooter>
          <Fragment>
            <TC.LeftButtonsWrapper>
              {/*<TC.SkipButton onClick={onSkip}>*/}
              {/*  <TC.FormattedMessage id="close">*/}
              {/*    Skip*/}
              {/*  </TC.FormattedMessage>*/}
              {/*</TC.SkipButton>*/}
            </TC.LeftButtonsWrapper>
            <TC.RightButtonsWrapper>
              {index > 0 && !view.hideBackButton && (
                <TC.BackButton
                  className={'TooltipContent__Button'}
                  $themeBackgroundColor={themeBackgroundColor}
                  $themeTextColor={themeTextColor}
                  onClick={onBack}>
                  <TC.FormattedMessage id="back">
                    Back
                  </TC.FormattedMessage>
                </TC.BackButton>
              )}
              {continuous && (
                <TC.NextButton
                  className={'TooltipContent__Button'}
                  $themeBackgroundColor={themeBackgroundColor}
                  $themeTextColor={themeTextColor}
                  $themeButtonBackgroundColor={themeButtonBackgroundColor}
                  $themeButtonTextColor={themeButtonTextColor}
                  onClick={onNextHandlerClosure(fieldsObj, recaptchaRef)}>
                  <TC.FormattedMessage id="next">
                    {nextButtonTextString + " " + stepNumbersString}
                  </TC.FormattedMessage>
                </TC.NextButton>
              )}
            </TC.RightButtonsWrapper>
          </Fragment>


      </TC.TooltipFooter>
      )
      ) : (
        <TC.EmptyFooter $addPadding={showForm}>
        </TC.EmptyFooter>
      )}
    </TC.WrapperInner>



}

function getBoxShadow(themeColor) {
  return `${themeColor}66 -5px 5px, ${themeColor}4D  -10px 10px, ${themeColor}33 -15px 15px, ${themeColor}1A -20px 20px, ${themeColor}0D -25px 25px;`
}

const pulseHover = keyframes`
  from { box-shadow: 0 0 0 0 currentColor; }
  to { box-shadow: 0 0 0 10px currentColor; }
`

const animScale = keyframes`
  from { width: 2.25em; }
  to { width: 3em; }
`

const TC = {
  Arrow: styled.div`
    display: ${({$isArrowShown}) => $isArrowShown ? 'block' : 'none'} !important;
    //display: none;
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
    // max-height: 200px;
    display: block;
    font-size: 1.4vw;
    
    padding: 15px 20px;

    @media (min-width: 1200px) {
        // max-height: 240px;
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
      background-color: ${({$scrollbarColor}) => $scrollbarColor};
    }


  `,
  FormContainer: styled.div`
  `,
  IntermidateDragger: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 100%;
    width: 400px;
    padding: 50px;

    z-index: 3;

    position: fixed;

  `,
  DraggerWrapper: styled.div`
    transition: ${({$isMoving}) => $isMoving ? 'none' : '0.4s all ease-in-out'};
  `,
  HoverGlow: styled.div`
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: -1;
    opacity: 0.3;
    background: ${({ $color }) => $color};
    color: ${({ $color }) => $color};
  `,
  WrapperInner: styled.div`
    position: relative;
    overflow: visible;
    z-index: 0;
    border-radius: 5px;
    ${({ $hoverGlow }) => $hoverGlow && css`
      &:hover > [data-hover-glow] {
        animation: ${pulseHover} 1s cubic-bezier(0.4, 0, 0.6, 1) forwards;
      }
    `}
  `,
  Wrapper: styled.div`
    transition: 0.5s all ease-out;

    transform-origin: top left;

    font-size: 1.5vw;
    font-family: var(--ld-demo-font, ${Colors.fontFamilyApple});
    //width: 29vw;
    width: 100%;
    height: auto;

    //padding: 15px 24px;

    // && p {
    //   font-size: 1.5vw;
    //   font-family: ${Colors.fontFamilyApple};
    //   margin: 0px;
    // }

    background: ${({$themeBackgroundColor}) => $themeBackgroundColor};
    border-radius: 5px;
    box-sizing: border-box;
    color: ${({$themeTextColor}) => $themeTextColor};
    border: 1px solid ${({$themeBackgroundColor}) => $themeBackgroundColor};

    #arrow,
    #arrow::before {
      position: absolute;
      width: 18px;
      height: 18px;
      background: ${({$themeBackgroundColor}) => $themeBackgroundColor};
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
      //bottom: -9px;
    }

    &&[data-popper-placement^='bottom'] > #arrow {
      //top: -9px;
      background: linear-gradient(45deg, rgba(2,0,36,0) 50%, ${({$arrowColor}) => $arrowColor} 51%, ${({$arrowColor}) => $arrowColor} 100%);
    }

    &&[data-popper-placement^='left'] > #arrow {
      //right: -9px;
      background: linear-gradient(45deg, rgba(2,0,36,0) 50%, ${({$arrowColor}) => $arrowColor} 51%, ${({$arrowColor}) => $arrowColor} 100%);
    }

    &&[data-popper-placement^='right'] > #arrow {
      //left: -9px;
      background: linear-gradient(45deg, ${({$arrowColor}) => $arrowColor} 50%, rgba(2,0,36,0) 51%, rgba(2,0,36,0) 100%);
    }


    &&[data-popper-placement^='bottom'] > #arrow:before {
      background: linear-gradient(135deg, rgba(2,0,36,0) 50%, ${({$arrowColor}) => $arrowColor} 51%, ${({$arrowColor}) => $arrowColor} 100%);
    }

    &&[data-popper-placement^='top'] > #arrow:before {
      background: linear-gradient(-45deg, rgba(2,0,36,0) 50%, ${({$arrowColor}) => $arrowColor} 51%, ${({$arrowColor}) => $arrowColor} 100%);
    }

    &&[data-popper-placement^='right'] > #arrow:before {
      background: linear-gradient(45deg, rgba(2,0,36,0) 50%, ${({$arrowColor}) => $arrowColor} 51%, ${({$arrowColor}) => $arrowColor} 100%);
    }

    &&[data-popper-placement^='left'] > #arrow:before {
      background: linear-gradient(45deg, ${({$arrowColor}) => $arrowColor} 50%, rgba(2,0,36,0) 51%, rgba(2,0,36,0) 100%);
    }


  `,
  EmptyHeader: styled.div`
    width: 100%;
    padding-top: ${({$addPadding}) => $addPadding ? 20 : 0}px;
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
      fill: #f9f9f9;
    }
  `,

  LeftButtonsWrapper: styled.span`

  `,
  RightButtonsWrapper: styled.span`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
    white-space: nowrap;
  `,
  NextArrow: styled.button`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 3em;
    height: 2.25em;
    padding: 0;
    border: 0;
    border-radius: 0.5em;
    cursor: pointer;
    flex-shrink: 0;
    overflow: hidden;
    background: #fff;
    color: #18181b;
    will-change: width;
    animation: ${animScale} 1s cubic-bezier(0.6, 0.6, 0, 1) infinite alternate;
  `,
  NextArrowTrack: styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  `,
  NextArrowSlide: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    flex-shrink: 0;
    opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  `,
  TooltipFooter: styled.div`
    align-items: center;
    display: flex;
    flex-wrap: nowrap;
    justify-content: ${({ $nextArrow }) => $nextArrow ? 'flex-start' : 'flex-end'};
    margin-top: 5px;
    width: max-content;
    min-width: 100%;
    box-sizing: border-box;

    padding: 5px 15px 15px 15px;


    && .TooltipContent__Button {

    font-size: 1rem;
    line-height: 1;
    padding: 8px;
    appearance: none;
    margin: 0;
    font-weight: 600;
    flex-shrink: 0;
    white-space: nowrap;


    }
  `,
  EmptyFooter: styled.div`
    padding-bottom: ${({$addPadding}) => $addPadding ? 45 : 0}px;
  `,
  SkipButton: styled.button`
    background-color: transparent;
    border: 0px;
    border-radius: 0px;
    color: ${({$themeTextColor}) => $themeTextColor};
    cursor: pointer;
    font-size: 1.4vw;
    line-height: 1;
    padding: 8px;
    appearance: none;
    margin-left: auto;
    margin-right: 5px;

    @media (max-width: 640px) {
      display: none;
    }

  `,
  BackButton: styled.button`
    background-color: transparent;
    border: 0px;
    border-radius: 0px;
    color: ${({$themeTextColor}) => $themeTextColor};

    cursor: pointer;
    font-size: 1.4vw;
    line-height: 1;
    padding: 8px;
    appearance: none;
    margin: 0;
    font-weight: 600;
    flex-shrink: 0;
    white-space: nowrap;
    font-family: var(--ld-demo-font, inherit);

  `,
  TooltipButton: styled(Button)`

  `,
  NextButton: styled.button`
    background-color: ${({$themeButtonBackgroundColor}) => $themeButtonBackgroundColor};
    border: 0px;
    border-radius: 4px;
    color: ${({$themeButtonTextColor}) => $themeButtonTextColor};

    cursor: pointer;
    font-size: 1.4vw;
    line-height: 1;
    padding: 8px;
    appearance: none;
    //margin-right: 15px;
    font-weight: 600;
    font-family: var(--ld-demo-font, inherit);

  `,
  FormattedMessage: styled.p`
    margin: 0px;
  `,
  TooltipTitle: styled.p`
    margin: 0px;
    font-size: 0.85em;
  `,

  TooltipContent: styled.span`
    && span,
    && p {
      -webkit-font-smoothing: antialiased !important;
      -webkit-backface-visibility: hidden !important;
      backface-visibility: hidden !important;
      transform: translate3d(0, 0, 0) !important;
    }

    && p {
      font-weight: 500;
      font-family: var(--ld-demo-font, ${Colors.fontFamilyRobotoMono});
      overflow-wrap: break-word;
      margin: 0px;

      font-style: normal;
      font-display: swap;
      letter-spacing: 0.01em;
      
      max-width: 250px;
      width: max-content;


      font-size: ${({$textFontSize}) => $textFontSize};



      //@media (max-width: 1040px) {
      //  font-size: 14px;
      //}
      //
      //@media (max-width: 540px) {
      //  font-size: 2.7vw;
      //}
      //
      //
      //@media (min-width: 1040px) {
      //  font-size: 1.1vw;
      //}
    }

    color: ${({$themeTextColor}) => $themeTextColor};
    height: 100%;

    //max-width: 250px;
    //max-width: 29vw;
    max-width: 250px;
    width: max-content;

    && ul,
    && ol {
      padding-left: 15px;
    }
  `
}


export default TooltipContentEditor
