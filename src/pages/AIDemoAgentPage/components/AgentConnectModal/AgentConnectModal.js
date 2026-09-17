import React, { useState } from 'react'
import styled from 'styled-components'
import mainColors from '../../../../constants/mainColors'

// Modal 1 — "Connect with AI Demo Agent" (§7.2). White card on the shared
// dim+blur overlay owned by the preview page. Fields follow visitorCapture.
function AgentConnectModal({ visitorCapture, onSubmit }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const requireName = visitorCapture && visitorCapture.requireName
  const requireEmail = visitorCapture && visitorCapture.requireEmail

  function handleSubmit(e) {
    e.preventDefault()
    if (requireName && !name.trim()) return
    if (requireEmail && !email.trim()) return
    onSubmit({ name: name.trim(), email: email.trim() })
  }

  return (
    <S.Card as="form" onSubmit={handleSubmit}>
      <S.Logo>LiveDemo</S.Logo>
      <S.Title>Connect with AI Demo Agent</S.Title>

      <S.Label>
        Name {requireName && <S.Required>*</S.Required>}
      </S.Label>
      <S.Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required={requireName}
      />

      <S.Label>
        Email {requireEmail && <S.Required>*</S.Required>}
      </S.Label>
      <S.Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required={requireEmail}
      />

      <S.Footer>
        <S.Status>
          <S.GreenDot /> Chat available now
        </S.Status>
        <S.Primary type="submit">Start instant session</S.Primary>
      </S.Footer>
    </S.Card>
  )
}

export const ModalStyles = {
  Card: styled.div`
    width: 480px;
    max-width: calc(100vw - 48px);
    background: #ffffff;
    border-radius: 16px;
    padding: 32px;
    display: flex;
    flex-direction: column;
  `,
  Logo: styled.div`
    font-weight: 700;
    color: ${mainColors.primaryColor};
    font-size: 15px;
    margin-bottom: 18px;
  `,
  Title: styled.h2`
    margin: 0 0 20px 0;
    font-size: 22px;
    color: #111827;
  `,
  Footer: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 26px;
  `,
  Status: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 13px;
  `,
  GreenDot: styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    display: inline-block;
  `,
  Primary: styled.button`
    border: none;
    background: ${mainColors.primaryColor};
    color: #ffffff;
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  `,
}

const S = {
  ...ModalStyles,
  Label: styled.label`
    font-size: 13px;
    color: #374151;
    margin: 10px 0 6px 0;
  `,
  Required: styled.span`
    color: #ef4444;
  `,
  Input: styled.input`
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    height: 40px;
    padding: 0 12px;
    font-size: 14px;
    outline: none;

    &:focus {
      border-color: ${mainColors.primaryColor};
    }
  `,
}

export default AgentConnectModal
