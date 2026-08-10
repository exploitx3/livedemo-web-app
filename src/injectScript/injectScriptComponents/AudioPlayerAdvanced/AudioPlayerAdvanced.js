import React, {useEffect, useRef, useState} from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
import {MdPause} from 'react-icons/md'
import {ReloadOutlined} from '@ant-design/icons'

import Spinner from '../Spinner/Spinner.js'
import {connect} from 'react-redux'

const HANDLER_TYPES = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TRACKER: 'TRACKER',
}

const AudioPlayerAdvanced = (props) => {
    let {
        audioUrl,
        stepAudio,
        voiceType,
        text,
        regenerateAIAudio,
        shouldRegenerate: shouldRegenerateProp,
    } = props


    let [shouldRegenerateLocal, setShouldRegenerateLocal] = useState(false)
    let [isRegenerating, setIsRegenerating] = useState(false)

    let [isPlaying, setIsPlaying] = useState(false)


    let videoInternalRef = useRef(null)
    let trackerRef = useRef(null)

    let internalTimelineRef = useRef(null)
    let internalTimelineLeftPosition = useRef(0)
    let internalTimelineRightPosition = useRef(0)
    let [trackerPosition, setTrackerPosition] = useState(0)

    let _videoTimeChangeAttached = useRef(false)

    let parentControlsRegenerate = shouldRegenerateProp !== undefined
    let shouldRegenerate = parentControlsRegenerate ? shouldRegenerateProp : shouldRegenerateLocal

    useEffect(() => {
        if (parentControlsRegenerate) {
            return
        }
        if (stepAudio && (text !== stepAudio.text || voiceType !== stepAudio.voiceType)) {
            setShouldRegenerateLocal(true)
        } else {
            setShouldRegenerateLocal(false)
        }
    }, [text, voiceType, stepAudio, parentControlsRegenerate]);

    useEffect(() => {
        if (videoInternalRef.current) {
            attachVideoTimeChangeHandler(videoInternalRef.current)
        }
    }, [videoInternalRef, videoInternalRef.current])

    useEffect(() => {
        if (!trackerRef.current) {
            return
        }

        trackerRef.current.style.transform = `translateX(0px)`

        setIsPlaying(false)
        if (videoInternalRef.current) {
            videoInternalRef.current.pause()
            videoInternalRef.current.currentTime = 0
        }

    }, [audioUrl]);

    function attachVideoTimeChangeHandler(video) {
        if (!_videoTimeChangeAttached.current) {
            _videoTimeChangeAttached.current = true
            video.addEventListener('timeupdate', onVideoTimeChange)
            video.addEventListener('ended', () => {
                setIsPlaying(false)
            })
        }
    }

    function onVideoTimeChange(event) {

        let width = internalTimelineRightPosition.current - internalTimelineLeftPosition.current - 4

        let timestampInSeconds = videoInternalRef.current.currentTime
        let timePercentage = videoInternalRef.current.currentTime / videoInternalRef.current.duration
        let newMargin = width * timePercentage

        trackerRef.current.style.transform = 'translateX(' + newMargin + 'px)'
    }


    useEffect(() => {
        if (internalTimelineRef.current) {
            setupTimelinePositions()
        }
    }, [internalTimelineRef.current])


    function setupTimelinePositions() {
        let cordinates = internalTimelineRef.current.getBoundingClientRect()
        internalTimelineLeftPosition.current = cordinates.left
        internalTimelineRightPosition.current = cordinates.left + cordinates.width
    }

    function onRegenerateClick() {
        if (!regenerateAIAudio || isRegenerating) {
            return
        }

        setIsPlaying(false)
        if (videoInternalRef.current) {
            videoInternalRef.current.pause()
        }

        setIsRegenerating(true)
        regenerateAIAudio()
            .then(() => {
                setIsRegenerating(false)
            })
            .catch(() => {
                setIsRegenerating(false)
            })
    }

    return (
        <S.Wrapper>
            <S.VideoWrapper>
                {!isPlaying ? (
                    <S.Button
                        style={{marginRight: 5}}
                        onClick={() => {
                            if (!videoInternalRef.current || !audioUrl) {
                                return
                            }

                            setIsPlaying(true)

                            if (!videoInternalRef.current.ended) {
                                videoInternalRef.current.play()
                            } else {
                                videoInternalRef.current.currentTime = 0
                                videoInternalRef.current.play()
                            }
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_0_3)">
                                <path
                                    d="M4.69159 2.94011C4.39202 2.74947 4 2.96466 4 3.31975V8.68025C4 9.03534 4.39202 9.25053 4.69159 9.05989L8.90341 6.37965C9.18128 6.20282 9.18129 5.79718 8.90341 5.62035L4.69159 2.94011Z"
                                    fill={'black'}/>
                            </g>
                            <defs>
                                <clipPath id="clip0_0_3">
                                    <rect width="12" height="12" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                    </S.Button>
                ) : (
                    <S.PauseButton
                        style={{marginRight: 5}}
                        onClick={() => {
                            videoInternalRef.current.pause()
                            setIsPlaying(false)
                        }}/>
                )}


                <S.TimelineWrapper>

                    <S.Timeline>


                        <S.TimelineStatic
                            ref={internalTimelineRef}

                        />

                        <S.TimilineTracker
                            ref={trackerRef}
                            // onMouseDown={resizeAdd(HANDLER_TYPES.TRACKER)}
                        >
                        </S.TimilineTracker>
                        <S.InnerTimeline
                        >
                            <S.TimelineFiller/>
                        </S.InnerTimeline>

                    </S.Timeline>
                    <audio preload={'auto'} ref={videoInternalRef} src={audioUrl}></audio>
                </S.TimelineWrapper>

                {shouldRegenerate ? (
                    <S.Button
                        style={{marginLeft: 5}}
                        title="Regenerate voiceover"
                        onClick={onRegenerateClick}
                    >
                        {isRegenerating ? (
                            <S.RefreshSpinner>
                                <Spinner/>
                            </S.RefreshSpinner>
                        ) : (
                            <S.RefreshIcon/>
                        )}
                    </S.Button>
                ) : null}

            </S.VideoWrapper>
        </S.Wrapper>

    )
}

const S = {

    Timeline: styled.div`
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0px;
      position: relative;

      margin: 0px 6px;

      border-radius: 9px;

      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */

    `,
    ZoomContainer: styled.div`
      width: 100%;
      height: 100%;
      display: block;
      padding: 0px;
      position: absolute;
      left: 0px;
      top: 0px;

      border-radius: 12px;

      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */
    `,
    ZoomSpan: styled.span`
      z-index: 2;
      height: 100%;
      background: rgba(17, 24, 39, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;

    `,
    TimelineStatic: styled.div`
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0px;
      position: absolute;
      left: 0px;
      top: 0px;

      //cursor: pointer;
      border: 5px solid white;
      background: #F1F3FE;
      border-radius: 12px;

      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */
    `,
    TrackerCursor: styled.div`
      position: absolute;
      top: -19px;
    `,
    TimilineTracker: styled.div`
      position: absolute;
      left: 0;
      top: 0;
      will-change: transform;
      border-radius: 6px;

      display: flex;
      justify-content: center;

      //cursor: grab;
      transition: 0.2s ease;
      z-index: 3;
      height: 100%;
      width: 4px;
      background: #111827;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
    `,
    InnerTimeline: styled.span`
      flex-grow: 1;
      //height: 100%;
      height: 36px;

      position: relative;
        //border: 2px solid ${Colors.primaryColor};
      padding: 5px;

      //cursor: pointer;

      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */
    `,
    TimelineFiller: styled.span`
      width: 100%;
      height: 100%;
      display: block;
      position: relative;
      border-radius: 9px;

      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */
    `,
    LeftHandle: styled.span`
      position: relative;
      //left: 0;

      z-index: 3;

      margin-left: -16px;

      width: 16px;
      height: 36px;
      border-top-left-radius: 9px;
      border-bottom-left-radius: 9px;
      background: ${Colors.primaryColor};

      display: flex;
      align-items: center;
      justify-content: center;

      cursor: grab;
    `,
    RightHandle: styled.span`
      position: relative;
      //right: 0;
      z-index: 3;
      width: 16px;
      height: 36px;
      border-top-right-radius: 9px;
      border-bottom-right-radius: 9px;
      background: ${Colors.primaryColor};

      margin-right: -16px;

      display: flex;
      align-items: center;
      justify-content: center;

      cursor: grab;
    `,
    HandleLine: styled.span`
      height: 16px;
      width: 2px;
      background: white;
      border-radius: 999px;
    `,
    Button: styled.div`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 34px;
      border-radius: 8px;

      cursor: pointer;

      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */

      font-family: ${Colors.fontFamily};
      color: ${Colors.fifthColor};

      font-weight: 550;
      font-size: 15px;

      && svg {
        width: 100%;
        height: 100%;
      }

      && svg g path {
        fill: ${Colors.sixthColor};
      }

      &&:hover {
        background: #F1F3FE;
      }
    `,
    AddZoomButton: styled.div`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 34px;
      border-radius: 8px;

      cursor: pointer;

      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */

      font-family: ${Colors.fontFamily};
      color: ${Colors.fifthColor};

      font-weight: 550;
      font-size: 15px;

      && svg {
        width: 100%;
        height: 100%;
      }

      && svg g path {
        fill: ${Colors.sixthColor};
      }

      &&:hover {
        background: #F1F3FE;
      }
    `,
    PauseButton: styled(MdPause)`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 34px;
      border-radius: 8px;

      cursor: pointer;

      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */

      font-family: ${Colors.fontFamily};
      color: ${Colors.fifthColor};

      font-weight: 550;
      font-size: 15px;

      && svg {
        width: 100%;
        height: 100%;
      }

      && svg g path {
        fill: ${Colors.sixthColor};
      }

      &&:hover {
        background: #F1F3FE;
      }
    `,
    RefreshIcon: styled(ReloadOutlined)`
      && {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        font-size: 16px;
        color: #111827;
      }

      && svg {
        width: 16px !important;
        height: 16px !important;
      }
    `,
    RefreshSpinner: styled.div`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;

      && .spinner {
        position: relative !important;
        left: 0 !important;
        width: 18px !important;
        height: 18px !important;
        top: 0 !important;
        margin: 0 !important;
      }
    `,
    Wrapper: styled.div`
      height: 41px;
      width: 95%;
      background: white;
    `,
    VideoWrapper: styled.div`
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
      border-radius: 8px;
      padding: 4px;

      && .spinner {
        position: relative !important;
        left: 0 !important;;
        width: 30px !important;;
        height: 30px !important;;
        top: 0px !important;;
        margin: 5px !important;;
      }

    `,
    TimelineWrapper: styled.div`
      position: relative;
      height: 100%;
      flex-grow: 1;
      display: flex;
      align-items: center;

    `,

}

function mapStateToProps(state) {

    return {
        authData: state.authReducer.authData,
    }
}

export default connect(mapStateToProps, null)(AudioPlayerAdvanced)
