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
import axios from '../../../../../utils/axiosInstance.js'
import ENV from '../../../../config.json'
import Spinner from '../../../Spinner/Spinner.js'
import Input from "antd/es/input/index.js";
import Select from "antd/es/select/index.js";
import AudioPlayerAdvanced from '../../../AudioPlayerAdvanced/AudioPlayerAdvanced.js'

const {TabPane} = Tabs
const {Option} = Select;

const {TextArea} = Input;

const AudioTypes = {
  AI: 'AI',
  PERSON: 'PERSON'
}
const AiVoiceTab = ({
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
                      reloadStoryDemo,
                      voices
                    }) => {

  if (!stepAudio) {
    return ''
  }

  function getInternalStepAudio(stepAudio) {
    if (stepAudio.audioType !== 'ai') {

      return {
        ...stepAudio,
        audioType: 'ai',
        audioUrl: '',
      }
    } else {

      return stepAudio
    }
  }

  let [internalStepAudio, setInternalStepAudio] = useState(getInternalStepAudio(stepAudio))

  let defaultVoice = (stepAudio.voiceType && voices.find(voiceItem => voiceItem.voice_id === stepAudio.voiceType)) ? voices.find(voiceItem => voiceItem.voice_id === stepAudio.voiceType) : {
    voice_id: '',
    name: '',
    description: '',
    preview_url: ''
  }

  let [selectedAIVoice, setSelectedAIVoice] = useState(defaultVoice)
  let [isLoading, setIsLoading] = useState(false)

  let [text, setText] = useState(stepAudio.text)
  // let [voiceId, setVoiceId] = useState(stepAudio.voiceType)

  let [shouldRegenerate, setShouldRegenerate] = useState(false)

  useEffect(() => {
    debugger
    if (text !== stepAudio.text || (selectedAIVoice && selectedAIVoice.voice_id) !== internalStepAudio.voiceType || !internalStepAudio.audioUrl) {
      setShouldRegenerate(true)
    } else {
      setShouldRegenerate(false)
    }
  }, [text, selectedAIVoice, internalStepAudio, stepAudio]);

  useEffect(() => {
    let defaultVoice = (stepAudio.voiceType && voices.find(voiceItem => voiceItem.voice_id === stepAudio.voiceType)) ? voices.find(voiceItem => voiceItem.voice_id === stepAudio.voiceType) : {
      voice_id: '',
      name: '',
      description: '',
      preview_url: ''
    }

    setSelectedAIVoice(defaultVoice)
    setText(stepAudio.text)

    setInternalStepAudio(getInternalStepAudio(stepAudio))

  }, [stepAudio, voices]);


  function regenerateAIAudio(text, voiceId, workspaceId, storyDemoId, authToken) {

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/generateAiVoice`, {
      "voiceId": voiceId,
      "text": text
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then(res => res.data)
  }

  function saveStepAudio(stepAudio, workspaceId, storyDemoId, screenId, stepId, authToken) {

    return axios.patch(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${stepId}`, {
      stepAudioId: stepAudio._id
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then(res => res.data)
  }


  return (

    <React.Fragment>
      <div style={{visibility: isLoading ? 'hidden' : 'visible', width: '100%', height: '100%'}}>
        <T.Main>
          <T.ActionSelectorLine>
            <T.ActionSelectorText>Text:</T.ActionSelectorText>
            <T.TitleComponent>
              <T.TitleInput
                onChange={(event) => {
                  setText(event.target.value)
                }}
                rows={4}
                value={text}/>

            </T.TitleComponent>

          </T.ActionSelectorLine>
          <T.ActionSelectorLine>
            <T.ActionSelectorText>Voice Type:</T.ActionSelectorText>
            <T.Select
              dropdownStyle={{
                background: Colors.App.sidebarColor,
                border: `1px solid ${Colors.primaryColor}`,
                textTransform: 'capitalize',

                // boxShadow: `0 0 0 2px ${Colors.primaryColor}`
              }}
              value={selectedAIVoice.voice_id}
              style={{
                width: '100%'
              }}
              onChange={(voiceId) => {

                setSelectedAIVoice(voices.find(voiceItem => voiceItem.voice_id === voiceId))
              }}>
              {voices.map((voice, index, array) => {
                let isLast = index === array.length - 1
                return <Option style={{
                  background: 'none',
                  color: Colors.primaryColor,
                  borderBottom: isLast ? 'none' : '1px solid #d9d9d9',
                  textTransform: 'capitalize',
                }}
                               key={voice.voice_id}
                               value={voice.voice_id}
                               title={voice.description}
                >{voice.name}</Option>
              })
              }
            </T.Select>
          </T.ActionSelectorLine>
          <T.HorizontalLine style={{width: '95%', marginBottom: 5}}>
            {!internalStepAudio ? ('') : (
              <AudioPlayerAdvanced
                audioUrl={internalStepAudio.audioUrl}
                shouldRegenerate={shouldRegenerate}
                regenerateAIAudio={function () {

                  return regenerateAIAudio(text, selectedAIVoice.voice_id, workspaceId, storyDemoId, authData.token)
                    .then((audioDoc) => {

                      let newAudio = {
                        ...internalStepAudio,
                        ...audioDoc
                      }

                      setInternalStepAudio(newAudio)
                    })
                }}
              />)}

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

                  let promise = Promise.resolve()
                  if (shouldRegenerate) {
                    promise = promise.then(() => {
                      return regenerateAIAudio(text, selectedAIVoice.voice_id, workspaceId, storyDemoId, authData.token)
                        .then(stepAudioDoc => {
                          setInternalStepAudio(stepAudioDoc)

                          return stepAudioDoc
                        })
                    })
                  }

                  promise = promise.then((updatedStepAudioDoc) => {
                    let savingStepAudioDoc = updatedStepAudioDoc ? updatedStepAudioDoc : internalStepAudio

                    return saveStepAudio(savingStepAudioDoc, workspaceId, storyDemoId, screenId, step._id, authData.token)
                      .then((stepDoc) => {
                        setInternalStepAudio(stepDoc.stepAudioId)

                        reloadStoryDemo()
                      })
                      .then(() => {

                        onCancel()


                        setIsLoading(false)
                      })

                      .catch((err) => {
                        setIsLoading(false)
                      })
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

    && .ant-select-content-value {
      background: none;
      color: ${Colors.primaryColor};
      border: none !important;
      box-shadow: none;
    }

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

export default AiVoiceTab
