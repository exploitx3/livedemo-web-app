import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import StoryDemosView from './components/StoryDemosView/StoryDemosView'
import AIRecordingsView from './components/AIRecordingsView/AIRecordingsView'
import AIAgentsView from './components/AIAgentsView/AIAgentsView'
import Header from '../../components/Header/Header'
// //import { Button, Col, Layout, Modal } from 'antd'

import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import Layout from 'antd/es/layout'
import Modal from 'antd/es/modal'
import Tabs from 'antd/es/tabs'
import 'antd/es/button/style'
import 'antd/es/col/style'
import 'antd/es/row/style'
import 'antd/es/layout/style'
import 'antd/es/modal/style'
import 'antd/es/tabs/style'

const { TabPane } = Tabs

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { authWithToken } from '../../actions/authActions'
import * as workspacesActions from '../../actions/workspacesActions'
import * as walkthroughActions from '../../actions/walkthroughActions'
import mainColors from '../../constants/mainColors'
import axios from '../../utils/axiosInstance'
import * as ENV from '../../config.json'
import TippyPremium from '../../components/TippyPremium/TippyPremium'

import {chromeAppAuthenticate, showErrorsForResponse} from '../../utils/helperFunctions'
import {updateCurrentSelectedWorkspace} from "../../actions/workspacesActions";

const { confirm } = Modal

const { Content, Footer, Sider } = Layout

const DEFAULT_REPORTS_LIMIT = 3

var chrome = chrome

var chromeRuntimeExists = false

if(chrome) {
  chromeRuntimeExists = true
}

const TABS = {
  LIVE_DEMOS: 'LiveDemos',
  AI_RECORDINGS: 'AI Recordings',
  AI_AGENTS: 'AI Agents',
}

function LiveDemosPage(props) {
  const navigate = useNavigate()
  let [liveDemos, setLiveDemos] = useState([])
  let [storyDemos, setStoryDemos] = useState(null)
  let [autoRecordings, setAutoRecordings] = useState(null)
  let [aiAgents, setAiAgents] = useState(null)
  let [activeTab, setActiveTab] = useState(TABS.LIVE_DEMOS)
  const allowAIAgents = props.authData?.featureFlags?.allowAIAgents === true

  function getLiveDemos(workspaceId, authToken) {
    return axios.get(`/workspaces/${workspaceId}/livedemos`,{
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => res.data)
  }

  function getStoryDemos(workspaceId, authToken) {
    return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories`,{
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => res.data)
  }

  function getAutoRecordings(workspaceId, authToken) {
    return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/auto-recordings`,{
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => res.data)
  }

  function getAiAgents(workspaceId, authToken) {
    return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/agents`,{
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => res.data)
  }


  useEffect(() => {
    if (props.authData.email) {


      if (chromeRuntimeExists) {

        chromeAppAuthenticate(props.authData)
      }
    }


  }, [])

  useEffect(() => {

    if (props.currentSelectedWorkspace && props.currentSelectedWorkspace._id) {

      setStoryDemos(null)
      setAutoRecordings(null)
      setAiAgents(null)

      Promise.all([
        getStoryDemos(props.currentSelectedWorkspace._id, props.authData.token)
          .then((storyDemosArray) => {
            setStoryDemos(storyDemosArray)
          }),
        getAutoRecordings(props.currentSelectedWorkspace._id, props.authData.token)
          .then((autoRecordingsArray) => {
            setAutoRecordings(autoRecordingsArray)
          }),
        ...(allowAIAgents ? [
          getAiAgents(props.currentSelectedWorkspace._id, props.authData.token)
            .then((agentsArray) => {
              setAiAgents(agentsArray)
            }),
        ] : []),
        ])
    }


  }, [props.currentSelectedWorkspace, allowAIAgents])


  useEffect(() => {
    if (!allowAIAgents && activeTab === TABS.AI_AGENTS) {
      setActiveTab(TABS.LIVE_DEMOS)
    }
  }, [allowAIAgents, activeTab])

  const refreshStoryDemos = useCallback(function refreshStoryDemos() {
    if (!props.currentSelectedWorkspace?._id) return Promise.resolve()

    return getStoryDemos(props.currentSelectedWorkspace._id, props.authData.token)
      .then((storyDemosArray) => {
        setStoryDemos(storyDemosArray)
      })
  }, [props.currentSelectedWorkspace, props.authData.token])

  const refreshAiAgents = useCallback(function refreshAiAgents() {
    if (!props.currentSelectedWorkspace?._id) return Promise.resolve()

    return getAiAgents(props.currentSelectedWorkspace._id, props.authData.token)
      .then((agentsArray) => setAiAgents(agentsArray))
  }, [props.currentSelectedWorkspace, props.authData.token])

  const createAiAgent = useCallback(function createAiAgent() {
    const workspaceId = props.currentSelectedWorkspace._id

    return axios.post(
      `${ENV.STORIES_API}/workspaces/${workspaceId}/agents`,
      { name: 'Untitled agent' },
      { headers: { Authorization: `Bearer ${props.authData.token}` } }
    )
      .then((res) => {
        navigate(`/workspace/${workspaceId}/aidemoagent/${res.data._id}`)
      })
      .catch((err) => showErrorsForResponse(err))
  }, [props.currentSelectedWorkspace, props.authData.token, navigate])

  const deleteAiAgent = useCallback(function deleteAiAgent(agent) {
    return axios.delete(
      `${ENV.STORIES_API}/workspaces/${agent.workspaceId}/agents/${agent._id}`,
      { headers: { Authorization: `Bearer ${props.authData.token}` } }
    )
      .then(() => refreshAiAgents())
      .catch((err) => showErrorsForResponse(err))
  }, [props.authData.token, refreshAiAgents])

  const setAiAgentPublished = useCallback(function setAiAgentPublished(agent, isPublished) {
    return axios.post(
      `${ENV.STORIES_API}/workspaces/${agent.workspaceId}/agents/${agent._id}/publish`,
      { isPublished },
      { headers: { Authorization: `Bearer ${props.authData.token}` } }
    )
      .then(() => refreshAiAgents())
      .catch((err) => showErrorsForResponse(err))
  }, [props.authData.token, refreshAiAgents])

  const cloneLiveDemo = useCallback(function cloneLiveDemo(liveDemo) {
    const authToken = props.authData.token

    return axios.post(
      `${ENV.STORIES_API}/workspaces/${liveDemo.workspaceId}/stories/${liveDemo._id.toString()}/clone`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    )
      .then(() => refreshStoryDemos())
      .catch((err) => showErrorsForResponse(err))
  }, [props.authData.token, refreshStoryDemos])

  const showConfirmDeleteLiveDemo = useCallback(function showConfirmDeleteLiveDemo(liveDemo) {

    let authToken = props.authData.token

    return confirm({
      title: `Are you sure you want to delete "${liveDemo.name}"?`,
      content: '',
      okText: 'Confirm',
      okButtonProps: { type: 'danger' },
      cancelText: 'Cancel',
      onOk() {
        return axios.delete(`${ENV.STORIES_API}/workspaces/${liveDemo.workspaceId}/stories/${liveDemo._id.toString()}`, { headers: { 'Authorization': `Bearer ${authToken}` } })
          .then(req => {

            return props.actions.authWithToken(authToken)
              .then(() => {
                return props.actions.updateCurrentSelectedWorkspace(authToken, liveDemo.workspaceId)
              })
          })
          .catch(err => {

            return showErrorsForResponse(err)
          })
      },
      onCancel() {
      },
    })
  }, [props.authData, props.actions])

  return (
    <React.Fragment>

      <Header title={'Demos'}/>
      <S.Content>

        <S.DashboardContainer id={'dashboard-container'}>
          <S.DashboardRow gutter={[16, 16]}>
            <S.WorkspacesCol xs={24} lg={24}>
              <S.TabsContainer>
                <S.Tabs
                  animated={false}
                  defaultActiveKey={activeTab}
                  activeKey={activeTab}
                  onChange={(newActiveTab) => {
                    if (newActiveTab === TABS.AI_AGENTS && !allowAIAgents) return
                    setActiveTab(newActiveTab)
                  }}
                  tabPosition={'top'}
                >
                  <TabPane tab={'LiveDemos'} key={TABS.LIVE_DEMOS} />
                  <TabPane tab={'AI Recordings'} key={TABS.AI_RECORDINGS} />
                  <TabPane
                    tab={
                      <TippyPremium
                        title="Unlock AI Agents"
                        description="Upgrade your plan to create and manage AI Demo Agents."
                        placement="bottom"
                        disabled={allowAIAgents}
                      >
                        <span style={{ cursor: allowAIAgents ? 'pointer' : 'not-allowed' }}>AI Agents</span>
                      </TippyPremium>
                    }
                    key={TABS.AI_AGENTS}
                  />
                </S.Tabs>
              </S.TabsContainer>
              {activeTab === TABS.LIVE_DEMOS && (
                <StoryDemosView
                  onDeleteLiveDemo={showConfirmDeleteLiveDemo}
                  onCloneLiveDemo={cloneLiveDemo}
                  storydemos={storyDemos}
                  isChromeAppAuthorized={props.isChromeAppAuthorized}
                  noDemoLimit={props.authData?.featureFlags?.noDemoLimit === true}
                />
              )}
              {activeTab === TABS.AI_RECORDINGS && (
                <AIRecordingsView
                  autoRecordings={autoRecordings}
                />
              )}
              {allowAIAgents && activeTab === TABS.AI_AGENTS && (
                <AIAgentsView
                  agents={aiAgents}
                  workspaceId={props.currentSelectedWorkspace?._id}
                  onCreate={createAiAgent}
                  onDelete={deleteAiAgent}
                  onSetPublished={setAiAgentPublished}
                />
              )}
            </S.WorkspacesCol>
          </S.DashboardRow>
        </S.DashboardContainer>

      </S.Content>

    </React.Fragment>
  )
}


const S = {
  ColTitle: styled.div`
    font-size: 1.3em;
    color: ${mainColors.primaryText};
    text-align: left;
    margin-left: 30px;
  `,
  TabsContainer: styled.div`
    font-size: 19px;
    display: flex;
    align-items: center;
    margin-left: 30px;
    margin-bottom: 8px;

    && div[role="tab"] {
      margin: 0px;
    }
  `,
  Tabs: styled(Tabs)`
    && .ant-tabs-tab {
      font-family: ${mainColors.fontFamily};
      justify-content: center;
      margin: 0px;
    }

    && .ant-tabs-nav-list {
    width: 350px;

    }

    && .ant-tabs-bar {
      margin: 0 0px 0 0;
      border-bottom: none;
    }

    && .ant-tabs {
      overflow: initial;
    }

    && .ant-tabs-nav {
      border-bottom: none;
      margin-bottom: 0;
    }

    && .ant-tabs-nav-wrap {
      border: 1px solid #ddd;
      border-radius: 14px;
    }

    && .ant-tabs-nav-container {
      border: 1px solid #ddd;
      border-radius: 14px;
    }

    @media (min-width: 900px) {
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
  Content: styled(Content)`
    && {
      background: ${mainColors.App.sidebarColor};
      padding: 16px;
      overflow: scroll;
      overflow-x: hidden;
      border-top-left-radius: 18px;
      border-top-right-radius: 4px;
      width: 100%;
      height: 100%;

      border-top: 1.6px solid #1070ff;
      border-left: 1.6px solid #1070ff;
    }

`,
  Wrapper: styled.div`
    display: block;
    height: 100%;
    width: 100%;
    background: ${mainColors.App.sidebarColor};
`,
  TutorialButton: styled(Button)`
      && {

        background: ${mainColors.primaryColor};
        color: white;
        display: inline-block;
        //margin: 0 20px;
        //padding: 5px 15px;
        border: 0.125rem solid ${mainColors.primaryColor};
        border-radius: 2rem;
        font-family: 'Baloo Chettan 2', cursive;
        font-size: 1.0em;
        text-decoration: none;
        transition: all 0.2s;
        cursor: pointer;
      }
      &&:hover {
        background: white;
        color: ${mainColors.primaryColor};
      }

`,
  DashboardContainer: styled.div`
    background: ${mainColors.App.sidebarColor};
    width: 100%;
  `,
  DashboardRow: styled(Row)`
    && {
      width: 100%;
    }
  `,
  WorkspacesCol: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
    }
  `,
  WorkspacesColRight: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
      text-align: center;
    }

    @media (max-width: 992px) {
      & {
        margin-top: 30px;
      }
    }
  `,
  ExitDemoButton: styled(Button)`
   margin-left: 25px;
  `
}


function mapStateToProps(state) {

  return {
    workspaces: state.workspacesReducer.workspaces,
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
    isChromeAppAuthorized: state.workspacesReducer.isChromeAppAuthorized,
    authData: state.authReducer.authData
  }
}

function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({
      authWithToken: authWithToken,
      updateAllWorkspacesForUser: workspacesActions.updateAllWorkspacesForUser,
      updateCurrentSelectedWorkspace: workspacesActions.updateCurrentSelectedWorkspace,
      runWalkthrough: walkthroughActions.runWalkthrough
    }, dispatch)

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveDemosPage)
