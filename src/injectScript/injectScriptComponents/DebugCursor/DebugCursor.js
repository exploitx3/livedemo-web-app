import React, { useCallback, useEffect, useRef } from 'react'
import CoreCursor from '../CoreCursor/CoreCursor.js'

/**
 * Same look / trail / tilt as VideoCursor, but follows the real pointer (debug).
 */
function DebugCursor() {
  const pointerInsideRef = useRef(false)
  const targetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    function onMove(e) {
      targetRef.current = { x: e.clientX, y: e.clientY }
      pointerInsideRef.current = true
    }
    function onLeave() {
      pointerInsideRef.current = false
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const getFrame = useCallback(() => {
    if (!pointerInsideRef.current) {
      return null
    }
    return { target: { ...targetRef.current }, mode: 'live' }
  }, [])

  return <CoreCursor zIndex={10050} getFrame={getFrame} />
}

export default DebugCursor
