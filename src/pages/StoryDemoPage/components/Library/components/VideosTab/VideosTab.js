

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
import Colors from '../../../../../../constants/mainColors'


const VideosTab = ({videos, addScreen}) => {

  return (

    <VT.Wrapper>
      <VT.Main>
        {videos && videos.map((video) => {

          return (
            <VT.ImageWrapper onClick={() => {
              addScreen(video._id)
            }}>
              <VT.Image src={`https://image.mux.com/${video.asset.playback_ids && video.asset.playback_ids[0].id}/thumbnail.png`}/>
            </VT.ImageWrapper>
          )
        })}
      </VT.Main>
    </VT.Wrapper>
  )
}

const VT = {
  Wrapper: styled.div`

  `,
  Main: styled.main`
    display: grid;
    
    grid-gap: 2.5rem;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: 150px;
  `,
  ImageWrapper: styled.figure`
    border: 7px solid #fff;
    border-radius: 16px;
    box-sizing: border-box;
    width: 100%;
    height: 150px;
    margin: 0;
        
    &&:hover {
        border-color: #e5e7eb;
        cursor: pointer;

    }
  `,
  Image: styled.img`
    width: 100%;
    height: 100%;
    border-radius: 8px;

  `
}

export default VideosTab
