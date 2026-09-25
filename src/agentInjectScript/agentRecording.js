import axios from 'axios'
import { record as rrwebRecord } from 'rrweb'
import { createSessionRecordingFlattenEmit } from '../injectScript/sessionRecordingFlatten.js'

const FLUSH_MS = 3500
const MAX_BUFFER = 1000

// rrweb of the whole agent page: chat, avatar, and the demo iframe (same origin
// as the player page, so rrweb reads into it; the demo itself does not record
// when loaded with inAgent=true). Same options/flatten as setupSessionRecording.
// ponytail: the SPA preview tab is a different origin than the demo iframe, so
// the demo area replays blank there. Upgrade: rrweb recordCrossOriginIframes.
export function startAgentRecording(url, headers = {}) {
  let events = []
  let stopRecord = null

  function flush() {
    if (!events.length) return
    const batch = events
    events = []
    axios.post(url, { events: batch }, { headers })
      .catch(err => console.log('agent recording upload failed', err))
  }

  // Tab close: axios requests get cancelled; keepalive fetch survives (64 KB cap)
  function flushOnHide() {
    if (!events.length) return
    const body = JSON.stringify({ events })
    events = []
    fetch(url, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', ...headers }, body })
      .catch(() => {})
  }

  stopRecord = rrwebRecord({
    emit: createSessionRecordingFlattenEmit((event) => {
      // ponytail: same cap as demo recordings — stop instead of dropping events
      // (a gap corrupts replay). Upgrade: flush early when the buffer fills.
      if (events.length > MAX_BUFFER && stopRecord) stopRecord()
      events.push(event)
    }),
    sampling: { mousemove: 150, mouseInteraction: true, scroll: 100, input: 'last' },
    inlineStylesheet: true,
  })

  // rrweb can't serialize a MediaStream (the Anam avatar), so its <video> replays
  // empty. Mirror frames into `poster` — an attribute rrweb does record.
  // ponytail: 2 fps small JPEGs (~10 KB/frame). Upgrade: rrweb canvas recording.
  const canvas = document.createElement('canvas')
  const posterTimer = setInterval(() => {
    document.querySelectorAll('video').forEach(video => {
      if (!video.srcObject || !video.videoWidth || video.paused) return
      canvas.width = 240
      canvas.height = Math.round(240 * video.videoHeight / video.videoWidth)
      try {
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
        video.poster = canvas.toDataURL('image/jpeg', 0.6)
      } catch (e) { /* tainted canvas: leave the poster as is */ }
    })
  }, 500)

  const timer = setInterval(flush, FLUSH_MS)
  window.addEventListener('pagehide', flushOnHide)

  return () => {
    clearInterval(posterTimer)
    clearInterval(timer)
    window.removeEventListener('pagehide', flushOnHide)
    if (stopRecord) stopRecord()
    flush()
  }
}
