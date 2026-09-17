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
    position: absolute;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    background: #ffffff;
    border-radius: 999px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    padding: 8px 12px;
    z-index: 5;
  `,
  PushToTalk: styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid ${p => (p.$listening ? mainColors.primaryColor : '#e5e7eb')};
    background: ${p => (p.$listening ? '#eef2ff' : '#f9fafb')};
    color: ${p => (p.$listening ? mainColors.primaryColor : '#111827')};
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
    touch-action: none;
    user-select: none;
    opacity: ${p => (p.disabled ? 0.5 : 1)};

    &:disabled {
      cursor: not-allowed;
    }
  `,
  RoundButton: styled.button`
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
