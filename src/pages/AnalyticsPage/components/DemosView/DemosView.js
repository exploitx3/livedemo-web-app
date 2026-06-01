import React, { useState } from 'react'

import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Layout from 'antd/es/layout'
import Table from 'antd/es/table'

import 'antd/es/table/style'
import 'antd/es/button/style'
import 'antd/es/col/style'
import 'antd/es/layout/style'

import styled from 'styled-components'
import mainColors from '../../../../constants/mainColors'
import moment from 'moment'
import DemoView from '../DemoView/DemoView'

const {Content} = Layout

const DemosView = function ({advanceInsights, liveDemoDocsWithMetrics, sessionsData, tableSessions, storyLines, currentViewType, paginationMeta, currentPage, currentLimit, onPaginationChange}) {
  const [selectedDemo, setSelectedDemo] = useState(null)

  // Format milliseconds to human-readable format using moment.js
  const formatTimeSpent = (milliseconds) => {
    if (!milliseconds || milliseconds === 0) return '0 seconds'

    return moment.duration(milliseconds).humanize()
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <span style={{fontWeight: 500}}>{name}</span>
      )
    },
    {
      title: 'Time Spent',
      dataIndex: 'timeSpent',
      key: 'timeSpent',
      render: (timeSpent) => (
        <span>{formatTimeSpent(timeSpent)}</span>
      ),
      sorter: (a, b) => a.timeSpent - b.timeSpent,
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      render: (views) => (
        <span>{views || 0}</span>
      ),
      sorter: (a, b) => a.views - b.views,
    },
    {
      title: 'Unique Users',
      dataIndex: 'uniqueUsers',
      key: 'uniqueUsers',
      render: (uniqueUsers) => (
        <span className="locked-cell-value">{uniqueUsers || 0}</span>
      ),
      sorter: (a, b) => a.uniqueUsers - b.uniqueUsers,
    },
    {
      title: 'Engagement Rate',
      dataIndex: 'engagementRate',
      key: 'engagementRate',
      render: (engagementRate) => (
        <span className="locked-cell-value">{engagementRate ? `${engagementRate.toFixed(1)}%` : '0%'}</span>
      ),
      sorter: (a, b) => a.engagementRate - b.engagementRate,
    },
    {
      title: 'Completion Rate',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (completionRate) => (
        <span className="locked-cell-value">{completionRate ? `${completionRate.toFixed(1)}%` : '0%'}</span>
      ),
      sorter: (a, b) => a.completionRate - b.completionRate,
    },
    {
      title: 'Leads',
      dataIndex: 'leads',
      key: 'leads',
      render: (leads) => (
        <span className="locked-cell-value">{leads || 0}</span>
      ),
      sorter: (a, b) => a.leads - b.leads,
    },
  ]
  
  return (
    <S.DemosViewWrapper>

{selectedDemo ? (
    <DemoView
      demo={selectedDemo}
      advanceInsights={advanceInsights}
      sessionsData={sessionsData}
      tableSessions={
        (tableSessions || []).filter(session =>
          session.liveDemoId === selectedDemo._id.toString() || session.liveDemoId === selectedDemo._id
        )
      }
      storyLines={storyLines}
      currentViewType={currentViewType}
      onBack={() => setSelectedDemo(null)}
    />
  ) : (
    <React.Fragment>
      <S.SessionsList__Title>Demos</S.SessionsList__Title>
        <S.TableWrapper className={!advanceInsights ? 'locked' : ''}>
        <Table
          columns={columns}
          rowKey={(record) => record._id}
          dataSource={liveDemoDocsWithMetrics || []}
          onRow={(record) => ({
            onClick: () => setSelectedDemo(record),
            style: { cursor: 'pointer' }
          })}
          pagination={{
            position: 'bottom',
            size: 'small',
            current: currentPage || 1,
            pageSize: currentLimit || 10,
            total: paginationMeta?.pagination?.totalItems || 0,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, pageSize) => {
              if (onPaginationChange) {
                onPaginationChange(page, pageSize)
              }
            },
            onShowSizeChange: (current, size) => {
              if (onPaginationChange) {
                onPaginationChange(1, size)
              }
            }
          }}
        />
        </S.TableWrapper>
      </React.Fragment>
    )}
    </S.DemosViewWrapper>
  )
}

const S = {
  TableWrapper: styled.div`
    &.locked .locked-cell-value {
      filter: blur(4px);
      user-select: none;
      pointer-events: none;
    }
  `,
  DemosViewWrapper: styled.div`
    padding: 20px;
    border: 2px solid #F3F4F6;
    border-radius: 8px;
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


export default DemosView
