import React from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'

const Spinner = (props) => {

  return (
    <S.SpinnerSVG className="spinner" viewBox="0 0 50 50">
      <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
    </S.SpinnerSVG>

  )
}

const S = {
  SpinnerSVG: styled('svg')`
      animation: rotate 2s linear infinite;
      z-index: 2;
      position: absolute;
      top: 50%;
      left: 50%;
      margin: -25px 0 0 -25px;
      width: 50px;
      height: 50px;
      
      & .path {
        stroke: ${Colors.primaryColor};
        stroke-linecap: round;
        animation: dash 1.5s ease-in-out infinite;
      }
  
      
      @keyframes rotate {
        100% {
          transform: rotate(360deg);
        }
      }
      
      @keyframes dash {
        0% {
          stroke-dasharray: 1, 150;
          stroke-dashoffset: 0;
        }
        50% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -35;
        }
        100% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -124;
        }
      }

  `
}

export default Spinner
