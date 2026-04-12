import React, { useCallback, useMemo } from 'react'
import CoreCursor from '../CoreCursor/CoreCursor.js'

const lerp = (a, b, t) => a + (b - a) * t

function sortByTime(positions) {
  return [...positions].sort((x, y) => x.timeMs - y.timeMs)
}

function absoluteMsForVideoTime(sorted, video) {
  if (!sorted.length || !video) return null
  const tMin = sorted[0].timeMs
  const tMax = sorted[sorted.length - 1].timeMs
  if (tMax <= tMin) return tMin
  const dur = video.duration
  if (!Number.isFinite(dur) || dur <= 0) return tMin
  const u = Math.min(1, Math.max(0, video.currentTime / dur))
  return tMin + u * (tMax - tMin)
}

function interpolatePoint(sorted, timeMs) {
  if (!sorted.length) return null
  if (sorted.length === 1) return { x: sorted[0].frameX, y: sorted[0].frameY }
  if (timeMs <= sorted[0].timeMs) return { x: sorted[0].frameX, y: sorted[0].frameY }
  const last = sorted[sorted.length - 1]
  if (timeMs >= last.timeMs) return { x: last.frameX, y: last.frameY }

  let lo = 0
  let hi = sorted.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (sorted[mid].timeMs <= timeMs) lo = mid
    else hi = mid
  }
  const a = sorted[lo]
  const b = sorted[hi]
  const u = (timeMs - a.timeMs) / (b.timeMs - a.timeMs)
  return { x: lerp(a.frameX, b.frameX, u), y: lerp(a.frameY, b.frameY, u) }
}

/**
 * Where the decoded video frame is actually painted inside the video element (CSS px, viewport coords).
 * Matches browser object-fit: letterboxing/pillarboxing must be applied the same way for cursor as for pixels.
 */
function getVideoPaintedRect(video) {
  const rect = video.getBoundingClientRect()
  const iw = video.videoWidth
  const ih = video.videoHeight
  if (!iw || !ih || rect.width <= 0 || rect.height <= 0) {
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
  }

  const fit = (getComputedStyle(video).objectFit || 'fill').toLowerCase()
  const boxW = rect.width
  const boxH = rect.height
  const ar = iw / ih
  const boxAr = boxW / boxH

  if (fit === 'contain' || fit === 'scale-down') {
    if (ar > boxAr) {
      const h = boxW / ar
      return {
        left: rect.left,
        top: rect.top + (boxH - h) / 2,
        width: boxW,
        height: h,
      }
    }
    const w = boxH * ar
    return {
      left: rect.left + (boxW - w) / 2,
      top: rect.top,
      width: w,
      height: boxH,
    }
  }

  if (fit === 'cover') {
    if (ar > boxAr) {
      const w = boxH * ar
      return {
        left: rect.left + (boxW - w) / 2,
        top: rect.top,
        width: w,
        height: boxH,
      }
    }
    const h = boxW / ar
    return {
      left: rect.left,
      top: rect.top + (boxH - h) / 2,
      width: boxW,
      height: h,
    }
  }

  // fill, none — video stretches to the element box
  return { left: rect.left, top: rect.top, width: boxW, height: boxH }
}

function toViewport(frameX, frameY, paintedRect, tabW, tabH) {
  return {
    x: paintedRect.left + (frameX / tabW) * paintedRect.width,
    y: paintedRect.top + (frameY / tabH) * paintedRect.height,
  }
}

/**
 * Ghost cursor driven by recorded cursorPositions while a Screen_Video step plays.
 *
 * `getVideoPaintedRect` / `toViewport` yield viewport (client) coordinates. CoreCursor
 * uses `position: fixed` inside WalkthroughComponent's `<Main>`, which has a CSS
 * `transform` (scaleMain). Transformed ancestors create the containing block for fixed
 * descendants, so cursor `translate(x,y)` is relative to Main's top-left — subtract
 * Main's getBoundingClientRect() so targets match the painted video.
 */
function VideoCursor({ cursorPositions, videoRef, mainRef, tabInfoWidth, tabInfoHeight, active }) {
  const sorted = useMemo(() => {
    if (!cursorPositions || !cursorPositions.length) return []
    return sortByTime(cursorPositions)
  }, [cursorPositions])

  const getFrame = useCallback(() => {
    const video = videoRef && videoRef.current
    const tabW = tabInfoWidth || 1366
    const tabH = tabInfoHeight || 664

    if (!video || video.readyState < 2 || sorted.length === 0) {
      return null
    }

    const paintedRect = getVideoPaintedRect(video)
    const absMs = absoluteMsForVideoTime(sorted, video)
    const raw = absMs != null ? interpolatePoint(sorted, absMs) : null
    if (!raw) {
      return null
    }

    let target = toViewport(raw.x, raw.y, paintedRect, tabW, tabH)
    const mainEl = mainRef && mainRef.current
    if (mainEl) {
      const mr = mainEl.getBoundingClientRect()
      target = {
        x: target.x - mr.left,
        y: target.y - mr.top,
      }
    }
    if (!video.paused) {
      return { target, mode: 'live' }
    }
    return { target, mode: 'frozen' }
  }, [videoRef, mainRef, tabInfoWidth, tabInfoHeight, sorted])

  if (!active || !cursorPositions || cursorPositions.length === 0) {
    return null
  }

  return (
    <CoreCursor zIndex={600} maxTiltDeg={4} getFrame={getFrame} resetKey={sorted} />
  )
}

export default VideoCursor
