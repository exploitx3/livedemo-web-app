import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'

import ViewSession from './../../components/ViewSession/ViewSession'
import FilterDropdown from './components/FilterDropdown'
import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Layout from 'antd/es/layout'

import Tabs from 'antd/es/tabs'
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts'
import moment from 'moment'

import Table from 'antd/es/table'

import 'antd/es/table/style'
import 'antd/es/checkbox/style'
import 'antd/es/menu/style'
import 'antd/es/dropdown/style'
import 'antd/es/badge/style'

import 'antd/es/button/style'
import 'antd/es/col/style'
import 'antd/es/layout/style'
import 'antd/es/select/style'
import 'rrweb-player/dist/style.css'


import styled from 'styled-components'
import mainColors from '../../../../constants/mainColors'
import Icon from "../../../../components/Icon/Icon";

const {TabPane} = Tabs

const {Content, Footer, Sider} = Layout


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

const SessionsView = function ({advanceInsights, sessionsData, tableSessions, storyLines, currentViewType}) {
  const navigate = useNavigate()
  let [expandedRowKeys, setExpandedRowKeys] = useState({})
  let [innerTableSessions, setInnerTableSession] = useState([...tableSessions])

  let [filterTableSessionsMap, setFilterTableSessionsMap] = useState(
    {
      'name': getResetFilterTableSessions(tableSessions),
      'liveDemoName': getResetFilterTableSessions(tableSessions),
      'country': getResetFilterTableSessions(tableSessions),
    }
  )

  function getResetFilterTableSessions(tableSessions) {
    return [...tableSessions].map((item) => {
      return {
        ...item,
        filterSelected: true,
      }
    })
  }

  useEffect(() => {
    setInnerTableSession(tableSessions)
    setFilterTableSessionsMap({
      'name': getResetFilterTableSessions(tableSessions),
      'liveDemoName': getResetFilterTableSessions(tableSessions),
      'country': getResetFilterTableSessions(tableSessions),
    })
  }, [tableSessions])

  const expandedRowRender = (record, sessionIndex, indent, expanded) => {

    if (!advanceInsights) {
      return (
        <S.UpgradePrompt>
          <S.UpgradePromptText>
            Upgrade to unlock <strong>Session Recordings</strong>
          </S.UpgradePromptText>
          <S.UpgradeButton onClick={() => navigate('/billing')}>
            Upgrade
          </S.UpgradeButton>
        </S.UpgradePrompt>
      )
    }

    return <ViewSession
      session={record}
      workspaceId={record.workspaceId}
      sessionId={record.sessionId}
      storyId={record.liveDemoId}
      sessionIndex={sessionIndex}
    />
  }

  function globalFilterReset(columnNames) {

    let newFilterTableSessionsMap = {}
    columnNames.forEach(columnName => {
      newFilterTableSessionsMap[columnName] = getResetFilterTableSessions(tableSessions)
    })

    setFilterTableSessionsMap(newFilterTableSessionsMap)
    setInnerTableSession(tableSessions)
  }

  function globalFilterConfirm(columnNames, filteredSessionsMap) {
    let finalTableSessionsMap = {}
    let excludedMap = {}
    for (let i = 0; i < columnNames.length; i++) {
      let columnName = columnNames[i]

      filteredSessionsMap[columnName].forEach(session => {
        if (session.filterSelected) {
          finalTableSessionsMap[session.sessionId] = session
        } else {
          excludedMap[session.sessionId] = session
        }
      })
    }

    setFilterTableSessionsMap(filteredSessionsMap)

    let sortedTableSessions = Object.values(finalTableSessionsMap).filter(sess => !excludedMap[sess.sessionId]).sort((a, b) => b.startDateTime - a.startDateTime)
    setInnerTableSession(sortedTableSessions)
  }

  function addColumnsProps(columnName, tableSessions) {
    return {

      filterIcon: filtered => {
        return (<Icon type="filter" theme={'filled'} style={{color: filtered ? '#1890ff' : undefined}}/>)
      },
      filterDropdown: (props) => {
        return <FilterDropdown
          setSelectedKeys={props.setSelectedKeys}
          selectedKeys={props.selectedKeys}
          confirm={(itemsMap) => {
            let newTableSessions = tableSessions.map((session) => {
              return {
                ...session,
                filterSelected: itemsMap[session[columnName]] && itemsMap[session[columnName]].filterSelected
              }
            })

            tableSessions.forEach(session => {
              if (itemsMap[session[columnName]] &&
                itemsMap[session[columnName]].filterSelected &&
                !newTableSessions.find(sess => sess.sessionId === session.sessionId)
              ) {
                newTableSessions.push(session)
              }
            })

            let newFilteredSessionsMap = {
              ...filterTableSessionsMap,
              [columnName]: newTableSessions
            }


            globalFilterConfirm(['name', 'liveDemoName', 'country'], newFilteredSessionsMap)
          }}
          clearFilters={() => {
            globalFilterReset(['name', 'liveDemoName', 'country'])
          }}
          itemsMap={
            filterTableSessionsMap[columnName].reduce((iter, tableSession) => {
              iter[tableSession[columnName]] = tableSession
              return iter
            }, {})
          }
          filterColumnName={columnName}
        />
      },
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ...addColumnsProps('name', tableSessions),
      width: '15%',

    },
    {
      title: 'Livedemo',
      dataIndex: 'liveDemoName',
      key: 'liveDemoName',
      ...addColumnsProps('liveDemoName', tableSessions),
    },
    {
      title: 'Duration', dataIndex: 'durationSeconds', key: 'durationSeconds', render: (durationSeconds) => (
        <span>{parseInt(durationSeconds)} sec</span>
      )
    },
    {
      title: 'Events Count', dataIndex: 'eventsClickCount', key: 'eventsClickCount', render: (eventsClickCount) => (
        <span>{eventsClickCount === 0 ? 'N/A' : parseInt(eventsClickCount)}</span>
      )
    },
    {
      title: 'Drop-off Step',
      dataIndex: 'dropOffStep',
      key: 'dropOffStep',
      render: (dropOffStep) => (
        <span className={`locked-cell-value`}>{dropOffStep === undefined || dropOffStep === null ? 'N/A' : ++dropOffStep}</span>
      ),
      width: '2%'
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      ...addColumnsProps('country', tableSessions),
    },
    {title: 'Session start', dataIndex: 'startDate', key: 'startDate'},
  ]

  return (
    <S.SessionsListWrapper className={!advanceInsights ? 'locked' : ''}>

      <S.SessionsList__Title>Sessions</S.SessionsList__Title>
        <Table
          expandRowByClick={true}
          onExpand={(expanded, record) => {


            let newExpandedRowKeys = JSON.parse(JSON.stringify(expandedRowKeys))
            if (!newExpandedRowKeys[record.sessionId] && expanded === true) {

              newExpandedRowKeys[record.sessionId] = true
            } else if (newExpandedRowKeys[record.sessionId] && expanded === false) {

              delete newExpandedRowKeys[record.sessionId]
            }

            setExpandedRowKeys(newExpandedRowKeys)
          }}
          expandedRowKeys={Object.keys(expandedRowKeys)}
          columns={columns}
          rowKey={(record) => record.sessionId}
          expandedRowRender={expandedRowRender}
          dataSource={innerTableSessions}
          onRow={(record) => ({
            style: { cursor: 'pointer' }
          })}
          pagination={{
            position: 'bottom',
            size: 'small',
            pageSize: 25
          }}
        />

    </S.SessionsListWrapper>
  )
}

const S = {
  UpgradePrompt: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px 16px;
    text-align: center;
  `,
  UpgradePromptText: styled.p`
    margin: 0;
    font-size: 0.9375rem;
    color: #374151;
  `,
  UpgradeButton: styled.button`
    background: ${mainColors.primaryColor};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 20px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover { opacity: 0.88; }
    &:active { opacity: 0.75; }
  `,
  TabsContainer: styled.div`
    font-size: 19px;
    flex-grow: 1;
    justify-content: flex-end;
    align-items: center;

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

    &.locked .locked-cell-value {
      filter: blur(4px);
      user-select: none;
      pointer-events: none;
    }
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
      float: unset !important;
      display: inline-block;
      vertical-align: top;
      padding: 25px;
    }
  `,
  WorkspacesColRight: styled(Col)`
    && {
      float: unset !important;
      display: inline-block;
      vertical-align: top;
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


export default SessionsView
