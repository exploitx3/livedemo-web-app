import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'

import Modal from 'antd/es/modal/index.js'
import Tabs from 'antd/es/tabs/index.js'
import Upload from 'antd/es/upload/index.js'

// Note: antd v6 uses CSS-in-JS, so style imports are not needed
// import 'antd/es/modal/style'
// import 'antd/es/tabs/style'
// import 'antd/es/upload/style'
import Colors from '../../../../../constants/mainColors.js'
import {CSSTransition, TransitionGroup,} from 'react-transition-group'
import axios from '../../../../../utils/axiosInstance.js'
import ENV from '../../../../config.json'
import Spinner from '../../../Spinner/Spinner.js'
import Input from "antd/es/input/index.js";
import Select from "antd/es/select/index.js";
import VoiceTypes from "../../../../../constants/VoiceTypes.js";
import AudioPlayerAdvanced from '../../../AudioPlayerAdvanced/AudioPlayerAdvanced.js'
import AudioPlayerWithEditor from '../../../AudioPlayerWithEditor/AudioPlayerWithEditor.js'
import AudioRecorder from "../../../AudioRecorder/AudioRecorder.js";
import AudioPlayer from "../../../AudioPlayer/AudioPlayer.js";

// MP3 encode: vendored lamejs (LGPL-2.1+). See THIRD_PARTY_NOTICES.md.
import LameJS from './lame.all.js'

const {TabPane} = Tabs

// Note: antd v6 uses CSS-in-JS, so style imports are not needed
// import 'antd/es/tabs/style'
import AITextTab from "../../../../../pages/StoryDemoPage/components/AIEnhance/components/AITextTab/AITextTab.js";
import AIVoiceTab from "../../../../../pages/StoryDemoPage/components/AIEnhance/components/AIVoiceTab/AIVoiceTab.js";
import Button from "antd/es/button/index.js";
import message from "antd/es/message/index.js";
import getBlobDuration from "get-blob-duration";

const {TextArea} = Input;

const VOICE_SAMPLES = {
  [VoiceTypes.nova]: 'https://cdn.openai.com/API/docs/audio/nova.wav',
  [VoiceTypes.onyx]: 'https://cdn.openai.com/API/docs/audio/onyx.wav',
  [VoiceTypes.alloy]: 'https://cdn.openai.com/API/docs/audio/alloy.wav',
  [VoiceTypes.echo]: 'https://cdn.openai.com/API/docs/audio/echo.wav',
  [VoiceTypes.shimmer]: 'https://cdn.openai.com/API/docs/audio/shimmer.wav',
  [VoiceTypes.fable]: 'https://cdn.openai.com/API/docs/audio/fable.wav',
}

const AudioTypes = {
  AI: 'AI',
  PERSON: 'PERSON'
}
const PersonVoiceTab = ({
                          stepAudio,
                          setStepAudio,
                          workspaceId,
                          storyDemoId,
                          screenId,
                          step,
                          authData,
                          isOpen,
                          onCancel,
                          setShowConfetti,
                          reloadStoryDemo
                        }) => {

  if (!stepAudio) {
    return ''
  }
  console.log('personvoicetab rerendered')

  let [startSeconds, setStartSeconds] = useState(0)
  let [endSeconds, setEndSeconds] = useState(0)

  let [audioBlob, setAudioBlob] = useState(null)

  let [isLoading, setIsLoading] = useState(false)

  let [text, setText] = useState(stepAudio.text)

  // useEffect(() => {
  //
  // }, [startSeconds, endSeconds]);

  useEffect(() => {
    setText(stepAudio.text)

    if (stepAudio && !audioBlob && stepAudio.audioType === 'person' && stepAudio.audioUrl) {
      fetch(stepAudio.audioUrl)
        .then(response => response.blob())
        .then((blob) => {

          setStartSeconds(0)
          setEndSeconds(0)
          setAudioBlob(blob)
        })
    }
  }, [stepAudio]);

  function floatTo16BitPCM(input, output) {
    //var offset = 0;
    for (let i = 0; i < input.length; i++) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
      if (i % 1000 == 0) {
        //console.log(output[i]);
      }
    }
  }

  function encodeAudioBufferLame(audioData, LameJS) {

    let buffer = [];
    let maxSamples = 1152
    let sampleBlockSize = 1152

    let mp3Encoder = null

    if (audioData.channels.length == 1) {
      mp3Encoder = new LameJS.Mp3Encoder(1, audioData.sampleRate, 128);

      return new Promise((resolve, reject) => {

        let arrayBuffer = audioData.channels[0];
        let sampleRate = audioData.sampleRate;
        let data = new Float32Array(arrayBuffer);
        let samples = new Int16Array(arrayBuffer.length);
        floatTo16BitPCM(data, samples);

        let remaining = samples.length;
        for (let i = 0; remaining >= 0; i += maxSamples) {
          let mono = samples.subarray(i, i + maxSamples);
          let mp3buf = mp3Encoder.encodeBuffer(mono);
          buffer.push(new Int8Array(mp3buf))
          remaining -= maxSamples;
        }

        resolve(buffer);
      });
    }

    if (audioData.channels.length == 2) {
      mp3Encoder = new LameJS.Mp3Encoder(2, audioData.sampleRate, 128);

      return new Promise((resolve, reject) => {
        let right = new Int16Array(audioData.channels[0].length);
        floatTo16BitPCM(audioData.channels[0], right);

        let left = new Int16Array(audioData.channels[1].length);
        floatTo16BitPCM(audioData.channels[1], left);

        for (let i = 0; i < audioData.channels[0].length; i += sampleBlockSize) {
          let leftChunk = left.subarray(i, i + sampleBlockSize);
          let rightChunk = right.subarray(i, i + sampleBlockSize);
          let mp3buf = mp3Encoder.encodeBuffer(leftChunk, rightChunk);
          if (mp3buf.length > 0) {
            buffer.push(mp3buf);
          }
        }

        resolve(buffer);
      });
    }
  }

  function cutBlobOnTime(blob, start, end, totalAudioDuration) {
    return new AudioContext().decodeAudioData(blob)
      .then(audioBuff => {

        let duration = end - start
        let startPoint = Math.floor((start * audioBuff.length) / totalAudioDuration)
        let endPoint = Math.ceil((end * audioBuff.length) / totalAudioDuration)
        let audioLength = endPoint - startPoint

        let trimmedAudio = new AudioContext().createBuffer(
          audioBuff.numberOfChannels,
          audioLength,
          audioBuff.sampleRate
        )

        for (let i = 0; i < audioBuff.numberOfChannels; i++) {
          trimmedAudio.copyToChannel(audioBuff.getChannelData(i).slice(startPoint, endPoint), i)
        }

        let audioData = {
          channels: Array.apply(null, {length: trimmedAudio.numberOfChannels})
            .map(function (currentElement, index) {
              return trimmedAudio.getChannelData(index);
            }),
          sampleRate: trimmedAudio.sampleRate,
          length: trimmedAudio.length,
        }

        LameJS()
        return encodeAudioBufferLame(audioData, LameJS)
          .then(res => {
            let blob = new Blob(res, {type: 'audio/mp3'})
            let processedAudio = new window.Audio()
            processedAudio.src = URL.createObjectURL(blob)
            console.log(blob);
            console.log(res)

            return blob
          })
          .catch(err => {

            console.log(err)
          })

      })

  }



  const uploadProps = {
    name: 'audioFile',
    action: `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${step._id}/uploadAudio`,
    beforeUpload: (file) => {
      const isAudio = file.type === 'audio/mpeg' || file.type === ' video/mp4' || file.type === 'audio/vnd.wav'
      if (!isAudio) {
        message.error('You can only upload mpeg, mp3, mp4, wav');
      }
      const is5MBSize = file.size / 1024 / 1024 < 5;
      if (!is5MBSize) {
        message.error('Audio must be smaller than 5MB!');
      }

      console.log('Upload audio validation = ' + (isAudio && is5MBSize))

      if (isAudio && is5MBSize) {
        setAudioBlob(file)
      }


      console.log(file)

      return false
    },
    headers: {
      authorization: `Bearer ${authData.token}`,
    },
    showUploadList: false,
    accept: 'audio/mpeg video/mp4 audio/vnd.wav',
    onChange(info) {
    },
  }

  return (
    <React.Fragment>
      <div style={{visibility: isLoading ? 'hidden' : 'visible', width: '100%', height: '100%'}}>
        <T.Main>
          <T.HorizontalLine>
            <T.Upload{...uploadProps}>
              <T.ToolbarButtonWhite>
                <T.ToolbarText
                  onClick={() => {
                    // setIsLoading(true)
                  }}>Upload</T.ToolbarText>
              </T.ToolbarButtonWhite>
            </T.Upload>

            <AudioRecorder setAudioBlob={(blob) => {
              setAudioBlob(blob)
            }}/>
          </T.HorizontalLine>
          <T.HorizontalLine>
            <T.AudioPlayerWithEditorWrapper>

              {!isOpen ? ('') : (<AudioPlayerWithEditor
                key={audioBlob && audioBlob.size}
                stepAudio={stepAudio}
                audioBlob={audioBlob}
                startSeconds={startSeconds}
                endSeconds={endSeconds}
                setStartSeconds={setStartSeconds}
                setEndSeconds={setEndSeconds}
              />)}
            </T.AudioPlayerWithEditorWrapper>
          </T.HorizontalLine>
        </T.Main>
        <T.Footer>
          <T.FooterLeftSide>

          </T.FooterLeftSide>
          <T.FooterRightSide>
            <T.ToolbarButtonWhite
              onClick={() => {
                // onAIEnhanceClick()
              }}
            >
              <T.ToolbarText onClick={() => {
                onCancel()
              }}>Cancel</T.ToolbarText>
            </T.ToolbarButtonWhite>

            <T.ToolbarButton
              onClick={() => {
                // onAIEnhanceClick()
              }}
            >
              <T.ToolbarText
                onClick={() => {

                  setIsLoading(true)
                  return getBlobDuration(audioBlob)
                    .then(duration => {

                      return audioBlob.arrayBuffer()
                        .then(audioArrayBuffer => {

                          if(endSeconds === 0){
                            endSeconds = duration
                          }

                          return cutBlobOnTime(audioArrayBuffer, startSeconds, endSeconds, duration)
                        })
                    })
                    .then(cuttedAudio => {

                      setAudioBlob(cuttedAudio)
                      console.log(cuttedAudio)
                      return cuttedAudio
                    })
                    .then((cuttedAudio) => {
                      let formData = new FormData();

                      formData.append("audioFile", cuttedAudio);

                      return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${step._id}/uploadAudio`, formData, {
                        headers: {
                          'Content-Type': 'multipart/form-data',
                          Authorization: `Bearer ${authData.token}`
                        }
                      })
                    })
                    .then(res => {
                      reloadStoryDemo()

                      setIsLoading(false)

                      onCancel()
                      console.log(res)
                    })
                    .catch(err => {
                      console.error(err)
                    })

                }}>Save</T.ToolbarText>
            </T.ToolbarButton>
          </T.FooterRightSide>
        </T.Footer>
      </div>
      {
        isLoading ? (<Spinner/>) : ('')
      }
    </React.Fragment>
  )
}


const T = {
  Upload: styled(Upload)`
    max-width: 125px;

  `,
  TitleComponent: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    width: 100%;
  `,
  TextLabel: styled.p`
    margin: 0px 5px 0px 0px;
  `,
  TitleInput: styled(TextArea)`
    flex-grow: 1;
  `,
  ActionSelectorText: styled.p`
    margin: 0px;
  `,
  SelectorInput: styled(Input)`
    && {
      width: 100%;
    }

  `,
  Select: styled(Select)`
    flex-grow: 1;

    && .ant-select-selection {
      background: none;
      color: ${Colors.primaryColor};
      border: 1px solid #d9d9d9;
      box-shadow: none;
    }

    && .ant-select-selection:hover {
      border: 1px solid ${Colors.primaryColor};
    }

    && .ant-select-arrow {
      color: ${Colors.primaryColor};
    }

    && .ant-select-selection-selected-value {
      width: 90%;
      text-transform: capitalize;
    }
  `,
  ActionSelectorLine: styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    width: 100%;
    margin-bottom: 15px;

  `,
  AudioPlayerWithEditorWrapper: styled.div`
    width: 95%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  `,
  HorizontalLine: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: 15px;

  `,
  ToolbarText: styled.div`
    font-family: ${Colors.fontFamily};
  `,
  ToolbarButtonWhite: styled.div`
    height: 36px;
    padding: 0px 10px;
    text-align: center;
    line-height: 50px;
    margin: 0px 5px;
    font-size: 1.1em;
    color: #111;
    border: 1px solid #111;
    background: #fff;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 4px;

    cursor: pointer;


  `,
  ToolbarButton: styled.div`
    height: 36px;
    padding: 0px 10px;
    text-align: center;
    line-height: 50px;
    margin: 0px 5px;
    font-size: 1.1em;


    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 4px;

    cursor: pointer;


    color: #f9f9f9;
    background: ${Colors.primaryColor};
  `,
  FooterLeftSide: styled.span`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-self: left;
  `,
  FooterRightSide: styled.span`
    display: flex;
    flex-direction: row;
    align-items: center;
  `,
  Main: styled.div`
    width: 100%;
    flex-grow: 1;
    padding: 25px;
  `,
  Footer: styled.div`
    //background: #f9f9f9;
    //border-top: 1px solid #d9d9d9;
    justify-self: end;
    height: 72px;
    width: 100%;

    display: flex;
    justify-content: space-between;
    align-items: end;
    padding: 0px 10px;
  `,
  Header: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    gap: 20px;
    padding: 25px;

  `,
  HeaderTitle: styled.p`
    margin: 0px;
    font-size: 20px;
    font-weight: 550;
    font-family: ${Colors.fontFamily};
    color: #111;
  `,
  HeaderDescription: styled.p`
    margin: 0px;
    font-size: 15px;
    font-family: ${Colors.fontFamily};
    color: #999;
    text-align: center;
  `,
  Wrapper: styled.main`
    display: flex;
    align-items: center;
    flex-direction: column;
    height: calc(100% + 100px);
  `,
  ImageWrapper: styled.figure`
    border: 7px solid #fff;
    border-radius: 16px;
    box-sizing: border-box;
    width: 100%;
    height: 150px;
    margin: 0;

    &&:hover {
      border-color: #e5e7eb;
      cursor: pointer;
    }
  `,
  Image: styled.img`
    width: 100%;
    height: 100%;
    border-radius: 8px;
  `,
  Tabs: styled(Tabs)`
    && .ant-tabs-bar {
      justify-content: center;
      display: flex;
      align-items: center;
      border: 0px;
    }
  `,
  TabPane: styled(TabPane)`
    && {
      position: relative;
    }
  `
}

const MD = {
  Wrapper: styled.div`
    //display: flex;
    //flex-direction: column;
    //gap: 10px;
    //background: #1070ff;
    //justify-content: flex-start;
    //align-items: center;
    //padding: 10px 0px;
    //border-radius: 6px;

  `,
  Modal: styled(Modal)`

    && {
      width: 420px !important;
    }

    && .ant-modal-body {
      padding: 0px;
    }

    && .ant-tabs-content {
      height: auto;
      //overflow-y: scroll;



  `,
  SpinnerWrapper: styled.div`
    width: 80px;
    height: 80px;
    margin: 150px auto;
  `
}

export default PersonVoiceTab
