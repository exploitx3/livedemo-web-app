import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { useNavigate } from 'react-router-dom'
import mainColors from '../../constants/mainColors'
import { showErrorsForResponse } from '../../utils/helperFunctions'
import {
  logout,
  checkEmailVerificationCode,
  sendEmailVerificationCode,
} from '../../actions/authActions'
import { MdArrowBack } from 'react-icons/md'

const CODE_LENGTH = 6

function EmailVerifyPage({ authData, authActions }) {
  const navigate = useNavigate()
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''))
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef([])

  const email = authData?.email || ''

  useEffect(() => {
    if (resendCooldown <= 0) return undefined
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  function focusInput(index) {
    inputRefs.current[index]?.focus()
  }

  function handleDigitChange(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)

    if (digit && index < CODE_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1)
    }
  }

  function handlePaste(event) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return

    const next = Array(CODE_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i += 1) {
      next[i] = pasted[i]
    }
    setDigits(next)
    focusInput(Math.min(pasted.length, CODE_LENGTH - 1))
  }

  function onVerify() {
    const code = digits.join('')
    if (code.length !== CODE_LENGTH) {
      return
    }

    setIsVerifying(true)
    return authActions.checkEmailVerificationCode(code, authData?.token)
      .then((responseData) => {
        const redirectPath = responseData?.redirectPath || '/onboarding'
        navigate(redirectPath, { replace: true })
      })
      .catch((error) => {
        showErrorsForResponse(error)
      })
      .finally(() => {
        setIsVerifying(false)
      })
  }

  function onResend() {
    if (resendCooldown > 0 || isResending) {
      return
    }

    setIsResending(true)
    return authActions.sendEmailVerificationCode(authData?.token)
      .then(() => {
        setResendCooldown(60)
        setDigits(Array(CODE_LENGTH).fill(''))
        focusInput(0)
      })
      .catch((error) => {
        showErrorsForResponse(error)
      })
      .finally(() => {
        setIsResending(false)
      })
  }

  function onLogout() {
    const token = authData?.token
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    authActions.logout(token)
      .then(() => {
        navigate('/login', { replace: true })
      })
      .catch(() => {
        navigate('/login', { replace: true })
      })
  }

  const codeComplete = digits.every((d) => d !== '')

  return (
    <S.Page $whiteIntro>
      <S.GoalsBlobLayer aria-hidden>
        <S.GoalsBlob $tl />
        <S.GoalsBlob $br />
      </S.GoalsBlobLayer>

      <S.TopBar $whiteIntro>
        <S.TextButton type="button" onClick={onLogout}>
          <MdArrowBack size={18} aria-hidden />
          Back to login
        </S.TextButton>
      </S.TopBar>

      <S.Main $whiteIntro>
        <S.Shell>
          <S.Inner>
            <S.Header>
              <S.Title>Verify your email</S.Title>
              <S.Subtitle>
                We sent a 6-digit code to <S.EmailHighlight>{email}</S.EmailHighlight>
              </S.Subtitle>
            </S.Header>

            <S.CodeRow onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <S.CodeInput
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </S.CodeRow>

            <S.ActionRow>
              <S.ResendButton
                type="button"
                onClick={onResend}
                disabled={isResending || resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : isResending
                    ? 'Sending...'
                    : 'Resend code'}
              </S.ResendButton>

              <S.VerifyButton
                type="button"
                disabled={!codeComplete || isVerifying}
                onClick={onVerify}
              >
                {isVerifying ? 'Verifying...' : 'Verify email'}
              </S.VerifyButton>
            </S.ActionRow>

            <S.HelpText>
              Check your spam folder if you do not see the email within a few minutes.
            </S.HelpText>
          </S.Inner>
        </S.Shell>
      </S.Main>
    </S.Page>
  )
}

const S = {
  Page: styled.div`
    position: relative;
    min-height: 100vh;
    width: 100%;
    box-sizing: border-box;
    background: #fff;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `,
  GoalsBlobLayer: styled.div`
    pointer-events: none;
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 0;
  `,
  GoalsBlob: styled.div`
    position: absolute;
    width: 16rem;
    height: 16rem;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.2;
    ${(p) =>
      p.$tl
        ? `
      top: -4rem;
      left: -4rem;
      background: linear-gradient(to bottom right, #c084fc, #818cf8);
    `
        : `
      bottom: -4rem;
      right: -4rem;
      background: linear-gradient(to bottom right, #f472b6, #c084fc);
    `}
  `,
  TopBar: styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 72rem;
    width: 100%;
    margin: 0 auto;
    padding: 0.5rem 1rem 0;

    @media (min-width: 640px) {
      padding: 0.5rem 3rem 0;
    }
  `,
  TextButton: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #4b5563;
    padding: 8px 4px;
    font-family: inherit;

    &:hover {
      color: #111827;
    }
  `,
  Main: styled.div`
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    width: 100%;
    min-height: 0;
  `,
  Shell: styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      'Helvetica Neue', Arial, sans-serif;
  `,
  Inner: styled.div`
    width: 100%;
    max-width: 32rem;
    margin: 0 auto;
    padding: 1.5rem 1rem;

    @media (min-width: 640px) {
      padding: 2.5rem 3rem;
    }
  `,
  Header: styled.div`
    text-align: center;
    margin-bottom: 2rem;
  `,
  Title: styled.h1`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.025em;
    color: #111827;
    line-height: 1.25;

    @media (min-width: 640px) {
      font-size: 1.875rem;
    }
  `,
  Subtitle: styled.p`
    margin: 0.75rem 0 0;
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;

    @media (min-width: 640px) {
      font-size: 1rem;
    }
  `,
  EmailHighlight: styled.span`
    color: #111827;
    font-weight: 500;
  `,
  CodeRow: styled.div`
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;

    @media (min-width: 640px) {
      gap: 0.75rem;
    }
  `,
  CodeInput: styled.input`
    width: 2.75rem;
    height: 3.25rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background: #fff;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:focus {
      border-color: ${mainColors.primaryColor};
      box-shadow: 0 0 0 3px rgba(16, 112, 255, 0.15);
    }

    @media (min-width: 640px) {
      width: 3.25rem;
      height: 3.75rem;
      font-size: 1.5rem;
    }
  `,
  ActionRow: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  `,
  ResendButton: styled.button`
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${mainColors.primaryColor};
    font-family: inherit;
    padding: 0.25rem;

    &:disabled {
      color: #9ca3af;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      color: ${mainColors.primaryColorDarker};
    }
  `,
  VerifyButton: styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    width: 100%;
    max-width: 20rem;
    padding: 0.625rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    color: #fff;
    background: ${mainColors.primaryColor};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover:not(:disabled) {
      background: ${mainColors.primaryColorDarker};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
  HelpText: styled.p`
    margin: 1.5rem 0 0;
    text-align: center;
    font-size: 0.8125rem;
    color: #9ca3af;
    line-height: 1.5;
  `,
}

const mapStateToProps = (state) => ({
  authData: state.authReducer.authData,
})

function mapDispatchToProps(dispatch) {
  return {
    authActions: bindActionCreators({
      logout,
      checkEmailVerificationCode,
      sendEmailVerificationCode,
    }, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EmailVerifyPage)
