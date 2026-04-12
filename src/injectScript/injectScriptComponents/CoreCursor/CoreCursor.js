import React, { useEffect, useId, useRef } from 'react'
import styled from 'styled-components'

const lerp = (a, b, t) => a + (b - a) * t

function normalizeAngleDeg(deg) {
  let d = deg % 360
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

export function CursorArrowSvg() {
  const filterId = `core-cursor-shadow-${useId().replace(/:/g, '')}`

  // Tight viewBox around the translated arrow (was 0 0 680 400 with translate(270,80), which left huge
  // empty padding; matching .cursor-stack aspect to this avoids letterboxing vs the box).
  return (
    <svg
      className="cursor-arrow-svg"
      viewBox="258 55 155 245"
      preserveAspectRatio="xMinYMin meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="8"
            floodColor="#000000"
            floodOpacity="0.45"
          />
        </filter>
      </defs>
      <g transform="translate(270, 80)" filter={`url(#${filterId})`}>
        <path
          d="M 8 0 L 8 180 L 48 138 L 82 210 L 104 200 L 70 128 L 126 128 Z"
          fill="white"
          stroke="white"
          strokeWidth="14"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M 8 0 L 8 180 L 48 138 L 82 210 L 104 200 L 70 128 L 126 128 Z"
          fill="black"
          stroke="black"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

/**
 * Shared ScreenStudio-style ghost cursor: trail, tilt, styling.
 *
 * @param {object} props
 * @param {number} [props.zIndex=600] — stack order (VideoCursor uses 600, DebugCursor 10050)
 * @param {number} [props.maxTiltDeg=18] — clamp for movement tilt
 * @param {() => null | { target: { x: number, y: number }, mode: 'live' | 'frozen' }} props.getFrame — called each animation frame. `null` = hidden / skip (reset trail). `frozen` = pin to target, ease tilt to 0, leader only (no ghost layers).
 * @param {unknown} [props.resetKey] — when this value changes (by `===`), trail + tilt state resets (e.g. `sorted` for video)
 */
function CoreCursor({ zIndex = 600, maxTiltDeg = 12, getFrame, resetKey }) {
  const rootRef = useRef(null)
  const leaderRef = useRef(null)
  const ghost0 = useRef(null)
  const ghost1 = useRef(null)
  const ghost2 = useRef(null)

  const leaderPos = useRef({ x: 0, y: 0 })
  const ghostPos = useRef([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }])
  const initialized = useRef(false)
  const lastTargetRef = useRef({ x: 0, y: 0 })
  const hasLastTargetRef = useRef(false)
  const tiltRef = useRef(0)

  const getFrameRef = useRef(getFrame)
  getFrameRef.current = getFrame

  const maxTiltDegRef = useRef(maxTiltDeg)
  maxTiltDegRef.current = maxTiltDeg

  useEffect(() => {
    initialized.current = false
    hasLastTargetRef.current = false
    tiltRef.current = 0
  }, [resetKey])

  useEffect(() => {
    let rafId = 0

    const F_LEADER = 0.88
    const F0 = 0.65
    const F1 = 0.55
    const F2 = 0.45
    /** Leader–target gap (px): above this shows ghost layers + trail “moving” styles (`ghosts-visible` / `is-moving`). */
    const LAG_THRESH_GHOST_TRAIL_PX = 0.65
   
    /** Leader–target gap (px): above this applies movement tilt; at/below eases tilt to 0. */
    const LAG_THRESH_TILT_PX = 0.35
    const DEFAULT_TIP_DEG = -135

    const TILT_LERP = 0.12
    const TILT_RETURN_LERP = 0.18
    
    const SPEED_EPS = 0.12

    function apply(el, x, y, rotDeg) {
      if (el) el.style.transform = `translate(${x}px, ${y}px) rotate(${rotDeg}deg)`
    }

    function tick() {
      const root = rootRef.current
      const frame = getFrameRef.current ? getFrameRef.current() : null

      if (frame == null) {
        if (root) {
          root.style.opacity = '0'
          root.classList.remove('ghosts-visible', 'is-moving')
        }
        tiltRef.current = lerp(tiltRef.current, 0, TILT_RETURN_LERP)
        if (Math.abs(tiltRef.current) < 0.08) tiltRef.current = 0
        initialized.current = false
        hasLastTargetRef.current = false
        rafId = requestAnimationFrame(tick)
        return
      }

      const { target, mode } = frame

      if (root) {
        root.style.opacity = '1'
      }

      if (mode === 'frozen') {
        leaderPos.current = { ...target }
        ghostPos.current = [{ ...target }, { ...target }, { ...target }]
        tiltRef.current = lerp(tiltRef.current, 0, TILT_RETURN_LERP)
        if (Math.abs(tiltRef.current) < 0.08) tiltRef.current = 0
        apply(leaderRef.current, target.x, target.y, tiltRef.current)
        apply(ghost0.current, target.x, target.y, tiltRef.current)
        apply(ghost1.current, target.x, target.y, tiltRef.current)
        apply(ghost2.current, target.x, target.y, tiltRef.current)
        lastTargetRef.current = { ...target }
        if (root) {
          root.classList.remove('ghosts-visible', 'is-moving')
        }
        initialized.current = true
        rafId = requestAnimationFrame(tick)
        return
      }

      if (!initialized.current) {
        leaderPos.current = { ...target }
        ghostPos.current = [{ ...target }, { ...target }, { ...target }]
        initialized.current = true
        lastTargetRef.current = { ...target }
        hasLastTargetRef.current = true
        tiltRef.current = 0
        apply(leaderRef.current, leaderPos.current.x, leaderPos.current.y, 0)
        apply(ghost0.current, target.x, target.y, 0)
        apply(ghost1.current, target.x, target.y, 0)
        apply(ghost2.current, target.x, target.y, 0)
        if (root) {
          root.classList.remove('ghosts-visible', 'is-moving')
        }
        rafId = requestAnimationFrame(tick)
        return
      }

      let dx = 0
      let dy = 0
      if (hasLastTargetRef.current) {
        dx = target.x - lastTargetRef.current.x
        dy = target.y - lastTargetRef.current.y
      }
      lastTargetRef.current = { x: target.x, y: target.y }
      hasLastTargetRef.current = true

      const stepSpeed = Math.hypot(dx, dy)

      leaderPos.current.x = lerp(leaderPos.current.x, target.x, F_LEADER)
      leaderPos.current.y = lerp(leaderPos.current.y, target.y, F_LEADER)

      ghostPos.current[0].x = lerp(ghostPos.current[0].x, leaderPos.current.x, F0)
      ghostPos.current[0].y = lerp(ghostPos.current[0].y, leaderPos.current.y, F0)
      ghostPos.current[1].x = lerp(ghostPos.current[1].x, ghostPos.current[0].x, F1)
      ghostPos.current[1].y = lerp(ghostPos.current[1].y, ghostPos.current[0].y, F1)
      ghostPos.current[2].x = lerp(ghostPos.current[2].x, ghostPos.current[1].x, F2)
      ghostPos.current[2].y = lerp(ghostPos.current[2].y, ghostPos.current[1].y, F2)

      const lag = Math.hypot(target.x - leaderPos.current.x, target.y - leaderPos.current.y)
      const isGhostTrailMoving = lag > LAG_THRESH_GHOST_TRAIL_PX
      const isTiltTracking = lag > LAG_THRESH_TILT_PX

      let desiredTilt = 0
      if (isTiltTracking && stepSpeed > SPEED_EPS) {
        const movementDeg = (Math.atan2(dy, dx) * 180) / Math.PI
        const delta = normalizeAngleDeg(movementDeg - DEFAULT_TIP_DEG)
        const cap = maxTiltDegRef.current
        desiredTilt = Math.max(-cap, Math.min(cap, delta * 0.28))
      }

      if (isTiltTracking) {
        tiltRef.current = lerp(tiltRef.current, desiredTilt, TILT_LERP)
      } else {
        tiltRef.current = lerp(tiltRef.current, 0, TILT_RETURN_LERP)
        if (Math.abs(tiltRef.current) < 0.08) tiltRef.current = 0
      }

      const rot = tiltRef.current
      apply(leaderRef.current, leaderPos.current.x, leaderPos.current.y, rot)
      apply(ghost0.current, ghostPos.current[0].x, ghostPos.current[0].y, rot)
      apply(ghost1.current, ghostPos.current[1].x, ghostPos.current[1].y, rot)
      apply(ghost2.current, ghostPos.current[2].x, ghostPos.current[2].y, rot)

      if (root) {
        root.classList.toggle('is-moving', isGhostTrailMoving)
        root.classList.toggle('ghosts-visible', isGhostTrailMoving)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <Root ref={rootRef} $zIndex={zIndex} aria-hidden="true">
      <div ref={ghost2} className="cursor-stack cursor-stack--ghost" data-i="2" style={{ '--i': 2 }}>
        <CursorArrowSvg />
      </div>
      <div ref={ghost1} className="cursor-stack cursor-stack--ghost" data-i="1" style={{ '--i': 1 }}>
        <CursorArrowSvg />
      </div>
      <div ref={ghost0} className="cursor-stack cursor-stack--ghost" data-i="0" style={{ '--i': 0 }}>
        <CursorArrowSvg />
      </div>
      <div ref={leaderRef} className="cursor-stack cursor-stack--leader">
        <CursorArrowSvg />
      </div>
    </Root>
  )
}

const Root = styled.div`
  --cursor-w: 40px;
  /* Match CursorArrowSvg viewBox width/height (155×245) so the SVG fills the stack without internal letterboxing */
  --cursor-h: calc(var(--cursor-w) * 245 / 155);
  /* Pointer tip at path local (8,0) → absolute (278,80); origin of viewBox (258,55) → offset (20,25) */
  --hotspot-x: calc(var(--cursor-w) * 20 / 155);
  --hotspot-y: calc(var(--cursor-h) * 25 / 245);
  --move-velocity-threshold: 1.5;
  --leader-blur-idle: 0px;
  --leader-blur-moving: 1.205px;
  --ghost-0-opacity-idle: 0.55;
  --ghost-0-blur-idle: 0.4px;
  --ghost-0-opacity-moving: 0.55;
  --ghost-0-blur-moving: 1.2px;
  --ghost-1-opacity-idle: 0.28;
  --ghost-1-blur-idle: 1.4px;
  --ghost-1-filter-opacity-idle: 0.9;
  --ghost-1-opacity-moving: 0.12;
  --ghost-1-blur-moving: 4px;
  --ghost-1-filter-opacity-moving: 0.55;
  --ghost-2-opacity-idle: 0.16;
  --ghost-2-blur-idle: 2.2px;
  --ghost-2-filter-opacity-idle: 0.75;
  --ghost-2-opacity-moving: 0.07;
  --ghost-2-blur-moving: 5.5px;
  --ghost-2-filter-opacity-moving: 0.4;
  --trail-transition-opacity: 0.35s;
  --trail-transition-filter: 0.45s;
  --trail-easing: ease;

  position: fixed;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  z-index: ${(p) => p.$zIndex};
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;

  .cursor-stack {
    position: fixed;
    left: 0;
    top: 0;
    width: var(--cursor-w);
    height: var(--cursor-h);
    pointer-events: none;
    margin-left: calc(-1 * var(--hotspot-x));
    margin-top: calc(-1 * var(--hotspot-y));
    transform-origin: var(--hotspot-x) var(--hotspot-y);
    will-change: transform, opacity, filter;
  }

  .cursor-arrow-svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .cursor-stack--leader {
    z-index: 500;
    opacity: 1;
    filter: blur(var(--leader-blur-idle));
    transition:
      opacity 0.15s ease,
      filter var(--trail-transition-filter) var(--trail-easing);
  }

  &.is-moving.ghosts-visible .cursor-stack--leader {
    filter: blur(var(--leader-blur-moving));
  }

  .cursor-stack--ghost {
    z-index: calc(400 - var(--i, 0));
    transition:
      opacity var(--trail-transition-opacity) var(--trail-easing),
      filter var(--trail-transition-filter) var(--trail-easing);
  }

  &:not(.ghosts-visible) .cursor-stack--ghost {
    opacity: 0 !important;
  }

  .cursor-stack--ghost[data-i='0'] {
    opacity: var(--ghost-0-opacity-idle);
    filter: blur(var(--ghost-0-blur-idle));
  }
  .cursor-stack--ghost[data-i='1'] {
    opacity: var(--ghost-1-opacity-idle);
    filter: blur(var(--ghost-1-blur-idle)) opacity(var(--ghost-1-filter-opacity-idle));
  }
  .cursor-stack--ghost[data-i='2'] {
    opacity: var(--ghost-2-opacity-idle);
    filter: blur(var(--ghost-2-blur-idle)) opacity(var(--ghost-2-filter-opacity-idle));
  }

  &.is-moving .cursor-stack--ghost[data-i='0'] {
    opacity: var(--ghost-0-opacity-moving);
    filter: blur(var(--ghost-0-blur-moving));
  }
  &.is-moving .cursor-stack--ghost[data-i='1'] {
    opacity: var(--ghost-1-opacity-moving);
    filter: blur(var(--ghost-1-blur-moving)) opacity(var(--ghost-1-filter-opacity-moving));
  }
  &.is-moving .cursor-stack--ghost[data-i='2'] {
    opacity: var(--ghost-2-opacity-moving);
    filter: blur(var(--ghost-2-blur-moving)) opacity(var(--ghost-2-filter-opacity-moving));
  }
`

export default CoreCursor
