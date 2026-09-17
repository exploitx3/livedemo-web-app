

import React from 'react'
import styled from 'styled-components'
import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
import Colors from '../../../../../../constants/mainColors'
import formatLibraryDate from '../../formatLibraryDate'


const VideosTab = ({videos, addScreen}) => {

  return (

    <VT.Wrapper>
      <VT.Main>
        {videos && videos.map((video) => {

          return (
            <VT.Item key={video._id} onClick={() => {
              addScreen(video._id)
            }}>
              <VT.ImageWrapper>
                <VT.Image src={`https://image.mux.com/${video.asset.playback_ids && video.asset.playback_ids[0].id}/thumbnail.png`}/>
              </VT.ImageWrapper>
              <VT.Date>{formatLibraryDate(video.createdAt, video._id)}</VT.Date>
            </VT.Item>
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
    
    grid-gap: 2.5rem 2.5rem;
    grid-template-columns: repeat(4, 1fr);
  `,
  Item: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    cursor: pointer;
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

  `,
  Date: styled.p`
    margin: 0;
    text-align: center;
    font-size: 12px;
    line-height: 1.3;
    color: var(--ld-text-muted, #6b7280);
    font-family: ${Colors.fontFamily};
  `
}

export default VideosTab
