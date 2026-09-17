

import React from 'react'
import styled from 'styled-components'
import Colors from '../../../../../../constants/mainColors'
import formatLibraryDate from '../../formatLibraryDate'


const ImagesTab = ({images, addScreen}) => {

  return (

    <IT.Wrapper>
      <IT.Main>
        {images && images.map((image) => {

          return (
            <IT.Item key={image._id} onClick={() => {
              addScreen(image._id)
            }}>
              <IT.ImageWrapper>
                <IT.Image src={image.imageUrl}/>
              </IT.ImageWrapper>
              <IT.Date>{formatLibraryDate(image.createdAt, image._id)}</IT.Date>
            </IT.Item>
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

export default ImagesTab
