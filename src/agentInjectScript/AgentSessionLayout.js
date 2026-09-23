import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import ENV from '../config.json'
import mainColors from '../constants/mainColors'
import AgentChatPanel from './components/AgentChatPanel/AgentChatPanel'
import AgentVoiceBar from './components/AgentVoiceBar/AgentVoiceBar'
import { createAiDemoController } from './aiDemoController'
import { ShareAltOutlined, FullscreenOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'

// One layout, two parents (editor right pane + public page). Chat (+ voice
// bar) | player. The player is an iframe of the existing Story preview URL —
// the agent app never mounts WalkthroughComponent.
function AgentSessionLayout({ agent, mode, sessionId, authToken, onHangUp, speakWelcome = true }) {
  const isEditor = mode === 'editor'
  const iframeRef = useRef(null)
  const containerRef = useRef(null)
  const controllerRef = useRef(null)
  const chatRef = useRef(null)
  const openedDefaultRef = useRef('')
  const ackedDefaultSessionRef = useRef('')
  const [currentDemo, setCurrentDemo] = useState(null)
  const [soundOn, setSoundOn] = useState(true)
  const [captionsOn, setCaptionsOn] = useState(false)
  const [captionText, setCaptionText] = useState('')

  if (!controllerRef.current) {
    controllerRef.current = createAiDemoController(iframeRef)
  }

  const chatUrl = mode === 'editor'
    ? `${ENV.STORIES_API}/workspaces/${agent.workspaceId}/agents/${agent._id}/chat`
    : `${ENV.STORIES_API}/agents/${agent._id}/chat`

  const ttsUrl = mode === 'editor'
    ? `${ENV.STORIES_API}/workspaces/${agent.workspaceId}/agents/${agent._id}/tts`
    : `${ENV.STORIES_API}/agents/${agent._id}/tts`

  const transcribeUrl = mode === 'editor'
    ? `${ENV.STORIES_API}/workspaces/${agent.workspaceId}/agents/${agent._id}/transcribe`
    : `${ENV.STORIES_API}/agents/${agent._id}/transcribe`

  const getScribeSession = useCallback(async () => {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}
    const res = await axios.post(transcribeUrl, {}, { headers })
    if (!res.data?.url) throw new Error('Voice session failed')
    return res.data
  }, [authToken, transcribeUrl])

  const handleTranscript = useCallback((text, err) => {
    if (err) {
      const message = String(err.message || '')
      if (err.name === 'NotAllowedError') toast.error('Microphone permission denied')
      else if (message === 'Hold the button a bit longer') toast.error('Hold Push to Talk a bit longer')
      else if (message.includes('timed out') || message.includes('catch')) toast.error('Did not catch that — try again')
      else toast.error('Voice input failed')
      return
    }
    const spoken = String(text || '').trim()
    if (!spoken) {
      toast.error('Did not catch that — try again')
      return
    }
    if (!sessionId) {
      toast.error('Session not ready')
      return
    }
    const sent = chatRef.current?.sendMessage(spoken, 'voice')
    if (!sent) toast.error('Wait for the current reply, then try again')
  }, [sessionId])

  function ack(type, data) {
    if (!sessionId) return
    axios.post(`${ENV.STORIES_API}/agents/${agent._id}/ack`, { sessionId, type, data }, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    }).catch(err => console.log('ack failed', err))
  }

  function handleContentCard(card) {
    const isSameDemo = currentDemo && String(currentDemo.entityId) === String(card.entityId)

    if (isSameDemo) {
      controllerRef.current.navigateToStep(card.workspaceId, card.entityId, card.stepNumber)
      ack('step_viewed', { demoId: card.entityId, stepNumber: card.stepNumber })
    } else {
      controllerRef.current.openDemo(card.workspaceId, card.entityId, card.stepNumber)
      ack('demo_opened', { demoId: card.entityId, stepNumber: card.stepNumber })
    }

    setCurrentDemo(card)
  }

  function handleShare() {
    const url = `${ENV.SERVER_URL}/agents/${agent._id}`
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Agent link copied'))
      .catch(() => toast.error('Could not copy link'))
  }

  function handleFullscreen() {
    if (containerRef.current && containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen()
    }
  }

  function handleHangUp() {
    ack('session_ended', {})
    onHangUp && onHangUp()
  }

  useEffect(() => {
    if (!agent?.defaultDemoId) {
      openedDefaultRef.current = ''
      return
    }

    const demoId = String(agent.defaultDemoId?._id || agent.defaultDemoId)
    if (openedDefaultRef.current === demoId) return
    openedDefaultRef.current = demoId

    const workspaceId = String(agent.workspaceId?._id || agent.workspaceId || '')
    if (!workspaceId || !demoId) return
    function openDefault() {
      if (!iframeRef.current) {
        requestAnimationFrame(openDefault)
        return
      }
      controllerRef.current.openDemo(workspaceId, demoId, 1)
      setCurrentDemo({ entityId: demoId, workspaceId, stepNumber: 1 })
    }
    openDefault()
  }, [agent?.defaultDemoId, agent?.workspaceId])

  // Visitor clicking through the player moves the step without a content_card
  useEffect(() => {
    function onMessage(event) {
      if (event.source !== iframeRef.current?.contentWindow) return
      if (event.data?.type !== 'step_index_changed') return
      const stepNumber = Number(event.data.state?.stepNumber)
      if (!Number.isInteger(stepNumber) || stepNumber < 1) return
      setCurrentDemo(prev => (prev ? { ...prev, stepNumber } : prev))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    if (!sessionId || !agent?.defaultDemoId) return
    if (openedDefaultRef.current !== String(agent.defaultDemoId)) return

    const key = `${agent.defaultDemoId}:${sessionId}`
    if (ackedDefaultSessionRef.current === key) return
    ackedDefaultSessionRef.current = key
    ack('demo_opened', { demoId: agent.defaultDemoId, stepNumber: 1 })
  }, [sessionId, agent?.defaultDemoId])

  return (
    <S.Stage>
      <AgentChatPanel
        ref={chatRef}
        agent={agent}
        chatUrl={chatUrl}
        ttsUrl={ttsUrl}
        authToken={authToken}
        sessionId={sessionId}
        currentDemo={currentDemo}
        onContentCard={handleContentCard}
        collapsible
        muted={!soundOn || isEditor}
        speakWelcome={speakWelcome && !isEditor}
        onCaptionChange={setCaptionText}
      >
        <AgentVoiceBar
          voiceEnabled={agent.voiceEnabled}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn(v => !v)}
          ccOn={captionsOn}
          onToggleCaptions={() => setCaptionsOn(v => !v)}
          onHangUp={handleHangUp}
          getSession={getScribeSession}
          onTranscript={handleTranscript}
          onPartial={setCaptionText}
          onTalkStart={() => chatRef.current && chatRef.current.stopSpeaking()}
          onTalkEnd={() => chatRef.current && chatRef.current.allowSpeaking()}
          disabled={!sessionId}
        />
      </AgentChatPanel>

      <S.Player ref={containerRef}>
        <S.PlayerChrome>
          <S.ChromeButton type="button" onClick={handleShare}>
            <ShareAltOutlined /> Share
          </S.ChromeButton>
          {agent.cta && agent.cta.bookMeetingUrl ? (
            <S.PrimaryButton
              type="button"
              onClick={() => {
                ack('cta_clicked', { cta: 'bookMeeting' })
                window.open(agent.cta.bookMeetingUrl, '_blank')
              }}
            >
              Book a demo
            </S.PrimaryButton>
          ) : null}
          <S.ChromeButton type="button" onClick={handleFullscreen}>
            <FullscreenOutlined />
          </S.ChromeButton>
        </S.PlayerChrome>

        <S.Frame>
          {!currentDemo && (
            <S.EmptyState>Ask something to load a demo</S.EmptyState>
          )}
          <S.IFrame
            ref={iframeRef}
            title="Demo player"
            frameBorder="0"
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
            style={{ visibility: currentDemo ? 'visible' : 'hidden' }}
          />
        </S.Frame>

        {captionsOn && captionText ? (
          <S.Caption aria-live="polite">{captionText}</S.Caption>
        ) : null}
      </S.Player>
    </S.Stage>
  )
}

const S = {
  Stage: styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    background: #ffffff;
    border-radius: 14px;
    overflow: hidden;
    font-family: ${mainColors.fontFamilyLexend};

    button, input, textarea {
      font-family: inherit;
    }
  `,
  Player: styled.div`
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #ffffff;
  `,
  PlayerChrome: styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-shrink: 0;
    padding: 10px 12px;
    background: #ffffff;
  `,
  Frame: styled.div`
    position: relative;
    flex: 1;
    min-height: 0;
  `,
  ChromeButton: styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
  `,
  PrimaryButton: styled.button`
    border: none;
    background: ${mainColors.primaryColor};
    color: #ffffff;
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  `,
  EmptyState: styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 14px;
  `,
  IFrame: styled.iframe`
    width: 100%;
    height: 100%;
    border: none;
    flex: 1;
  `,
  Caption: styled.div`
    position: absolute;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    max-width: min(640px, 90%);
    padding: 10px 16px;
    background: rgba(0, 0, 0, 0.78);
    color: #ffffff;
    border-radius: 8px;
    font-size: 15px;
    line-height: 1.45;
    text-align: center;
    z-index: 4;
    pointer-events: none;
    white-space: pre-wrap;
  `,
}

export default AgentSessionLayout
