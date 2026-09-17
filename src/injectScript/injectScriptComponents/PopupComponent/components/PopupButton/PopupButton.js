import React from 'react'
import styled, { css, keyframes } from 'styled-components'
import Colors from '../../../../../constants/mainColors.js'
import ButtonEffects from '../../../../../constants/ButtonEffects.js'
import '@fontsource/lexend/latin.css'
import { getPopupButtonColors, getStoryTheme } from '../../../../helpers.js'
import {
  getPopupButtonProgressWidth,
  getPopupButtonGlowRingColor,
  getPopupButtonEffectAccent,
  POPUP_BUTTON_PROGRESS_DURATION_S,
} from './popupButtonProgress.js'

const GOTO_TYPES = {
  website: 'website',
  screen: 'screen',
  next: 'next',
}

const progressFill = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`

const ringFadeOut = keyframes`
  0% {
    opacity: 0.85;
    box-shadow: 0 0 0 0px var(--ld-button-ring-color);
  }
  100% {
    opacity: 0;
    box-shadow: 0 0 0 14px var(--ld-button-ring-color);
  }
`

const rippleExpand = keyframes`
  from { transform: scale(0.2); opacity: 0.7; }
  to { transform: scale(3.5); opacity: 0; }
`

const spinnerRotate = keyframes`
  to { transform: rotate(360deg); }
`

const pulseScale = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
`

function PopupButton({
  popupButton,
  storyDemo,
  changeToScreen,
  onNext,
  onClick,
  fontSize,
  alignment = 'center',
  audioProgress,
}) {
  let { textColor, backgroundColor } = getPopupButtonColors(popupButton, getStoryTheme(storyDemo))
  let text = (popupButton && popupButton.text) || ''
  let buttonEffect = (popupButton && popupButton.buttonEffect) || ButtonEffects.none
  let syncedWidth = getPopupButtonProgressWidth(buttonEffect, audioProgress)
  let showProgress = buttonEffect === ButtonEffects.progress
  let showGlow = buttonEffect === ButtonEffects.glow
  let showRipple = buttonEffect === ButtonEffects.ripple
  let showSpinner = buttonEffect === ButtonEffects.spinner
  let showPulse = buttonEffect === ButtonEffects.pulse
  let syncToAudio = syncedWidth != null
  let glowRingColor = showGlow ? getPopupButtonGlowRingColor(backgroundColor) : null
  let accentColor = (showRipple || showSpinner) ? getPopupButtonEffectAccent(backgroundColor) : null

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
      $glow={showGlow}
      $pulse={showPulse}
      onClick={handleClick}
      fontSize={parseFloat(String(fontSize).replace(/rem/, ''))}
    >
      {showProgress ? (
        <B.Progress aria-hidden="true">
          <B.ProgressFill
            $synced={syncToAudio}
            style={syncToAudio ? { transform: `scaleX(${syncedWidth / 100})` } : undefined}
          />
        </B.Progress>
      ) : null}
      {showGlow ? (
        <>
          <B.Glow
            aria-hidden="true"
            style={{ '--ld-button-ring-color': glowRingColor }}
          />
          <B.Glow
            aria-hidden="true"
            $delay
            style={{ '--ld-button-ring-color': glowRingColor }}
          />
        </>
      ) : null}
      {showRipple ? (
        <B.RippleWrap aria-hidden="true">
          <B.Ripple style={{ backgroundColor: accentColor }} />
        </B.RippleWrap>
      ) : null}
      {showSpinner ? (
        <B.SpinnerWrap aria-hidden="true">
          <B.SpinnerSpin style={{
            backgroundImage: `linear-gradient(transparent, transparent), linear-gradient(${accentColor}, ${accentColor}), linear-gradient(transparent, transparent), linear-gradient(transparent, transparent)`,
          }} />
          <B.SpinnerFill style={{ background: backgroundColor }} />
        </B.SpinnerWrap>
      ) : null}
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
    font-family: var(--ld-demo-font, ${Colors.fontFamily});
    padding: 10px 20px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    position: relative;
    z-index: 1;
  `,
  Progress: styled.div`
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    overflow: hidden;
    z-index: 0;
  `,
  ProgressFill: styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100%;
    width: 100%;
    opacity: 0.3;
    background-color: rgba(255, 255, 255, 0.7);
    transform: scaleX(0);
    transform-origin: left center;
    will-change: transform;
    ${({ $synced }) => $synced
      ? css`transition: transform 0.35s linear;`
      : css`animation: ${progressFill} ${POPUP_BUTTON_PROGRESS_DURATION_S}s linear forwards;`
    }
  `,
  Glow: styled.div`
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: 0;
    animation: ${ringFadeOut} 1.6s ease-out infinite;
    animation-delay: ${({ $delay }) => ($delay ? '0.8s' : '0s')};
  `,
  RippleWrap: styled.div`
    pointer-events: none;
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: inherit;
    z-index: 0;
  `,
  Ripple: styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    flex-shrink: 0;
    animation: ${rippleExpand} 1.4s ease-out infinite;
  `,
  SpinnerWrap: styled.div`
    pointer-events: none;
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
    z-index: 0;
  `,
  SpinnerSpin: styled.div`
    position: absolute;
    left: -50%;
    top: -150%;
    width: 200%;
    height: 400%;
    z-index: 0;
    background-repeat: no-repeat;
    background-size: 50% 50%, 50% 50%;
    background-position: 0 0, 100% 0, 100% 100%, 0 100%;
    animation: ${spinnerRotate} 2s linear infinite;
  `,
  SpinnerFill: styled.div`
    position: absolute;
    z-index: 1;
    left: 3px;
    top: 3px;
    width: calc(100% - 6px);
    height: calc(100% - 6px);
    border-radius: 5px;
  `,
  ButtonComponent: styled.div.withConfig({
    shouldForwardProp: (prop) => !['backgroundColor', 'fontSize', '$glow', '$pulse'].includes(prop),
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
    overflow: ${({ $glow, $pulse }) => ($glow || $pulse) ? 'visible' : 'hidden'};
    white-space: nowrap;
    position: relative;
    isolation: isolate;
    z-index: ${({ $glow }) => ($glow ? 1 : 'auto')};
    ${({ $pulse }) => $pulse && css`
      animation: ${pulseScale} 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    `}

    &&:hover {
      transform: scale(1.045);
      animation: none;
      transition: 0.25s ease-in-out;
    }
  `,
}

export default PopupButton
