import React, { useState } from 'react'
import styled from 'styled-components'
import Colors from '../../constants/mainColors'
import axios from '../../utils/axiosInstance'

export default function InviteUsersModal({ workspace, authToken, onClose }) {
  const [internalNewEmail, setInternalNewEmail] = useState('')
  const [internalWorkspace, setInternalWorkspace] = useState(workspace)
  const [isSending, setIsSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const overlayRef = React.useRef(null)

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  function handleInvite() {
    if (!internalNewEmail || !internalNewEmail.includes('@')) {
      setErrorMsg('Enter valid email')
      return
    }
    setIsSending(true)
    setErrorMsg('')
    setSuccessMsg('')
    return axios.post(`/workspaces/${workspace._id}/addUser`, {
      email: internalNewEmail
    }, { headers: { 'Authorization': `Bearer ${authToken}` } })
      .then(req => {
        setInternalWorkspace(req.data)
        setInternalNewEmail('')
        setSuccessMsg(`Invite sent to ${internalNewEmail}`)
        setIsSending(false)
      })
      .catch(err => {
        setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to send invite')
        setIsSending(false)
      })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleInvite()
    if (e.key === 'Escape') onClose()
  }

  return (
    <M.Overlay ref={overlayRef} onClick={handleOverlayClick}>
      <M.Panel>
        <M.Header>
          <M.HeaderLeft>
            <M.HeaderIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </M.HeaderIcon>
            <M.HeaderTitle>Invite Team Members</M.HeaderTitle>
          </M.HeaderLeft>
          <M.CloseButton onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </M.CloseButton>
        </M.Header>

        <M.Body>
          <M.SectionLabel>Pending Invites</M.SectionLabel>
          <M.InviteList>
            {internalWorkspace.invitedEmails && internalWorkspace.invitedEmails.length > 0 ? (
              internalWorkspace.invitedEmails.map((email, idx) => (
                <M.InviteItem key={idx}>
                  <M.InviteItemDot />
                  <M.InviteItemEmail>{email}</M.InviteItemEmail>
                  <M.InviteItemBadge>Pending</M.InviteItemBadge>
                </M.InviteItem>
              ))
            ) : (
              <M.EmptyState>No pending invites</M.EmptyState>
            )}
          </M.InviteList>

          <M.Divider />

          <M.SectionLabel>Invite by Email</M.SectionLabel>
          <M.InputRow>
            <M.EmailInput
              placeholder="colleague@company.com"
              value={internalNewEmail}
              onChange={e => setInternalNewEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <M.InviteBtn onClick={handleInvite} disabled={isSending}>
              {isSending ? (
                <M.SpinnerDot />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send Invite
                </>
              )}
            </M.InviteBtn>
          </M.InputRow>
          {errorMsg && <M.ErrorMsg>{errorMsg}</M.ErrorMsg>}
          {successMsg && <M.SuccessMsg>{successMsg}</M.SuccessMsg>}
        </M.Body>

        <M.Footer>
          <M.FooterText>Invites expire after 7 days</M.FooterText>
          <M.DoneBtn onClick={onClose}>Done</M.DoneBtn>
        </M.Footer>
      </M.Panel>
    </M.Overlay>
  )
}

const M = {
  Overlay: styled.div`
    position: fixed;
    inset: 0;
    background: rgba(10, 15, 35, 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.15s ease;

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  Panel: styled.div`
    background: #ffffff;
    border-radius: 16px;
    width: 480px;
    max-width: calc(100vw - 32px);
    box-shadow: 0 24px 64px rgba(16, 112, 255, 0.18), 0 4px 16px rgba(0,0,0,0.12);
    overflow: hidden;
    animation: slideUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid rgba(16, 112, 255, 0.12);

    @keyframes slideUp {
      from { transform: translateY(20px) scale(0.97); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
  `,
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    background: ${Colors.primaryColor};
  `,
  HeaderLeft: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
  `,
  HeaderIcon: styled.div`
    width: 36px;
    height: 36px;
    background: rgba(255,255,255,0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 18px;
      height: 18px;
      stroke: white;
    }
  `,
  HeaderTitle: styled.h2`
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: white;
    font-family: ${Colors.fontFamilyLexend};
    letter-spacing: -0.2px;
  `,
  CloseButton: styled.button`
    background: rgba(255,255,255,0.15);
    border: none;
    border-radius: 8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;

    svg {
      width: 14px;
      height: 14px;
      stroke: white;
    }

    &:hover {
      background: rgba(255,255,255,0.28);
    }
  `,
  Body: styled.div`
    padding: 24px;
  `,
  SectionLabel: styled.p`
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8a94a6;
    margin: 0 0 10px 0;
    font-family: ${Colors.fontFamily};
  `,
  InviteList: styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 160px;
    overflow-y: auto;
    border: 1px solid #e8edf5;
    border-radius: 10px;
    background: #f7f9fc;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: ${Colors.primaryColor}; border-radius: 4px; }
  `,
  InviteItem: styled.li`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-bottom: 1px solid #e8edf5;

    &:last-child { border-bottom: none; }
  `,
  InviteItemDot: styled.span`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${Colors.primaryColor};
    flex-shrink: 0;
  `,
  InviteItemEmail: styled.span`
    font-size: 13px;
    color: #2d3748;
    flex: 1;
    font-family: ${Colors.fontFamily};
  `,
  InviteItemBadge: styled.span`
    font-size: 11px;
    font-weight: 500;
    color: #d97706;
    background: #fef3c7;
    border-radius: 20px;
    padding: 2px 8px;
    font-family: ${Colors.fontFamily};
  `,
  EmptyState: styled.div`
    text-align: center;
    padding: 20px;
    color: #aab4c4;
    font-size: 13px;
    font-family: ${Colors.fontFamily};
  `,
  Divider: styled.hr`
    border: none;
    border-top: 1px solid #e8edf5;
    margin: 20px 0;
  `,
  InputRow: styled.div`
    display: flex;
    gap: 10px;
    align-items: stretch;
  `,
  EmailInput: styled.input`
    flex: 1;
    height: 42px;
    border: 1.5px solid #d0d9e8;
    border-radius: 10px;
    padding: 0 14px;
    font-size: 14px;
    font-family: ${Colors.fontFamily};
    color: #2d3748;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    background: white;

    &::placeholder { color: #b0bac9; }

    &:focus {
      border-color: ${Colors.primaryColor};
      box-shadow: 0 0 0 3px rgba(16, 112, 255, 0.12);
    }
  `,
  InviteBtn: styled.button`
    height: 42px;
    padding: 0 18px;
    background: ${Colors.primaryColor};
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    font-family: ${Colors.fontFamily};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
    transition: opacity 0.15s, transform 0.1s;
    flex-shrink: 0;

    &:hover:not(:disabled) {
      opacity: 0.88;
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
  SpinnerDot: styled.span`
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,
  ErrorMsg: styled.p`
    margin: 8px 0 0;
    font-size: 12px;
    color: #e53e3e;
    font-family: ${Colors.fontFamily};
  `,
  SuccessMsg: styled.p`
    margin: 8px 0 0;
    font-size: 12px;
    color: #38a169;
    font-family: ${Colors.fontFamily};
  `,
  Footer: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    border-top: 1px solid #e8edf5;
    background: #f7f9fc;
  `,
  FooterText: styled.p`
    margin: 0;
    font-size: 12px;
    color: #a0aab8;
    font-family: ${Colors.fontFamily};
  `,
  DoneBtn: styled.button`
    height: 34px;
    padding: 0 20px;
    background: transparent;
    border: 1.5px solid #d0d9e8;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #4a5568;
    font-family: ${Colors.fontFamily};
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;

    &:hover {
      border-color: ${Colors.primaryColor};
      color: ${Colors.primaryColor};
    }
  `,
}
