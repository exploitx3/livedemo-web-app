import React, {useEffect, useRef, useState, forwardRef} from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
import axios from '../../../utils/axiosInstance.js'
import ENV from '../../config.json'
import TippyModule from '@tippyjs/react'
import {AudioRecorderFactory} from '../../helpers.js'

// Ensure we get the actual component (handle both default and named exports)
const Tippy = TippyModule?.default || TippyModule

import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
import {MdMic, MdPause, MdOutlineStopCircle, MdOutlineMotionPhotosPause, MdFiberManualRecord} from 'react-icons/md'
import TooltipContent from "../TooltipContent/TooltipContent.js";

function Tip({children, themeBackgroundColor, ...props}) {

  return <S.Tippy {...props} $themeBackgroundColor={themeBackgroundColor}>{children}</S.Tippy>
}

const AudioRecorder = (props) => {
  let {
    setAudioBlob
  } = props

  let [isRecording, setIsRecording] = useState(false)

  let audioRecorderRef = useRef(AudioRecorderFactory())


  return (

    <Tip
      zIndex={9999999999}
      disabled={false}
      delay={200}
      arrow={true}
      showOnCreate={false}
      animation={'shift-away'}
      offset={[0, 2]}
      popperOptions={{
        modifiers: [
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top', 'right', 'left', 'bottom'],
            },
          },
        ],
      }}
      placement={'right'}
      themeBackgroundColor={'#111'}
      interactive={false}
      interactiveBorder={2}
      trigger={'mouseenter focus'}
      allowHTML={true}
      content={
        <S.TippyText>Record voice</S.TippyText>
      }
    >
      <S.Wrapper onClick={() => {
        if (!isRecording) {

          audioRecorderRef.current.start()
            .then(() => {
              setIsRecording(!isRecording)
            })
        } else {

          audioRecorderRef.current.stop()
            .then(audioBlobObj => {
              setIsRecording(!isRecording)

              setAudioBlob(audioBlobObj)
              console.log('audioBlobObj')
              console.log(audioBlobObj)
            })
        }
      }}>
        <S.RecordButton $isRecording={isRecording}>
          {isRecording ? (
            <S.Icon className={'recording'}>
              <MdFiberManualRecord/>
            </S.Icon>) : (
            <S.Icon className={'microphone'}>
              <MdMic/>
            </S.Icon>
          )}
        </S.RecordButton>
      </S.Wrapper>
    </Tip>

  )
}

const S = {
  TippyText: styled.p`
    padding: 0px;
    margin: 0px;
    font-family: ${Colors.fontFamily};
    font-size: 0.75rem;
  `,
  Tippy: styled(Tippy).withConfig({
    shouldForwardProp: (prop) => prop !== '$themeBackgroundColor',
  })`


    && {
      background: ${({ $themeBackgroundColor = '#1f2937' }) => $themeBackgroundColor} !important;
      color: white;
      padding: 3px 6px;
      max-width: 250px;
      border-radius: 6px;
    }

    && .tippy-arrow::before {
      color: ${({ $themeBackgroundColor = '#1f2937' }) => $themeBackgroundColor} !important;
    }
  `,
  RecordButton: styled.div`
    position: relative;
      //background: ${({isActive}) => isActive ? '#1070ff' : '#4d77b7'};
    background: #f9f9f9;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    border: 2px solid #111;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 3;

    cursor: pointer;

    -webkit-transition: all .28s cubic-bezier(.4, 0, 1, 1);
    transition: all .28s cubic-bezier(.4, 0, 1, 1);

    ${({$isRecording}) => {
      if ($isRecording) {
        return `
            `
      } else {
        return ''
      }
    }}
  `,
  Icon: styled.span`
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;

    && svg {
      width: 100%;
      height: 100%;
    }

    &&.recording svg {
      fill: #FF3333;
    }

    &&.microphone svg {
      fill: #111;
    }
  `,
  Wrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    width: 48px;
    height: 48px;
    position: relative;
  `
}

export default AudioRecorder
