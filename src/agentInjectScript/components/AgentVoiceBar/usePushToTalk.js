import { useCallback, useEffect, useRef, useState } from 'react'

const TARGET_RATE = 16000
const MIN_SECONDS = 0.1
const SETTLE_MS = 1000
const FLUSH_COMMIT_MS = 100
const SILENCE_GAIN = 0

function downsample(float32, inputRate) {
  if (inputRate === TARGET_RATE) return float32
  const ratio = inputRate / TARGET_RATE
  const outLen = Math.floor(float32.length / ratio)
  if (outLen < 1) return new Float32Array(0)
  const out = new Float32Array(outLen)
  for (let i = 0; i < outLen; i++) out[i] = float32[Math.floor(i * ratio)] || 0
  return out
}

function pcm16Base64(float32) {
  const pcm = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function audioChunk(base64, commit = false) {
  return JSON.stringify({
    message_type: 'input_audio_chunk',
    audio_base_64: base64,
    commit,
    sample_rate: TARGET_RATE,
  })
}

function eventText(data) {
  return String(data?.text || data?.transcript || '').trim()
}

function joinedText(committed, partial) {
  const parts = [...committed]
  if (partial && partial !== parts[parts.length - 1]) parts.push(partial)
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

// Hold-to-talk: mic PCM → Scribe v2 Realtime (VAD) → transcript on release.
export default function usePushToTalk({ getSession, disabled, onTranscript, onPartial, onTalkStart, onTalkEnd }) {
  const [listening, setListening] = useState(false)
  const heldRef = useRef(false)
  const startingRef = useRef(false)
  const streamRef = useRef(null)
  const ctxRef = useRef(null)
  const processorRef = useRef(null)
  const sourceRef = useRef(null)
  const muteRef = useRef(null)
  const wsRef = useRef(null)
  const readyRef = useRef(false)
  const pendingRef = useRef([])
  const samplesRef = useRef(0)
  const committedRef = useRef([])
  const partialRef = useRef('')
  const settleRef = useRef(null)
  const flushRef = useRef(null)
  const prefetchRef = useRef(null)
  const onTranscriptRef = useRef(onTranscript)
  const onPartialRef = useRef(onPartial)
  const onTalkStartRef = useRef(onTalkStart)
  const onTalkEndRef = useRef(onTalkEnd)
  const getSessionRef = useRef(getSession)
  onTranscriptRef.current = onTranscript
  onPartialRef.current = onPartial
  onTalkStartRef.current = onTalkStart
  onTalkEndRef.current = onTalkEnd
  getSessionRef.current = getSession

  const stopMic = useCallback(() => {
    try { processorRef.current?.disconnect() } catch { /* already gone */ }
    try { sourceRef.current?.disconnect() } catch { /* already gone */ }
    try { muteRef.current?.disconnect() } catch { /* already gone */ }
    processorRef.current = null
    sourceRef.current = null
    muteRef.current = null
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {})
      ctxRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const closeWs = useCallback(() => {
    readyRef.current = false
    pendingRef.current = []
    const ws = wsRef.current
    wsRef.current = null
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      try { ws.close() } catch { /* already closed */ }
    }
  }, [])

  const currentText = useCallback(() => joinedText(committedRef.current, partialRef.current), [])

  const finish = useCallback((err) => {
    if (settleRef.current) {
      clearTimeout(settleRef.current)
      settleRef.current = null
    }
    if (flushRef.current) {
      clearTimeout(flushRef.current)
      flushRef.current = null
    }
    const text = currentText()
    closeWs()
    stopMic()
    setListening(false)
    onTalkEndRef.current && onTalkEndRef.current()
    onTranscriptRef.current && onTranscriptRef.current(text || null, text ? null : err)
  }, [closeWs, currentText, stopMic])

  const sendOrQueue = useCallback((base64) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN && readyRef.current) {
      ws.send(audioChunk(base64))
      return
    }
    pendingRef.current.push(base64)
  }, [])

  const flushPending = useCallback(() => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN || !readyRef.current) return
    pendingRef.current.forEach(chunk => ws.send(audioChunk(chunk)))
    pendingRef.current = []
  }, [])

  const stop = useCallback(() => {
    heldRef.current = false
    stopMic()

    const ws = wsRef.current
    if (!ws || (samplesRef.current < TARGET_RATE * MIN_SECONDS && !currentText())) {
      closeWs()
      setListening(false)
      onTalkEndRef.current && onTalkEndRef.current()
      if (startingRef.current) return
      onTranscriptRef.current && onTranscriptRef.current(null, new Error('Hold the button a bit longer'))
      return
    }

    // Stopping the mic looks like silence → VAD commits. Manual commit is a flush.
    if (settleRef.current) clearTimeout(settleRef.current)
    settleRef.current = setTimeout(() => finish(new Error('Did not catch that — try again')), SETTLE_MS)

    if (flushRef.current) clearTimeout(flushRef.current)
    flushRef.current = setTimeout(() => {
      const live = wsRef.current
      if (live && live.readyState === WebSocket.OPEN) live.send(audioChunk('', true))
    }, FLUSH_COMMIT_MS)
  }, [closeWs, currentText, finish, stopMic])

  const start = useCallback(async () => {
    if (disabled || heldRef.current || startingRef.current || wsRef.current) return

    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx || !navigator.mediaDevices?.getUserMedia) {
      onTranscriptRef.current && onTranscriptRef.current(null, new Error('Recording not supported in this browser'))
      return
    }

    heldRef.current = true
    startingRef.current = true
    onTalkStartRef.current && onTalkStartRef.current()
    readyRef.current = false
    pendingRef.current = []
    samplesRef.current = 0
    committedRef.current = []
    partialRef.current = ''

    let ctx
    try {
      ctx = new Ctx({ sampleRate: TARGET_RATE })
    } catch {
      ctx = new Ctx()
    }
    ctxRef.current = ctx
    const streamPromise = navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    })
    const sessionPromise = prefetchRef.current
      ? prefetchRef.current.then(s => s || getSessionRef.current())
      : getSessionRef.current()
    prefetchRef.current = null

    try {
      if (ctx.state === 'suspended') await ctx.resume()
      const [stream, session] = await Promise.all([streamPromise, sessionPromise])

      if (!heldRef.current) {
        stream.getTracks().forEach(track => track.stop())
        ctx.close().catch(() => {})
        ctxRef.current = null
        onTalkEndRef.current && onTalkEndRef.current()
        return
      }

      if (!session?.url) throw new Error('Voice session failed')

      streamRef.current = stream
      const ws = new WebSocket(session.url)
      wsRef.current = ws

      ws.onmessage = (event) => {
        let data
        try { data = JSON.parse(event.data) } catch { return }
        const type = data.message_type
        const text = eventText(data)

        if (type === 'session_started') {
          readyRef.current = true
          flushPending()
          if (!heldRef.current) ws.send(audioChunk('', true))
          return
        }
        if (type === 'partial_transcript') {
          if (text) partialRef.current = text
          onPartialRef.current && onPartialRef.current(text)
          return
        }
        if (type === 'final_transcript' || type === 'final_transcript_with_timestamps') {
          if (text) partialRef.current = text
          return
        }
        if (type === 'committed_transcript' || type === 'committed_transcript_with_timestamps') {
          if (text) {
            committedRef.current.push(text)
            partialRef.current = ''
          }
          if (!heldRef.current && currentText()) finish()
          return
        }
        if (type === 'insufficient_audio_activity') {
          if (currentText()) finish()
          else finish(new Error('Hold the button a bit longer'))
          return
        }
        if (type && (type.endsWith('_error') || type === 'error' || type === 'invalid_request')) {
          finish(new Error(data.error || 'Voice input failed'))
        }
      }
      ws.onerror = () => {
        if (heldRef.current || settleRef.current) finish(new Error('Voice connection failed'))
      }
      ws.onclose = () => {
        if (wsRef.current !== ws) return
        wsRef.current = null
        if (heldRef.current || settleRef.current) {
          finish(currentText() ? null : new Error('Did not catch that — try again'))
        }
      }

      const source = ctx.createMediaStreamSource(stream)
      sourceRef.current = source
      // ponytail: ScriptProcessor is the ceiling; AudioWorklet if we need long clips / lower CPU
      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor
      processor.onaudioprocess = (event) => {
        if (!heldRef.current) return
        const inputRate = event.inputBuffer.sampleRate || ctx.sampleRate || TARGET_RATE
        const down = downsample(new Float32Array(event.inputBuffer.getChannelData(0)), inputRate)
        if (!down.length) return
        samplesRef.current += down.length
        sendOrQueue(pcm16Base64(down))
      }

      const mute = ctx.createGain()
      mute.gain.value = SILENCE_GAIN
      muteRef.current = mute
      source.connect(processor)
      processor.connect(mute)
      mute.connect(ctx.destination)

      setListening(true)
    } catch (err) {
      closeWs()
      stopMic()
      heldRef.current = false
      setListening(false)
      onTalkEndRef.current && onTalkEndRef.current()
      onTranscriptRef.current && onTranscriptRef.current(null, err)
    } finally {
      startingRef.current = false
      if (getSessionRef.current) {
        prefetchRef.current = getSessionRef.current().catch(() => null)
      }
    }
  }, [closeWs, currentText, disabled, finish, flushPending, sendOrQueue, stopMic])

  useEffect(() => {
    if (disabled || !getSession) {
      prefetchRef.current = null
      return
    }
    prefetchRef.current = getSession().catch(() => null)
  }, [disabled, getSession])

  useEffect(() => () => {
    heldRef.current = false
    if (settleRef.current) clearTimeout(settleRef.current)
    if (flushRef.current) clearTimeout(flushRef.current)
    closeWs()
    stopMic()
    onTalkEndRef.current && onTalkEndRef.current()
  }, [closeWs, stopMic])

  return { listening, start, stop }
}
