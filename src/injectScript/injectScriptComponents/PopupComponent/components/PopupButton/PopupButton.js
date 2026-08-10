import React from 'react'
import styled from 'styled-components'
import Colors from '../../../../../constants/mainColors.js'
import '@fontsource/lexend/latin.css'
import { getPopupButtonColors, getStoryTheme } from '../../../../helpers.js'

const GOTO_TYPES = {
  website: 'website',
  screen: 'screen',
  next: 'next',
}

function PopupButton({
  popupButton,
  storyDemo,
  changeToScreen,
  onNext,
  onClick,
  fontSize,
  alignment = 'center',
}) {
  let { textColor, backgroundColor } = getPopupButtonColors(popupButton, getStoryTheme(storyDemo))
  let text = (popupButton && popupButton.text) || ''

  function handleClick() {
    if (onClick) return onClick()
    let gotoType = popupButton && popupButton.gotoType
    if (gotoType === GOTO_TYPES.next) return onNext && onNext()
    if (gotoType === GOTO_TYPES.screen) return changeToScreen && changeToScreen(popupButton.gotoScreen)
    if (gotoType === GOTO_TYPES.website) window.open(popupButton.gotoWebsite, '_blank')
  }

  return (
    <B.ButtonComponent
      alignment={alignment}
      className={'popup-button cursor-pointer'}
      backgroundColor={backgroundColor}
      onClick={handleClick}
      fontSize={parseFloat(String(fontSize).replace(/rem/, ''))}
    >
      <B.Text fontSize={fontSize} color={textColor}>{text}</B.Text>
    </B.ButtonComponent>
  )
}

const B = {
  Text: styled.p.withConfig({
    shouldForwardProp: (prop) => !['fontSize', 'color'].includes(prop),
  })`
    font-size: ${({ fontSize }) => fontSize};
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
    max-width: 80%;
    min-height: 35px;
    justify-content: ${({ alignment }) => alignment};
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
  `,
}

export default PopupButton
