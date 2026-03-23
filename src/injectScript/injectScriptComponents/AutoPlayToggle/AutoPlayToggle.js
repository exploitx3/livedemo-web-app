import React, {useEffect, useRef, useState} from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
import axios from '../../../utils/axiosInstance.js'
import ENV from '../../config.json'
import TippyModule from '@tippyjs/react'

// Ensure we get the actual component (handle both default and named exports)
const Tippy = TippyModule?.default || TippyModule


import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
import './tippyStyles.css'
import {MdPlayArrow, MdPause} from 'react-icons/md'
import TooltipContent from "../TooltipContent/TooltipContent.js";

function Tip({ children, themeBackgroundColor, ...props }) {
    return <S.Tippy {...props} $themeBackgroundColor={themeBackgroundColor}>{children}</S.Tippy>
}

const AutoPlayToggle = (props) => {
    let {
        isAutoPlayActive,
        setIsAutoPlayActive
    } = props

    // let [isActive, setIsActive] = useState(false)

    return (

        <Tip
            zIndex={3}
            disabled={false}
            delay={200}
            arrow={true}
            showOnCreate={false}
            animation={'shift-away'}
            offset={[0, 2]}
            popperOptions={{
                modifiers: [
                    {
                        name: 'flip',
                        options: {
                            fallbackPlacements: ['top', 'right', 'left', 'bottom'],
                        },
                    },
                ],
            }}
            placement={'left'}
            themeBackgroundColor={'#111'}
            interactive={false}
            interactiveBorder={2}
            trigger={ 'mouseenter focus' }
            allowHTML={true}
            content={
                <S.TippyText>AutoPlay</S.TippyText>
            }
        >
            <S.Wrapper onClick={() => {
                setIsAutoPlayActive(!isAutoPlayActive)
            }}>
                <S.Slider $isActive={isAutoPlayActive}>
                    {isAutoPlayActive ? (
                        <S.Icon>
                            <MdPlayArrow/>
                        </S.Icon>) : (
                        <S.Icon>
                            <MdPause/>
                        </S.Icon>
                    )}
                </S.Slider>
                <S.MiddleLine></S.MiddleLine>

            </S.Wrapper>
        </Tip>

    )
}

const S = {
    TippyText: styled.p`
      padding: 0px;
      margin: 0px;
      font-family: ${Colors.fontFamily};
      font-size: 0.75rem;
    `,
    Tippy: styled(Tippy).withConfig({
      shouldForwardProp: (prop) => prop !== '$themeBackgroundColor',
    })`
      && {
        background: ${({ $themeBackgroundColor = '#1f2937' }) => $themeBackgroundColor} !important;
        color: white;
        padding: 3px 6px;
        max-width: 250px;
        border-radius: 6px;
      }

      && .tippy-arrow::before {
        color: ${({ $themeBackgroundColor = '#1f2937' }) => $themeBackgroundColor} !important;
      }
    `,
    Slider: styled.div`
      position: absolute;
      transform: translateX(-8px);
      background: ${({$isActive}) => $isActive ? '#1070ff' : '#4d77b7'}; 
      border-radius: 50%;
      width: 20px;
      height: 20px;
      width: 18px;
      height: 18px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 3;

      cursor: pointer;
      
      -webkit-transition: all .28s cubic-bezier(.4, 0, 1, 1);
      transition: all .28s cubic-bezier(.4, 0, 1, 1);

    ${({$isActive}) => {
        if($isActive) {
            return `
                transform: translateX(6px);
            `
        } else {
            return ''
        }
    }}
    `,
    Icon: styled.span`
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      
      && svg {
        fill: #f9f9f9;
      }
    `,
    Wrapper: styled.div`
      display: flex;
      justify-content: center;
      align-items: center;

      width: 48px;
      height: 35px;
      position: relative;
    `,
    MiddleLine: styled.div`
      height: 14.4px;
      width: 36px;
      border-radius: 14.4px;

      position: relative;
      cursor: pointer;
      background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIxMiIgZmlsbD0ibm9uZSI+PGRlZnMgLz48cGF0aCBvcGFjaXR5PSIuNSIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMi43IDExYzIuOTUgMCA1LjMtMi4yMSA1LjMtNXMtMi4zNS01LTUuMy01SDcuM0M0LjM1IDEgMiAzLjIxIDIgNnMyLjM1IDUgNS4zIDVoMTUuNHoiIGZpbGw9IiNmZmYiIC8+PHBhdGggb3BhY2l0eT0iLjUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNy4zIDFDNC4zNSAxIDIgMy4yMSAyIDZzMi4zNSA1IDUuMyA1aDE1LjRBNS4xNiA1LjE2IDAgMDAyOCA2bC0uMDMtLjU0QTUuMTYgNS4xNiAwIDAwMjIuNyAxSDcuM3ptMTUuNCAxMWMzLjQ1IDAgNi4zLTIuNiA2LjMtNnMtMi44NS02LTYuMy02SDcuM0MzLjg1IDAgMSAyLjYgMSA2czIuODUgNiA2LjMgNmgxNS40eiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMyIgLz48L3N2Zz4=);
      -webkit-background-size: cover;
      background-size: cover;
      -webkit-transition: all .08s cubic-bezier(.4, 0, 1, 1);
      transition: all .08s cubic-bezier(.4, 0, 1, 1);
    `,

}

export default AutoPlayToggle
