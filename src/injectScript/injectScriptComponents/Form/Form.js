import React, {useRef, useState, forwardRef} from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
import {Button} from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import axios from "axios";
import ENV from "../../config.json";
import FormView from "./FormView.js";
import ReCAPTCHAModule from "react-google-recaptcha";
import Spinner from "../Spinner/Spinner.js";
import { getFormSubmitIssue } from '../../helpers.js'

// Ensure we get the actual component (handle both default and named exports)
const ReCAPTCHA = ReCAPTCHAModule?.default || ReCAPTCHAModule

function Form({
                  step,
                  onNext,
                  onBack,
                  changeToScreen,
                  liveDemo,
                  size,
                  wrapperWidth,
                  themeBackgroundColor,
                  themeTextColor,
                  themeButtonBackgroundColor,
                  themeButtonTextColor,
                  themeOverlayBackgroundColor
              }) {

    let formDoc = step.view && step.view.popup && step.view.popup.formId
    let showForm = !!(step.view && step.view.viewType === 'popup' && step.view.popup.type === 'form' && formDoc && formDoc._id)

    let [fieldsObj, updateFieldsObj] = useState({})

    let formDataInternal = formDoc
    let popupTitle = (step.view.popup && step.view.popup.title) || ''
    let popupDescription = (step.view.popup && step.view.popup.description) || ''
    let popupButtons = (step.view.popup && step.view.popup.buttons) || []
    // Same gate as popup content: hide preview image on very narrow viewports
    let showPreviewImage = !!(step.view.popup && step.view.popup.showPreviewImage)
      && (wrapperWidth === undefined || wrapperWidth >= 540)
    let previewImageUrl = (step.view.popup && step.view.popup.previewImageUrl) || ''
    let hasPreviewLayout = !!(showPreviewImage && previewImageUrl)
    const ALIGNMENT_MAP = {
        left: 'start',
        right: 'end',
        center: 'center',
    }
    let rawAlignment = (step.view.popup && step.view.popup.alignment) || 'center'
    let alignment = ALIGNMENT_MAP[rawAlignment] || 'center'
    // Left/right need full-bleed shell (same as preview) or the ~400px card stays centered
    let hasFullLayout = hasPreviewLayout || rawAlignment === 'left' || rawAlignment === 'right'

    let titleFontSize = '2.2vw'
    let textFontSize = '1.7vw'
    let buttonFontSize = '2vw'
    if (wrapperWidth <= 1040) {
        titleFontSize = '4vw'
        textFontSize = '2.7vw'
        buttonFontSize = '2.5vw'
    } else if (wrapperWidth > 1040) {
        titleFontSize = '3.5vw'
        textFontSize = '1.6vw'
        buttonFontSize = '2vw'
    }
    if (wrapperWidth < 540) {
        titleFontSize = '5.5vw'
        textFontSize = '3.5vw'
        buttonFontSize = '4vw'
    }

    // Existing forms may have no buttons yet — keep a Next so submit still works
    if (!popupButtons.length) {
        popupButtons = [{
            index: 0,
            text: 'Next',
            gotoType: 'next',
            textColor: themeButtonTextColor || '#FFFFFF',
            backgroundColor: themeButtonBackgroundColor || '#1070ff',
        }]
    }
    let useCaptcha = !!(formDataInternal && formDataInternal.useCaptcha)
    // Missing on old forms → show labels (same as schema default true)
    let showTopLabels = !(formDataInternal && formDataInternal.showTopLabels === false)
    // Missing on old forms → show background (same as schema default true)
    let showBackground = !(formDataInternal && formDataInternal.showBackground === false)
    let [isLoading, setIsLoading] = useState(false)
    let [submitError, setSubmitError] = useState(null)
    let [invalidFieldNames, setInvalidFieldNames] = useState([])

    let recaptchaRef = useRef(null)

    function sendFormData(formId, currentFieldsObj) {
        let formBody = Object.values(currentFieldsObj).reduce((accum, fieldObj) => {
            accum[fieldObj.name] = fieldObj.value

            return accum
        }, {})

        return axios.post(`${ENV.STORIES_API}/leads/forms/${formId}`,
            formBody
        ).then((res) => {

            return res.data
        })
    }

    /** Validate + captcha + POST lead. Does not run button navigation. */
    function submitFormLead(formData, currentFieldsObj) {
        let promise = Promise.resolve()

        if (showForm) {
            promise = promise.then(() => {
                let issue = getFormSubmitIssue(formData, currentFieldsObj)
                if (issue) {
                    setSubmitError(issue.message)
                    setInvalidFieldNames(issue.invalidNames)
                    let validationError = new Error(issue.message)
                    validationError.isFormValidation = true
                    return Promise.reject(validationError)
                }

                setSubmitError(null)
                setInvalidFieldNames([])
                setIsLoading(true)

                if (useCaptcha) {
                    return recaptchaRef.current.executeAsync()
                        .then(captchaToken => {
                            recaptchaRef.current.reset()

                            currentFieldsObj['captchaToken'] = {
                                name: 'captchaToken',
                                value: captchaToken
                            }

                            return sendFormData(formData._id, currentFieldsObj)
                        })
                }

                return sendFormData(formData._id, currentFieldsObj)
            })
        }

        return promise
            .then((result) => {
                setIsLoading(false)
                setSubmitError(null)
                setInvalidFieldNames([])
                return result
            })
            .catch((error) => {
                setIsLoading(false)
                if (!(error && error.isFormValidation) && showForm) {
                    setSubmitError('Could not submit the form. Please check your answers and try again.')
                }
                return Promise.reject(error)
            })
    }

    function runConfiguredButtonAction(popupButton, ...args) {
        let gotoType = (popupButton && popupButton.gotoType) || 'next'

        if (gotoType === 'screen' && changeToScreen && popupButton.gotoScreen) {
            return changeToScreen(popupButton.gotoScreen)
        }

        if (gotoType === 'website' && popupButton.gotoWebsite) {
            window.open(popupButton.gotoWebsite, '_blank')
            return
        }

        return onNext(...args)
    }

    /** Any form button: validate/submit first, then configured goto action. */
    function handleButtonClick(popupButton) {
        return submitFormLead(formDataInternal, fieldsObj)
            .then(() => runConfiguredButtonAction(popupButton))
            .catch((error) => {
                if (error && error.isFormValidation) {
                    return
                }
            })
    }

    /** Enter / form submit acts like a Next button. */
    function handleFormSubmit(...args) {
        return submitFormLead(formDataInternal, fieldsObj)
            .then(() => onNext(...args))
            .catch((error) => {
                if (error && error.isFormValidation) {
                    return
                }
            })
    }

    function handleFieldsObjUpdate(nextFieldsObj) {
        updateFieldsObj(nextFieldsObj)
        if (submitError || invalidFieldNames.length) {
            setSubmitError(null)
            setInvalidFieldNames([])
        }
    }

    return <F.Wrapper themeBackgroundColor={themeBackgroundColor}
                      arrowColor={themeBackgroundColor}
                      hasPreviewLayout={hasFullLayout}
    >
        <F.WrapperInner hasPreviewLayout={hasFullLayout}>
            <F.ContentWrapper hasPreviewLayout={hasFullLayout}>
                {isLoading ? (<F.SpinnerWrapper><Spinner/></F.SpinnerWrapper>) : (
                    <React.Fragment>
                        <FormView formData={formDataInternal}
                                  onNextHandler={handleFormSubmit}
                                  onButtonClick={handleButtonClick}
                                  themeTextColor={themeTextColor}
                                  themeBackgroundColor={themeBackgroundColor}
                                  updateFieldsObj={handleFieldsObjUpdate}
                                  showTopLabels={showTopLabels}
                                  showBackground={showBackground}
                                  invalidFieldNames={invalidFieldNames}
                                  title={popupTitle}
                                  description={popupDescription}
                                  buttons={popupButtons}
                                  changeToScreen={changeToScreen}
                                  liveDemo={liveDemo}
                                  submitError={submitError}
                                  showPreviewImage={showPreviewImage}
                                  previewImageUrl={previewImageUrl}
                                  alignment={alignment}
                                  rawAlignment={rawAlignment}
                                  titleFontSize={titleFontSize}
                                  textFontSize={textFontSize}
                                  buttonFontSize={buttonFontSize}
                        />
                        {/*<F.CaptchaNotice>This site is protected by reCAPTCHA and the Google*/}

                        {/*  <a href="https://policies.google.com/privacy">Privacy Policy</a> and*/}
                        {/*  <a href="https://policies.google.com/terms">Terms of Service</a> apply.*/}
                        {/*</F.CaptchaNotice>*/}
                    </React.Fragment>
                )}
                {useCaptcha && (
                    <F.CaptchaWrapper>
                        <F.ReCAPTCHA
                            ref={recaptchaRef}
                            badge={'inline'}
                            sitekey={ENV.CAPTCHA_SITE_KEY}
                            size="invisible"
                        />
                    </F.CaptchaWrapper>
                )}
            </F.ContentWrapper>
            {useCaptcha && !hasPreviewLayout ? (
                <F.EmptyFooter addPadding={showForm && useCaptcha} />
            ) : null}
        </F.WrapperInner>
    </F.Wrapper>


}

const F = {
    Arrow: styled.div`
        display: ${({isArrowShown}) => isArrowShown ? 'block' : 'none'} !important;
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
    ContentWrapper: styled.div.withConfig({
        shouldForwardProp: (prop) => prop !== 'hasPreviewLayout',
    })`
        width: 100%;
        overflow-y: ${({ hasPreviewLayout }) => (hasPreviewLayout ? 'hidden' : 'auto')};
        overflow-x: hidden;
        display: block;
        flex: 1 1 auto;
        min-height: 0;
        height: ${({ hasPreviewLayout }) => (hasPreviewLayout ? '100%' : 'auto')};
        max-height: ${({ hasPreviewLayout }) => (hasPreviewLayout ? 'none' : 'min(58vh, 520px)')};
        font-size: clamp(13px, 1.35vw, 16px);
        padding: ${({ hasPreviewLayout }) => (hasPreviewLayout ? '0' : '4px 16px 8px')};

        @media (max-width: 640px) {
            max-height: ${({ hasPreviewLayout }) => (hasPreviewLayout ? 'none' : 'min(62vh, 460px)')};
            padding: ${({ hasPreviewLayout }) => (hasPreviewLayout ? '0' : '4px 12px 8px')};
        }

        @media (max-height: 560px) {
            max-height: ${({ hasPreviewLayout }) => (hasPreviewLayout ? 'none' : 'min(48vh, 320px)')};
        }

        @media (max-height: 420px) {
            max-height: ${({ hasPreviewLayout }) => (hasPreviewLayout ? 'none' : 'min(42vh, 240px)')};
        }

        &&::-webkit-scrollbar-track {
            border-radius: 10px;
            background-color: transparent;
        }

        &&::-webkit-scrollbar {
            width: 4px;
            background-color: transparent;
        }

        &&::-webkit-scrollbar-thumb {
            border-radius: 10px;
            background-color: rgba(255, 255, 255, 0.35);
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
        transition: ${({isMoving}) => isMoving ? 'none' : '0.4s all ease-in-out'};


    `,
    WrapperInner: styled.div.withConfig({
        shouldForwardProp: (prop) => prop !== 'hasPreviewLayout',
    })`
        display: flex;
        flex-direction: column;
        min-height: 0;
        max-height: inherit;
        width: 100%;
        height: ${({ hasPreviewLayout }) => (hasPreviewLayout ? '100%' : 'auto')};
    `,
    Wrapper: styled.div.withConfig({
        shouldForwardProp: (prop) => !['themeBackgroundColor', 'themeTextColor', 'arrowColor', 'hasPreviewLayout'].includes(prop),
    })`
        transition: 0.5s all ease-out;

        transform-origin: top left;

        font-size: clamp(13px, 1.5vw, 16px);
        font-family: ${Colors.fontFamilyApple};
        min-width: ${({ hasPreviewLayout }) => (hasPreviewLayout ? '100%' : 'min(300px, 92vw)')};
        max-width: ${({ hasPreviewLayout }) => (hasPreviewLayout ? 'none' : 'min(440px, 94vw)')};
        width: ${({ hasPreviewLayout }) => (hasPreviewLayout ? '100%' : 'min(400px, 92vw)')};
        height: ${({ hasPreviewLayout }) => (hasPreviewLayout ? '100%' : 'auto')};
        max-height: ${({ hasPreviewLayout }) => (hasPreviewLayout ? 'none' : 'min(90vh, 720px)')};
        display: flex;
        flex-direction: column;
        min-height: 0;

        /* Background lives on FormPanel only — shell stays transparent */
        padding: 0;
        background: transparent;
        border-radius: 0;
        box-sizing: border-box;
        color: ${({themeTextColor}) => themeTextColor};
        border: 1px solid transparent;
        overflow: ${({ hasPreviewLayout }) => (hasPreviewLayout ? 'hidden' : 'auto')};

        #arrow,
        #arrow::before {
            position: absolute;
            width: 18px;
            height: 18px;
            background: ${({themeBackgroundColor}) => themeBackgroundColor};
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
            background: linear-gradient(45deg, rgba(2, 0, 36, 0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
        }

        &&[data-popper-placement^='left'] > #arrow {
            //right: -9px;
            background: linear-gradient(45deg, rgba(2, 0, 36, 0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
        }

        &&[data-popper-placement^='right'] > #arrow {
            //left: -9px;
            background: linear-gradient(45deg, ${({arrowColor}) => arrowColor} 50%, rgba(2, 0, 36, 0) 51%, rgba(2, 0, 36, 0) 100%);
        }


        &&[data-popper-placement^='bottom'] > #arrow:before {
            background: linear-gradient(135deg, rgba(2, 0, 36, 0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
        }

        &&[data-popper-placement^='top'] > #arrow:before {
            background: linear-gradient(-45deg, rgba(2, 0, 36, 0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
        }

        &&[data-popper-placement^='right'] > #arrow:before {
            background: linear-gradient(45deg, rgba(2, 0, 36, 0) 50%, ${({arrowColor}) => arrowColor} 51%, ${({arrowColor}) => arrowColor} 100%);
        }

        &&[data-popper-placement^='left'] > #arrow:before {
            background: linear-gradient(45deg, ${({arrowColor}) => arrowColor} 50%, rgba(2, 0, 36, 0) 51%, rgba(2, 0, 36, 0) 100%);
        }


    `,
    HeaderWrapper: styled.div.withConfig({
        shouldForwardProp: (prop) => !['isMovable', 'isActive'].includes(prop),
    })`
        cursor: ${({isMovable}) => isMovable ? 'move' : 'auto'};

        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        height: ${(props) => props.isActive ? '85px' : '34px'};
        padding: 20px;
        position: relative;

    `,
    EmptyHeader: styled.div`
        width: 100%;
        padding-top: ${({addPadding}) => addPadding ? 20 : 0}px;

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

        @media (max-width: 1040px) {
            width: 51px;
            height: 51px;
        }

        @media (max-width: 540px) {
            width: 51px;
            height: 51px;
        }


        @media (min-width: 1040px) {
            width: 58px;
            height: 58px;
        }
    `,
    ProfileName: styled.p`
        color: ${({themeTextColor}) => themeTextColor};
        display: inline-block;
        margin: 0px;
        font-family: monospace;
        font-weight: 550;
        font-size: 0.85rem;



    `,
    ProfileText: styled.p`
        margin: 0px 0px 0px 16px;

        font-family: monospace;
        font-weight: 550;
        font-size: 0.75rem;


    `,

    LeftButtonsWrapper: styled.span`

    `,
    RightButtonsWrapper: styled.span`

    `,
    TooltipFooter: styled.div`
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        flex-shrink: 0;
        padding: 4px 4px 0;


        && .TooltipContent__Button {

            font-size: 1.4rem;
            line-height: 1;
            padding: 8px;
            appearance: none;
            margin-left: auto;
            margin-right: 5px;
            font-weight: 600;


        }
    `,
    EmptyFooter: styled.div`
        padding-bottom: ${({addPadding}) => addPadding ? 45 : 0}px;
    `,
    SkipButton: styled.button`
        background-color: transparent;
        border: 0px;
        border-radius: 0px;
        color: ${({themeTextColor}) => themeTextColor};
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
        color: ${(props) => props.themeTextColor};

        cursor: pointer;
        font-size: 1.4vw;
        line-height: 1;
        padding: 8px;
        appearance: none;
        margin-left: auto;
        margin-right: 5px;
        font-weight: 600;


    `,
    TooltipButton: styled(Button)`

    `,
    NextButton: styled.button`
        background-color: ${(props) => props.themeButtonBackgroundColor};
        border: 0px;
        border-radius: 4px;
        color: ${({themeButtonTextColor}) => themeButtonTextColor};

        cursor: pointer;
        font-size: 1.4vw;
        line-height: 1;
        padding: 8px;
        appearance: none;
        //margin-right: 15px;
        font-weight: 600;

    `,
    FormattedMessage: styled.p`
        margin: 0px;
    `,
    TooltipTitle: styled.p`
        margin: 0px;
        font-size: 0.85em;
    `,

    TooltipContent: styled.span`
        && p {
            font-weight: 550;
            font-family: ${Colors.fontFamily};
            overflow-wrap: break-word;
            margin: 0px;

            max-width: 250px;
            width: max-content;


            font-size: ${({textFontSize}) => textFontSize};

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


        color: ${({themeTextColor}) => themeTextColor};
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


export default Form

