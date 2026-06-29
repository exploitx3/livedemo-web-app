import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import ENV from '../../config.json'
import Logo from '../../static/images/logo-round.svg'
import mainColors from '../../constants/mainColors'

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

function UnsubscribePage() {
  const [searchParams] = useSearchParams()
  const unsubscribeToken = searchParams.get('unsubscribeToken')
  const [status, setStatus] = useState('loading')
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return

    if (!unsubscribeToken) {
      setStatus('error')
      return
    }

    startedRef.current = true

    fetch(`${ENV.API_URL}/users/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: unsubscribeToken }),
    })
      .then(async (res) => {
        let responseData = null
        try {
          responseData = await res.json()
        } catch {
          throw new Error('Invalid response')
        }
        if (res.ok && responseData?.success) {
          setStatus('success')
          return
        }
        throw new Error(responseData?.error || 'Unable to unsubscribe')
      })
      .catch(() => {
        setStatus('error')
      })
  }, [unsubscribeToken])

  const loginUrl = `${ENV.APP_URL}/login`
  const settingsUrl = `${ENV.APP_URL}/settings`

  return (
    <Wrapper>
      <Content>
        <LogoImg src={Logo} alt="LiveDemo" />
        {status === 'loading' && (
          <>
            <Title>Processing your request...</Title>
            <Spinner />
          </>
        )}
        {status === 'success' && (
          <>
            <Title>Successfully unsubscribed</Title>
            <MessageText>
              You have been unsubscribed from LiveDemo email communications.
            </MessageText>
          </>
        )}
        {status === 'error' && (
          <>
            <Title>Unable to unsubscribe</Title>
            <MessageText>
              We could not process your unsubscribe request. Please log in to your account
              and manage your email preferences from the settings page.
            </MessageText>
            <ActionLink href={loginUrl}>Log in to LiveDemo</ActionLink>
            <SecondaryLink href={settingsUrl}>Go to settings</SecondaryLink>
          </>
        )}
      </Content>
    </Wrapper>
  )
}

export default UnsubscribePage

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  background: #fff;
  font-family: Inter, system-ui, sans-serif;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  text-align: center;
`

const LogoImg = styled.img`
  height: 32px;
`

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
`

const MessageText = styled.p`
  margin: 0;
  max-width: 420px;
  font-size: 14px;
  color: #6b7280;
`

const ActionLink = styled.a`
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${mainColors.primaryColor};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const SecondaryLink = styled.a`
  font-size: 13px;
  color: #6b7280;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: ${mainColors.primaryColor};
  }
`

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: ${mainColors.primaryColor};
  border-radius: 50%;
  animation: ${spin} 700ms linear infinite;
`
