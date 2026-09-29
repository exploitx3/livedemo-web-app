import { base64ToBytes, playPcm } from './anamAvatar'

// Talking face via LemonSlice in a LiveKit room. Same interface as
// createAnamAvatar (passthrough): we stream the ElevenLabs PCM to the avatar
// participant, it publishes lip-synced audio + video that we play in <video>.
// Protocol = LiveKit agents DataStreamAudioOutput (@livekit/agents voice/avatar).
const AUDIO_TOPIC = 'lk.audio_stream'
const RPC_CLEAR_BUFFER = 'lk.clear_buffer'
const RPC_PLAYBACK_STARTED = 'lk.playback_started'
const RPC_PLAYBACK_FINISHED = 'lk.playback_finished'
const READY_TIMEOUT_MS = 30000
const SAMPLE_RATE = 16000

export function createLemonSliceAvatar({ videoId, getSession, onFailed }) {
  let room = null
  let avatarIdentity = ''
  let ready = false
  let failed = false
  let stopped = false
  let muted = false
  let fallback = null
  let sending = Promise.resolve()
  const mediaStream = new MediaStream()
  const queue = []

  function playVideo(video) {
    if (video.srcObject !== mediaStream) video.srcObject = mediaStream
    video.muted = muted
    // Autoplay with sound can be refused without a gesture: keep the mouth moving muted
    video.play().catch(() => {
      video.muted = true
      video.play().catch(() => {})
    })
  }

  // One byte stream per reply chunk; closing it tells LemonSlice the audio ended.
  // Chained so two replies never interleave.
  function send(payload) {
    const bytes = base64ToBytes(payload.audioBase64)
    sending = sending.then(async () => {
      if (stopped) return
      const writer = await room.localParticipant.streamBytes({
        name: `AUDIO_${Date.now()}`,
        topic: AUDIO_TOPIC,
        destinationIdentities: [avatarIdentity],
        attributes: { sample_rate: String(payload.sampleRate || SAMPLE_RATE), num_channels: '1' },
      })
      await writer.write(bytes)
      await writer.close()
    }).catch(err => console.log('lemonslice audio send failed', err))
  }

  function playFallback(payload) {
    if (muted) return
    if (fallback) fallback.pause()
    fallback = playPcm(payload)
  }

  function flushQueue() {
    queue.splice(0).forEach(payload => (ready ? send(payload) : playFallback(payload)))
  }

  function fail(err) {
    if (failed) return
    console.log('lemonslice avatar failed, falling back to plain audio', err)
    failed = true
    ready = false
    if (room) room.disconnect()
    flushQueue()
    if (!stopped && onFailed) onFailed(err)
  }

  async function start() {
    try {
      const [{ Room, RoomEvent, Track }, session] = await Promise.all([
        // eager: the player deploy ships one bundle file, no extra webpack chunks
        import(/* webpackMode: "eager" */ 'livekit-client'),
        getSession(),
      ])
      if (stopped) return
      avatarIdentity = session.avatarIdentity

      room = new Room()
      // The avatar reports playback state; an unregistered method makes its RPC error out
      room.registerRpcMethod(RPC_PLAYBACK_STARTED, async () => '')
      room.registerRpcMethod(RPC_PLAYBACK_FINISHED, async () => '')

      const videoReady = new Promise((resolve, reject) => {
        room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
          if (participant.identity !== avatarIdentity) return
          mediaStream.addTrack(track.mediaStreamTrack)
          const video = document.getElementById(videoId)
          if (video) playVideo(video)
          if (track.kind === Track.Kind.Video) resolve()
        })
        setTimeout(() => reject(new Error('LemonSlice avatar not ready after 30s')), READY_TIMEOUT_MS)
      })
      // Avatar gone (LemonSlice idle timeout, crash) = frozen frame: drop to plain audio
      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        if (participant.identity === avatarIdentity) fail(new Error('LemonSlice avatar left the room'))
      })
      room.on(RoomEvent.Disconnected, () => {
        if (!stopped) fail(new Error('LiveKit room disconnected'))
      })

      await room.connect(session.livekitUrl, session.token)
      await videoReady
      if (stopped || failed) return

      ready = true
      flushQueue()
    } catch (err) {
      fail(err)
    }
  }

  return {
    start,
    pushPcm(payload) {
      if (stopped || !payload?.audioBase64) return
      if (ready) send(payload)
      else if (failed) playFallback(payload)
      else queue.push(payload)
    },
    // Anam-voice only; LemonSlice always speaks the ElevenLabs PCM
    say() {},
    interrupt() {
      queue.length = 0
      if (fallback) {
        fallback.pause()
        fallback = null
      }
      if (ready) {
        room.localParticipant.performRpc({ destinationIdentity: avatarIdentity, method: RPC_CLEAR_BUFFER, payload: '' })
          .catch(err => console.log('lemonslice clear_buffer failed', err))
      }
    },
    // New <video> with the same id (parent remounted it): hand it the live stream
    reattach(video) {
      if (!mediaStream.getTracks().length || video.srcObject === mediaStream) return
      playVideo(video)
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
      if (room) room.disconnect()
    },
  }
}
