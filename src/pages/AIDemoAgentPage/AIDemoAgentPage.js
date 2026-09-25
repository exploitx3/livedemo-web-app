import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import styled from 'styled-components'
import axios from 'axios'
import moment from 'moment'
import Button from 'antd/es/button'
import Input from 'antd/es/input'
import Switch from 'antd/es/switch'
import Tabs from 'antd/es/tabs'
import 'antd/es/button/style'
import 'antd/es/input/style'
import 'antd/es/switch/style'
import 'antd/es/tabs/style'
import { UndoOutlined, RedoOutlined, ShareAltOutlined, ExportOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'

import * as ENV from '../../config.json'
import mainColors from '../../constants/mainColors'
import Spinner from '../../components/Spinner/Spinner'
import { showErrorsForResponse } from '../../utils/helperFunctions'
import KnowledgeTab from './components/KnowledgeTab/KnowledgeTab'
import DemosTab from './components/DemosTab/DemosTab'
import PersonaTab from './components/PersonaTab/PersonaTab'
import AgentSessionLayout from '../../agentInjectScript/AgentSessionLayout'

// AI Demo Agent editor (§5). Same chrome idea as StoryDemoPage (header + left
// tabs + right live preview) but a new, small page: no Redux tree, no
// WalkthroughComponent — the right pane is the shared AgentSessionLayout in
// editor mode.
function AIDemoAgentPage({ authData }) {
  const { workspaceId, agentId } = useParams()
  const token = authData.token
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }
  const base = `${ENV.STORIES_API}/workspaces/${workspaceId}/agents/${agentId}`

  const [agent, setAgent] = useState(null)
  const [sources, setSources] = useState([])
  const [stories, setStories] = useState([])
  const [voices, setVoices] = useState([])
  const [avatars, setAvatars] = useState(null)
  const [anamVoices, setAnamVoices] = useState(null)
  const [history, setHistory] = useState({ revisions: [], canUndo: false, canRedo: false })
  const [sessionId, setSessionId] = useState(null)
  const [name, setName] = useState('')
  const pollRef = useRef(null)

  const loadAgent = useCallback(() => {
    return axios.get(base, authHeaders).then((res) => {
      setAgent(res.data)
      setName(res.data.name || '')
      return res.data
    })
  }, [agentId, workspaceId, token])

  const loadSources = useCallback(() => {
    return axios.get(`${base}/knowledge`, authHeaders).then((res) => setSources(res.data))
  }, [agentId, workspaceId, token])

  const loadHistory = useCallback(() => {
    return axios.get(`${base}/history?limit=50`, authHeaders).then((res) => setHistory(res.data))
  }, [agentId, workspaceId, token])

  useEffect(() => {
    setAgent(null)
    setSessionId(null)

    Promise.all([
      loadAgent(),
      loadSources(),
      loadHistory(),
      axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories`, authHeaders)
        .then((res) => setStories(res.data)),
      axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/voices`, authHeaders)
        .then((res) => setVoices(res.data.voices || res.data || []))
        .catch(() => setVoices([])),
      axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/anam-avatars`, authHeaders)
        .then((res) => setAvatars(res.data.avatars || []))
        .catch(() => setAvatars([])),
      axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/anam-voices`, authHeaders)
        .then((res) => setAnamVoices(res.data.voices || []))
        .catch(() => setAnamVoices([])),
      axios.post(`${base}/session`, {}, authHeaders)
        .then((res) => setSessionId(res.data._id)),
    ]).catch(showErrorsForResponse)
  }, [workspaceId, agentId])

  // Poll knowledge while anything is pending/indexing so status chips flip to
  // ready without a refresh
  useEffect(() => {
    const busy = sources.some(s => s.status === 'pending' || s.status === 'indexing')
    if (busy && !pollRef.current) {
      pollRef.current = setInterval(() => loadSources().catch(() => {}), 5000)
    } else if (!busy && pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [sources, loadSources])

  const reloadAfterHistoryJump = useCallback(() => {
    return Promise.all([loadAgent(), loadSources(), loadHistory()])
  }, [loadAgent, loadSources, loadHistory])

  const undo = useCallback(() => {
    return axios.post(`${base}/undo`, {}, authHeaders)
      .then(reloadAfterHistoryJump)
      .catch(showErrorsForResponse)
  }, [reloadAfterHistoryJump])

  const redo = useCallback(() => {
    return axios.post(`${base}/redo`, {}, authHeaders)
      .then(reloadAfterHistoryJump)
      .catch(showErrorsForResponse)
  }, [reloadAfterHistoryJump])

  // Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z — skipped while typing (same guard as StoryDemoPage)
  useEffect(() => {
    function onKeyDown(e) {
      const target = e.target
      const isTyping = target && (
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      )
      if (isTyping) return
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return

      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  if (!agent) {
    return <S.SpinnerWrapper><Spinner /></S.SpinnerWrapper>
  }

  function patchAgent(updates) {
    return axios.patch(base, updates, authHeaders)
      .then((res) => {
        setAgent(res.data)
        loadHistory().catch(() => {})
        return res.data
      })
      .catch((err) => {
        showErrorsForResponse(err)
        throw err
      })
  }

  function setPublished(isPublished) {
    return axios.post(`${base}/publish`, { isPublished }, authHeaders)
      .then((res) => setAgent(res.data))
      .catch(showErrorsForResponse)
  }

  const tabItems = [
    {
      key: 'knowledge',
      label: 'Knowledge',
      children: (
        <KnowledgeTab
          sources={sources}
          onCreate={(payload) => axios.post(`${base}/knowledge`, payload, authHeaders)
            .then(() => { loadSources(); loadHistory() })}
          onPatch={(sourceId, updates) => axios.patch(`${base}/knowledge/${sourceId}`, updates, authHeaders)
            .then(() => loadSources()).catch(showErrorsForResponse)}
          onDelete={(sourceId) => axios.delete(`${base}/knowledge/${sourceId}`, authHeaders)
            .then(() => { loadSources(); loadHistory() }).catch(showErrorsForResponse)}
          onReindex={(sourceId) => axios.post(`${base}/knowledge/${sourceId}/reindex`, {}, authHeaders)
            .then(() => loadSources()).catch(showErrorsForResponse)}
          onReindexAll={() => axios.post(`${base}/knowledge/reindex`, {}, authHeaders)
            .then(() => loadSources()).catch(showErrorsForResponse)}
        />
      ),
    },
    {
      key: 'demos',
      label: 'Demos',
      children: (
        <DemosTab
          stories={stories}
          allowedDemoIds={agent.allowedDemoIds}
          defaultDemoId={agent.defaultDemoId}
          workspaceId={workspaceId}
          onChange={(allowedDemoIds) => patchAgent({ allowedDemoIds }).then(() => loadSources())}
          onDefaultChange={(defaultDemoId) => {
            const updates = { defaultDemoId }
            if (defaultDemoId) {
              const ids = (agent.allowedDemoIds || []).map(String)
              const idStr = String(defaultDemoId)
              if (ids.length && !ids.includes(idStr)) {
                updates.allowedDemoIds = [...ids, idStr]
              }
            }
            return patchAgent(updates)
              .then(() => {
                if (updates.allowedDemoIds) loadSources()
                toast.success(defaultDemoId ? 'Default demo set' : 'Default demo cleared')
              })
          }}
        />
      ),
    },
    {
      key: 'persona',
      label: 'Persona',
      children: (
        <PersonaTab
          agent={agent}
          voices={voices}
          avatars={avatars}
          anamVoices={anamVoices}
          onSave={(updates) => patchAgent(updates).then(() => toast.success('Persona saved'))}
        />
      ),
    },
    {
      key: 'history',
      label: 'History',
      children: (
        <S.HistoryList>
          {history.revisions.length === 0 && <S.Muted>No edits yet.</S.Muted>}
          {history.revisions.map((rev) => (
            <S.HistoryRow
              key={rev._id}
              onClick={() => axios.post(`${base}/history/${rev._id}/revert`, {}, authHeaders)
                .then(reloadAfterHistoryJump)
                .catch(showErrorsForResponse)}
            >
              <span>{rev.actionLabel || 'edit'}</span>
              <S.Muted>{moment(rev.createdAt).fromNow()}</S.Muted>
            </S.HistoryRow>
          ))}
        </S.HistoryList>
      ),
    },
  ]

  return (
    <S.Page>
      <S.Header>
        <S.NameInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name !== agent.name) patchAgent({ name })
          }}
        />
        <S.HeaderRight>
          <Button icon={<UndoOutlined />} disabled={!history.canUndo} onClick={undo} />
          <Button icon={<RedoOutlined />} disabled={!history.canRedo} onClick={redo} />
          <Button
            icon={<ExportOutlined />}
            onClick={() => window.open(`/agents/${agentId}?preview=1&workspaceId=${workspaceId}`, '_blank')}
          >
            Preview
          </Button>
          <Button
            icon={<ShareAltOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(`${ENV.SERVER_URL}/agents/${agentId}`)
                .then(() => toast.success('Agent link copied'))
            }}
          >
            Share
          </Button>
          <S.PublishWrap>
            <span>{agent.isPublished ? 'Published' : 'Draft'}</span>
            <Switch checked={agent.isPublished} onChange={setPublished} />
          </S.PublishWrap>
        </S.HeaderRight>
      </S.Header>

      <S.Body>
        <S.LeftColumn>
          <Tabs items={tabItems} />
        </S.LeftColumn>
        <S.RightColumn>
          <AgentSessionLayout
            agent={{ ...agent, workspaceId }}
            mode="editor"
            sessionId={sessionId}
            authToken={token}
          />
        </S.RightColumn>
      </S.Body>
    </S.Page>
  )
}

const S = {
  Page: styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: #ffffff;
    border-top: 1.6px solid ${mainColors.primaryColor};
    border-left: 1.6px solid ${mainColors.primaryColor};
    border-top-left-radius: 18px;
    overflow: hidden;
  `,
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 20px;
    border-bottom: 1px solid #f0f0f0;
  `,
  NameInput: styled(Input)`
    && {
      max-width: 320px;
      font-size: 16px;
      font-weight: 600;
      border: 1px solid transparent;

      &:hover, &:focus {
        border-color: #e5e7eb;
      }
    }
  `,
  HeaderRight: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  PublishWrap: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
    font-size: 13px;
    color: #374151;
  `,
  Body: styled.div`
    display: flex;
    flex: 1;
    min-height: 0;
  `,
  LeftColumn: styled.div`
    width: 380px;
    min-width: 320px;
    border-right: 1px solid #f0f0f0;
    padding: 8px 16px;
    overflow-y: auto;
  `,
  RightColumn: styled.div`
    flex: 1;
    padding: 12px;
    background: #f5f6f8;
    min-width: 0;
  `,
  HistoryList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  HistoryRow: styled.button`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: none;
    background: transparent;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    text-align: left;

    &:hover {
      background: #f3f4f6;
    }
  `,
  Muted: styled.span`
    color: #9ca3af;
    font-size: 12px;
  `,
  SpinnerWrapper: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  `,
}

function mapStateToProps(state) {
  return {
    authData: state.authReducer.authData,
  }
}

export default connect(mapStateToProps)(AIDemoAgentPage)
