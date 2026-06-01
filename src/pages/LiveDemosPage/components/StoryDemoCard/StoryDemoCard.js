import React, { useState, useEffect, useRef, memo } from 'react'
import { toast } from 'react-hot-toast'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import ENV from '../../../../config'
import axios from '../../../../utils/axiosInstance'
import mainColors from '../../../../constants/mainColors'

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: 16, height: 16, strokeWidth: 2 }}>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="currentStroke"
      d="m12.708 18.364-1.415 1.414a5 5 0 1 1-7.07-7.07l1.413-1.415m12.728 1.414 1.415-1.414a5 5 0 0 0-7.071-7.071l-1.415 1.414M8.5 15.5l7-7"
      vectorEffect="non-scaling-stroke" />
  </svg>
)

const EllipsisIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
    <path fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
      vectorEffect="non-scaling-stroke" />
  </svg>
)

const NavigateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: 16, height: 16, strokeWidth: '1.5px', flexShrink: 0 }}>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="currentStroke"
      d="m3.507 5.415 5.127 14.833c.451 1.307 2.28 1.359 2.805.08l2.35-5.72a1.5 1.5 0 0 1 .818-.818l5.721-2.351c1.279-.525 1.227-2.354-.08-2.805L5.415 3.507C4.232 3.1 3.1 4.232 3.507 5.415"
      vectorEffect="non-scaling-stroke" />
  </svg>
)

function formatRelativeDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Edited today'
  if (diffDays === 1) return 'Edited yesterday'
  if (diffDays < 30) return `Edited ${diffDays} days ago`
  if (diffDays < 60) return 'Edited 1 month ago'
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `Edited ${diffMonths} months ago`
  return `Edited ${Math.floor(diffMonths / 12)} year${Math.floor(diffMonths / 12) > 1 ? 's' : ''} ago`
}

function formatAbsoluteDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `Edited ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

// ─── Styled components defined at module level (never re-created) ─────────────

const CardRoot = styled.div`
  position: relative;
  border-radius: 12px;
  background: #ffffff;
  user-select: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  z-index: 10;
  border: 2px solid transparent;
  box-sizing: border-box;

  &:not([data-hidden='true']):hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
    border: 2px solid ${mainColors.primaryColor};
  }

  &:hover .hover-actions {
    opacity: 1;
    visibility: visible;
  }

  &:hover .locked-demo-message {
    opacity: 1;
    visibility: visible;
  }

  &:not([data-hidden='true']):hover .thumbnail-overlay {
    background: rgba(17,24,39,0.08);
  }

  &[data-hidden='true'] {
    cursor: not-allowed;
  }

  &[data-hidden='true'] .thumbnail-inner {
    filter: blur(4px);
  }

  &[data-hidden='true']:hover .locked-demo-message {
    opacity: 1;
  }
`

const CardInsetShadow = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  pointer-events: none;
  z-index: 11;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.07);
  transition: box-shadow 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  [data-hidden='false']:hover &,
  :not([data-hidden]):hover & {
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  }
`

const ThumbnailArea = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  padding: 4px 4px 0;
`

const ThumbnailInner = styled.div.attrs({ className: 'thumbnail-inner' })`
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s ease;
`

const Thumbnail = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  transition: opacity 0.2s ease;
`

const ThumbnailFallback = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, ${mainColors.primaryColor} 0%, ${mainColors.primaryColorDarker} 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ThumbnailFallbackLetter = styled.span`
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
  text-transform: uppercase;
`

const ThumbnailOverlay = styled.div.attrs({ className: 'thumbnail-overlay' })`
  pointer-events: none;
  background: rgba(17,24,39,0.02);
  transition: background 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: absolute;
  inset: 0;
  border-radius: 8px;
`

const ThumbnailGradient = styled.div`
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, rgba(17,24,39,0.10));
  height: 40px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`

const HoverActions = styled.div.attrs({ className: 'hover-actions' })`
  z-index: 10;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 12px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              visibility 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
`

const HoverActionsRight = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`

const IconButton = styled.button`
  font-weight: 600;
  position: relative;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: #111827;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
  backdrop-filter: blur(6px);
  transition: background 0.2s ease;
  flex-shrink: 0;
  padding: 0;
  z-index: 10;
  outline: none;

  &:hover { background: rgba(249, 250, 251, 1); }
  &:active { background: rgba(229, 231, 235, 1); }
`

const MenuWrapper = styled.div`
  position: relative;
`

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.07);
  min-width: 120px;
  z-index: 50;
  overflow: hidden;
  padding: 4px;
`

const DropdownItem = styled.div`
  padding: 6px 10px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #111827;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;

  &:hover { background: #f9fafb; }

  &[data-danger='true'] {
    color: #dc2626;
    &:hover { background: #fef2f2; }
  }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  height: 100%;
  justify-content: space-between;
`

const BodyTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Title = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`

const DateWrapper = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
  line-height: 1.25;
  cursor: default;

  &:hover span:first-child { display: none; }
  &:hover span:last-child { display: inline; }
`

const DateRelative = styled.span`
  display: inline;
`

const DateAbsolute = styled.span`
  display: none;
  white-space: break-spaces;
`

const BodyBottom = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 5px;
  height: 30px;
`

const StyledTippyCard = styled(Tippy)`


  &&.tippy-card {
    background: #000000e0 !important;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 6px;


    &&.tippy-card .tippy-content { padding: 4px 8px !important; }
    &&.tippy-card .tippy-arrow::before { color: #000000e0 !important; }
  }

`

const LockedMessage = styled.span`
  position: relative;
  font-size: 0.7rem;
  font-weight: 500;
  color: #6b7280;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
`

const NavIconBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 8px;
  color: #2563eb;
  background: #eff6ff;
  transition: background 0.2s ease;

  &:hover { background: #dbeafe; }
`

// ─────────────────────────────────────────────────────────────────────────────

const StoryDemoCard = ({ storyDemo, onDeleteLiveDemo, hidden }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isImageError, setIsImageError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  let imageUrl = storyDemo.thumbnailImageUrl || ''
  if (!imageUrl) {
    for (let screen of storyDemo.screens || []) {
      if (screen.imageUrl) {
        imageUrl = screen.imageUrl
        break
      }
    }
  }

  useEffect(() => {
    setIsImageLoaded(false)
    setIsImageError(false)
  }, [imageUrl])

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  function copyToClipboard(textToCopy) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(textToCopy)
    } else {
      let textArea = document.createElement('textarea')
      textArea.value = textToCopy
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      return new Promise((res, rej) => {
        document.execCommand('copy') ? res() : rej()
        textArea.remove()
      })
    }
  }

  function handleCopyLink(e) {
    e.stopPropagation()
    const url = `${window.location.origin}/workspace/${storyDemo.workspaceId}/storydemo/${storyDemo._id}`
    copyToClipboard(url)
    toast('Copied to clipboard', {
      duration: 2500,
      position: 'top-center',
      style: { borderRadius: '25px', background: '#111', color: '#fff' },
      ariaProps: { role: 'status', 'aria-live': 'polite' },
    })
  }

  const updatedAt = storyDemo.updatedAt || storyDemo.createdAt

  function handleCardClick() {
    if (!hidden) {
      navigate(`/workspace/${storyDemo.workspaceId}/storydemo/${storyDemo._id}`)
    }
  }

  return (
    <CardRoot data-hidden={hidden ? 'true' : 'false'} onClick={handleCardClick}>
      <CardInsetShadow />

      <ThumbnailArea>
        <ThumbnailInner>
          {imageUrl && !isImageError ? (
            <Thumbnail
              src={imageUrl}
              alt={storyDemo.name}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageError(true)}
              style={{ opacity: isImageLoaded ? 1 : 0 }}
            />
          ) : (
            <ThumbnailFallback>
              <ThumbnailFallbackLetter>{(storyDemo.name || 'D')[0].toUpperCase()}</ThumbnailFallbackLetter>
            </ThumbnailFallback>
          )}
          <ThumbnailOverlay />
          <ThumbnailGradient />
        </ThumbnailInner>

        {hidden === false ? (
          <HoverActions>
            <span />
            <HoverActionsRight>
              <IconButton onClick={handleCopyLink} aria-label="Copy share link" title="Copy share link">
                <LinkIcon />
              </IconButton>
              <MenuWrapper ref={menuRef}>
                <IconButton
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
                  aria-label="More options"
                  aria-expanded={menuOpen}
                >
                  <EllipsisIcon />
                </IconButton>
                {menuOpen && (
                  <DropdownMenu onClick={(e) => e.stopPropagation()}>
                    <DropdownItem onClick={(e) => { e.stopPropagation(); setMenuOpen(false); navigate(`/workspace/${storyDemo.workspaceId}/storydemo/${storyDemo._id}`) }}>
                      Open
                    </DropdownItem>
                    <DropdownItem data-danger="true" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDeleteLiveDemo(storyDemo) }}>
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                )}
              </MenuWrapper>
            </HoverActionsRight>
          </HoverActions>
        ) : (
          <HoverActions>
            <span />
            <HoverActionsRight>
              <MenuWrapper ref={menuRef}>
                <IconButton
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
                  aria-label="More options"
                  aria-expanded={menuOpen}
                >
                  <EllipsisIcon />
                </IconButton>
                {menuOpen && (
                  <DropdownMenu onClick={(e) => e.stopPropagation()}>
                    <DropdownItem data-danger="true" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDeleteLiveDemo(storyDemo) }}>
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                )}
              </MenuWrapper>
            </HoverActionsRight>
          </HoverActions>
        )}
      </ThumbnailArea>

      <Body>
        <BodyTop>
          <Title title={storyDemo.name}>{storyDemo.name}</Title>
          <DateWrapper>
            <DateRelative>{formatRelativeDate(updatedAt)}</DateRelative>
            <DateAbsolute>{formatAbsoluteDate(updatedAt)}</DateAbsolute>
          </DateWrapper>
        </BodyTop>

        <BodyBottom>
          {!hidden ? (
            <StyledTippyCard className="tippy-card" content="Interactive Demo" placement="bottom" arrow={true} offset={[0, 6]}>
              <NavIconBadge onClick={handleCardClick}>
                <NavigateIcon />
              </NavIconBadge>
            </StyledTippyCard>
          ) : (
            <LockedMessage className="locked-demo-message">
              Purchase a plan to unlock this demo
            </LockedMessage>
          )}

        </BodyBottom>
      </Body>
    </CardRoot>
  )
}

export default memo(StoryDemoCard)
