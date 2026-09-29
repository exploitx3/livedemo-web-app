import { useEffect, useMemo, useState } from 'react'

const POLL_MS = 100
const GIVE_UP_MS = 1500

/**
 * AI-edited pages can move the clicked element, so a hotspot with an rrwebNodeId
 * sits on that node's centre in the replayer; otherwise (or if the node never
 * shows up) it keeps its recorded frameX/frameY.
 * ponytail: one lookup after the screen renders; no tracking of later layout changes.
 */
export default function useAnchoredHotspot(view) {
  const nodeId = view && view.hotspot ? view.hotspot.rrwebNodeId : null
  const [anchor, setAnchor] = useState(null)

  useEffect(() => {
    setAnchor(null)
    if (nodeId == null) {
      return undefined
    }
    const startedAt = Date.now()
    const timer = setInterval(() => {
      const replayer = window.__livedemoActiveReplayer
      const node = replayer && replayer.getMirror ? replayer.getMirror().getNode(nodeId) : null
      const rect = node && node.getBoundingClientRect ? node.getBoundingClientRect() : null
      if (rect && (rect.width || rect.height)) {
        setAnchor({ frameX: Math.round(rect.left + rect.width / 2), frameY: Math.round(rect.top + rect.height / 2) })
        clearInterval(timer)
      } else if (Date.now() - startedAt > GIVE_UP_MS) {
        clearInterval(timer)
      }
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [nodeId])

  return useMemo(() => (anchor && view && view.hotspot
    ? { ...view, hotspot: { ...view.hotspot, ...anchor } }
    : view), [view, anchor])
}
