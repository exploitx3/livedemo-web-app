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
import Input from "antd/es/input/index.js";
import Select from "antd/es/select/index.js";
import { AudioOutlined } from '@ant-design/icons';
import VoiceTypes from "../../../../../constants/VoiceTypes.js";

import AiVoiceTab from './AiVoiceTab.js'
import PersonVoiceTab from './PersonVoiceTab.js'

const {TabPane} = Tabs

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
const EditAudio = ({
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

  let [selectedAudioType, setSelectedAudioType] = useState(stepAudio && stepAudio.audioType && AudioTypes[stepAudio.audioType.toUpperCase()])

  let [isLoading, setIsLoading] = useState(false)


  return (

    <React.Fragment>

      <MD.Modal
        title={null}
        footer={null}
        open={isOpen}
        onOk={() => {
        }}
        onCancel={() => {
          onCancel()
        }}
      >

        <T.Wrapper>

          <T.Header>
            <T.HeaderIcon />
            <T.HeaderTitle>
              Voiceover
            </T.HeaderTitle>
            <T.HeaderDescription>
              Add speech overlay to your LiveDemo.
            </T.HeaderDescription>
          </T.Header>
              <T.Tabs
                defaultActiveKey={selectedAudioType}
                activeKey={selectedAudioType}
                onChange={(newSelectedAudioType) => {

                  setSelectedAudioType(newSelectedAudioType)
                }}
                animated={true}
                centered={true}
                tabPosition={'top'}
              >
                <T.TabPane
                  tab={`${AudioTypes.AI} voice`}
                  key={AudioTypes.AI}>
                  <AiVoiceTab
                    voices={voices}
                    stepAudio={stepAudio}
                    setStepAudio={setStepAudio}
                    workspaceId={workspaceId}
                    storyDemoId={storyDemoId}
                    screenId={screenId}
                    step={step}
                    authData={authData}
                    isOpen={isOpen}
                    onCancel={onCancel}
                    setShowConfetti={setShowConfetti}
                    reloadStoryDemo={reloadStoryDemo}
                  />
                </T.TabPane>
                <T.TabPane
                  tab={`Person voice`}
                  key={AudioTypes.PERSON}>
                  <PersonVoiceTab
                    stepAudio={stepAudio}
                    setStepAudio={setStepAudio}
                    workspaceId={workspaceId}
                    storyDemoId={storyDemoId}
                    screenId={screenId}
                    step={step}
                    authData={authData}
                    isOpen={isOpen}
                    onCancel={onCancel}
                    setShowConfetti={setShowConfetti}
                    reloadStoryDemo={reloadStoryDemo}
                  />
                </T.TabPane>
              </T.Tabs>
        </T.Wrapper>
      </MD.Modal>
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
  HeaderIcon: styled(AudioOutlined)`
    height: 65px;
    width: 65px;
    color: ${Colors.primaryColor};

    && svg {
      width: 100%;
      height: 100%;
    }
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

    width: 100%;

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

export default EditAudio
