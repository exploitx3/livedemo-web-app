import React, { useState, useEffect, memo } from 'react'
import styled from 'styled-components'
import mainColors from '../../../../constants/mainColors'

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M17 11V8A5 5 0 0 0 7 8v3m1.8 10h6.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C20 18.72 20 17.88 20 16.2v-.4c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.72 11 16.88 11 15.2 11H8.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C4 13.28 4 14.12 4 15.8v.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C6.28 21 7.12 21 8.8 21"
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

const StoryDemoHiddenCard = ({ storyDemo }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isImageError, setIsImageError] = useState(false)

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

  const updatedAt = storyDemo.updatedAt || storyDemo.createdAt

  return (
    <S.Card>
      <S.CardInsetShadow />

      <S.ThumbnailArea>
        <S.ThumbnailInner>
          {imageUrl && !isImageError ? (
            <S.Thumbnail
              src={imageUrl}
              alt={storyDemo.name}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageError(true)}
              style={{ opacity: isImageLoaded ? 1 : 0 }}
            />
          ) : (
            <S.ThumbnailFallback>
              <S.ThumbnailFallbackLetter>{(storyDemo.name || 'D')[0].toUpperCase()}</S.ThumbnailFallbackLetter>
            </S.ThumbnailFallback>
          )}
          <S.ThumbnailOverlay />
          <S.ThumbnailGradient />
        </S.ThumbnailInner>

        <S.LockOverlay>
          <S.LockBadge>
            <LockIcon />
          </S.LockBadge>
        </S.LockOverlay>
      </S.ThumbnailArea>

      <S.Body>
        <S.BodyTop>
          <S.Title title={storyDemo.name}>{storyDemo.name}</S.Title>
          <S.DateText>{formatRelativeDate(updatedAt)}</S.DateText>
        </S.BodyTop>

        <S.BodyBottom />
      </S.Body>
    </S.Card>
  )
}

export default memo(StoryDemoHiddenCard)

const S = {}

S.Card = styled.div`
  position: relative;
  border-radius: 12px;
  background: #ffffff;
  user-select: none;
  cursor: not-allowed;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  z-index: 10;
  border: 2px solid transparent;
  box-sizing: border-box;
`

S.CardInsetShadow = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  pointer-events: none;
  z-index: 11;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.07);
`

S.ThumbnailArea = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  padding: 4px 4px 0;
`

S.ThumbnailInner = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  position: relative;
`

S.LockOverlay = styled.div`
  position: absolute;
  inset: 4px 4px 0;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`

S.LockBadge = styled.div`
  background: white;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.10);
  color: #374151;
  flex-shrink: 0;
`

S.Thumbnail = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  transition: opacity 0.2s ease;
`

S.ThumbnailFallback = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, ${mainColors.primaryColor} 0%, ${mainColors.primaryColorDarker} 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`

S.ThumbnailFallbackLetter = styled.span`
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
  text-transform: uppercase;
`

S.ThumbnailOverlay = styled.div`
  pointer-events: none;
  background: rgba(17,24,39,0.02);
  position: absolute;
  inset: 0;
  border-radius: 8px;
`

S.ThumbnailGradient = styled.div`
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, rgba(17,24,39,0.10));
  height: 40px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`

S.Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  height: 100%;
  justify-content: space-between;
`

S.BodyTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

S.Title = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`

S.DateText = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
  line-height: 1.25;
`

S.BodyBottom = styled.div`
  height: 24px;
  margin-top: 20px;
`
