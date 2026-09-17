import React from 'react'
import styled from 'styled-components'

const PLACEMENT_OPTIONS = [
  { value: 'left', rotate: -90 },
  { value: 'top', rotate: 0 },
  { value: 'bottom', rotate: 180 },
  { value: 'right', rotate: 90 },
]

function getCardinalPlacement(placement) {
  if (typeof placement === 'string') {
    if (placement.startsWith('left')) return 'left'
    if (placement.startsWith('top')) return 'top'
    if (placement.startsWith('right')) return 'right'
    if (placement.startsWith('bottom')) return 'bottom'
  }
  return 'left'
}

function PlacementIcon({ rotate }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: 20, height: 20, flexShrink: 0, transform: `rotate(${rotate}deg)` }}>
      <path fill="currentColor" d="M3 7.629c0-1.62 0-2.43.327-3.05a2.95 2.95 0 0 1 1.311-1.264C5.28 3 6.12 3 7.8 3h8.4c1.68 0 2.52 0 3.162.315a2.95 2.95 0 0 1 1.311 1.265C21 5.198 21 6.008 21 7.629v5.496c0 1.348 0 2.022-.228 2.553a2.95 2.95 0 0 1-1.624 1.566c-.551.22-1.25.22-2.648.22-.489 0-.733 0-.96.052a2 2 0 0 0-.821.396c-.18.144-.326.332-.619.71l-1.46 1.877c-.217.279-.326.418-.459.468a.52.52 0 0 1-.362 0c-.133-.05-.242-.19-.459-.468L9.9 18.62c-.293-.377-.44-.565-.619-.709a2 2 0 0 0-.821.396c-.227-.052-.471-.052-.96-.052-1.398 0-2.097 0-2.648-.22a2.95 2.95 0 0 1-1.624-1.566C3 15.147 3 14.473 3 13.125z" opacity="0.08" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7.629c0-1.62 0-2.43.327-3.05a2.95 2.95 0 0 1 1.311-1.264C5.28 3 6.12 3 7.8 3h8.4c1.68 0 2.52 0 3.162.315a2.95 2.95 0 0 1 1.311 1.265C21 5.198 21 6.008 21 7.629v5.496c0 1.348 0 2.022-.228 2.553a2.95 2.95 0 0 1-1.624 1.566c-.551.22-1.25.22-2.648.22-.489 0-.733 0-.96.052a2 2 0 0 0-.821.396c-.18.144-.326.332-.619.71l-1.46 1.877c-.217.279-.326.418-.459.468a.52.52 0 0 1-.362 0c-.133-.05-.242-.19-.459-.468L9.9 18.62c-.293-.377-.44-.565-.619-.709a2 2 0 0 0-.821.396c-.227-.052-.471-.052-.96-.052-1.398 0-2.097 0-2.648-.22a2.95 2.95 0 0 1-1.624-1.566C3 15.147 3 14.473 3 13.125z" />
    </svg>
  )
}

export default function PlacementSelector({ value, onChange }) {
  let selected = getCardinalPlacement(value)
  let index = PLACEMENT_OPTIONS.findIndex((opt) => opt.value === selected)

  return (
    <Track>
      <Thumb $index={index} />
      {PLACEMENT_OPTIONS.map((opt) => {
        let isActive = selected === opt.value
        return (
          <Button
            type="button"
            key={opt.value}
            $active={isActive}
            aria-label={opt.value}
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
          >
            <PlacementIcon rotate={opt.rotate} />
          </Button>
        )
      })}
    </Track>
  )
}

const Track = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 4px;
  background: var(--ld-dot, #f3f4f6);
  border-radius: 12px;
  color: var(--ld-text, #111827);
`

const Thumb = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  height: 32px;
  width: calc((100% - 8px - 12px) / 4);
  background: var(--ld-surface, #fff);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  pointer-events: none;
  transition: transform 0.3s cubic-bezier(0.6, 0.6, 0, 1);
  transform: translateX(calc(${({ $index }) => $index} * (100% + 4px)));
`

const Button = styled.button`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: none;
  color: inherit;
  cursor: pointer;
  opacity: ${({ $active }) => ($active ? 1 : 0.7)};
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }
`
