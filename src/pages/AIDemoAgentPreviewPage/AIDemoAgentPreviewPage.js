import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { connect } from 'react-redux'
import styled from 'styled-components'
import axios from 'axios'
import { CloseOutlined, ShareAltOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'

import * as ENV from '../../config.json'
import mainColors from '../../constants/mainColors'
import Spinner from '../../components/Spinner/Spinner'
import AgentSessionLayout from '../../agentInjectScript/AgentSessionLayout'
import AgentConnectModal from '../AIDemoAgentPage/components/AgentConnectModal/AgentConnectModal'
import AgentHowItWorksModal from '../AIDemoAgentPage/components/AgentHowItWorksModal/AgentHowItWorksModal'

// Public visitor page /agents/:agentId (§7). Same design as LiveDemoPreviewPage:
// white page, slim header (name left, Share/Edit right), centered rounded stage
// with the player iframe, title below. Onboarding modals sit on a dim+blur overlay.
const ONBOARDED_KEY = (agentId) => `ld-agent-onboarded:${agentId}`

function AIDemoAgentPreviewPage({ authData }) {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = authData && authData.token
  const isPreviewTab = searchParams.get('preview') === '1'

  const [agent, setAgent] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sessionMode, setSessionMode] = useState('published')
  const [sessionApiBase, setSessionApiBase] = useState('')
  const [overlay, setOverlay] = useState(null) // 'connect' | 'how' | null
  const [ended, setEnded] = useState(false)

  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

  function startSession(visitor) {
    if (!sessionApiBase) return Promise.resolve()
    return axios.post(`${sessionApiBase}/session`, { visitor }, authHeaders)
      .then((res) => setSessionId(res.data._id))
      .catch((err) => console.log('session failed', err))
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setAgent(null)
      setSessionId(null)
      setSessionApiBase('')

      try {
        // Workspace-scoped preview is auth-OPTIONAL on the backend now: with a
        // member token it returns the editor payload (draft defaults), without
        // one it returns the published payload. One fetch covers both — the
        // plain /agents/:id/preview is only for URLs with no workspaceId.
        const wsFromQuery = searchParams.get('workspaceId') || ''
        const previewUrl = wsFromQuery
          ? `${ENV.STORIES_API}/workspaces/${wsFromQuery}/agents/${agentId}/preview`
          : `${ENV.STORIES_API}/agents/${agentId}/preview`

        const pubRes = await axios.get(previewUrl, authHeaders)
        const loadedAgent = pubRes.data.agent
        // Session/chat/TTS stay on the public routes so voice is not disabled
        // (workspace session route uses editor mode which skips TTS).
        const apiBase = `${ENV.STORIES_API}/agents/${agentId}`

        if (cancelled) return

        setSessionMode('published')
        setSessionApiBase(apiBase)
        setAgent(loadedAgent)

        const needsConnect = loadedAgent.visitorCapture && loadedAgent.visitorCapture.enabled
        const onboarded = !!localStorage.getItem(ONBOARDED_KEY(agentId))

        if (needsConnect) {
          setOverlay('connect')
        } else {
          // Preview tab mounts AgentSessionLayout directly, so the page owns the
          // session. The public path iframes /agents/:id/player and the bundle
          // mints its own session — minting here too would double-count.
          if (isPreviewTab) {
            axios.post(`${apiBase}/session`, {}, authHeaders)
              .then((res) => { if (!cancelled) setSessionId(res.data._id) })
              .catch((err) => console.log('session failed', err))
          }
          setOverlay(onboarded ? null : 'how')
        }
      } catch {
        if (!cancelled) setNotFound(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [agentId, token, isPreviewTab, searchParams])

  // Hang-up happens inside the player iframe (cross-origin) — the bundle
  // postMessages the parent so this page can show the ended card.
  useEffect(() => {
    function onMessage(event) {
      if (!ENV.STORIES_API.startsWith(event.origin)) return
      if (event.data && event.data.type === 'ldAgentHangUp') setEnded(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  function handleConnectSubmit(visitor) {
    startSession(visitor)
    const onboarded = !!localStorage.getItem(ONBOARDED_KEY(agentId))
    setOverlay(onboarded ? null : 'how')
  }

  function handleOverlayClose() {
    if (overlay === 'connect') {
      if (agent.visitorCapture && agent.visitorCapture.requireEmail) {
        window.history.back()
        return
      }
      startSession({})
    }
    localStorage.setItem(ONBOARDED_KEY(agentId), '1')
    setOverlay(null)
  }

  function handleGetStarted() {
    localStorage.setItem(ONBOARDED_KEY(agentId), '1')
    setOverlay(null)
  }

  function handleShare() {
    const url = `${ENV.SERVER_URL}/agents/${agentId}`
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Agent link copied'))
      .catch(() => toast.error('Could not copy link'))
  }

  // Same header/content shell as LiveDemoPreviewPage
  const header = (
    <S.Header>
      <S.HeaderName>{agent ? agent.name : ''}</S.HeaderName>
      <S.HeaderRight>
        <S.ShareButton type="button" onClick={handleShare}>
          <ShareAltOutlined /> Share
        </S.ShareButton>
        {token && agent ? (
          <S.EditButton
            type="button"
            onClick={() => navigate(`/workspace/${agent.workspaceId}/aidemoagent/${agentId}`)}
          >
            Edit
          </S.EditButton>
        ) : null}
      </S.HeaderRight>
    </S.Header>
  )

  if (notFound) {
    return (
      <S.Page>
        <S.CenterWrap><S.CenterCard>This agent is not available.</S.CenterCard></S.CenterWrap>
      </S.Page>
    )
  }

  if (!agent) {
    return (
      <S.Page>
        <S.CenterWrap><Spinner /></S.CenterWrap>
      </S.Page>
    )
  }

  if (ended) {
    return (
      <S.Page>
        {header}
        <S.CenterWrap>
          <S.CenterCard>Session ended. Thanks for stopping by!</S.CenterCard>
        </S.CenterWrap>
      </S.Page>
    )
  }

  // Same principle as LiveDemoPreviewPage: the SPA renders chrome + overlays,
  // the session itself is an iframe of the backend player HTML shell
  // (GET .../player → agentInjectScript.bundle.js). Only the editor
  // preview tab keeps the direct mount — draft agents fail the player's
  // publish gate, and an iframe navigation cannot carry the Bearer token.
  // Workspace-scoped player URL (auth-optional route) — same URL shape everywhere.
  const playerSrc = `${ENV.STORIES_API}/workspaces/${agent.workspaceId}/agents/${agentId}/player${sessionId ? `?sessionId=${sessionId}` : ''}`

  return (
    <S.Page>
      {header}
      <S.Content>
        <S.Wrapper>
          <S.Stage>
            {isPreviewTab ? (
              <AgentSessionLayout
                agent={agent}
                mode={sessionMode}
                sessionId={sessionId}
                authToken={token}
                onHangUp={() => setEnded(true)}
                speakWelcome={!overlay}
              />
            ) : !overlay ? (
              // Mounted only after overlays close so the welcome message is not
              // spoken behind the dim layer (bundle defaults speakWelcome=true).
              <S.PlayerIFrame
                src={playerSrc}
                title="AI demo agent"
                allow="microphone; autoplay; fullscreen; clipboard-write"
                allowFullScreen
              />
            ) : null}
          </S.Stage>
          <S.Title>{agent.name}</S.Title>
        </S.Wrapper>
      </S.Content>

      {overlay && (
        <S.Overlay>
          <S.OverlayClose type="button" onClick={handleOverlayClose}>
            <CloseOutlined />
          </S.OverlayClose>
          {overlay === 'connect' && (
            <AgentConnectModal visitorCapture={agent.visitorCapture} onSubmit={handleConnectSubmit} />
          )}
          {overlay === 'how' && (
            <AgentHowItWorksModal onGetStarted={handleGetStarted} />
          )}
        </S.Overlay>
      )}
    </S.Page>
  )
}

const S = {
  Page: styled.div`
    position: fixed;
    inset: 0;
    background: var(--ld-background, white);
    display: flex;
    flex-direction: column;
    overflow: auto;
  `,
  Header: styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 25px;
    border-bottom: 1px solid #e5e7eb;
    background: var(--ld-background, white);
    font-family: ${mainColors.fontFamilyLexend};
  `,
  HeaderName: styled.p`
    margin: 0;
    font-size: 1em;
    color: var(--ld-text, #111);
    text-transform: capitalize;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 500px;
  `,
  HeaderRight: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
  `,
  ShareButton: styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
    background: none;
    color: var(--ld-text, #111);
    font-size: 1em;
    font-family: ${mainColors.fontFamilyLexend};
    cursor: pointer;

    && svg {
      fill: ${mainColors.primaryColor};
    }
  `,
  EditButton: styled.button`
    border: none;
    background: ${mainColors.primaryColor};
    color: white;
    font-size: 1em;
    font-family: ${mainColors.fontFamilyLexend};
    padding: 7px 20px;
    border-radius: 6px;
    cursor: pointer;
  `,
  Content: styled.div`
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: 40px 80px;

    @media screen and (max-width: 700px) {
      padding: 10px 10px;
    }
  `,
  Wrapper: styled.div`
    width: 70%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin: 0 auto;

    @media screen and (max-width: 450px) {
      width: 98%;
    }
  `,
  Stage: styled.div`
    width: 100%;
    flex: 1;
    min-height: 480px;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgb(17 24 39 / 16%);
  `,
  Title: styled.h2`
    align-self: flex-start;
    margin: 20px 0 30px;
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-transform: capitalize;
    max-width: 100%;
    font-size: 1.7em;
    font-weight: 500;
    color: var(--ld-text, #111);
    font-family: ${mainColors.fontFamilyLexend};
  `,
  CenterWrap: styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  PlayerIFrame: styled.iframe`
    display: block;
    width: 100%;
    height: 100%;
    border: none;
  `,
  Overlay: styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
  `,
  OverlayClose: styled.button`
    position: fixed;
    top: 24px;
    right: 24px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: #ffffff;
    color: #111827;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 21;
  `,
  CenterCard: styled.div`
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 40px 56px;
    font-size: 16px;
    color: #111827;
    font-family: ${mainColors.fontFamilyLexend};
  `,
}

function mapStateToProps(state) {
  return {
    authData: state.authReducer.authData,
  }
}

export default connect(mapStateToProps)(AIDemoAgentPreviewPage)
