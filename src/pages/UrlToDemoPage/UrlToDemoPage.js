import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import ENV from '../../config.json'
import Logo from '../../static/images/logo-round.svg'
import mainColors from '../../constants/mainColors'

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const normalizeUrl = (value) => {
  let v = (value || '').trim()
  if (!v) return ''
  if (/^http:\/\//i.test(v)) return ''
  if (!/^https:\/\//i.test(v)) v = 'https://' + v
  let u
  try { u = new URL(v) } catch { return '' }
  if (u.protocol !== 'https:') return ''
  const host = u.hostname
  if (!host || !host.includes('.')) return ''
  const tld = host.split('.').pop()
  if (!/^[a-z]{2,}$/i.test(tld)) return ''
  return u.href
}

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

const getBrowserSessionId = (fromQuery) => {
  if (typeof window === 'undefined') return null
  const key = 'LiveDemo_browserSessionId'
  if (fromQuery) {
    sessionStorage.setItem(key, fromQuery)
    return fromQuery
  }
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = generateUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

function UrlToDemoPage({ authData }) {
  const [searchParams] = useSearchParams()
  const rawUrl = searchParams.get('url')
  const browserSessionIdParam = searchParams.get('browserSessionId')
  const [error, setError] = useState('')
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return

    const url = normalizeUrl(rawUrl ? decodeURIComponent(rawUrl) : '')
    if (!url) {
      setError('Please provide a valid URL (e.g. ?url=https://yourwebsite.com)')
      return
    }

    startedRef.current = true
    const browserSessionId = getBrowserSessionId(browserSessionIdParam)

    const headers = { 'Content-Type': 'application/json' }
    if (authData?.token) {
      headers.Authorization = `Bearer ${authData.token}`
    }

    fetch(`${ENV.API_URL}/urldemos`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url, browserSessionId }),
    })
      .then(async (res) => {
        let responseData = null
        try {
          responseData = await res.json()
        } catch {
          throw new Error('Invalid response')
        }
        if (responseData?._id) {
          window.location.href = `${ENV.APP_URL}/preview?urlDemoId=${responseData._id}&browserSessionId=${responseData.browserSessionId || browserSessionId}`
          return
        }
        throw new Error(responseData?.error || 'Something went wrong. Please try again.')
      })
      .catch((err) => {
        startedRef.current = false
        setError(err.message || 'Something went wrong. Please try again.')
      })
  }, [rawUrl, browserSessionIdParam, authData?.token])

  return (
    <Wrapper>
      <Content>
        <LogoImg src={Logo} alt="LiveDemo" />
        {error ? (
          <>
            <Title>Something went wrong</Title>
            <ErrorText>{error}</ErrorText>
            <BackLink href={ENV.LANDING_URL}>Back to LiveDemo</BackLink>
          </>
        ) : (
          <>
            <Title>Creating your demo...</Title>
            <Spinner />
          </>
        )}
      </Content>
    </Wrapper>
  )
}

function mapStateToProps(state) {
  return {
    authData: state.authReducer.authData,
  }
}

export default connect(mapStateToProps)(UrlToDemoPage)

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

const ErrorText = styled.p`
  margin: 0;
  max-width: 420px;
  font-size: 14px;
  color: #6b7280;
`

const BackLink = styled.a`
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${mainColors.primaryColor};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
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
