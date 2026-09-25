// Talking face via Anam audio passthrough. Anam only renders + plays the
// ElevenLabs PCM we hand it — no Anam brain, voice, or microphone.
// https://anam.ai/docs/javascript-sdk/examples/custom-tts
const SAMPLE_RATE = 16000
const CHUNK_BYTES = 3200 // 100 ms of s16le mono @ 16 kHz

export function isPcmAudio(payload) {
  return !!payload && payload.encoding === 'pcm_s16le'
}

function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}

// Plain-browser fallback when there is no live avatar. Returns an object with
// pause() so AgentChatPanel's stopAudio() can stop it like an <audio>.
export function playPcm({ audioBase64, sampleRate }) {
  const bytes = base64ToBytes(audioBase64)
  const samples = new Int16Array(bytes.buffer, 0, bytes.byteLength >> 1)
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const buffer = ctx.createBuffer(1, samples.length, sampleRate || SAMPLE_RATE)
  const channel = buffer.getChannelData(0)
  for (let i = 0; i < samples.length; i++) channel[i] = samples[i] / 32768

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.onended = () => ctx.close().catch(() => {})
  source.start()

  return {
    pause() {
      try { source.stop() } catch { /* already ended */ }
      ctx.close().catch(() => {})
    },
  }
}

// mode 'passthrough': we pipe ElevenLabs PCM (pushPcm).
// mode 'talk': Anam's own voice speaks Gemini's text (say). Anam LLM stays off
// server-side (llmId CUSTOMER_CLIENT_V1), so talk() only reads our text aloud.
export function createAnamAvatar({ videoId, getSessionToken, mode = 'passthrough' }) {
  const talkMode = mode === 'talk'
  let client = null
  let stream = null
  let ready = false
  let failed = false
  let stopped = false
  let muted = false
  let fallback = null
  let mediaStream = null
  const queue = []

  function send(bytes) {
    for (let i = 0; i < bytes.length; i += CHUNK_BYTES) {
      stream.sendAudioChunk(bytes.subarray(i, i + CHUNK_BYTES))
    }
    stream.endSequence()
  }

  function playFallback(payload) {
    if (muted) return
    if (fallback) fallback.pause()
    fallback = playPcm(payload)
  }

  function talk(text) {
    client.talk(text).catch(err => console.log('anam talk failed', err))
  }

  // ponytail: Anam-voice with a failed session is text-only (no ElevenLabs
  // fallback). Upgrade: /tts?fallback=1 forcing ElevenLabs when voiceId is set.
  function flushQueue() {
    queue.splice(0).forEach((item) => {
      if (item.text) {
        if (ready) talk(item.text)
      } else if (ready) {
        send(item.bytes)
      } else {
        playFallback(item.payload)
      }
    })
  }

  async function start() {
    try {
      const [{ createClient, AnamEvent }, sessionToken] = await Promise.all([
        // eager: the player deploy ships one bundle file, no extra webpack chunks
        import(/* webpackMode: "eager" */ '@anam-ai/js-sdk'),
        getSessionToken(),
      ])
      if (stopped) return

      client = createClient(sessionToken, { disableInputAudio: true })

      // The SDK sets video.srcObject later, when the track arrives
      client.addListener(AnamEvent.VIDEO_PLAY_STARTED, () => {
        const video = document.getElementById(videoId)
        if (!video) return
        mediaStream = video.srcObject
        // Autoplay with sound can be refused without a gesture — keep the mouth
        // moving muted rather than showing a frozen frame.
        if (video.paused) {
          video.play().catch(() => {
            video.muted = true
            video.play().catch(() => {})
          })
        }
      })

      // streamToVideoElement resolves once connecting starts; talk() sent before
      // SESSION_READY is dropped by Anam (the welcome line went missing).
      const sessionReady = talkMode && new Promise((resolve, reject) => {
        client.addListener(AnamEvent.SESSION_READY, resolve)
        setTimeout(() => reject(new Error('Anam session not ready after 20s')), 20000)
      })
      await client.streamToVideoElement(videoId)
      if (sessionReady) await sessionReady
      if (stopped) {
        client.stopStreaming().catch(() => {})
        return
      }

      if (!talkMode) {
        stream = client.createAgentAudioInputStream({ encoding: 'pcm_s16le', sampleRate: SAMPLE_RATE, channels: 1 })
      }
      ready = true
      flushQueue()
    } catch (err) {
      console.log(talkMode ? 'anam avatar failed, text only' : 'anam avatar failed, falling back to plain audio', err)
      failed = true
      flushQueue()
    }
  }

  return {
    start,
    pushPcm(payload) {
      if (stopped || !payload?.audioBase64) return
      if (stream) send(base64ToBytes(payload.audioBase64))
      else if (failed) playFallback(payload)
      else queue.push({ payload, bytes: base64ToBytes(payload.audioBase64) })
    },
    say(text) {
      const spoken = String(text || '').trim()
      if (stopped || failed || !spoken) return
      if (ready) talk(spoken)
      else queue.push({ text: spoken })
    },
    interrupt() {
      queue.length = 0
      if (fallback) {
        fallback.pause()
        fallback = null
      }
      if (client && ready) client.interruptPersona()
      if (stream) stream.endSequence()
    },
    // New <video> with the same id (parent remounted it): hand it the live stream
    reattach(video) {
      if (!mediaStream || video.srcObject === mediaStream) return
      video.srcObject = mediaStream
      video.muted = muted
      video.play().catch(() => {
        video.muted = true
        video.play().catch(() => {})
      })
    },
    setMuted(value) {
      muted = !!value
      const video = document.getElementById(videoId)
      if (video) video.muted = muted
      if (muted && fallback) {
        fallback.pause()
        fallback = null
      }
    },
    stop() {
      stopped = true
      queue.length = 0
      if (fallback) fallback.pause()
      if (client) client.stopStreaming().catch(() => {})
    },
  }
}
