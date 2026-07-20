import React from 'react'
import styled, { keyframes } from 'styled-components'
import PointerIcon from '../../static/images/pointer.svg'
import mainColors from '../../constants/mainColors'
import CONFIG from '../../config'

const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translate3d(0, 10%, 0);
    }
    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
`

const ArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.99935 15.8307V4.16406M9.99935 4.16406L4.16602 9.9974M9.99935 4.16406L15.8327 9.9974"
            stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

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

const getBrowserSessionId = () => {
    if (typeof window === 'undefined') return null
    const key = 'LiveDemo_browserSessionId'
    let id = sessionStorage.getItem(key)
    if (!id) {
        id = generateUUID()
        sessionStorage.setItem(key, id)
    }
    return id
}

export default function UrlToDemo({ inModal = false, onSuccess }) {
    const [error, setError] = React.useState('')
    const [inputVal, setInputVal] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [browserSessionId] = React.useState(() => getBrowserSessionId())

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        const url = normalizeUrl(inputVal)
        if (!url) {
            setError('Please enter a valid domain (e.g. yourwebsite.com or https://www.yourwebsite.com)')
            return
        }
        setLoading(true)
        if (onSuccess) {
            onSuccess()
        }
        window.location.href = `${CONFIG.APP_URL}/url-to-demo?url=${encodeURIComponent(url)}&browserSessionId=${encodeURIComponent(browserSessionId)}`
    }

    return (
        <Wrapper $inModal={inModal}>
            <FormWrapper>
                <Form onSubmit={handleSubmit} noValidate>
                    <DemoLabel>
                        <DemoLabelIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18" style={{ display: 'flex', width: 18, height: 18 }}>
                                <path stroke="currentColor" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeWidth="1.5" d="m2.63 4.061 3.845 11.125c.339.98 1.71 1.019 2.104.06l1.763-4.291c.114-.278.335-.499.613-.613l4.29-1.763c.96-.394.92-1.765-.06-2.104L4.062 2.63a1.125 1.125 0 0 0-1.43 1.431Z" />
                            </svg>
                        </DemoLabelIcon>
                        <DemoLabelText>Demo</DemoLabelText>
                    </DemoLabel>
                    <Input
                        type="text"
                        autoComplete="off"
                        placeholder="https://piedpiper.com"
                        required
                        value={inputVal}
                        onChange={e => { setInputVal(e.target.value); setError('') }}
                    />
                    <SubmitButton type="submit" disabled={loading}>
                        {loading ? <Spinner /> : <ArrowIcon />}
                    </SubmitButton>
                </Form>
                {error && <ErrorText>{error}</ErrorText>}
                {/* <TryNudge>
                    <TryIcon
                        src={PointerIcon}
                        loading="lazy"
                        alt=""
                    />
                    <TryText>Try with your website!</TryText>
                </TryNudge> */}
            </FormWrapper>
        </Wrapper>
    )
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    margin-top: ${(p) => (p.$inModal ? '0' : '1.75rem')};
    position: relative;
    animation: ${(p) => (p.$inModal ? 'none' : fadeInUp)} 1000ms ease-out 600ms 1 normal backwards;
    padding: ${(p) => (p.$inModal ? '0' : '32px 24px 28px')};
`

const FormWrapper = styled.div`
    width: 100%;
    max-width: 470px;
    position: relative;
    padding: 14px 16px;
    transition: transform 0.2s ease;

`

const Form = styled.form`
    display: flex;
    flex-direction: row;
    align-items: center;
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    padding: 6px 6px 6px 14px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    gap: 8px;
    transition: border-color 200ms ease;

    &:focus-within {
        border-color: #4460ed;
    }
`

const Input = styled.input`
    flex: 1;
    border: none;
    background: transparent;
    outline: none !important;
    font-size: 0.95rem;
    color: #111827;
    font-family: Inter, sans-serif;
    min-width: 0;

    &::placeholder {
        color: #9ca3af;
    }

    &:disabled {
        opacity: 0.5;
    }

    &:focus {
        outline: none !important;
        box-shadow: none !important;
        border-color: none !important;
    }
`

const SubmitButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: none;
    background: ${mainColors.primaryColor};
    cursor: pointer;
    flex-shrink: 0;
    transition: background 150ms ease, opacity 150ms ease;

    &:hover:not(:disabled) {
        background: ${mainColors.primaryColorDarker};
    }

    &:focus, &:active {
        outline: none !important;
        box-shadow: none !important;
        border-color: none !important;
    }

    & svg {
        transition: transform 0.4s ease;
    }

    &:hover svg {
        transform: rotate(90deg);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`

const DemoLabel = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 36px;
    padding: 0 10px 0 8px;
    position: relative;
    z-index: 2;
    flex-shrink: 0;
    color: #111827;
    font-family: Inter, sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    border-right: 1px solid #e5e7eb;
    transition: all 0.2s cubic-bezier(0.6, 0.6, 0, 1);
    white-space: nowrap;
`

const DemoLabelIcon = styled.div`
    display: flex;
    align-items: center;
`

const DemoLabelText = styled.div`
    font-size: 0.875rem;
    line-height: 1;
    font-family: Inter, sans-serif;
`

const spinKeyframes = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
`

const Spinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ${spinKeyframes} 700ms linear infinite;
`

const ErrorText = styled.p`
    margin: 8px 0 0 4px;
    font-size: 0.85rem;
    color: rgb(255, 255, 255);
    font-family: Inter, sans-serif;
`

const TryNudge = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 10px;
    padding: 6px 12px;
    border-radius: 20px;
    width: 100%;
`

const TryIcon = styled.img`
    width: 16px;
    height: 16px;
    display: block;
    flex-shrink: 0;
`

const TryText = styled.div`
    font-family: ${mainColors.fontFamilyRobotoMono};
    color: ${mainColors.primaryColor};
    font-weight: 700;
    font-size: 0.8rem;
`
