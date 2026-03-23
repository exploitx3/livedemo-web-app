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

// Ensure we get the actual component (handle both default and named exports)
const ReCAPTCHA = ReCAPTCHAModule?.default || ReCAPTCHAModule

function Form({
                  step,
                  onNext,
                  onBack,
                  size,
                  themeBackgroundColor,
                  themeTextColor,
                  themeButtonBackgroundColor,
                  themeButtonTextColor,
                  themeOverlayBackgroundColor
              }) {

    let nextButtonText = (step.view && step.view.nextButtonText) || 'Next'
    let showStepNumbers = (step.view && step.view.showStepNumbers) || (step.view && step.view.showStepNumbers)

    let nextButtonTextString = (nextButtonText ? nextButtonText : 'Next')
    let stepNumbersString = (showStepNumbers ? `(${step.index + 1}/${size})` : '')


    let showForm = !!(step.view && step.view.viewType === 'popup' && step.view.popup.type === 'form' && step.view.popup && step.view.popup.formId && step.view.popup.formId.title)

    let [fieldsObj, updateFieldsObj] = useState({})
    let showFooter = step.view.showFooter


    let formDataInternal = step.view.popup.formId
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

    return <F.Wrapper themeBackgroundColor={themeBackgroundColor}
                      arrowColor={themeBackgroundColor}
    >
        <F.WrapperInner>
            <F.ContentWrapper>
                {isLoading ? (<F.SpinnerWrapper><Spinner/></F.SpinnerWrapper>) : (
                    <React.Fragment>
                        <FormView formData={formDataInternal}
                                  onNextHandler={onNextHandlerClosure(formDataInternal, fieldsObj, recaptchaRef)}
                                  themeTextColor={themeTextColor}
                                  updateFieldsObj={updateFieldsObj}
                        />
                        {/*<F.CaptchaNotice>This site is protected by reCAPTCHA and the Google*/}

                        {/*  <a href="https://policies.google.com/privacy">Privacy Policy</a> and*/}
                        {/*  <a href="https://policies.google.com/terms">Terms of Service</a> apply.*/}
                        {/*</F.CaptchaNotice>*/}
                    </React.Fragment>
                )}
                <F.CaptchaWrapper>
                    <F.ReCAPTCHA
                        ref={recaptchaRef}
                        badge={'inline'}
                        sitekey={ENV.CAPTCHA_SITE_KEY}
                        size="invisible"
                    />
                </F.CaptchaWrapper>
            </F.ContentWrapper>
            {showFooter ? (<F.TooltipFooter>

                <React.Fragment>
                    <F.LeftButtonsWrapper>

                        {/*<F.SkipButton onClick={onSkip}>*/}
                        {/*  <F.FormattedMessage id="close">*/}
                        {/*    Skip*/}
                        {/*  </F.FormattedMessage>*/}
                        {/*</F.SkipButton>*/}

                    </F.LeftButtonsWrapper>
                    <F.RightButtonsWrapper>
                        {step && step.index > 0 && (
                            <F.BackButton
                                className={'TooltipContent__Button'}
                                themeBackgroundColor={themeBackgroundColor}
                                themeTextColor={themeTextColor}

                                onClick={onBack}>
                                <F.FormattedMessage id="back">
                                    Back
                                </F.FormattedMessage>
                            </F.BackButton>
                        )}
                        <F.NextButton
                            className={'TooltipContent__Button'}
                            themeBackgroundColor={themeBackgroundColor}
                            themeTextColor={themeTextColor}
                            themeButtonBackgroundColor={themeButtonBackgroundColor}
                            themeButtonTextColor={themeButtonTextColor}
                            onClick={onNextHandlerClosure(formDataInternal,fieldsObj, recaptchaRef)}>
                            <F.FormattedMessage id="next">
                                {nextButtonTextString + " " + stepNumbersString}
                            </F.FormattedMessage>
                        </F.NextButton>
                    </F.RightButtonsWrapper>
                </React.Fragment>


            </F.TooltipFooter>) : (
                <F.EmptyFooter addPadding={showForm}>
                </F.EmptyFooter>
            )}
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
    ContentWrapper: styled.div`
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 230px;
        display: block;
        font-size: 1.4vw;
        height: 70%;
        padding: 5px 20px;

        @media (min-width: 1200px) {
            max-height: 240px;
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
            background-color: ${({scrollbarColor}) => scrollbarColor};
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
    WrapperInner: styled.div`

    `,
    Wrapper: styled.div.withConfig({
        shouldForwardProp: (prop) => !['themeBackgroundColor', 'themeTextColor', 'arrowColor'].includes(prop),
    })`
        transition: 0.5s all ease-out;

        transform-origin: top left;

        font-size: 1.5vw;
        font-family: ${Colors.fontFamilyApple};
        //width: 29vw;
        min-width: 32vw;
        max-width: 80vw;
        width: max-content;
        //width: 29vw;
        height: auto;
        max-height: 90%;

        //padding: 20px;
        padding: 1.5vw;

        // && p {
        //   font-size: 1.5vw;
            //   font-family: ${Colors.fontFamilyApple};
        //   margin: 0px;
        // }

        background: ${({themeBackgroundColor}) => themeBackgroundColor};
        border-radius: 5px;
        box-sizing: border-box;
        color: ${({themeTextColor}) => themeTextColor};
        border: 1px solid ${({themeBackgroundColor}) => themeBackgroundColor};

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
        margin-top: 15px;
        height: 30%;
        padding: 5px 15px 15px 15px;


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

