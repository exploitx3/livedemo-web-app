import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import '@fontsource/lexend/latin.css'
import FormView from "../Form/FormView.js";
import Form from "../Form/Form.js";
import FormHubspotV2 from "../Form/FormHubspotV2.js";
import FormHubspotV4 from "../Form/FormHubspotV4.js";
import PopupContentView from './components/PopupContentView/PopupContentView.js'
import EmbedView from '../EmbedView/EmbedView.js'

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
        isOverlayEnabled
    } = props

    const overlayBackgroundColor = (step && step.view && step.view.popup && step.view.popup.overlayBackgroundColor) || 'rgba(0,0,0,0.65)'


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


    const rawAlignment = step.view.popup.alignment || 'center'
    const alignment = (ALIGNMENT_MAP[rawAlignment]) ? ALIGNMENT_MAP[rawAlignment] : 'center'

    let showForm = !!(step.view && step.view.viewType === 'popup' && step.view.popup.type === 'form' && step.view.popup && step.view.popup.formId && step.view.popup.formId._id)

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
            return <PopupContentView
                popupTitle={popupTitle}
                popupDescription={popupDescription}
                buttons={buttons}
                alignment={alignment}
                rawAlignment={rawAlignment}
                titleFontSize={titleFontSize}
                textFontSize={textFontSize}
                buttonFontSize={buttonFontSize}
                showPreviewImage={!!(step.view.popup.showPreviewImage) && wrapperWidth >= 540}
                previewImageUrl={step.view.popup.previewImageUrl || ''}
                liveDemo={liveDemo}
                changeToScreen={changeToScreen}
                onNext={onNext}
            />
        } else if (step.view.popup.type === 'embed') {
            return (
                <EmbedView
                    step={step}
                    onNext={onNext}
                    onBack={onBack}
                    size={size}
                    themeBackgroundColor={themeBackgroundColor}
                    themeTextColor={themeTextColor}
                    themeButtonBackgroundColor={themeButtonBackgroundColor}
                    themeButtonTextColor={themeButtonTextColor}
                />
            )
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
                    /> :
                        <FormHubspotV2
                            step={step}
                            onNext={onNext}
                            size={size}
                            themeBackgroundColor={themeBackgroundColor}
                            themeTextColor={themeTextColor}
                            themeButtonBackgroundColor={themeButtonBackgroundColor}
                            themeButtonTextColor={themeButtonTextColor}
                        />}
                </React.Fragment>
            } else {
                return <React.Fragment>
                    <Form
                        step={step}
                        onNext={onNext}
                        onBack={onBack}
                        changeToScreen={changeToScreen}
                        liveDemo={liveDemo}
                        size={size}
                        wrapperWidth={wrapperWidth}
                        themeBackgroundColor={themeBackgroundColor}
                        themeTextColor={themeTextColor}
                        themeButtonBackgroundColor={themeButtonBackgroundColor}
                        themeButtonTextColor={themeButtonTextColor}
                    />
                </React.Fragment>
            }
        }


    }

    return <P.Wrapper isOverlayEnabled={isOverlayEnabled}
     overlayBackgroundColor={overlayBackgroundColor} id={'popup'}>
        {getView(step)}
    </P.Wrapper>


}

function getBoxShadow(themeColor) {
    return `${themeColor}66 -5px 5px, ${themeColor}4D  -10px 10px, ${themeColor}33 -15px 15px, ${themeColor}1A -20px 20px, ${themeColor}0D -25px 25px;`
}

const P = {
    Wrapper: styled.div`
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      /* flex-start + child margin-block:auto — center when short, no top clip when tall */
      justify-content: flex-start;
      align-items: center;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
      overflow: hidden;
      overflow-y: auto;
      position: relative;
      z-index: 4 !important;

      & > * {
        margin-block: auto;
        max-height: 100%;
        min-height: 0;
      }

      ${({isOverlayEnabled, overlayBackgroundColor}) => {
        if(isOverlayEnabled) {
          return `
            backdrop-filter: blur(8px);
            background: ${overlayBackgroundColor};
          `
        }
      }}

    `,
}


export default PopupComponenet
