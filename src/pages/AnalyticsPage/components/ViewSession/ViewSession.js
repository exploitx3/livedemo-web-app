import React, { useEffect, useRef, useState } from 'react'
import Layout from 'antd/es/layout'
import Modal from 'antd/es/modal'
import Select from 'antd/es/select'
import styled from 'styled-components'

import 'antd/es/layout/style'
import 'antd/es/modal/style'
import 'antd/es/select/style'
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


const ViewSession = function ({ session, storyId, workspaceId, sessionId, sessionIndex, authData }) {
  let playerRef = useRef(null)
  let [playerEvents, setPlayerEvents] = useState([])
  let [isLoading, setIsLoading] = useState(true)


  function getPlayerEvents(workspaceId, storyId, sessionId, authToken) {
    return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyId}/sessions/${sessionId}/events`, {
        headers: {
          Authorization: 'Bearer ' + authToken
        }
      })
      .then((res) => {

        return res.data
      })
  }

  useEffect(() => {

    if (playerRef.current && playerEvents.length) {


      const replayPlugin = {
        handler: (event, isSync, context) => {

          /*
           "attributes": {
            "src": "blob:http://localhost.mine:3005/e63ae7ab-1b3e-494d-8afd-79b202a49d6f",
            "data-video-mp4":
           */
          if (event.data && event.data.attributes && event.data.attributes.length) {

            event.data.attributes.forEach((atr) => {
              if (atr.attributes && atr.attributes.src && atr.attributes['data-video-mp4']) {

                atr.attributes.src = atr.attributes['data-video-mp4']
                let video = context.replayer.iframe.contentWindow.document.getElementById('story_video')
                video.src = atr.attributes['data-video-mp4']

                let source = context.replayer.iframe.contentWindow.document.querySelector('#story_video > source')
                source.src = atr.attributes['data-video-mp4']

                return atr
              }
            })

          }


          if (event.data && event.data.tag === 'play-video') {
            // do something with event.data.payload
            console.log(event)
            let source = context.replayer.iframe.contentWindow.document.querySelector('#story_video > source')
            let video = context.replayer.iframe.contentWindow.document.getElementById('story_video')

            video.src = event.data.payload.streamUrlMp4
            video.preload = false

            source.src = event.data.payload.streamUrlMp4

            // video.load()
            // video.play()

          }
        }
      }

      // const replayer = new rrweb.Replayer(playerEvents, {
      //   plugins: [
      //     replayPlugin
      //   ],
      // });
      // replayer.play();


      let player = new rrwebPlayer({
        target: playerRef.current, // customizable root element
        props: {
          events: playerEvents

        },
        plugins: [replayPlugin]
      })

      let replayer = player.getReplayer()
      replayer.setConfig({
        plugins: [replayPlugin],
        mouseTail: {
          strokeStyle: mainColors.primaryColor
        }
      })

      console.log(replayer)
    }


  }, [playerRef, playerEvents])

  useEffect(() => {
    getPlayerEvents(workspaceId, storyId, sessionId, authData.token)
      .then((events) => {
        let mappedEvents = events.map(e => e)
        setPlayerEvents(mappedEvents)

        setIsLoading(false)
      })
  }, [])

  return (
    <React.Fragment>
      {isLoading ? (<Spinner/>) : ('')}
      <S.SessionPlayer id={`session-player-${sessionId}-${sessionIndex}`}
           ref={playerRef}
           style={{ display: isLoading ? 'hidden' : 'flex' }}
      ></S.SessionPlayer>
    </React.Fragment>
  )
}

const S = {
  SessionPlayer: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
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
