import React from 'react'
import styled from 'styled-components'
import { AudioOutlined, AimOutlined, ThunderboltOutlined, CheckOutlined } from '@ant-design/icons'
import { ModalStyles } from '../AgentConnectModal/AgentConnectModal'

// Modal 2 — "Here's how it works" (§7.3). Product copy, not author-editable.
const ROWS = [
  {
    icon: <AudioOutlined />,
    title: 'Ask by voice or text',
    text: "Talk to it or type — whatever's easiest.",
  },
  {
    icon: <AimOutlined />,
    title: "Tell it what you're solving",
    text: 'Share the goal or problem you have in mind.',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'Get the right content',
    text: 'Relevant demos, videos and PDFs, recommended live.',
  },
]

function AgentHowItWorksModal({ onGetStarted }) {
  return (
    <ModalStyles.Card>
      <ModalStyles.Logo>LiveDemo</ModalStyles.Logo>
      <S.Kicker>SETTING UP YOUR DEMO SESSION</S.Kicker>
      <ModalStyles.Title>Here&apos;s how it works</ModalStyles.Title>

      <S.Rows>
        {ROWS.map((row, i) => (
          <S.Row key={i}>
            <S.IconCircle>{row.icon}</S.IconCircle>
            <div>
              <S.RowTitle>{row.title}</S.RowTitle>
              <S.RowText>{row.text}</S.RowText>
            </div>
          </S.Row>
        ))}
      </S.Rows>

      <ModalStyles.Footer>
        <ModalStyles.Status>
          <CheckOutlined style={{ color: '#22c55e' }} /> Ready when you are
        </ModalStyles.Status>
        <ModalStyles.Primary type="button" onClick={onGetStarted}>
          Get started
        </ModalStyles.Primary>
      </ModalStyles.Footer>
    </ModalStyles.Card>
  )
}

const S = {
  Kicker: styled.div`
    font-size: 11px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 8px;
  `,
  Rows: styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,
  Row: styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 14px;
  `,
  IconCircle: styled.div`
    width: 40px;
    height: 40px;
    min-width: 40px;
    border-radius: 50%;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    color: #374151;
  `,
  RowTitle: styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  `,
  RowText: styled.div`
    font-size: 13px;
    color: #6b7280;
  `,
}

export default AgentHowItWorksModal
