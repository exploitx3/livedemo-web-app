import React from 'react'
import Tippy from '@tippyjs/react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import 'tippy.js/dist/tippy.css'
import mainColors from '../../constants/mainColors'

const TippyPremium = ({ children, title, description, learnMoreUrl, placement = 'top', arrow = false, disabled }) => {
  const navigate = useNavigate()

  const content = (
    <PremiumBox>
      <PremiumTitle>{title || 'Upgrade to unlock'}</PremiumTitle>
      {description && <PremiumDesc>{description}</PremiumDesc>}
      <PremiumActions>
        <PremiumUpgradeBtn onClick={() => navigate('/billing')}>
          Upgrade now
        </PremiumUpgradeBtn>
        {learnMoreUrl && (
          <PremiumLearnMore href={learnMoreUrl} target="_blank" rel="noopener noreferrer">
            Learn more
          </PremiumLearnMore>
        )}
      </PremiumActions>
    </PremiumBox>
  )

  if (disabled) {
    return children ?? null
  }

  return (
    <StyledTippy
      className="tippy-premium"
      content={content}
      arrow={arrow}
      interactive={true}
      trigger="mouseenter focus"
      maxWidth={232}
      placement={placement}
    >
      <span>{children}</span>
    </StyledTippy>
  )
}

export default TippyPremium

const StyledTippy = styled(Tippy)`
  &.tippy-premium {
    background: #1f2937 !important;
    border-radius: 12px !important;
    padding: 0 !important;
    box-shadow: 0 4px 24px rgba(0,0,0,0.32) !important;

    .tippy-content {
      padding: 0;
    }
  }
`

const PremiumBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 0;
  width: 208px;
`

const PremiumTitle = styled.h3`
  margin: 0 0 4px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.3;
`

const PremiumDesc = styled.p`
  margin: 0 0 12px;
  font-size: 0.75rem;
  color: #d1d5db;
  line-height: 1.5;
`

const PremiumActions = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: 12px;
`

const PremiumUpgradeBtn = styled.button`
  flex: 1;
  background: ${mainColors.primaryColor};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0 8px;
  height: 32px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
  white-space: nowrap;

  &:hover { opacity: 0.88; }
  &:active { opacity: 0.75; }
`

const PremiumLearnMore = styled.a`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: rgba(255,255,255,0.12);
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s ease;
  white-space: nowrap;

  &:hover { background: rgba(255,255,255,0.20); color: #fff; }
  &:active { background: rgba(255,255,255,0.12); }
`
