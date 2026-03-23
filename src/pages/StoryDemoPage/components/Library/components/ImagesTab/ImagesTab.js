

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'


const ImagesTab = ({images, addScreen}) => {

  return (

    <IT.Wrapper>
      <IT.Main>
        {images && images.map((image) => {

          return (
            <IT.ImageWrapper onClick={() => {
              addScreen(image._id)
            }}>
              <IT.Image src={image.imageUrl}/>
            </IT.ImageWrapper>
          )
        })}
      </IT.Main>
    </IT.Wrapper>
  )
}

const IT = {
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

export default ImagesTab
