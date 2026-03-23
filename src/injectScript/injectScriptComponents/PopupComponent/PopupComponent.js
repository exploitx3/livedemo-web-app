import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
import '@fontsource/lexend/latin.css'
import PopupButton from './components/PopupButton/PopupButton.js'
import FormView from "../Form/FormView.js";
import Form from "../Form/Form.js";
import FormHubspotV2 from "../Form/FormHubspotV2.js";
import FormHubspotV4 from "../Form/FormHubspotV4.js";

function PopupComponenet(props) {

    let {
        step,
        liveDemo,
        onNext,
        onBack,
        changeToScreen,
        size,
        wrapperWidth,
        wrapperHeight,
        isInEditor,
        themeBackgroundColor,
        themeTextColor,
        themeButtonBackgroundColor,
        themeButtonTextColor,
        themeOverlayBackgroundColor
    } = props


    let titleFontSize = '2.2vw'
    let textFontSize = '1.8vw'
    let buttonFontSize = '2vw'

    if (wrapperWidth <= 1040) {
        titleFontSize = '4vw'
        textFontSize = '2.7vw'
        buttonFontSize = '2.5vw'

    } else if (wrapperWidth > 1040) {
        titleFontSize = '3.5vw'
        textFontSize = '1.7vw'
        buttonFontSize = '2vw'
    }
    if (wrapperWidth < 540) {
        titleFontSize = '5.5vw'
        textFontSize = '3.5vw'
        buttonFontSize = '4vw'
    }

    if (wrapperHeight < 250) {
        titleFontSize = '3.5vw'
        textFontSize = '1.9vw'
        buttonFontSize = '2.5vw'

    }


    if (isInEditor) {
        titleFontSize = '2.5vw'
        textFontSize = '1.2vw'
        buttonFontSize = '1.5vw'
    }


    let [buttons, setButtons] = useState(step.view.popup.buttons ? step.view.popup.buttons : [])


    let modPopupTitle = step.view.popup.title ? step.view.popup.title : 'Title'
    let modPopupDesc = step.view.popup.description ? step.view.popup.description : 'Description'

    //
    // if(wrapperHeight < 250){
    //     if(modPopupTitle.length > 35){
    //         modPopupTitle = modPopupTitle.slice(0, 35) + '...'
    //     }
    //     if(modPopupDesc.length > 135){
    //         modPopupDesc = modPopupDesc.slice(0, 135) + '...'
    //     }
    // }
    let [popupTitle, setPopupTitle] = useState(modPopupTitle)
    let [popupDescription, setPopupDescription] = useState(modPopupDesc)
    const ALIGNMENT_MAP = {
        left: 'start',
        right: 'end',
        center: 'center'
    }


    const alignment = (step.view.popup.alignment && ALIGNMENT_MAP[step.view.popup.alignment]) ? ALIGNMENT_MAP[step.view.popup.alignment] : 'center'

    let showForm = !!(step.view && step.view.viewType === 'popup' && step.view.popup.type === 'form' && step.view.popup && step.view.popup.formId && step.view.popup.formId.title)

    /*
                  dangerouslySetInnerHTML={{ __html: `<span>${(view && view.content) || (view && view.content)}</span>` }}></TC.TooltipContent>
     */


    useEffect(() => {
        setButtons(step.view.popup.buttons)


        let modPopupTitle = step.view.popup.title ? step.view.popup.title : 'Title'
        let modPopupDesc = step.view.popup.description ? step.view.popup.description : 'Description'
        // if(wrapperHeight < 250){
        //     if(modPopupTitle.length > 45){
        //         modPopupTitle = modPopupTitle.slice(0, 35) + '...'
        //     }
        //     if(modPopupDesc.length > 175){
        //         modPopupDesc = modPopupDesc.slice(0, 135) + '...'
        //     }
        // }
        setPopupTitle(modPopupTitle)
        setPopupDescription(modPopupDesc)
    }, [step.view.popup])

    function getView(step) {

        if (step.view.popup.type === 'popup') {
            return <React.Fragment>
                <P.Title alignment={alignment} titleFontSize={titleFontSize}>{popupTitle}</P.Title>
                <P.Spacer />
                {popupDescription === '<p></p>' ? '' :
                    <P.Description alignment={alignment} textFontSize={textFontSize} dangerouslySetInnerHTML={{ __html: popupDescription }} />}
                <P.Spacer />
                <P.ButtonsWrapper alignment={alignment}>
                    {buttons.map(popupButton => {
                        return <PopupButton
                            fontSize={buttonFontSize}
                            key={popupButton.index}
                            popupButton={popupButton}
                            storyDemo={liveDemo}
                            changeToScreen={changeToScreen}
                            onNext={onNext}
                        />
                    })}
                </P.ButtonsWrapper>
            </React.Fragment>
        } else if (step.view.popup.type === 'form' && showForm) {
            // Check if form type is hubspot
            const isHubspotForm = step.view.popup.formId &&
                step.view.popup.formId.type === 'hubspot' &&
                step.view.popup.formId.hubspot &&
                step.view.popup.formId.hubspot.formId

            const isHubspotV4Form = isHubspotForm && step.view.popup?.formId?.hubspot?.embedVersion === 4

            if (isHubspotForm) {
                console.log('isHubspotForm rendered', isHubspotForm)
                return <React.Fragment>
                    {isHubspotV4Form ? <FormHubspotV4
                        step={step}
                        onNext={onNext}
                        size={size}
                        themeBackgroundColor={themeBackgroundColor}
                        themeTextColor={themeTextColor}
                        themeButtonBackgroundColor={themeButtonBackgroundColor}
                        themeButtonTextColor={themeButtonTextColor}
                        themeOverlayBackgroundColor={themeOverlayBackgroundColor}
                    /> :
                        <FormHubspotV2
                            step={step}
                            onNext={onNext}
                            size={size}
                            themeBackgroundColor={themeBackgroundColor}
                            themeTextColor={themeTextColor}
                            themeButtonBackgroundColor={themeButtonBackgroundColor}
                            themeButtonTextColor={themeButtonTextColor}
                            themeOverlayBackgroundColor={themeOverlayBackgroundColor}
                        />}
                </React.Fragment>
            } else {
                return <React.Fragment>
                    <Form
                        step={step}
                        onNext={onNext}
                        onBack={onBack}
                        size={size}
                        themeBackgroundColor={themeBackgroundColor}
                        themeTextColor={themeTextColor}
                        themeButtonBackgroundColor={themeButtonBackgroundColor}
                        themeButtonTextColor={themeButtonTextColor}
                        themeOverlayBackgroundColor={themeOverlayBackgroundColor}
                    />
                </React.Fragment>
            }
        }


    }

    return <P.Wrapper id={'popup'}>
        {getView(step)}
    </P.Wrapper>


}

function getBoxShadow(themeColor) {
    return `${themeColor}66 -5px 5px, ${themeColor}4D  -10px 10px, ${themeColor}33 -15px 15px, ${themeColor}1A -20px 20px, ${themeColor}0D -25px 25px;`
}

const P = {
    Spacer: styled.div`
        height: 4%;

        @media (max-height: 235px) {
            && {
                display: none;
            }
        }
    `,
    ButtonsWrapper: styled.div`
        display: flex;
        align-items: ${({ alignment }) => alignment};
        justify-content: start;
        //justify-content: ${({ alignment }) => alignment};
        flex-direction: column;
        margin: 0px;
        
        width: 85%;
        overflow-y: scroll;

        max-height: 40%;

        && {
            -ms-overflow-style: none; /* Internet Explorer 10+ */
            scrollbar-width: none; /* Firefox */
        }

        &&::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
        }
        padding: 1vw 0 0 0.85vw;
        //padding: 20px 0px 0px 10px;
    `,
    Title: styled.p`
        text-align: ${({ alignment }) => alignment};
        width: 85%;
        
        font-size: ${({ titleFontSize }) => titleFontSize};
        color: white;
        font-family: ${Colors.fontFamilyApple};
        margin: 0px;
        //margin: 0px 0px 1rem 0px;
        font-weight: 550;

        padding-left: 10px;


        
        //@media (max-width: 1040px) {
        //  font-size: 4vw;
        //}
        //
        @media (max-width: 391px) {
            max-height: 20%;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;        }
    `,
    Description: styled.p`
        text-align: ${({ alignment }) => alignment};
        max-height: 40%;
        font-size: ${({ textFontSize }) => textFontSize};
        color: white;
        font-family: ${Colors.fontFamilyApple};
        margin: 0px;
        padding-left: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        p:last-child {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        p:first-child {
            white-space: break-spaces;
        }
        
        p:not(:last-child) {
            white-space: break-spaces;
        }
        
        

        /* Style ONLY the last <p> */
      
        
        //@media (max-width: 1040px) {
        //  font-size: 3vw;
        //}
        //
        @media (max-height: 235px) {
            && {
                display: none;
            }
        }

        /*
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
  
         */
        width: 85%;

        && p {
            margin: 0px;
        }
    `,
    Wrapper: styled.div`
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;


    `,
}


export default PopupComponenet
