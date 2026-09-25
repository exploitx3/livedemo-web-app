import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import 'rrweb-player/dist/style.css'

import rrwebPlayer from 'rrweb-player'

import axios from 'axios'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { authWithToken } from '../../../../actions/authActions'
import * as workspacesActions from '../../../../actions/workspacesActions'
import * as walkthroughActions from '../../../../actions/walkthroughActions'
import mainColors from '../../../../constants/mainColors'

import Spinner from '../../../../components/Spinner/Spinner'

import ENV from '../../../../config'
import { flattenSessionEvents } from '../../../../injectScript/sessionRecordingFlatten.js'


// eventsUrl: agent sessions load from .../agents/:id/sessions/:id/recording
const ViewSession = function ({ session, storyId, workspaceId, sessionId, sessionIndex, eventsUrl, authData }) {
  let playerRef = useRef(null)
  let playerInstanceRef = useRef(null)
  let [playerEvents, setPlayerEvents] = useState([])
  let [isLoading, setIsLoading] = useState(true)


  function getPlayerEvents(workspaceId, storyId, sessionId, authToken) {
    return axios.get(eventsUrl || `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyId}/sessions/${sessionId}/events`, {
        headers: {
          Authorization: 'Bearer ' + authToken
        }
      })
      .then((res) => {

        return res.data
      })
  }

  useEffect(() => {
    if (!playerRef.current || !playerEvents.length) {
      return
    }

    // Destroy previous player when events change / remount
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.pause()
        playerInstanceRef.current.$destroy?.()
      } catch (e) {
        // ignore cleanup errors from stale player instances
      }
      playerInstanceRef.current = null
      playerRef.current.innerHTML = ''
    }

    const replayPlugin = {
      handler: (event, isSync, context) => {
        if (event.data && event.data.attributes && event.data.attributes.length) {
          event.data.attributes.forEach((atr) => {
            if (atr.attributes && atr.attributes.src && atr.attributes['data-video-mp4']) {
              atr.attributes.src = atr.attributes['data-video-mp4']
              let video = context.replayer.iframe.contentWindow.document.getElementById('story_video')
              if (video) {
                video.src = atr.attributes['data-video-mp4']
              }

              let source = context.replayer.iframe.contentWindow.document.querySelector('#story_video > source')
              if (source) {
                source.src = atr.attributes['data-video-mp4']
              }
            }
          })
        }

        if (event.data && event.data.tag === 'play-video') {
          let source = context.replayer.iframe.contentWindow.document.querySelector('#story_video > source')
          let video = context.replayer.iframe.contentWindow.document.getElementById('story_video')

          if (video) {
            video.src = event.data.payload.streamUrlMp4
            video.preload = false
          }

          if (source) {
            source.src = event.data.payload.streamUrlMp4
          }
        }
      }
    }

    // Mount after the container is visible so rrweb-player can measure size.
    let player
    const raf = requestAnimationFrame(() => {
      if (!playerRef.current) {
        return
      }
      player = new rrwebPlayer({
        target: playerRef.current,
        props: {
          events: playerEvents,
          plugins: [replayPlugin],
          mouseTail: {
            strokeStyle: mainColors.primaryColor
          },
          skipInactive: true,
          autoPlay: true,
          // Keep flattened demo hosts visible in Analytics replay.
          insertStyleRules: [
            '#story_rrweb_root, #story_rrweb_root.hidden { visibility: visible !important; }',
            '#story_rrweb_root .livedemo-flat-doc, [data-livedemo-flat-iframe] { visibility: visible !important; opacity: 1 !important; }',
            '#story_iframe.hidden { visibility: hidden !important; }',
            // Script-less replay iframe forces native controls over the avatar poster
            'video::-webkit-media-controls { display: none !important; }',
          ],
        }
      })
      playerInstanceRef.current = player
    })

    return () => {
      cancelAnimationFrame(raf)
      try {
        player?.pause()
        player?.$destroy?.()
      } catch (e) {
        // ignore
      }
      if (playerInstanceRef.current === player) {
        playerInstanceRef.current = null
      }
      if (playerRef.current) {
        playerRef.current.innerHTML = ''
      }
    }
  }, [playerEvents])

  useEffect(() => {
    getPlayerEvents(workspaceId, storyId, sessionId, authData.token)
      .then((events) => {
        if (!Array.isArray(events) || events.length < 2) {
          console.warn('[ViewSession] session has insufficient rrweb events', {
            sessionId,
            count: Array.isArray(events) ? events.length : 0,
          })
          setPlayerEvents([])
          setIsLoading(false)
          return
        }
        // Playback-time flatten: converts nested demo iframe + isAttachIframe
        // Document attaches into div trees so existing sessions replay too.
        setPlayerEvents(flattenSessionEvents(events))
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('[ViewSession] failed to load session events', err)
        setIsLoading(false)
      })
  }, [])

  return (
    <React.Fragment>
      {isLoading ? (<Spinner/>) : ('')}
      <S.SessionPlayer id={`session-player-${sessionId}-${sessionIndex}`}
           ref={playerRef}
           style={{ visibility: isLoading ? 'hidden' : 'visible' }}
      ></S.SessionPlayer>
    </React.Fragment>
  )
}

const S = {
  SessionPlayer: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    /* rrweb-player ships a fixed light skin; every fallback below is its own
       default value, so light mode is untouched. &&& outranks its 3-class
       svelte selectors regardless of stylesheet order. */
    &&& .rr-player,
    &&& .rr-controller {
      background: ${mainColors.surfaceColor};
    }

    &&& .rr-timeline__time,
    &&& .switch .label {
      color: var(--ld-text, #11103e);
    }

    &&& .rr-progress {
      background: var(--ld-background, #eee);
      border-top-color: ${mainColors.surfaceColor};
      border-bottom-color: ${mainColors.surfaceColor};
    }

    &&& .rr-progress__step,
    &&& .rr-controller__btns button:active {
      background: var(--ld-border, #e0e1fe);
    }

    /* The inactive-period marker is inline-styled by the player. */
    &&& .rr-progress > div[title='inactive period'] {
      background: var(--ld-border, rgb(212, 212, 212)) !important;
    }

    &&& .rr-controller__btns button:not(.active) {
      color: var(--ld-text, inherit);
    }

    &&& .rr-controller__btns button svg {
      fill: currentColor;
    }
  `
}

function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData
  }
}

function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({
      authWithToken: authWithToken,
      updateAllWorkspacesForUser: workspacesActions.updateAllWorkspacesForUser,
      runWalkthrough: walkthroughActions.runWalkthrough
    }, dispatch)

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewSession)
