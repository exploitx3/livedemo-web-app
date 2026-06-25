import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
import ENV from '../../config.json'
import { Circle } from 'rc-progress';
import { PauseOutlined } from '@ant-design/icons'

const RoundAudioPlayer = (props) => {
    let {
        stepAudio,
        autoPlay,
        isAudioPlaying,
        setIsAudioPlaying,
        setAudioHasPlayed,
        setAudioHasStarted
    } = props

    let [percent, setPercent] = useState(1)


    let audioInternalRf = useRef(null)

    let _videoTimeChangeAttached = useRef(false)

    useEffect(() => {
        if (audioInternalRf.current) {
            attachAudioTimeChangeHandler(audioInternalRf.current)

            if (autoPlay) {
                audioInternalRf.current.play().then(() => {
                    setIsAudioPlaying(true)
                }).catch((err) => {
                    if (err.name === 'AbortError') return
                    console.log(err)
                })
            }

        }
    }, [audioInternalRf, audioInternalRf.current, stepAudio])

    useEffect(() => {

        if (autoPlay) {

            setIsAudioPlaying(false)
            setAudioHasStarted(false)

        }

    }, [stepAudio, autoPlay]);

    function attachAudioTimeChangeHandler(audio) {
        if (!_videoTimeChangeAttached.current) {
            _videoTimeChangeAttached.current = true
            audio.addEventListener('playing', onAudioStart)
            audio.addEventListener('timeupdate', onAudioTimeChange)
            audio.addEventListener('ended', () => {
                setIsAudioPlaying(false)
                setAudioHasPlayed(true)

                setTimeout(() => {
                    setPercent(25)
                }, 200)

                setTimeout(() => {
                    setPercent(1)
                }, 500)
            })
        }
    }

    function onAudioStart(event) {
        console.log('onAudioStart')
        setAudioHasPlayed(false)
        setAudioHasStarted(true)
    }

    function onAudioTimeChange(event) {
        if (audioInternalRf.current.currentTime === undefined) {
            console.log('audioInternalRf.current.currentTime is undefined')
            return
        }

        let calculatedPercentage = (audioInternalRf.current.currentTime / event.currentTarget.duration) * 100

        if (calculatedPercentage !== 100) {

            setPercent(calculatedPercentage)
        }
    }


    return (
        <S.TopWrapper>

            <S.Wrapper className={'RoundAudioPlayer__Wrapper'} onClick={() => {
                let newIsPlaying = !isAudioPlaying
                if (newIsPlaying) {
                    audioInternalRf.current.play()
                } else {
                    audioInternalRf.current.pause()
                }
                setIsAudioPlaying(newIsPlaying)


            }}>
                <S.Container className="">
                    <S.PlayButtonContainer className={'RoundAudioPlayer__PlayButtonContainer'}  >
                        {!isAudioPlaying ? (<S.PlayButton xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                            className=""
                        >
                            <path fill-rule="evenodd"
                                d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                                clip-rule="evenodd">
                            </path>
                        </S.PlayButton>) : (<S.PauseButton className={'RoundAudioPlayer__PauseButton'} />)}
                    </S.PlayButtonContainer>

                    <S.InnerContainer className={"RoundAudioPlayer__InnerContainer"}>
                        <Circle
                            strokeLinecap={"round"} style={{
                                transform: "rotate(-90deg)",
                                transition: "stroke-dashoffset .3s ease 0s, stroke-dasharray .3s ease 0s, stroke .3s, stroke-width .06s ease .3s, opacity .3s ease 0s",
                                fillOpacity: 0
                            }}
                            strokeWidth={6} percent={percent} />
                    </S.InnerContainer>
                    <audio ref={audioInternalRf}
                        src={stepAudio.audioUrl}></audio>
                </S.Container>
            </S.Wrapper>

        </S.TopWrapper>

    )
}

const S = {
    TopWrapper: styled.div`
        //border: 8px solid #f1f3fe;
        border-radius: 50%;
        width: 100%;
        height: 100%;
        position: relative;

        && .RoundAudioPlayer__InnerContainer,
        && .RoundAudioPlayer__Wrapper{
            width: 4vw;
            height: 4vw;
        }

        && .RoundAudioPlayer__PlayButtonContainer,
        && .RoundAudioPlayer__PauseButton {
            width: 2.00vw;
            height: 2.00vw;
        }
        //
        //@media (max-width: 635px) {
        //    && .RoundAudioPlayer__InnerContainer,
        //    && .RoundAudioPlayer__Wrapper{
        //        width: 5vw;
        //        height: 5vw;
        //    }
        //
        //    && .RoundAudioPlayer__PlayButtonContainer{
        //        width: 2.5vw;
        //        height: 2.5vw;
        //    }
        //}

    `,

    Wrapper: styled.div`
      cursor: pointer;
      //height: 50px;
      //width: 50px;

    `,
    PlayButton: styled('svg')`
      width: 100%;
      height: 100%;
    `,
    PauseButton: styled(PauseOutlined)`
      && svg {
        width: 100%;
        height: 100%;
      }
    `,
    PlayButtonContainer: styled.div`
      z-index: 4;
      //position: absolute;
      //top: 0;
      //width: 25px;
      //height: 25px;
      justify-content: center;
      align-items: center;
      display: flex;
    `,
    InnerContainer: styled.div`
      position: absolute;
      display: flex;
      justify-content: center;
      //width: 50px;
      //height: 50px;
      top: 0;

      && .rc-progress-circle-path {
        stroke: ${Colors.primaryColor}BB !important;
      }

      && .rc-progress-circle-trail {
        stroke: #f1f3fe !important;
        stroke-width: 6px;
      }

      //absolute inset-0 flex items-center justify-center p-0.5
    `,
    Container: styled.div`
      background: white;
      border-radius: 50%;
      box-shadow: rgba(0,0,0,0.16) 0px 1px 4px, rgb(255 255 255) 0px 0px 0px 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      //display: flex;
      //justify-content: center;

      //flex items-center justify-center shadow-md rounded-full
    `
}

export default RoundAudioPlayer
