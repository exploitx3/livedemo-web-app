import React, {useEffect, useState} from 'react'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import {CSSTransition, TransitionGroup,} from 'react-transition-group'

import Header from '../../components/Header/Header'
import Spinner from '../../components/Spinner/Spinner'
import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Layout from 'antd/es/layout'
import Modal from 'antd/es/modal'
import Select from 'antd/es/select'

import Tabs from 'antd/es/tabs'
import 'antd/es/tabs/style'
import moment from 'moment'

import 'antd/es/table/style'
import 'antd/es/menu/style'
import 'antd/es/dropdown/style'
import 'antd/es/badge/style'

import 'antd/es/button/style'
import 'antd/es/col/style'
import 'antd/es/layout/style'
import 'antd/es/modal/style'
import 'antd/es/select/style'
import 'rrweb-player/dist/style.css'


import axios from 'axios'

import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {useNavigate, useLocation, useParams} from 'react-router-dom'
import styled from 'styled-components'
import {authWithToken} from '../../actions/authActions'
import * as workspacesActions from '../../actions/workspacesActions'
import * as walkthroughActions from '../../actions/walkthroughActions'
import mainColors from '../../constants/mainColors'

import ENV from '../../config'
import SessionsView from './components/SessionsView/SessionsView'
import LeadsView from './components/LeadsView/LeadsView'
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import DemosView from "./components/DemosView/DemosView";

const {TabPane} = Tabs

const {confirm} = Modal

const {Content, Footer, Sider} = Layout

const DEFAULT_REPORTS_LIMIT = 3

const {Option} = Select

const VIEW_OPTIONS = {
  '48H': 'Last 48 hours',
  '7D': 'Last 7 days',
  '30D': 'Last 30 days',
}

const VIEW_TYPES = {
  '48H': '48H',
  '7D': '7D',
  '30D': '30D',
}

const VIEW_TYPES_SUB_DAYS = {
  '48H': '2',
  '7D': '7',
  '30D': '30',
}

const VIEW_TYPES_FORMAT = {
  '48H': 'YYYY-MM-DD hh A',
  '7D': 'YYYY-MM-DD',
  '30D': 'YYYY-MM-DD',
}

const TAB_KEYS = {
  sessions: 'sessions',
  leads: 'leads',
}

const AnalyticsPage = function ({currentSelectedWorkspace, authData}) {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const [advanceInsights, setAdvanceInsights] = useState(authData.featureFlags.advanceInsights)

  let [activeTab, setActiveTab] = useState(TAB_KEYS.sessions)

  let [currentViewType, setCurrentViewType] = useState('30D')
  let [isSessionsLoading, setIsSessionsLoading] = useState(true)
  let [isLeadsLoading, setIsLeadsLoading] = useState(true)

  let [sessionsData, setSessionsData] = useState([])
  let [storyLines, setStoryLines] = useState({})
  let [tableSessions, setTableSessions] = useState([])

  let [liveDemoDocsWithMetrics, setLiveDemoDocsWithMetrics] = useState([])
  let [paginationMeta, setPaginationMeta] = useState(null)
  let [currentPage, setCurrentPage] = useState(1)
  let [currentLimit, setCurrentLimit] = useState(10)

  let [leadsData, setLeadsData] = useState([])
  let [leadsLines, setLeadsLines] = useState({})
  let [tableLeads, setTableLeads] = useState([])


  function formatLeadsByDays(viewType, leads, leadLines) {

    let hourlySessions = {}

    //by 30 days
    leads.forEach((msg) => {

      let date = moment(msg.createdAt).format(VIEW_TYPES_FORMAT[viewType])
      if (!hourlySessions[date]) {
        hourlySessions[date] = []
      }
      hourlySessions[date].push(msg)
    })

    let finalArray = Object.entries(hourlySessions).reduce((accum, [key, sessions]) => {
      let lineObjProps = {}
      sessions.forEach(session => {
        if (!lineObjProps[session.storyId._id]) {
          lineObjProps[session.storyId._id] = 0
        }

        lineObjProps[session.storyId._id]++
      })

      let createdAt = moment(key, VIEW_TYPES_FORMAT[viewType]).valueOf()
      accum.push({
        createdAt: createdAt,
        count: sessions.length,
        ...lineObjProps
      })

      return accum
    }, [])


    return finalArray
  }

  function formatByDays(viewType, sessions, storyLines) {

    let hourlySessions = {}

    //by 30 days
    sessions.forEach((msg) => {

      let date = moment(msg.startTimestamp).format(VIEW_TYPES_FORMAT[viewType])
      if (!hourlySessions[date]) {
        hourlySessions[date] = []
      }
      hourlySessions[date].push(msg)
    })

    let finalArray = Object.entries(hourlySessions).reduce((accum, [key, sessions]) => {
      let lineObjProps = {}
      sessions.forEach(session => {
        if (!lineObjProps[session.storyId._id]) {
          lineObjProps[session.storyId._id] = 0
        }

        lineObjProps[session.storyId._id]++
      })

      let startTimestamp = moment(key, VIEW_TYPES_FORMAT[viewType]).valueOf()
      accum.push({
        startTimestamp: startTimestamp,
        count: sessions.length,
        ...lineObjProps
      })

      return accum
    }, [])


    return finalArray
  }

  function getWorkspaceSessions(workspaceId, viewType, authToken, page = 1, limit = 10) {

    return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/sessions?viewType=${viewType}&page=${page}&limit=${limit}`, {
      headers: {
        Authorization: 'Bearer ' + authToken
      }
    })
      .then((res) => {

        return res.data
      })
      .catch((err) => {
        setIsSessionsLoading(false)
        throw err
      })
  }

  function getWorkspaceLeads(workspaceId, viewType, authToken) {

    return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/leads?viewType=${viewType}`, {
      headers: {
        Authorization: 'Bearer ' + authToken
      }
    })
      .then((res) => {

        return res.data
      })
      .catch((err) => {
        setIsLeadsLoading(false)
        throw err
      })
  }


  function processSessions(viewType, sessionsData) {

    let newStoryLines = {}
    sessionsData.forEach(session => {
      if (!newStoryLines[session.storyId._id]) {
        newStoryLines[session.storyId._id] = {
          type: 'monotone',
          dataKey: `${session.storyId._id}`,
          storyName: `${session.storyId.name}`,
          stroke: `${mainColors.primaryColor}`
        }
      }
    })


    let newSessionsData = formatByDays(viewType, sessionsData, newStoryLines)

    console.log(newSessionsData)

    setStoryLines(newStoryLines)

    setSessionsData(newSessionsData)
debugger
    let formattedForTable = formatSessionsForTable(sessionsData)

    setTableSessions(formattedForTable)
  }


  function processLeads(viewType, leadsData) {

    let newLeadLines = {}
    leadsData.forEach(lead => {
      if (!newLeadLines[lead.storyId._id]) {
        newLeadLines[lead.storyId._id] = {
          type: 'monotone',
          dataKey: `${lead.storyId._id}`,
          storyName: `${lead.storyId.name}`,
          stroke: `${mainColors.primaryColor}`
        }
      }
    })


    let newLeadsData = formatLeadsByDays(viewType, leadsData, newLeadLines)

    console.log(newLeadsData)

    setLeadsLines(newLeadLines)

    setLeadsData(newLeadsData)

    let formattedForTable = formatLeadsForTable(leadsData)

    setTableLeads(formattedForTable)
  }


  useEffect(() => {

    if (currentSelectedWorkspace && currentSelectedWorkspace._id) {
      setIsLeadsLoading(true)
      setIsSessionsLoading(true)
      setCurrentPage(1) // Reset to first page when workspace changes

      Promise.all([
        getWorkspaceSessions(currentSelectedWorkspace._id, currentViewType, authData.token, 1, currentLimit)
          .then((sessionsData) => {

            setLiveDemoDocsWithMetrics(sessionsData.liveDemoDocsWithMetrics)
            setPaginationMeta(sessionsData.meta)
            // processLiveDemos(currentViewType, sessionsData.liveDemoDocsWithMetrics)
            processSessions(currentViewType, sessionsData.sessions)
          })
          .then(() => {
            setIsSessionsLoading(false)
          }),
        getWorkspaceLeads(currentSelectedWorkspace._id, currentViewType, authData.token)
          .then((leadsData) => {

            processLeads(currentViewType, leadsData)
          })
          .then(() => {
            setIsLeadsLoading(false)
          })
      ])

    }

  }, [currentSelectedWorkspace])


  function handleViewChange(value) {
    let text = VIEW_OPTIONS[value]

    let newViewType = VIEW_TYPES[value]

    setCurrentViewType(value)
    setCurrentPage(1) // Reset to first page when view type changes

    Promise.all([
      getWorkspaceSessions(currentSelectedWorkspace._id, newViewType, authData.token, 1, currentLimit)
        .then((sessionsData) => {

          setLiveDemoDocsWithMetrics(sessionsData.liveDemoDocsWithMetrics)
          setPaginationMeta(sessionsData.meta)
          processSessions(newViewType, sessionsData.sessions)
        })
        .then(() => {
          setIsSessionsLoading(false)
        }),
      getWorkspaceLeads(currentSelectedWorkspace._id, newViewType, authData.token)
        .then((leadsData) => {

          processLeads(newViewType, leadsData)
        })
        .then(() => {
          setIsLeadsLoading(false)
        })
    ])


    console.log(`selected ${value}`)
    console.log(`selected ${text}`)
  }

  console.log(sessionsData)

  function formatSessionsForTable(sessionsData) {
    sessionsData = sessionsData.filter(s => s.endTimestamp)


    return sessionsData.map(session => {
      let stringName = (session.clientIpData && session.clientIpData.city && session.clientIpData.region) ? `${session.clientIpData.city}, ${session.clientIpData.region}` : session.clientIpData && session.clientIpData.ip ? session.clientIpData.ip : ''
      let name = `${session.clientIpData && session.clientIpData.flag && session.clientIpData.flag.emoji} ${stringName}`

      return {

        name: name,
        liveDemoName: session.storyId.name,
        liveDemoId: session.storyId._id,
        sessionId: session._id,
        workspaceId: session.workspaceId,
        durationSeconds: moment.duration(session.duration, 'milliseconds').asSeconds(),
        country: session.clientIpData && session.clientIpData.country ? session.clientIpData.country : '',
        startDate: moment(session.startTimestamp).format('hh:mm:ss A, D MMMM YYYY'),
        startDateTime: moment(session.startTimestamp).toDate(),
        eventsClickCount: session.eventsClickCount ? session.eventsClickCount : 0,
        dropOffStep: session.dropOffStep,
      }

    })
  }

  function formatLeadsForTable(leadsData) {

    return leadsData.map(lead => {
      let name = `${lead.sessionId && lead.sessionId.clientIpData && lead.sessionId.clientIpData.flag && lead.sessionId.clientIpData.flag.emoji || ''} ${lead.data && lead.data.name}`

      return {

        name: name,
        leadName: lead.data.name,
        leadEmail: lead.data.email,
        liveDemoName: lead.storyId.name,
        liveDemoId: lead.storyId._id,
        sessionId: lead.sessionId && lead.sessionId._id ? lead.sessionId._id : '',
        workspaceId: lead.workspaceId,
        country: lead.sessionId && lead.sessionId.clientIpData.country ? lead.sessionId.clientIpData.country : '',
        createdAt: moment(lead.createdAt).format('hh:mm:ss A, D MMMM YYYY'),
      }

    })
  }

  return (
    <React.Fragment>

      <Header title={'Analytics'}/>

      
      <S.Content>
      {!advanceInsights && (
        <S.Banner>
          <S.BannerInner>
            <S.BannerLeft>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 18, height: 18, color: '#3b82f6', flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <S.BannerText>
                You're viewing <strong>limited analytics</strong> data. Upgrade to unlock <strong>Advanced Demo Insights</strong> and <strong>Session Recordings</strong>.
              </S.BannerText>
            </S.BannerLeft>
            <S.UpgradeButton onClick={() => navigate('/billing')}>
              Upgrade
            </S.UpgradeButton>
          </S.BannerInner>
        </S.Banner>
      )}

        <div id={'dashboard-container'} style={{background: 'white'}}>
          <S.WorkspacesCol xs={24} lg={24}>
            <S.ViewsRow>
              <S.ViewsTitle>Views</S.ViewsTitle>
              <Select defaultValue={currentViewType} style={{width: 160}} onChange={handleViewChange}>
                <Option value={'48H'}>{VIEW_OPTIONS['48H']}</Option>
                <Option value={'7D'}>{VIEW_OPTIONS['7D']}</Option>
                <Option value={'30D'}>{VIEW_OPTIONS['30D']}</Option>
              </Select>
              {isSessionsLoading || isLeadsLoading ? (
                <S.SpinnerWrapper>
                  <Spinner/>
                </S.SpinnerWrapper>
              ) : ('')}
              <S.TabsContainer>
                <S.Tabs
                  className={"switch-tabs"}
                  animated={false}
                  defaultActiveKey={activeTab}
                  activeKey={activeTab}
                  onChange={(newActiveTab) => {
                    setActiveTab(newActiveTab)
                  }
                  }
                  tabPosition={'top'}
                >
                  <TabPane
                    tab={'📈 Sessions'}
                    key={TAB_KEYS.sessions}
                  ></TabPane>
                  <TabPane
                    tab={
                      !advanceInsights ? (
                        <Tippy content="Upgrade to unlock" placement="top" arrow={true}>
                          <span style={{ cursor: 'not-allowed' }}>🔥 Leads</span>
                        </Tippy>
                      ) : '🔥 Leads'
                    }
                    key={TAB_KEYS.leads}
                    disabled={!advanceInsights}
                  ></TabPane>
                </S.Tabs>
              </S.TabsContainer>
            </S.ViewsRow>
            <TransitionGroup style={{height: '100%'}} className="transition-group">
              <CSSTransition
                style={{width: '100%', height: '100%'}}
                key={location.key}
                timeout={{enter: 300, exit: 300}}
                classNames="fade"
              >
                <div className={'view-tabs'}>
                  <S.Tabs
                    defaultActiveKey={activeTab}
                    activeKey={activeTab}
                    onChange={(newActiveTab) => {
                      setActiveTab(newActiveTab)
                    }
                    }
                    animated={false}
                    tabPosition={'top'}
                  >
                    <TabPane
                      tab={'Sessions'}
                      key={TAB_KEYS.sessions}
                    >
                      <React.Fragment>
                        <S.ChartWrapper>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={sessionsData}>
                              {Object.entries(storyLines).map(([key, value]) => {
                                let {type, dataKey, stroke} = value

                                console.log(value)
                                return (
                                  <Line key={dataKey} type={type} dataKey={dataKey} stroke={stroke}/>
                                )
                              })}
                              <CartesianGrid stroke="#eeeeee"/>
                              <XAxis
                                dataKey={'startTimestamp'}
                                tickFormatter={unixTime => {
                                  // console.log(unixTime)
                                  return moment(unixTime).format(VIEW_TYPES_FORMAT[currentViewType])
                                }}
                                domain={[moment().valueOf(), moment().subtract(VIEW_TYPES_SUB_DAYS[currentViewType], 'day').valueOf()]}
                                type="number"
                              />
                              <YAxis
                                allowDecimals={false}
                                dataKey="count"
                                label={{value: 'views', angle: -90, position: 'insideLeft'}}

                              />
                              <Tooltip
                                labelFormatter={(unixTime) => {
                                  // console.log(unixTime)
                                  return moment(unixTime).format('YYYY-MM-DD')

                                }}
                                formatter={(value, name, props) => {
                                  let storyName = storyLines[name] && storyLines[name].storyName ? storyLines[name].storyName : ''


                                  return [value, storyName]
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </S.ChartWrapper>
                        <DemosView
                          advanceInsights={advanceInsights}
                          liveDemoDocsWithMetrics={liveDemoDocsWithMetrics}
                          sessionsData={sessionsData}
                          tableSessions={tableSessions}
                          storyLines={storyLines}
                          currentViewType={currentViewType}
                          paginationMeta={paginationMeta}
                          currentPage={currentPage}
                          currentLimit={currentLimit}
                          onPaginationChange={(page, limit) => {
                            setCurrentPage(page)
                            setCurrentLimit(limit)
                            setIsSessionsLoading(true)
                            getWorkspaceSessions(currentSelectedWorkspace._id, currentViewType, authData.token, page, limit)
                              .then((sessionsData) => {
                                setLiveDemoDocsWithMetrics(sessionsData.liveDemoDocsWithMetrics)
                                setPaginationMeta(sessionsData.meta)
                                processSessions(currentViewType, sessionsData.sessions)
                              })
                              .then(() => {
                                setIsSessionsLoading(false)
                              })
                          }}
                        />
                        {/*<SessionsView*/}
                        {/*  sessionsData={sessionsData}*/}
                        {/*  tableSessions={tableSessions}*/}
                        {/*  storyLines={storyLines}*/}
                        {/*  currentViewType={currentViewType}*/}
                        {/*/>*/}
                      </React.Fragment>
                    </TabPane>
                    <TabPane
                      tab={'Leads'}
                      key={TAB_KEYS.leads}
                    >
                      <LeadsView
                        leadsData={leadsData}
                        tableLeads={tableLeads}
                        leadsLines={leadsLines}
                        currentViewType={currentViewType}
                      />
                    </TabPane>
                  </S.Tabs>

                </div>
              </CSSTransition>
            </TransitionGroup>
          </S.WorkspacesCol>

        </div>

      </S.Content>

    </React.Fragment>
  )
}

const S = {
  Banner: styled.div`
    background: #eff6ff;
    border-bottom: 1px solid #bfdbfe;
    padding: 10px 32px;
    width: 100%;
    box-sizing: border-box;
  `,
  BannerInner: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5%;
  `,
  BannerLeft: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  `,
  BannerText: styled.span`
    font-size: 0.8125rem;
    color: #1e40af;
    line-height: 1.4;
  `,
  UpgradeButton: styled.button`
    background: ${mainColors.primaryColor};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 6px 16px;
    font-size: 0.9125rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: opacity 0.15s ease;

    &:hover { opacity: 0.88; }
    &:active { opacity: 0.75; }
  `,
  MdIcon: styled.i`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    font-size: 16px;
    height: 40px;
    line-height: 40px;

    && svg {
      width: 16px;
      height: 16px;
      fill: #1070ff;
    }

  `,
  TabLabel: styled.span`

  `,
  TabsContainer: styled.div`
    font-size: 19px;
    flex-grow: 1;
    justify-content: flex-end;
    align-items: center;

    justify-content: flex-end;
    display: flex;

    && div[role="tab"] {
      margin: 0px;
      //width: 250px;
    }
  `,
  Tabs: styled(Tabs)`
    &&.switch-tabs {
      width: 250px;
    }

    && .ant-tabs-tab{
     font-family: ${mainColors.fontFamily};
    }

    && .ant-tabs-nav-list {
        width: 100%;
    }

    && .ant-tabs-tab {
        justify-content: center;
        margin: 0px;
    }

   && .ant-tabs-bar {
      margin: 0 0px 0 0;
      border-bottom: none;
   }
    && .ant-tabs {
        overflow: initial;
    }

    /* Ant Design v5/v6 compatible selectors */
    && .ant-tabs-nav {
      border-bottom: none;
      margin-bottom: 0;
    }

    && .ant-tabs-ink-bar {
      //left: 10%;
      //width: 40%!important;
    }

    && .ant-tabs-nav-wrap {
      border: 1px solid #ddd;
      border-radius: 14px;
    }

    /* Legacy v4 selectors for backward compatibility */
    && .ant-tabs-nav-container {
      border: 1px solid #ddd;
      border-radius: 14px;
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
//   DashboardContainer: styled.div`
//     border-top-left-radius: 4px;
//     padding: 24px;
//     background: white;
//     height: 100%;
//     width: 100%;
//
//
// `,
  SpinnerWrapper: styled.div`
    position: relative;
    width: 50px;
    height: 30px;
    display: block;
    margin-left: 60px;
  `,
  ChartWrapper: styled.div`
    padding: 20px;
    border: 2px solid #F3F4F6;
    border-radius: 8px;
    margin-bottom: 20px;

  `,
  SessionsListWrapper: styled.div`
    padding: 20px;
    border: 2px solid #F3F4F6;
    border-radius: 8px;
  `,
  SessionsList__Title: styled.p`
    margin: 0px 0px 20px 0px;
    font-size: 1.3em;
    color: #111;
    font-family: ${mainColors.fontFamily};
  `,
  ViewsRow: styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;

  `,
  ViewsTitle: styled.p`
    margin: 0px 15px 0px 0px;
    font-size: 1.3em;
    color: #111;
    font-family: ${mainColors.fontFamily};

  `,
  Content: styled(Content)`
    && {
      background: white;
      // padding: 16px;
      overflow: scroll;
      overflow-x: hidden;
      border-top-left-radius: 18px;
      border-top-right-radius: 4px;
      width: 100%;
      height: 100%;

      border-top: 1.6px solid #1070ff;
      border-left: 1.6px solid #1070ff;
    }

    /* Hide tabs bar in view-tabs for both v5/v6 */
    .view-tabs div.ant-tabs-bar.ant-tabs-top-bar {
      display: none
    }
    
    .view-tabs .ant-tabs-nav {
      display: none
    }

  `,
  Wrapper: styled.div`
    display: block;
    height: 100%;
    width: 100%;
    background: white;
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
  WorkspacesCol: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
      padding: 35px;
    }
  `,
  WorkspacesColRight: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
      text-align: center;

    }

    @media (max-width: 567px) {

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
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
    authData: state.authReducer.authData
  }
}

function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({
      authWithToken: authWithToken,
      updateAllWorkspacesForUser: workspacesActions.updateAllWorkspacesForUser,
      runWalkthrough: walkthroughActions.runWalkthrough
    }, dispatch)

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsPage)
