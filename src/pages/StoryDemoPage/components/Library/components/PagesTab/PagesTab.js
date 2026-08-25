

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
import Colors from '../../../../../../constants/mainColors'


const PagesTab = ({pages, addScreen}) => {



  return (
    <PT.Wrapper>
      <PT.Main>
        {pages && pages.map((page) => {

          return (
            <PT.ImageWrapper
              key={page._id}
              onClick={() => {
              addScreen(page)
            }}>
              <PT.Image src={page.imageUrl}/>
              {page.recordingRole ? (
                <PT.RoleBadge $role={page.recordingRole}>
                  {page.recordingRole === 'base' ? 'Base' : 'Delta'}
                </PT.RoleBadge>
              ) : null}
            </PT.ImageWrapper>
          )
        })}
      </PT.Main>
    </PT.Wrapper>
  )
}

const PT = {
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
    position: relative;
        
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
  RoleBadge: styled.span`
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    font-family: ${Colors.fontFamily};
    color: #1a1a2e;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid ${props => props.$role === 'base' ? 'rgba(16, 112, 255, 0.45)' : 'rgba(100, 116, 139, 0.45)'};
  `

}

export default PagesTab
