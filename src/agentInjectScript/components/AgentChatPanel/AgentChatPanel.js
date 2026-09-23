import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import mainColors from '../../../constants/mainColors'
import { SendOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

// Chat column of the split session (§7.4). Welcome message, starter chips,
// stacked message blocks, composer. Streams the turn over SSE and forwards
// content_card to the parent (which drives the player iframe).

// Minimal SSE-over-fetch parser: "event: X\ndata: {json}\n\n" frames.
async function streamSse(url, { headers, body, onEvent }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })

  if (!response.ok || !response.body) {
    throw new Error(`Chat request failed (${response.status})`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let sep
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)

      let event = 'message'
      let data = ''
      frame.split('\n').forEach((line) => {
        if (line.startsWith('event: ')) event = line.slice(7).trim()
        else if (line.startsWith('data: ')) data += line.slice(6)
      })

      if (data) {
        try {
          onEvent(event, JSON.parse(data))
        } catch (err) {
          console.log('sse parse failed', err)
        }
      }
    }
  }
}

function stopAudio(audioRef) {
  const audio = audioRef.current
  if (!audio) return
  audio.pause()
  if (audio._blobUrl) {
    URL.revokeObjectURL(audio._blobUrl)
    audio._blobUrl = null
  }
  audioRef.current = null
}

function playBase64Audio(audioRef, { audioBase64, mimeType }, muted, skipTtsRef) {
  if (muted || skipTtsRef?.current || !audioBase64) return
  stopAudio(audioRef)
  const bytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: mimeType || 'audio/mpeg' })
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio._blobUrl = url
  audioRef.current = audio
  audio.onended = () => {
    URL.revokeObjectURL(url)
    audio._blobUrl = null
  }
  audio.play().catch(err => console.log('audio play failed', err))
}

function AgentChatPanel({
  agent, chatUrl, ttsUrl, authToken, sessionId, currentDemo, onContentCard, collapsible, muted, speakWelcome,
  onCaptionChange, children,
}, ref) {
  const [messages, setMessages] = useState([])
  const [chips, setChips] = useState(agent.starterQuestions || [])
  const [input, setInput] = useState('')
  const [inFlight, setInFlight] = useState(false)
  const [status, setStatus] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const scrollRef = useRef(null)
  const audioRef = useRef(null)
  const skipTtsRef = useRef(false)
  const welcomeSpokenRef = useRef(false)
  const mutedRef = useRef(muted)

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  useEffect(() => {
    if (!speakWelcome) return
    const welcome = String(agent.welcomeMessage || '').trim()
    if (!welcome) return

    onCaptionChange && onCaptionChange(welcome)

    if (!agent.voiceEnabled || !ttsUrl || welcomeSpokenRef.current) return

    welcomeSpokenRef.current = true
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}
    axios.post(ttsUrl, { text: welcome }, { headers })
      .then((res) => playBase64Audio(audioRef, res.data, mutedRef.current, skipTtsRef))
      .catch(err => console.log('welcome TTS failed', err))
  }, [speakWelcome, agent.voiceEnabled, agent.welcomeMessage, ttsUrl, authToken, onCaptionChange])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, inFlight])

  const sendMessage = useCallback((text, source = 'text') => {
    const message = String(text || '').trim()
    if (!message || inFlight || !sessionId) return false

    setMessages(prev => [...prev, { role: 'user', content: message }])
    setInput('')
    setInFlight(true)
    onCaptionChange && onCaptionChange('')

    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}

    streamSse(chatUrl, {
      headers,
      body: {
        sessionId,
        message,
        source,
        demoId: currentDemo?.entityId || null,
        stepNumber: currentDemo?.stepNumber || null,
      },
      onEvent: (event, data) => {
        if (event === 'status') {
          setStatus(data.text || '')
        } else if (event === 'text') {
          setStatus('')
          setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
          onCaptionChange && onCaptionChange(data.text)
        } else if (event === 'voice_audio') {
          playBase64Audio(audioRef, data, mutedRef.current, skipTtsRef)
        } else if (event === 'content_card') {
          onContentCard && onContentCard(data)
        } else if (event === 'suggestions') {
          setChips(data.suggestions || [])
        } else if (event === 'error') {
          setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Something went wrong.' }])
        }
      },
    })
      .catch((err) => {
        console.log(err)
        setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
      })
      .then(() => {
        setStatus('')
        setInFlight(false)
      })

    return true
  }, [authToken, chatUrl, currentDemo, inFlight, onCaptionChange, onContentCard, sessionId])

  const stopSpeaking = useCallback(() => {
    skipTtsRef.current = true
    stopAudio(audioRef)
  }, [])

  const allowSpeaking = useCallback(() => {
    skipTtsRef.current = false
  }, [])

  useImperativeHandle(ref, () => ({
    sendMessage,
    stopSpeaking,
    allowSpeaking,
  }), [allowSpeaking, sendMessage, stopSpeaking])

  if (collapsed) {
    return (
      <S.Rail>
        <S.IconButton type="button" onClick={() => setCollapsed(false)} title="Open chat">
          <MenuUnfoldOutlined />
        </S.IconButton>
      </S.Rail>
    )
  }

  return (
    <S.Panel>
      <S.PanelHeader>
        <S.Brand>
          <S.BrandDot /> {agent.name || 'AI Demo Agent'}
        </S.Brand>
        {collapsible && (
          <S.IconButton type="button" onClick={() => setCollapsed(true)} title="Collapse chat">
            <MenuFoldOutlined />
          </S.IconButton>
        )}
      </S.PanelHeader>

      <S.Messages ref={scrollRef}>
        <S.Welcome>{agent.welcomeMessage}</S.Welcome>

        {messages.map((message, i) => (
          message.role === 'user'
            ? <S.UserBubble key={i}>{message.content}</S.UserBubble>
            : <S.AssistantBlock key={i}>{message.content}</S.AssistantBlock>
        ))}

        {inFlight && <S.Typing aria-live="polite">{status || '…'}</S.Typing>}

        {!inFlight && chips.length > 0 && (
          <S.Chips>
            {chips.map((chip, i) => (
              <S.Chip key={i} type="button" onClick={() => sendMessage(chip, 'suggestion')}>
                {chip}
              </S.Chip>
            ))}
          </S.Chips>
        )}
      </S.Messages>

      <S.Composer
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage(input)
        }}
      >
        <S.Input
          value={input}
          disabled={inFlight}
          placeholder="Ask AI Demo Agent..."
          onChange={(e) => setInput(e.target.value)}
        />
        <S.SendButton type="submit" disabled={inFlight || !input.trim()}>
          <SendOutlined />
        </S.SendButton>
      </S.Composer>

      {children}
    </S.Panel>
  )
}

const S = {
  Panel: styled.div`
    width: 300px;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-right: 1px solid #eeeeee;
    height: 100%;
  `,
  Rail: styled.div`
    width: 44px;
    min-width: 44px;
    display: flex;
    justify-content: center;
    padding-top: 12px;
    background: #ffffff;
    border-right: 1px solid #eeeeee;
  `,
  PanelHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid #f3f4f6;
  `,
  Brand: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
    color: #111827;
  `,
  BrandDot: styled.span`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${mainColors.primaryColor};
    display: inline-block;
  `,
  IconButton: styled.button`
    border: none;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    font-size: 15px;
  `,
  Messages: styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,
  Welcome: styled.p`
    margin: 0;
    font-size: 14px;
    color: #111827;
    line-height: 1.5;
  `,
  UserBubble: styled.div`
    align-self: flex-end;
    background: #f3f4f6;
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 13px;
    color: #111827;
    max-width: 90%;
    white-space: pre-wrap;
  `,
  AssistantBlock: styled.div`
    align-self: flex-start;
    font-size: 13px;
    color: #111827;
    line-height: 1.5;
    max-width: 95%;
    white-space: pre-wrap;
  `,
  Typing: styled.div`
    color: #9ca3af;
    font-size: 16px;
  `,
  Chips: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 6px;
  `,
  Chip: styled.button`
    width: 100%;
    text-align: left;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 9px;
    padding: 12px;
    font-size: 13px;
    color: #111827;
    cursor: pointer;

    &:hover {
      border-color: ${mainColors.primaryColor};
    }
  `,
  Composer: styled.form`
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid #f3f4f6;
  `,
  Input: styled.input`
    flex: 1;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 13px;
    outline: none;

    &:focus {
      border-color: ${mainColors.primaryColor};
    }
  `,
  SendButton: styled.button`
    border: none;
    background: ${mainColors.primaryColor};
    color: #ffffff;
    border-radius: 10px;
    width: 38px;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  `,
}

export default forwardRef(AgentChatPanel)
