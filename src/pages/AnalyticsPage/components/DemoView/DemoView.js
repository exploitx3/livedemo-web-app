import React from 'react'
import styled from 'styled-components'
import { MdTouchApp, MdPerson, MdPercent, MdDescription, MdInfo, MdExitToApp } from 'react-icons/md'
import Breadcrumb from 'antd/es/breadcrumb'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/shift-away.css'
import mainColors from '../../../../constants/mainColors'
import 'antd/es/breadcrumb/style'

import SessionsView from '../SessionsView/SessionsView'

const DemoView = ({ demo, advanceInsights, sessionsData, tableSessions, storyLines, currentViewType, onBack }) => {

  const metrics = [
    {
      icon: MdTouchApp,
      title: 'Total Views',
      value: demo.views || 0,
      unit: '',
      tooltip: 'Total number of times this demo has been viewed by all users'
    },
    {
      icon: MdPerson,
      title: 'Unique Users',
      value: demo.uniqueUsers || 0,
      unit: '',
      tooltip: 'Number of unique visitors based on IP addresses',
      hidden: true,
    },
    {
      icon: MdPercent,
      title: 'Engagement rate',
      value: demo.engagementRate ? demo.engagementRate.toFixed(1) : 0,
      unit: '%',
      tooltip: 'Percentage of sessions where users moved from first step to second step',
      hidden: true,
    },
    {
      icon: MdPercent,
      title: 'Completion rate',
      value: demo.completionRate ? demo.completionRate.toFixed(1) : 0,
      unit: '%',
      tooltip: 'Percentage of sessions where users completed the entire demo',
      hidden: true,
    },
    {
      icon: MdExitToApp,
      title: 'Top Drop-off Step',
      value: demo.topDropOffStep !== null && demo.topDropOffStep !== undefined ? ++demo.topDropOffStep : '-',
      unit: '',
      tooltip: 'The step number where most users dropped off during the demo',
      hidden: true,
    },
    {
      icon: MdDescription,
      title: 'Captured Leads',
      value: demo.leads || 0,
      unit: '',
      tooltip: 'Total number of leads captured from this demo',
      hidden: true,
    },
  ]

  return (
    <S.Container>
      <S.Header>
        <S.BreadcrumbWrapper>
          <Breadcrumb>
            <Breadcrumb.Item>
              <S.BreadcrumbLink onClick={onBack}>All Demos</S.BreadcrumbLink>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{demo.name}</Breadcrumb.Item>
          </Breadcrumb>
        </S.BreadcrumbWrapper>
      </S.Header>

      <S.MetricsContainer>
        {metrics.map((metric, index) => (
          <S.MetricCard
            className={`metric-card`}
            key={index}
          >
            <S.MetricHeader>
              <S.IconWrapper>
                <metric.icon size={20} />
              </S.IconWrapper>
              <S.MetricTitle>{metric.title}</S.MetricTitle>
              <S.InfoIcon>
              <Tippy
                content={metric.tooltip}
                animation="shift-away"
                placement="top"
                arrow={true}
              >
                <span style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <MdInfo size={18} />
                </span>
              </Tippy>
            </S.InfoIcon>
            </S.MetricHeader>
            
            <S.MetricValue className={!advanceInsights && metric.hidden ? 'metric-locked' : ''}>
              {metric.value}{metric.unit}
            </S.MetricValue>
          </S.MetricCard>
        ))}
      </S.MetricsContainer>

      <SessionsView
        sessionsData={sessionsData || []}
        tableSessions={tableSessions || []}
        storyLines={storyLines || {}}
        currentViewType={currentViewType || '7D'}
        advanceInsights={advanceInsights}
      />
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    width: 100%;
  `,
  Header: styled.div`
    margin-bottom: 24px;
  `,
  BreadcrumbWrapper: styled.div`
    margin-bottom: 16px;
    
    .ant-breadcrumb {
      font-size: 16px;
    }
    
    .ant-breadcrumb-separator {
      color: #8c8c8c;
    }
    
    .ant-breadcrumb > span:last-child {
      color: #262626;
      font-weight: 500;
    }
  `,
  BreadcrumbLink: styled.span`
    color: #1890ff;
    cursor: pointer;
    transition: color 0.2s;
    
    &:hover {
      color: #40a9ff;
    }
  `,
  MetricsContainer: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 32px;
    padding: 10px;

    @media (min-width: 768px) {
      flex-direction: row;
    }

    .metric-locked {
      filter: blur(5px);
      user-select: none;
      pointer-events: none;
    }
  `,
  MetricCard: styled.div`
    flex: 1;
    padding: 16px;
    height: 126px;
    border-radius: 16px;
    background-color: white;
    box-shadow: 0 0 0 1px rgba(63, 70, 75, 0.1), 0 1px 3px rgba(63, 70, 75, 0.1);
    transition: background-color 0.2s;
    position: relative;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &:hover {
      background-color: #fafafa;
    }
  `,
  InfoIcon: styled.div`
    position: absolute;
    top: 8px;
    right: 8px;
    color: rgb(82, 82, 91);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;

    &:hover {
      color: ${mainColors.primaryColor};
    }
  `,
  MetricHeader: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  `,
  IconWrapper: styled.div`
    color: #3f3f46;
    display: flex;
    align-items: center;
    justify-content: center;

    .metric-card:hover & {
      color: #27272a;
    }
  `,
  MetricTitle: styled.div`
    flex: 1;
    color: #52525b;
    font-weight: 500;
    font-size: 14px;

    .metric-card:hover & {
      color: #27272a;
    }
  `,
  MetricValue: styled.div`
    color: #111827;
    font-weight: 500;
    font-size: 24px;
    line-height: 32px;
    letter-spacing: -0.01em;
  `,
}

export default DemoView

