import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Colors from '../../../../../constants/mainColors.js'
import '@fontsource/lexend/latin.css'

const GOTO_TYPES = {
    website: 'website',
    screen: 'screen',
    next: 'next'
}

function PopupButton(props) {
    let {
        popupButton,
        storyDemo,
        changeToScreen,
        onNext,
        onClick,
        fontSize,
        alignment = 'center'
    } = props




    let [text, setText] = useState(popupButton && popupButton.text ? popupButton.text : '')

    const [buttonTextColor, setButtonTextColor] = useState(popupButton && popupButton.textColor ? popupButton.textColor : '#FFFFFF')
    const [buttonBackgroundColor, setButtonBackgroundColor] = useState(popupButton && popupButton.backgroundColor ? popupButton.backgroundColor : Colors.primaryColor)

    const [onClickFunction, setOnClickFunction] = useState(popupButton && popupButton.gotoType ? getOnClickFunctionClosure(popupButton) : () => {})

    function getOnClickFunctionClosure(popupButton) {
        if(popupButton.gotoType === GOTO_TYPES.next) {
            return () => onNext
        } else if(popupButton.gotoType === GOTO_TYPES.screen) {
            return () => { return () => changeToScreen(popupButton.gotoScreen)}
        } else if(popupButton.gotoType === GOTO_TYPES.website) {
            return () => { return () => window.open(popupButton.gotoWebsite, '_blank') }
        } else {
            return () => {}
        }
    }

    useEffect(() => {
        setText(popupButton.text)
        setButtonTextColor(popupButton && popupButton.textColor ? popupButton.textColor : '#FFFFFF')
        setButtonBackgroundColor(popupButton && popupButton.backgroundColor ? popupButton.backgroundColor : Colors.primaryColor)
        setOnClickFunction(getOnClickFunctionClosure(popupButton))
    }, [popupButton])


    return  (<B.ButtonComponent
        alignment={alignment}
        className={'popup-button cursor-pointer'}
        backgroundColor={buttonBackgroundColor}
        onClick={onClick || onClickFunction}
        fontSize={parseFloat(fontSize.replace(/rem/,''))}
    >

      <B.Text fontSize={fontSize} color={buttonTextColor}>{text}</B.Text>
    </B.ButtonComponent>)



}


const B = {

    Text: styled.p.withConfig({
        shouldForwardProp: (prop) => !['fontSize', 'color'].includes(prop),
    })`
        font-size: ${({fontSize}) => fontSize};
        color: ${(props) => props.color};
        margin: 0px;
        font-family: ${Colors.fontFamily};
        padding: 10px 20px;

        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;

    `,
    ButtonComponent: styled.div.withConfig({
        shouldForwardProp: (prop) => !['backgroundColor', 'fontSize'].includes(prop),
    })`
        cursor: pointer;
        background: ${(props) => props.backgroundColor};
        width: fit-content;
      
        // min-width: ${({fontSize}) => fontSize * 3}rem;
        max-width: 80%;
        min-height: 35px;
        

        justify-content: ${({alignment}) => alignment};
        display: flex;
        align-items: center;
        border-radius: 6px;
        margin-bottom: 10px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        
        &&:hover {
            transform: scale(1.045);
            transition: 0.25s ease-in-out;
        }


        //&& {
        //  box-shadow: 0 0 0 0 rgba(88, 120, 243, 0.4);
        //  -moz-animation: pulse 3s infinite;
        //  -webkit-animation: pulse 3s infinite;
        //  animation: pulse 3s infinite;
        //}
        //
        //@keyframes pulse {
        //  0% {
        //    box-shadow: 0 0 0 0 rgba(88, 120, 243, 1);
        //  }
        //  70% {
        //    box-shadow: 0 0 0 10px rgba(88, 120, 243, 0);
        //  }
        //  100% {
        //    box-shadow: 0 0 0 50px rgba(88, 120, 243, 0);
        //  }
        //}
    `,
}


export default PopupButton
