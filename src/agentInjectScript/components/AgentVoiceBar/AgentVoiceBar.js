import React from 'react'
import styled from 'styled-components'
import { AudioOutlined, SoundOutlined, PhoneOutlined } from '@ant-design/icons'
import mainColors from '../../../constants/mainColors'
import usePushToTalk from './usePushToTalk'

// Hold Push to Talk → Scribe realtime WS → chat (source: voice).
function AgentVoiceBar({
  voiceEnabled,
  soundOn,
  onToggleSound,
  ccOn,
  onToggleCaptions,
  onHangUp,
  getSession,
  onTranscript,
  onPartial,
  onTalkStart,
  onTalkEnd,
  disabled,
}) {
  const { listening, start, stop } = usePushToTalk({
    getSession,
    onTranscript,
    onPartial,
    onTalkStart,
    onTalkEnd,
    disabled: disabled || !voiceEnabled,
  })

  function bindHoldHandlers() {
    return {
      onPointerDown: (e) => {
        if (e.button != null && e.button !== 0) return
        e.preventDefault()
        try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* ponytail: older Safari */ }
        start()
      },
      onPointerUp: () => stop(),
      onLostPointerCapture: () => stop(),
      onPointerCancel: () => stop(),
      onContextMenu: (e) => e.preventDefault(),
    }
  }

  return (
    <S.Bar>
      {voiceEnabled && (
        <S.PushToTalk
          type="button"
          $listening={listening}
          disabled={disabled}
          title={disabled ? 'Wait for session…' : 'Hold to talk'}
          {...bindHoldHandlers()}
        >
          <AudioOutlined />
          {listening ? 'Listening…' : 'Push to Talk'}
        </S.PushToTalk>
      )}
      {voiceEnabled && (
        <S.RoundButton
          type="button"
          title={soundOn ? 'Mute agent voice' : 'Unmute agent voice'}
          onClick={onToggleSound}
          $active={soundOn}
        >
          <SoundOutlined />
        </S.RoundButton>
      )}
      <S.RoundButton
        type="button"
        title={ccOn ? 'Hide captions' : 'Show captions'}
        onClick={onToggleCaptions}
        $active={ccOn}
      >
        CC
      </S.RoundButton>
      <S.HangUp type="button" title="End session" onClick={onHangUp}>
        <PhoneOutlined rotate={225} />
      </S.HangUp>
    </S.Bar>
  )
}

const S = {
  Bar: styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    background: #ffffff;
    border-top: 1px solid #f3f4f6;
    padding: 10px 12px;
  `,
  PushToTalk: styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1 1 auto;
    min-width: 0;
    justify-content: center;
    border: 1px solid ${p => (p.$listening ? mainColors.primaryColor : '#e5e7eb')};
    background: ${p => (p.$listening ? '#eef2ff' : '#f9fafb')};
    color: ${p => (p.$listening ? mainColors.primaryColor : '#111827')};
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 13px;
    cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
    touch-action: none;
    user-select: none;
    opacity: ${p => (p.disabled ? 0.5 : 1)};

    &:disabled {
      cursor: not-allowed;
    }
  `,
  RoundButton: styled.button`
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid ${p => (p.$active ? '#111827' : '#e5e7eb')};
    background: ${p => (p.$active ? '#f3f4f6' : '#ffffff')};
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  `,
  HangUp: styled.button`
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: #ef4444;
    color: #ffffff;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  `,
}

export default AgentVoiceBar
