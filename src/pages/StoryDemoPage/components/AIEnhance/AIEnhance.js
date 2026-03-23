import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
//import { Modal, Tabs } from 'antd'

import Modal from 'antd/es/modal'
import Tabs from 'antd/es/tabs'

import 'antd/es/modal/style'
import 'antd/es/tabs/style'

import { CSSTransition, TransitionGroup, } from 'react-transition-group'
import AITextTab from './components/AITextTab/AITextTab'
import AIVoiceTab from './components/AIVoiceTab/AIVoiceTab'
import axios from '../../../../utils/axiosInstance'
import * as ENV from '../../../../config'
import {getVoices} from '../../../../utils/storyHelpers'
import Colors from '../../../../constants/mainColors'

import Spinner from '../../../../components/Spinner/Spinner'

// const { TabPane } = Tabs // Removed - deprecated in Ant Design v6, use items prop instead

const TAB_KEYS = {
  "AI Text": 'AI Text',
  "AI Voiceover": 'AI Voiceover',
}

const AIEnhance = ({
                     libraryObj,
                     workspaceId,
                     storyDemoId,
                     authData,
                     isOpen,
                     onCancel,
                     setShowConfetti,
                     reloadStoryDemo
}) => {
  let [activeTab, setActiveTab] = useState(TAB_KEYS["AI Text"])
  let [voices, setVoices] = useState([])

  useEffect(() => {

    getVoices(workspaceId, authData.token)
      .then(voices => {

        setVoices(voices)
      })


  }, [isOpen, libraryObj])

  function enhanceTextWithAI() {
    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/aiText`, {
      "type": "guide"
    }, {
      headers: {
        Authorization: `Bearer ${authData.token}`
      }
    })
  }
  function enhanceWithAIVoice(voiceId) {
    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/aiVoice`, {
      "voiceId": voiceId
    }, {
      headers: {
        Authorization: `Bearer ${authData.token}`
      }
    })
  }

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

        <TransitionGroup style={{ height: '100%' }} className="transition-group">
          <CSSTransition
            key={isOpen ? 'ai-enhance-open' : 'ai-enhance-closed'}
            timeout={{ enter: 300, exit: 300 }}
            classNames="fade"
          >
            <div style={{ width: '100%', height: '100%' }}>
            <MD.Tabs
                defaultActiveKey={activeTab}
                activeKey={activeTab}
                onChange={(newActiveTab) => {
                  setActiveTab(newActiveTab)
                }
                }
                animated={false}
                tabPosition={'top'}
                items={[
                  {
                    key: TAB_KEYS["AI Text"],
                    label: TAB_KEYS["AI Text"],
                    children: (
                      <AITextTab
                        enhanceTextWithAI={enhanceTextWithAI}
                        setShowConfetti={setShowConfetti}
                        onCancel={onCancel}
                        reloadStoryDemo={reloadStoryDemo}
                      />
                    )
                  },
                  {
                    key: TAB_KEYS["AI Voiceover"],
                    label: TAB_KEYS["AI Voiceover"],
                    children: (
                      <AIVoiceTab
                        enhanceWithAIVoice={enhanceWithAIVoice}
                        setShowConfetti={setShowConfetti}
                        onCancel={onCancel}
                        reloadStoryDemo={reloadStoryDemo}
                        voices={voices}
                      />
                    )
                  }
                ]}
              />

            </div>
          </CSSTransition>
        </TransitionGroup>
      </MD.Modal>
    </React.Fragment>
  )
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
  Tabs: styled(Tabs)`
    && .ant-tabs-tab{
     font-family: ${Colors.fontFamily};
    }

    && .ant-tabs-nav-list {
        width: 100%;
    }

    && .ant-tabs-tab {
        justify-content: center;
    }

   && .ant-tabs-bar {
      margin: 0 0px 0 0;
   }
    && .ant-tabs {
        overflow: initial;
    }
   @media (min-width:900px) {
    && .ant-tabs-nav {
        width: 100%;
    }


    && .ant-tabs-nav > div {
        width: 100%;
     display: flex;
        justify-content: space-evenly;
    }

    && .ant-tabs-nav > div .ant-tabs-tab {
        font-size: 1.1em;

        padding: 12px 0;
        text-align: center;
        width: 50%;
        margin: 0;

    }

   }
  `,
  SpinnerWrapper: styled.div`
    width: 80px;
    height: 80px;
    margin: 150px auto;
  `

}

export default AIEnhance
