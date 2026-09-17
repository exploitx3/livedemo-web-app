import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import moment from 'moment'
import Modal from 'antd/es/modal'
import Table from 'antd/es/table'
import Tag from 'antd/es/tag'
import 'antd/es/modal/style'
import 'antd/es/table/style'
import 'antd/es/tag/style'

import ENV from '../../../../config'
import Spinner from '../../../../components/Spinner/Spinner'

// AI Agents analytics tab: agents metrics table + sessions table + transcript
// drill-in (§9.2). The drill-in is the chat transcript and event timeline —
// agent sessions have no rrweb.
function AgentsView({ workspaceId, authToken, currentViewType }) {
  const [loading, setLoading] = useState(true)
  const [agentDocs, setAgentDocs] = useState([])
  const [sessions, setSessions] = useState([])
  const [drillIn, setDrillIn] = useState(null) // { session, messages, events }
  const [drillInLoading, setDrillInLoading] = useState(false)

  useEffect(() => {
    if (!workspaceId) return
    setLoading(true)

    axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/agent-sessions?viewType=${currentViewType}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        setAgentDocs(res.data.agentDocsWithMetrics || [])
        setSessions(res.data.sessions || [])
      })
      .catch((err) => console.log(err))
      .then(() => setLoading(false))
  }, [workspaceId, currentViewType])

  function openTranscript(session) {
    const agentId = session.agentId && (session.agentId._id || session.agentId)
    setDrillInLoading(true)
    setDrillIn({ session, messages: [], events: [] })

    axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/agents/${agentId}/sessions/${session._id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => setDrillIn(res.data))
      .catch((err) => console.log(err))
      .then(() => setDrillInLoading(false))
  }

  const agentColumns = [
    { title: 'Agent', dataIndex: 'name', key: 'name', render: (v) => v || 'Untitled agent' },
    { title: 'Views', dataIndex: 'views', key: 'views' },
    { title: 'Unique visitors', dataIndex: 'uniqueUsers', key: 'uniqueUsers' },
    {
      title: 'Time spent', dataIndex: 'timeSpent', key: 'timeSpent',
      render: (ms) => `${Math.round(moment.duration(ms || 0, 'milliseconds').asMinutes())} min`,
    },
    { title: 'Messages', dataIndex: 'messages', key: 'messages' },
    { title: 'Demos opened', dataIndex: 'demosOpened', key: 'demosOpened' },
    { title: 'CTA clicks', dataIndex: 'ctaClicks', key: 'ctaClicks' },
    { title: 'Leads', dataIndex: 'leads', key: 'leads' },
  ]

  const sessionColumns = [
    {
      title: 'Visitor', key: 'visitor',
      render: (s) => {
        const flag = s.clientIpData && s.clientIpData.flag && s.clientIpData.flag.emoji
        const place = s.clientIpData && s.clientIpData.city
          ? `${s.clientIpData.city}, ${s.clientIpData.region || s.clientIpData.country || ''}`
          : (s.clientIpData && s.clientIpData.ip) || 'Unknown'
        const who = s.visitorName || s.visitorEmail
        return `${flag || ''} ${who ? `${who} — ` : ''}${place}`
      },
    },
    {
      title: 'Agent', key: 'agent',
      render: (s) => (s.agentId && s.agentId.name) || '',
    },
    {
      title: 'Duration', key: 'duration',
      render: (s) => s.duration ? `${Math.round(moment.duration(s.duration, 'milliseconds').asSeconds())}s` : '—',
    },
    { title: 'Messages', dataIndex: 'messageCount', key: 'messageCount' },
    { title: 'Demos', dataIndex: 'demosOpenedCount', key: 'demosOpenedCount' },
    {
      title: 'Date', key: 'date',
      render: (s) => moment(s.startTimestamp).format('hh:mm A, D MMM YYYY'),
    },
  ]

  if (loading) {
    return <S.SpinnerWrapper><Spinner /></S.SpinnerWrapper>
  }

  return (
    <S.Wrapper>
      <S.SectionTitle>Agents</S.SectionTitle>
      <Table
        rowKey="_id"
        columns={agentColumns}
        dataSource={agentDocs}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        size="middle"
      />

      <S.SectionTitle>Sessions</S.SectionTitle>
      <Table
        rowKey="_id"
        columns={sessionColumns}
        dataSource={sessions}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        size="middle"
        onRow={(session) => ({
          onClick: () => openTranscript(session),
          style: { cursor: 'pointer' },
        })}
      />

      <Modal
        open={!!drillIn}
        title="Session transcript"
        footer={null}
        width={640}
        onCancel={() => setDrillIn(null)}
      >
        {drillInLoading && <S.SpinnerWrapper><Spinner /></S.SpinnerWrapper>}
        {!drillInLoading && drillIn && (
          <S.Transcript>
            {(drillIn.messages || []).map((message) => (
              <S.MessageRow key={message._id} $role={message.role}>
                <S.MessageRole>{message.role === 'user' ? 'Visitor' : 'Agent'}</S.MessageRole>
                <S.MessageContent>{message.content}</S.MessageContent>
                {(message.actions || []).map((action, i) => (
                  <Tag key={i} color="blue">
                    opened {action.name || 'demo'} · step {action.stepNumber}
                  </Tag>
                ))}
              </S.MessageRow>
            ))}
            {(drillIn.messages || []).length === 0 && <S.Muted>No messages in this session.</S.Muted>}

            <S.SectionTitle>Events</S.SectionTitle>
            {(drillIn.events || []).map((event) => (
              <S.EventRow key={event._id}>
                <Tag>{event.type}</Tag>
                <S.Muted>{moment(event.timestamp).format('hh:mm:ss A')}</S.Muted>
              </S.EventRow>
            ))}
          </S.Transcript>
        )}
      </Modal>
    </S.Wrapper>
  )
}

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  SectionTitle: styled.p`
    margin: 10px 0 4px 0;
    font-size: 1.1em;
    font-weight: 600;
    color: #111827;
  `,
  SpinnerWrapper: styled.div`
    display: flex;
    justify-content: center;
    padding: 40px;
  `,
  Transcript: styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 60vh;
    overflow-y: auto;
  `,
  MessageRow: styled.div`
    background: ${props => props.$role === 'user' ? '#f3f4f6' : '#eef4ff'};
    border-radius: 8px;
    padding: 8px 12px;
  `,
  MessageRole: styled.div`
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    margin-bottom: 2px;
  `,
  MessageContent: styled.div`
    font-size: 13px;
    color: #111827;
    white-space: pre-wrap;
  `,
  EventRow: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  Muted: styled.span`
    color: #9ca3af;
    font-size: 12px;
  `,
}

export default AgentsView
